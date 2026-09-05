# @pipelex/mthds-form

The input form for MTHDS methods, as a library: a headless kernel that maps the method's wire-stated input form and contracts onto a renderable descriptor and gates what may be run, plus a themeable React control set that renders that descriptor.

It exists because "the form" is one problem that keeps being solved separately. A method declares its inputs; something has to decide what widget each input deserves, whether the Run button may light up, what shape the values take on the wire, and what a validation failure says to a person. That logic belongs in one place with tests around it, not copied into each surface that happens to need a form.

## Three entry points

```ts
import { buildRunFields, computeReadiness } from '@pipelex/mthds-form'; // headless
import { FieldRenderer } from '@pipelex/mthds-form/react'; // the controls
import { GenerativePage } from '@pipelex/mthds-form/generative'; // a produced layout
```

`.` is the kernel: no React, no design system, no framework. Its only runtime dependency is `ajv`, which the gate validates through. It runs in a browser, in Node, in a worker.

`./react` is the control set — one control per field kind behind a single dispatch point, styled with Tailwind classes over standard shadcn/ui tokens. `react` and `react-dom` are optional peer dependencies, so a consumer that only wants the kernel never installs them.

`./generative` renders a **layout** — a data file a model wrote once for a method, naming paths in the same descriptor and restating nothing about what a field is. It is the only entry that carries json-render and zod, so a host that renders an ordinary form pays for neither. When there is no layout, or the one on file no longer fits the method, the page falls back to the kernel's own form. See [docs/generative-ui.md](docs/generative-ui.md).

`mthds` is a peer dependency too, and a required one, but it is **types only**: the wire types of `pipe_io_contracts` belong to the MTHDS standard, so this package re-exports the standard's declarations instead of restating them. Every import of it is an `import type` and is erased at build, so it costs an install entry and no shipped bytes. See [docs/dependency-budget.md](docs/dependency-budget.md).

## The shape of a form

```tsx
import {
  buildRunFields,
  computeReadiness,
  getPipeInputForm,
  getPipeIOContract,
} from '@pipelex/mthds-form';
import { FieldRenderer } from '@pipelex/mthds-form/react';

const contract = getPipeIOContract(method.pipe_io_contracts, method.domain, pipeCode);
const descriptor = getPipeInputForm(method.input_form, method.domain, pipeCode);
const fields = buildRunFields(descriptor, contract.inputs);
const { missing } = computeReadiness(fields, values);
const canRun = missing.length === 0;

return fields.map((field) => (
  <FieldRenderer
    key={field.name}
    field={field}
    id={field.name}
    value={values[field.name]}
    onChange={(next) => setValue(field.name, next)}
  />
));
```

`pipe_io_contracts` is always on a valid validate report; `input_form` is its sibling presentation view, opted into with `views: ["input_form"]` on the validate request. Both lookups take their arguments in wire order — **the map, domain, pipe code** — and the last two are strings, so swapping them typechecks. They resolve anyway against a map keyed by bare pipe code, and fail only against one keyed by namespaced `pipe_ref`, a long way from the call.

`computeReadiness` reports `{ total, ready, missing }` — `missing` names the inputs still to fill, so it is both the Run gate and what a form tells the user is left.

The wire descriptor states what each field IS; `buildRunFields` maps it structurally, consulting the contract's `json_schema` only for two facts the wire omits (the scalar wrapper key and nested list bounds). Everything downstream — rendering, readiness, validation messaging — reads the `RunField` descriptor it returns. That is the load-bearing rule of the package, and [docs/architecture.md](docs/architecture.md) explains what it buys.

Submitting goes through the gate: `buildRunInputsSchema` → `prepareRunInputs` → `validateRunInputs` → `apiInputsFromSchemaData`. The verdict is structured (`RunInputError[]`), and `describeValidationError` renders it for a person.

## Theming

The controls carry Tailwind classes over the standard shadcn/ui semantic tokens (`--background`, `--input`, `--border`, `--primary`, …). A host that already defines those tokens gets controls that match its product with no configuration. A host with no Tailwind build loads the prebuilt `@pipelex/mthds-form/styles.css`. Both paths, and the exact token list, are in [docs/theming.md](docs/theming.md).

## Documentation

| | |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | the descriptor currency, the one-function seam, the module map |
| [docs/dependency-budget.md](docs/dependency-budget.md) | what each layer may depend on, and how that is enforced |
| [docs/theming.md](docs/theming.md) | the token contract and host setup |
| [docs/wire-correspondence.md](docs/wire-correspondence.md) | the name-for-name wire ↔ `RunField` mapping |
| [docs/derivation-swap.md](docs/derivation-swap.md) | the record of the swap to the wire descriptor — what changed, what survived |

## Development

```bash
make install
make check   # lint + format + typecheck
make test
make build   # every entry point, plus the prebuilt stylesheet
```

MIT licensed.
