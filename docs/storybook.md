# Storybook

`make storybook` (or `make st`) serves the stories on port 6006; `make build-storybook` produces the static build. The stories also run as tests — `make test` executes them in headless Chromium as a third vitest project — so a story is regression coverage whether or not anyone opens it.

## What it is for, and what it is not

The `src/react/__tests__/` suites already assert the DOM facts: an input has an accessible name, a button is disabled mid-upload, a value round-trips. Those are the assertions that belong in jsdom, and Storybook does not repeat them.

What nothing else in this repo can answer is whether a control **renders correctly, in both themes, across every input shape the standard can produce**. That is the question the stories exist for. Read a failing story as "this looks wrong", and a failing unit test as "this behaves wrong"; when the two disagree, the unit test is the contract.

## Every story renders in both themes

Dark mode is the `.dark` class convention ([theming.md](theming.md), Tailwind `darkMode: 'class'`). The `ThemePair` decorator in `.storybook/theme-pair.tsx` renders each story **twice, side by side** — one light pane, one `.dark` pane — and that is the default view rather than a toolbar toggle, because a toggle hides half the answer behind a click. The toolbar is still there for anyone who wants one pane full width.

Two consequences worth knowing before writing a story:

- **A `play` function sees the story twice.** Assert with `getAllByText(...)` and a length of two, not `getByText`, which throws on the second match.
- **The decorator's own chrome must clear the a11y bar too.** `a11y` runs at `test: 'error'` here (a consumer's Storybook can afford `todo`; this repo owns the controls). A violation in the decorator is reported against whichever story was running, so decorator chrome uses `--muted-foreground` at full opacity rather than a dimmed `--foreground` — the latter blends against the pane background to a colour that fails WCAG AA contrast at caption size.

## Styling: source, not the prebuilt sheet

`.storybook/preview.tsx` loads `src/styles/theme.css` and `src/styles/tailwind-entry.css`, and `.storybook/main.ts` runs the Tailwind plugin over them through an inline postcss pass.

This is deliberately **not** what a consumer's Storybook does. A consumer with no Tailwind build loads the prebuilt `dist/styles.css`; this repo has a Tailwind build, and pointing its own Storybook at the prebuilt artifact would defeat the purpose — a control styled with a utility that is not in the last built `styles.css` would render unstyled in the very Storybook meant to catch that.

The Tailwind plugin is declared inline in `viteFinal` rather than through a root `postcss.config.cjs`, because the Tailwind CLI behind `npm run build:css` would pick up a root postcss config too and run the plugin twice over the same entry.

Note that `tailwind.config.cjs` scans `src/react/**` only, and that stays true: story chrome uses inline styles over the theme tokens, never Tailwind utilities. Widening those content globs to cover story code would put utilities into a consumer's stylesheet that no control uses.

## Where story code lives, and why it matters

Stories live in `src/__stories__/`, **outside both entry trees**. `tsup.config.ts` globs `src/core/*.ts` and `src/react/index.ts`, and `scripts/assert-bundle.mjs` walks what those entries reach — so a story helper placed inside either tree would enter a shipped chunk and count against the [dependency budget](dependency-budget.md). Keeping story code in its own directory is what keeps the bundle invariants meaningful.

Lint restates the two budget rules that must still hold for story code (`eslint.config.mjs`): the framework bans, and `mthds` staying types-only. The core-barrel rule deliberately does not apply — a story is a consumer, and a consumer imports from the entry point as published.
