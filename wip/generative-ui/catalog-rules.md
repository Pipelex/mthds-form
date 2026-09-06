# Where the text of `catalog_rules` comes from, as of 2026-09-06

`data/generative/ui-designer.mthds` declares `catalog_rules = "Text"` and references it as `@catalog_rules` at the top of the designer's prompt. There is no file holding that text: it is a string rendered from source at run time, so a change to the vocabulary or the rules is a code change, and the prompt hash stamped on every captured spec moves with it.

## Who supplies it

The fixtures harness. `scripts/generate-fixtures.mjs` writes the run's inputs with `catalog_rules: prompt` (line 1014), where `prompt` is what `currentPrompt()` obtained from `g.catalogPrompt()` (line 788) and checked against the pinned hash before any pipe runs.

`catalogPrompt()` is `src/generative/catalog.ts:141`. It calls `catalog.prompt({ mode: 'standalone', customRules: [...PRODUCT_RULES] })`, and the catalog's `promptTemplate` is our own `renderPrompt` (`src/generative/schema.ts:94`, wired at `src/generative/schema.ts:85`) rather than json-render's stock one — which is the whole point, since the stock prompt is written for a model that invents its own data.

## The sections, in the order `renderPrompt` emits them

The format, state, dynamic-list and dynamic-prop prose is inline in `src/generative/schema.ts`, roughly lines 94 to 168.

`DESIGN DIRECTION:` is `APP_DIRECTION` from `src/generative/direction.ts:13`.

`AVAILABLE COMPONENTS:` is generated from the catalog itself — each entry is one line built from the component's Zod props, its `description` and its slots. The descriptions live in three places: the shadcn subset in `src/generative/shadcn-definitions.ts`, our own components in `src/generative/components.ts`, and the product-page components (`AppBar`, `Hero`, `Workspace`, `Section`, `Rail`, `SummaryRow`, `Cta`, `Footer`) in `src/generative/catalog.ts`, lines 37 to 114.

The `AVAILABLE ACTIONS:`, `EVENTS` and `VISIBILITY` sections are inline in `src/generative/schema.ts`, lines 193 to 212.

`RULES:` is the schema's own `defaultRules` followed by `customRules`, which for this catalog is `PRODUCT_RULES` (`src/generative/product-rules.ts:29`): `CUSTOM_RULES` from `src/generative/rules.ts:22` with the Button rule swapped for `RUN_CTA_RULE`, then `PRODUCT_PAGE_RULES` appended.

`CREATIVE SEED:` is `SEED_PROCEDURE` from `src/generative/direction.ts:24`. It is the procedure for the optional `seed` input, which the harness generates and the method's prompt prints through a guarded reference.

## Reading the rendered text instead of the sources

Every file under `wip/generative-ui/briefs/` carries the hero's brief followed by the full catalog prompt verbatim, with the hash it was rendered at. `make briefs` regenerates them from the committed fixtures.

## The trap

`src/generative/prompt-hash.ts` pins the first twelve hex digits of the SHA-256 of `catalogPrompt()`. Editing any of the strings above changes the hash, and both the briefs pass and the specs pass refuse to run until the pin is updated — which is deliberate, because a captured spec is only meaningful against the prompt that produced it, and every capture has to be re-run.
