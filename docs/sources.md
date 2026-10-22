# The file and example sources

Beside the upload ([upload-seam.md](upload-seam.md)), a form has two more optional ways to take a value from its host, and like the upload the package performs neither itself:

- **A file source** lists files the host already stores. Every empty file field then offers "Choose from your team's files", and the file chosen is written into the field exactly as an upload's result is.
- **An example source** lists saved examples of the method. The form then offers "Fill with an example", which sets every value at once and never starts a run.

The kernel states the shapes (`src/core/sources.ts`, exported from `.` and re-exported as types from `./react`) and applies the answers; the controls are `./react`'s. Neither knows any platform's routes, records or permissions: a host maps its own lists onto these shapes. A host that gives neither seam gets the form it had before, with nothing added.

```tsx
import { MethodForm, useMethodForm, type ExampleSource, type FileSource } from '@pipelex/mthds-form/react';

const fileSource: FileSource = {
  initialScope: 'mine',
  list: async ({ search, scope, mediaTypes, cursor, signal }) => {
    const page = await host.listFiles({ search, scope, mediaTypes, cursor }, { signal });
    return {
      files: page.items.map((item) => ({
        id: item.id,
        url: item.uri,
        name: item.filename,
        mediaType: item.media_type,
        size: item.size,
        kind: item.is_test ? 'test' : item.kind,
        createdAt: item.created_at,
        origin: item.origin_label,
      })),
      nextCursor: page.next_cursor,
    };
  },
};

const exampleSource: ExampleSource = {
  list: async ({ cursor, signal }) => {
    const page = await host.listExamples(methodId, { cursor }, { signal });
    return { examples: page.items, nextCursor: page.next_cursor };
  },
  // Given only to a person allowed to change the method's examples.
  rename: canEdit ? (example, name) => host.renameExample(example.id, name) : undefined,
  delete: canEdit ? (example) => host.deleteExample(example.id) : undefined,
  hideWhenEmpty: !canEdit,
};

const form = useMethodForm({ descriptor, contract, uploadFile, fileSource, exampleSource });
```

Both are read on every render, so a host may build them inline; a `list` is called again only when the sheet asks for a page.

## The file source

```ts
interface FileSource {
  list: (query: FileSourceQuery) => Promise<FileSourcePage>;
  initialScope: 'mine' | 'everyone';
}
```

`initialScope` is which side of the Mine and Everyone switch the sheet opens on, and it is the host's to choose: who the person is decides what they most likely want, and the package cannot know who they are. What "mine" means is the host's too (files the person uploaded, and files their own runs made, for instance).

### What the sheet asks for

| Query field | What it is |
| --- | --- |
| `search` | What the person typed, trimmed; empty when they typed nothing. The sheet asks again a short pause after typing stops, not on every key. |
| `scope` | `'mine'` or `'everyone'`, the switch's position. |
| `mediaTypes` | The MIME types the field accepts, after any narrowing the host applied with `narrowFileFormats`, in the field's own order. **The answer must hold only files of these types**: the field writes the choice without inspecting it, and a field that refuses a dropped file of another type must not be handed one this way. |
| `cursor` | Absent for the first page, otherwise the previous page's `nextCursor`. |
| `signal` | Aborted when the answer is no longer wanted: a newer search, the other scope, a closed sheet. A host passes it to its fetch; an answer that arrives anyway is ignored. |

### What it answers

A page is `{ files, nextCursor }`, the files newest first. `nextCursor` absent or `null` means the page is the last. A page may be empty and still carry a cursor, as a host filtering after paging can produce: the sheet then asks for the next page by itself, and stops at a cursor it has already read from, so a host whose cursors go round in a circle cannot keep it asking.

| Row field | What it is |
| --- | --- |
| `id` | The row's identity in the host's list. A choice is kept by it, so it must be unique within the list. |
| `url` | The stored file's address (a `pipelex-storage://` URI, or any URL the runtime reads), written into the field as the value's `url`. Several rows may share one. |
| `name` | Shown on the row, and written into the field as the value's `filename`. |
| `mediaType` | Names the row's format the way the field's hint names it. Without it, the format is read from the name's extension. |
| `size` | Bytes, shown as a size. |
| `kind` | `'uploaded'`, `'generated'` or `'test'`. A test file's second line starts with "Test file", so a person never mistakes a file made to try a method for a real one. |
| `createdAt` | An ISO 8601 timestamp, shown as a date ("Today, 10:42", "Yesterday", "17 Oct", or with the year when it is not this one). |
| `origin` | Where the file came from, in the host's words ("Uploaded by Ana", "Made by Invoice check"), shown as it is. |

The row's second line joins what is known, in that order: "Test file · PDF · 340 KB · Uploaded by Ana · 14 Mar 2025". A rejected `list` shows the failure with Try again.

### Where the form offers it

- **An empty file field** shows "Choose from your team's files" as a full-width row under its own controls, the dropzone and the link. Like the dropzone it is there only while the field holds no file, and it is shut while a file is arriving. Its accessible name carries the field's label.
- **A field whose only way in is the team's files.** A file source is a way into a file value of its own, so a host may offer only the files it stores: no `onDropFile` and `allowUrl` set to `false`. The field then shows its format hint and the row, which its label names, and nothing about uploading or pasting. Without a file source, that configuration is still a host's error, and the field throws ([upload-seam.md](upload-seam.md)).
- **A list of files** (a list whose item is a document or an image) also shows the row under Add item, and its sheet takes several files at once. The files fill the rows the person added and left empty first, then follow the last row, so a bounded list's room is its bound less the files it holds (`roomForChosenFiles`), not less its rows. The row is shut while a file is arriving anywhere in the list, as the remove buttons are, since the row that file will be written back to is still empty. Each empty row of the list still offers its own, which fills that row with whatever is chosen: the duplicate check belongs to the list's sheet, so a row's own sheet may put in a file the list already holds, as dropping or pasting the same file twice may. A list of structures that hold files has no list-level row, because a file is not a structure: each nested file field offers its own.
- **Upload a file**, offered when the person has no file of the field's formats, closes the sheet and opens the field's own file dialog. It is offered only where the field can upload, so the list-level sheet, which has no single field to upload into, never offers it.

### The sheet

"Your team's files" is a bottom sheet below 1280px (full width, rising from the bottom edge, with a handle a touch can swipe it down by) and a dialog from 1280px, centred and at most 560px wide. Under its title a line names what the field takes ("Showing PDF files, which this input takes"), then come the search, the Mine and Everyone switch, the rows, and one primary button at the foot.

A row is chosen by a tap: a single field's rows are radio buttons, a list's are check boxes. A chosen row shows a faint fill and a check and says so with `aria-checked`. The choice is kept across searches and across the switch, so a person can search for one file, then another, and use both. The button is disabled until something is chosen, and names what it will do: "Use INV-2291.pdf", or "Use 3 files".

Use writes the choice and closes the sheet. Closing it any other way (the close button, Escape, the backdrop, a swipe) changes nothing, and each opening starts on a fresh choice. Focus goes back to the row that opened the sheet, which `FilePicker` takes as `returnFocusTo` (without it, to whatever held focus as the sheet opened). After a file is used in a single field, focus moves to the file's card instead, since the row is gone with the empty state.

### What a choice writes

A single field is written `{ url, filename }` through its own `onChange`, the value an upload's result writes, and a typed link or the preview of an earlier dropped file is left behind as it would be by an upload. A list takes one row per chosen file through `addChosenFiles`: its empty rows first, in order, then new rows after the last. It never writes an address the list already holds and never writes one address twice. These functions are the kernel's (`sourceFileValue`, `addChosenFiles`, `roomForChosenFiles`), so the rules are tested in node and a host rendering its own control can apply the same ones.

## The example source

```ts
interface ExampleSource {
  list: (query: { cursor?: string; signal: AbortSignal }) => Promise<{ examples: FormExample[]; nextCursor?: string | null }>;
  rename?: (example: FormExample, name: string) => Promise<FormExample | void>;
  delete?: (example: FormExample) => Promise<void>;
  hideWhenEmpty?: boolean;
}

interface FormExample {
  id: string;
  name: string;
  inputs: Record<string, unknown>; // the run-input shape
}
```

An example's `inputs` are a run's inputs: each `{ concept, content }`, an optional input left out, an empty plural input a bare `[]`, which is what `form.inputs` holds. So a host saves an example from the inputs a run was started with and hands it back as it stored it. `runValuesFromInputs(inputs, fields)` reads them back into the controls' shape; an input no field takes is ignored, and a field the example says nothing of is left empty.

### Filling the form

A host that prefills the form itself (a past run's inputs, a value it knows) gives those values through `initialValues` or `reset`, never `setValues`: the form counts what arrives through `setValues` as the person's own work, and would ask before an example replaced it.

"Fill with an example" sits above the fields and opens the examples as a sheet below 1280px and a dialog from 1280px. Choosing one fills the form and closes the list. Filling replaces every value, as `reset` does, and like `reset` it forgets the attempt and any upload in flight; it never starts a run.

A form held shut (`disabled`, as a host holds it while a run is in flight) shuts every surface the sources opened: an open examples list, the question before a replace, a rename or a delete, and an open sheet of the team's files all close, writing nothing. The sheets are modal, so this only matters when a host disables the form by itself, but nothing in them writes to the form once it is.

A form the person has worked on is asked first: "Replace what you entered?", with Replace and Cancel. Cancel leaves the form exactly as it was and the list open. The form counts as worked on when it holds a value that would send a different run from the one it was last given (its initial values, or the last `reset` or fill), or while a file is arriving; a value typed and erased again does not count, nor does an optional structure opened and left empty, because neither changes the run. `useMethodForm` reports this as `touched`, through `sameRunValues`, and a host holding its own values can compare them the same way.

### The examples list

The list is read again each time it opens, since an example may have been saved since. The rows are in the order the host gives them. When deletes empty the rows read so far while the host has more, the next page is read at once, so the list says it has none only once it has been read to its end.

`rename` and `delete` are capabilities: each is offered on a row's menu only when given. Rename opens a dialog on the example's name; Save is disabled while the name is empty once trimmed, reads "Renaming…" while the host works, and a failure keeps the dialog open with the new name, says so, and turns Save into Try again. Resolving to the example as stored replaces the row, matched by the id it had, so a host that answers a renamed example under a new id still updates it; resolving to nothing keeps it under the new name. Delete asks first, and only Delete in that question calls the host; a failure keeps the question open with Try again, and success removes the row.

With no example, the list says how to make one: "No examples yet. Run it, then save the run as an example." That suits a person who can save one. For a person who cannot, a host sets `hideWhenEmpty`: the form then reads the list as it mounts, following it past empty pages, and offers "Fill with an example" only once the method is known to have one. It reads the list again each time the examples close, so a delete that took the last one takes the control with it, and while that read is under way the control keeps its last answer rather than blinking out. The open list never vanishes under the person, whatever they delete in it. A failure to read still offers the control, so the failure is shown rather than hidden. When the list closes on the method's last example, the control goes as the list closes, and focus moves on to what follows it on the page, the form's first field as a rule.

Focus goes back where the person was. Closing the examples returns it to "Fill with an example"; keeping what was entered at "Replace what you entered?" returns it to the example that asked; cancelling a rename or a delete returns it to that row's menu button, a rename to the renamed row's, and a delete to the row that took the deleted one's place, or to the close button when none is left.

## The states

Each list has one polite status line (`role="status"`) that announces what it shows, read once per change rather than once per row.

| State | The team's files | The examples |
| --- | --- | --- |
| Loading the first page | Dim placeholder rows; the status says it is loading. | The same. |
| The first page failed | "Couldn't load your files." with Try again. | "Couldn't load the examples." with Try again. |
| Nothing at all | On Everyone, "Your team has no PDF files yet."; on Mine, "You haven't added or made any PDF files yet." with "Show everyone's". Either offers "Upload a file" where the field can upload. | "No examples yet. Run it, then save the run as an example.", or no control at all under `hideWhenEmpty`. |
| A search matched nothing | "No files match." with "Clear search". | No search. |
| More to come | "Show more" under the rows. | The same. |
| A later page failed | The rows stay; under them "Couldn't load more." with Try again. | The same. |
| The end of the list | Nothing under the last row. | The same. |

## A host rendering its own form

`MethodForm` mounts both from `useMethodForm`'s options. A host that renders the fields itself, around `FieldRenderer` and its own values, threads them through the same pieces:

- **`FieldEnv.fileSource`** carries the file source to every file field and list `FieldRenderer` renders, as `onDropFile` carries the upload.
- **`<FillWithExample source fields touched onFill />`** is the example control on its own. `onFill(values, example)` receives the example's values already in the controls' shape; the host sets its values to them, and passes `touched` from its own comparison (`!sameRunValues(values, lastGiven, fields)`).
- **`FilePicker` and `FilePickerEntry`** are the sheet and its row, for a host drawing a file control of its own.

## What stays the host's

Which files and examples exist and who may see them, what "mine" means, which scope a person starts on, which files are test files, how pages are cut, saving an example (from a run's inputs) and who may rename or delete one. The package lists, chooses, writes and asks; it never fetches, stores or decides who may.
