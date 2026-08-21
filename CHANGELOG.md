# Changelog

All notable changes to `@pipelex/mthds-form` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [semantic versioning](https://semver.org/spec/v2.0.0.html).

A `## [vX.Y.Z]` heading means that version was published to npm. Work in progress accumulates under `## [Unreleased]` and is renamed when the release actually ships.

## [Unreleased]

The initial contents of the package, extracted from `pipelex-app`'s run form with behaviour frozen — the app's suites and stories stayed green throughout, and pass unchanged against the package.

### Added

- **The headless core (`.`)** — `buildRunFields`, the one derivation function turning a method's `pipe_io_contracts` into `RunField` descriptors; the `RunField` union itself; the run gate (`buildRunInputsSchema` → `prepareRunInputs` → `validateRunInputs` → `apiInputsFromSchemaData`); readiness; the typed `PipeIOContract` mirror with `getPipeIOContract` / `buildPipeRef`; store and wire value conversions; the wire format's deflate/inflate and its exactly-one-wrapper invariant; pydantic-parity date leniency; validation-error presentation; schema utilities.
- **The control set (`./react`)** — `FieldRenderer` dispatching one control per field kind, recursing for objects and lists; `FieldShell`, `ConceptPill` and `OptionalToggle`; `FieldStringsProvider` for host-supplied copy with complete English defaults; `FieldEnv` for injected upload handling.
- **Theming** — Tailwind classes over standard shadcn/ui semantic tokens, a prebuilt `styles.css` for hosts with no Tailwind build, and a `theme.css` of default token values.

### Changed, during the extraction

- **The gate no longer validates through RJSF.** It uses the package's own ajv instance, configured for the same pydantic-parity leniency, and reports a `RunInputError` the package owns. Error output was recorded against the previous implementation and proven identical on every fixture before the swap.
- **The nullable-`anyOf` collapse and the `$defs` walker are each stated once**, with the modes their historical call sites needed exported explicitly, because the implementations they consolidate genuinely differed.
- **The native-concept taxonomy is stated once.** The three copies it replaces had drifted; each call path's observable behaviour is preserved exactly and the drift is recorded in the module header and pinned by tests. See [docs/derivation-swap.md](docs/derivation-swap.md).
- **The url-bearing-object test says what it does.** It reduces to `Boolean(schema.properties?.url)`; the code now states that rather than implying a narrower check it never performed.
