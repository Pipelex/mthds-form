# TODOS — inbox fix campaign

Implementation plan for the issues triaged in [wip/issues.md](wip/issues.md) (the 2026-08-24 sweep of the workspace inbox). Issue numbers below refer to that document. Work accumulates in the changelog under `## [Unreleased]`; releases are cut with `/release` when we decide to publish, not per phase.

**Verification setup:** `pipelex-starter-js`, `mthds-ui` and the consuming app host resolve `@pipelex/mthds-form` from this checkout as a local dependency. Every phase ends by exercising the fix in the sibling repos — fan out fresh-context sub-agents per repo where useful; each inbox filing carries its own repro. Run `make check` and `make test` here before calling any phase done.

## Phase 1 — Contract reshape (issue 1) + README fix (issue 12)

The reshape gates fixture regeneration in every consumer and the pipelex release cascade; the README fix rides along because it is free and touches the same module's docs.

- [ ] Mirror the reshape in `src/core/contracts.ts`: `presence: 'plain' | 'optional' | 'force'` replaces `optional?: boolean` on inputs; `multiplicity` gains the `fixed` arm; `item_count: number | null` (always on the wire, non-null exactly on `fixed`). No backward compatibility — the retired `optional` key goes away. Check the output side against what pipelex actually emits before assuming it reshaped the same way.
- [ ] Gate on the new shape: `inputMustBeFilled` reads `presence !== 'optional'` (a `force` input gates like `plain`), replacing `input.optional !== true` at `contracts.ts:92`.
- [ ] Sweep the rest of the core for readers of the retired shape (`derive.ts`, `gate.ts`, fixtures, tests) and move them to `presence` / the new multiplicity arms. Decide what, if anything, the kernel does with `fixed` + `item_count` (render as list like `variable`? enforce the count?) and record it.
- [ ] Align with the spec (`docs/specs/pipelex-mthds-protocol.md` → "Optional IO contracts and liftable pipes") and the conformance shape (`conformance/tests/pipelex_api/test_validate_optionals.py`) — the types must match what the wire actually carries.
- [ ] Fix `README.md:24`: `getPipeIOContract(method.pipe_io_contracts, method.domain, pipeCode)`, plus the one-line "argument order: contracts, domain, pipe code" note beside the example.
- [ ] Update `docs/` where the contract mirror is described, and add the `## [Unreleased]` changelog entry (breaking).
- [ ] Verify in siblings: `mthds-ui` regenerates its contract fixtures on the new shape (`make fixtures-contracts`) with suites green — that closes `mthds-ui/wip/adopt-form/contracts-fixture-reshape-obligation.md`; starter and app-host suites green against reshaped contracts (the starter's known-bug test for issue 2 is expected to still fail — it is the tripwire for Phase 2, not this one).

### Checkpoint 1 — the cascade unblocks here

Natural handoff: once this lands, the wire shape is settled, consumers can regenerate fixtures, and everything after is internal to the kernel. Before moving on, update this file with the decisions taken (especially the `fixed`/`item_count` handling and the output-side finding) and anything surprising the sweep turned up.

## Phase 2 — Required-struct agreement (issue 2)

- [ ] Decide the direction before coding: (a) readiness demands a touch — a required struct with no required children counts as missing until something in it is filled; or (b) the wire keeps/materializes the empty shell for required structs only, restoring the 0.2.0 outcome for this shape. The filing and 0.3.0's own framing ("absence is what a singular slot expresses") lean (a). Record the decision and the reason here.
- [ ] Implement so the invariant "emptiness is `isFilled` throughout" covers this case — readiness, the prune and the wire payload must agree by construction, not by parallel edits.
- [ ] Add the shape to the core suites: required struct with no required children, untouched / half-filled / filled, through `computeReadiness`, the value bridge and the gate in one table.
- [ ] Changelog + touch `docs/` where the emptiness rule is described.
- [ ] Verify in `pipelex-starter-js`: its known-bug test ("still disagrees on a required struct input with no required children (upstream bug)", `src/lib/runInputs.test.ts`) must now fail as written — flip it into the agreement table and confirm the whole suite is green. Update `pipelex-starter-js/docs/input-form.md` § "Two input shapes that used to render but not run" to drop the shape-to-avoid.

## Phase 3 — Assembled server gate export (issue 3)

- [ ] Design the surface: `gateRunInputs(contract, data)` in the headless core returning a discriminated result — the validated `{concept, content}` inputs, or the missing-input names plus `RunInputError[]`. Reference implementation: `pipelex-starter-js/src/lib/runInputs.ts` at `9a52551` (the error-rendering seam — `describeValidationError` + injected `Translate` — stays host-side).
- [ ] Implement it as the composition of the existing pieces, with the emptiness rule taken from the same predicates `computeReadiness` uses (`mustBeFilled` + `fieldFilled`), so browser and server verdicts are one invariant.
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
