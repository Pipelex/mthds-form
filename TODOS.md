# TODOS — inbox fix campaign

Implementation plan for the issues triaged in [wip/issues.md](wip/issues.md) (the 2026-08-24 sweep of the workspace inbox). Issue numbers below refer to that document. Work accumulates in the changelog under `## [Unreleased]`; releases are cut with `/release` when we decide to publish, not per phase.

**Verification setup:** the siblings resolve `@pipelex/mthds-form` from the npm registry, not from this checkout — so exercising a fix in `pipelex-starter-js`, `mthds-ui` or the consuming app host means `npm pack` here and `npm install <tarball> --no-save` there, then restoring (`rm -rf node_modules/@pipelex/mthds-form && npm install`) and `git checkout` on anything the run touched. Verify without leaving a change behind: a sibling adopting the new kernel is that repo's own commit, on its own bump. Each inbox filing carries its own repro. Run `make check` and `make test` here before calling any phase done.

## Phase 1 — Contract reshape (issue 1) + README fix (issue 12)

The reshape gates fixture regeneration in every consumer and the pipelex release cascade; the README fix rides along because it is free and touches the same module's docs.

- [x] Mirror the reshape in `src/core/contracts.ts`: `presence: 'plain' | 'optional' | 'force'` replaces `optional?: boolean` on inputs; `multiplicity` gains the `fixed` arm; `item_count: number | null`. The retired `optional` key is gone from the input. **The output did NOT reshape the same way** — it keeps a boolean `optional` (verified against pipelex's model: `!` is rejected on outputs, so output presence is genuinely two-valued) and gains the same `multiplicity`/`item_count` pair.
- [x] Gate on the new shape: `inputMustBeFilled` reads `presence !== 'optional'` through the new `isOptionalInput`, so a `force` input gates like `plain`.
- [x] Sweep the rest of the core for readers of the retired shape — `derive.ts:237`, `gate.ts:143`, `values.ts:289`, and the fixtures in seven test files, all now on `isOptionalInput`. The `fixed` decision is recorded at the checkpoint below.
- [x] Align with the spec and with what pipelex actually serializes — checked by dumping the real models rather than by reading them (see the checkpoint).
- [x] Fix the README quick-start: argument order corrected, order stated in prose beside the example, plus the `canRun` the readiness verdict never had.
- [x] Update `docs/` — new [docs/contract-mirror.md](docs/contract-mirror.md) is the topic; `docs/architecture.md` links it and takes the fixed-count nuance. `## [Unreleased]` changelog entry added (breaking).
- [x] Verify in siblings: done by installing this working tree into each and restoring both afterwards — neither sibling repo carries a change from this phase. `mthds-ui`: contracts regenerated from the local pipelex, typecheck clean, **135 files / 1968 tests green**. `pipelex-starter-js`: **31 files / 384 tests green** on reshaped fixtures, typecheck clean; the issue-2 tripwire still holds as a known-bug assertion, which is Phase 2's to flip.

### Checkpoint 1 — the cascade unblocks here

Natural handoff: once this lands, the wire shape is settled, consumers can regenerate fixtures, and everything after is internal to the kernel.

**Reached 2026-08-24.** `make check` and `make test` green here (335 tests), build green. Nothing is committed; the work sits in the working tree on this branch.

#### What `fixed` + `item_count` does in the kernel

A fixed-count list **renders exactly like a variable one** and **gates like a plain input**. Both halves follow from what pipelex emits, which is worth stating because neither was a free choice:

- pipelex wraps a plural slot's schema in an array and, for `Concept[N]`, adds `minItems`/`maxItems` set to the count (`pipelex/core/concepts/concept.py:222-231`). So the list control needs nothing new, and the count is enforced by ajv from the schema the contract already carries — the kernel never restates the number.
- `Concept[1]` is `single`, never `fixed`, so a fixed count is always greater than one.
- Gating changed: a plural slot used to be exempt on the grounds that its empty form IS the empty list. That is right for `[]` and wrong for `[N]` — and left ungated the failure is not strictness but silence, because an absent property is one ajv never validates, so the run would go out with the input missing altogether. This matches the derivation the input-form descriptor spec already states for `gating` (`docs/specs/mthds-input-form-descriptor.md:94`).

**One residual, recorded rather than hidden.** Readiness answers emptiness only, so a `[3]` slot holding two items reads ready and is then refused by the gate on `minItems`. Fail-closed — no wrong payload leaves — but the two halves phrase the rule differently, which is the family of bug this campaign is about. Closing it needs the count on the descriptor (`ListRunField` has no `item_count`; the descriptor spec assigns that growth to M1), so it belongs with the Phase 3 invariant work and is listed there. A characterization test pins the current answer so the fix shows up as a deliberate diff.

#### What the sweep turned up

- **`presence` is not the only new field: inputs now carry `multiplicity` too.** The kernel deliberately keeps `isPluralInput` a *schema* test rather than moving it to the new field. The schema is what `buildRunFields` maps and therefore what the user is shown; a gate predicate reading the other field could disagree with the rendered control, which is precisely the failure `mustBeFilled` exists to prevent. `multiplicity` is read for the one question the schema cannot answer as directly — whether a list declares an exact count.
- **The mirror was verified against real serialization, not against the Python source.** `PipeInputContract.model_dump(mode="json")` emits `{concept_ref, presence, multiplicity, item_count, json_schema}` with `item_count: null`, and the output emits `{concept_ref, multiplicity, item_count, optional}`. Required typing is correct for all of them: `pipe_io_contracts` rides the validate **valid** arm, which `pipelex-api/api/routes/pipelex/validate.py:214` dumps *without* `exclude_none`.
- **The hosted plane speaks this shape as of `pipelex` 0.52.0.** The reshape (`4bb97ec1f`) shipped there, and `pipelex-server` has moved every one of its pin sites onto it (root `constraint-dependencies`, the three plugin libs, the Daytona snapshot) and consumes `pipelex-api` `v0.17.0`, which pins the same core. The window is now the deploy rather than the release: until that hosted deploy goes out, a form talking to the older runtime reads every `?` input as `plain` and gates it — fail-closed, never a wrong payload, but a visible difference in what a form does. That is the release-cascade window, and it is called out in the changelog entry.
- **Required typing turned a silent semantic break into a loud one.** In `pipelex-starter-js` the reshape surfaced as a type error at every construction site (its `src/generated/*/contracts.ts` are codegen output and will carry the new shape once regenerated against a reshaped runtime) instead of as `?` inputs quietly becoming required. That is the argument for typing the always-on-the-wire fields as required rather than optional.
- **`mthds-ui`'s fixture dumper strips `item_count`** — `exclude_none=True` at `scripts/dump_pipe_io_contracts.py:70`, so the fixtures lose a field the wire carries, invisibly, because the generated modules cast through `unknown`. Their suites pass either way. Filed as `../wip/inbox/2026-08-24-mthds-ui-contract-dump-strips-item-count.md`.
- **The regeneration carries a second, unrelated S2 change**: schema `title` now reads the concept ref (`DocumentContent` → `native.Document`, `document_batch__PageSummary` → `document_batch.PageSummary`). Nothing in the kernel keys on `title`, and `mthds-ui`'s suites were green across it, but a host that renders `title` as a label will see it change.

#### Also fixed along the way

The README's `computeReadiness` example destructured a `canRun` the verdict has never had. Same example as the filed argument-order bug, so it rode along.

## Phase 2 — Required-struct agreement (issue 2)

- [ ] Decide the direction before coding: (a) readiness demands a touch — a required struct with no required children counts as missing until something in it is filled; or (b) the wire keeps/materializes the empty shell for required structs only, restoring the 0.2.0 outcome for this shape. The filing and 0.3.0's own framing ("absence is what a singular slot expresses") lean (a). Record the decision and the reason here.
- [ ] Implement so the invariant "emptiness is `isFilled` throughout" covers this case — readiness, the prune and the wire payload must agree by construction, not by parallel edits.
- [ ] Add the shape to the core suites: required struct with no required children, untouched / half-filled / filled, through `computeReadiness`, the value bridge and the gate in one table.
- [ ] Changelog + touch `docs/` where the emptiness rule is described.
- [ ] Verify in `pipelex-starter-js`: its known-bug test ("still disagrees on a required struct input with no required children (upstream bug)", `src/lib/runInputs.test.ts`) must now fail as written — flip it into the agreement table and confirm the whole suite is green. Update `pipelex-starter-js/docs/input-form.md` § "Two input shapes that used to render but not run" to drop the shape-to-avoid.

## Phase 3 — Assembled server gate export (issue 3)

- [ ] Design the surface: `gateRunInputs(contract, data)` in the headless core returning a discriminated result — the validated `{concept, content}` inputs, or the missing-input names plus `RunInputError[]`. Reference implementation: `pipelex-starter-js/src/lib/runInputs.ts` at `9a52551` (the error-rendering seam — `describeValidationError` + injected `Translate` — stays host-side).
- [ ] Implement it as the composition of the existing pieces, with the emptiness rule taken from the same predicates `computeReadiness` uses (`mustBeFilled` + `fieldFilled`), so browser and server verdicts are one invariant.
- [ ] Close the fixed-count residual from Phase 1: a `Concept[N]` list holding fewer than `item_count` items reads ready and is refused by the gate. Needs the count on `ListRunField` (`derive.ts` can read it off the array schema's `minItems`/`maxItems`, which is where pipelex states it) so `fieldFilled` can answer the same question ajv does. A characterization test in `gate.test.ts` pins the current answer — read its diff.
- [ ] Test `computeReadiness` and `gateRunInputs` against each other inside the package over one table of inputs — including structured-concept fixtures, the kind hosts never have at adoption time. The Phase 2 shape belongs in this table.
- [ ] Decide and document the `*Filled` export set: keep `isFilled` (legitimate standalone use — deciding whether an optional field starts folded), document it as the leaf predicate, and point everything gate-shaped at `gateRunInputs`.
- [ ] Export from `src/core/index.ts`, changelog, and a docs topic for the gate.
- [ ] Verify in `pipelex-starter-js`: replace its hand-rolled gate with the kernel's, delete the local near-miss trap from the file adopters copy, suite green. Check `mthds-ui`'s server-side usage for the same replacement.

### Checkpoint 2 — the kernel invariant exists

Natural handoff: after this, browser readiness and the server gate cannot disagree by construction, and the remaining phases are independent of each other. Good session boundary; on resume, re-read `wip/issues.md` sections C–D.

## Phase 4 — Readiness/`isFilled` hardening (issues 4, 5, 6)

One pass through `readiness.ts` and the `contracts.ts` lookup; three filings, one review surface.

- [ ] Depth cap + cycle guard in `isFilled` (issue 4). Decide which way the cap answers — fail open (a deep-but-real value stays submittable) or fail closed — and state it in the doc comment. Sweep `fieldFilled` / `mustBeFilled` for the same unbounded shape.
- [ ] Whitespace-only strings count as unfilled (issue 5): `typeof value === 'string' → value.trim() !== ''`. Check the knock-on in `apiInputsFromSchemaData`'s optional-omission branch (a blank optional becomes a real absence, which the surrounding comment already wants) and fix any fixture asserting the opposite.
- [ ] Own-property reads (issue 6): an `Object.hasOwn` helper at `readiness.ts:70`, `:27`, and `getPipeIOContract`'s bare fallback lookup (`contracts.ts:67`). Add the function branch to `isFilled` (`typeof value === 'function' → false`) as defence in depth.
- [ ] Core tests for all three: deep and cyclic values through the gate, blank strings on required and optional inputs, prototype-named inputs and pipe codes.
- [ ] Changelog + doc comment updates.
- [ ] Verify in siblings: the starter's gate docstring drops its recorded recursion gap; `mthds-ui`'s prototype-key repro (`computeReadiness` with an input named `constructor`) now reports missing.

## Phase 5 — List row identity (issue 7)

- [ ] Decide the approach: (1) stable generated row identity — React key and field-id basis, write-backs resolved through it (the real fix; touches the id surface, so design it deliberately); or (2) the mitigation — disable remove/add while any row in the list uploads (via `env.uploadingIds`). The filing prefers (1); (2) can land first as a stopgap if (1) needs design time. Record the choice here.
- [ ] Implement in `src/react/list-field.tsx` (and the id derivation, if (1)).
- [ ] Interaction coverage: remove-during-upload no longer misroutes the resolved file; under (1), row DOM state survives a sibling removal.
- [ ] Changelog + docs (the file seam / `FieldEnv` topic).
- [ ] Verify in `mthds-ui`: the `RunPanel` drop-then-remove repro from the filing (the file lands in the right row); confirm `mthds-ui/wip/adopt-form/deferred-review-residues.md` can strike the residue.

## Phase 6 — FileField pass (issues 8, 9, 10)

One pass through `file-field.tsx`; three filings, one review surface.

- [ ] `uploading` reaches the URL affordances (issue 8): `disabled={disabled || uploading}` at the toggle (`:198`) and the URL input (`:210`). Design call taken alongside: whether `uploading` also reads visually so the control looks busy as a unit.
- [ ] Accessible name (issue 9): `htmlFor={id}` on the `FieldShell` call (`:130-138`). Second design call decided rather than deferred: whether the dropzone root becomes a named `role="button"` target instead of `role="presentation"`, since that is the element keyboard and voice users actually land on.
- [ ] Preview fixes (issue 10), in the filing's order: (3) sniff filename and URL separately instead of the concatenated `ref` (`:102`); (2) treat `data:` URLs as directly displayable — exclude them from `storageUri` so a resolver-less host gets a preview, not a spinner; (1) key `localPreview` to the `value.url` it was created for and drop it when they diverge.
- [ ] Rendering tests for the control — the accessible-name filing noted there are none today; cover the name, the busy states, and the three preview behaviours.
- [ ] Changelog + docs (`FieldEnv` guarantee wording: the busy seam now covers every door into the value).
- [ ] Verify in `pipelex-starter-js`: `PdfForm.test.tsx` goes back to `getByLabelText(/pdf document/i)`; drop `encodingIds` from its form-wide `busy` workaround and pass run state alone (the comment in `PdfForm.tsx` names this moment); the pasted-storage-URL preview test stays green. Update `pipelex-starter-js/docs/input-form.md`'s upstream-gap notes.

### Checkpoint 3 — controls are clean

Natural handoff: everything user-facing is fixed; what remains is packaging. Update the statuses above and note any design calls that were deferred instead of decided.

## Phase 7 — ajv out of the client bundle (issue 11)

- [ ] Restructure the build so the React entry no longer imports the chunk carrying the gate/ajv machinery. Preferred: move `isFilled`, `toStoredDateValue`, `toDateInputValue` into a leaf chunk both entries share, leaving ajv reachable only from the core's validation exports. Fallbacks per the filing: a `./validate` subpath (breaking) or dynamic-importing ajv inside `validateRunInputs`.
- [ ] Extend the CI bundle assertions: alongside the existing React-in-core grep, assert the React entry's chunk graph is ajv-free so this cannot regress silently.
- [ ] Changelog + a note in [docs/dependency-budget.md](docs/dependency-budget.md) if the chunking strategy is now load-bearing.
- [ ] Verify in `pipelex-starter-js` with the filing's recipe: clean `next build`, then `grep -rl "missingProperty" .next/static/chunks/` finds nothing, and the route's First Load JS drops back toward the pre-adoption figure.

## Deferred — tracked, deliberately not in this campaign

- [ ] **Issue 13 (taxonomy drift → M1):** nothing to do until the derivation swap. The characterization suites are the contract; review their diff at M1, never update fixtures to match. Kept here so nobody patches it early and changes run payloads twice.
- [ ] **Issue 14 (H3 intent hints):** starts by adding the `hints` slot to `RunField` per `docs/specs/mthds-input-form-descriptor.md` (it does not exist in `descriptor.ts` yet), then `rating`/`quantity` presentation on the number controls. Sequence with the D3 release cascade — the wire does not reach consumers before it.
