# The whole form: `useMethodForm` and `MethodForm`

`FieldRenderer` renders one input. Every host that renders a method's whole input form used to write the same hundred lines around it: derive the fields, seed the method's defaults, hold the values, upload a dropped file and write it back at its path, track which uploads are in flight and which failed, fold the empty optional inputs behind a disclosure that also opens and closes the optional structures, mark the required inputs once the person has tried to run, and turn the values into the inputs a run takes. Each copy got some of it slightly differently. The `./react` entry now ships that as two pieces:

- **`useMethodForm(options)`** holds the state of one method's form and returns a controller: the fields, the values, the run inputs, the readiness and whether the run may start.
- **`<MethodForm form={controller} />`** renders every input for that controller, and nothing else.

They are two pieces so that the consumer keeps what is its own. The hook is called wherever the run button lives (often a page, with the form in one panel and the button on a seam between panels), and the component is mounted where the fields go. Neither carries a panel, a heading, a run button, a run history or a `<form>` element: a host wraps the fields in whatever it has.

```tsx
import { getPipeInputForm, getPipeIOContract } from '@pipelex/mthds-form';
import { MethodForm, useMethodForm } from '@pipelex/mthds-form/react';

const contract = getPipeIOContract(method.pipe_io_contracts, method.domain, pipeCode);
const descriptor = getPipeInputForm(method.input_form, method.domain, pipeCode);

function RunPanel() {
  const form = useMethodForm({ descriptor, contract, uploadFile });
  return (
    <form onSubmit={(event) => { event.preventDefault(); if (form.attempt()) startRun(form.inputs); }}>
      <MethodForm form={form} locale="fr" presentation="app" disabled={running} />
      <button type="submit">Run</button>
    </form>
  );
}
```

## What the hook takes

| Option | What it is |
| --- | --- |
| `descriptor`, `contract` | The pipe's input-form descriptor and its `pipe_io_contracts` entry, the two wire artifacts `buildRunFields` takes. |
| `prepareFields` | A transform over the derived fields, applied before anything else reads them: narrowing a file slot with `narrowFileFormats`, dropping a child the host never sends. It must be stable (module-level or memoized), because the fields are re-derived when it changes. |
| `order` | Input names to show first, in that order. The rest keep their descriptor order after them, and a name no input has is ignored. |
| `initialValues` | What the form holds until its first edit. Absent, the method's seed (`seedInputs`). A function receives the seed and returns the values, for something the method cannot know, such as today's date. |
| `uploadFile` | `(file, { id, path }) => Promise<string \| { url, filename? }>`: stores a file and resolves to its URL. Its presence is the capability; without it every file field is link-only, as [upload-seam.md](upload-seam.md) describes. |

`initialValues` is read on every render until the first edit, and from the first edit the form owns its values. That is what lets a statically prerendered page seed today's date from the browser: the server render has no date, hydration supplies one, and the form shows the seed for that day until the person types. A restored run is the other common case: pass its values (from `runValuesFromStore`) and the form opens on them.

A different method is a different form. When the descriptor changes, remount with a new `key`: values belong to the inputs they were typed for.

## What the hook gives back

| Field | What it is |
| --- | --- |
| `fields` | The `RunField[]` the form renders, derived, prepared and ordered. |
| `values` | The current values, in the controls' own shape. |
| `inputs` | The values as a run takes them, from `apiInputsFromRunValues`: each input as `{ concept, content }`, an unfilled optional input left out, an empty plural input sent as `[]`. |
| `readiness` | `computeReadiness` over the values: `{ total, ready, missing }`. |
| `uploading` | Whether an upload is still in flight. |
| `ready` | Whether the run may start: every gating input filled and no upload in flight. |
| `attempted` | Whether `attempt()` has been called since the last reset. |
| `setValues(next \| updater)` | Replaces the values, or updates them from the previous ones. |
| `reset(values?)` | Goes back to `values`, or to the initial values, and forgets the attempt, the failed uploads and any upload still in flight, whose result is then dropped. |
| `attempt()` | The run button's press: it marks the attempt and returns `ready`. |

`ready` is the browser half of the run gate ([run-gate.md](run-gate.md)): readiness, the same predicates the server gate re-applies, plus the uploads, which only a browser has. The schema half, `gateRunInputs`, stays where it belongs, on the server: it carries ajv, which the `./react` entry never ships ([dependency-budget.md](dependency-budget.md)). A host that wants the schema verdict in the browser anyway calls it from the core entry over `rjsfDataFromRunValues(form.values, form.fields)`, and can show what it refuses through `MethodForm`'s `errors`.

A run button need not be greyed out until `ready`. A pressed button with something still missing can say what is missing: `attempt()` returns `false`, and every gating input still empty shows its mark where the person is already looking.

## What the component renders

`MethodForm` renders each input through `FieldRenderer`, with the input's name as its id, so a file's upload id is its value path, as the upload seam requires.

- **The top-level optional disclosure.** The empty optional inputs fold behind "+ N optional inputs", exactly as the empty optional fields of a structure fold behind "+ N optional fields", and closed optional structures fold with them. Expanding opens every closed optional structure with its seed; collapsing closes every one, so it leaves the run inputs ([architecture.md](architecture.md#optional-structures)). `foldOptional={false}` shows every input from the start; a closed optional structure still folds, because it has no control of its own and the disclosure is what opens it.
- **The marks.** After `attempt()`, a gating input still empty is marked `requiredField` ("Required"), and an optional input that was started but is incomplete is marked `incompleteField`: a started structure owes its concept every required field. A message in `errors`, keyed by input name, replaces either.
- **The uploads.** A file dropped on a field goes to `uploadFile`; the field shows its busy state while the upload is in flight, then the stored file, or `uploadFailed` when the upload rejects. Dropping another file at the same field clears the failure, and the newest file at a field wins over an older one still in flight.

Its props are the form's environment: `disabled` (while a run is in flight), `allowUrl` and `resolveUrl` (the upload seam's), `errors`, `foldOptional`, `className` for the stack the fields sit in, and three optional providers it mounts around the fields when given, `locale` and `strings` (`FieldStringsProvider`, [i18n.md](i18n.md)) and `presentation` (`FieldPresentationProvider`). Without them it reads the nearest providers above it.

## What stays the consumer's

The run button and what it does, the panel and its layout, the run history, a heading or an introduction, the choice of method, where files are stored (`uploadFile`), how a stored reference previews (`resolveUrl`), and anything specific to one method: which slot takes only PDFs, which child is never sent, what order a team fills the inputs in. Those last three are `prepareFields` and `order`, so a host states them as data and the form applies them.

## Relation to the story harness

`MethodForm` was promoted from `src/__stories__/case-form.tsx`, the harness every per-control story renders through. That harness stays: a control story drives states that a form owns itself (an upload in flight, a failed one, an error) from its arguments, which a real form must not take from outside. `Inputs/Method Form` holds the stories of the whole form.
