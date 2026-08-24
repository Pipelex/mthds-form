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

- [x] **Direction (a) — readiness demands a touch.** Recorded below with the reason (b) was rejected.
- [x] Implement so the invariant "emptiness is `isFilled` throughout" covers this case: `fieldFilled` asks `isFilled` before descending, which makes it the fourth reader of the one predicate — the same one `toRjsf` uses to decide whether a structure collapses. Readiness now calls an input present exactly when the bridge keeps it, by construction rather than by parallel edits.
- [x] Second half, taken alongside because it is the other place the two halves phrased the rule differently: the gate's missing-input scan now NAMES a demanded input that is absent altogether. It checked required *children* first and skipped any input whose concept lists none, so this shape was refused with nothing named and the caller could only quote ajv.
- [x] The shape is a table in `gate.test.ts` — untouched / opened-but-blank / all-children-blank / filled / the optional twin / nested — each row asserting `computeReadiness`, the value bridge and the gate together. Both halves of the fix were re-verified as real tripwires by reverting each in turn (readiness alone: four rows fail; the scan alone: two).
- [x] Changelog (two `### Fixed` entries) + `docs/architecture.md` § "What absence looks like" rewritten: three readers of `isFilled` became four, with the vacuous-satisfaction failure and the touch consequence stated.
- [x] Verify in `pipelex-starter-js`: done by installing this working tree and restoring afterwards — **the sibling carries no change from this phase**. See the adoption note below for what its own bump commit owes.

### What Phase 2 settled

**Landed 2026-08-24.** `make check` and `make test` green here (342 tests). The working tree carries Phase 2; Phase 1 is committed as `07cb281`.

#### Why (a), and why not (b)

(a) is one predicate reading another predicate that was already the emptiness rule; (b) would have to materialize a shell *only* for a required struct with no required descendants — a conditional the kernel would compute in the bridge and restate in the prune, and precisely the invented-value shape v0.3.0 removed when a materialized shell made an optional struct with a required child unrunnable. (a) also fails closed and matches the filing's lean and 0.3.0's own framing that absence is what a singular slot expresses.

**The consequence, stated rather than hidden:** a required structure must now be *touched* — the button stays dark until a value goes somewhere inside it, exactly as for an untouched required number. A concept with no properties at all is therefore ungateable in a required slot. It was already unrunnable (the bridge omits it, ajv demands it); the change is only that the form says so before Run instead of after.

#### What the starter verification showed

Installed as a tarball, its suite reproduced the filing exactly — `computeReadiness(fields, {}).missing` moved `[] → ['opts']`, so the known-bug pin failed as written. Folding it back into the agreement table (plus a row for the filled case) and completing the Phase 1 fixture reshape took the whole suite to green, typecheck clean. Everything was then reverted and the registry copy reinstalled; the starter is back on published 0.3.0, 384 tests green, clean tree.

**Adoption note for `pipelex-starter-js`'s own bump commit** (not ours to land — its generated contracts are codegen output signed by `sources.json`, so a hand edit would fail `npm run codegen:check`):

- Regenerate `src/generated/*/contracts.ts` against a reshaped runtime — inputs take `presence`/`multiplicity`/`item_count`, outputs gain `item_count`. Until then `ComplexForm.test.tsx` fails on the *Phase 1* reshape, not on this phase: a `?` input reads `plain`, so it renders unfolded and gates Run.
- Reshape the hand-written fixtures in `src/lib/runInputs.test.ts` the same way.
- Rename the pin "still disagrees on a required struct input with no required children (upstream bug)" to an agreement row asserting `missing` is `['opts']`, and update its detail assertion: the gate now says `Missing required input: opts` where it used to quote ajv's `must have required property 'opts'`.
- Drop the shape from `pipelex-starter-js/docs/input-form.md` § "Two input shapes that used to render but not run".

## Phase 3 — Assembled server gate export (issue 3)

- [x] `gateRunInputs(contract, data)` in `gate.ts`, returning `{ok: true, inputs}` or `{ok: false, missingInputs, errors, preparedData}`. `preparedData` rides the rejection because `describeValidationError` needs it to quote the value it received; the rendering seam itself stays host-side. `data` is `unknown` and is normalized as the gate's FIRST step — the chain indexes by variable name without checking the payload is indexable, so a `null` body used to throw after ajv had already judged it.
- [x] Implemented as the composition, with the emptiness re-check running `computeReadiness`'s own `mustBeFilled` + `fieldFilled` over the same derived fields.
- [x] Schema caching moved into the kernel (a `WeakMap` keyed on the contract). Not an optimization: ajv keys its compiled-schema cache on schema object identity and never evicts, so a host rebuilding per call retains a validator per request on a public endpoint. Leaving it to hosts would have handed every adopter that leak along with the assembly.
- [x] Fixed-count residual closed. `ListRunField.itemCount` is read off the array schema's `minItems` — deliberately the keyword **ajv** reads, not the contract's `item_count`, since the field exists so `fieldFilled` can answer ajv's own question. The Phase 1 characterization test fired on the change and was flipped into an agreement assertion.
- [x] Cross-half invariant table: new `src/core/__tests__/gate-agreement.test.ts` runs `computeReadiness` and `gateRunInputs` over one table of well-formed values — leaves, both struct shapes in both presences, the nested case, and all four fixed-list states — asserting each side against the row's expected answer.
- [x] `*Filled` export set decided: all four stay, documented by role in `src/core/index.ts` and in the new docs topic. `isFilled` is the leaf predicate with a legitimate standalone use; nothing gate-shaped should be assembled from them by hand.
- [x] Exported from `src/core/index.ts`; changelog entries; new [docs/run-gate.md](docs/run-gate.md), linked from `docs/architecture.md` (module table + the gate section) and `docs/contract-mirror.md`.
- [x] Verified in both siblings by tarball install, then restored — **neither carries a change from this phase.**

### Checkpoint 2 — the kernel invariant exists

**Reached 2026-08-24.** `make check`, `make test` (380 tests) and `make build` green. Phase 1 is committed as `07cb281`; Phases 2 and 3 sit in the working tree on this branch.

Browser readiness and the server gate now answer together by construction, and the remaining phases are independent of each other. On resume, re-read `wip/issues.md` sections C–D.

#### What the invariant table found

Writing the table was the point of the phase, and it turned up a **third** disagreement in the same family that no filing had reported: readiness skipped an optional input entirely, so a structured one the user had opened and half-filled kept the Run button live while the gate rejected the run on a required child. `computeReadiness` now counts an optional input from the moment something is filled in it. That is visible in the count a host displays — 3 of 3 while untouched, 3 of 4 once started, 4 of 4 once complete — and is pinned in `field-model.test.ts`.

The fixed-count fix also covers a case the filing did not name: three rows one of which was added and left blank is a payload `minItems` accepts and the method cannot use. `fieldFilled` demands `itemCount` **filled** items, so both halves refuse it.

#### One thing deliberately left to Phase 5

An OVER-full fixed list (four items in a `[3]` slot) is still live on the button and refused by ajv on `maxItems`. Readiness has no vocabulary for "too many" and calling it *missing* would be a lie, so the honest fix is in the control: now that `ListRunField.itemCount` exists, `list-field.tsx` can stop offering **Add** past the count. Added to Phase 5, which already opens that file.

#### What the sibling verification showed

- **`pipelex-starter-js`:** its hand-rolled gate was replaced by a thin rendering shim over `gateRunInputs` — 224 lines to 144, with the local schema cache and the whole emptiness step deleted, so the near-miss trap is gone from the file adopters copy. Suite green (383, one fewer: its `schemaFor` identity test is now the kernel's), typecheck and lint clean.
- **`mthds-ui`:** `runSubmitGate` assembled the same four steps and **omitted the emptiness check altogether** — its own test said so in its name, "does not, on its own, catch a required text input left blank". So that panel's submit gate was more permissive than the button in front of it: an untouched file input emits `{url: ""}`, which the schema accepts. Replacing it with `gateRunInputs` flipped that test into "catches a required text input left blank, by name". All 1968 tests green including the Storybook interaction runs, typecheck and lint clean.
- Both were then reverted and the registry copy reinstalled: `mthds-ui` 1968 green, the starter 384 green, both trees clean.

**Adoption note for the siblings' own bump commits.** Both need the Phase 1 fixture reshape first (`mthds-ui` is holding its fixtures on the pre-S2 shape on purpose). Then: the starter swaps `src/lib/runInputs.ts` to the shim and drops its `schemaFor` export and test; `mthds-ui` swaps `runSubmitGate`'s body and flips the test named above. `mthds-ui`'s fixture dumper still strips `item_count` (filed as `../wip/inbox/2026-08-24-mthds-ui-contract-dump-strips-item-count.md`) — worth fixing before it regenerates.

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
- [ ] While in that file: stop offering **Add** past a fixed list's `ListRunField.itemCount` (added in Phase 3). An over-full `[3]` slot is the one fixed-count state where the button is still live and ajv refuses on `maxItems`; readiness cannot phrase "too many" without calling it missing, so the control is the honest place to close it.
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
