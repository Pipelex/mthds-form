# PR #5 review follow-ups

Deferred items from the agent-review triage of [PR #5](https://github.com/Pipelex/mthds-form/pull/5) (the v0.3.0 release). The one confirmed defect — three statements claiming that *opening* an optional structured section is what preserves its shell, where the predicate is actually `isFilled` — was a prose error and was corrected on the branch, in `src/core/values.ts`, `docs/architecture.md` and the v0.3.0 changelog entry. This is the item that is real but needs a human decision.

## An optional structure whose only value is an empty list is indistinguishable from an untouched one

Reporter: codex ([thread](https://github.com/Pipelex/mthds-form/pull/5#discussion_r3841447312)). Location: `src/core/values.ts` (`toRjsf`, `case 'object'`) and `src/core/readiness.ts` (`isFilled`).

`isFilled([])` is false, so `isFilled({items: []})` is false, so an optional structured input whose only child is an empty list collapses to `undefined` and is omitted from the run payload — `apiInputsFromRunValues` applies the same predicate. The bot reads that as losing the distinction between an absent optional input and one deliberately supplied carrying a valid empty list.

The mechanics are exactly right, and the conclusion still does not follow, which is the part worth recording so the next reader does not re-derive it. The two states have **byte-identical values**. An untouched optional structure with a list child reaches `toRjsf` as `{items: []}` — the `list` branch returns `arr.map(...)` over an absent value, which is `[]` — and so does one the user opened and left at zero items. Nothing in the value distinguishes them, because nothing records the opening: `ObjectField`'s disclosure is local `useState`, and the controls write only on user input. There is no information being lost here; there is information that was never captured.

Nor is it repairable where it was reported. Making `[]` count as filled is the only change local to this predicate, and it would undo the v0.3.0 fix wholesale: every untouched optional structure with a list child would materialize the shell that made an optional input with a required child unrunnable in the first place. The narrower variant — "an empty list counts only when its parent has been touched" — needs the touch record that does not exist.

Two things it is worth being precise about, because both narrow the blast radius:

- A **top-level plural** input is unaffected. `apiInputsFromRunValues` tests `isPluralInput(schema)` before the fill test and emits `[]`, so a plural slot keeps its key and its empty form. The case is strictly a list nested inside an optional structure.
- The behaviour is only wrong if someone can *mean* "this optional structure is present, and its list is empty". Whether MTHDS gives that statement a meaning distinct from omitting the input is itself part of the open question.

So the open question is not what to fix but whether the kernel should carry a **touch record** at all — a per-field bit the value bridge could read, distinguishing "the user engaged with this" from "the value happens to be empty". That is the same decision already blocking three items in [`pr-4-review-notes.md`](pr-4-review-notes.md): the required-constrained-child case on the RJSF-panel surface (which explicitly notes that "the prune has no descriptors; only the value bridge knows what was touched"), the empty item in a list of numbers, and the empty row that deflates off the wire. They should be answered together, and the answer is visible on the wire, so it belongs with the derivation swap rather than a patch.
