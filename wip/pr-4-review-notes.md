# PR #4 review follow-ups

Deferred items from the agent-review triage of [PR #4](https://github.com/Pipelex/mthds-form/pull/4) (an untouched optional structured input stays absent). The one confirmed regression — an empty item added to a list of structures collapsed to `undefined` and failed ajv as `must be object` — was fixed on the branch. These are the items that are real but need a human decision, or belong to a later change.

## A required *constrained* child still blocks an untouched optional structure — on the RJSF-panel surface

Reporter: codex ([thread](https://github.com/Pipelex/mthds-form/pull/4#discussion_r3841217422)). Location: `src/core/wire-format.ts` (`pruneEmptyOptionals` / `isEmptyAfterPruning`).

The prune drops an optional property that empties out to `{}`, which is what repairs the surface where a host renders an RJSF panel and the value bridge is not involved. It cannot drop a shell that still holds a **required** child, because a required child is kept by design. So the parent survives non-empty and ajv judges it against the concept's full schema.

Whether that actually blocks the run depends on the child, and the bot's summary got this part wrong — worth recording so the next reader does not re-derive it. Measured against the gate's own ajv instance (`src/core/gate-validator.ts`, `addFormats` applied), with the parent optional:

| required child of the untouched shell | outcome |
| --- | --- |
| plain `{type: "string"}` → `{name: ""}` | **valid** — the run proceeds, and the invented shell travels on the wire |
| `format: "time"` → `{t: ""}` | blocked, `must match format "time"` |
| `enum` → `{a: ""}` | blocked, `must be equal to one of the allowed values` |

So the case the comment names — a required *text* field — is not unrunnable. The constrained rows are, and they are reachable: this package's own standing belief, stated at `src/core/gate.ts` and in the `pruneEmptyOptionals` docstring without any required/optional distinction, is that RJSF fills every unset string with `""` on mount.

Two reasons this was not fixed here. It is **pre-existing** — `git show dev:src/core/wire-format.ts` keeps a required child under the old `isEmpty` test too, so the parent survived and ajv rejected identically before this PR. And it is **not fixable where it was reported**: at prune time an untouched shell `{t: ""}` is byte-identical to a section the user opened and blanked, and dropping it would break the invariant this PR states and tests — that a structure the user *did* open keeps its shell so its required child fails loudly. The prune has no descriptors; only the value bridge knows what was touched.

The open question is therefore where the repair lives, not what it is: should the RJSF-panel surface reach the gate through a descriptor-aware step (the bridge already answers this correctly), or does that surface stay the host's responsibility? Answering it decides whether `prepareRunInputs` is the right public entry point for a host that renders its own panel.

## An empty item in a list of *numbers* still collapses

Found while verifying the item regression above; no thread. Location: `src/core/values.ts` (`toRjsf`, `case 'number'`) and `src/react/list-field.tsx` (`emptyValue`).

The item fix draws its line at the structure case: `collapseEmpty` is false for a list item, so an empty object row keeps its shell. `case 'number'` still returns `undefined` for an unfilled value, so a freshly added row in a list of numbers is `[undefined]` and fails ajv the same way. This is **pre-existing** — that branch has returned `undefined` since `070f5cb` — and it was left alone deliberately, because closing it needs a decision this triage should not take alone:

- there is no natural "empty number", so the bridge would have to emit `{number: undefined}`. That does produce a better message (ajv reads a present-but-undefined property as missing, so `must have required property 'number'`), but it contradicts the reasoning already written into that branch, which rejects `{number: undefined}` as reading like a malformed value rather than an absent one;
- the other end of the same question is `emptyValue` in `ListField`, which seeds a number row with `undefined` in the first place. Seeding something else moves the decision out of the kernel and into the control.

The two ends should be answered together, and the same question covers the `date` and nested-object item kinds.

## Residual: an empty row deflates off the wire

Also found while fixing the item regression; no thread, and arguably correct as it stands.

With the fix, a list of an all-optional item concept now *runs* with an empty row. The row then deflates away in `apiInputsFromSchemaData`, because `isFilled` finds nothing in it and a plural slot's empty form is the empty list — so the method receives `[]`, not `[{}]`. That is `isFilled` applied consistently, and it is the behaviour the new test pins. But it does mean a row the user deliberately added and left blank is silently dropped, which is worth a deliberate answer if a concept ever wants "one empty item" to mean something. Changing it would be visible on the wire, so it belongs with the derivation swap rather than a patch.
