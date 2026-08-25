# PR #6 review follow-ups

Deferred items from the agent-review triage of [PR #6](https://github.com/Pipelex/mthds-form/pull/6). Four of the reported items were confirmed and fixed on the branch — the gate's selection of touched optional inputs, the control set's prototype-named reads, the list's two bounds, and the resolved preview's provenance. The two below are what is left: one reported item that is real but whose only implementable fix is a state machine, and one disagreement that no reviewer reported and that the triage's own test table turned up.

## A row's identity shifts when a host refuses the removal it was told about

Reporter: supplied with the triage (no PR thread). Location: `src/react/list-field.tsx` — `removeItem` (`:60`) and `useRowKeys` (`:205`).

`removeItem` drops the row's key from local state and then calls `onChange` with the shortened array. If the host does not accept that removal — a `minItems` guard, a debounced or async commit, a normalizing reducer — the next render arrives with the array still at its original length while the key list is one shorter. `useRowKeys`'s render-phase reconciliation then takes the **grow** branch and appends a fresh key at the *end*, so every row's identity shifts up by one and the last row remounts. That is precisely the renumbering the generated keys were added to prevent, arrived at from the other direction.

Two facts bound the damage, and they are why this is recorded rather than fixed.

**Values are never wrong.** Every control in a row is controlled from `items`, so what the user sees in each row is still the host's value. What transfers is *uncontrolled* row-local state: a caret or selection, a scroll offset, `FileField`'s local preview and its URL toggle, `ObjectField`'s optional-disclosure state, a nested list's own keys.

**The mode that would corrupt data is already closed.** An upload write-back resolving against a moved position is the serious failure in this family, and removal is blocked outright while any ID under the list is uploading (`:79`, `:139`). That guard does not care whether the host accepts the removal, so it holds here too.

The remedy the report suggests — "update row identity from the accepted controlled value" — cannot be built. It needs something in the value to match rows by, and there is nothing: items are arbitrary, routinely duplicated, and routinely `undefined` (the suite's own fixture is three `undefined`s). The control's doc comment already states this and [`docs/upload-seam.md`](../docs/upload-seam.md) § "A row is a thing, not a slot" publishes it: the keys live in this control's state and not in the value, so a host that replaces `values` wholesale reconciles by length exactly as positions do. Length reconciliation for externally-driven change is a **declared design position**, not an oversight.

Nor is there a cheap half-measure. Minting fresh keys in the grow branch instead of appending would remount every row on every `addItem`, since adding a row is the same signal. Telling "the host appended" apart from "the host refused my removal" *requires* the pending record: a ref holding the index and the length it expected, a render-phase commit-or-restore, and a policy for the ambiguous outcomes — the host removed a different index, replaced the array, or removed one and appended one. That is hidden state in a control whose documented design is that the kernel keeps none.

So the open question is not how to fix it but whether the control should own a pending-removal record at all. It is worth answering together with the touch-record question already blocking items in [`pr-4-review-notes.md`](pr-4-review-notes.md) and [`pr-5-review-notes.md`](pr-5-review-notes.md) — all three are the same shape, a control holding a fact about what the user did that the value does not carry.

## An untouched `Concept[N]?` is refused by the gate and allowed by the button

Found while writing the invariant table rows for this triage, not reported by any reviewer. Pre-existing — it is not a regression from anything in this PR. Location: `src/core/wire-format.ts` (`pruneEmptyOptionals`) against `src/core/gate.ts`.

An input that is optional **and** fixed-count (`presence: 'optional'`, `multiplicity: 'fixed'`) is a shape the contract mirror can express, and the two halves answer it differently when it is untouched:

- `inputMustBeFilled` is false because the input is optional, so readiness never counts it and the Run button is live. Correct — the method said the input may be omitted.
- The value bridge deflates an untouched list to `[]`, because a plural slot's empty form *is* the empty list. The prune does not drop it. ajv then rejects it on the `minItems: 3` the fixed count put in the schema, and `gateRunInputs` returns `ok: false` with `missingInputs` **empty** — so the caller can only quote ajv about an input the user was never asked to fill.

Reproduced directly: with `shots: Image[3]?` and no values, the bridge emits `{"shots":[]}`, the prepared data is unchanged, and the verdict is `must NOT have fewer than 3 items`.

This is the mirror image of the disagreements this PR fixed — the gate is *stricter* than the button rather than more permissive — so it fails closed and no wrong run is billed. The cost is that an `Image[3]?` slot is unrunnable while untouched, which is exactly the state the `?` was supposed to allow.

The fix is a design call, which is why it is here rather than on the branch. An untouched optional plural slot has two defensible answers and they are not the same for the two multiplicities: a *variable* `[]?` should keep its key and send `[]`, which is what the payload builder already does deliberately and documents at length; a *fixed* `[N]?` cannot send `[]`, because the method ruled the empty list out — so the only coherent answer for it is to omit the input entirely, as an optional absence. That means the prune (or the bridge) needs to distinguish the two, and today `pruneEmptyOptionals` sees only the schema and knows nothing about `presence`. Deciding where that knowledge belongs is the work.

Until then the row is deliberately absent from `gate-agreement.test.ts`, so nothing in the suite claims this case is answered.
