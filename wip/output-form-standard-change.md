# Plan — describe a pipe's output the way its inputs are described

**Status:** proposal, nothing landed upstream. A working simulation exists in this repo (`src/core/output-form.ts`, `scripts/dump-validate-views.py`, the `Outputs` stories) and is the evidence behind every claim below.

**Target repos:** `mthds` (the standard), `mthds-python`, `mthds-js`, `pipelex`, `conformance`. This document lives here because this is where the evidence was gathered; it moves to `wip/inbox/` addressed to `workspace` when it goes out.

## The claim, in one line

An output is a concept ref exactly like an input is, and everything needed to describe it already exists — it is simply never projected.

## What the standard carries today

| | Inputs | Outputs |
| --- | --- | --- |
| identity, plurality, optionality | `pipe_io_contracts` | `pipe_io_contracts` |
| shape / JSON Schema | `json_schema` on the input contract | **nothing** on the contract |
| presentation view (`kind`, order, constraints) | `input_form` | **nothing at all** |

`PipeOutputContract` is a closed shape (`extra="forbid"`) with exactly four members — `concept_ref`, `multiplicity`, `item_count`, `optional` — confirmed three ways: the pydantic model, the spec's own table in `docs/spec/pipe-io-contracts.md` § "The Output Contract", and 17 real projections across this repo's corpus, every one carrying exactly those four keys.

## Why the omission does not hold up

The spec gives one sentence:

> *"No output member carries a schema: an output contract states identity and shape-of-plurality, and the payload a run actually produces is the run's own result."*

That answers **"what did this run produce?"** — correctly not a contract's business. But the question a consumer asks is **"what shape will it be?"**, which is declared in the `.mthds` source and knowable before any run happens. The input side keeps those two apart without difficulty.

Three things on the same pages argue against the omission:

- **The stated purpose.** `pipe-io-contracts.md` says the artifact exists so that *"a caller assembling a payload, a tool registry building a function signature, and a form renderer choosing controls all read one artifact rather than three interpretations of the source."* A function signature has a return type; a renderer displaying a result needs its shape. Both named consumers need the half that is absent.
- **The projection principle.** Same page: *"The contract is a projection of the library, not a second declaration of it. Everything it states is already in the `.mthds` source."* An output's structure **is** already in the source. Omitting it makes the contract a partial projection of the thing it says it projects.
- **The page's own front matter** describes *"the per-pipe map of declared input and output slots, **each** with its concept, presence, multiplicity and JSON Schema."* "Each" — but only inputs have it.

Worth being fair about two things. The *other* asymmetry on that page — three-valued `presence` for an input versus two-valued `optional` for an output — is a genuine language fact (`!` MUST NOT appear on an output) and is argued properly. The schema sentence arrives in the next paragraph and inherits its authority without being argued. And `library-crate.md` shows the omission was not an oversight so much as a scope decision: it says the contract states *"the concept and multiplicity of the output — what 'register a correct tool' needs"*, with the crate expected to cover shape.

## Why it is small

**The derivation already exists and is already public.** `pipelex/pipeline/input_form.py` exposes:

```python
def derive_concept(self, *, name: str, concept_ref: str) -> InputFormField:
    """The descriptor of a concept-typed node on its own, with no pipe-slot facts."""
```

Read the docstring: *on its own, with no pipe-slot facts*. That is precisely an output. It is not a new code path either — `_concept_node` beneath it is what runs for **every nested concept field of every input**, so it is exercised constantly. When `Invoice` appears inside an input, this is the code describing it.

**The node type already permits it.** In `mthds/protocol/input_form.py`, `presence: PresenceMarker | None = None` and `gating: bool | None = None`. Both optional, documented as top-level-slot facts. A slot-free node is already a legal value; no new field types, no new kind vocabulary, no new recursion.

**Measured cost in code:** `build_input_form` is 35 lines over an 839-line module. The output twin is ~15 lines and adds nothing to the module. This repo's simulation is exactly that, and it produced correct descriptors for a scalar, a flat structure, a nested structure and a plural result on the first run — after one bug, below.

## The one real obligation on a producer

**Plurality is not on the concept.** `concept_ref` is the element with the multiplicity suffix stripped, on both sides of the contract. `derive_slot` knows the slot's multiplicity; `derive_concept` describes a concept alone and cannot. So a producer must read `multiplicity` from the pipe's output and wrap the node as a `list` whose `item` is the element node minus its name.

This is not theoretical: the simulation's first pass described a `LineItem[]` output as an **object**, and every renderer would have shown one line item where there were two. A conformance test should pin it.

To be clear about where this lands: **a consumer never sees it.** The emitted descriptor carries `kind: "list"`, exactly as a plural input's descriptor does, and a renderer reads plurality from the descriptor and never touches the contract.

## What to change

### 1. `json_schema` on the output contract

Makes `pipe_io_contracts` honest to its name. Follow the input side's rules verbatim so the halves do not diverge again:

- a plural output's schema is the array wrapper `{type: "array", items: …}`, and on the fixed arm also carries `minItems`/`maxItems` equal to `item_count`;
- `optional: true` already states the output may be absent, so the schema describes the shape **when present** — no null arm.

`PipeOutputContract` is `extra="forbid"`, so this is a **minor version** of the standard. The module docstring already says growth happens that way.

### 2. The `output_form` artifact

The presentation twin of `input_form`, and the half with no substitute. Shape (as simulated here):

```json
{ "results.nested_result": { "field": { "name": "output", "kind": "object", "concept_ref": "results.Invoice", "fields": [ … ] } } }
```

`{ field }`, not `{ fields: [] }` — a pipe has exactly one output. That is the only shape difference from `PipeInputFormDescriptor`, and it follows from the language rather than from taste.

**Do both in one version.** They are the same conversation, both are projections of things already computed, and landing them separately means two version cascades for one capability.

## Decisions the spec page must settle

Small individually; they are what the prose exists to pin down.

1. **`name` on the output node.** An input's name is authored; an output has none. The simulation uses `"output"`. Alternatives: omit it, or reuse the concept code. The input-form page already had to rule on `name` for list items ("unused; the index labels items"), so there is precedent for saying it plainly.
2. **Does the descriptor repeat `multiplicity` / `optional`?** The contract carries them. `input_form` *does* repeat `presence` alongside the contract's copy, so precedent exists either way — but repetition needs a stated reason.
3. **Native outputs.** A `native.Page` output derives a large nested descriptor (text-and-images, page view). Correct, but verbose. Worth a sentence saying it is intended.
4. **Whether the crate stays the sanctioned route for shape.** `library-crate.md` currently claims sufficiency. If the contract grows a schema, that page should say which artifact a consumer should reach for.

## Phases

### Phase 1 — Circulate the argument
Share this document. The load-bearing claims are: `derive_concept` exists and is public; `presence`/`gating` are already optional; the omission's stated reason conflates payload with declared shape. If any of those is contested, everything downstream changes.

**Checkpoint.** Nothing below starts until the shape in §"What to change" is agreed.

### Phase 2 — The standard
A spec page for the output-form descriptor, and the `json_schema` member added to `pipe-io-contracts.md` § "The Output Contract". This is the bulk of the work: `input-form-descriptor.md` is 239 lines of normative prose and the twin has to meet that bar. Both pages have a Specification Status section that explicitly permits stating a forward contract ahead of implementations.

### Phase 3 — The type mirrors
`mthds-python` and `mthds-js`, in lockstep. Reuse `InputFormField`; add `PipeOutputFormDescriptor` and `OutputForm`. `mthds-js` keeps parity fixtures byte-identical to what `mthds-python` commits, so the fixture pair lands here too.

### Phase 4 — pipelex
`build_output_form` beside `build_input_form`, plus `json_schema` on the output contract in `build_pipe_io_contracts`. Wire both into `validate_in_process.py` and the `views` list. Remember the plural wrap.

**Checkpoint.** With pipelex emitting both, this repo deletes its simulation and reads the wire.

### Phase 5 — Conformance and consumers
Tests in `conformance/` against the new spec sections. In `mthds-form`: delete the local `OutputForm` type and the `dump-validate-views.py` simulation block, and point the fixtures at the real artifacts. The `Outputs` stories should not need to change — which is the test of whether the simulated shape was right.

## Risks

- **Scope creep into a general "result view" standard.** This is a projection of a declared shape, nothing more. What a run *produced* stays the run's own result.
- **The plural wrap.** The one place a producer does real work, and a silent failure if wrong. Pin it with a conformance case carrying a `Concept[]` output.
- **Native outputs are verbose.** Correct but large. Decide whether that is a problem before someone "optimises" it.
- **Cascade cost.** Five repos and a minor version for a capability nobody has demanded yet. The honest counter-argument is to wait until a second consumer needs it; the honest counter to *that* is that the artifact is already being simulated here to build a UI, which is one consumer more than zero.

## Evidence appendix — what was actually run

Everything below was measured on 2026-08-31 against pipelex v0.55.0 and the default deck, not inferred.

- A concept used **only** as an output resolves to a full JSON Schema through `concept.structure_class_name` → the class registry → `model_json_schema()`.
- `pipelex resolve` returns the same concept's complete effective structure from the library crate, refinement already flattened.
- `derive_concept` produced correct descriptors for four output shapes: `prose`; `object{enum, number, text}`; `object` with a nested `list`; and — after the plural wrap was added — `list` of `object`.
- Real runs produced the payloads in `src/__stories__/payloads/results.ts`, which revealed two shapes invisible from any descriptor: a `date` arrives as kajson's typed `{date, __class__, __module__}`, and a plural payload is `{ items: [...] }` rather than a bare array. Both matter to a renderer and neither is a reason to withhold the descriptor.
