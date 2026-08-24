# The wire contract mirror

A method's inputs reach the kernel as `pipe_io_contracts` — the artifact the MTHDS Protocol's `validate` operation reports, keyed by namespaced `pipe_ref` (`<domain>.<pipe_code>`). `src/core/contracts.ts` is the TypeScript mirror of that shape, and the only place in the package that states it. The SDK deliberately keeps `pipe_io_contracts` opaque, so this file is the canonical TS home for it until the protocol specs a generated one.

Mirroring means mirroring: the fields are named as the wire names them (`concept_ref`, `item_count` — snake_case, not the kernel's camelCase), and a field the wire always carries is typed as required here, so a contract that is missing one is a type error at the boundary rather than an `undefined` three modules deep.

## What an input contract says

```ts
interface PipeInputContract {
  concept_ref: string;
  presence: 'plain' | 'optional' | 'force';
  multiplicity: 'single' | 'variable' | 'fixed';
  item_count: number | null;
  json_schema: Record<string, unknown>;
}
```

**`presence`** is the authored marker, verbatim. `optional` (`?`) is the one that means the caller may omit the input and the pipe handles the absence itself. `plain` (no marker) and `force` (`!`) both mean it must be supplied — the difference between them is an authored assertion that lint and graph surfaces read, and that a form has no use for. It is three-valued on the wire precisely so `!` is not flattened away before those surfaces see it; the kernel is one of the consumers that flattens it, and it does so in exactly one place.

`isOptionalInput` is that place. Everything asking "may this be absent?" — the descriptor's `required`, the gate's `required` list, the two payload builders that omit an unfilled input — reads it, so a marker the wire adds later cannot come to mean one thing on one surface and something else on another.

**`multiplicity`** and **`item_count`** are a pair: `item_count` is non-null exactly when `multiplicity` is `fixed`, and the slot is on the wire either way (`null` off that arm). `Concept[1]` is `single` — one item, no list framing — so a fixed count is always greater than one.

## Two readings of plurality, and why they are not the same field

The wire states plurality twice: as `multiplicity`, and as the shape of `json_schema`, which pipelex wraps in an array (adding `minItems`/`maxItems` for a fixed count) exactly when the slot is plural. They agree by construction upstream.

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

The count reaches the descriptor too, as `ListRunField.itemCount`, so readiness phrases the same rule the gate does: a `[3]` slot holding two items reads missing rather than ready. It is read off the array schema's `minItems` rather than off `item_count` — the two state the same number, but this one exists so `fieldFilled` can answer the question **ajv** answers, and `minItems` is the keyword ajv reads. (Earlier this was a recorded residual: readiness answered emptiness only, the button was live at two of three, and the gate alone refused. Fail-closed, but the two halves were not phrasing one rule.) See [run-gate.md](run-gate.md).

## The output side did not reshape the same way

```ts
interface PipeOutputContract {
  concept_ref: string;
  multiplicity: 'single' | 'variable' | 'fixed';
  item_count: number | null;
  optional: boolean;
}
```

An output gained the same `multiplicity`/`item_count` pair, and kept a **boolean** `optional`. That asymmetry is the wire's, not a lag in the mirror: output presence is genuinely two-valued because `!` is rejected on an output, so there is no third state to carry. `optional: true` there means the pipe may resolve the output as a *recorded absence* instead of a value — a successful run that produced nothing.

The kernel does not read the output contract at all today; it is mirrored because a consumer holding a `PipeIOContract` holds both halves.

## Which runtime speaks this

This shape is what pipelex emits after the input-semantics reshape. A runtime older than that emits the retired shape instead — a boolean `optional` on the input, no `presence`, no `item_count`, no `fixed` arm — and against one of those every `?` input reads as plain and therefore gates. That is the direction to fail in (a run is blocked, never mis-sent), but it is a real difference in what a form does, so a host on an older runtime sees optional inputs demanded until its runtime moves. There is no compatibility branch: the package reads the current contract.
