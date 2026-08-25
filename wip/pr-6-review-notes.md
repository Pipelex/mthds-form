# PR #6 review follow-ups

Deferred items from the agent-review triage of [PR #6](https://github.com/Pipelex/mthds-form/pull/6). Two review rounds have run against this branch.

The **first round** (two reviewers) confirmed and fixed four items — the gate's selection of touched optional inputs, the control set's prototype-named reads, the list's two bounds, and the resolved preview's provenance.

The **second round** (one reviewer, twenty-one findings) fixed eighteen: the gate accepting a malformed non-object body, a started list row not held to its item concept, a list bound stated alone going unenforced, the depth-keyed memo in `isFilled`, the resolver's empty answer leaving a dead preview, the two item-count badge defects, `Object.hasOwn` against an ES2020 target, and the rest across the lint rule, the bundle assertions, the vitest coverage config and the docs.

What is left is below: two reported items whose only implementable fix is a state machine the kernel's design does not have, one reported item that is not a defect, and one disagreement that no reviewer reported and that the first triage's own test table turned up.

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


## A local file preview outlives a value the host replaces mid-upload

Reporter: second-round review, `src/react/file-field.tsx` — the binding effect (`:157`).

While an upload is in flight the local preview is deliberately *unbound*: the control has made an object URL for the file the user dropped and does not yet know which URL the host will write for it. `uploading` is the signal that the write has not happened, so the effect waits. If the host writes a **different** file's value during that window, the preview stays marked current and is then bound to the replacement's URL when the upload finishes — the chip names one file over a preview of another, which is the defect this control already fixed for the settled case.

It is recorded rather than fixed because it is the same unsolvable shape as the row-identity item above, and the control's own comment already states the half that matters: the fallback for a host that does not report `uploading` is "the first URL to appear". Telling "the host wrote the URL for *my* upload" apart from "the host wrote some other file" needs an identity the value does not carry — `FileValue` is `{url, filename}` and neither is known to the control before the upload resolves. Every remedy therefore invents a correlation token and a pending record to hold it, which is the hidden control state this kernel's design does not have, and would have to be reconciled against the host's write anyway.

Two facts bound it. The user cannot cause it: every door into the value is shut while `uploading` (that is the `busy` rule this branch added), so it takes a host writing to the same path from elsewhere. And it is a *presentation* divergence with a bounded life — the value on the wire is the host's throughout, and the next settled write re-binds the preview correctly.

The right time to answer it is with the pending-removal question above and the touch-record questions in [`pr-4-review-notes.md`](pr-4-review-notes.md) and [`pr-5-review-notes.md`](pr-5-review-notes.md). All four are one question: whether a control may hold a fact about what the user did that the value does not carry.

## Reported and declined: `wip/issues.md` naming closed-source repositories

Reporter: second-round review, `wip/issues.md:3`. **Not a defect** — recorded so a later sweep does not re-open it.

The finding reads the repo rule in `CLAUDE.md` ("never name a closed-source repo in it") as violated by the repository names in this document. Every repository it names is public: `pipelex`, `mthds-form`, `mthds-ui` and `pipelex-starter-js` are all public on GitHub and all published. The one consumer that is closed source is referred to throughout as "the consuming app host", which is exactly what the rule asks for.

The rule is about *reachability* — a reader outside the company cannot follow a name they have no access to — so a public sibling's name is information, not a leak. Replacing those names with "a consumer" would delete the only detail that makes the verification notes actionable: which checkout to run which suite in.
