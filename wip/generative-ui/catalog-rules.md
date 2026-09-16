# Where the designer's prompt comes from, as of 2026-09-16

`data/generative/ui-designer.mthds` is the prompt. Its one pipe, `ui_designer`, carries every paragraph a model reads as authored prose — the role in `system_prompt`, then in `prompt` the output format and its example, the state contract, the dynamic-lists and dynamic-props sections, the design direction, the component and action lists, the events and visibility sections, the numbered rules, the creative-seed procedure, and the tail that interpolates the brief and the guarded seed. There is no TypeScript that renders a prompt string any more; improving the prompt is editing that file with `/pipelex:pipelex-edit`, and a change to its inputs is `/pipelex:pipelex-design`.

The method takes `catalog = "Catalog"`, `brief = "Text"` and `seed = "Text?"`. Until 2026-09-16 it took `catalog_rules = "Text"`, a twenty-thousand-character string `catalogPrompt()` rendered in `src/generative/schema.ts` by pushing lines into an array — the design direction, the rules and the seed procedure lived in three TypeScript modules, and json-render's `formatZodType` was reached only through its `promptTemplate` hook. The record of that arrangement is this file's history.

## What is data, and who supplies it

`designerCatalog()` in `src/generative/designer-catalog.ts` builds the `catalog` input: for every component in `COMPONENT_NAMES` order, its name, its props signature (`src/generative/props-signature.ts`, held by test to the text json-render's own prompt would render), its description, whether it accepts children, its named slots and its events; then the four built-in actions from `src/generative/schema.ts`, marked built-in, and the catalog's own `run`. The component descriptions still live where they did — the shadcn subset in `src/generative/shadcn-definitions.ts`, our own in `src/generative/components.ts`, the product-page components in `src/generative/catalog.ts` — and the method lays the lists out with two Jinja2 loops, so a component added to the catalog appears in the prompt with no change to the method.

The fixtures harness hands the value over as `{ concept: DESIGNER_CATALOG_CONCEPT, content: designerCatalog() }` (`scripts/generate-fixtures.mjs`, the specs pass), beside the brief as a bare string, and the bundle as `mthds_contents`. A host does the same.

## What is prose, and why it is in the method

Everything that names a component — the direction's advice on which control to reach for, the rules about Tabs and Steps, the product-page grammar — is the method's own reading of the vocabulary it was written for, and stays beside the rest of the prompt rather than travelling as data. The split is deliberate: the method is coupled to no catalog *listing*, and the prose that assumes this package's components is in the one file a person edits to change what a page looks like.

Two things to know before editing the prose. A literal dollar sign is written `$$`, because `$name` is the language's inline substitution and every json-render expression key (`$$state`, `$$bindState`, `$$item`, `$$cond`, `$$template`, `$$or`) would otherwise be rendered as a variable and refused at load. And a loop body ends with its own newline, so the heading that follows a loop sits directly under `{% endfor %}` to render one blank line rather than two.

## Reading the rendered text

Every file under `wip/generative-ui/briefs/` carries the hero's brief followed by the catalog data as JSON and the prompt hash; the method file it names is the rest. `make briefs` regenerates them from the committed fixtures. To read the prompt exactly as the runtime renders it, run the method's `system_prompt` and `prompt` through the runtime's own preprocessor and Jinja2 environment over that JSON — the diff taken on 2026-09-16 against the last TypeScript-rendered prompt showed every component line, rule and direction paragraph byte-identical, the role line moved to `system_prompt`, one duplicated sentence dropped from rule 13, and `Collapsible` listed one place later, in the catalog's stated order rather than the definitions file's.

## The trap

`src/generative/prompt-hash.ts` pins the first twelve hex digits of the SHA-256 of `promptHashSubject(method, catalog)` — the method file's text, then the catalog data as JSON. Editing a paragraph of the method, a component description, a prop, or the model pin changes the hash, and both the briefs pass and the specs pass refuse to run until the pin is updated — which is deliberate, because a captured spec is only meaningful against the prompt that produced it, and every capture has to be re-run. `src/generative/__tests__/prompt.test.ts` recomputes the pin and reports the new value.
