# Derivation-swap review — deferred follow-ups

Surfaced while verifying the review-bot findings on the derivation-swap PR (PR #11). None of these is a bot thread: the threads were all either fixed or resolved on that PR. These are adjacent facts the verification established that did not meet the bar for fixing in that round — recorded here so they are decisions, not omissions.

## 1. `date` and `enum` kinds carry no `contentKey`

`derive.ts` stamps `contentKey` on the text/prose, number and boolean arms only; the `date` and `enum` arms never read `scalarWrapperKey`, and `toRjsf` falls through to `default: return value` for both. A top-level `date`- or `enum`-kind slot over a single-property wrapping content model would therefore send the bare scalar where the schema wants an object.

Why deferred: believed unreachable today — `native.Date` is an `object` node over `DateContent {date, time}` (pinned in `concept-taxonomy-characterization.test.ts`), and date/enum nodes otherwise arise as bare-string structure fields. And unlike the text case that was fixed, the write path is also unwrapped, so the failure mode is a loud gate rejection, never silent data loss. If a wire ever pairs those kinds with a wrapper model, give both arms the same `contentKey` treatment as the other scalars.

## 2. Pre-existing: very deep ref-free schemas overflow before the gate walk

A deeply nested (thousands of levels) inline schema makes `buildRunInputsSchema` throw `RangeError` out of `normalizeSchemaForRjsf` / `walkAndCollectDefs` (`normalize-schema.ts`, `schema-utils.ts`) — uncapped recursion over `properties`, hit before the gate's own tree walk even runs. So `gateRunInputs` is still not total over pathological contract shapes, even after the cycle guard: the recursive-schema fix closed the unbounded case (a cycle has no floor at all); this one is bounded by the document, merely deeper than the stack.

Why deferred: pre-existing (predates the derivation swap), producer-reachable only (the contract comes from the server-held method, not the request body), and no MTHDS producer emits nesting anywhere near stack depth. A fix would be an explicit-stack rewrite or a depth cap in the normalize walk; decide when a real producer gets within an order of magnitude of the limit.

## 3. Pre-existing: `resolveSchemaIndirection` loops forever on a self-referential definition

`resolveSchemaIndirection` (`schema-utils.ts`) resolves with an unbounded `for (;;)`: a `$defs` entry that resolves to itself (directly or through a nullable `anyOf`) hangs it. Its callers are `healStringWrappers` and `pruneEmptyOptionals` (`wire-format.ts`), whose outer recursion is data-bounded — but the per-node resolution is not. Same reachability profile as item 2: producer-only, and today's producers do not emit recursive structures.

Why deferred: same round-bar reasoning as item 2, and the fix should not change the function's replace semantics (characterized in `schema-utils-characterization.test.ts`). A hop cap like `resolveSchemaNode`'s is the likely shape if it is ever needed.
