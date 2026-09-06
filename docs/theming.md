# Theming

The controls are styled with Tailwind utility classes over CSS custom properties — the standard shadcn/ui semantic tokens. No colour is ever a literal. That is the entire theming contract: **define the tokens, and the controls look like your product.**

## The tokens

Each is a whole CSS colour, in any syntax a browser accepts — `hsl(0 0% 100%)`, `oklch(0.7 0.15 170)`, `#00bb95` — as modern shadcn/ui defines them under Tailwind v4. They used to be HSL triplets without the `hsl()` wrapper, which was how Tailwind v3 composed an alpha channel onto a token; v4 composes an opacity modifier with `color-mix()` over the whole colour, so the wrapperless form stopped being a constraint and is gone. The move also lets a design-token pipeline emit the contract directly: a token tool writes whole colours, and none writes triplets.

| | |
| --- | --- |
| surfaces | `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground` |
| emphasis | `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground` |
| state | `--destructive`, `--destructive-foreground` |
| form chrome | `--border`, `--input`, `--ring` |
| geometry | `--radius` (a length, not a colour) |

`--input` is the control surface and is meaningfully distinct from `--background`: fields read as a family because they share it. Dark mode follows the `.dark` class convention.

If your app is already a shadcn/ui codebase, you have all of these and there is nothing to do.

The authoritative list is not this table: it is the `@theme inline` block in `src/styles/tailwind-entry.css`, which is the same list in executable form, and `scripts/assert-bundle.mjs` fails the build if it and `theme.css` ever disagree. The table restates it for reading, and the secondary pair went missing from it once.

## Fallbacks, and the host that defines nothing

Every token above is read with a fallback — `var(--border, hsl(240 5.9% 90%))` — so a host that owns no design system still gets legible controls. That matters more than it sounds, because **an undefined token does not degrade, it deletes.** A `var()` that resolves to nothing makes the whole declaration invalid, the browser discards it, and the control lands on `transparent` or `canvastext`. The build is green, the stylesheet inspects correctly, and what the reader sees is a panel with no surface colour and a white label on a pale background — which reads as a contrast bug in the host's own design system and sends you looking anywhere but at a stylesheet.

Three things follow, and they are worth reading before relying on the fallbacks:

- **The fallback palette is the light one.** A fallback is frozen into each utility and cannot vary by scope, so a host that defines nothing renders light *even inside `.dark`* — the class has no tokens to switch. `theme.css` is how you get the dark defaults.
- **A fallback can never win a cascade.** It fills a hole, so it is completely inert for a host that defines the token. That is why the defaults are fallbacks rather than a `:root` block in the sheet: host tokens routinely sit in `@layer base` while this sheet arrives in a later layer, so a defaults block here would outrank the host's brand the moment a form mounted.
- **A malformed token is not a missing one.** The fallback fires only when the token is undefined. `--border: 240 5.9% 90%` — the wrapperless triplet Tailwind v3 needed — *is* defined, so `var()` returns it, no `hsl()` wrapper is ever applied, and the declaration is discarded exactly as it was before. Write whole colours.

`scripts/assert-bundle.mjs` holds all of that: the tokens the package reads are exactly the ones `theme.css` defines, each fallback carries that file's light value, and nothing in the built sheet reads a design token without one — including through an arbitrary value such as `rounded-[calc(var(--radius,0.5rem)*1.5)]`, which goes around the `@theme inline` mapping and has to spell its own.

## Host setup

### A host that runs Tailwind (the common case)

Your build has to see the package's classes, since they live in shipped JavaScript rather than in your source tree — and **that build must be Tailwind v4.** The controls are written in v4's vocabulary (`outline-hidden`, `aria-invalid:`, `data-placeholder:`, the `(--radix-…)` variable form, `wrap-break-word`), and a v3 build compiles those names to nothing: the controls render, but without their focus, invalid and placeholder states.

Add a source directive to your stylesheet, and import `tw-animate-css` — the select popover's and the tooltip's enter and exit transitions are its utilities:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@source "../node_modules/@pipelex/mthds-form/dist";
```

Then make sure your theme maps the token names the controls use. In v4 the names a utility resolves are the theme's `--color-*` and `--radius-*` keys, and the mapping this package itself uses is the `@theme inline` block in `src/styles/tailwind-entry.css` — `--color-border: var(--border, hsl(240 5.9% 90%))` and so on, over whole colours. A shadcn/ui v4 codebase already maps the same keys onto its own tokens, and that works as well: the utilities in `dist` compile against **your** theme, so what matters is that `--color-border`, `--color-input`, `--color-ring`, `--color-background`, `--color-foreground`, the `primary`/`secondary`/`destructive`/`muted`/`accent`/`popover`/`card` pairs and `--radius-lg`/`-md`/`-sm` resolve to something. That mapping is only baked into the prebuilt sheet — your own theme maps the same keys onto whatever you like, and the fallbacks are the package's business, not yours — and `inline` is what lets a wrapper lower in the tree, a `.dark` pane or a brand scope, redefine a token for its subtree.

Do **not** load `styles.css` in this setup — your own build already produces those utilities, and the prebuilt sheet carries a second copy of Tailwind's preflight.

Two v4 preflight facts the package relies on, in case your build restricts preflight: the controls name every border colour explicitly, so the default border colour is irrelevant, and the package's own stylesheet restores `cursor: pointer` on enabled buttons, which v4's preflight no longer does. A Tailwind host gets its own preflight, so the second one is worth adding to your base layer if your buttons are meant to be pointers — the controls' buttons carry no cursor class.

### A host that does not run Tailwind

Load the prebuilt stylesheet, and the default tokens with it:

```ts
import '@pipelex/mthds-form/theme.css'; // token values — see below before omitting
import '@pipelex/mthds-form/styles.css'; // the compiled utilities
```

`theme.css` is genuinely optional: the utilities carry fallbacks, so `styles.css` alone renders the controls in the light neutral palette. Load `theme.css` when you want the `.dark` class to do something, or override the tokens it defines to brand them. Loading neither and defining your own is the third route and needs no fallback at all.

One sheet covers both rendering entries: it is compiled from the utilities `src/react` and `src/generative` actually use, so a host that renders produced layouts loads the same file and nothing extra. `scripts/assert-bundle.mjs` refuses a build whose entries and the sheet's `@source` lines disagree, because an entry left out of the scan does not fail loudly — its components keep whatever utilities the other entry happens to share and lose the rest.

`styles.css` includes Tailwind's preflight (a CSS reset), which is what makes the controls render correctly with no framework underneath — and also what makes it unsuitable for a host that already has its own reset or Tailwind build.

`theme.css` is the stock shadcn/ui neutral palette, deliberately un-branded: this package renders MTHDS input specs and the surrounding product supplies the brand. Override any token in your own stylesheet after importing it, or skip it entirely and define all of them yourself — as whole colours. A triplet written in the old form still resolves to no colour at all rather than to a wrong one, and the fallback does not save you there: see “Fallbacks, and the host that defines nothing” above.

## Someone else's tokens, and how a story wears them

The token contract is a contract in both directions: everything above defines it for a host, and a **brand** is what happens when something else fills it in. A brand stylesheet sets the same custom properties on a scope class — its dark values under `.dark`, exactly as `theme.css` does — and everything below that class reads the tokens it always reads. That is the entire mechanism; nothing in the package knows a brand exists.

`src/__stories__/generative/brands/` holds two of them, compiled from real sites' tokens. They are **story fixtures**: outside both entry trees, shipped in nothing, and not reproducible here — the pipeline that read a site and wrote them stayed on the study branch. They are kept for the one question a single palette cannot answer, which is whether a page reads because of how it is laid out or because of the colours it was laid out against. See [storybook.md](storybook.md) § "Generative".

The generative layer's app bar additionally reads a **manifest** — a name, a logo pair, an optional web font — which is a different artifact from the tokens and is validated by `brandManifestSchema`. Tokens are the palette; the manifest is what the page says it is.

## Why Tailwind and not plain CSS

Considered and rejected for this package: rewriting the controls onto plain CSS over custom properties, which is the pattern `@pipelex/mthds-ui` follows. It is cleaner for a host with no Tailwind, but it would have concentrated real visual-parity risk into the extraction for no consumer that needed it, and the prebuilt stylesheet covers that host adequately. The two packages therefore speak different theming regimes on purpose; a consumer using both configures each once and they do not interact.

Revisit this if a non-Tailwind consumer finds the prebuilt sheet genuinely unworkable — the control gallery is the test suite that would make such a rewrite safe.
