# Stored values

A `Text`, `Markdown`, `Html` or `JSON` value may live in the run's storage rather than in the payload. A runtime stores such a value by itself once it passes a size threshold, wherever it is produced or received: a run's inputs when it starts, a model's text, the pages an extraction returns. The value then travels as a reference, exactly as an image or a document does, and the form and the result view have to read both forms. A concept that refines one of these natives behaves the same.

## The two forms

A value holds exactly one of them, never both and never neither:

```json
{"text": "The parties agree…"}
{"url": "pipelex-storage://…/generated/…/value.txt", "size": 48213, "mime_type": "text/plain", "preview": "The parties agree…"}
```

The inline form holds the value under the property the concept names: `text` for `native.Text` and `native.Markdown`, `inner_html` for `native.Html`, `json_obj` for `native.JSON`. The stored form leaves that property out and carries `url` instead, with three facts that describe the value without reading it: its `size` in bytes as stored, its `mime_type`, and a `preview`, which is always the true start of the value. An HTML page keeps its `css_class` inline in both forms.

The schemas say so. Each of these content models declares the value property and the four reference members, all optional, so `TextContent` no longer declares the single property the kernel used to unwrap a text by.

## Read by concept

`src/core/stored-value.ts` is the one place that knows these natives. `storedValueKeyOf(node)` reads the node's `concept_ref` and `refines`, as every native predicate in `native-content.ts` does, and answers the property the value sits in, or `undefined` for every other concept; a `list` node answers no and its `item` answers for itself. `readStoredReference(node, value)` then reads the documented stored form off a value of that concept, `{url, size, mimeType, preview}`, and answers `undefined` for an inline value. A value holding both forms is read as inline, the form a reader can show without loading anything.

That order is the point. The concept says what the value is, and only then is the stored form read: asking the value which form it holds before knowing what it is would be the shape sniffing [derivation-swap.md](derivation-swap.md) records deleting, and the MTHDS standard rules the same way, telling a stored text from a file by the concept the contract names at that path, never by its URL or its MIME type.

The same concept gives a text field its `contentKey`. `buildRunFields` and `buildResultField` read the property off the concept and keep it only when the field's schema declares it, so a structure's member that names `native.Text` but is a bare string on the wire keeps no key; every other text, number and yes-or-no still takes the single property its schema declares.

## The host's loader

Reading a stored value is the host's: it knows how its storage is authorised. It supplies one function:

```ts
type LoadText = (url: string) => Promise<string>;
```

It is called with the reference's `url`, and resolves to the text as stored, a JSON value's serialized form included, or rejects when the text cannot be read. It is asynchronous, unlike `ResolveUrl`, because a text is read rather than painted: there is no element a URL could be handed to, so the host fetches the bytes itself, through a signed link or its own assets route. A host gives the same function to both halves:

```tsx
<ResultEnvProvider resolveUrl={resolveUrl} loadText={loadText}>
  <StuffViewer field={field} value={value} />
</ResultEnvProvider>

<MethodForm form={form} loadText={loadText} />
```

`ResultEnvProvider` asks each url once and shares the answer among every node and download beneath it; a failed answer is forgotten, so a view mounted later asks again. The view asks only for a value it shows, so a host whose panel mounts a result when a person opens it loads a stored value when it is opened.

## In a result

`ResultField` asks for a stored reference before every other arm. A stored value shows its `preview`, as written and followed by an ellipsis, with a line under it saying what it is: the start of a stored text of its size when the host supplies no loader, the whole text being loaded while the loader works. Once the loader answers, the text becomes the value's inline form (`inlineStoredValue`) and the same node draws it, so a loaded text is typeset and offers its copy control, a loaded HTML page is framed with its downloads, and a loaded JSON value is drawn as its record, each exactly as if it had arrived inline.

A load that fails, a loader that throws, or a text that is not a value of the concept (a JSON text that is not an object, which the runtime refuses too) shows the reference's description instead: the stored text of its size could not be loaded, then its start. The view never shows an error that takes it down.

A list of texts holding a stored one draws one entry per line, each through its own node, since a chip or a line cannot show a value loading. The whole-result download in `StuffViewer` loads every stored value the result holds first (`loadStoredValues`), so the file holds the texts the reader saw; a value that does not load keeps its reference in the file. The JSON view shows the value as it arrived.

## In the form

An input may hold a stored value too: a run's large input is stored when the run starts, and a host that hands a run's inputs back to the form to run again hands back the reference. The reference is a value the runtime takes, so the form keeps it. `runValuesFromInputs`, `runValuesFromStore` and the value bridge leave it untouched, readiness counts it as filled (a stored HTML page holds none of the members its inline form requires and is filled all the same), the gate passes it, and `apiInputsFromRunValues` sends it back as `{concept, content: reference}`. In the store's simplified form, a stored `native.Text` is written in that explicit form too, since its bare string form is the text itself.

`FieldRenderer` draws such an input with `StoredValueField`, whatever its kind: what it holds (a stored text of its size), its start, and two ways out. "Edit the text", offered when the host supplies `loadText` (`FieldEnv.loadText`, `MethodForm`'s `loadText`), loads the text into the field's own control, where it is edited and sent inline; a text the loader cannot read leaves the reference in place and says so. "Replace" empties the field for another value.

## Not covered

A table cell, a chip and a composite's member draw a stored value as the structural arms draw any object, because only a node knows its concept. String members of a structure are always inline, so a cell meets one only through a member whose own concept is a stored native. `StuffViewer`'s whole-result treatment of an HTML page (its title row and its "Download PDF" beside the panel's title) applies to a page that arrived inline; a stored page shows those controls inside the node once loaded. A generative page (`./generative`) binds a text by its path in the inline form (`/result/text`), so a stored text it does not delegate to the kernel shows nothing there until it is loaded before the page is drawn; a host that loads the result with `loadStoredValues` first hands the page inline values.
