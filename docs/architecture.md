# Architecture

## The one rule: the descriptor is the currency

A method's inputs arrive as two sibling wire artifacts, both derived by the engine from the same resolved library: `pipe_io_contracts` (a concept reference and a JSON Schema per input — the validation contract) and the per-pipe **input-form descriptor** (the ordered presentation view the standard specifies). Exactly one function turns them into what the rest of the package consumes:

```
buildRunFields(descriptor: PipeInputFormDescriptor, inputs: Record<string, PipeInputContract>) -> RunField[]
```

`RunField` is a discriminated union over `kind` — `text`, `prose`, `date`, `number`, `boolean`, `enum`, `document`, `image`, `object`, `list`, `unknown` — carrying everything a control needs and nothing a control would have to re-derive. **What a field IS comes from the wire descriptor, verbatim**: the kind, the constraints, the refinement chain, whether Run gates on it. `buildRunFields` maps that tree structurally and decides nothing — the heuristics that used to guess here are deleted, and [derivation-swap.md](derivation-swap.md) is the record. The name-for-name wire ↔ kernel mapping is [wire-correspondence.md](wire-correspondence.md).

The contract's `json_schema` is co-walked for exactly two facts the wire deliberately omits — `contentKey` (below) and a nested array's `minItems`/`maxItems` — both structural reads of keywords ajv itself enforces, never judgements. Beyond that walk, **nothing else in the package, and nothing in any consumer, reads JSON Schema to decide how to render.** The renderer switches on `field.kind`. Readiness reads `field.gating`. Validation messaging reads the field's name and label. The one other schema reader in the kernel is the gate's own private walk (`gating-fields`, below), which exists precisely so a server never needs the presentation artifact to refuse a run.

### What a scalar's value actually looks like on the wire

A native scalar reads as a plain value in the form and travels as an object on the wire. `native.Number` declares `NumberContent {number}`, `native.YesNo` declares `YesNoContent {yes_no}`, `native.Text` declares `TextContent {text}` — so the control holds `2` while the payload must carry `{number: 2}`, and the gate validates against the declared content model.

The descriptor is what reconciles those. `buildRunFields`' schema co-walk finds the single property a scalar-kind node's content model declares and stamps its **name** on the field as `contentKey` — resolving `$ref` and nullable-`anyOf` indirection to a fixpoint first, so an optional concept-typed child (pydantic's `anyOf: [{$ref}, {type: 'null'}]`) reads like any other. The value bridge in `values` then wraps on the way out and unwraps on the way back in, by name — it holds no list of which concepts wrap, and it never looks at a schema.

That indirection is not decoration. The wrapper used to be a second hand-written list of concept names living next to the render taxonomy, the two disagreed about `native.Number`, and the result was a form that looked correct, satisfied readiness, enabled Run, and then failed its own gate with `'…' must be object`. Deriving the name from the contract covers concepts nobody remembered to add.

A field with no `contentKey` keeps its value plain, and that is equally deliberate: a structured concept, a file, or a child property of a structure IS its value, and wrapping one double-nests it into a payload no schema accepts.

## Module map

### `.` — the headless core (`src/core/`)

| Module | Role |
| --- | --- |
| `descriptor` | the `RunField` union (including `contentKey`, the scalar wrapper property), `ConceptCategory`, `conceptCategory` — the consumer-facing currency |
| `derive` | `buildRunFields`, the structural wire-descriptor → `RunField` mapping, and `getPipeInputForm`, the descriptor lookup; the schema co-walk for `contentKey` and nested list bounds lives behind it |
| `contracts` | the standard's `pipe_io_contracts` types, re-exported from `mthds/protocol`, plus `getPipeIOContract` / `buildPipeRef` and the gating predicates — [docs/contract-mirror.md](contract-mirror.md) |
| `gate` | `gateRunInputs`, the whole chain as one call, over the four steps it composes — [docs/run-gate.md](run-gate.md) |
| `gating-fields` | the gate's own private field tree, walked structurally from the contract's `json_schema` — a server must never need the presentation artifact to validate (not exported) |
| `gate-validator` | the kernel's own ajv instance and the `RunInputError` type its verdict speaks |
| `readiness` | `isFilled`, `fieldFilled`, `mustBeFilled`, `computeReadiness` — what the Run button gates on, and what the server gate re-applies |
| `values` | store/wire value conversions (wrapping scalars by `contentKey`), `setValueAtPath`, `outputsFromPipeOutput` |
| `wire-format` | deflate/inflate and the exactly-one-wrapper invariant; states the wire-simplification taxonomy for itself — the one native-concept knowledge left in the package |
| `schema-utils` | the one nullable-`anyOf` collapse and the one `$defs` walker |
| `date-format` | pydantic-parity date leniency, shared by the validator and the date control |
| `validation-message` | turns a `RunInputError` into something a person can act on |
| `normalize-schema` | RJSF-shaped schema preparation, consumed by the gate and by hosts that still drive an RJSF panel |
| `own-property` | `ownProp` / `hasOwnProp` — the one spelling of "read a key this record owns", used wherever a method-author-chosen name indexes a host-built object |

### `./react` — the control set (`src/react/`)

`FieldRenderer` is the single dispatch point: a `RunField` in, the matching control out. Object and list fields recurse back through it, so a form of any depth is one data-driven tree with no per-type branching anywhere else. `FieldEnv` threads the ambient concerns a nested field may need — disabled state, and the upload trio (`onDropFile`, `uploadingIds`, `resolveUrl`) that keeps file handling injected rather than built in. The package never uploads anything itself.

These seams keep the controls host-agnostic:

- **Copy.** `FieldStringsProvider` supplies every user-visible string, with complete English defaults baked in. A host wraps its form once to inject translations; nothing is required for English.
- **Upload.** Injected through `FieldEnv`, as above. What each side of that seam owes the other — the ID is a path, an uploading ID means every door into that value is shut, what a row's identity does and does not cover, when `resolveUrl` is not needed — is [upload-seam.md](upload-seam.md).
- **DOM ids.** A field's `id` is a value *path*, and a path is not unique across forms. It is therefore no longer written to the document as-is: each control derives its `id` / `<label for>` through `useFieldDomId`, which prefixes the path. With no provider the prefix comes from `useId`, so mounting the same method twice within one React root is correct with no host change; `useId` cannot see across roots, so a host mounting forms in separate roots gives each root its own `identifierPrefix` or provider prefix. `FieldDomIdProvider` supplies a deterministic prefix for a host that needs the ids to be predictable rather than merely unique — which moves the uniqueness obligation to the host: a provider scopes one form, and an explicit prefix must be unique in the document. `prefix=""` writes the path unprefixed for a host that addressed the old ids. Why the path could not simply be made unique instead is in [upload-seam.md](upload-seam.md).
- **Presentation.** `FieldPresentationProvider` picks how a field's label chrome reads. `studio` (the default) shows the field's name verbatim in mono with its concept pill, because in a builder-facing surface the name IS the identifier written in the `.mthds` file. `app` shows it humanised in sans with no pill, and outlines a field in error rather than only captioning it, because the person filling a published form has never seen the method's source. An authored `title` is authoritative and shown verbatim in both presentations; only the identifier fallback is humanised. It is a context rather than a prop deliberately: only the components that own label chrome read it — `FieldShell`, `ObjectField`, `BooleanField` and `ListField` — and threading a prop would have meant editing every control and both recursive containers to carry something they do not use.

The vendored `ui/` primitives (`switch`, `select`, `toggle`, `toggle-group`) and the `cn` helper are copies rather than imports, which is how shadcn/ui is meant to be consumed. They are internal: only what `src/react/index.ts` exports is public API.

## The gate

**`gateRunInputs(contract, data)` is the whole gate as one call, and it is what a server should use.** Underneath, validation is a four-step contract, and the order matters:

1. `buildRunInputsSchema` composes the per-input schemas into one object schema.
2. `prepareRunInputs` normalizes the values against it (`$ref` resolution, nullable collapse, empty-optional pruning).
3. `validateRunInputs` returns a structured verdict — `RunInputError[]`, never a thrown exception, never a rendered string.
4. `apiInputsFromSchemaData` produces the wire payload.

The four stay exported for a host that renders its own panel, but assembling them is not a host's job: the step between validation and the payload re-applies the Run button's own emptiness rule, and there are four look-alike predicates to pick it from. [run-gate.md](run-gate.md) is the topic — why the browser and server verdicts are one invariant, which `*Filled` to reach for, and why the schema is cached.

The verdict is the contract; its rendering is not. `describeValidationError` is one presentation of a `RunInputError` and a host is free to write another. A consumer branches on the structured error, never on message text.

A message that names a field names the field's **identifier** — the one written in the method — never the schema `title` a pydantic contract carries alongside it. That is the one deliberate divergence from RJSF's error transform, which substitutes the title because in an RJSF form the title *is* the rendered label. Here the controls label a field by its identifier, so quoting `'Audience'` at someone whose bundle says `audience` sends them looking for a field that does not exist.

### What absence looks like

An input the user never touched is **absent**. Not an empty shell, not `{}`, not `{child: ""}` — absent. Every step has to agree about that, because when they disagree the form offers a run its own gate then refuses.

`isFilled` is the one predicate, and four places read it. The value bridge omits a structure nothing was put into rather than materializing children for it. `prepareRunInputs` drops an optional property that pruned down to `{}` — which is what the shell collapses to on the surface that renders through RJSF, where the bridge is not involved. `apiInputsFromSchemaData` omits an unfilled optional input from the payload. And `fieldFilled` asks it before descending into a structure, so readiness calls an input present exactly when the bridge keeps it.

That last reader is the one that was missing, and its absence left a live edge of the same family. `fieldFilled` used to answer a structure by checking its required children alone, which is *vacuously true* over a value that is not there when the concept demands no child: a **required** struct whose properties are all optional reported ready while untouched, the bridge omitted it like any other untouched structure, and the combined schema's `required` list then refused the run. Reading `isFilled` first states the rule once — a slot holds something, and then everything it demands inside is filled — and both halves refuse together. The consequence is that a required structure must be *touched*: the button stays dark until a value goes somewhere inside it, exactly as it does for an untouched required number. A concept with no properties at all is therefore ungateable through a required slot — it was already unrunnable, since the bridge omits it and ajv demands it; the change is only that the form now says so before Run rather than after. The shape is also flagged upstream at authoring time: pipelex's validate surfaces emit an advisory `input_presence_vacuous` warning on a demanded entry-pipe input whose concept declares no required field, steering the method author toward marking the input `?` or requiring a child — so the kernel's fail-closed handling is the backstop, not the only guard.

Materializing the shell instead is the other way the two halves came apart, and it is what made an optional input with a required child unrunnable: readiness ignored the input (correctly — the method said it may be omitted), Run lit up, and ajv then judged an object the kernel itself had invented against the concept's full schema. The touch that keeps a structure is a **value** in it, not a disclosure: opening the optional section is local view state the value never sees, so a section opened and left blank is absent exactly as one never opened is. Put anything in it and the whole shell survives, empty children and all — which is what makes the concept's required fields fall due, and they fail loudly.

**What `isFilled` does with a value nobody designed for** is part of the same rule, because the values it walks are the caller's. It stops at a depth cap and answers `false` there: past the cap it cannot tell whether anything is down there, and an unanswerable absence fails closed like every other one. The branches combine with `some`, so a refused over-deep branch loses only its own vote — a real value beside it still reads filled — and no concept structure nests anywhere near that deep, so a value reaching the cap is not one the method had a slot for. It also keeps the objects it has already judged, which is a cycle guard and a memo at once: an object reached twice inside one call answered `false` the first time, because a `true` short-circuits every `some` above it. Without that, a value shaped like a diamond chain costs exponential time. A string of nothing but whitespace is not a value either — a content model carries no `minLength`, so nothing downstream would have caught it.

**And a name is read as a name.** Every key this package indexes a record by — an input variable, a structure's property, a pipe code, a content key — is chosen by the method author, and the records are plain objects a host built. A bare `record[name]` therefore does not answer `undefined` for a name that collides with `Object.prototype`; it answers the inherited function, which is truthy. An input named `constructor` reported ready while empty. `ownProp` is the one spelling of that read, used at every site in the kernel **and in the control set** — the object control passes each child its value by name, so a bare index there handed a child control an inherited function: a switch rendered ON over an absent value, and a list child threw. `isFilled` returns `false` for a function as a backstop for the routes it does not cover, which is why the readiness half of that control was already right while the value it passed down was wrong. ajv is no help here — its `required` compiles to `data.constructor === undefined` and reads the inherited function as a supplied value — which is why this had to be closed in the kernel rather than left to the schema.

An empty **list** is deliberately not absent, at either step: a plural slot is never missing in MTHDS — its empty form IS the empty list — so dropping it would invent an absence the method cannot express. A *fixed-count* list (`Concept[N]`) is the exception the contract states, and it is an exception to gating rather than to absence: the empty list is still what an empty one of those is, it is simply a value the method has ruled out, so Run waits for it. See [contract-mirror.md](contract-mirror.md).

Neither is an **item** in a list. Absence is what a *singular* slot expresses; an item is in the array only because the user added it, so adding is itself the touch. Letting an item collapse the way an untouched input does leaves `undefined` in the array, and ajv answers `must be object` — which blocks an empty item the item schema allowed, and replaces a required-child complaint with a type error that names nothing the user can act on. So the value bridge collapses an empty structure in a singular slot and never in a list item; that is the one distinction `collapseEmpty` draws in `toRjsf`.

The gate validates through the package's own ajv instance, configured for pydantic parity (type coercion, and `date` / `date-time` formats matching what the runtime accepts). It does not depend on RJSF: a host that renders an RJSF panel elsewhere builds its own `ValidatorType` over the package's exported date predicates, so the leniency rules keep one definition and two presentations.

## Public API and internal code

`src/core/index.ts` and `src/react/index.ts` are the two entry points, and they are the whole public surface. Deep paths are not exported and are not stable. This is deliberate: it is what lets the derivation and the vendored primitives change without a breaking release.

`dist/core/` holds a file per core module, and none of them is API. The build emits them so that `dist/core/index.js` comes out a pure re-export barrel, which is what a consumer's bundler needs in order to drop the chunks behind exports the host never uses — the difference between a browser form shipping ajv and not. The `exports` map in `package.json` lists only `.` and `./react`, so a deep path stays unreachable to a consumer; see [dependency-budget.md](dependency-budget.md) § "The chunk graph is part of the budget".

## Local development against a consumer

The package builds to `dist/` with `make build`. To develop it against a consumer before publishing:

```bash
make pack                      # -> pipelex-mthds-form-<version>.tgz
# in the consumer:
pnpm add file:../mthds-form/pipelex-mthds-form-<version>.tgz
```

Re-pack and re-install to pick up changes. Replace the `file:` dependency with a published semver before the consumer's change lands.
