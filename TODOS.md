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

- [x] Depth cap + cycle guard in `isFilled` (issue 4). **The cap answers `false`** — reasoning recorded below. The walk is now a private `walkFilled(value, depth, seen)` behind the unchanged public signature; `seen` is a cycle guard and a memo at once. `fieldFilled` was swept and needs no cap of its own: its recursion follows the DESCRIPTOR, which only exists because `buildRunFields` finished walking a contract's schema. `mustBeFilled` does not recurse.
- [x] Whitespace-only strings count as unfilled (issue 5). The knock-on in `apiInputsFromSchemaData` is the one the surrounding comment already wanted — a blank optional is omitted as a real absence. No fixture asserted the opposite, here or in either sibling.
- [x] Own-property reads (issue 6), taken as a sweep rather than at the three named sites — see below for why. New private `src/core/own-property.ts` (`ownProp` / `hasOwnProp`), applied everywhere a method-author-chosen name indexes a host-built record: `readiness.ts`, `contracts.ts`, `gate.ts`, `values.ts`, `wire-format.ts`. The `typeof value === 'function' → false` branch is in as the backstop.
- [x] Core tests: new [src/core/__tests__/hostile-values.test.ts](src/core/__tests__/hostile-values.test.ts) — depth, cycles and repeated sharing, blank strings on required and optional inputs, prototype-named inputs, children and pipe codes. Each fix was re-verified as a real tripwire by reverting it in turn (the cap: 4 rows; the trim: 6; the own-reads plus the function branch: 7; `getPipeIOContract`: 1).
- [x] Changelog (three `### Fixed` entries) + docs: `docs/architecture.md` § "What absence looks like" gained the hostile-value half and the module table gained `own-property`; `docs/run-gate.md` gained § "What arrives that nobody designed for". The stale residual paragraph in `inputMustBeFilled`'s doc comment — Phase 3 closed it — was corrected in the same pass.
- [x] Verified against the BUILT artifact rather than in the siblings, and the reason is worth stating: each filing's evidence block is a few lines of `isFilled` / `computeReadiness` / `gateRunInputs` / `getPipeIOContract` calls, so re-running those against `dist/` answers them directly, while a sibling suite cannot be run green against this tree at all until it takes the Phase 1 fixture reshape. Every reported line now answers the fixed way (below). Neither sibling carries a change from this phase.

### What Phase 4 settled

**Landed 2026-08-24.** `make check`, `make test` and `make build` all green. Phase 1 landed as `07cb281`, Phases 2–3 as `bcfe849`.

#### Why the depth cap fails closed

The filing left the direction to us: `true` at the cap keeps a deep-but-real value submittable, `false` refuses it. `false`, for three reasons that point the same way.

- Past the cap the walk genuinely cannot tell whether there is anything down there, and every other unanswerable absence in this package fails closed. A `true` there would start a run — a paid one — on a payload no schema validated, since the branch that reaches the cap is precisely the one `pruneEmptyOptionals` copied through undeclared and ajv never walked.
- It costs almost nothing, because `isFilled` combines branches with `some`: a refused over-deep branch loses only its own vote, and a real value anywhere beside it still reads filled. The answer changes only when the over-deep junk is the *whole* of what the input holds.
- No concept structure declares nesting anywhere near 64 levels, so a value that reaches the cap is not one the method had a slot for.

#### The cycle guard is also what stops an exponential walk

A depth cap alone terminates a cycle, but it does not make it cheap: a self-referencing object with a few keys walks to the cap on every branch. The `seen` set is kept across the unwind rather than scoped to the current path, and that is safe for a reason worth writing down — an object reached twice inside ONE call must have answered `false` the first time, because a `true` short-circuits every `some` above it and the walk never gets back down. So the set can only ever hold empty subtrees. Without it a value shaped like a diamond chain (each node holding the same next node twice) costs `2^n`; the test pins forty levels, which is 2^40 visits unmemoised.

#### Why the own-read became a sweep

The filing named three sites and warned, in its own words, that "a reader who fixes only `readiness.ts` will believe the class is closed" — it had already found a second call site cold. Fixing the named three would have left `apiInputsFromRunValues` reading `values[field.name]` bare while readiness read own-only, which is this campaign's whole failure family in miniature: two halves phrasing one rule differently. So the read is spelled one way everywhere, in one tiny module nothing re-exports.

Two things the sweep turned up:

- **ajv cannot close this and should not be asked to.** Its `required` compiles to `data.constructor === undefined`, which the inherited function satisfies — so the schema pass reads a prototype-named input as *supplied*, then fails its TYPE check and tells the caller a value they never sent is of the wrong type. The run was refused either way; what was broken was readiness, where nothing refused it at all and the Run button was live. That is why the fix belongs in the kernel and why the filing's "low" severity is right.
- **The WRITE twin is deliberately left open, and recorded rather than hidden.** `out[name] = value` on a plain object invokes the inherited `__proto__` setter for that one name, so an input actually called `__proto__` is dropped from a payload rather than added to it. That fails loudly — the runtime refuses a run whose input is missing — where the read bug failed open, and `__proto__` is not a name an author writes. Closing it would mean `Object.defineProperty` at every accumulator in `gate.ts`, `values.ts` and `wire-format.ts`, trading a legible line for an illegible one at a dozen sites. Stated in `own-property.ts`'s doc comment and in [docs/run-gate.md](docs/run-gate.md) so nobody reads a fixed read as a fixed class.

#### What the built-artifact verification showed

Every line of evidence the three filings quoted, re-run against `dist/core/index.js`:

- The starter's repro at 1000 / 5000 / 20000 levels returns `ok=true` instead of throwing `RangeError` at 5000 and 20000. A self-referencing value answers `false` instead of hanging.
- A required text input holding `'   '` reads `{total: 1, ready: 0, missing: ['text']}` and the gate refuses it by name; a blank *optional* one is omitted from the payload entirely.
- `mthds-ui`'s table inverts exactly: `isFilled(values['constructor'])` and its three siblings are all `false` (were all `true`), and a required input named `constructor` reports `missing: ['constructor']` where it reported `ready: 1, missing: []`. `getPipeIOContract(contracts, 'demo', 'constructor')` is `undefined` where it returned the `Object` constructor.

**Adoption notes for the siblings' own bump commits.**

- `pipelex-starter-js`: `src/lib/runInputs.ts`'s gate docstring carries a recorded paragraph about the uncapped recursion — it goes away with the Phase 3 swap to the kernel's `gateRunInputs`, which deletes the function that comment sits on. Separately, `src/hooks/useRunInputs.ts:40-41` claims readiness makes a per-form `!text.trim()` unnecessary; that claim was aspirational and is now literally true.
- `mthds-ui`: `RunPanel.tsx:296` uses `isFilled(values[field.name])` to decide whether an optional field starts folded, so a field holding only spaces now folds. That is the intended reading of the predicate, not a regression, but it is visible.

## Phase 5 — List row identity (issue 7)

- [x] **Approach decided: both halves of (1) that cost nothing, plus (2) — and the reason (1) as sketched was not taken is below.** The row's field ID stays a POSITIONAL PATH; the row gains a generated React key; removal is blocked while a file is arriving anywhere in the list.
- [x] Implemented in `src/react/list-field.tsx`. `useRowKeys` mints an identity when a row appears and `removeItem` drops that identity with its row; the length reconciliation is the fallback for a value replaced from outside the control, where there is nothing to match rows by. `listIsBusy` reads `env.uploadingIds` by ID PREFIX, so an upload *inside* a row (`cvs.1.resume`) counts as well as a row that is one (`cvs.1`), and the dot keeps it off a sibling input called `cvs_extra`.
- [x] **Add** stops at a fixed list's `itemCount`, and the items badge states the count it is working towards (`2 of 3 items`) through a new `itemsCountOf` key on `FieldStrings`.
- [x] Interaction coverage: new [src/react/__tests__/list-field.test.tsx](src/react/__tests__/list-field.test.tsx). This is the repo's first rendering suite — see the note on the test harness below. Both halves re-verified as tripwires by reverting each (the busy rule and the fixed count: 3 rows; the row key: 1).
- [x] Changelog + new [docs/upload-seam.md](docs/upload-seam.md), linked from `docs/architecture.md` § "./react".
- [x] Verified against `mthds-ui`'s host wiring by reading it rather than by installing a tarball, for the reason recorded below. `RunPanel.tsx:316` feeds the union of its in-flight IDs into `env.uploadingIds` and `:245` writes an upload back with `setValueAtPath(valuesRef.current, id.split("."), …)` — so the ID-is-a-path contract this phase preserved is the one that host depends on, and the drop-then-remove repro is now unperformable: the remove button is disabled for as long as `cvs.*` is in that set.

### Why (1) was not taken as the filing sketched it

The filing's preferred fix is a generated row identity used **as the basis of the field ID**, with write-backs resolved through it. Two things make that the wrong trade here.

**The ID is a path, and that is load-bearing.** A host writes an upload back with `setValueAtPath(values, id.split('.'), value)`, and `setValueAtPath` is a pure function of the value tree. Resolving an opaque token to a position at write-back time means the kernel keeping a live token-to-position registry for that function to consult — hidden, mutable, per-mount state in a core whose whole claim is that it has none. It would also have to be designed twice, because M1 moves the descriptor to the server.

**And it would not buy what it looks like it buys.** A generated key lives in the control's state, not in the value, so a host that replaces `values` wholesale — the filing's own example of "anything else that reorders a list" — reconciles by length exactly as positions do. What a stable identity covers over a position is precisely the reorderings the KERNEL performs, and the kernel performs one: removal. Blocking removal while the list is busy closes that set completely, which makes (2) the fix rather than the mitigation it is described as.

The half of (1) that is genuinely free is the React key, and it is in: it fixes the remount-on-remove the filing names as a bonus, and it is what makes the guarantee legible — a row is a thing, not a slot. **Add** was deliberately left enabled during an upload: appending moves no existing row, and freezing it would make filling a list of files needlessly serial.

## Phase 6 — FileField pass (issues 8, 9, 10)

- [x] `uploading` reaches the URL affordances (issue 8): both now read a single `busy = disabled || uploading`. **Design call taken:** it reads visually through the `disabled:opacity-50` both affordances already carry, plus the dropzone's own `opacity-60` — the control dims as a unit with no new spinner, because a second busy indicator on a control that already has one is noise.
- [x] Accessible name (issue 9): `htmlFor={id}` on the `FieldShell` call. **Second design call taken, and it is not the one the filing floated:** rather than giving the presentational div a `role="button"`, the TAB STOP moves to the `<input type="file">` itself (`noKeyboard` on the dropzone, `tabIndex: 0` and `disabled` on the input), with the focus ring drawn on the root through `focus-within`. A file input already has exactly the right role and only ever lacked a name; a named `role="button"` beside it would put a second control in the accessibility tree for one value.
- [x] Preview fixes (issue 10), in the filing's order: filename and URL sniffed separately (and a `data:` URL's declared MIME type read, since it is the only type such a URL carries); `data:` and `blob:` join `http(s):` as directly viewable, so a resolver-less host gets a preview instead of a spinner; and the object URL is BOUND to the value it belongs to — it adopts the first URL to appear once the upload is no longer in flight and retires itself when the value moves on.
- [x] Rendering tests: new [src/react/__tests__/file-field.test.tsx](src/react/__tests__/file-field.test.tsx) — the accessible name, the tab stop, the busy states, and all three preview behaviours. Every one of the six fixes was re-verified as a tripwire by reverting it in turn.
- [x] Changelog + [docs/upload-seam.md](docs/upload-seam.md), which states the `FieldEnv` guarantee in the wording this phase earned: an uploading ID means every door into that value is shut.
- [x] Verified against `pipelex-starter-js`'s host code by reading it. Every workaround the filings describe is present and is now retired — see the adoption note.

### Checkpoint 3 — controls are clean

**Reached 2026-08-24.** `make check`, `make test` and `make build` all green. Everything user-facing in the campaign is fixed; what remains is Phase 7, which is packaging.

#### The repo grew a rendering test harness, and that was the phase's real cost

Issues 9 and 10 both noted that `src/react/__tests__/` held one pure-function suite and that **no rendering test existed that could have caught them** — which is why three DOM bugs shipped in one control. Landing more DOM behaviour into that control with no way to assert it would have repeated the mistake, so the harness went in first:

- `vitest.config.ts` now defines two projects. The core suites stay in **node**, deliberately: a stray `document` reference in headless code has to fail there rather than pass quietly under a global jsdom. The control suites run in **jsdom** with `@testing-library/react`, and each opens with `// @vitest-environment jsdom`.
- `vitest.setup.react.ts` does the per-test `cleanup` (Testing Library only auto-cleans when vitest's globals are on, and they are deliberately off) and loads `@testing-library/jest-dom`.
- `jsdom` and the `@testing-library/*` packages are **devDependencies**, so they ship in nothing. `docs/dependency-budget.md` now says so explicitly, because the budget's property is what a consumer installs and a reader should not have to infer that dev tooling is out of scope. `CLAUDE.md`'s testing convention was rewritten to match — it said "node environment, no DOM", which is no longer the whole truth.

#### Why the sibling verification was reading rather than running

Phases 1–3 verified by installing a tarball into each sibling and running its suite. That is no longer the informative move, for two reasons that both point the same way: the siblings cannot run green against this tree at all until they take the Phase 1 fixture reshape, so a failure would be about Phase 1; and these fixes are DOM facts that this repo now has its own rendering suites for, which is the durable form of that evidence rather than a one-off run in someone else's checkout.

What reading the siblings does establish, and running them would not have established better, is that the HOST-side contract is the one these fixes preserve:

- `mthds-ui/src/form/react/RunPanel.tsx:245` writes an upload back with `setValueAtPath(valuesRef.current, id.split("."), …)` — the positional path this phase deliberately kept — and `:316` supplies `env.uploadingIds` as the union of its own in-flight IDs with the host's, which is exactly the set `ListField` now reads.
- `pipelex-starter-js/src/components/PdfForm.tsx:99-108` carries the workaround issue 8 describes, in a comment that states the bug: "the kernel threads `uploadingIds` to the *dropzone* alone: its 'paste a URL instead'…", with a form-wide `busy = running || encodingIds.size > 0` to compensate. `PdfForm.test.tsx:53` reaches the control with `document.querySelector('input[type="file"]')` because it had no accessible name, and `:205` records the resolver-less spinner.

**Adoption notes for the siblings' own bump commits.**

- `pipelex-starter-js`: `PdfForm.test.tsx` goes back to `getByLabelText`; `PdfForm.tsx` drops `encodingIds` from its form-wide `busy` and passes run state alone (the comment at `:99-108` names this moment); the `resolveUrl` workaround stays useful for real storage URIs but is no longer needed for `data:` URLs. Its upstream-gap notes in `docs/input-form.md` lose the preview and accessible-name entries.
- `mthds-ui`: `wip/adopt-form/deferred-review-residues.md` can strike the list-row residue — the drop-then-remove sequence is unperformable now that removal is blocked while the list is busy.

## Phase 7 — ajv out of the client bundle (issue 11)

- [x] The filing's preferred fix, taken: the controls take **types** from the `../core` barrel (erased before bundling, free) and **values** from the specific module (`../core/readiness`, `../core/date-format`), which are leaves. The chunk the two entries share went from 38.53 KB opening `import Ajv from 'ajv'` to 3.94 KB importing nothing at all. Neither fallback was needed — no subpath, no dynamic import, no API change.
- [x] **A second cause, found by measuring rather than by reading — the reported fix alone moved nothing.** Recorded below.
- [x] Build restructured so `dist/core/index.js` is a **pure re-export barrel**: `tsup.config.ts` names every core module as an entry, so each becomes its own chunk and a consumer's bundler can drop the ones behind exports the host never uses. The per-module `dist/core/*.js` files are build artifacts — `exports` lists only `.` and `./react`, so no deep path became reachable.
- [x] Bundle assertions extended and consolidated into [scripts/assert-bundle.mjs](scripts/assert-bundle.mjs) (`make assert-bundle`, in `make all` and both workflows), replacing the two inline greps in CI. Three invariants now: each entry's **transitively walked** graph is free of its banned packages (React out of `.`, ajv out of `./react`), the `.` barrel carries no inline code, and the React entry keeps `'use client'`. Each was re-verified as a real tripwire by reverting the thing it guards.
- [x] Second guard, one step earlier and cheaper: lint bans **value** imports of the `../core` barrel from `src/react/`, with `allowTypeImports` keeping the type imports that cost nothing. Verified as a tripwire in both directions.
- [x] Changelog + [docs/dependency-budget.md](docs/dependency-budget.md) § "The chunk graph is part of the budget" (the chunking is now load-bearing and says so), plus the `dist/core/` note in `docs/architecture.md` § "Public API and internal code", `CLAUDE.md` rule 2, and the release skill.
- [x] Verified in `pipelex-starter-js` with the filing's recipe. `grep -rl "missingProperty" .next/static/chunks/` finds **nothing** where it found a chunk before; client chunks went **1,037 KB raw / 308 KB gzip → 806 KB / 242 KB**. Restored afterwards — the sibling carries no change from this phase (384 tests green, clean tree, back on the registry copy).

### What Phase 7 settled

**Landed 2026-08-24.** `make check`, `make test` (425 tests), `make build` and `make assert-bundle` all green.

#### Fixing what was filed moved the number by zero

The filing reported the React entry dragging ajv through the shared chunk, and that reproduced exactly. But a starter rebuilt against the fix still shipped ajv, and its client bundle moved by +1.7 KB — noise. The reported cause was real and was only half of it.

The other half is that a host imports core **values** from client components as a matter of course — `isFilled` to decide whether an optional section starts folded, `setValueAtPath` to write an upload back — and `dist/core/index.js` was a single bundled module carrying real code beside a top-level `import Ajv from 'ajv'`. Bundlers keep or drop whole modules, so those two things could not be separated by any consumer. This is why the filing's own note that host-side import discipline measured at **exactly zero effect** was the important sentence in it: it is not a remark about that host's diligence, it is the statement that the package had made the choice on the consumer's behalf.

Naming every core module as a tsup entry is what dissolves it: each becomes its own chunk, the barrel comes out pure re-export, and the bundler gets back the granularity it needs. Two properties are load-bearing and silent if broken, so both are written down in the budget doc — `sideEffects` must stay CSS-only, and the entry glob must not be narrowed.

#### The assertion that matters most is the one for the thing that is invisible

Of the three invariants, the pure-barrel check is the one worth having: narrowing the entry glob back to `src/core/index.ts` leaves **both** graph checks green — the barrel legitimately reaches ajv either way — while every consumer silently re-ships the validator. It was verified against exactly that edit, and reports 928 lines of inline code with the fix to make.

The existing React-in-core assertion also had a latent flaw that the rewrite closes: it globbed `dist/chunk-*.js`, which is every chunk rather than the ones the `.` entry reaches, so a React-bearing chunk belonging only to `./react` would have failed it. That was correct only for as long as there happened to be exactly one shared chunk. The script walks each entry's real graph instead.

#### Adoption note for `pipelex-starter-js`

Nothing is required — the win arrives with the version bump, no host edit. Its `PdfForm.tsx` and `RunInputsForm.tsx` may keep importing `isFilled` and `setValueAtPath` from `@pipelex/mthds-form` in client components; that is the ordinary usage this phase made cheap, not something to work around.

### Checkpoint 4 — the campaign is closed

**Reached 2026-08-24.** Every issue triaged into this plan (1–12) is fixed, documented and verified; 13 and 14 remain deliberately deferred below. The package is releasable: `make all` is green and the changelog's `## [Unreleased]` carries the whole campaign. Cutting the version is `/release`, and it is a **minor** at minimum — the contract reshape in Phase 1 is breaking on the wire.

The one thing the release note has to carry beyond the changelog is the sequencing already recorded at Checkpoint 1: a form on the new contract mirror talks correctly only to a runtime that has taken the `pipe_io_contracts` reshape. Until that hosted deploy lands, a form against an older runtime reads every `?` input as `plain` and gates it — fail-closed, never a wrong payload, but visible.

Both siblings still owe their own bump commits, and those notes are collected per phase above (Phases 1–3 fixture reshape and the gate swap, Phase 4's stale comments, Phase 6's retired workarounds). None of them is this repo's to land.

## Deferred — tracked, deliberately not in this campaign

- [ ] **Issue 13 (taxonomy drift → M1):** nothing to do until the derivation swap. The characterization suites are the contract; review their diff at M1, never update fixtures to match. Kept here so nobody patches it early and changes run payloads twice.
- [ ] **Issue 14 (H3 intent hints):** starts by adding the `hints` slot to `RunField` per `docs/specs/mthds-input-form-descriptor.md` (it does not exist in `descriptor.ts` yet), then `rating`/`quantity` presentation on the number controls. Sequence with the D3 release cascade — the wire does not reach consumers before it.
