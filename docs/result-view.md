# The result view

The output half of the kernel: how a pipe's **result** is described, and how it is rendered.

The claim underneath all of it is one line — **an output is a concept ref exactly like an input is** — and everything here follows from taking that literally. Same concepts, same structures, same field kinds, same nesting, so the same descriptor vocabulary and the same mapper. What differs is three _slot_ facts an output does not have (an authored `name`, a three-valued `presence`, `gating`), all three already optional on the standard's field node, and the presentation: a result is read, not edited.

## The three artifacts

|                                  | Inputs                              | Outputs                                          |
| -------------------------------- | ----------------------------------- | ------------------------------------------------ |
| identity, plurality, optionality | `pipe_io_contracts`                 | `pipe_io_contracts`                              |
| shape / JSON Schema              | `json_schema` on the input contract | **nothing on the contract** — supplied beside it |
| presentation view                | `input_form`                        | **nothing at all** — simulated by `output_form`  |

Two of the three cells on the output side are empty in MTHDS today, and `src/core/output-form.ts` is the record of what would fill them. It is deliberately shaped like what the standard would plausibly adopt, so adopting it later is an import change rather than a rewrite. The argument for making that change lives in `wip/output-form-standard-change.md`.

## `buildResultField(descriptor, schema)`

One node in, one `RunField` out, through `mapNode` — the very function `buildRunFields` walks an input descriptor with. A second mapper would be a second place for kinds to drift, so there is not one.

**The schema is required, and that is the point of this whole module.** It is the schema of the **payload**, which is a different question from the one the input contract answers:

- an input contract's `json_schema` describes what a caller **sends** — a plural slot's schema is a bare array, because that is what the caller hands over;
- an output's schema describes what **comes back**, which is the concept's content model — `TextContent {text}` for a `native.Text` result, `ListContent {items}` for a `Concept[]` one.

That is now the standard's own rule, stated on [the output contract's page](https://github.com/mthds-ai/mthds/blob/main/docs/spec/pipe-io-contracts.md), and it is the rule the plan originally got wrong: the first proposal was to mirror the input side verbatim and emit a bare array for a plural output. Building it that way produces a schema the real payload does not satisfy, which is worse than emitting none.

That distinction is what makes the schema usable rather than decorative. `buildResultField` reads the single wrapping property's **name** off it (the kernel's `contentKey`) and the renderer unwraps by name. Before the schema was required, the renderer had no name to unwrap by, so it worked one out by counting the value's properties and looked for an `items` key to decide a payload was a list. Both are shape sniffing — the exact pattern [derivation-swap.md](derivation-swap.md) records deleting from the input side — and both are gone.

The unwrap happens **once, at the top**, and is gated on the node's stated `kind`, never on the value's shape:

- for every kind but `object`, the payload is a content-model wrapper, and the schema walked beneath the descriptor is the wrapper's single property. A plural output's node is a `list`, so what it must be walked against is the `items` **array**, not the `ListContent` object around it — misaligning those loses the element's schema silently.
- an `object` output **is** its content model, so nothing is unwrapped. A structured concept that happens to declare exactly one field would otherwise be mistaken for a wrapper, which is precisely the guess this design exists to avoid: the kind comes from the descriptor, so this is a read of what the field is rather than an inference from what the value looks like.

Nested values are the other half of the same rule. A `date` **field** inside a structure is not a `native.Date` value, and a `lines` array inside a structure is a bare array — only the top-level result carries a content model.

## The plural wrap

Plurality is not on the concept. `concept_ref` is the element with the multiplicity suffix stripped, on both sides of the contract, so a producer of an output descriptor must read `multiplicity` from the pipe's output contract and wrap the node as a `list` whose `item` is the element node minus its name.

This is the one place a PRODUCER does real work rather than delegating, and it shipped wrong once here, while the artifact was still simulated: a `LineItem[]` output described as an `object`, which every renderer would have shown as one line item where the run produced two. The standard's page now asks implementations to carry a conformance case for exactly this, and both client mirrors pin it — so what was a local guard is now the producer's obligation, checked where the producer lives.

To be clear about where this lands: **a consumer never sees it.** The emitted descriptor carries `kind: "list"`, exactly as a plural input's does, and a renderer reads plurality from the descriptor and never touches the contract.

## `ResultField`

The single dispatch point, mirroring `FieldRenderer` on the input side, and its switch over `RunFieldKind` is **exhaustive with a `satisfies never` fall-through**. That is not tidiness. It used to end in a `default:` that did `String(value)`, so a `document` result rendered as the literal text `[object Object]` — no exception, no warning, no failing type, just a wrong pixel. A twelfth kind now fails the build here instead.

Three arms read a structure rather than a scalar, and they read it through `src/core/native-content.ts`:

| Kind       | Read as                                                                                                                | Pinned by                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `document` | `{url, public_url, mime_type, filename, title, snippet}`                                                               | the standard's `native.Document`                                                               |
| `image`    | `{url, public_url, caption, mime_type, filename, width, height}`                                                       | the standard's `native.Image`                                                                  |
| `date`     | a plain ISO string, `native.Date`'s `{date, time}`, or the serializer's typed envelope `{date, __class__, __module__}` | the first two by the standard; the third **measured off a real run**, and unspecified anywhere |

**Reading a documented shape for a stated kind is not sniffing.** [native-concepts.md](https://github.com/mthds-ai/mthds/blob/main/docs/spec/native-concepts.md) pins every native content model, so a renderer told `kind: "document"` may read `{url, filename, mime_type, …}` from the spec. What it may not do is work out _which_ kind it is holding by inspecting keys. The first is reading the standard; the second is guessing at it.

`native.Page` needs no arm of its own: its descriptor is an `object` over `{text_and_images, page_view}`, so it works by recursion into the arms above.

## Layout: a result is read, not filled in

The result view started as the input form with the controls swapped for values, and that was the wrong shape. Label, type pill, description, value — stacked, once per field — is right for something a person **fills in**: the guidance has to arrive before they type. For something they **read**, it is chrome around the one thing they came for, and it multiplies. A fifteen-entry list of four-field records rendered as fifteen forms: about 240 lines of page for 60 values.

Three rules replaced it, and each follows from a fact the descriptor already states.

**A list of records with one shape is a table.** Every entry has the same keys — that is what a table is. So the labels become column headers, stated once instead of once per row, and the type pills go with them. `tableColumns` decides it: an `object` element whose every field is a short scalar, or a list of them.

**A column can hold a short scalar list.** A record does not stop being a row because one of its fields is two words; chips wrap, so a column of them stays a column. Sending the whole list back to cards over its narrowest field is the wrong trade, and it is the difference between a five-column table of people and five stacked forms.

**Prose and nesting fall back to cards.** A paragraph in a `<td>` forces one column to the width of the longest answer and drags every row's height with it, so `prose` is deliberately outside the tabular set. So are `object` and `list`-of-structures, for the obvious reason, and `document`/`image`, because a file's chrome is not a cell. The index label a card carries earns its place there — the entries are structures rather than values.

**A list of images is a gallery; a list of files is rows.** A card per picture is a screenful each when the picture is the whole content, and a document's whole content is a name and a link — a bordered box with an index around two fields spends the chrome of a structure on them. A file is NAMED rather than printed whole: ninety characters of UUID and hash wrapped across the panel says one thing, and the thing it says is "this is a file". The full reference stays on the `title`, which is the part worth copying. An image nothing can paint gets a tile with an icon and its name — that is what a host with no storage resolver sees, so it has to be a design and not a fallback.

**A list of scalars is chips, not cards** — unless the element is `prose`, which is the standard's way of saying "this may be long" and is what `native.Text` always derives to. A chip containing a paragraph is a box with a paragraph in it, so a prose list is plain lines instead: the values, one per line, divided by a hairline.

**A list of scalars is chips, not cards.** `["optics", "calibration"]` as two bordered boxes with index numbers spends a screenful on two words, and the index was never information: the entries of a scalar list _are_ the values, and they identify themselves.

**A field's description moves to a tooltip below the top level.** On an input it is guidance a person needs; on a result it is the same sentence beside a value they are there to read, and inside a structure of ten fields it is ten lines of chrome around ten values. It stays reachable on the label's `title` — worth having, not worth repeating — and is printed outright only on the output node itself, where it describes the whole result.

**A wide table scrolls rather than crushing.** Twelve columns fit no panel, and the two ways to lose are to wrap a date over two lines to save a scrollbar, or to break the page's own width. So the table keeps a floor under each column, cells are one line with a cap and the full value on the `title`, and the container scrolls — focusable and named, because a scrollable region a keyboard cannot reach is an accessibility failure the a11y gate catches as `scrollable-region-focusable`. It is `role="group"` rather than `region`: a landmark per table would put every one of them in the document's landmark list, and two with the same name is `landmark-unique`.

**The unwrap belongs to the field, not to the layout.** `contentKey` is a property of the descriptor node, so every layout has to apply it — a `native.Text[]`'s entries are `TextContent` records, and a chip, a line and a table cell each hold one. `LeafValue` owns it, which is why they cannot disagree; leaving it to the caller is what briefly turned a list of planet names into eight rows of `[object Object]`.

None of this is a heuristic about the data. Every branch reads the descriptor: the element's `kind`, and its fields' kinds. A payload is never inspected to decide how to lay it out.

## Markup

`native.Html` is the one arm keyed by **concept** rather than by kind, and it is not an exception grudgingly made. The standard's kind vocabulary has no `html` member, so markup arrives as an `object` node over `{inner_html, css_class}` — right for the descriptor, since kinds name how a value is _entered_ and markup is entered as text, and useless for a result, which would otherwise print a page's source at a reader. Asking `refines`/`concept_ref` whether a node is `native.Html` is a membership test on stated facts, which the input-form page names as the supported way to ask it.

It renders **in a sandboxed frame**, never through `dangerouslySetInnerHTML`. The markup is model output: injected into the host's document it would put a script tag, an `onerror` handler and a form posting elsewhere one prompt away from running on the host's origin with the host's cookies. "The host should sanitize it" is not a decision, it is a hope, and the failure is silent until it is a breach. Shipping a sanitizer is the alternative, and the [dependency budget](dependency-budget.md) makes that a reviewed decision rather than a convenience — so the frame, which is the platform's own answer and weighs nothing.

Two mechanisms, covering different things. `sandbox` **without** `allow-scripts` means no JavaScript runs at all — no `<script>`, no `on*`, no `javascript:` URL; `allow-same-origin` is granted beside it, which is the safe pairing (same-origin is dangerous only _together with_ scripts) and is what lets the parent measure the content to size the frame. A `Content-Security-Policy` meta then holds `default-src 'none'`, so markup carrying `<img src="https://tracker/…">` cannot phone home the moment a result is displayed — a privacy leak rather than a script one, and one that survives the sandbox on its own.

The frame's typography is read off the mount point with `getComputedStyle` and written into its own stylesheet, because no host CSS crosses a document boundary and the alternative is browser defaults in the middle of a themed panel — black on white inside a dark theme.

## Why the readers live in core

Same reason `file-formats.ts` does: a host that renders a result its own way needs the same answer the control uses, and two copies of an answer is two places for it to drift. `isViewableUrl` is the clearest case — the input control asks it to decide whether to fetch a preview, the result view asks it to decide whether to paint an `<img>`, and those are the same question. It is defined once and both read it.

## What a result view deliberately does NOT do

- **Resolve a `pipelex-storage://` URL.** That is the host's seam ([upload-seam.md](upload-seam.md)). With no resolver the reference is shown as what it is, rather than as a dead link or a broken image — which is what a host without a resolver genuinely sees.
- **Validate the result against its schema.** Inputs need ajv because a user types them. A runtime produced the output; re-validating it client-side asserts distrust of the engine and buys nothing.
- **Render `working_memory`.** A run's intermediate stuffs are a debugging surface, not a result surface — different consumer, different artifact.

## Fixtures

The stories that exercise all of this are real runs against the real artifacts, not mock-ups. See [storybook.md](storybook.md) § "Two passes, and only one of them costs anything": `make fixtures` reads `pipe_io_contracts`, `input_form` and `output_form` off the engine's own builders, and `make fixtures-runs` executes the pipes through the real `pipelex run bundle` CLI and commits what came back.
