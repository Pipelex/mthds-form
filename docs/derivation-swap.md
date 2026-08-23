# The derivation swap

The package ships one honest compromise, and this document is what makes it survivable: **`buildRunFields` guesses.**

It looks at a concept reference and a JSON Schema and decides whether an input is a paragraph of prose, a document upload, a date, or a nested structure. It does this with hardcoded native-concept sets, a url-bearing-object test, and a depth rule. These are heuristics. They are correct for the methods that exist today and they are not derivable from first principles, because the information a form actually wants — *this input is a long free-text field*, *this one is an uploaded file* — is not something the language currently states.

The plan is that the language will state it: a specced input-form descriptor, derived by the engine and carried on the wire. When that lands, the guessing gets deleted rather than bypassed.

## Why the seam is shaped the way it is

Everything heuristic is private to `src/core/derive.ts` and `src/core/native-concepts.ts`. Neither module is re-exported from the package entry. Consumers receive `RunField[]` and never see how it was produced.

That is the whole design. The swap is then a change to one function's body and to nothing else:

```
today:     PipeInputContract map --(local heuristics)--> RunField[]
after:     wire descriptor       --(structural mapping)--> RunField[]
```

No consumer changes. No renderer changes. The control set switches on `field.kind` and cannot tell where the kind came from. The gate, readiness, and validation messaging all read the descriptor, never the schema.

If a change to this package ever makes a heuristic visible to a consumer — exports a concept set, adds a `json_schema` passthrough to `RunField`, lets a control sniff a shape — the seam is gone and the swap becomes a breaking release. That is the thing to defend in review.

A *derived fact* on the descriptor is the opposite of that, and `RunField.contentKey` is the example to reason from. It is the name of the property a native scalar's value sits inside on the wire (`{number}` for `NumberContent`, `{yes_no}` for `YesNoContent`), read off the contract by `buildRunFields` and carried as a plain string. No consumer learns anything about JSON Schema from it, and the value bridge that consumes it stopped keeping a taxonomy of its own — which is one fewer copy for the swap to reconcile, not one more.

The rule that separates the two: does the field let something downstream re-derive a decision this package is supposed to own? A schema would. A name the engine will state for itself does not.

## The recorded drift

The taxonomy this package states once was consolidated from copies that had drifted, and the drift is *preserved*, not silently fixed, because some of it is visible on the wire. `src/core/native-concepts.ts` carries the table in its header; `__tests__/concept-taxonomy-characterization.test.ts` pins every cell of it.

The consequential entry: a `native.Date` input renders as prose rather than a date picker, wraps as `{text}`, and deflates to `{concept, content: {text}}` — consistent end to end, but not `DateContent`. Correcting it changes what goes over the wire, so it belongs to the swap and not to a patch release before it.

`native.Html` is a related case that turned out to work by accident. The concept set spells the code `HTML`; the language spells it `Html`, so the set matches nothing a real contract carries and `native.Html` falls through to the generic object dispatch — a nested card over `HtmlContent {inner_html, css_class}`, which round-trips correctly. **Correcting the spelling on its own would break inputs that work today**, by routing them into the prose-plus-`{text}` drift above. It goes with the `Date` fix, not before it.

A third entry was a genuine bug rather than a drift, and it is fixed: `native.Number` rendered as a number control and then travelled bare into a schema declaring `NumberContent {number}`, so the kernel's own gate rejected every run carrying one. There was no working behaviour to preserve, which is what separated it from the two above. The wrapper property is now derived from the contract (see `contentKey`, above) instead of being kept in a second hand-written list — the generalization the fix chose over a fourth special case, precisely so the next unlisted concept is covered without anyone noticing the gap. `native.YesNo` was in that same blind spot and came back with it: the render taxonomy looked for a concept named `Boolean`, which MTHDS does not have, so a yes/no input arrived as an object card wrapping a lone switch. It renders as a switch now, and the wire shape is unchanged either way.

The url-bearing-object test is a second recorded case. It reduces to `Boolean(schema.properties?.url)`, and the code says exactly that rather than implying a narrower check it does not perform. A narrower predicate — requiring the description to match — is a real behaviour change (arbitrary url-bearing objects would stop rendering as documents) and is queued with the swap.

## What the swap has to preserve

The characterization suites are the contract, and they were written before the extraction precisely so this could be checked rather than argued:

- `concept-taxonomy-characterization` — every native concept's behaviour on all three paths (render, wire, value bridge).
- `native-scalars` — the content wrapper each native scalar declares, end to end from the contract through the value bridge to the gate's verdict.
- `schema-utils-characterization` — the nullable-`anyOf` collapse and `$defs` walking, including the primitive-union case where the two historical implementations genuinely differed.
- `gate` and `values` — the four-step gate contract and the store/wire conversions.

A wire-derived descriptor that reproduces these is a drop-in. One that does not is a behaviour change, and the diff in those tests is exactly the list of what changed — which is the point of having recorded them.
