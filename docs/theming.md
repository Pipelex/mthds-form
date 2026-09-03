# Theming

The controls are styled with Tailwind utility classes over CSS custom properties — the standard shadcn/ui semantic tokens. No colour is ever a literal. That is the entire theming contract: **define the tokens, and the controls look like your product.**

## The tokens

Each is a whole CSS colour, in any syntax a browser accepts — `hsl(0 0% 100%)`, `oklch(0.7 0.15 170)`, `#00bb95` — as modern shadcn/ui defines them under Tailwind v4. They used to be HSL triplets without the `hsl()` wrapper, which was how Tailwind v3 composed an alpha channel onto a token; v4 composes an opacity modifier with `color-mix()` over the whole colour, so the wrapperless form stopped being a constraint and is gone. The move also lets a design-token pipeline emit the contract directly: a token tool writes whole colours, and none writes triplets.

| | |
| --- | --- |
| surfaces | `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground` |
| emphasis | `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground` |
| state | `--destructive`, `--destructive-foreground` |
| form chrome | `--border`, `--input`, `--ring` |
| geometry | `--radius` (a length, not a colour) |

`--input` is the control surface and is meaningfully distinct from `--background`: fields read as a family because they share it. Dark mode follows the `.dark` class convention.

The same contract is stated as data in the generative study's brand pipeline (`src/__stories__/generative/brand/contract.ts`, a table of which design token sets which of these properties), where a node test keeps it equal to this file's `:root` and `.dark` blocks. That pipeline compiles a DTCG token file into a stylesheet setting these properties on a scope class — which is a working demonstration that a token tool can emit this contract directly, and the reason the tokens are whole colours.

If your app is already a shadcn/ui codebase, you have all of these and there is nothing to do.

## Host setup

### A host that runs Tailwind (the common case)

Your build has to see the package's classes, since they live in shipped JavaScript rather than in your source tree — and **that build must be Tailwind v4.** The controls are written in v4's vocabulary (`outline-hidden`, `aria-invalid:`, `data-placeholder:`, the `(--radix-…)` variable form, `wrap-break-word`), and a v3 build compiles those names to nothing: the controls render, but without their focus, invalid and placeholder states.

Add a source directive to your stylesheet, and import `tw-animate-css` — the select popover's and the tooltip's enter and exit transitions are its utilities:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@source "../node_modules/@pipelex/mthds-form/dist";
```

Then make sure your theme maps the token names the controls use. In v4 the names a utility resolves are the theme's `--color-*` and `--radius-*` keys, and the mapping this package itself uses is the `@theme inline` block in `src/styles/tailwind-entry.css` — `--color-border: var(--border)` and so on, over whole colours. A shadcn/ui v4 codebase already maps the same keys onto its own tokens, and that works as well: the utilities in `dist` compile against **your** theme, so what matters is that `--color-border`, `--color-input`, `--color-ring`, `--color-background`, `--color-foreground`, the `primary`/`secondary`/`destructive`/`muted`/`accent`/`popover`/`card` pairs and `--radius-lg`/`-md`/`-sm` resolve to something. The bare `var()` mapping is only baked into the prebuilt sheet, and `inline` is what lets a wrapper lower in the tree — a `.dark` pane, a brand scope — redefine a token for its subtree.

Do **not** load `styles.css` in this setup — your own build already produces those utilities, and the prebuilt sheet carries a second copy of Tailwind's preflight.

Two v4 preflight facts the package relies on, in case your build restricts preflight: the controls name every border colour explicitly, so the default border colour is irrelevant, and the package's own stylesheet restores `cursor: pointer` on enabled buttons, which v4's preflight no longer does. A Tailwind host gets its own preflight, so the second one is worth adding to your base layer if your buttons are meant to be pointers — the controls' buttons carry no cursor class.

### A host that does not run Tailwind

Load the prebuilt stylesheet, and the default tokens with it:

```ts
import '@pipelex/mthds-form/theme.css'; // token values — omit if you define your own
import '@pipelex/mthds-form/styles.css'; // the compiled utilities
```

`styles.css` includes Tailwind's preflight (a CSS reset), which is what makes the controls render correctly with no framework underneath — and also what makes it unsuitable for a host that already has its own reset or Tailwind build.

`theme.css` is the stock shadcn/ui neutral palette, deliberately un-branded: this package renders MTHDS input specs and the surrounding product supplies the brand. Override any token in your own stylesheet after importing it, or skip it entirely and define all of them yourself — as whole colours. The prebuilt sheet reads each token with a bare `var()`, so a triplet written in the old form resolves to no colour at all rather than to a wrong one.

## Why Tailwind and not plain CSS

Considered and rejected for this package: rewriting the controls onto plain CSS over custom properties, which is the pattern `@pipelex/mthds-ui` follows. It is cleaner for a host with no Tailwind, but it would have concentrated real visual-parity risk into the extraction for no consumer that needed it, and the prebuilt stylesheet covers that host adequately. The two packages therefore speak different theming regimes on purpose; a consumer using both configures each once and they do not interact.

Revisit this if a non-Tailwind consumer finds the prebuilt sheet genuinely unworkable — the control gallery is the test suite that would make such a rewrite safe.
