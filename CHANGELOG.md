# Changelog

## [v0.2.0] - 2026-08-21

### Added

- **A presentation seam on the controls — `FieldPresentationProvider`.** A form has two audiences and they want opposite label chrome. In a builder-facing surface the field's name IS the identifier written in the `.mthds` file, so it is shown verbatim in mono beside its concept pill; in a published method app that name and that concept are implementation detail the person filling the form has never seen. `presentation="app"` humanises the label (`full_name` → `Full name`), drops the pill, and outlines a field in error instead of only captioning it — the caption alone is easy to miss on a tall form, and on controls whose `aria-invalid` sits on an element the user cannot see (the file dropzone's hidden input, most of all) it was the only signal at all. `studio` is the default, so nothing changes for a host that says nothing.

  It is a context rather than a prop, deliberately: only `FieldShell` and `ObjectField` read it, and a prop would have meant editing every control and both recursive containers to carry a value they never use. `humanizeFieldName` is exported too, for hosts that label something outside a control.

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
