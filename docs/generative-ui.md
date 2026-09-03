# Generative UI over the descriptor

A study, not a feature. Nothing described here ships: the layer lives under `src/__stories__/generative/`, outside both entry trees, and is reachable only through Storybook. It exists to answer one question with evidence rather than opinion — whether a model, given what this package already derives from a method, can lay out a page that a person would rather use than the kernel's own rendering — and to leave the answer, whichever way it goes, in a form the next person can re-run. The decision it was built for is recorded in the campaign's plan under `wip/generative-ui/`; this document is the durable description of the layer itself.

## Three artifacts, and which one a model touches

A method reaches a page as three artifacts, and the layer keeps them apart:

- **The descriptor**, `RunField`, which `buildRunFields` and `buildResultField` derive from the wire. It states what every input and every result member IS — its kind, presence, multiplicity, label, constraints — and the package's first rule is that nothing downstream re-derives that.
- **The state**, two JSON trees json-render's store holds: `/inputs`, one member per input, written by the controls and read by the run; and `/result`, loaded from a run's payload before the page renders, read-only. The host owns both. On the result side `payloadToState` turns the wire into the tree by the kind the descriptor states — a date becomes its ISO string, a plural result sheds its `{items}` envelope, a document or an image stays as the serializer wrote it — and on the input side `seedInputs` plants the authored defaults and nothing else, because a seeded empty string would count as filled.
- **The spec**, a json-render `Spec`: a tree of elements over a fixed catalog, every value bound to a state path. This is the only artifact a model produces, and it is a per-method artifact — it carries no descriptor and no data, only paths — so it is produced at design time, once per method version, and rendered at run time over whatever state a run yields.

Rule 1 restated for a model: **the brief is the only source of paths; bind every value to one of them, exactly as written, and inline nothing the state carries.** A spec that restates a field's kind, copies a value from the example run, or invents a unit the state does not carry has broken the seam the package is built around, and the corpus test treats each of those as a failure rather than a style choice.

## The catalog, and the two escape hatches

The vocabulary the model lays out with is `catalog.ts`: a subset of json-render's shadcn components with `className` removed from every prop schema (colour, spacing and type come from the components as they are, themed through the same tokens as the kernel's controls), plus four of the layer's own — `DataTable`, `Metric`, and the two escape hatches.

`MthdsField` and `MthdsResult` are what keeps the layer honest. Each takes a `path` and nothing else, resolves it against the descriptor the host already holds (`DescriptorProvider`, `paths.ts`), and hands the `RunField` it finds to the kernel's own `FieldRenderer` or `ResultField`. Every kind the catalog cannot show properly — a file, a date, a document, prose, a list of structures on the input side — is delegated this way, and so is any structure the model would rather not lay out. Delegating a subtree whole is a valid outcome, not a failure; the design says so, and the Company hero exists to see whether a model takes the offer gracefully. Inside a `repeat`, a hatch's path is the item's field name relative to the item — `"teams"` inside a card repeated over the divisions — and the hatch resolves it against the repeat scope json-render provides, which is what lets a model lay out one level and delegate the next for every item at once. A path is always a literal string: the validator refuses an expression there, because the layer resolves the path and an `$item` expression would have been resolved to a value before the hatch saw it.

The `path` form is a deliberate departure from the first design, which had the spec carry the descriptor verbatim. A spec that carries a `RunField` restates what a field is, and a model asked to copy a JSON subtree is a model given a way to get it subtly wrong; a path is the stricter reading of rule 1, and it is what makes a spec descriptor-free.

## The prompt is ours

json-render's stock schema ships a prompt template whose posture is to invent state: an "initial state" section demanding `/state` patches for every bound path, and default rules asking for sample data. That is the opposite of this layer's premise, so `schema.ts` defines the same spec shape and the same built-in actions with its own default rules and its own template, composed from the same section vocabulary so a model's priors still apply. `rules.ts` adds the rules that make a spec ours — the brief is the only source of paths, no `/state` on a result page, delegate what is marked, one Run button, no `className`, heading levels increase by one — and the corpus test asserts the words the stock template would have contributed never reach the prompt.

`catalogPrompt()` renders the whole thing, and `promptHashOf` stamps it. The hash is what ties a spec to the prompt it was produced against: every captured and every authored spec carries one, the corpus test compares it with the current prompt, and a catalog change is therefore a failing test rather than a stale page. A stale hash means regenerate the captured spec and re-read the authored one against the new prompt.

## The brief

What a model is given, besides the prompt, is a brief per hero (`brief.ts`), rendered from the committed descriptors and payloads by `make briefs` into `wip/generative-ui/briefs/`. An input brief lists every path under `/inputs` with its kind, presence, whether it gates the run, its label and constraints, marks the paths to delegate, names the defaults to seed and says which inputs the run waits for. A result brief lists the paths under `/result` the same way, with a list's items described by their members' paths relative to one item, and shows the state of one real run as JSON so the model judges magnitudes without seeing the wire. The catalog prompt follows in the same file with its hash, so the brief is the complete record of what both the model and a human author were handed.

## Three sources, one harness

Every hero renders four ways over the very same fixture, so the only difference on screen is the layout:

| Story       | Source                                                   | What it is for                                                                                                          |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Kernel`    | The package's own form or result view                    | The faithful transcription — what a host gets with no layer at all                                                      |
| `Projected` | `projectInputSpec` / `projectResultSpec` over the fields | The floor: one element per member in descriptor order, deterministic, no inference                                      |
| `Authored`  | A spec written by hand from the brief and the prompt     | The ceiling: what the vocabulary can express when the author is patient, typed per component so a bad prop fails `tsc` |
| `Generated` | What the designer method produced, captured, never edited | The answer to whether a model does it unaided                                                                            |

The reading follows from the bounds. `Generated` close to `Authored` clears the model. `Authored` dull too indicts the catalog, which is ours to change. `Projected` nearly as good as either says the layer has not earned its place over the kernel.

`hero-page.tsx` is the harness the three generative stories share: it derives the descriptor through the kernel's own lookups, loads the state, owns the store and hands the page a spec, and on the input side shows the receipt a host never would — the `/inputs` tree as the run would receive it and the readiness the kernel computes from it — which is what the play functions assert against. `Streamed` replays a captured spec line by line through json-render's stream compiler, so the progressive fill a host would see from a live generation is visible without one.

## Design time and run time

Generation is a design-time act: the designer method (`data/generative/ui-designer.mthds`, one `PipeLLM`) takes the catalog prompt and a brief and returns JSONL. `make fixtures-specs` runs it through the real CLI for each hero, compiles the text, validates it against the catalog with the layer's own validator (`validate.ts`, which checks every prop per component and is expression-aware, where json-render's own check degrades to "any record" once a catalog has more than one component), and writes `src/__stories__/_generated/<case>.specs.ts` with the model, the date and the prompt hash. A rejected spec is kept beside the brief and the pass fails; the repair is to the method or the brief, never to the fixture. The pass costs inference and needs credentials, which is why it is its own target beside `make fixtures` and `make fixtures-runs`.

Rendering is a run-time act that needs no model: `GenerativePage` takes a spec, a store and the descriptor scope, and json-render's renderer does the rest. That split — one spec per method version, rendered over every run — is the shape any adoption of this layer would take, and it is why the spec is deliberately descriptor-free.

## What ships, and what would come next

Nothing ships. The json-render packages and `zod` are devDependencies, importable only from the story tree, and `make assert-bundle` would fail the moment one reached a shipped chunk. What is committed is the layer, the designer method, the briefs, the captured and authored specs, and the corpus test that keeps them honest.

If the study's checkpoint decides the layer earns its place, the recorded follow-ups are a `./generative` entry or a sibling package, hosted generation and caching of the spec per method version, the agent skill for the authored path, and a zod mirror of `RunField` so a host can validate a spec without this package's help. Each is out of scope here and named in the campaign plan so that none is absorbed silently.
