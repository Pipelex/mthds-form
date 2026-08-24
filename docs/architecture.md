# Architecture

## The one rule: the descriptor is the currency

A method's inputs arrive as a `pipe_io_contracts` map — a concept reference and a JSON Schema per input. JSON Schema is a poor thing to render from directly: it is recursive, it expresses the same shape several ways (`anyOf` nullables, `$ref` indirection, `$defs` hoisting), and the interesting question for a form ("is this a document upload or a paragraph of prose?") is not a schema question at all, it is a *concept* question that the schema only hints at.

So exactly one function answers it:

```
buildRunFields(inputs: Record<string, PipeInputContract>) -> RunField[]
```

`RunField` is a discriminated union over `kind` — `text`, `prose`, `date`, `document`, `image`, `number`, `boolean`, `choice`, `structured`, `list`, `unknown` — carrying everything a control needs and nothing a control would have to re-derive. **Nothing else in the package, and nothing in any consumer, reads JSON Schema to decide how to render.** The renderer switches on `field.kind`. Readiness reads `field.gating`. Validation messaging reads the field's name and label.

Everything heuristic is module-private behind that function: the native-concept taxonomy, the url-bearing-object test, the depth rule that decides prose versus a single-line input, the `accept` strings, list splitting. None of it is exported, which is what makes the seam real rather than aspirational — see [derivation-swap.md](derivation-swap.md).

### What a scalar's value actually looks like on the wire

A native scalar reads as a plain value in the form and travels as an object on the wire. `native.Number` declares `NumberContent {number}`, `native.YesNo` declares `YesNoContent {yes_no}`, `native.Text` declares `TextContent {text}` — so the control holds `2` while the payload must carry `{number: 2}`, and the gate validates against the declared content model.

The descriptor is what reconciles those. `buildRunFields` reads the contract, finds the single property the content model declares, and stamps its **name** on the field as `contentKey`. The value bridge in `values` then wraps on the way out and unwraps on the way back in, by name — it holds no list of which concepts wrap, and it never looks at a schema.

That indirection is not decoration. The wrapper used to be a second hand-written list of concept names living next to the render taxonomy, the two disagreed about `native.Number`, and the result was a form that looked correct, satisfied readiness, enabled Run, and then failed its own gate with `'…' must be object`. Deriving the name from the contract covers concepts nobody remembered to add.

A field with no `contentKey` keeps its value plain, and that is equally deliberate: a structured concept, a file, or a child property of a structure IS its value, and wrapping one double-nests it into a payload no schema accepts.

## Module map

### `.` — the headless core (`src/core/`)

| Module | Role |
| --- | --- |
| `descriptor` | the `RunField` union (including `contentKey`, the scalar wrapper property), `ConceptCategory`, `conceptCategory` — the consumer-facing currency |
| `derive` | `buildRunFields`, the one derivation function; every heuristic lives behind it |
| `contracts` | the typed `PipeIOContract` mirror plus `getPipeIOContract` / `buildPipeRef` and the gating predicates — [docs/contract-mirror.md](contract-mirror.md) |
| `gate` | `buildRunInputsSchema` → `prepareRunInputs` → `validateRunInputs` → `apiInputsFromSchemaData` |
| `gate-validator` | the kernel's own ajv instance and the `RunInputError` type its verdict speaks |
| `readiness` | `isFilled`, `fieldFilled`, `mustBeFilled`, `computeReadiness` — what the Run button gates on |
| `values` | store/wire value conversions (wrapping scalars by `contentKey`), `setValueAtPath`, `outputsFromPipeOutput` |
| `wire-format` | deflate/inflate and the exactly-one-wrapper invariant |
| `schema-utils` | the one nullable-`anyOf` collapse and the one `$defs` walker |
| `native-concepts` | the native-concept taxonomy, stated once (not exported from the entry) |
| `date-format` | pydantic-parity date leniency, shared by the validator and the date control |
| `validation-message` | turns a `RunInputError` into something a person can act on |
| `normalize-schema` | RJSF-shaped schema preparation, consumed by the gate and by hosts that still drive an RJSF panel |

### `./react` — the control set (`src/react/`)

`FieldRenderer` is the single dispatch point: a `RunField` in, the matching control out. Object and list fields recurse back through it, so a form of any depth is one data-driven tree with no per-type branching anywhere else. `FieldEnv` threads the ambient concerns a nested field may need — disabled state, and the upload trio (`onDropFile`, `uploadingIds`, `resolveUrl`) that keeps file handling injected rather than built in. The package never uploads anything itself.

Three seams keep the controls host-agnostic:

- **Copy.** `FieldStringsProvider` supplies every user-visible string, with complete English defaults baked in. A host wraps its form once to inject translations; nothing is required for English.
- **Upload.** Injected through `FieldEnv`, as above.
- **Presentation.** `FieldPresentationProvider` picks how a field's label chrome reads. `studio` (the default) shows the field's name verbatim in mono with its concept pill, because in a builder-facing surface the name IS the identifier written in the `.mthds` file. `app` shows it humanised in sans with no pill, and outlines a field in error rather than only captioning it, because the person filling a published form has never seen the method's source. An authored `title` is authoritative and shown verbatim in both presentations; only the identifier fallback is humanised. It is a context rather than a prop deliberately: only the components that own label chrome read it — `FieldShell`, `ObjectField`, `BooleanField` and `ListField` — and threading a prop would have meant editing every control and both recursive containers to carry something they do not use.

The vendored `ui/` primitives (`switch`, `select`, `toggle`, `toggle-group`) and the `cn` helper are copies rather than imports, which is how shadcn/ui is meant to be consumed. They are internal: only what `src/react/index.ts` exports is public API.

## The gate

Validation is a four-step contract, and the order matters:

1. `buildRunInputsSchema` composes the per-input schemas into one object schema.
2. `prepareRunInputs` normalizes the values against it (`$ref` resolution, nullable collapse, empty-optional pruning).
3. `validateRunInputs` returns a structured verdict — `RunInputError[]`, never a thrown exception, never a rendered string.
4. `apiInputsFromSchemaData` produces the wire payload.

The verdict is the contract; its rendering is not. `describeValidationError` is one presentation of a `RunInputError` and a host is free to write another. A consumer branches on the structured error, never on message text.

A message that names a field names the field's **identifier** — the one written in the method — never the schema `title` a pydantic contract carries alongside it. That is the one deliberate divergence from RJSF's error transform, which substitutes the title because in an RJSF form the title *is* the rendered label. Here the controls label a field by its identifier, so quoting `'Audience'` at someone whose bundle says `audience` sends them looking for a field that does not exist.

### What absence looks like

An input the user never touched is **absent**. Not an empty shell, not `{}`, not `{child: ""}` — absent. Every step has to agree about that, because when they disagree the form offers a run its own gate then refuses.

`isFilled` is the one predicate, and three places read it. The value bridge omits a structure nothing was put into rather than materializing children for it. `prepareRunInputs` drops an optional property that pruned down to `{}` — which is what the shell collapses to on the surface that renders through RJSF, where the bridge is not involved. `apiInputsFromSchemaData` omits an unfilled optional input from the payload. Readiness already ignores optional inputs, so all four answers line up.

Materializing the shell instead is what made an optional input with a required child unrunnable: readiness ignored the input (correctly — the method said it may be omitted), Run lit up, and ajv then judged an object the kernel itself had invented against the concept's full schema. The touch that keeps a structure is a **value** in it, not a disclosure: opening the optional section is local view state the value never sees, so a section opened and left blank is absent exactly as one never opened is. Put anything in it and the whole shell survives, empty children and all — which is what makes the concept's required fields fall due, and they fail loudly.

An empty **list** is deliberately not absent, at either step: a plural slot is never missing in MTHDS — its empty form IS the empty list — so dropping it would invent an absence the method cannot express. A *fixed-count* list (`Concept[N]`) is the exception the contract states, and it is an exception to gating rather than to absence: the empty list is still what an empty one of those is, it is simply a value the method has ruled out, so Run waits for it. See [contract-mirror.md](contract-mirror.md).

Neither is an **item** in a list. Absence is what a *singular* slot expresses; an item is in the array only because the user added it, so adding is itself the touch. Letting an item collapse the way an untouched input does leaves `undefined` in the array, and ajv answers `must be object` — which blocks an empty item the item schema allowed, and replaces a required-child complaint with a type error that names nothing the user can act on. So the value bridge collapses an empty structure in a singular slot and never in a list item; that is the one distinction `collapseEmpty` draws in `toRjsf`.

The gate validates through the package's own ajv instance, configured for pydantic parity (type coercion, and `date` / `date-time` formats matching what the runtime accepts). It does not depend on RJSF: a host that renders an RJSF panel elsewhere builds its own `ValidatorType` over the package's exported date predicates, so the leniency rules keep one definition and two presentations.

## Public API and internal code

`src/core/index.ts` and `src/react/index.ts` are the two entry points, and they are the whole public surface. Deep paths are not exported and are not stable. This is deliberate: it is what lets the derivation, the taxonomy, and the vendored primitives change without a breaking release.

## Local development against a consumer

The package builds to `dist/` with `make build`. To develop it against a consumer before publishing:

```bash
make pack                      # -> pipelex-mthds-form-<version>.tgz
# in the consumer:
pnpm add file:../mthds-form/pipelex-mthds-form-<version>.tgz
```

Re-pack and re-install to pick up changes. Replace the `file:` dependency with a published semver before the consumer's change lands.
