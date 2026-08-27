# The upload seam

The package never uploads anything. A file control takes a file from the user and hands it to the host; the host stores it and writes the resulting value back. That seam is three fields on `FieldEnv` and one rule about identity, and everything below is what each side owes the other.

```ts
<FieldRenderer
  field={field}
  value={values[field.name]}
  onChange={(v) => setValues(setValueAtPath(values, [field.name], v))}
  id={field.name}
  env={{
    onDropFile: (id, file) => upload(id, file),
    uploadingIds,          // ids currently in flight
    resolveUrl,            // a stored URI -> something a browser can render
    disabled: running,
  }}
/>
```

## The ID is a path, and that is the contract

`onDropFile` is handed the field's **ID**, and a host writes the result back at that path: `setValueAtPath(values, id.split('.'), uploaded)`. A row inside a list is `cvs.1`; a file inside a structure inside a list is `cvs.1.resume`.

Keeping the ID a path is a deliberate choice, because the alternative is worse. An opaque token would have to be resolved to a position at write-back time, which means the kernel keeping a live token-to-position registry for `setValueAtPath` to consult — turning a pure function of the value tree into a stateful one, in a core whose whole claim is that it has no hidden state.

The cost of that choice is that a path can go stale, and the package pays it where the staleness is created rather than asking the host to.

**The DOM id is derived from the path, not equal to it.** The two used to be the same string, which is a collision waiting to happen: a path is unique within one form and an `id` attribute must be unique within the whole _document_, so two forms whose methods both declare an input named `text` emitted two `id="text"`. Per HTML a `<label for>` binds the first matching element in tree order, so the second form's label bound to the first form's control and its own input was left with no label at all — a screen reader announcing the placeholder in place of the field's name. Making the path unique instead was not available: it is the write-back address, and prefixing it would land uploads at the wrong place in the value tree and stop `uploadingIds` matching. So the path stays exactly what this page describes, and only the DOM write is namespaced, by `useFieldDomId` inside each control. A host keeps passing `id={field.name}` and keeps writing back with `id.split('.')`; nothing on this page changes for it.

## While a file is arriving, nothing else may touch that value

`uploadingIds` is not a spinner hint. It is the statement that **an ID in that set is mid-flight, and the control for it is shut** — which is what lets a host drop the staleness tokens it would otherwise need.

That has to mean every door into the value, and it did not always:

- the dropzone,
- the "paste a URL instead" toggle **and the URL input behind it** — leaving these live let a user paste a URL over a file that was still arriving, and let a host's started (and billed) run be abandoned client-side,
- **removing a row from the list the upload is in.** Removal renumbers every row after it, so the write-back would land on whichever row moved into that position — silently, with the form still looking correctly filled. For a batch pipe that is one candidate evaluated against another candidate's document.

`ListField` reads the set by **prefix** (`cvs.`), not by exact match, because the busy row is not always the list's own row: a list of documents uploads at `cvs.1`, a list of structures holding one uploads at `cvs.1.resume`. The dot is what keeps the test off a sibling input called `cvs_extra`.

**Add stays available during an upload, on purpose.** Appending leaves every existing index where it is, so an in-flight write-back is unaffected, and freezing it would make filling a list of files needlessly serial.

## A row is a thing, not a slot

Beside the positional ID, each list row carries a generated React key, minted when the row appears and travelling with it. It is never rendered, never put in an ID and never leaves the control — it exists so React moves the surviving rows when one is removed instead of renumbering them into each other, which used to carry a row's own state (a caret, a scroll offset, an open URL toggle) onto its neighbour's value.

It is worth being precise about what that buys, because it is tempting to think it also fixes the write-back. It does not: the keys live in the control's state, not in the value, so a host that replaces `values` wholesale reconciles by length exactly as positions do. A stable identity covers the reorderings the **kernel** performs, and the kernel performs one — removal — which is the one the busy rule blocks.

## `resolveUrl`, and when it is not needed

A stored value is a `pipelex-storage://` URI the browser cannot render, so a preview asks the host to turn it into something viewable. It is called **lazily**, only when the user opens the preview, so a closed field never fetches a presigned URL.

It is not needed for a URL the browser can already render — `http(s):`, `data:` and `blob:` are used directly. `data:` used to fall through to the resolver path, so a host that passed no `resolveUrl` got a spinner that never stopped over a value the browser could have painted immediately.

The result is **bound to the URI it was resolved from**, the same way the local preview below is bound to the value it is the preview of — one rule, applied to both sources a preview can come from. A cached source with no record of its provenance is painted under whatever name the value carries next: when an open preview moved between two storage URIs, the chip named the new file over a preview still showing the old one, and it stayed there until the next resolution landed. Keeping the URI beside the source makes that impossible by construction rather than briefly wrong — clearing it from an effect would still paint one frame of the old file, which is why the check is computed in render.

A resolution that **fails** leaves the spinner rather than the file before it, and is caught rather than left to escape as an unhandled rejection into the host's app. `resolveUrl` is a network call, so rejecting is ordinary; the viewer shows the same thing it shows for a resolver that answers `null`.

## What the control decides it can preview

A file is previewable when the **filename** or the **URL** says so, tested separately. They used to be concatenated into one string and matched with an end-anchored extension test, which made the filename half dead code — a filename's extension was always followed by a space — so a value with a good filename and an extension-less URL (an opaque storage id, a `data:` URL) was offered no preview at all. A `data:` URL's declared MIME type is read too, since it is the only type such a URL carries.

## The local preview belongs to the value it was made for

Dropping a file shows it immediately, from an object URL, because the value the host writes is not something a browser can render. That preview is **bound** to a value: the control cannot know the URL at drop time — the host assigns it — so it adopts the first URL to appear once the upload is no longer in flight, and retires itself when the value changes to a different one.

Without that binding the object URL won unconditionally and was cleared only by the control's own clear button, so a host writing a different file at the same path (a "use this sample" shortcut, a reset, a value restored from elsewhere) got a chip naming the new file over a preview showing the old one. `uploadingIds` is what makes the adoption exact; a host that does not report it falls back to "the first URL to appear", which for an empty field dropped into is the same moment.

## Accessibility of the dropzone

The tab stop is the `<input type="file">` itself, named by the field's label through `FieldShell`'s `htmlFor`. The visible dropzone stays `role="presentation"` and takes no focus.

That is the opposite of react-dropzone's default, which puts `tabIndex: 0` and its own key handlers on the presentational div and leaves the input at `tabIndex: -1` — so the element a keyboard or voice-control user lands on is a generic with no role and no name. Giving that div a `role="button"` and a label of its own was the other option and was rejected: it would put a second named control in the accessibility tree for one value, when a file input already has exactly the right role and only ever lacked a name. Because the input is clip-hidden, the focus ring is drawn on the root with `focus-within`.
