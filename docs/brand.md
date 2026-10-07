# Brands

A **brand** is someone else's filling of the theme contract: the custom properties [theming.md](theming.md) defines, set to a product's own colours, radius and typefaces, plus a manifest naming the product and its logos. The `./brand` entry is where a brand is held to that contract and compiled into a stylesheet, and where a website's design facts are read for whatever produces one.

```ts
import { assembleBrand, siteFacts, stylesheetUrls } from '@pipelex/mthds-form/brand';
```

The entry is **isomorphic and network-free**. It carries no React and touches no DOM, so a build script, a test, a browser and a server import the same code. It never fetches: reading a site is a pure function over texts the host fetched. Its one dependency is zod. `scripts/assert-bundle.mjs` holds all three on the built graph: the entry may reach `zod` and no other specifier, it carries no `'use client'` prologue, and no `fetch(` call reaches it.

Nothing in the entry calls a model. Producing a brand, which means judging which colour is the accent and what a dark-only site's light mode should be, belongs to whatever runs a producer. This entry is what that producer's answer is checked and compiled by.

## What a brand is

A brand is three JSON files:

- **`tokens.json`** is a [DTCG](https://www.designtokens.org/) token file (the Design Tokens Community Group format, 2025.10) setting exactly the contract's tokens, in both colour modes.
- **`brand.json`** is the manifest: the product's name, its site, one logo for each canvas (`onLight` is the mark drawn on the light canvas, `onDark` the one drawn on the dark), and the web font to load, or `null`. The generative layer's app bar reads it through `BrandProvider`, which also loads the web font. `brandManifestSchema` is exported here and re-exported from `./generative`.
- **`provenance.json`** says who produced the brand, on which model, on which day, against which brief and from which facts. It is a record, never rewritten to make a check pass.

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
- A colour is an object, `{ "colorSpace": "srgb", "components": [r, g, b], "alpha": a }`, each number in 0..1, with an optional `hex` that must agree with the components to the rounding a hex carries. The colour space is always sRGB.
- A colour token whose value is a colour object states its dark value in `$extensions.mode.dark`, and `dark` is the only mode. An alias, the string `"{color.<name>}"`, may stand for both modes, and then follows its target's dark value. An alias names a colour token of the contract and never forms a cycle.
- `radius.base` is `{ "value": <number>, "unit": "rem" | "px" }`, and each font token is a list of family names, the site's own first and a generic family last.
- The contrast pairs reach AA in both modes, read through the aliases and measured as they render: the canvas of a pair must be opaque, since a translucent one shows whatever the host paints beneath it, and the ink is blended over it by its alpha, so a translucent ink counts at the strength it actually has and a transparent one fails.
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

Whether a brand was produced against the current brief is a different question, about **freshness**, and it never refuses a brand. The provenance records the brief's hash; a newer brief makes a brand old, never invalid, so a corpus produced last month keeps compiling. Freshness is held only where a brand is being produced, by the producer, in the same way the designer method's stamp is held to its prompt hash.

## The stated facts

Some things a site does not show, and no reading can supply them: the accent of a site with no button, a different accent for its dark canvas, a logo for a canvas the site draws none for. A person states them beside the URL, as `StatedFacts`:

```json
{ "accent": { "light": "#1a1a1a", "dark": "#e5e5e5" }, "logo": { "onDark": "https://mthds.ai/latest/images/mthds-white_on_transparent.png" } }
```

A stated fact outranks every reading. `withStatedFacts(facts, stated)` places it in the facts a producer reads, right after the site's identity and ahead of every reading. The provenance records it, and `assembleBrand` refuses a brand that does not carry it: `color.primary` must resolve to the stated accent in each mode it was stated for, and be opaque there, since a hex carries no alpha and a primary nobody can see would otherwise match it; and the manifest must carry each stated logo. Only what was stated is checked.

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

## Reading a site

The facts a producer judges are read off the site by code, because what a site declares is a matter of fact: which class its `<html>` carries, which custom properties its stylesheets set, under which selector, and which declaration wins for the page as it is served; which colour utilities its markup uses most; which typefaces it loads; which radii it uses; which images could be its logo. Code reads facts exactly, every time, for nothing. What a model is for is the judgement that follows.

The reader is two pure functions. The host fetches in between, behind its own guard (a scheme, a size cap, a timeout), which is a policy this package has no business setting:

```ts
// `fetchGuarded` is the host's own fetch, behind its own guard.
const html = await fetchGuarded(url);
const stylesheets = [];
for (const sheetUrl of stylesheetUrls(html, finalUrl)) {
  try {
    stylesheets.push({ url: sheetUrl, css: await fetchGuarded(sheetUrl) });
  } catch (error) {
    stylesheets.push({ url: sheetUrl, error: String(error) });
  }
}
const facts = siteFacts({ url, finalUrl, fetchedAt: '2026-10-06', html, stylesheets });
```

- `stylesheetUrls(html, finalUrl)` names the stylesheets the page links, resolved against the URL it was served from, in document order.
- `siteFacts(page)` reads the page, its inline `<style>` blocks and those stylesheets. A stylesheet the host could not fetch is passed as `{ url, error }` and recorded as such. The date is passed in, because a reader with no clock is told what day it is.

What it reads, in order of the record: the site's identity; its colour scheme (the `<html>` and `<body>` classes and data attributes, `theme-color` metas, `color-scheme` declarations, how many rules sit under a dark selector or a dark media query); the colour custom properties; the colour literals and colour utilities by frequency, each utility with the colour it resolves to; the typefaces, font faces, webfont links and preloads; the radii; and the logo candidates, including the original file behind a Next.js image URL. Its ranked and repeated lists are capped so the record stays readable. The radius custom properties are kept on their own, as lengths. There is no browser and no script execution, so a site that paints itself from JavaScript alone yields fewer facts, and the record shows it.

**Each custom property** carries `asServed`, the value that wins at the root for the page as it is served, `references`, how many `var()` references name it across the stylesheets, and every declaration as written with its selector chain. The winner is weighed as the cascade weighs it, among the declarations whose selector applies at the root: an `!important` declaration beats a normal one, then the cascade layer decides (an unlayered declaration beats a layered one, a later layer beats an earlier one in the order a browser gives them, by an `@layer a, b;` statement or the first block naming each, and importance reverses that order), then source order. That is what decides between a framework's default and the site's own override, whether the override comes later or sits outside the framework's layer. Specificity is not weighed, which is why only the rules applying at the root are compared. `asServed` is given without its `!important`; the declarations are recorded as written. When a site declares more colour properties than the record holds, the most referenced are kept, so a site's own palette is not cut for a plugin's that happens to come first, and they are listed in the order they first appear.

**A colour utility** the markup uses resolves to what its own rule paints: the last plain rule for that one class (`.bg-white\/10 { … }`), at the top level or inside a cascade layer as Tailwind v4 writes them, weighed by the same cascade. A variant (`.text-brand:hover`) or a rule under a condition (`@media`, a `.dark` ancestor) is never taken for the utility itself. A `var()` in what it paints, or in a colour declaration, is substituted by the value its property has as served; a property with none takes the reference's own fallback, and a reference with neither is left as written. Every custom property is resolved, colour or not (`hsla(var(--md-hue), …)` reads `hsla(225deg, …)`), and the colours are read only once every property is known, so a declaration's place in the sheet does not change what it resolves to. A type size is not a colour utility, whether Tailwind names it (`text-2xs`, `text-[30px]`, `text-sm/6`) or the theme does: a utility whose own rule sets `font-size` and paints nothing is left out.

**The page is a stranger's**, possibly cut short by the host's size cap or written to stall a reader, so the reader reads it the way a browser does rather than trusting it to be well formed. The markup's `<link>` and `<style>` elements are read in document order, and what an HTML comment or a `<script>` holds is neither, so `stylesheetUrls` never names a sheet a browser would not load. Each stylesheet is read on its own, as a browser reads it, so a sheet cut short inside a block leaves the next one untouched, and an unclosed `<style>` or comment runs to the end of what holds it. A brace inside a string is text, and so is a semicolon inside parentheses (`url(data:image/png;base64,…)`); a statement such as `@charset` or `@import` ends at its semicolon instead of joining the next selector; the declarations a block makes before a nested rule are kept ahead of it; and the end of a sheet closes any block still open. A malformed percent-escape in the markup loses only its own entry.

**No page costs more to read than its length.** Every scan moves forward and stops once nothing after it can close what it opened, since if no `>` follows one position, none follows any later one. The rest is bounded, by `LIMITS` in `src/brand/site-facts.ts`: blocks nested deeper than 32 levels are skipped whole, a selector chain is recorded up to 300 characters and then cut with an ellipsis, a colour function longer than 100 characters is not read as a colour, `var()` references are followed 16 levels deep with a cycle read as no value, and substitution adds at most a million characters over the whole reading. A site written for a browser reaches none of them, except now and then the cut on a long selector chain, which only shortens what the record shows. `src/brand/__tests__/site-facts.test.ts` times the reading of each shape that once took seconds or ran out of memory at a few hundred kilobytes, well under the guard's cap.

## Recorded sites

The reader is tested offline, over sites recorded as they were served. A recording is a directory, `data/sites/<host>/<YYYY-MM-DD>/`:

| File | Holds |
| --- | --- |
| `recording.json` | `{ url, finalUrl, fetchedAt, stylesheets: [{ url, file } \| { url, error }] }` |
| `page.html` | the page as served |
| `stylesheets/` | one file per stylesheet the page links, in document order |
| `site-facts.json` | what `siteFacts` reads from the above |

`make record-site URL=https://<site>/` fetches a site now, behind a guard (https only, on the page, every stylesheet and every redirect; a size cap per resource; a timeout; and a cap on how many stylesheets one page may have fetched, past which a sheet is recorded as not fetched), and writes a new recording, replacing one made the same day. `make site-facts` re-reads every recording with the reader as it is and rewrites its `site-facts.json`, offline, so a change to the reader is reviewed as the diff it leaves in the record. `src/brand/__tests__/site-facts.test.ts` fails on a recording whose committed facts are not what the reader reads now.

**Only our own sites are recorded here**, because this repository is open source and a recording is a copy of a site's markup and stylesheets. Any other site a producer is tried on is recorded where that work happens, not in this package.

## The corpus and the story brands

`data/brands/<brand>/<producer>/` holds the brands the brand study produced from real sites, as they were written, with their provenance, and `data/brands/<brand>/site-facts.json` holds the facts each was produced from. They are the reference corpus a producer is compared with.

`make brands` validates and compiles every one with `assembleBrand` and writes the generative stories' brands under `src/__stories__/generative/brands/`: one stylesheet per brand, an `index.css` importing them all, and `generated.ts` naming each with its provenance, its scope and its manifest. It is all or nothing: one brand that does not validate writes nothing and prints its problems. `src/__stories__/__tests__/brands.test.ts` rebuilds the corpus and fails on a committed file that is not what the data produces. All of it is outside every entry tree and ships in nothing. See [storybook.md](storybook.md) § "Generative".
