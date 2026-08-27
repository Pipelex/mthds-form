# The wire contract

A method's inputs reach the kernel as `pipe_io_contracts` — the artifact the MTHDS Protocol's `validate` operation reports, keyed by namespaced `pipe_ref` (`<domain>.<pipe_code>`).

**The standard owns that shape, and this package no longer states it.** `pipe_io_contracts` is specified by the MTHDS page [Pipe I/O Contracts](https://mthds.ai/latest/spec/pipe-io-contracts/), and the standard's TypeScript client declares it as types in `mthds/protocol`. `src/core/contracts.ts` imports those declarations and re-exports them under the names this package has always exported, so `PipeIOContracts`, `PipeIOContract`, `PipeInputContract`, `PipeOutputContract` and `IOMultiplicity` are the standard's own types reaching a consumer through this package's entry, not a copy of them. `InputPresence` is the one renamed alias: the standard spells it `PresenceMarker`, and the old name is kept because consumers import it. This file used to say it was "the canonical TS home for this shape until the protocol specs a generated one" — the protocol specs one, so it is not any more.

What remains genuinely the kernel's, and what the rest of this document is about, is the reading: which predicate answers which question, why plurality is read off the schema rather than off the declared multiplicity, and what gates.

## How the types arrive

`mthds` is a **types-only peer dependency**. Every import of it in `src/` is an `import type`, erased before the bundle exists, so nothing named `mthds` survives into `dist/` — see [dependency-budget.md](dependency-budget.md) for the reason and for the two guards that hold it (lint on the source, `make assert-bundle` on the built chunk graph).

The consequence for a consumer is a `node_modules` entry, not a shipped byte. A host that installs this package installs the standard's client alongside it, and TypeScript resolves the re-exported names through it. A host that would rather read the standard's own spelling can import from `mthds/protocol` directly — it has the package.

## What an input contract says

```ts
type PipeInputContract =
  | { concept_ref: string; json_schema: …; presence: PresenceMarker; multiplicity: 'single';   item_count: null }
  | { concept_ref: string; json_schema: …; presence: 'plain';        multiplicity: 'variable'; item_count: null }
  | { concept_ref: string; json_schema: …; presence: 'plain';        multiplicity: 'fixed';    item_count: number };
```

It is a **union discriminated on `multiplicity`**, which is the standard's way of making the page's pairing rules the type rather than prose beside it. Two rules ride in that shape, and both used to be comments here:

- `item_count` is non-`null` exactly on the `fixed` arm, and is always on the wire (`null` off it);
- a presence marker may not be combined with a multiplicity suffix, so a plural slot always reports `presence: 'plain'`.

That second rule is worth stating loudly, because it retires a shape this package's fixtures used to carry: **`Concept[]?` and `Concept[N]?` are invalid MTHDS**, not merely unusual. The language rejects them ("markers MUST NOT be combined with multiplicity" — [MTHDS format](https://mthds.ai/latest/spec/mthds-format/)) on the grounds that a plural slot already expresses "nothing to supply" as the empty list. The kernel's predicates are still total over the combination — a producer that emitted one anyway comes out non-gating, which is what both halves of the declaration say on their own — but no fixture states it as a legal slot, and the two tests that exercise it now cast, with the cast saying why.

The one pairing a type cannot state is that a fixed count is always greater than one: `Concept[1]` is a way of writing `Concept` and reports `single`. That half stays a producer obligation.

**`presence`** is the authored marker, verbatim. `optional` (`?`) is the one that means the caller may omit the input and the pipe handles the absence itself. `plain` (no marker) and `force` (`!`) both mean it must be supplied — the difference between them is an authored assertion that lint and graph surfaces read, and that a form has no use for. It is three-valued on the wire precisely so `!` is not flattened away before those surfaces see it; the kernel is one of the consumers that flattens it, and it does so in exactly one place.

`isOptionalInput` is that place. Everything asking "may this be absent?" — the descriptor's `required`, the gate's `required` list, the two payload builders that omit an unfilled input — reads it, so a marker the wire adds later cannot come to mean one thing on one surface and something else on another.

**`json_schema`** is the schema the slot's *content* must satisfy, not the slot's envelope. A plural slot's schema is an array wrapper, and on the fixed arm only it also carries `minItems` / `maxItems` equal to `item_count`.

## Two readings of plurality, and why they are not the same field

The wire states plurality twice: as `multiplicity`, and as the shape of `json_schema`, which the engine wraps in an array (adding `minItems`/`maxItems` for a fixed count) exactly when the slot is plural. They agree by construction upstream.

The kernel still reads only one of them for rendering-adjacent questions. `isPluralInput` is a **schema** test, because the schema is what `buildRunFields` maps and therefore what the user is actually shown. A predicate that read the other field could disagree with the rendered control — a form offering a single text box for a slot the gate treats as a list — and that class of disagreement is the one this package exists to make impossible. `multiplicity` is read for the one question the schema cannot answer as directly: whether a list declares an exact count.

## What gates

`inputMustBeFilled` is the single answer to "must the user put something in before Run may fire", and `buildRunFields` stamps it onto each top-level descriptor as `gating`:

| Slot | Gates? | Why |
| --- | --- | --- |
| `Concept`, `Concept!` | yes | the method demands it |
| `Concept?` | no | the method states it may be omitted |
| `Concept[]` | no | the empty list is a legitimate value, and the language cannot declare "at least one" |
| `Concept[N]` | yes | a list whose empty form the method has explicitly ruled out |

The fixed-count row is the one the reshape added, and leaving it ungated would not merely be strict-vs-lenient: an absent property is a property ajv never validates, so an ungated empty `[N]` slot would let a run go out with the input missing altogether.

The declared **count** is enforced separately, and by the schema rather than by the kernel: `minItems`/`maxItems` travel verbatim into the combined schema `buildRunInputsSchema` produces, so the gate's ajv pass rejects a short list without the kernel restating a number the wire already carries.

The count reaches the descriptor too, as `ListRunField.itemCount` and `ListRunField.maxItemCount`, so readiness phrases the same rule the gate does: a `[3]` slot holding two items reads missing rather than ready, and one holding four does too. They are read off the array schema's `minItems`/`maxItems` rather than off `item_count` — all of them state the same number for a `[N]` slot, but these exist so `fieldFilled` can answer the question **ajv** answers, and those are the keywords ajv reads. (Earlier this was a recorded residual: readiness answered emptiness only, the button was live at two of three, and the gate alone refused. Fail-closed, but the two halves were not phrasing one rule.)

**Two bounds, not one number**, and that is worth stating because a `[N]` slot makes them look interchangeable. `buildRunFields` also recurses into a structured concept's own schema, where an array property is a model's and carries whatever bounds that model declared — possibly only one. A single `itemCount` was therefore read as a minimum by readiness and as a maximum by the control that stops offering **Add**, which agree only while both bounds are equal: a nested array told "at least two" was presented as a list of exactly two. See [run-gate.md](run-gate.md).

## The output side did not reshape the same way

```ts
type PipeOutputContract =
  | { concept_ref: string; multiplicity: 'single';   item_count: null;   optional: boolean }
  | { concept_ref: string; multiplicity: 'variable'; item_count: null;   optional: false }
  | { concept_ref: string; multiplicity: 'fixed';    item_count: number; optional: false };
```

An output gained the same `multiplicity`/`item_count` pair, and kept a **boolean** `optional`. That asymmetry is the wire's: output presence is genuinely two-valued because `!` is rejected on an output, so there is no third state to carry. `optional: true` there means the pipe may resolve the output as a *recorded absence* instead of a value — a successful run that produced nothing, not a run that failed. The same no-markers-with-multiplicity rule applies, which is why a plural output is never optional.

The kernel does not read the output contract at all today; it is re-exported because a consumer holding a `PipeIOContract` holds both halves.

## The sibling artifact this package does not read yet

`pipe_io_contracts` has a sibling: the **input-form descriptor**, specified at [Input-Form Descriptor](https://mthds.ai/latest/spec/input-form-descriptor/) and declared in the same `mthds/protocol` module set (`PipeInputFormDescriptor`, `InputFormTopLevelField`, `InputFormField`). It is the per-pipe, **ordered** presentation view of a method's inputs — one recursive node per slot, discriminated on `kind`, stating the facts a renderer needs so that no schema heuristics are required.

Nothing in `src/` reads it. `buildRunFields` still derives its `RunField[]` from the contract and the schema, guessing where the language did not used to state an answer — which is what [derivation-swap.md](derivation-swap.md) is about. The peer is what puts the descriptor's type within the kernel's reach, so the swap is an ordinary change to one function's body rather than a change that first has to invent a type; `src/core/__tests__/protocol-peer.test.ts` writes that import today so the resolution is proven rather than assumed.

Two details of the descriptor's shape are worth carrying into that work, because they are easy to miss. Its `item_count` is **absent** when it does not apply, the deliberate opposite of the contract's always-on-the-wire `null` — each artifact states its own rule. And `PipeInputFormDescriptor.fields` holds `InputFormTopLevelField`, which carries `presence` and `gating` where the shared `InputFormField` node does not, because that same node type is also the nested named-field shape, where presence is not a fact at all.

That top-level type states more than that it carries the two. It is a **union discriminated on `required`** — the idiom `PipeInputContract` already uses for `multiplicity` — so two derivations a page would otherwise perform are the type itself: `required: true` pairs only with a marker that is not `optional` (`plain` or `force`, the restatement of `presence !== 'optional'`), and the `required: false` arm pins both `presence: 'optional'` and `gating: false`, because an optional slot never gates. One half of the gating rule stays outside what a type can say: on the required arm, `gating` is `false` exactly when the slot is a variable list — required, yet satisfied by `[]`. That residue is why `gating` travels on the wire at all rather than being left to a consumer, and it is precisely the answer `inputMustBeFilled` derives here today.

## Which runtime speaks this

This shape is what the engine emits after the input-semantics reshape. A runtime older than that emits the retired shape instead — a boolean `optional` on the input, no `presence`, no `item_count`, no `fixed` arm — and against one of those every `?` input reads as plain and therefore gates. That is the direction to fail in (a run is blocked, never mis-sent), but it is a real difference in what a form does, so a host on an older runtime sees optional inputs demanded until its runtime moves. There is no compatibility branch: the package reads the current contract.

The kernel does not parse-check what an API hands it, either. The standard rules these artifacts **closed shapes** — a producer must not emit a member the standard does not define, and a consumer may reject one — but this package validates a method's *inputs*, not the contract describing them. A malformed contract therefore reaches the predicates, and the invariant that matters is that the two halves of the gate keep agreeing about it rather than one lighting the Run button the other refuses.
