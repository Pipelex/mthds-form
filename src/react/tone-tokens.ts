/**
 * The classes a tone is painted with: the four status tokens, `--positive`,
 * `--caution`, `--negative` and `--neutral`, a group of their own in the
 * theme (docs/theming.md, "Status colours").
 *
 * A tone is a choice option's `tone` (MTHDS `9.2.0`): how the option reads to
 * a person, never a colour, and never inferred from a value or a label. The
 * kernel maps each to its token here and nowhere else, so a host or a brand's
 * design system sets the four tokens and every badge, verdict, count and
 * option card follows.
 *
 * **The words stay in `--foreground`.** A tone reaches the page as a mark in
 * its colour - a dot, an icon, a meter's fill - and as a tinted fill and edge
 * behind the words, never as the colour of the words themselves. A host's
 * tones are held to 4.5:1 on the page, but not on a tint of themselves, and a
 * brand may set them to anything; words in `--foreground` read on the tint
 * whatever the tone, and the mark carries the tone at the 3:1 a mark needs.
 * An icon is drawn beside the dot where the tone is the point (a verdict), so
 * a reader who cannot tell the colours apart still reads it.
 *
 * They are arbitrary values written out whole, for the reason
 * `./role-tokens` gives: a Tailwind host compiles the package's classes
 * against its own theme, so a `text-positive` utility would paint only in a
 * host that maps `--color-positive`, while an arbitrary value carries its own
 * `var()` chain into every build that scans the package. Each fallback is
 * `theme.css`'s light value, as every token read around the `@theme inline`
 * mapping must spell it, and `make assert-bundle` holds them.
 */

import type { OptionTone } from 'mthds/protocol';

/** The tone's colour as a solid mark: a dot, a meter's fill. */
export const toneMarkClass: Readonly<Record<OptionTone, string>> = {
  positive: 'bg-[color:var(--positive,hsl(142_72%_29%))]',
  caution: 'bg-[color:var(--caution,hsl(26_90%_37%))]',
  negative: 'bg-[color:var(--negative,hsl(0_74%_42%))]',
  neutral: 'bg-[color:var(--neutral,hsl(240_5.2%_33.9%))]',
};

/** The tone's colour on an icon (`currentColor`), never on words. */
export const toneIconClass: Readonly<Record<OptionTone, string>> = {
  positive: 'text-[color:var(--positive,hsl(142_72%_29%))]',
  caution: 'text-[color:var(--caution,hsl(26_90%_37%))]',
  negative: 'text-[color:var(--negative,hsl(0_74%_42%))]',
  neutral: 'text-[color:var(--neutral,hsl(240_5.2%_33.9%))]',
};

/** The tone's pale fill behind words in `--foreground`: a badge, a verdict, an option card picked. */
export const toneFillClass: Readonly<Record<OptionTone, string>> = {
  positive: 'bg-[color:color-mix(in_oklab,var(--positive,hsl(142_72%_29%))_10%,transparent)]',
  caution: 'bg-[color:color-mix(in_oklab,var(--caution,hsl(26_90%_37%))_10%,transparent)]',
  negative: 'bg-[color:color-mix(in_oklab,var(--negative,hsl(0_74%_42%))_10%,transparent)]',
  neutral: 'bg-[color:color-mix(in_oklab,var(--neutral,hsl(240_5.2%_33.9%))_8%,transparent)]',
};

/** The tone's edge around that fill. */
export const toneEdgeClass: Readonly<Record<OptionTone, string>> = {
  positive: 'border-[color:color-mix(in_oklab,var(--positive,hsl(142_72%_29%))_40%,transparent)]',
  caution: 'border-[color:color-mix(in_oklab,var(--caution,hsl(26_90%_37%))_40%,transparent)]',
  negative: 'border-[color:color-mix(in_oklab,var(--negative,hsl(0_74%_42%))_40%,transparent)]',
  neutral: 'border-[color:color-mix(in_oklab,var(--neutral,hsl(240_5.2%_33.9%))_30%,transparent)]',
};
