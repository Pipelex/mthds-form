# The derivation swap

This package used to guess. `buildRunFields` looked at a concept reference and a JSON Schema and decided — with hardcoded native-concept sets, a url-bearing-object test, and a depth rule — whether an input was a paragraph of prose, a document upload, a date, or a nested structure. This document was the survival plan for that compromise; it is now the **record of the swap**: the MTHDS standard grew a wire artifact that states those answers, the engine derives it, and the guessing has been deleted rather than bypassed.

## What swapped

```
before:  contracts map                --(local heuristics)-->    RunField[]
after:   wire descriptor + contracts  --(structural mapping)-->  RunField[]
```

The wire artifact is the standard's per-pipe **input-form descriptor** ([Input-Form Descriptor](https://mthds.ai/latest/spec/input-form-descriptor/)): one ordered node per input slot, discriminated on `kind`, carrying the constraints, the refinement chain, the presence marker and the producer-derived `gating` answer. `buildRunFields(descriptor, inputs)` maps that tree structurally onto `RunField` and decides nothing: kinds, bounds, `required`/`presence`/`gating`, `refines`, `default_value`, `examples`, `hints` all cross verbatim — the exact name-for-name mapping is [wire-correspondence.md](wire-correspondence.md). `getPipeInputForm` is the lookup beside it, `getPipeIOContract`'s twin.

The seam held, which was the whole point of building it: consumers receive `RunField[]` and never saw how it was produced, so the swap changed one function's signature and no renderer, no control, no readiness rule. The control set still switches on `field.kind` and cannot tell where the kind came from.

## The mapping is total, including over version drift

`kind` is the discriminant of the whole artifact, and the vocabulary it draws from is versioned with the standard — the peer this package compiles against pins the set it knows (`FIELD_KINDS` in `mthds/protocol`). A server can be ahead of that peer, and no type rules it out: `mapNode`'s switch is exhaustive over the *pinned* union, which `tsc` proves, and proving it says nothing about a `kind` the wire invents after this build shipped.

So the mapper answers drift with the standard's own escape hatch. An unrecognized node becomes `kind: 'unknown'` — the raw-JSON entry a renderer falls back to against the contract's `json_schema`, which is exactly what `unknown` exists for ("a producer that cannot map a node honestly MUST report it rather than guess a kind"; a consumer meeting a member it does not know is in the same position). The field keeps its `name`, its `required` and its `concept_ref`, which is the part that matters: a field with no name is unaddressable by the value bridge and unnameable by readiness, so its input silently never reaches the payload while the Run button waits on a blank entry.

The compile-time half is kept by a `satisfies never` after the switch: when the **peer** grows a kind, the build fails and someone maps it deliberately. The runtime return is only ever reached when a **server** is ahead of the peer.

## What the schema still answers, and why

The contract's `json_schema` is co-walked for exactly **two facts** the wire deliberately does not carry — both structural reads of keywords ajv itself enforces, never judgements:

- **`contentKey`** — the single property a native scalar's value sits inside on the wire (`TextContent {text}`, `NumberContent {number}`, `YesNoContent {yes_no}`). A scalar-kind node (text, prose, number, boolean) whose aligned schema declares exactly one property gets that property's name; anything else gets none. The alignment resolves `$ref` and nullable-`anyOf` indirection to a fixpoint, not in one pass — pydantic states an Optional concept-typed field as `anyOf: [{$ref}, {type: 'null'}]`, where collapsing the nullable is what surfaces the reference. It is a fact about the **payload** shape, which is the schema's job — the descriptor describes the form, never the payload.
- **Nested list bounds** — the wire puts `item_count` only on a top-level fixed `[N]` slot, but the model behind a structured concept may state `minItems`/`maxItems` on an array property of its own, and ajv enforces them. A list's `itemCount` prefers the wire's `item_count` (falling back to `minItems`); `maxItemCount` prefers the schema's `maxItems` (falling back to `item_count`).

## The gate walks the schema for itself

`gateRunInputs(contract, data)` kept its signature, and that is doctrine rather than accident: the descriptor is a presentation view, and a machine consumer must never need it to validate a payload — `json_schema` keeps that job. A server holds contracts; it may never have asked for the view.

So the gate's emptiness re-check runs over its own private tree, `src/core/gating-fields.ts`: a minimal structural walk of the contract's schema (`object` nodes with their required children, `list` nodes with their bounds, opaque leaves), with `gating` stamped from `inputMustBeFilled`. It reads exactly the keywords ajv enforces and never reaches a renderer. Agreement with the browser's readiness — which runs over the wire-mapped render tree — holds by construction, because both artifacts derive from one resolved library, and is asserted in `gate-agreement.test.ts`, which runs both halves over one table.

## What survived, and where it lives now

The deflate/inflate taxonomy — which native concepts use a *simplified wire form* (`native.Text` as a bare string; `native.Document`/`Image`/`Page` as a bare URL) — is a fact about the runtime's input parser, not about rendering, so it did not swap. It moved into `wire-format.ts` as private code, and it is the one piece of native-concept knowledge left in the package. Everything render-flavoured — the text/document/number/yes-no/date render sets, the text-wrapper fallback, the url-bearing-object test, the depth rule, the prose-length rule, the schema-`enum` dispatch — is gone with `native-concepts.ts`.

## The reviewed differences

The characterization suites were written before the swap precisely so the swap could be checked rather than argued. Every difference below was reviewed against that diff and is intentional; the suites now pin the resolved behaviour.

1. **`native.Date` is its structure.** It rendered as prose, wrapped as `{text}`, and deflated to `{concept, content: {text}}` — consistent only with itself. The wire states it as an `object` node over `DateContent {date, time}`, so the store and the run payload now carry the shape the schema declares. **Wire-visible**, and the reason the drift waited for the swap instead of a patch. (A composite date-picker control over that object node is an allowed presentation call, not taken — the object card renders a date child and a time child today.)
2. **`native.Html` works on purpose.** It rendered as an object card before, but only because the deleted set spelled the code `HTML` while the language spells it `Html` — the concept matched nothing and fell through to the generic object dispatch. The wire now states the same answer deliberately, as an `object` node over `HtmlContent`.
3. **A concept refining `native.Text` is prose.** A refining concept carrying the `TextContent` wrapper schema (a Poem, say) used to render as a nested object card with a lone `text` child. The wire states it as `prose` with `refines: ["native.Text"]`, and the co-walk finds the wrapper's single property — so the run value is the bare string and the field carries `contentKey: "text"`. The **stored** shape is unchanged (`{concept, content: {text}}`).
4. **The text-wrapper fallback is gone.** `native.Text` beside a degenerate contract (a bare `{type: "object"}` with no properties, or a `{type: "string"}`) no longer gets an assumed `{text}` wrapper: `contentKey` is purely structural now, and a schema that declares no single property yields none.
5. **The heuristics have no successors.** The depth rule, the url-bearing-object test, the prose-length rule and the schema-`enum` dispatch are deleted — the wire states kinds. Number bounds are no longer read from the schema at all: `min`/`max` come from the wire node (`minimum ?? exclusive_minimum`, `maximum ?? exclusive_maximum` — the kernel collapses the exclusive bounds; ajv still enforces the exact keyword).
6. **Field order is the authored order.** The descriptor's `fields` list follows the method's authored input order — the fact the contract's `inputs` map deliberately never carried.
7. **`title` is mapped.** The kernel used to suppress the contract's title (the engine could report a model name there); the wire's `title` is an authored or engine-derived fact and crosses verbatim.

## What "a derived fact on the descriptor" still means

`contentKey` remains the example to reason from. It is read off the contract and carried as a plain string; no consumer learns anything about JSON Schema from it, and the value bridge that consumes it keeps no taxonomy of its own. The rule that separates a fact from a leak is unchanged: does the field let something downstream re-derive a decision this package is supposed to own? A schema passthrough would. A name the engine states — or a name structurally read from the schema the engine also derived — does not.
