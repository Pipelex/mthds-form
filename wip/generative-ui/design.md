---
status: landed
item: L-260903-35eb46
---

# Generative UI over json-render — design of the first step

**Written 2026-09-03 and ratified by Louis the same day**, as the critical rewrite of the brief parked on `L-260903-35eb46`. The brief was worked out before any implementation and it is sound on the mechanics; what it gets wrong is the shape of the step, and that is what this document changes. Read this before [`plan.md`](plan.md), which schedules it.

## Where this is going

A method declares its inputs and its output. Two surfaces render them today, and both are a faithful transcription of the declaration: one control per input, one labelled node per result property, in declaration order. The host webapp's standalone method app (the "Use me" page a Deploy hands out) mounts the kernel's `FieldRenderer` in one calm column and the kernel's `StuffViewer` beside it. The MCP servers (`@pipelex/mcp`) render the same form inside an agent conversation through `@pipelex/mthds-ui`'s `RunPanel`, and show a result as a text preview. Correct, complete, and mechanical.

The end-game is the same two surfaces looking like something a designer signed off: a page whose layout was **chosen** for this method rather than derived from it, where an invoice's total is a figure and its lines are a table and its status is a badge, where a method's inputs are grouped by what they mean and the one that matters is first. Choosing is what a model is for. So the architecture we are aiming at has three artifacts where today there are two: the **descriptor** (what a field IS, the kernel's currency, unchanged), the **payload** (what a run produced), and a **spec** (how the page is laid out) that a model produces once per method and a renderer paints on every run. json-render is a candidate for the spec's format and renderer: a JSON document constrained by a catalog of components, bound to state by JSON Pointer paths, streamable as patches, with a shadcn/ui registry, an MCP Apps package and a code exporter already in its family. The fit with our two surfaces and with a future "Deploy App" that exports a standalone page is what makes it worth a serious look.

## What this step is

**A conviction step, and nothing more.** It ends at a checkpoint where Louis looks at three hero examples in Storybook and decides one of three things: go further with json-render, try another package, or build the layer ourselves. Everything in the step is chosen to make that decision cheap and well-informed, and nothing in it ships: the json-render packages come in as devDependencies, the generative code lives in the story tree outside both entry points, and no release is cut. The one durable change the step carries is the Tailwind major, and the section on it below says why it is not json-render's cost.

The step is judged on two questions, and they are different questions. **Does a model, given only what the kernel already knows about a method, produce a spec that renders as a page worth shipping?** That is the question about json-render's model-facing design: is the spec format something a model gets right, is the catalog vocabulary rich enough to be beautiful and small enough to be reliable. **Does the package's own machinery hold up under our constraints?** That is the question about the renderer: two-way binding into the kernel's controls, state loaded from a real payload with its wire quirks, both themes, streaming. A step that answers only the second question with a hand-written spec, which is what the parked brief did, would have shown that a renderer renders. Nobody doubts that.

## Ratification

Louis ratified the rewrite at kickoff on 2026-09-03, with two amendments and three settled questions. The amendments are recorded here because they change the argument below, not only the schedule.

**Three sources of a spec, not one.** The rewrite withdrew both the deterministic projection and the hand-written layouts, on the ground that a spec nobody generated is a fixture that cannot fail. Louis wants to see all three, and the reason is better than the objection: the decision at the checkpoint is a comparison, and a comparison needs its bounds. So every hero renders the same fixture from three sources beside the kernel's own rendering. `Projected` is the deterministic projection of the descriptor, the floor: what a transcription looks like in the catalog's font. `Authored` is a spec written by Claude Code from exactly the brief and catalog prompt the model receives, the ceiling: what the catalog can express when the author is patient. `Generated` is what the Pipelex designer method produced, captured by the fixture pass. The objection is answered by provenance and validation rather than by exclusion: an authored spec is typed against the catalog so a wrong prop fails `tsc`, it is validated by the corpus test like the other two, it is stamped with the hash of the catalog prompt it was written against so a catalog change invalidates it visibly, and its header says who wrote it and from what. It is labelled as what it is, which is the whole difference from the brief's "authored" exception. The reading at the checkpoint follows from the bounds: `Generated` close to `Authored` clears the model; `Authored` dull too indicts the catalog, which is ours; `Projected` nearly as good as either says the layer is not earning its place. The agent path Louis raised is this `Authored` source, driven by hand in this step and by a skill later.

**The input hero carries a file slot.** Criterion 3 asks the escape hatch to hold for a file, a date and a list, and the hero the rewrite named, `structured.one_invoice`, has no file. One new carrier pipe, `invoice_with_source`, adds a `Document` slot beside the invoice, so the criterion is judged on a rendering rather than on the argument that the document arm shares a code path.

**Settled at kickoff.** The designer method pins `claude-5-sonnet`, with a `MODEL=` override on the pass and the model recorded in each fixture's provenance, so a comparative run is an experiment rather than a decision to unwind. The webapp's Tailwind migration item is filed at kickoff and assigned to Thomas. The step runs to Checkpoint 3 without a pause, one commit per phase, and stops early only if Checkpoint 2 fails badly. `Tabs` leaves the catalog: shadcn's binds its active value but renders every child regardless of the active tab, so a tabbed layout would need a `visible` condition per panel, and reliability wins in a first step.

## The review of the brief as filed

The parked brief is right about the migration mechanics, the Storybook plumbing, the corpus-driven fixtures and the escape hatch. Seven things change.

**It front-loads infrastructure and defers the question.** The brief's first rendering artifact is a deterministic projection of `RunField[]` into shadcn inputs, and its layouts "the way a model would" are hand-written, with the real generation parked as a follow-up. A deterministic projection is the mechanical transcription in a different font, and a hand-written layout proves what a human can do with the catalog. Generation moves into the step: a spec a story renders is produced by a model from the descriptor, captured by a fixture pass, and committed with its provenance, the same rule the payloads already follow. *Amended at ratification:* the projection and the hand-written layout come back, as the labelled `Projected` and `Authored` sources beside the `Generated` one, because the checkpoint is a comparison and a comparison needs its floor and its ceiling. What does not come back is a spec whose origin is unstated.

**It calls itself an adoption.** "The dependencies come in for real" is the wrong posture for a package Louis is still choosing. The step is a spike with an exit, the packages stay dev-only, and the decision has stated criteria.

**It undersells the Tailwind coupling with the main consumer.** The brief records the v4 requirement as a breaking change for "Tailwind hosts" and moves on. The host webapp is a Tailwind 3.4 host that compiles this package's classes itself, scanning `node_modules/@pipelex/mthds-form/dist` with its own v3 build, because the prebuilt stylesheet would give it a second preflight. The upgrade tool's own rewrites (`outline-none` to `outline-hidden`, `rounded` to `rounded-sm` under a rescaled radius scale, `max-h-[--radix-…]` to the parenthesis form) are unknown to a v3 build, so a v4 release of this package misrenders there silently, class by class. That release cannot go out before the webapp migrates, and the item never said so. The section below takes the decision explicitly.

**Six stories is too many for a first look.** Three heroes, each shown beside the kernel's rendering of the very same fixture, so that the only difference on screen is the layout. The streaming demonstration stays because it is the argument for the agent surface and costs an afternoon.

**The escape hatch is on the wrong side.** The brief gives the input form an `MthdsField` and gives results nothing. Results need it more: a date arrives in the serializer's typed envelope, a plural result arrives as `{items: [...]}`, a file arrives as a storage reference only a host can resolve, markup arrives as `inner_html`. A model laying out an invoice must not have to know any of that. The result side gets an `MthdsResult` and a state loader that reads the payload by the kind the descriptor states.

**The shadcn catalog is written for inlined sample data.** Its `Table` takes `rows: string[][]`, and the prompt json-render generates from it tells the model, in three separate rules, to "always include realistic sample data" in `/state`. Our specs must do the opposite: bind every value to a path the host loads, and inline nothing. The prompt's custom rules override that, two custom components (`DataTable`, `Metric`) give the model bound equivalents of the two things it most wants to inline, and the model's brief describes the state shape it is binding to rather than data it should invent.

**It has no notion of design time versus run time.** The spec is produced **once per method**, by a model, from the descriptor; it binds to state; it is cacheable beside the method like `input_form` is. The run-time render loads a payload into state and paints, with no model in the loop. Every property that makes the end-game viable (a Deploy that costs one generation, an MCP view that ships a registry and receives data, a page that is instant on every run) follows from that split, and the brief's examples were built as if the spec were per run.

## The architecture of the layer

### Rule 1 survives, restated for a model

The descriptor stays the currency. `buildRunFields` still decides nothing; the spec is presentation over `RunField[]` and over a payload, and it never restates what a field is. Concretely: **the model's input is the descriptor, never JSON Schema.** It receives a brief rendered from `RunField[]` (the kinds, the labels, the descriptions, the enum options, the presence, what gates the run) and, on the result side, from the result `RunField` plus one real payload so it can judge magnitudes. It never sees `json_schema`, so the seam the whole package is built around does not widen: a change to how the descriptor is derived changes what the model is told, and nothing the model is told bypasses the derivation.

Where the catalog cannot express a kind, the spec delegates to the kernel by carrying the `RunField` **verbatim** as a prop (verified against `@json-render/core` 0.20.0: `resolvePropValue` recurses into plain objects and returns anything without a `$` directive unchanged, so a descriptor rides through). That is the escape hatch, on both sides:

- `MthdsField` renders an input slot through `FieldRenderer`, its value bound two-way with `useBoundProp` at `/inputs/<name>`. It is the arm for `document`, `image`, `date`, `list`, nested `object` and `unknown`, and it is always available for a scalar the model would rather not style.
- `MthdsResult` renders a result subtree through `ResultField`, reading its value from state at the path the model names. It is the arm for `document`, `image`, `date`, markup, `prose` (which is markdown and must be typeset as such) and any structure the model chose not to lay out.

The rule the model is given is simple: lay out what you understand, delegate what you do not, and delegate by naming the path. Working out which kind a value is by looking at it, on either side of the seam, remains forbidden: the loader and the two escape hatches read by the kind the descriptor states.

### The two state trees

An **input page** binds at `/inputs/<name>`, recursing into structures as the descriptor does. That subtree **is** the values record the kernel already consumes: `computeReadiness(fields, state.inputs)` gates the Run button, `gateRunInputs` refuses on the server exactly as today, and the value bridge deflates on the way out unchanged. Generative UI changes how the form looks, not what the run receives, and the story asserts that agreement.

A **result page** binds at `/result/<path>`. The state is loaded by a small `payloadToState(field, payload)` that walks the result descriptor by stated kind: a typed date envelope becomes the ISO string the kernel's `readDateContent` already extracts, a plural payload's `items` becomes the array, a document or image becomes the `{url, filename}` view `readDocumentContent` and `readImageContent` return, everything else passes through. It is the loader, not the model, that knows the wire; it lives beside the kernel's readers because it is the same knowledge.

### The catalog

A deliberately small vocabulary. Fewer components make better specs, and a first step needs reliability more than range. From `@json-render/shadcn/catalog`: `Card`, `Stack`, `Grid`, `Separator`, `Heading`, `Text`, `Badge`, `Alert`, `Collapsible`, `Progress`, `Input`, `Textarea`, `Select`, `Switch`, `Button`. Not `Tabs`, whose panels do not follow the active tab without a `visible` condition on each child, and not `Accordion`, whose items are strings and cannot hold a subtree; `Collapsible` is the one container that nests, and the Company hero is built on it. Four of our own: `MthdsField` and `MthdsResult` above, `DataTable` (columns as `{path, label}` over rows bound with `$state`, because the shadcn `Table` cannot bind), and `Metric` (a labelled figure, the README's own example of a custom component, because a KPI is what a model reaches for first on a result page and the catalog has no such thing). The `className` prop is omitted from every picked definition: an arbitrary utility the model invents is one the Storybook build never compiled, and a colour it invents is one that ignores the theme.

The registry binds `shadcnComponents` for the shadcn subset and implements the four custom ones over the package's own controls and vendored primitives. The prop schemas of the two escape hatches are `z.any()` for this step; whether `MthdsField` deserves a real zod mirror of `RunField`, so `catalog.prompt()` can describe it to a model, is a decision for after conviction.

### Generation: a Pipelex method, with the catalog prompt as an input

Louis's open question is whether the model in the loop is an agent with a skill or a Pipelex method. For this step it is a method, for three reasons that are about the step rather than the end-game. The harness already exists: `make fixtures-runs` executes pipes through the real `pipelex run bundle` CLI and copies back what they produced, and a third pass over the same script is a smaller change than a new generation harness. It dogfoods, and it answers the hypothesis Louis actually stated. And the method is a reusable asset: it takes `catalog_rules` (the text `catalog.prompt()` produces) and `brief` (the Markdown rendered from the descriptor) as **inputs**, so it is coupled to no catalog and could later be registered on the hosted platform and called from the webapp's Deploy or from an MCP tool without rewriting.

It is a `PipeLLM` whose output is `Text` carrying JSONL patches, the format the catalog prompt asks for, pinned to `claude-5-sonnet` with an override on the pass for comparisons. A typed structured output was considered and set aside: the spec is a map of heterogeneous elements whose props are typed per component, which a MTHDS structure cannot state and which json-render already validates against each component's zod schema at render time. The harness compiles the text with `compileSpecStream`, validates structure with `validateSpec`, checks every element type against the catalog, and fails the pass on any issue, printing `formatSpecIssues` so the repair is a prompt change recorded in the method rather than a hand edit of the fixture.

The custom rules the catalog prompt carries are the whole difference between json-render's default posture and ours: bind every value to a path from the brief and inline nothing; emit no `/state` patches on a result page (the host loads the state) and on an input page seed `/inputs` only with the defaults the brief lists; use `MthdsField` or `MthdsResult` for the paths the brief marks as delegated; one root; no `className`; a Run button on an input page fires `validateForm` then a `run` action the host handles.

The agent alternative is not excluded by any of this. Both paths consume the same catalog prompt and the same brief and emit the same JSONL, so a skill in the plugins marketplace could wrap them later, and the renderer would not know which produced its spec. The choice is not binding, which is why it is safe to take the cheap side of it now.

### Streaming

json-render's spec is built from RFC 6902 patches, root first, and its compiler renders a partial tree at every line. The `Streamed` story replays a captured spec's JSONL through `createSpecStreamCompiler` behind a Replay button. It costs little and it is the one demonstration the agent surface needs: a view inside a conversation receives its layout as the model streams it, and a page that fills in progressively is what distinguishes a generated view from a loaded one.

## The Tailwind v4 decision

The facts, as of 2026-09-03:

| Consumer | Tailwind | How it gets this package's classes |
| --- | --- | --- |
| the host webapp | 3.4 | scans `dist/` with its own v3 build, does not load `styles.css` |
| the MCP views | 4.2 | `@source` on `dist/` under its own v4 build |
| the starter and the graph playground | 3.4 | their own builds |
| a host with no Tailwind | none | the prebuilt `styles.css` |

`@json-render/shadcn` peers on Tailwind 4 and ships class strings in v4 idioms that a 3.4 build does not compile; two majors cannot coexist in one package. So using the shadcn registry as shipped means this package moves to v4, and the parked brief's dry run says the move is mechanical: the upgrade tool migrates the config into an `@theme inline` block, rewrites the control classes, and the HSL token contract survives untouched because v4 composes opacity with `color-mix`. The alternative, writing our own registry over the v3 classes, was weighed and rejected for the experiment's sake rather than the effort's: a spec that renders poorly through a registry we wrote is an ambiguous result, and an ambiguous result is what this step exists to avoid.

**The migration stays in the step, on the branch, and it is not json-render's cost.** Whatever generative-UI package is tried next will want Tailwind 4 too; the shadcn ecosystem moved there a year and a half ago. What the migration must not do is release before the webapp can take it, so the step files a ledger item for the webapp's own v4 migration at kickoff, assigned to Thomas, and the release of this package's v4 line is sequenced behind it. The MCP views gain from the move: they compile our v3 idioms under v4 today, with the same silent drift in the other direction.

If the checkpoint ends in "another package" or "build our own", the migration commit is kept or dropped on its own merits, which is exactly why it is one commit.

## Fixture discipline for specs

A captured spec is a payload's twin: the one artifact no projection can produce. So it follows the payload's rules. A third pass, `make fixtures-specs`, runs the designer method over every hero's brief, costs inference budget, needs credentials, and is asked for rather than implied by `make fixtures`. Its output is committed as `src/__stories__/_generated/<case>.specs.ts`, keyed by pipe ref, with the provenance the payload files carry plus the one thing a spec needs and a payload does not: the model that produced it and a hash of the catalog prompt it was produced against, so a catalog change that invalidates the fixtures is visible. An `Authored` spec follows the same discipline from the other side: it is written from the committed brief and catalog prompt that `make briefs` records under the campaign directory, it is typed against the catalog, it carries the same prompt hash, and its header names its author. What is withdrawn is a spec with no stated origin.

## The conviction checkpoint

The step ends when the three heroes render from captured specs in both themes, and Louis decides. So the decision is not a vibe, the criteria are stated up front:

1. **The pages look like something a designer would ship**, in both themes, judged by Louis on the Storybook. This is the criterion that matters and the only subjective one.
2. **A model produced every spec unaided**, with at most one repair round driven by `formatSpecIssues`, and no hand edit.
3. **The escape hatch held**: a file slot, a date and a list rendered by the kernel's controls inside a model-authored layout, two-way, and the readiness the kernel computes from the generative form's state agrees with the kernel form's on the same values.
4. **The result loader held**: an invoice with a typed-envelope date and a plural result rendered without the model knowing either shape.

What each failure means is also worth stating, because it decides where the next step goes. If 1 fails while 2 through 4 pass, the problem is the catalog or the brief, both ours, and worth one more round before judging the package. If 2 fails repeatedly, the spec format is one models do not get right, and that is a strike against json-render specifically. If 3 or 4 fail, the binding model does not compose with a kernel that owns its controls, and that is a strike against the whole approach of a foreign renderer over the descriptor, package or not.

## After conviction

Not in this step. Recorded so the step does not quietly absorb them.

- **Where the layer ships from**: a `./generative` entry of this package with its own budget line and bundle assertion (zod and `@json-render/*` must reach neither of the existing entries), or a sibling package. Decided after the examples, as the brief said.
- **The release cascade**: this package's v4 line, the webapp's migration, the starters. A ledger item per consumer, an epic if it becomes a program.
- **Hosted generation**: the designer method registered and cached per method version, exposed either as a `views` token on `/validate` beside `input_form` or as a build endpoint. The spec becomes a per-method artifact the platform stores, which is what makes Deploy cost one generation.
- **The MCP app view**: `@json-render/mcp` targets `@modelcontextprotocol/ext-apps`; whether it composes with the Skybridge views the MCP servers ship is a question for that repo.
- **Code export for Deploy App**: `@json-render/codegen` turns a spec into a standalone page with no runtime dependency, which is the most literal reading of "Deploy App" there is.
- **The agent path**: a skill wrapping the same catalog prompt and brief, for a coding agent designing a method's UI in its editor. The `Authored` source in this step is that path driven by hand; Louis has skills in mind to install for it later.
- **The `MthdsField` schema**: a zod mirror of `RunField` so the prompt can describe it, once the layer ships.
- **Intent hints** (`L-260823-d905b9`): the brief already carries `hints`, so a model reads them for free; the kernel's controls honouring them is the separate item it always was.

## The second artifact: the brand as data — decided 2026-09-03

Checkpoint 4 of the plan records the finding that opened this: the layout of a page is validated data, and the brand on it was not. The prototype in the Pipelex brand applied its colours, its type and its logo through hand-written CSS and a hand-picked URL, which is exactly the kind of artifact the layer exists to avoid. The decision, ratified by Louis in conversation the same day, is that a brand is a second validated artifact beside the spec, and that **the model writes data files only**: a DTCG token file with a light and a dark mode for the theme contract, and a small manifest for the logo and the font source. No TypeScript, no CSS, nothing the schema does not name. What a token cannot express is not on the page.

The division of labour it fixes: the model decides the layout, the copy and the mapping of a site's facts onto the theme contract; a build written once turns tokens into the custom properties the controls already read; the registry and the kernel own what a control is. The controls are re-skinned by tokens because the theming contract was designed that way; the one change the decision forces on the package is that the contract states full colours instead of HSL triplets, which no token tool emits and which is modern shadcn's own convention under Tailwind v4. Terrazzo is the token pipeline; design-token-kit, if it appears at all, is an optional checker at the edge. [`plan-brand-as-data.md`](plan-brand-as-data.md) schedules it, with its criteria stated before the work, and opens with the compact record a cold session needs.

## Open questions at the kickoff, and what became of them

- Which model the designer method pins: settled, `claude-5-sonnet` (see "Ratification").
- Whether `ThemePair`'s double render trips axe on the shadcn inputs, which label by `props.name`: still open, checked on the first input story, with a story-level single-theme parameter as the fallback.
- Whether the shadcn `Tabs` and `Collapsible` bind their open state in a way the Company hero can use: answered by reading the package. `Tabs` binds but does not switch its panels, `Accordion` holds strings only, `Collapsible` nests with `defaultOpen`. The Company hero is cards and collapsibles.

## Landed — 2026-09-05

The entry this design argued for shipped to `dev` as `./generative` through PR #21 (`21efb2b`), Phase 1 of `wip/generative-layer/`, and this record landed with it. What the design left as follow-ups — hosted generation and storage per method version, the agent skill — is the program's later phases.
