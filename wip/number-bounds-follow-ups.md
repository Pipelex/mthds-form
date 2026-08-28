# Number bounds — deferred follow-ups

Surfaced while verifying the review-bot threads on the v0.5.0 release PR (PR #12). The thread itself — Codex's [P2 on `derive.ts`](https://github.com/Pipelex/mthds-form/pull/12#discussion_r3881594838), "Preserve exclusive numeric bounds in the field model" — was **fixed** in that round: an exclusive bound now becomes the nearest inclusive one on an integer node and no bound at all on a float, instead of being published as the excluded endpoint. These two items are what the verification established beside it and did not meet the round's bar — recorded here so they are decisions, not omissions.

## 1. A float open bound has no client-side expression

After the fix, an exclusive **float** bound publishes no `min`/`max` at all: the control loses its clamp on that side and the range hint prints `−∞` or `∞` for it. That is deliberate — a control that clamps cannot express an open interval, and the alternative (naming the excluded endpoint) is exactly the defect that was fixed. But it is a real loss of client-side guidance relative to what a float field could offer.

Expressing it properly needs `exclusiveMin` / `exclusiveMax` on the public `NumberRunField`, plus a `NumberField` that clamps by the input's `step` rather than onto the bound — the control would land on `0.1` for `> 0` at `step=0.1`, and the HTML attribute would stay unset so the browser does not contradict it.

Why deferred: it is a **public `RunField` API change**, and therefore a release-noted one, raised on a release branch whose PR is what publishes. Nothing about it is needed to stop advertising the forbidden endpoint, which was the defect. The gate is unaffected either way — ajv enforces `exclusiveMinimum` / `exclusiveMaximum` off the contract's own schema, verified against the built kernel: an `{type: integer, exclusiveMinimum: 0}` contract answers `ok: false, "must be > 0"` on `0`.

## 2. Pre-existing: readiness checks no numeric bound at all

`computeReadiness` (`readiness.ts`) has no `min` / `max` branch — not for exclusive bounds, not for inclusive ones. So the Run button lights up for **any** out-of-range number, and the refusal arrives from the gate as a raw ajv line rather than from the form as a live constraint.

This is the same class of gap that the `maxItemCount` branch was added to close for lists (`readiness.ts:129-136`, whose comment records the reasoning: a model stating `maxItems` alone "published its ceiling" and "the button stayed live on a list ajv was about to refuse"). Numbers never got the equivalent treatment.

Why deferred: **pre-existing** — it predates the derivation swap and is unrelated to exclusivity, which is what the thread was about; the swap neither introduced nor worsened it. **Not a correctness leak** — the gate is the authority and it holds: `gateRunInputs` copies the contract's `json_schema` verbatim (`gate.ts:59`) and ajv enforces `minimum` / `maximum` exactly, so no out-of-range payload reaches the wire. What is lost is only the early, in-form signal. Whoever picks this up should decide it together with item 1, since both are about how much of a numeric constraint the form is willing to state before the gate does.
