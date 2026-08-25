# Inbox issues addressed to mthds-form — triage of 2026-08-24

Every item in the workspace inbox (`../wip/inbox/`) addressed `to: mthds-form`, reviewed against the current `dev` tree on 2026-08-24, just after the v0.3.0 release. Every one of them is still open in source — the line references below are into today's `src/`, re-verified, not copied from the filings (which mostly cite the built `dist` of 0.2.0).

**How fixes get verified now:** `pipelex-starter-js`, `mthds-ui` and the consuming app host resolve `@pipelex/mthds-form` from this checkout as a local dependency. A fix here can be exercised in those repos directly, and sub-agents with no session context can be fanned out to a sibling repo to confirm the originally-reported symptom is gone and nothing else regressed. Two filings even ship ready-made tripwires in the starter: `pipelex-starter-js/src/lib/runInputs.test.ts` has a dedicated known-bug test for the required-struct disagreement (it fails the day either half moves), and `pipelex-starter-js/src/components/PdfForm.test.tsx` pins the preview-resolver workaround.

## A. Wire contract — the release-cascade blockers

### 1. Adopt the reshaped `pipe_io_contracts`: `presence` replaces `optional`, `multiplicity` gains `fixed` + `item_count`

- Inbox: `2026-08-23-mthds-form-contract-reshape.md` — from `pipelex` (PR #1149), **high**.
- Pipelex commit `4bb97ec1f` has **landed**: `PipeInputContract` now carries `presence: plain|optional|force` and `item_count`, and no longer carries `optional`. Our mirror still types the retired shape: `src/core/contracts.ts:22` (`optional?: boolean`), `:27` (`multiplicity: 'single' | 'variable'`, no `fixed` arm), and the gate reads `input.optional !== true` at `contracts.ts:92`. Against a reshaped contract, the retired key is simply absent, so **every `?` input silently becomes required**.
- Urgency is no longer tied to the pipelex release: any consumer regenerating contract fixtures from a current pipelex checkout already emits the new shape. `mthds-ui` is deliberately holding its fixtures on the pre-S2 shape until we adopt (`mthds-ui/wip/adopt-form/contracts-fixture-reshape-obligation.md`).
- Fix: type `presence`, add the `fixed` arm plus `item_count`, gate on `presence !== 'optional'` (a `force` input gates like `plain`). Pinned by spec (`docs/specs/pipelex-mthds-protocol.md`) and conformance (`conformance/tests/pipelex_api/test_validate_optionals.py`).

### 2. Readiness and the gate disagree on a required struct input with no required children

- Inbox: `2026-08-24-mthds-form-required-struct-no-required-children.md` — from `pipelex-starter-js`, **high**. Filed today; the surviving edge of the family v0.3.0 fixed for *optional* structured inputs.
- Shape: input `optional: false`, object schema with only optional properties. The 0.3.0 value bridge omits an untouched structure universally, the gate's prune rescues only optional properties, so the combined schema's `required` rejects the absent input — while `fieldFilled` is vacuously satisfied (`src/core/readiness.ts:23-25`: an absent value against a struct whose fields are all non-required returns `true`) and the Run button is live.
- Two coherent directions per the filing; the reporter leans (1), which matches 0.3.0's own framing that "absence is what a singular slot expresses":
  1. **Readiness demands a touch** — a required struct with no required children counts as missing until something in it is filled (button dark; both halves refuse).
  2. **The wire keeps the shell for required inputs** — the bridge or the prune materializes an empty object for a required struct, restoring the 0.2.0 outcome for this shape only.
- Tripwire test in the starter fails the day either half moves, so the fix must update that test in the sibling repo too.

## B. The gate and readiness kernel

### 3. Export the assembled server-side run gate as one function

- Inbox: `2026-08-23-mthds-form-export-the-server-gate.md` — from `pipelex-starter-js`, **high**, feature.
- Hosts assemble `buildRunInputsSchema` → `prepareRunInputs` → `validateRunInputs` → an emptiness check → `apiInputsFromSchemaData` themselves, and the emptiness step has four look-alike exports (`isFilled`, `fieldFilled`, `inputMustBeFilled`, `mustBeFilled`), only two of which are what `computeReadiness` uses. The starter shipped two consecutive defects on exactly that step, both invisible to any test suite whose methods only use native concepts.
- Ask: `gateRunInputs(contract, data)` in the headless core, returning a discriminated result. The starter's `src/lib/runInputs.ts` at commit `9a52551` is a working reference. This also becomes the natural home for the invariant issue 2 needs — `computeReadiness` and the gate testable against each other inside the package.
- Consider narrowing or documenting the four `*Filled` exports at the same time (`isFilled` has a legitimate standalone use for deciding whether an optional field starts folded, so it stays).

### 4. `isFilled` recurses without a depth cap — stack overflow on a deep value

- Inbox: `2026-08-23-mthds-form-isfilled-unbounded-recursion.md` — from `pipelex-starter-js`, **normal**.
- `src/core/readiness.ts:9-19` ends in `Object.values(obj).some(isFilled)` with no depth cap and no cycle guard; a ~5000-deep nested object throws `RangeError` inside the host's server gate. `pruneEmptyOptionals` copies unknown properties through untouched, so a key the schema does not declare reaches `isFilled` unwalked by ajv.
- Fix: depth parameter with a cap; which way the cap answers (fail open vs fail closed) is our design call. Check `fieldFilled` and `mustBeFilled` for the same shape in the same pass.

### 5. `isFilled` counts a whitespace-only string as filled

- Inbox: `2026-08-23-mthds-form-isfilled-blank-string.md` — from `pipelex-starter-js`, **low**.
- `readiness.ts:10` tests `value === ''` only, so `'   '` gates ready, passes ajv (no `minLength` on native text), and reaches the runtime. The function's own doc comment already promises "not empty / blank" — documented but not implemented.
- Fix: `if (typeof value === 'string') return value.trim() !== '';`. Check the knock-on in `apiInputsFromSchemaData`'s optional-omission branch (a blank optional should become a real absence) and any fixture asserting the opposite.

### 6. Inherited prototype keys read as filled — and `getPipeIOContract` has the same bare lookup

- Inbox: `2026-08-23-mthds-form-inherited-prototype-key-reads-as-filled.md` — from `mthds-ui`, **low**.
- `values[f.name]` bare reads at `readiness.ts:70` and `:27`: an input named `constructor` (or `toString`, …) resolves to the inherited function, `isFilled` has no function branch and returns `true`, so an empty required input reports ready. Second call site with the same root cause: `getPipeIOContract`'s final `return pipeIoContracts[pipeCode]` (`contracts.ts:67`) returns the `Object` constructor for a prototype-named pipe code, which then defeats hosts' `if (!contract)` guard.
- Fix: read own properties only at all three sites (`Object.hasOwn` helper). Defence in depth worth taking alongside: `isFilled` returning `false` for `typeof value === 'function'`. Do together with issue 5 — same function, one pass.

## C. The React control set

### 7. List rows are positional — an in-flight upload lands in the wrong row after a removal

- Inbox: `2026-08-23-mthds-form-list-row-upload-identity.md` — from `mthds-ui`, **high**.
- `src/react/list-field.tsx:75` keys rows by `index`, `:39` removal renumbers everything after, and `:93` the remove button reads only `env?.disabled`, never `env.uploadingIds`. Remove row 1 while row 2's CV uploads and the file resolves into what used to be row 3 — silently, for a batch-screening method that means evaluating a candidate against another candidate's document.
- Fix (either closes it; the filing prefers the first, which also fixes remount-on-remove): (1) stable generated row identity used as the React key and the basis of the field id, with write-backs resolved through it; (2) mitigation — disable remove/add while any row in the list is uploading. (1) touches the descriptor surface, so it is the bigger design decision.

### 8. `uploadingIds` disables the dropzone but not the "paste a URL" controls beside it

- Inbox: `2026-08-23-mthds-form-uploading-ids-miss-url-control.md` — from `pipelex-starter-js`, **medium**.
- `src/react/file-field.tsx:87` is the only place `uploading` reaches a disabled state; the URL toggle (`:198`) and URL input (`:210`) read bare `disabled` and stay live during an upload. The kernel advertises "the control is disabled while its id is uploading", hosts delete their staleness tokens on that strength, and the open door can abandon a started (and billed) run client-side.
- Fix: `disabled={disabled || uploading}` at both sites. Design call to take alongside: whether `uploading` should also read visually on the toggle so the control looks busy as a unit.

### 9. `FileField` gives its file input no accessible name

- Inbox: `2026-08-23-mthds-form-file-field-accessible-name.md` — from `pipelex-starter-js`, **normal**.
- The `FieldShell` call at `file-field.tsx:130-138` passes no `htmlFor`, so the shell renders the title as a `<div>` (`field-shell.tsx`: `const Label = htmlFor ? 'label' : 'div'`) and the input's accessible name is empty. Every sibling control passes `htmlFor={id}` or compensates with `aria-label` (the segmented `EnumField`); this is the lone exception.
- Fix: add `htmlFor={id}` — same one-line edit as every other control. Decide the second half rather than closing on the first: the dropzone root is `role="presentation"` with `tabIndex: 0`, so the element keyboard/voice users actually land on is still unnamed — whether it should be a named `role="button"` is our design call. The starter has a test waiting to go back to `getByLabelText` when this lands.

### 10. `FileField`'s preview is stale, spins forever without a resolver, and its type sniff has dead code

- Inbox: `2026-08-23-mthds-form-file-preview-stale-after-host-write.md` — from `pipelex-starter-js`, **normal**. Three independent consequences:
  1. `localPreview` (`file-field.tsx:66`) is set only by the control's own drop and cleared only by its own clear button, and wins over `value` unconditionally (`:127`) — a host-written value previews as the previous drop.
  2. A non-`http` `value.url` with no `resolveUrl` renders a spinner forever; a `data:` URL should count as directly displayable.
  3. The sniff builds `ref` as `` `${filename} ${url}` `` (`:102`) and tests `/\.pdf(\?|$)/i` (`:35`), so a filename's extension is always followed by a space and can never match — values with a filename but an extension-less URL (`data:`, opaque storage ids) are treated as non-previewable.
- Fix order per the filing: (3) test filename and URL separately, (2) exclude `data:` from `storageUri`, (1) key `localPreview` to the `value.url` it was created for and drop it when they diverge.

## D. Packaging and docs

### 11. `./react` drags ajv into the client bundle through the shared chunk

- Inbox: `2026-08-23-mthds-form-ajv-in-client-bundle.md` — from `pipelex-starter-js`, **normal**.
- The React entry imports `isFilled` and two date helpers from the same tsup chunk that carries the whole gate/ajv machinery, so a host that imports only controls ships the validator: measured **+131 KB gzip First Load JS (+73%)** in the starter, ~half of it ajv alone. Host-side import discipline was tried and measured at exactly zero effect — the granularity is the chunk, not the export.
- Fix options in the filing's preference order: (1) move the three shared helpers into a small leaf chunk so the ajv machinery stays in a chunk only the core's validation exports reach — no host edits needed; (2) a separate `./validate` subpath export (breaking); (3) lazy-load ajv behind a dynamic import inside `validateRunInputs`. Verification recipe is in the filing: one `next build` in the starter plus `grep -rl "missingProperty" .next/static/chunks/`.

### 12. README quick-start swaps `getPipeIOContract`'s arguments

- Inbox: `2026-08-23-mthds-form-readme-getpipeiocontract-arg-order.md` — from workspace, **normal**.
- `README.md:24` shows `getPipeIOContract(method.pipe_io_contracts, pipeCode, method.domain)`; the signature is `(pipeIoContracts, domain, pipeCode)` (`contracts.ts:57-61`). Both params are strings, the bare-code fallback masks the swap at runtime, and it breaks only for namespaced-keyed maps far from the copy-paste. One-line fix; add a "argument order: contracts, domain, pipe code" note beside the example. Ride it along with any release.

## E. Deferred by design — do not "fix" as patches

### 13. Recorded taxonomy drift is M1's work (derivation swap), not a patch

- Inbox: `2026-08-21-mthds-form-taxonomy-drift-queued-for-m1.md` — from the consuming app host, chore.
- The record of what the K1 carve deliberately preserved wrong: `native.Date` and `native.HTML` render as prose and deflate as text wrappers (wire-visible to correct), and `isDocumentObject` reduces to `Boolean(schema.properties?.url)` (narrowing it is a behaviour change). All three dissolve at M1 when the engine supplies the descriptor. The characterization suites are the contract; at M1 review their diff deliberately, never update fixtures to match. **Nothing to do now** — this is the blast-radius map, kept so nobody patches it early and changes run payloads twice.

### 14. H3 — honor render intent hints in the kernel (wire side is done)

- Inbox: `2026-08-23-mthds-form-h3-render-intent-hints.md` — from `pipelex`, feature.
- H2 landed in pipelex: descriptors now carry a flat `hints` map (`intent`: `prose` | `label` | `rating` | `quantity`; preserve-and-ignore for unknown words; only present when non-empty; plural nodes carry it on both `list` and `item`). `prose`/`label` are already folded into `kind` by the engine, so H3's real work is `rating`/`quantity` presentation on `number` nodes in the themed control set. Note: `RunField` does **not** currently have a `hints` slot (no `hints` in `src/core/descriptor.ts` or `derive.ts`), so H3 starts with mapping it 1:1 per `docs/specs/mthds-input-form-descriptor.md`. The wire reaches consumers only after the D3 release cascade — sequence accordingly, likely with issue 1.

## Suggested working order

1. **Issue 1 (contract reshape)** — it gates fixture regeneration in every consumer and the pipelex release cascade, and the mis-handling is silent.
2. **Issue 2 (required struct)** — today's report, high, and the same "two halves disagree" family the last release was about; decide the direction first.
3. **Issue 3 (assembled gate export)** — lands the invariant that keeps 2 fixed, and deletes the trap from the file adopters copy.
4. **Issues 4–6 (the `isFilled`/readiness pass)** — one pass through `readiness.ts` + the `contracts.ts` lookup: depth cap, blank-string trim, own-property reads, function branch.
5. **Issue 7 (list row identity)** — high, silent data corruption; needs the stable-identity design call.
6. **Issues 8–10 (FileField pass)** — one pass through `file-field.tsx`: uploading on the URL controls, `htmlFor`, the three preview fixes; plus the two design calls (busy visual, named dropzone root).
7. **Issue 11 (ajv chunk)** — packaging, independent of everything above.
8. **Issue 12 (README)** — free, ride along with the first change.
9. **Issues 13–14** — hold for M1 / the D3 cascade.

After each fix, verify in the sibling repos through the local dependency: run the starter's `runInputs.test.ts` and `PdfForm.test.tsx`, `mthds-ui`'s form suites, and the app host's form surfaces — fresh-context sub-agents per repo work well since each filing carries its own repro.
