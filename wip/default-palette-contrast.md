# The default palette fails AA on muted-on-muted

Found the day Storybook landed, by the `a11y` gate, on the first stories that rendered real controls.

## What

`src/styles/theme.css` ships the stock shadcn/ui neutral palette as a working default — the arrangement is that a host with its own tokens needs nothing from that file, and a host with none gets "a neutral, accessible starting point". The second half of that claim is not currently true for one pairing:

| Pairing | Ratio | Where the controls use it |
| --- | --- | --- |
| `--muted-foreground` #71717a on `--muted` / card #f4f4f5 (light) | **4.39:1** | field descriptions, the concept pill inside a card, toggle-group item labels |
| `--muted-foreground` on `--background` (light) | 4.83:1 | passes |
| `--muted-foreground` on `--background` (dark) | 7.77:1 | passes |

AA wants 4.5:1 for text this size. So the failure is specifically **muted foreground on a muted (not plain) background**, which is exactly what a description line inside a card is.

A separate, worse instance was already fixed when this was found: `text-muted-foreground/70` on the optional badge in `field-shell.tsx`, `object-field.tsx` and `list-field.tsx` measured **2.73:1** in light. Dimming an already-muted token with an opacity is what did it; those three now use the token at full opacity. That fix was safe to make immediately because it is a control-level styling choice, not a palette one.

## Why it is not fixed here

Changing `--muted-foreground` changes the default colours of every host that has not defined its own tokens. That is a deliberate design decision about a published default, and it should not ride along in a commit that adds a Storybook.

## The options, when someone picks one

1. **Darken `--muted-foreground` in the light palette** until it clears 4.5:1 against `--muted`, not just against `--background`. Smallest change; moves away from the stock shadcn value, which the file's header currently cites as the reason for the value.
2. **Stop using muted-on-muted for text.** Use `--foreground` at a smaller size, or give card surfaces a `--card-foreground`-derived muted variant. Keeps the palette stock; changes the controls.
3. **State it as a host obligation.** Document in `theming.md` that a host defining its own tokens must clear AA for this pairing, and accept the default as illustrative. Cheapest, and the weakest — it makes the default's own claim of "accessible starting point" conditional.

Option 1 or 2. Option 3 only if there is a reason to keep the stock values exactly.

## What is switched off meanwhile

`.storybook/preview.tsx` disables **only** the `color-contrast` axe rule, keeping every other rule at `test: 'error'`. Turn it back on in the same change that fixes the palette; a story that regresses a label or an aria wiring still fails today.
