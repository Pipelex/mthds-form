"""Render each hero's brief through the designer method's own `render_brief` stage, offline.

The brief a model reads is no longer text this repo writes: it is DATA - the
`generative.Brief` structure `src/generative/brief.ts` builds from the
descriptor - laid out by the Jinja2 template in `methods/layout-design.mthds`,
the method's first stage. `make briefs` records what a producer is handed, and
the rendered Markdown is the half of that record a person reads, so it has to
be produced by the template exactly as the runtime renders it: the same
preprocessor (`$$` for a literal dollar), the same Jinja2 environment, the
same filters. Nothing here imitates any of that. It boots pipelex as a
library, loads the bundle once, and runs the `render_brief` pipe once per
brief - a `PipeCompose` in template mode, which calls no model, so the pass
stays free and offline while the text is the runtime's own.

Reads a JSON object on stdin, `{ "<pipe_ref>": <Brief content>, ... }`, and
writes `{ "<pipe_ref>": "<rendered markdown>", ... }` on stdout. Run through
the sibling `../pipelex` checkout's venv, exactly like `dump-validate-views.py`:

    ../pipelex/.venv/bin/python scripts/render-briefs.py methods/ < briefs.json

The bundle directory is loaded whole, every `.mthds` file under it, because a
bundle is one closure - the same rule `scripts/pipelex/layout-design.ts`
follows when it sends the bundle to the hosted API.

Model SPECS are loaded without inference, as the descriptor dump does: the two
model stages in the same bundle pin a model handle that the loader checks at
LOAD time, and nothing is ever called.
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

from pipelex.cli.agent_cli.commands.agent_cli_factory import make_pipelex_for_agent_cli
from pipelex.core.memory.absence import AbsenceRecord
from pipelex.pipeline.runner import PipelexMTHDSProtocol

# The stage that lays the brief out, and the structure it takes - both as the
# bundle declares them. A rename there is a loud failure here, not a quiet one.
PIPE_CODE = "render_brief"
BRIEF_CONCEPT = "generative.Brief"
INPUT_NAME = "brief"


async def render_all(bundle_dir: Path, briefs: dict[str, dict[str, object]]) -> dict[str, str]:
    """Run the template stage once per brief, over one load of the bundle's closure."""
    contents = [path.read_text(encoding="utf-8") for path in sorted(bundle_dir.rglob("*.mthds"))]
    if not contents:
        msg = f"no .mthds file under {bundle_dir}"
        raise SystemExit(msg)
    rendered: dict[str, str] = {}
    for pipe_ref, brief in briefs.items():
        runner = PipelexMTHDSProtocol()
        response = await runner.execute(
            pipe_code=PIPE_CODE,
            mthds_contents=contents,
            inputs={INPUT_NAME: {"concept": BRIEF_CONCEPT, "content": brief}},
        )
        main_stuff = response.pipe_output.working_memory.resolve_main_stuff()
        if isinstance(main_stuff, AbsenceRecord):
            msg = f"{pipe_ref}: {PIPE_CODE} resolved absent: {main_stuff.reason}"
            raise SystemExit(msg)
        text = getattr(main_stuff.content, "text", None)
        if not isinstance(text, str):
            msg = f"{pipe_ref}: {PIPE_CODE} produced a {type(main_stuff.content).__name__}, not a text"
            raise SystemExit(msg)
        rendered[pipe_ref] = text
    return rendered


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: render-briefs.py <bundle directory>  < briefs.json  > rendered.json", file=sys.stderr)
        return 2
    bundle_dir = Path(sys.argv[1])
    if not bundle_dir.is_dir():
        print(f"no such bundle directory: {bundle_dir}", file=sys.stderr)
        return 2
    briefs = json.load(sys.stdin)
    if not isinstance(briefs, dict):
        print("stdin must carry a JSON object keyed by pipe_ref", file=sys.stderr)
        return 2

    make_pipelex_for_agent_cli(needs_inference=False, needs_model_specs=True)
    rendered = asyncio.run(render_all(bundle_dir, briefs))
    json.dump(rendered, sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
