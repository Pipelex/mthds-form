/**
 * The two optional colour tokens beyond the contract, named after the roles
 * they paint, and the classes every control and produced-layout component
 * paints them with.
 *
 * `--primary` is the button colour, and a branded button colour can be
 * anything a person picked - an amber, a pale yellow - which is a fine fill and
 * unreadable as text. So the button colour is only ever a solid fill, and the
 * two roles that want the team's accent without being a button read a token a
 * branding host defines, each derived to read on what it sits on (the
 * `./brand` entry's `deriveBrandRoles` returns them):
 *
 * - `--link`, the accent as text (`accentInk`): an eyebrow or a section number
 *   on the page, and the checkmark, tag or step number on the selected fill.
 *   `deriveBrandRoles` measures that ink against the page and against the
 *   fill, so one token serves both.
 * - `--selected`, the pale accent fill (`accentFill`) behind a selected pill
 *   or toggle, a tag or a completed step.
 *
 * Focus is not one of them: every focus the controls draw is the contract's
 * `--ring`, which a branding host sets to the accent ink as well (see
 * `./field-styles`).
 *
 * A host that defines neither gets exactly what these elements painted before
 * the tokens were read: each falls back to the `--primary` expression it
 * replaced - the token itself for text, the same `color-mix()` tint Tailwind
 * writes for `bg-primary/10` for a fill - so an unbranded page renders as it
 * always did.
 *
 * They are arbitrary values rather than named utilities on purpose. A Tailwind
 * host compiles the package's classes against its OWN theme, so a `text-link`
 * utility would exist only in a host that happened to map `--color-link`, and
 * would paint nothing anywhere else; an arbitrary value carries its own `var()`
 * chain, so every build that scans the package generates it. Each string is
 * written out whole because Tailwind finds a class by reading source text: a
 * class assembled from pieces at run time is a class no build generates. The
 * innermost fallback is `theme.css`'s light `--primary`, as every token read
 * around the `@theme inline` mapping must spell it, and `make assert-bundle`
 * holds every chain and that value. See docs/theming.md § "Link, selected and
 * focus".
 */

/** The accent as text, on the page or on the selected fill: an eyebrow, a section number, a tag, a checkmark. */
export const linkTextClass = 'text-[color:var(--link,var(--primary,hsl(240_5.9%_10%)))]';

/** The pale accent fill of something selected, falling back to `bg-primary/10`. */
export const selectedFillClass =
  'bg-[color:var(--selected,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_10%,transparent))]';

/** The same fill on a pressed item (`data-state="on"`), so it outranks the item's hover fill as `data-[state=on]:bg-primary/10` did. */
export const selectedStateFillClass =
  'data-[state=on]:bg-[color:var(--selected,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_10%,transparent))]';

/** The pale accent fill of a completed step, falling back to `bg-primary/15`. */
export const selectedFillStrongClass =
  'bg-[color:var(--selected,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_15%,transparent))]';
