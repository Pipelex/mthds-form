"""Dump a bundle's `pipe_io_contracts` and `input_form` as JSON, for the Storybook form fixtures.

These are the two artifacts `buildRunFields` is fed, and they are **siblings,
not a whole and a part**: the contract says what a pipe's slots ACCEPT (the JSON
schema a payload is validated against), the descriptor says what each slot IS
(kind, constraints, presence, gating, and the authored order the contract's
`inputs` map deliberately does not carry). Since `0.5.0` the descriptor is what drives
the derivation and the contract is co-walked beside it, so a fixture carrying
only one renders no form at all.

The hosted `/validate` returns both on `PipelexValidationReport` and lets a
caller ask for them by name (`views: ["pipe_io_contracts", "input_form"]`), but
**no pipelex CLI surfaces either today** — the agent CLI's `validate bundle
--format json` carries the verdict and the per-pipe sweep, not these. So this
loads the bundle through pipelex's own library manager and calls
`build_pipe_io_contracts` and `build_input_form`, the canonical builders every
validate surface uses, then prints both maps on stdout under the same names the
wire gives them.

Both are built from ONE load of ONE library window, which is not merely an
optimization: the two builders iterate the same `pipes` sequence and therefore
share one key set, and `build_input_form` reads the authored blueprints
accumulated in that window. Two separate invocations could not promise either.

**It deliberately does not run the validation sweep.** Both artifacts are
projections of what a pipe DECLARES, not of what happens when it runs, and the
builders take loaded pipes. Going through `validate_bundles_in_process` would
drag the dry-run sweep in with it, which means every fixture in the corpus would
depend on a current local model deck — a bundle referencing a model handle the
deck has not got would produce nothing, for reasons that have nothing to do with
its inputs.

Run through the sibling `../pipelex` checkout's venv, exactly like the rest of
`scripts/generate-fixtures.mjs`:

    ../pipelex/.venv/bin/python scripts/dump_validate_views.py <bundle.mthds>

Retire this the moment the agent CLI can emit the views itself — the request is
filed as ledger item `L-260823-d042fd`, owned by `pipelex`. Until then it is the
only way to keep these fixtures GENERATED rather than hand-written, which the
repo requires of every fixture.
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

from pipelex.cli.agent_cli.commands.agent_cli_factory import make_pipelex_for_agent_cli
from pipelex.core.stuffs.list_content import ListContent
from pipelex.interpreter_hub import (
    clear_current_library,
    get_current_library_id_or_none,
    get_library_manager,
    resolve_library_dirs,
    set_current_library,
)
from pipelex.mthds_parsing.parser import MthdsParser
from pipelex.pipeline.input_form import InputFormDeriver, build_input_form, qualify_current_library_crate
from pipelex.pipeline.pipe_io_contracts import build_pipe_io_contracts
from pipelex.runtime_hub import get_class_registry


async def views_for(bundle: Path) -> dict[str, object]:
    """Load the bundle into a throwaway library and project its pipes into both validate views."""
    library_manager = get_library_manager()
    library_id, _ = library_manager.open_library()
    previous_library_id = get_current_library_id_or_none()
    try:
        set_current_library(library_id=library_id)
        effective_dirs, _ = resolve_library_dirs(None)
        if effective_dirs:
            library_manager.load_libraries(library_id=library_id, library_dirs=effective_dirs)
        await asyncio.sleep(0)  # keep the async shape the loader expects

        blueprint = MthdsParser.make_pipelex_bundle_blueprint(
            mthds_content=bundle.read_text(encoding="utf-8"),
            mthds_source=str(bundle),
        )
        pipes = library_manager.load_from_blueprints(library_id=library_id, blueprints=[blueprint])

        # Both builders must run while the library is still loaded: the contract
        # builder resolves concept classes from the CURRENT library and raises
        # against a torn-down one, and the descriptor deriver reads that
        # library's accumulated crate for the authored facts (hints, the slot
        # forms behind `presence`). The crate is qualified once and handed to
        # `build_input_form`, since qualification is a whole-crate walk.
        #
        # Dumped WITH the nulls, deliberately. `item_count` is nullable on both
        # sides of the contract and carries `null` off the `fixed` multiplicity
        # arm — which is nearly every slot — so an `exclude_none=True` here would
        # drop a key the wire always sends, and the generated modules cast through
        # `unknown`, so nothing would go red. The hosted `/validate` dumps its
        # valid arm the same way.
        contracts = {
            pipe_ref: contract.model_dump(mode="json")
            for pipe_ref, contract in build_pipe_io_contracts(pipes).items()
        }
        qualified_crate = qualify_current_library_crate()
        input_form = {
            pipe_ref: descriptor.model_dump(mode="json")
            for pipe_ref, descriptor in build_input_form(
                pipes, qualified_crate=qualified_crate
            ).items()
        }
        # ---- The output half, which the standard does not carry yet ------------
        #
        # `pipe_io_contracts`'s output member states identity and plurality and
        # stops: `concept_ref`, `multiplicity`, `item_count`, `optional`, and no
        # schema. There is no `output_form` at all. So a renderer has nothing to
        # render an output FROM, even though an output is a concept ref exactly
        # like an input is.
        #
        # Nothing here invents a descriptor. `InputFormDeriver.derive_concept` is
        # a PUBLIC method the input derivation already calls for every nested
        # concept field - when `Invoice` appears inside an input, this is the code
        # that describes it. Pointing it at the output concept is the projection
        # nobody has made, not a new derivation, which is why these fixtures are
        # as generated as the input ones.
        #
        # `presence` and `gating` are absent from these nodes, and correctly:
        # both are slot facts, both are optional on the protocol type, and
        # `derive_concept` is the entry point that leaves them unset.
        #
        # This is a SIMULATION of a standard change under discussion. If the
        # standard grows `output_form`, delete this block and read the wire.
        deriver = InputFormDeriver(concepts=qualified_crate.concepts)
        output_form = {}
        for pipe in pipes:
            node = deriver.derive_concept(
                name="output", concept_ref=pipe.output.concept.concept_ref
            ).model_dump(mode="json", exclude_none=True)

            # Plurality is NOT on the concept: `concept_ref` is the element with
            # the multiplicity suffix stripped, on both sides of the contract. The
            # input side handles this in `derive_slot`, which knows the slot's
            # multiplicity; `derive_concept` describes a concept alone and cannot.
            # So a plural output is wrapped here, exactly as an input's list node
            # is shaped: a `list` whose `item` is the element node minus its name.
            #
            # This is the one place the simulation does real work rather than
            # delegating, and it is worth flagging in the standard discussion: an
            # `output_form` producer has to make the same wrap, or a `Concept[]`
            # output would describe a single item and every renderer would show
            # one where there are many.
            output_contract = contracts[pipe.pipe_ref]["output"]
            multiplicity = output_contract["multiplicity"]
            if multiplicity != "single":
                item = {k: v for k, v in node.items() if k != "name"}
                node = {
                    "name": "output",
                    "kind": "list",
                    "concept_ref": node.get("concept_ref"),
                    "description": node.get("description"),
                    "required": node.get("required", True),
                    "item": item,
                }
                if output_contract.get("item_count") is not None:
                    node["item_count"] = output_contract["item_count"]
                node = {k: v for k, v in node.items() if v is not None}

            output_form[pipe.pipe_ref] = {"field": node}
        # The schema half, off the structure class the runtime already built.
        #
        # **This is the schema of the PAYLOAD, not of a caller's argument**, and
        # the distinction is what makes it usable. On the input side the contract
        # states what a caller SENDS - a plural slot's schema is a bare array,
        # because that is what the caller hands over. A result is the other
        # direction: what comes back is the concept's CONTENT MODEL, so a
        # `native.Text` result is `TextContent {text}` and a `Concept[]` result is
        # `ListContent {items}`. A renderer reads the single wrapping property's
        # NAME off this schema (the kernel's `contentKey`) and unwraps by name -
        # which is precisely what lets it stop guessing at the shape.
        #
        # So the plural arm wraps in `ListContent[...]` rather than emitting the
        # element schema, and it does it by asking pydantic to project the real
        # generic rather than by hand-building an envelope. Hand-building it was
        # the tempting version and it would have been wrong in a way nothing here
        # could catch: the envelope IS a runtime type, and a hand-built copy
        # stops tracking it the moment it changes.
        #
        # The output contract has nowhere to put any of this, so it rides
        # separately - see the note above and `src/core/output-form.ts`.
        class_registry = get_class_registry()
        output_json_schema: dict[str, object] = {}
        for pipe in pipes:
            structure_class = class_registry.get_class(pipe.output.concept.structure_class_name)
            if structure_class is None or not hasattr(structure_class, "model_json_schema"):
                # Loud, not lenient. `buildResultField` REQUIRES the schema, so a
                # fixture emitted without one renders a result the renderer has to
                # guess at - the exact failure the requirement exists to prevent.
                raise RuntimeError(
                    f"{pipe.pipe_ref}: no structure class for output concept "
                    f"{pipe.output.concept.concept_ref} "
                    f"(structure_class_name={pipe.output.concept.structure_class_name!r}). "
                    "A result cannot be described without its payload schema."
                )
            if contracts[pipe.pipe_ref]["output"]["multiplicity"] == "single":
                output_json_schema[pipe.pipe_ref] = structure_class.model_json_schema()
            else:
                output_json_schema[pipe.pipe_ref] = ListContent[structure_class].model_json_schema()

        return {
            "pipe_io_contracts": contracts,
            "input_form": input_form,
            "output_form": output_form,
            "output_json_schema": output_json_schema,
        }
    finally:
        if previous_library_id is not None:
            set_current_library(library_id=previous_library_id)
        else:
            clear_current_library()
        library_manager.teardown(library_id=library_id)


def main() -> int:
    """Boot pipelex, dump the bundle's validate views on stdout, and report an exit code."""
    if len(sys.argv) != 2:
        print("usage: dump-validate-views.py <bundle.mthds>", file=sys.stderr)
        return 2

    bundle = Path(sys.argv[1])
    if not bundle.is_file():
        print(f"no such bundle: {bundle}", file=sys.stderr)
        return 2

    make_pipelex_for_agent_cli(needs_inference=False)
    views = asyncio.run(views_for(bundle))
    json.dump(views, sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
