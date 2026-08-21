# Theming

The controls are styled with Tailwind utility classes over CSS custom properties — the standard shadcn/ui semantic tokens. No colour is ever a literal. That is the entire theming contract: **define the tokens, and the controls look like your product.**

## The tokens

Each is an HSL triplet without the `hsl()` wrapper, as shadcn/ui defines them (`--background: 0 0% 100%`), because Tailwind composes them with an alpha channel.

| | |
| --- | --- |
| surfaces | `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground` |
| emphasis | `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground` |
| state | `--destructive`, `--destructive-foreground` |
| form chrome | `--border`, `--input`, `--ring` |
| geometry | `--radius` (a length, not a triplet) |

`--input` is the control surface and is meaningfully distinct from `--background`: fields read as a family because they share it. Dark mode follows the `.dark` class convention.

If your app is already a shadcn/ui codebase, you have all of these and there is nothing to do.

## Host setup

### A host that runs Tailwind (the common case)

Your build has to see the package's classes, since they live in shipped JavaScript rather than in your source tree.

Tailwind v3 — add the package to `content`:

```js
content: ['./src/**/*.{ts,tsx}', './node_modules/@pipelex/mthds-form/dist/**/*.js'],
```

Tailwind v4 — add a source directive to your stylesheet:

```css
@source "../node_modules/@pipelex/mthds-form/dist";
```

Either way you also need `tailwindcss-animate` in your plugins: the select popover's enter and exit transitions are its utilities. Do **not** load `styles.css` in this setup — your own build already produces those utilities, and the prebuilt sheet carries a second copy of Tailwind's preflight.

### A host that does not run Tailwind

Load the prebuilt stylesheet, and the default tokens with it:

```ts
import '@pipelex/mthds-form/theme.css'; // token values — omit if you define your own
import '@pipelex/mthds-form/styles.css'; // the compiled utilities
```

`styles.css` includes Tailwind's preflight (a CSS reset), which is what makes the controls render correctly with no framework underneath — and also what makes it unsuitable for a host that already has its own reset or Tailwind build.

`theme.css` is the stock shadcn/ui neutral palette, deliberately un-branded: this package renders MTHDS input specs and the surrounding product supplies the brand. Override any token in your own stylesheet after importing it, or skip it entirely and define all of them yourself.

## Why Tailwind and not plain CSS

Considered and rejected for this package: rewriting the controls onto plain CSS over custom properties, which is the pattern `@pipelex/mthds-ui` follows. It is cleaner for a host with no Tailwind, but it would have concentrated real visual-parity risk into the extraction for no consumer that needed it, and the prebuilt stylesheet covers that host adequately. The two packages therefore speak different theming regimes on purpose; a consumer using both configures each once and they do not interact.

Revisit this if a non-Tailwind consumer finds the prebuilt sheet genuinely unworkable — the control gallery is the test suite that would make such a rewrite safe.
