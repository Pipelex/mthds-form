# The default palette fails AA on more than one pairing

Found the day Storybook landed, by the `a11y` gate, on the first stories that rendered real controls. Widened on 2026-09-06 during the review of the token-fallback change, which measured the rest of the palette and changed who sees it.

## What

`src/styles/theme.css` ships the stock shadcn/ui neutral palette as a working default — the arrangement is that a host with its own tokens needs nothing from that file, and a host with none gets "a neutral, accessible starting point". The second half of that claim is not currently true for one pairing:

| Pairing | Ratio | Needs | Where the controls use it |
| --- | --- | --- | --- |
| `--destructive` #ef4444 on `--background` / `--card` #ffffff (light) | **3.76:1** | 4.5:1 | every error message the package paints — `field-shell.tsx`, `object-field.tsx`, `list-field.tsx`, `file-field.tsx`, and the generative arms |
| white on `--destructive` #ef4444 (light) | **3.76:1** | 4.5:1 | the danger badge and danger button in `src/generative/ui/shadcn.tsx`, which pair `bg-destructive` with `text-white` |
| `--muted-foreground` #71717a on `--muted` / card #f4f4f5 (light) | **4.39:1** | 4.5:1 | field descriptions, the concept pill inside a card, toggle-group item labels |
| `--border` #e4e4e7 on `--background` #ffffff (light) | **1.27:1** | 3:1 | every field, card and table edge — WCAG 1.4.11, the boundary that identifies a control |
| `--input` #f4f4f5 on `--background` #ffffff (light) | **1.10:1** | 3:1 | the text-input surface itself (`field-styles.ts`), so a field has no boundary reaching 3:1 |
| `--muted-foreground` on `--background` (light) | 4.83:1 | 4.5:1 | passes |
| `--muted-foreground` on `--background` (dark) | 7.77:1 | 4.5:1 | passes |

AA wants 4.5:1 for text at these sizes and 1.4.11 wants 3:1 for the visual boundary of a control. Two distinct failures, then: **muted foreground on a muted (not plain) background**, which is exactly what a description line inside a card is; and **the destructive red**, which is the one colour a reader is meant to notice and the one that measures worst.

`--destructive-foreground` is defined and themed but never actually paired with `bg-destructive` — the controls use `text-white` — so its own 3.60:1 against the same red is not a live pairing. It is worth fixing in the same pass, because the token exists to be that pairing.

## What the fallbacks changed, and why the decision got more urgent

The token-fallback change (`## [Unreleased]`, the prebuilt stylesheet no longer needs the host to define anything) did not touch a single palette value, and it moved every one of these ratios from "what a host loading `theme.css` sees" to "what every host sees". Before it, a host that defined no tokens lost those declarations outright: error text inherited the ambient foreground at 19.9:1 — legible, just not red — and a border fell back to `currentColor`, which is a visible edge. After it, the fallbacks are the floor, so the numbers above are the package's default rendering rather than an opt-in one.

So the change is right and the measurement is unchanged; what moved is the reach. That is the argument for taking the decision below now rather than later.

A separate, worse instance was already fixed when this was found: `text-muted-foreground/70` on the optional badge in `field-shell.tsx`, `object-field.tsx` and `list-field.tsx` measured **2.73:1** in light. Dimming an already-muted token with an opacity is what did it; those three now use the token at full opacity. That fix was safe to make immediately because it is a control-level styling choice, not a palette one.

## Why it is not fixed here

Changing `--muted-foreground` changes the default colours of every host that has not defined its own tokens. That is a deliberate design decision about a published default, and it should not ride along in a commit that adds a Storybook.

## The options, when someone picks one

1. **Darken `--muted-foreground` in the light palette** until it clears 4.5:1 against `--muted`, not just against `--background`. Smallest change; moves away from the stock shadcn value, which the file's header currently cites as the reason for the value.
2. **Stop using muted-on-muted for text.** Use `--foreground` at a smaller size, or give card surfaces a `--card-foreground`-derived muted variant. Keeps the palette stock; changes the controls.
3. **State it as a host obligation.** Document in `theming.md` that a host defining its own tokens must clear AA for this pairing, and accept the default as illustrative. Cheapest, and the weakest — it makes the default's own claim of "accessible starting point" conditional.

Option 1 or 2. Option 3 only if there is a reason to keep the stock values exactly.

The destructive and boundary rows are option 1 either way — nothing about a control's markup fixes a red that measures 3.76:1 against white, or an edge at 1.27:1. Roughly `hsl(0 72% 45%)` or darker clears 4.5:1 for the red, and roughly `hsl(240 5% 70%)` clears 3:1 for `--border`. Whatever is chosen has to be chosen for both palettes and for the fallbacks together, since `scripts/assert-bundle.mjs` now requires each fallback to carry `theme.css`'s light value and `.dark` to restate every token.

## What is switched off meanwhile

`.storybook/preview.tsx` disables **only** the `color-contrast` axe rule, keeping every other rule at `test: 'error'`. Turn it back on in the same change that fixes the palette; a story that regresses a label or an aria wiring still fails today. The suppression stands in front of every pairing in the table above, which is the reason its comment names them rather than just the first one found — a blanket switch-off whose recorded reason covers one row is how the rest went unmeasured for a while.
