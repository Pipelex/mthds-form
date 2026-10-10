# Brands

A **brand** is someone else's filling of the theme contract: the custom properties [theming.md](theming.md) defines, set to a product's own colours, radius and typefaces, plus a manifest naming the product and its logos. The `./brand` entry is where a brand is held to that contract and compiled into a stylesheet.

```ts
import { assembleBrand } from '@pipelex/mthds-form/brand';
```

The entry is **isomorphic and network-free**. It carries no React and touches no DOM, so a build script, a test, a browser and a server import the same code. It never fetches. Its one dependency is zod. `scripts/assert-bundle.mjs` holds all three on the built graph: the entry may reach `zod` and no other specifier, it carries no `'use client'` prologue, and no `fetch(` call reaches it.

Nothing in the entry calls a model or reads a site. Producing a brand, which means reading a site's design facts and judging from them which colour is the accent and what a dark-only site's light mode should be, belongs to whatever runs a producer (see [Where a brand comes from](#where-a-brand-comes-from)). This entry is what that producer's answer is checked and compiled by.

## What a brand is

A brand is three JSON files:

- **`tokens.json`** is a [DTCG](https://www.designtokens.org/) token file (the Design Tokens Community Group format, 2025.10) setting exactly the contract's tokens, in both colour modes.
- **`brand.json`** is the manifest: the product's name, its site, one logo for each canvas (`onLight` is the mark drawn on the light canvas, `onDark` the one drawn on the dark), and the web font to load, or `null`. The generative layer's app bar reads it through `BrandProvider`, which also loads the web font. `brandManifestSchema` is exported here and re-exported from `./generative`.
- **`provenance.json`** says who produced the brand, on which model, on which day, against which brief and from which facts, with the brief's hash and, when the facts are a file, that file's hash. It is a record, never rewritten to make a check pass.

A brand's directory is named by `brandProducerId(provenance)`, which is `producer--model`, with `--seeded` added when a seed was given. That is the recipe a captured layout's id uses, so the tree and the record cannot disagree about who made a brand.

## The contract

`BRAND_CONTRACT` is the list of tokens a brand sets: which DTCG token sets which custom property, and what that property paints, in the words a producer is told.

| Tokens | Set | Held to |
| --- | --- | --- |
| `color.background` … `color.ring` | the colour properties, `--background` … `--ring` | `theme.css`'s `:root` and `.dark` blocks |
| `radius.base` | `--radius` | `theme.css`'s `:root` block |
| `font.sans`, `font.mono` | `--font-sans`, `--font-mono` | Tailwind's own theme variables, which `theme.css` leaves alone |

The colour and radius rows are not a second list kept beside the theme. `src/brand/__tests__/contract.test.ts` holds them to `theme.css` over the source, and `make assert-bundle` holds them over the built entry, so a token added to the theme is a token a producer must set.

**The two typefaces are the exception, and on purpose.** `--font-sans` and `--font-mono` are the names of Tailwind's own theme variables: the prebuilt sheet already declares both with Tailwind's stacks, and the `font-sans` and `font-mono` utilities read them. `theme.css` does not define them, because it is unlayered while a Tailwind host declares its theme in `@layer theme`, so a value there would override the typeface of every host that loads the file. The stock typeface is therefore the host's own, and only a brand's scope sets these two. `make assert-bundle` fails if `theme.css` ever defines either, or if the shipped sheet stops declaring them.

`CONTRAST_PAIRS` names the text pairs that must reach WCAG AA (`MIN_CONTRAST`, 4.5:1) in both modes: the ink on the canvas, and the secondary text on the canvas.

## The token file

`validateBrandTokens(doc)` holds a token file to the contract and returns either the typed tokens or every problem at once, each named by its path, so that a producer's repair round is handed the whole list. Its rules:

- The file carries exactly the contract's tokens, in three groups (`color`, `radius`, `font`), each with its `$type`. A token the contract does not name is refused, and so is one the file omits.
- Every token carries a `$description`: one sentence saying where on the site the value comes from, or how it was derived.
- A colour is an object, `{ "colorSpace": "srgb", "components": [r, g, b], "alpha": a }`, each number in 0..1, with an optional `hex` that must be exactly the hex the components compile to, each channel rounded to its byte. The colour space is always sRGB.
- A colour token whose value is a colour object states its dark value in `$extensions.mode.dark`, and `dark` is the only mode. An alias, the string `"{color.<name>}"`, may stand for both modes, and then follows its target's dark value. An alias names a colour token of the contract and never forms a cycle.
- `radius.base` is `{ "value": <number>, "unit": "rem" | "px" }`, and each font token is a list of family names, the site's own first and a generic family last.
- The contrast pairs reach AA in both modes, read through the aliases and measured as they render: the canvas of a pair must be opaque, since a translucent one shows whatever the host paints beneath it, and the ink is blended over it by its alpha, so a translucent ink counts at the strength it actually has and a transparent one fails. Both colours are measured as the compiler writes them, each channel rounded to its byte and the alpha to three decimals, because that is what a page renders: a grey that clears 4.5:1 at full precision can round below it.
- A family name holds no control character, since a form feed would end the CSS string it is written into.

A standard DTCG tool accepts far more than this, and the difference is not academic. The study that first built this chain compiled through Terrazzo 2.7.1, and found that it silently turned an unparseable string colour into black, crashed its build on a hex with no components, crashed its CSS plugin on a colour outside sRGB, and checked contrast in the light mode only. Each is a way a producer's file is wrong and a page is painted anyway, and the validator refuses every one of them.

## Validity and freshness

`assembleBrand({ brand, producerId, manifest, tokens, provenance })` takes the three files as parsed JSON and returns either the brand, validated and compiled, or every problem with it, each prefixed with its file:

```ts
const result = assembleBrand({ brand: 'acme', producerId, manifest, tokens, provenance });
if (!result.ok) {
  for (const problem of result.problems) console.error(problem);
} else {
  writeFileSync('acme.css', result.brand.css); // and put result.brand.scope on the page root
}
```

That verdict is about **validity**: the manifest, the tokens with their contrast, and the facts the person stated, all judged against the contract as it is now. It is a hard verdict, and a brand that fails it is not compiled.

Whether a brand was produced against the current brief, and from the facts its producer holds now, is a different question, about **freshness**, and it never refuses a brand. The provenance records the brief's hash as `contractHash` and, when its facts are a file, that file's hash as `siteFactsHash`; a newer brief or facts that moved make a brand old, never invalid, so a corpus produced last month keeps compiling. Freshness is held only where a brand is being produced, by the producer, in the same way the designer method's stamp is held to its prompt hash.

## The stated facts

Some things a site does not show, and no reading can supply them: the accent of a site with no button, a different accent for its dark canvas, a logo for a canvas the site draws none for. A person states them beside the URL, as `StatedFacts`:

```json
{ "accent": { "light": "#1a1a1a", "dark": "#e5e5e5" }, "logo": { "onDark": "https://mthds.ai/latest/images/mthds-white_on_transparent.png" } }
```

A stated fact outranks every reading, and whatever runs a producer tells it so, outside this package (see [Where a brand comes from](#where-a-brand-comes-from)). The provenance records it, and `assembleBrand` refuses a brand that does not carry it: `color.primary` must compile to exactly the stated accent in each mode it was stated for, and be opaque there, since a hex carries no alpha and a primary nobody can see would otherwise match it; and the manifest must carry each stated logo. Only what was stated is checked.

## Compiling

`compileBrand(tokens, scope)` turns a validated token file into a stylesheet. `assembleBrand` calls it, and it is exported for a host that validates separately:

```css
.brand-acme-pipelex-method--claude-5-5-sonnet {
  /* The page canvas: the site's body background. */
  --background: #ffffff;
  /* … every colour, --radius, --font-sans, --font-mono … */
  font-family: var(--font-sans);
}

.dark .brand-acme-pipelex-method--claude-5-5-sonnet {
  /* … every colour again, with its dark value … */
}
```

- **The scope** is `brandScope(brand, producerId)`, with every character a class selector cannot carry turned into a hyphen. That folds: two producer ids that differ only by such a character or by case share a scope, so a set of brands loaded on one page must check that their scopes are distinct, as `make brands` does. Everything below the element carrying that class reads the tokens it always reads, which is the whole of what a brand does to a page: no component knows a brand exists.
- **Dark mode** follows the package's own convention, a `.dark` ancestor, so a branded page inside a dark pane picks up its dark values with nothing else to wire. Every colour is restated there, an alias included.
- **The typeface is declared where the scope is.** Tailwind's preflight resolves the page's typeface once, at `<html>`, so a scope that only set `--font-sans` lower in the tree would change no text. Declaring `font-family: var(--font-sans)` on the scope makes the brand's typeface reach everything under it: the produced page, the plain form and the controls, since preflight makes inputs inherit their font. A page with no brand keeps the host's own typeface untouched. The brand's monospace face reaches what uses `font-mono`.
- **Values** are written as a person reads them: an opaque colour as its hex, a translucent one as `rgb(r g b / a)`, an alias as `var(--name)`, the radius as a length, a font stack with each face's name quoted and CSS's own keywords (`sans-serif`, `system-ui`, `ui-monospace` …) bare. Each declaration carries its token's description as a comment. A token file is produced content, so nothing in it can leave its declaration: a family name is a CSS string with its quote, backslash, control characters and `<` escaped, and a description can close neither its comment nor the `<style>` element of a host that inlines the stylesheet.

**The kernel compiles a brand itself.** The contract is closed (a fixed set of tokens, colours in sRGB only, one length, two font stacks), so compiling a file the validator accepted is a short function and no dependency, and the faults the study routed around in Terrazzo are gone with it. Terrazzo is kept in one place, as a devDependency of `src/brand/__tests__/terrazzo.test.ts`: that test compiles every committed brand through Terrazzo and compares each selector's declarations with the kernel's, colours as channels within the rounding a hex carries, never byte for byte. The token file therefore stays standard DTCG, and the test catches the day the kernel's stylesheet stops being the one a standard tool writes.

## Painting a page in a brand

A host does three things:

1. Load the brand's compiled stylesheet, once.
2. Put the brand's scope class on the element that wraps the page, and `.dark` on an ancestor for the dark mode.
3. Hand the manifest to the page: `GenerativePage` takes it as `brand`, or a host wraps its tree in `BrandProvider`. That puts the logo pair and the name in scope for the app bar and loads the web font.

```tsx
import '../brands/acme.css';

<div className={scope}>
  <GenerativePage spec={spec} store={store} scope={descriptorScope} brand={manifest} />
</div>
```

The tokens and the manifest are separate on purpose: the tokens are the palette, and the manifest is what the page says it is.

## Where a brand comes from

A producer reads a site and writes its answer against this contract, and both happen outside this package. Reading what a site declares (which custom properties its stylesheets set and which declaration wins as served, which colour utilities its markup uses most, which typefaces it loads, which images could be its logo) is code over the page and stylesheets a producer fetched. Judging from those facts what the brand should be is a model's work. Neither belongs in a kernel that a browser and a server import, so neither is here.

What reaches this entry is the producer's answer: the token file, the manifest and the provenance. `assembleBrand` holds them to the contract, and its problems, each named by its file and path, are what a producer's repair round is handed. The provenance's `siteFacts` field records where a brand's facts came from, as a path or a sentence. When it names a file, `siteFactsHash` records the first twelve hex digits of the SHA-256 of that file's bytes as the producer read them, the recipe `contractHash` follows for the brief. A path alone cannot tell whether the facts behind it moved: a producer that re-reads its recordings with a newer reader rewrites the very file a committed brand names, and only the hash lets it report that brand as stale. The schema refuses a `siteFactsHash` with no `siteFacts` beside it, since nothing would name the file it hashes. It cannot tell a path from a sentence, both being one string, so a brand read by hand records no hash by the producer's own rule, and a hash recorded beside a sentence anyway is caught where it is judged, because the sentence names no file to hash. A brand produced before the field existed carries no hash and is not given one afterwards, because its provenance is a record. This package never reads the facts file, and never holds the hash to it.

## The corpus and the story brands

`data/brands/<brand>/<producer>/` holds the brands the brand study produced from real sites, as they were written, with their provenance. They are the reference corpus a producer is compared with. Each provenance says where its brand's facts came from: a brand the producer method made points at `data/brands/<brand>/site-facts.json`, the facts as that producer read and wrote them, and a brand read by hand says so in a sentence. Those files are kept as they were written: their shape is the producer's, and this package neither validates them nor exports a type for them.

`make brands` validates and compiles every one with `assembleBrand` and writes the generative stories' brands under `src/__stories__/generative/brands/`: one stylesheet per brand, an `index.css` importing them all, and `generated.ts` naming each with its provenance, its scope and its manifest. It is all or nothing: one brand that does not validate writes nothing and prints its problems. `src/__stories__/__tests__/brands.test.ts` rebuilds the corpus and fails on a committed file that is not what the data produces. A brand is a directory two levels down whose name does not start with a dot, so an editor's or a tool's cache under `data/brands/` is skipped rather than read as a brand; the walk that decides this is `brandDirs` in `src/__stories__/generative/brand-build.ts`, and the brand entry's own tests list the corpus through it, so what they test is what `make brands` builds. All of it is outside every entry tree and ships in nothing. See [storybook.md](storybook.md) § "Generative".
