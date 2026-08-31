# Plan — describe a pipe's output the way its inputs are described

**Status:** proposal, nothing landed upstream. A working simulation exists in this repo (`src/core/output-form.ts`, `scripts/dump-validate-views.py`, the `Outputs` stories) and is the evidence behind every claim below.

**Target repos:** `mthds` (the standard), `mthds-python`, `mthds-js`, `pipelex`, `conformance`. This document lives here because this is where the evidence was gathered; it moves to `wip/inbox/` addressed to `workspace` when it goes out.

## The claim, in one line

An output is a concept ref exactly like an input is, and everything needed to describe it already exists — it is simply never projected.

## What the standard carries today

|                                                | Inputs                              | Outputs                     |
| ---------------------------------------------- | ----------------------------------- | --------------------------- |
| identity, plurality, optionality               | `pipe_io_contracts`                 | `pipe_io_contracts`         |
| shape / JSON Schema                            | `json_schema` on the input contract | **nothing** on the contract |
| presentation view (`kind`, order, constraints) | `input_form`                        | **nothing at all**          |

`PipeOutputContract` is a closed shape (`extra="forbid"`) with exactly four members — `concept_ref`, `multiplicity`, `item_count`, `optional` — confirmed three ways: the pydantic model, the spec's own table in `docs/spec/pipe-io-contracts.md` § "The Output Contract", and 17 real projections across this repo's corpus, every one carrying exactly those four keys.

## Why the omission does not hold up

The spec gives one sentence:

> _"No output member carries a schema: an output contract states identity and shape-of-plurality, and the payload a run actually produces is the run's own result."_

That answers **"what did this run produce?"** — correctly not a contract's business. But the question a consumer asks is **"what shape will it be?"**, which is declared in the `.mthds` source and knowable before any run happens. The input side keeps those two apart without difficulty.

Three things on the same pages argue against the omission:

- **The stated purpose.** `pipe-io-contracts.md` says the artifact exists so that _"a caller assembling a payload, a tool registry building a function signature, and a form renderer choosing controls all read one artifact rather than three interpretations of the source."_ A function signature has a return type; a renderer displaying a result needs its shape. Both named consumers need the half that is absent.
- **The projection principle.** Same page: _"The contract is a projection of the library, not a second declaration of it. Everything it states is already in the `.mthds` source."_ An output's structure **is** already in the source. Omitting it makes the contract a partial projection of the thing it says it projects.
- **The page's own front matter** describes _"the per-pipe map of declared input and output slots, **each** with its concept, presence, multiplicity and JSON Schema."_ "Each" — but only inputs have it.

Worth being fair about two things. The _other_ asymmetry on that page — three-valued `presence` for an input versus two-valued `optional` for an output — is a genuine language fact (`!` MUST NOT appear on an output) and is argued properly. The schema sentence arrives in the next paragraph and inherits its authority without being argued. And `library-crate.md` shows the omission was not an oversight so much as a scope decision: it says the contract states _"the concept and multiplicity of the output — what 'register a correct tool' needs"_, with the crate expected to cover shape.

## Why it is small

**The derivation already exists and is already public.** `pipelex/pipeline/input_form.py` exposes:

```python
def derive_concept(self, *, name: str, concept_ref: str) -> InputFormField:
    """The descriptor of a concept-typed node on its own, with no pipe-slot facts."""
```

Read the docstring: _on its own, with no pipe-slot facts_. That is precisely an output. It is not a new code path either — `_concept_node` beneath it is what runs for **every nested concept field of every input**, so it is exercised constantly. When `Invoice` appears inside an input, this is the code describing it.

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

## What the missing schema costs, concretely

The argument above is from symmetry. This is the argument from consequence, and it is the stronger one because it is measurable in this repo's own branch.

`ResultField` cannot know how to read a value it is handed. The descriptor states the field's `kind`, but nothing states the payload's shape — so the renderer guesses twice:

```ts
// unwrap(): infer "this is a wrapped scalar" by counting properties
const keys = Object.keys(record).filter((k) => !k.startsWith('__'));
if (keys.length === 1) return record[keys[0]];

// itemsOf(): infer "this is a list payload" by looking for a key
if (Array.isArray(value.items)) return value.items;
```

**That is precisely what this package deleted.** `CLAUDE.md`'s first rule says letting a control sniff a shape "destroys the seam the whole package is built around", and [docs/derivation-swap.md](../docs/derivation-swap.md) records removing exactly this class of guess from the input side. The input side does not guess because it has `json_schema`: `contentKey` is read from the schema and handed to the control as a **property name**, never a shape.

So the output side reintroduces the anti-pattern, and it has no alternative while the schema is absent. `json_schema` on the output contract is what deletes both heuristics — which makes the change a correctness fix, not an ergonomics one.

Worth stating plainly for reviewers: **reading a documented shape for a stated kind is not sniffing.** [native-concepts.md](https://github.com/mthds-ai/mthds/blob/main/docs/spec/native-concepts.md) pins every native content model, so a renderer told `kind: "document"` may read `{url, filename, mime_type, …}` from the spec. What it may not do is work out _which_ kind it is holding by inspecting keys. The first is reading the standard; the second is guessing at it.

## Decisions the spec page must settle

Small individually; they are what the prose exists to pin down.

1. **`name` on the output node.** An input's name is authored; an output has none. The simulation uses `"output"`. Alternatives: omit it, or reuse the concept code. The input-form page already had to rule on `name` for list items ("unused; the index labels items"), so there is precedent for saying it plainly.
2. **Does the descriptor repeat `multiplicity` / `optional`?** The contract carries them. `input_form` _does_ repeat `presence` alongside the contract's copy, so precedent exists either way — but repetition needs a stated reason.
3. **Native outputs.** A `native.Page` output derives a large nested descriptor (text-and-images, page view). Correct, but verbose. Worth a sentence saying it is intended.
4. **The plural payload envelope — currently unspecified anywhere.** A `Concept[]` result comes back as `{ items: [...] }`, not a bare array, and there is **no `native.List`** in the pinned native set. Nothing in the standard defines that envelope, so a consumer reading `.items` is relying on one engine's serialization. If `output_form` states `kind: "list"`, the standard should say what the payload around it is.
5. **Whether the crate stays the sanctioned route for shape.** `library-crate.md` currently claims sufficiency. If the contract grows a schema, that page should say which artifact a consumer should reach for.

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

- **Scope creep into a general "result view" standard.** This is a projection of a declared shape, nothing more. What a run _produced_ stays the run's own result.
- **The plural wrap.** The one place a producer does real work, and a silent failure if wrong. Pin it with a conformance case carrying a `Concept[]` output.
- **Native outputs are verbose.** Correct but large. Decide whether that is a problem before someone "optimises" it.
- **Cascade cost.** Five repos and a minor version for a capability nobody has demanded yet. The honest counter-argument is to wait until a second consumer needs it; the honest counter to _that_ is that the artifact is already being simulated here to build a UI, which is one consumer more than zero.

## NOT in scope

Considered and deliberately excluded, so nobody has to re-derive the reasoning:

- **A general "result view" standard.** This is a projection of a _declared_ shape. What a run produced stays the run's own result, in `working_memory`.
- **Rendering `working_memory` as a whole.** A run's intermediate stuffs are a debugging surface, not a result surface. Different consumer, different artifact.
- **Server-rendered result HTML.** pipelex already emits `main_stuff.html` via Jinja; reusing it would mean foreign markup in a React tree that cannot match a host's design system and cannot be interactive.
- **Validating a result against its schema.** Inputs need ajv because a user types them. A runtime produced the output; re-validating it client-side asserts distrust of the engine and buys nothing.
- **Deleting `pipe_io_contracts`'s output member in favour of the crate.** The contract's four members are correct and used; this proposal adds to them, it does not relitigate them.

## What already exists

Reused rather than rebuilt, which is most of why this is small:

| Existing                                           | How it is reused                                                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `InputFormDeriver.derive_concept` (pipelex)        | Produces the output descriptor. Public, and already the code path for every nested concept field of every input.                          |
| `mapNode` (`src/core/derive.ts`)                   | `buildResultField` delegates to it. No second kind table, no second place for kinds to drift.                                             |
| `InputFormField` (`mthds/protocol`)                | Reused verbatim. `presence`/`gating` are already optional, so a slot-free node is already legal.                                          |
| `native-concepts.md` § The Pinned Set              | The content models a result renderer reads. Standard-owned and version-pinned, unlike the file-format table which had to be measured.     |
| `ConceptPill`, `FieldStrings`, `humanizeFieldName` | The result view's chrome is the input side's chrome.                                                                                      |
| The library crate                                  | Already carries every concept's complete effective structure. It is why the shape is _reachable_ today even though the contract omits it. |

**Rebuilt where it should not have been:** `unwrap`/`itemsOf` encode native content models inside a React component, duplicating knowledge `src/core/file-formats.ts` established belongs in core and exported. Task T3 moves it.

## Implementation Tasks

Synthesized from the review. Each derives from a specific finding; none is padding.

- [ ] **T1 (P1, human: ~5h / CC: ~35min)** — `src/react/result-field.tsx` — Dispatch exhaustively on `kind`, with spec-backed `document` / `image` arms
  - Surfaced by: Architecture — a `document` output renders `[object Object]`; verified by render, output was `Outputnative.Document[object Object]`
  - Files: `src/react/result-field.tsx`
  - Verify: a `default:` arm asserting `field satisfies never`, so a twelfth kind fails the build rather than rendering wrong. `native.Page` then works by recursion (`{text_and_images, page_view}` → object → image).
- [ ] **T2 (P1, human: ~3h / CC: ~25min)** — `src/core/derive.ts` — Make the output schema required and delete the guessing
  - Surfaced by: Architecture — `unwrap` counts properties and `itemsOf` sniffs for `items`, the pattern the derivation swap removed
  - Files: `src/core/derive.ts`, `src/react/result-field.tsx`
  - Verify: `contentKey` is the only unwrap path; no branch inspects key counts. Proves a schema on the output contract is sufficient.
- [ ] **T3 (P2, human: ~2h / CC: ~15min)** — `src/core/native-content.ts` — Move the native content-model readers into core and export them
  - Surfaced by: Code quality — the knowledge sits in a React component; `file-formats.ts` set the precedent that a host needs the same answer
  - Files: new `src/core/native-content.ts`, `src/core/index.ts`, `src/react/result-field.tsx`
  - Verify: header cites `native-concepts.md` § "The Pinned Set (MTHDS 1.0.0)"; `make assert-bundle` stays green (core must remain React-free).
- [ ] **T4 (P1, human: ~4h / CC: ~30min)** — `src/react/__tests__/result-field.test.tsx` — Cover the renderer in jsdom
  - Surfaced by: Test review — React coverage is 0/6 paths; the file does not exist
  - Files: new `src/react/__tests__/result-field.test.tsx`
  - Verify: unwrap paths, absent/empty/boolean rendering, list index labels and `hideLabel`, and a document value that must never stringify to `[object Object]`.
- [ ] **T5 (P1, human: ~30min / CC: ~5min)** — `src/__stories__/__tests__/corpus.test.ts` — Pin the plural wrap
  - Surfaced by: Test review — REGRESSION. It shipped wrong once (a `LineItem[]` described as `object`) and nothing pins the fix.
  - Files: `src/__stories__/__tests__/corpus.test.ts`
  - Verify: `OUTPUT_FORM['results.plural_result'].field.kind === 'list'`, plus every generated module carries an `OUTPUT_FORM` export.

## Failure modes

| Codepath                | Realistic failure                                                     | Test?       | Handled? | User sees                                                               |
| ----------------------- | --------------------------------------------------------------------- | ----------- | -------- | ----------------------------------------------------------------------- |
| `ResultField` file arms | A `Page[]` result renders its content model as text                   | after T1/T4 | after T1 | **Today: `[object Object]` — silent, no error.** Critical gap until T1. |
| `unwrap`                | A two-property scalar concept fails to unwrap and prints as an object | after T4    | after T2 | Raw JSON-ish text, no error                                             |
| `itemsOf`               | An engine changes the plural envelope from `items`                    | no          | no       | Empty list, silently. Unspecified by the standard — open decision 4.    |
| plural wrap (generator) | A `Concept[]` output describes a single item                          | after T5    | n/a      | One row where there are many                                            |
| `getPipeOutputForm`     | A pipe_ref that does not resolve                                      | yes         | yes      | `deriveCaseFields` throws with the ref — loud, correct                  |

**One critical gap today:** the file-output path has no test, no error handling, and fails silently. T1 and T4 close it.

## Evidence appendix — what was actually run

Everything below was measured on 2026-08-31 against pipelex v0.55.0 and the default deck, not inferred.

- A concept used **only** as an output resolves to a full JSON Schema through `concept.structure_class_name` → the class registry → `model_json_schema()`.
- `pipelex resolve` returns the same concept's complete effective structure from the library crate, refinement already flattened.
- `derive_concept` produced correct descriptors for four output shapes: `prose`; `object{enum, number, text}`; `object` with a nested `list`; and — after the plural wrap was added — `list` of `object`.
- Real runs produced the payloads in `src/__stories__/payloads/results.ts`, which revealed two shapes invisible from any descriptor: a `date` arrives as kajson's typed `{date, __class__, __module__}`, and a plural payload is `{ items: [...] }` rather than a bare array. Both matter to a renderer and neither is a reason to withhold the descriptor.

## Parallelization

Two independent lanes, one dependency.

| Step                               | Modules touched              | Depends on |
| ---------------------------------- | ---------------------------- | ---------- |
| T1 exhaustive dispatch + file arms | `src/react/`                 | —          |
| T2 require schema, delete guessing | `src/core/`, `src/react/`    | —          |
| T3 move readers to core            | `src/core/`, `src/react/`    | T1, T2     |
| T4 renderer tests                  | `src/react/__tests__/`       | T1         |
| T5 pin the plural wrap             | `src/__stories__/__tests__/` | —          |

- **Lane A:** T1 → T4 (sequential, both `src/react/`)
- **Lane B:** T5 (independent — touches only the corpus test)
- **Lane C:** T2 → T3 (sequential, both cross `core`/`react`)

Launch A, B and C together, then merge. **Conflict flag: lanes A and C both touch `src/react/result-field.tsx`** — T2 deletes the fallbacks T1 is restructuring around. Either run T2 before T1 in one lane, or expect a real conflict in that file. Recommended: fold T1+T2 into one lane, keep T5 parallel.

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status        | Findings                 |
| ------------- | --------------------- | ------------------------------- | ---- | ------------- | ------------------------ |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 0    | —             | —                        |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 0    | —             | —                        |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 1    | ISSUES_FOLDED | 4 issues, 1 critical gap |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 0    | —             | —                        |
| DX Review     | `/plan-devex-review`  | Developer experience gaps       | 0    | —             | —                        |

Scope: the plan plus the `feature/OutputForm` branch that evidences it.

Findings and decisions:

1. **Renderer sniffs payload shapes** (P1, 9/10) — decided: name it in the plan _and_ delete the guessing by requiring the schema (T2). The plan gained "What the missing schema costs, concretely", which converts its weakest argument into its strongest.
2. **A file-bearing output renders `[object Object]`** (P1, 10/10, verified by render) — decided: exhaustive `kind` dispatch with a `satisfies never` default, plus spec-backed `document`/`image` arms (T1). `native.Page` follows by recursion.
3. **Native content models live in a React component** (P2, 8/10) — decided: move to `src/core/native-content.ts` and export, per the `file-formats.ts` precedent (T3).
4. **`result-field.tsx` has no unit tests** (P1, 10/10) — decided: full jsdom suite alongside the fixes (T4).

Also folded without a question, per the regression rule: **T5 pins the plural wrap**, which shipped wrong once and had nothing preventing a repeat.

A fifth open decision was added to the spec-page list: the plural payload envelope (`{ items: [...] }`) is defined by no standard — there is no `native.List` in the pinned set.

**VERDICT:** ENG REVIEW COMPLETE — plan sound, argument strengthened, 5 implementation tasks queued. Not yet implementation-clear: T1 and T4 close a critical gap that exists in the branch today.

NO UNRESOLVED DECISIONS
