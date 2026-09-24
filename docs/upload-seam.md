# The upload seam

The package never uploads anything. A file control takes a file from the user and hands it to the host; the host stores it and writes the resulting value back. That seam is `FieldEnv`'s `onDropFile`, `uploadingIds`, `resolveUrl` and `allowUrl`, and one rule about identity, and everything below is what each side owes the other.

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
    allowUrl: true,        // the default: a link may be pasted instead
    disabled: running,
  }}
/>
```

## Which ways into a file value a host offers

A file value has two ways in, and each is offered exactly when the host can honour it:

- **An upload**, offered exactly when the host supplies `onDropFile`. The presence of the callback is the capability; there is no second flag to keep in agreement with it.
- **A link**, offered unless the host sets `allowUrl` to `false`.

| `onDropFile` | `allowUrl` | What the control renders |
| --- | --- | --- |
| supplied | absent or `true` | The dropzone, and the "paste a URL instead" toggle under it. |
| supplied | `false` | The dropzone alone. No toggle and no link input, ever, including while a file is attached. |
| absent | absent or `true` | **Link only.** No dropzone and no file picker. The link input is already open, above it one line saying a file cannot be uploaded here and a link to it can be pasted instead (`uploadUnavailable`), and under that line the slot's format hint, because the link still has to point at a file the runtime can read. |
| absent | `false` | **A host's configuration error.** The control throws while rendering, naming the field's id path. |

The link-only row is a fix. A file field used to render an armed dropzone whatever the host supplied, so a host with no upload path got a control that opened the file picker, took the file, handed it to a callback that did nothing and stayed empty with nothing said; a required field then kept the run shut with no reason given. A disabled dropzone with a message was the other option and was rejected, because a disabled dropzone reads as "busy, try again", which is what the control shows during an upload, and it would still advertise a way in that does not exist.

The details of the link-only control are where its accessibility is decided:

- **The line stands where the dropzone would, for as long as it would.** It shows while the field holds no value, and the file card replaces it once a link is typed, as the card replaces the dropzone.
- **The link input carries the field's DOM id**, so the label `FieldShell` renders binds to a control that exists. It keeps its `fileUrlAria` name, which says what the input is for, and it is described by the line while the line shows.
- **It does not take focus on mount.** Behind the toggle it takes focus when the toggle opens it, which is right; rendered from the start, the same attribute would pull focus into the form on page load, and on a form with several file fields the last one would win.
- **The busy rule below still holds.** While the field's id is in `uploadingIds`, the link input is shut like every other way in.

**`allowUrl` governs the link input and nothing else.** A file value is a URL whichever way it arrived, so the key says nothing about which values are valid: a web link a host writes into a field whose link input is off still shows on the card and can still be cleared, because hiding a way in is no reason to hide a value.

**It is form-wide, like the upload.** Both ways in are capabilities of the host rather than facts about a slot. A per-slot switch, if one is ever needed, would be a `RunField` transform in the manner of `narrowFileFormats`, and adding it later breaks nothing.

**A host that offers neither way in gets a thrown error, not a rendered one**, the way `narrowFileFormats` reports a slot left accepting nothing: `The file field at "cvs.1" has no way in: …`, naming the id path the host would write back to. Rendering a field that can never be filled instead would ship a developer's message to an end user, and on a required field it would keep the run shut in silence, which is the failure this rule exists to remove. The check runs per rendered file field rather than once per form, so a host that switches links off and never uploads can still render every method that has no file input.

**The rule is `FieldRenderer`'s, so it holds everywhere a file field renders**: in a record, in every row of a list, on a produced layout through `MthdsField`, and in a `DocumentField` or `ImageField` a host composes directly, which takes `onDropFile` and `allowUrl` as props with the same meaning.

## What a slot accepts is one list, and a host narrows it once

Every `document` and `image` field carries `formats`, the list of formats that slot accepts. `buildRunFields` stamps it from the kind's table in `file-formats.ts`, which holds everything the runtime can decode for that kind and records how it was measured ([storybook.md](storybook.md#what-a-file-slot-accepts) has the table). The wire says nothing about it, because which bytes a runtime can decode is a property of the runtime and not of the method.

The file control reads that one list in three places: the hint under the dropzone, the filter it hands the operating system's file picker, and the check a picked or dropped file must pass before `onDropFile` is called. When a file is refused, the message names the same list. The three used to be computed apart, the hint from a label on the field and the other two from the kind's table, so a host that rewrote the label moved the hint alone and the picker went on offering files its own server would refuse after the upload had been asked for.

**A host whose upload path takes less than the runtime can decode narrows the field tree once**, with the same list its server checks uploads against:

```ts
import { buildRunFields, narrowFileFormats } from '@pipelex/mthds-form';

// The one list: the form is narrowed with it, and the server's upload check reads it too.
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

const fields = narrowFileFormats(buildRunFields(descriptor, contract.inputs), ALLOWED_MIME_TYPES);
```

- **One list serves every slot.** It is intersected with each slot's own formats, so the list above leaves a document slot with PDF, JPG and PNG and an image slot with PNG and JPG. A host never writes a list per slot, and narrowing never widens one: a MIME type the slot's kind cannot take is not in the intersection. Each slot keeps its table's order, and MIME types are compared without parameters and case-insensitively, as the check compares them.
- **It walks the whole tree**, into records and list items, so a file three levels down is narrowed like one at the top.
- **It throws when a slot would be left accepting nothing**, naming the field by its path (`cvs[].portrait`). A dropzone that refuses every file is a host's configuration error, and the form should fail where the host can see it rather than render a control that cannot be used. A file field left with no way in at all, with no `onDropFile` and `allowUrl` set to `false`, is the other configuration error a host can make with a file field, and it is reported the same way (see above).
- **It never mutates what it is given.** File slots, records and lists come back as copies, and every other field as the same object.

It lives in the core entry rather than on `FieldEnv` so that a host's server, which renders no control, can import the list's one definition and hold the same answer as its form. A server that has the narrowed field can apply the control's exact check with `isAcceptedFile(field.formats, file)`. It reads `RunField`, the kernel's own output, and never touches JSON Schema, so the two schema walks [architecture.md](architecture.md) allows stay the only two. Nothing on the wire changes, and neither does the value a file field holds.

## The ID is a path, and that is the contract

`onDropFile` is handed the field's **ID**, and a host writes the result back at that path: `setValueAtPath(values, id.split('.'), uploaded)`. A row inside a list is `cvs.1`; a file inside a structure inside a list is `cvs.1.resume`.

**One page mints its ids differently, and a host rendering one must not use the line above.** A produced layout binds to a JSON Pointer in a state store rather than to a value tree, so `MthdsField` mints `gen-inputs-request-city` from `/inputs/request/city` and the write-back address is recovered with `pathFromDomId`, not with `id.split('.')`. Everything else on this page holds unchanged — the same `FieldEnv` fields, the same rule that the id is derived from the address and not equal to it. See [the generative layer](generative-ui.md) § "Uploads, which arrive by a different id here".

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

**A host with no resolver gets the "cannot be shown" state, never a spinner.** The preview is pending only while a resolver exists and has not answered for the value on screen. It used to ask only whether an answer had landed, and with no resolver none ever does, so opening the preview over a stored reference spun forever unless the host passed an identity resolver to reach the placeholder. A host that cannot resolve its references passes no `resolveUrl` and needs no workaround.

It is not needed for a URL the browser can already render — `http(s):`, `blob:` and an allow-listed `data:` are used directly. `data:` used to fall through to the resolver path, so a host that passed no `resolveUrl` got a spinner that never stopped over a value the browser could have painted immediately. Which is why what reaches the resolver is keyed on the value being a REFERENCE rather than on the gate having refused it: a `data:` URL carries its own bytes, so no resolver can resolve one, and a `data:` type outside the allow-list is refused rather than pending. The preview says so — a reference nothing can render shows the same "cannot be shown" state a broken image does, where a spinner would claim a load that was never going to finish.

**What a resolver returns is judged by the same gate as any payload member.** A resolver is trusted to know where a host's objects live, not to be a way past the URL policy: its answer goes through `viewableUrl` like everything else — in the result view, where the next candidate is then tried, and in this control, where the preview is refused rather than painted. Two consequences worth knowing when you write one. Return the URL you mean to be used — the gate hands the sinks its own normalised string, so a leading space or an internal tab in your answer is stripped before anything acts on it. And a resolved URL is **framed** for a previewable document, which for a root-relative path means framed at the host's own origin: serve stored objects with their real content type, or with `Content-Disposition: attachment`, so an object that happens to hold markup is not a document running on your origin.

**That last one is a privilege only a resolver has.** A same-origin path is admitted to the frame only when the resolver produced it; a payload member naming the same path is refused, because a payload choosing a path on the host's origin is choosing to run there. See [The URL policy](result-view.md#the-url-policy).

The result is **bound to the URI it was resolved from**, the same way the local preview below is bound to the value it is the preview of — one rule, applied to both sources a preview can come from. A cached source with no record of its provenance is painted under whatever name the value carries next: when an open preview moved between two storage URIs, the chip named the new file over a preview still showing the old one, and it stayed there until the next resolution landed. Keeping the URI beside the source makes that impossible by construction rather than briefly wrong — clearing it from an effect would still paint one frame of the old file, which is why the check is computed in render.

A resolution that **fails** leaves the "cannot be shown" state rather than the file before it, and is caught rather than left to escape as an unhandled rejection into the host's app. `resolveUrl` is a network call, so rejecting is ordinary; the viewer shows the same thing it shows for a resolver that answers `null`. Both are recorded as the resolver's answer for that URI, because a refusal is an answer: they used to be recorded as no answer at all, which left the spinner waiting on a resolver that had already replied. Closing and reopening the preview asks the resolver again, and the refusal is forgotten when it does, so the retry shows the spinner until its own answer lands.

## What the control decides it can preview

A file is previewable when the **filename** or the **URL** says so, tested separately. They used to be concatenated into one string and matched with an end-anchored extension test, which made the filename half dead code — a filename's extension was always followed by a space — so a value with a good filename and an extension-less URL (an opaque storage id, a `data:` URL) was offered no preview at all. A `data:` URL's declared MIME type is read too, since it is the only type such a URL carries.

## What the card says under a file's name

Once a file is attached, the control shows a card: the filename as its title, or "Attached file" (`uploadedFile`) when the value carries none, and a subtitle under it. What the subtitle says depends on what the value holds, because each case means something different to the person looking at the card:

- **A `data:` URL** is the file itself, so the subtitle names its format and decoded size (`PDF · 36 KB`) rather than printing the base64.
- **An `http` or `https` URL, or text with no scheme at all** (`example.com/brief.pdf`), is a link the person can read, usually one they typed or pasted, so it is shown back to them as it is.
- **Any other reference in `app`**, a `pipelex-storage://` URI above all, is an address only the host can resolve. The subtitle shows the format the filename's extension names when that is one of the slot's `formats`, and nothing otherwise. The person who just chose the file has no use for its storage address, and printing it is how one reached an end user's screen under every photo they uploaded.
- **Any other reference in `studio`** stays printed, because a builder may need the address itself.

The presentation comes from `FieldPresentationProvider`, the same switch the labels follow. The result view's file reference is unaffected: it already names a file by its filename and keeps the reference in its tooltip and behind its copy control ([result-view.md](result-view.md)).

The two default strings on this path name no storage scheme either. The URL a person may paste instead of uploading asks for `https://…` (`urlPlaceholder`), and a host whose runner also takes its own storage references can say so by overriding it.

**The link input follows the card's rule.** It can be open while a stored file is the value: opened after the file was attached, left open through an upload, or written into by the host. In `app` it therefore shows a value only when that value is a web link, carries no scheme at all, or is the text the input itself typed, and it is empty over any other reference, so a `pipelex-storage://` address never appears there either. The typed-text clause is what keeps typing intact, since `https:` on its way to `https://…` carries a scheme and is not yet a web link. The scheme-less clause is what survives a remount, when the control no longer knows what it typed: without it, a link typed as `example.com/brief.pdf` would be blanked in the input and absent from the card, whose title is only "Attached file" when there is no filename, so it would be submitted while visible nowhere. In `studio` the input shows the value as it is.

One limit is accepted. A scheme-less value with a port, such as `localhost:3000/x`, reads as having a scheme, because `localhost:` is valid scheme syntax, so after a remount it is hidden in `app` like a stored reference until the person types it again or adds `https://`.

## The local preview belongs to the value it was made for

Dropping a file shows it immediately, from an object URL, because the value the host writes is not something a browser can render. That preview is **bound** to a value: the control cannot know the URL at drop time — the host assigns it — so it adopts the first URL to appear once the upload is no longer in flight, and retires itself when the value changes to a different one.

Without that binding the object URL won unconditionally and was cleared only by the control's own clear button, so a host writing a different file at the same path (a "use this sample" shortcut, a reset, a value restored from elsewhere) got a chip naming the new file over a preview showing the old one. `uploadingIds` is what makes the adoption exact; a host that does not report it falls back to "the first URL to appear", which for an empty field dropped into is the same moment.

## Accessibility of the dropzone

The tab stop is the `<input type="file">` itself, named by the field's label through `FieldShell`'s `htmlFor`. The visible dropzone stays `role="presentation"` and takes no focus.

That is the opposite of react-dropzone's default, which puts `tabIndex: 0` and its own key handlers on the presentational div and leaves the input at `tabIndex: -1` — so the element a keyboard or voice-control user lands on is a generic with no role and no name. Giving that div a `role="button"` and a label of its own was the other option and was rejected: it would put a second named control in the accessibility tree for one value, when a file input already has exactly the right role and only ever lacked a name. Because the input is clip-hidden, the focus ring is drawn on the root with `focus-within`.

The URL input behind "paste a URL instead" is named too, by `fileUrlAria`, which is given the field's label as the form shows it: "Link to the file for cv" in `studio`, "Link to the file for Cover letter" in `app`, and "Link to the file" in a list row. When the host uploads, the field's label is bound to the file input, so this input used to have no name at all, and its placeholder was the only thing a screen reader announced there. When it does not, there is no file input, and the label is bound to this input instead; its `fileUrlAria` name still says what it is for.

**A list row's controls do not have distinct names yet.** The list drops each row's label to avoid repeating the field's name on every row, and the row number it shows instead is a bare glyph tied to no control. So every row's link input currently carries the same generic name, and the file input inside a row carries none at all. Giving each row a name of its own is a change to the list control that is tracked separately.
