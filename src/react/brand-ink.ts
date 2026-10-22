/**
 * The brand's colours as text, as a pale fill behind that text, and as a focus
 * indicator: the classes every control and produced-layout component paints
 * them with.
 *
 * `--primary` is the button colour, and a branded button colour can be
 * anything a person picked - an amber, a pale yellow - which is a fine fill and
 * unreadable as text or as an outline. So the button colour is only ever a
 * solid fill, and everything else that wants the brand's colour reads one of
 * three optional tokens a branding host defines, each derived to read on what
 * it sits on (the `./brand` entry's `deriveBrandRoles` returns them):
 *
 * - `--brand`, the accent as text on the page (`accentInk`), which also paints
 *   a field's focus border: it reads at 4.5:1 on the page, so it always clears
 *   the 3:1 a focus indicator needs.
 * - `--brand-muted`, the pale accent fill (`accentFill`) behind a selected
 *   pill, a tag or a completed step.
 * - `--brand-muted-foreground`, the text or icon on that fill (`accentInk`,
 *   which `deriveBrandRoles` measures against the fill as well as the page).
 *
 * A host that defines none of them gets exactly what these elements painted
 * before the tokens were read: each falls back to the `--primary` expression
 * it replaced - the token itself for text and the focus border, the same
 * `color-mix()` tint Tailwind writes for `bg-primary/10` for a fill - so an
 * unbranded page renders as it always did.
 *
 * They are arbitrary values rather than named utilities on purpose. A Tailwind
 * host compiles the package's classes against its OWN theme, so a `text-brand`
 * utility would exist only in a host that happened to map `--color-brand`, and
 * would paint nothing anywhere else; an arbitrary value carries its own `var()`
 * chain, so every build that scans the package generates it. Each string is
 * written out whole because Tailwind finds a class by reading source text: a
 * class assembled from pieces at run time is a class no build generates. The
 * innermost fallback is `theme.css`'s light `--primary`, as every token read
 * around the `@theme inline` mapping must spell it, and `make assert-bundle`
 * holds every chain and that value. See docs/theming.md § "Brand ink".
 */

/** Brand-coloured text on the page: an eyebrow, a section number. */
export const brandInkClass = 'text-[color:var(--brand,var(--primary,hsl(240_5.9%_10%)))]';

/** Brand-coloured text or an icon on the pale brand fill: a tag, a checkmark, a step's number. */
export const brandFillInkClass =
  'text-[color:var(--brand-muted-foreground,var(--brand,var(--primary,hsl(240_5.9%_10%))))]';

/** The pale brand fill behind brand-coloured text, falling back to `bg-primary/10`. */
export const brandFillClass =
  'bg-[color:var(--brand-muted,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_10%,transparent))]';

/** The same fill on a selected item (`data-state="on"`), so it outranks the item's hover fill as `data-[state=on]:bg-primary/10` did. */
export const brandFillSelectedClass =
  'data-[state=on]:bg-[color:var(--brand-muted,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_10%,transparent))]';

/** The pale brand fill of a completed step, falling back to `bg-primary/15`. */
export const brandFillStrongClass =
  'bg-[color:var(--brand-muted,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_15%,transparent))]';

/** A field's focus: the border in the brand's ink and a ring of it at 40%, as `border-primary` and `ring-primary/40` were. */
export const brandFocusClass =
  'focus-visible:border-[color:var(--brand,var(--primary,hsl(240_5.9%_10%)))] focus-visible:ring-[color:color-mix(in_oklab,var(--brand,var(--primary,hsl(240_5.9%_10%)))_40%,transparent)]';
