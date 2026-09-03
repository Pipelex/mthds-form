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

## `ResultPanel` — two views, and why not three

`ResultPanel` is the component a host mounts: the header, a **Result / JSON** switch, and the field tree beneath them. `ResultField` stays exported for a host composing its own chrome, but the panel is the default answer, and the JSON view is a property of it — not a feature some results have.

**Result** is the answer for a person: the descriptor-driven view, which knows a field is an enum, that a date arrived in the serializer's typed envelope, that fifteen records are a table. **JSON** is the answer for whoever is debugging the pipe: what exactly came back, verbatim, copyable, keyed the way the payload is keyed rather than the way the label reads. Structure recedes and data comes forward — keys, braces and commas are muted, values are solid — using weight and the muted token rather than a palette, because the host owns its colours and a hand-picked green for strings is a colour that fails somebody's theme. **No collapsible tree**: that would be a second structured browser competing with the view that reads the descriptor, which is the same "two, not three" argument one level down. Different jobs; neither substitutes for the other.

They are deliberately **not peers**, and the toggle should not read as a menu of equal options. One is the result, the other is the receipt, and Result opens first.

**The third view is the one to resist.** An engine-rendered HTML or plain-text presentation — the shape a runtime's own viewer offers — is a second _human_ rendering of the same payload: produced by another codebase, carrying no descriptor (so it cannot know a kind, a plurality or a nesting), unable to match a host's design system, and unimprovable without shipping the engine. If a plain-text form is genuinely wanted, it is a **copy format** and belongs behind a copy control, not beside the view that reads the standard.

The panel draws the header once and tells `ResultField` to skip its own. Two headers that agree today drift tomorrow, and the header must not move when the view changes — switching should not relocate the thing you are reading.

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

## Labels follow the presentation, exactly as the form does

A result and the form that produced it show the **same fields**, so they must read the same way. `ResultField` and `ObjectTable` therefore read `useFieldPresentation` and go through the same `fieldLabel(title, name, presentation)` expression as `FieldShell`:

- **`studio`** (the default): the label is the identifier the method author wrote — `issued_on`, in mono, beside its concept pill. Nothing is prettified, because in this mode a prettified name is a name that no longer matches the bundle a builder would open and edit. An authored `title` is authoritative and shown verbatim in both modes.
- **`app`**: the identifier is humanised into a sans label — `Issued on` — and the concept pill goes. A person reading a method app's result has never seen the source, and `results.Invoice` is the method's vocabulary, not theirs.

This is worth stating because the result side got it wrong once: it humanised unconditionally, so a single screen could ask for `issued_on` and then announce **Issued on** for that same field. `Outputs/Results` carries `Studio Labels` and `App Labels` over one invoice so the pair can be compared, and `result-field.test.tsx` pins both, headers included.

## Layout: a result is read, not filled in

The result view started as the input form with the controls swapped for values, and that was the wrong shape. Label, type pill, description, value — stacked, once per field — is right for something a person **fills in**: the guidance has to arrive before they type. For something they **read**, it is chrome around the one thing they came for, and it multiplies. A fifteen-entry list of four-field records rendered as fifteen forms: about 240 lines of page for 60 values.

Three rules replaced it, and each follows from a fact the descriptor already states.

**Every list of records is a table**, and the ones a cell cannot hold expand. Falling back to a card per entry over the widest column was the wrong trade: a table is how a list of records is READ — scannable, aligned, one row each — and giving that up for prose or nesting lost it for every other column too. So the cell shows the first line (or how many entries there are), and the row expands to the whole record in the stacked layout, arriving only when asked for. The toggle appears only when a row HAS more to show; a table of short scalars gets no column of chevrons that reveal nothing. The expanded panel is pinned to the scroller's width, because a detail spanning every column would otherwise inherit the table's and run off into the horizontal scroll.

**A list of records with one shape is a table.** Every entry has the same keys — that is what a table is. So the labels become column headers, stated once instead of once per row, and the type pills go with them. `tableColumns` decides it: an `object` element whose every field is a short scalar, or a list of them.

**A column can hold a short scalar list.** A record does not stop being a row because one of its fields is two words; chips wrap, so a column of them stays a column. Sending the whole list back to cards over its narrowest field is the wrong trade, and it is the difference between a five-column table of people and five stacked forms.

**Prose and nesting are shown, not accommodated.** A paragraph in a `<td>` forces one column to the width of the longest answer, so a prose cell holds its first line and the row carries the rest; a structure is not a cell at any width, so its cell says how many entries it stands for. `TABULAR_KINDS` decides which columns are shown WHOLE in their cell.

**Whether a row can be OPENED is a different question, and reading it from the kind was wrong.** The toggle used to appear only where `isInlineColumn` was false — which treated `text` as always-fitting, because the standard calls it "a short single-line string". But *short* is not a property the kind carries: a `text` node is bounded only when the author wrote `max_length`, and an unbounded one is a slot a model will happily fill with three sentences. A table of nothing but `text` columns therefore got **no toggle at all**, and every cell truncated with no way to read the rest — the one outcome a result view must not produce. So `fitsACellWhole` reads the guarantee from the CONSTRAINT: a boolean, a date, a number and an enum are bounded by what they are, a `text` is bounded when it says so, and everything else gets its row a toggle. Still descriptor-driven — no value is measured, so a table's shape does not change with the data it happens to be showing.

**A column description lives on its header.** Once, on hover and on focus, through the same tooltip every other description uses. Under every value it would be the same sentence fifteen times.

**The header is a filled band, and the table fills its box.** The header row is the one row that is not data; on a long list the reader scrolls it out of sight and back, and a hairline alone leaves it reading as the first entry. It carries `bg-muted` rather than a literal grey, so it follows the host's light and dark palettes like every other surface here. The table itself is `w-full` **beside** `min-w-full`, not instead of it: `min-w-full` alone left the table content-sized whenever the columns were narrower than the panel, so the band and every row rule stopped mid-box with empty bordered space to their right and the table looked half-drawn. The pair costs nothing — the two agree at 100% while the content is narrow, and once the columns need more, auto table layout grows past both into the scroller rather than crushing them, because headers are `whitespace-nowrap` and cells truncate.

**An open row IS the record.** Opening a row used to grow a second row underneath and keep the clipped cells above it, which showed every value twice and left the reader scrolling sideways through the clipped copy of what they had just opened. The cells are now replaced by the full rendering, spanning the table's width. Column alignment is what that costs, and only while a row is open — an open row is not being scanned against its neighbours, it is being read.

**A list of images is a gallery; a list of files is rows.** A card per picture is a screenful each when the picture is the whole content, and a document's whole content is a name and a link — a bordered box with an index around two fields spends the chrome of a structure on them. A file is NAMED rather than printed whole: ninety characters of UUID and hash wrapped across the panel says one thing, and the thing it says is "this is a file". The full reference stays on the `title`, which is the part worth copying. An image nothing can paint gets a tile with an icon and its name — that is what a host with no storage resolver sees, so it has to be a design and not a fallback.

**A list of scalars is chips, not cards** — unless the element is `prose`, which is the standard's way of saying "this may be long" and is what `native.Text` always derives to. A chip containing a paragraph is a box with a paragraph in it, so a prose list is plain lines instead: the values, one per line, divided by a hairline.

**A list of `unknown` items is lines too, and that is a reading of the standard rather than a shortcut.** `unknown` is the deliberate escape hatch — the producer could not map the node honestly and said so, which is what an untyped `type = "list"` field derives to. A card per entry would spend a bordered box and an index on each value to say nothing extra: the card earns its place around a STRUCTURE, and this is exactly the node we have been told is not known to be one. Lines cost nothing and read the same whether the entries turn out to be words or objects, because `LeafValue` falls through to `RawValue` either way. Twelve skills were twelve boxes before this.

**A list of scalars is chips, not cards.** `["optics", "calibration"]` as two bordered boxes with index numbers spends a screenful on two words, and the index was never information: the entries of a scalar list _are_ the values, and they identify themselves.

**Every text value can be copied.** A result view is where a person goes to take something away, and the alternative without a control is selecting a rendered heading, list and table by dragging — which picks up the layout and loses the source. So `text` and `prose` carry a copy button, markdown or not, and what it writes is the source the run produced rather than the typeset rendering. It survives `hideLabel`, the top-level case `ResultPanel` uses: the header moves up to the panel and the button does not follow it, because a text result with no way to copy it would be exactly the one worth copying. It renders nothing where there is no clipboard, and is not offered where there is nothing to copy.

**Prose is typeset as markdown, not printed.** What fills a `prose` slot is a model's answer, and model answers are markdown: headings, `**bold**`, bullet lists, sometimes a table. Printed as plain text, a heading is a literal `#` and emphasis is a pair of asterisks — a wrong rendering of a value whose author meant something by those characters, not a neutral one. The descriptor never says "this is markdown" and does not need to: the decision is about typesetting one text value, not about deriving what a field is, and markdown degrades by design, so a plain paragraph renders as that paragraph. No payload sniffing and no per-value heuristic to get wrong.

The markup is walked into React elements rather than injected ([`markdown.tsx`](../src/react/markdown.tsx)): `marked.parse()` returns an HTML string, and the value is model output, so `dangerouslySetInnerHTML` would be a real injection path and a sandboxed frame would be a whole document around two sentences. `marked.lexer()`'s tokens become elements this package wrote, text reaches the DOM only as a text child, a raw HTML block is shown as its own source, and a `javascript:` link is dropped while its words are kept — so there is no HTML string in the path and no sanitizer to ship. Single newlines are kept as breaks (`breaks: true`), because the arm this replaced preserved them. A table cell or a chip keeps the plain string: the point of a compact cell is one line.

**A record is a two-column grid, not a stack.** Label above value spends two lines on every field, so a structure of ten is twenty lines of alternating label and answer with nothing aligned. Side by side they take one line each and the values line up, which is what makes a record scannable. Only a _short_ value shares a line — the same `isInlineColumn` test the table uses — because prose needs the full width, and so does anything carrying chrome of its own.

**And the value sits at the RIGHT EDGE of its column.** Names vary in length and answers do not line up behind them, so a left-aligned value column leaves a ragged seam down the middle of the record and the eye has to find each answer again. Flushed right, the answers form one column the reader runs down — the same reason a receipt, a spec sheet and a settings panel all do it. Only the inline half gets this: anything that took the full-width branch (prose, a table, a gallery, a frame) reads left-to-right like the block it is, and right-aligning those would be aligning a block rather than an answer. A chip row follows through a `data-chips` hook, because `text-right` does nothing to flex children and a list of tags starting under its label beside numbers ending at the right edge is the ragged seam again, one row lower.

**The label column is capped at 40% of the grid.** A bare `auto` sizes to the widest label present — label text plus its concept pill — so one long field name starved every value beside it. Inside a 400px panel that turned a paragraph into a ten-line ribbon in a 130px column. `min-content` keeps a short label short and the cap stops any label taking more than its share, whatever width the host gives the panel.

It is deliberately **not** a `<dl>`. A definition list may hold only ordered `<dt>`/`<dd>` groups, and this grid also holds tables, frames and galleries, which a `<dl>` rejects (`definition-list`). Keeping the semantics would mean separating the short fields from the rest — which reorders them, and authored order is a fact the descriptor carries deliberately. So it is a layout, honestly labelled as one.

**A field's description is on hover and on focus, at every depth including the top.** On an input it is guidance a person needs before typing; on a result it is a sentence beside a value the reader came for — one line of chrome at the top, ten inside a structure of ten.

It is a real tooltip (`ui/tooltip.tsx`, shadcn over Radix), not the native `title`: the browser bubble takes about a second, cannot be themed, and never appears on touch — and it fails the accessibility outright, since a description has to reach a keyboard user, and [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) wants hover content dismissable, hoverable and persistent. Radix gives all of that, plus `aria-describedby` wiring, on hover _and_ on focus.

**Nothing marks it at rest**, and that is deliberate. A dotted underline is the `<abbr>` convention and does not survive density — ten described fields is ten underlined labels, which reads as damage rather than as an affordance; an info icon has the same problem one step removed, ten glyphs competing with the concept pill already beside each label. The cue arrives when the pointer does: `cursor: help` and a faint highlight, at the moment the reader is already pointing, costing nothing when they are not. A supplementary fact should be available rather than advertised.

The part that is not a trade: the trigger is **focusable**, so the description reaches a keyboard user too. That costs a tab stop per described field, and it is the right cost — extra stops are an annoyance, unreachable content is a failure.

**An absence is a dash, and says "not provided" out loud.** `-` (U+002D, not an en dash and not an em dash) is what the page shows: beside forty values in a grid, a repeated sentence is louder than the data, and a dash reads as the blank it is. But a column of hyphens read aloud is "hyphen, hyphen, hyphen", so the glyph is `aria-hidden` and a visually hidden sentence rides beside it. Two strings, because a glyph and a sentence answer different questions — `resultAbsent` and `resultAbsentDescription`, both host-overridable.

**A wide table scrolls rather than crushing.** Twelve columns fit no panel, and the two ways to lose are to wrap a date over two lines to save a scrollbar, or to break the page's own width. So the table keeps a floor under each column, cells are one line with a cap and the full value on the `title`, and the container scrolls — focusable and named, because a scrollable region a keyboard cannot reach is an accessibility failure the a11y gate catches as `scrollable-region-focusable`. It is `role="group"` rather than `region`: a landmark per table would put every one of them in the document's landmark list, and two with the same name is `landmark-unique`.

**The unwrap belongs to the field, not to the layout.** `contentKey` is a property of the descriptor node, so every layout has to apply it — a `native.Text[]`'s entries are `TextContent` records, and a chip, a line and a table cell each hold one. `LeafValue` owns it, which is why they cannot disagree; leaving it to the caller is what briefly turned a list of planet names into eight rows of `[object Object]`.

None of this is a heuristic about the data. Every branch reads the descriptor: the element's `kind`, and its fields' kinds. A payload is never inspected to decide how to lay it out.

## Files

**A document offers a preview when the browser can both fetch and render it.** Two conditions, both necessary: `isViewableUrl` (a `pipelex-storage://` reference resolves nowhere without the host's resolver) and a format a browser renders unaided. A `.docx` satisfies the first and not the second, and a preview that opens onto a download prompt is worse than none.

**A framed URL is not the `native.Html` question, and the difference is the origin.** Markup goes through a sandbox because injecting it into the host's document would run it ON the host's origin with the host's cookies. A URL in an `<iframe>` is a separate document at its own origin by construction — the browser's own boundary, not one this package has to build. So a PDF is framed the way every document viewer on the web frames one, with `no-referrer`, because a result view has no business telling a third party where it was opened from.

**A file always exposes its URL, three ways.** A picture is a _preview_ of a file, not a replacement for it — once the image painted, the URL used to vanish entirely, leaving a result you could look at and could not use. So a painted image is wrapped in a link to the file it previews, its reference is printed beneath it, and the reference carries a copy control.

**A file is NAMED rather than printed whole.** Ninety characters of UUID and hash wrapped across the panel says one thing, and the thing it says is "this is a file"; the last path segment is what a person reads. The two requirements pull opposite ways — a name alone cannot be pasted into a terminal — and the copy control is what resolves them: **the label is the name, the button is the URL**. It hides itself where `navigator.clipboard` is undefined (outside a secure context), because a button that does nothing is worse than no button; the link and the `title` still carry the reference there.

**A gallery of nothing is not a gallery.** When no image in a list can be painted — every URL a storage reference the host has no resolver for — the grid becomes rows, because three large blanks say less than three lines do. The layout follows what is actually showable rather than what the kind promises.

## Markup

`native.Html` is the one arm keyed by **concept** rather than by kind, and it is not an exception grudgingly made. The standard's kind vocabulary has no `html` member, so markup arrives as an `object` node over `{inner_html, css_class}` — right for the descriptor, since kinds name how a value is _entered_ and markup is entered as text, and useless for a result, which would otherwise print a page's source at a reader. Asking `refines`/`concept_ref` whether a node is `native.Html` is a membership test on stated facts, which the input-form page names as the supported way to ask it.

It renders **in a sandboxed frame**, never through `dangerouslySetInnerHTML`. The markup is model output: injected into the host's document it would put a script tag, an `onerror` handler and a form posting elsewhere one prompt away from running on the host's origin with the host's cookies. "The host should sanitize it" is not a decision, it is a hope, and the failure is silent until it is a breach. Shipping a sanitizer is the alternative, and the [dependency budget](dependency-budget.md) makes that a reviewed decision rather than a convenience — so the frame, which is the platform's own answer and weighs nothing.

Two mechanisms, covering different things. `sandbox` **without** `allow-scripts` means no JavaScript runs at all — no `<script>`, no `on*`, no `javascript:` URL; `allow-same-origin` is granted beside it, which is the safe pairing (same-origin is dangerous only _together with_ scripts) and is what lets the parent measure the content to size the frame. A `Content-Security-Policy` meta then holds `default-src 'none'`, so markup carrying `<img src="https://tracker/…">` cannot phone home the moment a result is displayed — a privacy leak rather than a script one, and one that survives the sandbox on its own.

The frame's typography is read off the mount point with `getComputedStyle` and written into its own stylesheet, because no host CSS crosses a document boundary and the alternative is browser defaults in the middle of a themed panel — black on white inside a dark theme.

## `native.Composite`: the one arm that reads the value

Every layout above is decided by the descriptor, and that rule is load-bearing. `native.Composite` is the documented exception, and the reason is that there is nothing to read: a composite declares no members, so the standard's own honest answer is `kind: "unknown"` with a payload schema of `{additionalProperties: true}` and no properties. Both are true. The standard's note on `unknown` says a renderer then falls back to raw entry against the contract's `json_schema` — and that schema says *any object*.

So the descriptor has abdicated, deliberately, and the choice left is between printing the whole thing as a JSON blob and reading the members as the `StuffContent`s they are **by definition**. A composite is a named composition of contents; that is not a guess about a payload, it is what the concept means. `CompositeValue` therefore renders one labelled block per member, and `NativeValue` renders each member as the most specific content model it matches.

The readers are the standard's own — `readHtmlContent`, `readDateContent`, `readDocumentContent` — the same ones the descriptor calls elsewhere in this file. The only difference is that nothing can choose between them here, so they are tried in order of narrowness: `inner_html` and `date` name themselves, `url` is a file, `items` is a list envelope, and `text` is last of the recognised set because several models carry a `text` member beside their own. A member matching none is shown raw, which is the honest floor — shown, not dropped, and not guessed at.

## Why the readers live in core

Same reason `file-formats.ts` does: a host that renders a result its own way needs the same answer the control uses, and two copies of an answer is two places for it to drift. `isViewableUrl` is the clearest case — the input control asks it to decide whether to fetch a preview, the result view asks it to decide whether to paint an `<img>`, and those are the same question. It is defined once and both read it.

## What a result view deliberately does NOT do

- **Resolve a `pipelex-storage://` URL.** That is the host's seam ([upload-seam.md](upload-seam.md)). With no resolver the reference is shown as what it is, rather than as a dead link or a broken image — which is what a host without a resolver genuinely sees.
- **Validate the result against its schema.** Inputs need ajv because a user types them. A runtime produced the output; re-validating it client-side asserts distrust of the engine and buys nothing.
- **Render `working_memory`.** A run's intermediate stuffs are a debugging surface, not a result surface — different consumer, different artifact.

## Fixtures

The stories that exercise all of this are real runs against the real artifacts, not mock-ups. See [storybook.md](storybook.md) § "Two passes, and only one of them costs anything": `make fixtures` reads `pipe_io_contracts`, `input_form` and `output_form` off the engine's own builders, and `make fixtures-runs` executes the pipes through the real `pipelex run bundle` CLI and commits what came back.
