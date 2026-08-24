# Changelog

## [Unreleased]

### Changed

- **Breaking: the input contract mirror follows the wire's reshaped `pipe_io_contracts`.** An input no longer carries a boolean `optional`; it carries the authored marker verbatim as `presence: 'plain' | 'optional' | 'force'`, alongside the `multiplicity: 'single' | 'variable' | 'fixed'` and `item_count: number | null` pair the wire now states. The output contract gained the same multiplicity pair and deliberately kept its boolean `optional` — output presence is genuinely two-valued, because `!` is rejected on an output.

  There is no compatibility branch, so a contract in the retired shape now reads as `plain` and every `?` input in it gates. That fails in the safe direction — a run is blocked, never mis-sent — but a host whose runtime has not yet moved will see optional inputs demanded until it does. `isOptionalInput` is the one predicate that answers "may this be absent?" for the whole package, so a host reading `input.optional` itself should call it instead of matching on the marker.

- **A fixed-count list (`Concept[N]`) gates like any other input.** A plural slot never blocked Run, on the grounds that its empty form IS the empty list and no method can declare "at least one" — which is exactly right for `Concept[]` and exactly wrong for `Concept[N]`, where the method has declared the count. Left ungated the failure was not strictness but silence: an absent property is one ajv never validates, so the run went out with the input missing altogether. The declared count itself is enforced by the schema the contract already carries (`minItems`/`maxItems`), not restated in the kernel.

### Added

- **`isOptionalInput`, `isFixedCountInput`, and the `InputPresence` / `IOMultiplicity` types are exported.** The predicates are what the retired `input.optional` read becomes; exporting them keeps a host from re-deriving a gating rule the kernel already answers — the re-derivation being what this package exists to remove.

### Fixed

- **The README quick-start called `getPipeIOContract` with its arguments swapped**, and destructured a `canRun` the readiness verdict does not have. The lookup takes contracts, domain, pipe code — and because the last two are both strings, a swap typechecks and then resolves anyway against a bare-code-keyed map, failing only against a namespaced one, far from the call. Both are corrected, with a note beside the example stating the order and what `computeReadiness` actually returns.

## [v0.3.0] - 2026-08-24

### Fixed

- **An optional structured input is runnable again when it is left alone.** An input declared `focus = "ExtractionFocus?"` could not be run without being filled in, which is the opposite of optional: the value bridge materialized a shell of empty children for a section nobody had opened, and the gate then judged that invented object against the concept's full schema and rejected the run for a missing required child. Readiness was right to ignore the input and the Run button was right to light up — the two halves of the kernel disagreed about whether the input was even there, and no host could correct it from outside. Any concept with a required field was unusable as an optional input, which is a shape a method reaches for constantly.

  An untouched structure now stays absent, exactly as an untouched number does, and the gate's own pruning drops an optional property that empties out — so the surface that renders through RJSF, where the bridge is not involved, is repaired by the same change. Emptiness is `isFilled` throughout, so readiness, the prune and the wire payload cannot disagree again. The touch that keeps a structure is a **value** in it, not a disclosure — opening the optional section is view state the kernel never sees — and once anything is filled the whole shell survives, empty children and all, so the concept's required fields fall due and still fail loudly. An empty list is untouched by all of this — a plural slot is never absent, and neither is an item inside one: an item is in the list because the user added it, so adding is the touch. Absence is what a singular slot expresses, which is why an empty row added to a list of structures still reaches the gate as an object — it validates when the item concept demands nothing, and names the missing child when it demands one.

  This is visible on the wire, and it is a fix rather than a wire change: the shape it replaces was rejected by the kernel's own gate, so there was no working behaviour to preserve.

- **A validation error names the field the method wrote, not the title pydantic gave it.** A blocked run read `must have required property 'Audience'` where the bundle declares `audience`, sending the user hunting for a field their method does not contain. Quoting the schema `title` is right in an RJSF form, where the title is the rendered label, and it is the one place the gate's validator now diverges from RJSF's error transform: this package labels a field by its identifier, so that is the name its errors quote.

- **A `native.Number` input is runnable again — it wraps into the content envelope its concept declares.** The form offered a proper number control, readiness was satisfied, Run lit up, and the gate then rejected the payload with `'<input>' must be object`: the value bridge sent the number bare while the contract declared `NumberContent {number}`. The two halves of the kernel disagreed about the same input, no host could correct it from outside, and any method taking a number was unrunnable through the package. A number now travels as `{number: 2}`, and the plural and optional cases behave the way they read — an untouched optional number stays absent rather than becoming an empty envelope that would fail the content model's own `required`.

  This is visible on the wire, and it is a fix rather than a wire change: the shape it replaces was rejected by the kernel's own gate, so there was no working behaviour to preserve. The recorded drift on `native.Date` is a different case and is untouched — see [docs/derivation-swap.md](docs/derivation-swap.md).

- **A `native.YesNo` input renders as a switch.** The taxonomy looked for a concept named `Boolean`, which MTHDS does not have, so `kind: 'boolean'` was unreachable from a real method and a yes/no input arrived as a nested card wrapping a lone switch. The wire shape is `{yes_no: …}` before and after; only the rendering changes.

- **A number's `minimum` / `maximum` reach the control.** They are declared on the wrapped property, never on the wrapper object, so reading the outer schema always found nothing and the stepper ignored a method's declared range.

### Changed

- **The scalar content wrapper is derived from the contract, not from a hand-kept list.** `buildRunFields` — still the only reader of JSON Schema — finds the single property a scalar concept's content model declares and stamps its name on the descriptor as `RunField.contentKey`; the value bridge wraps and unwraps by that name and no longer keeps a taxonomy of its own. That is what made the bug above possible: the render taxonomy knew `native.Number` and the wrapper taxonomy did not. Deriving the name covers a concept nobody remembered to add, instead of adding a fourth special case that would leave the next one uncovered.

- **The native-concept sets spell the codes the language actually defines.** `Integer` and `Float` were dead entries for concepts MTHDS has no such thing as, and `Boolean` was the miss above. `HTML_CONCEPTS` is the deliberate exception and stays misspelled: the language spells it `Html`, the set matches nothing a real contract carries, and `native.Html` therefore falls through to a nested card over `HtmlContent {inner_html, css_class}` that round-trips correctly. Correcting the spelling alone would break inputs that work today by routing them into the recorded `Date` drift, so it goes with that fix at the derivation swap.

## [v0.2.0] - 2026-08-21

### Added

- **A presentation seam on the controls — `FieldPresentationProvider`.** A form has two audiences and they want opposite label chrome. In a builder-facing surface the field's name IS the identifier written in the `.mthds` file, so it is shown verbatim in mono beside its concept pill; in a published method app that name and that concept are implementation detail the person filling the form has never seen. `presentation="app"` humanises the label (`full_name` → `Full name`), drops the pill, and outlines a field in error instead of only captioning it — the caption alone is easy to miss on a tall form, and on controls whose `aria-invalid` sits on an element the user cannot see (the file dropzone's hidden input, most of all) it was the only signal at all. `studio` is the default, so nothing changes for a host that says nothing.

  It is a context rather than a prop, deliberately: only the components that own label chrome read it — `FieldShell`, `ObjectField`, `BooleanField` and `ListField` — and a prop would have meant editing every control and both recursive containers to carry a value they never use. An authored `title` is preserved verbatim in both presentations; only the identifier fallback is humanised. `humanizeFieldName` is exported too, for hosts that label something outside a control.

## [v0.1.0] - 2026-08-21

The initial contents of the package.

### Added

- **The headless core (`.`)** — `buildRunFields`, the one derivation function turning a method's `pipe_io_contracts` into `RunField` descriptors; the `RunField` union itself; the run gate (`buildRunInputsSchema` → `prepareRunInputs` → `validateRunInputs` → `apiInputsFromSchemaData`); readiness; the typed `PipeIOContract` mirror with `getPipeIOContract` / `buildPipeRef`; store and wire value conversions; the wire format's deflate/inflate and its exactly-one-wrapper invariant; pydantic-parity date leniency; validation-error presentation; schema utilities.
- **The control set (`./react`)** — `FieldRenderer` dispatching one control per field kind, recursing for objects and lists; `FieldShell`, `ConceptPill` and `OptionalToggle`; `FieldStringsProvider` for host-supplied copy with complete English defaults; `FieldEnv` for injected upload handling.
- **Theming** — Tailwind classes over standard shadcn/ui semantic tokens, a prebuilt `styles.css` for hosts with no Tailwind build, and a `theme.css` of default token values.

### Changed, during the extraction

- **The gate no longer validates through RJSF.** It uses the package's own ajv instance, configured for the same pydantic-parity leniency, and reports a `RunInputError` the package owns. Error output was recorded against the previous implementation and proven identical on every fixture before the swap.
- **The nullable-`anyOf` collapse and the `$defs` walker are each stated once**, with the modes their historical call sites needed exported explicitly, because the implementations they consolidate genuinely differed.
- **The native-concept taxonomy is stated once.** The three copies it replaces had drifted; each call path's observable behaviour is preserved exactly and the drift is recorded in the module header and pinned by tests. See [docs/derivation-swap.md](docs/derivation-swap.md).
- **The url-bearing-object test says what it does.** It reduces to `Boolean(schema.properties?.url)`; the code now states that rather than implying a narrower check it never performed.
