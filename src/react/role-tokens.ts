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
 *   or toggle, a chosen file, a tag or a completed step.
 *
 * A selected pill and a tag are also outlined in the accent: their border is
 * `--link` at 40%, so nothing selected keeps the button colour in its edge,
 * and a native radio or check box is checked in the accent ink.
 *
 * Focus is not one of them: every focus the controls draw is the contract's
 * `--ring`, which a branding host sets to the accent ink as well (see
 * `./field-styles`). A form's field draws it as its border and a vendored
 * primitive as a ring; everything else in the tab order draws
 * `focusOutlineClass` below, or `focusOutlineInsetClass` where the element
 * fills its container, or, on a frame, the same inset outline as
 * `frameFocusOutlineClass`, so the outline is spelled in one place.
 *
 * A host that defines neither gets exactly what these elements painted before
 * the tokens were read: each falls back to the `--primary` expression it
 * replaced - the token itself for text, the same `color-mix()` tint Tailwind
 * writes for `bg-primary/10` for a fill, and the same mix at 40% for an edge,
 * which was `border-primary/40` - so an unbranded page renders as it always
 * did.
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

/** The same fill on a chosen row (`aria-checked="true"`), so it outranks the row's neutral hover fill as a pressed item's does. */
export const selectedCheckedFillClass =
  'aria-checked:bg-[color:var(--selected,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_10%,transparent))]';

/** The pale accent fill of a completed step, falling back to `bg-primary/15`. */
export const selectedFillStrongClass =
  'bg-[color:var(--selected,color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_15%,transparent))]';

/** The accent's edge around something selected, `--link` at 40%, falling back to `border-primary/40`. */
export const selectedBorderClass =
  'border-[color:color-mix(in_oklab,var(--link,var(--primary,hsl(240_5.9%_10%)))_40%,transparent)]';

/** The same edge on a pressed item (`data-state="on"`), as `data-[state=on]:border-primary/40` drew it. */
export const selectedStateBorderClass =
  'data-[state=on]:border-[color:color-mix(in_oklab,var(--link,var(--primary,hsl(240_5.9%_10%)))_40%,transparent)]';

/** The same edge under the pointer, around a list's "Add item", which drew the button colour at 40% there. */
export const selectedHoverBorderClass =
  'hover:border-[color:color-mix(in_oklab,var(--link,var(--primary,hsl(240_5.9%_10%)))_40%,transparent)]';

/** The checked colour of a native radio or check box: the accent ink, falling back to the button colour it was checked in. */
export const checkedAccentClass = 'accent-[color:var(--link,var(--primary,hsl(240_5.9%_10%)))]';

/**
 * The keyboard focus of everything in the tab order that draws it neither as a
 * field's border nor as a primitive's ring: a solid 2px outline in `--ring`,
 * 1px clear of the element. The style is
 * stated, not left to Tailwind's `--tw-outline-style` default, so the outline
 * is drawn whatever else sets that variable.
 */
export const focusOutlineClass =
  'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring';

/**
 * The same outline drawn 2px inside the element's edge, for a row, a frame or
 * a scroll region that fills its container, where an outline outside it would
 * be clipped or would cross its neighbour.
 */
export const focusOutlineInsetClass =
  'focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';

/**
 * The inset outline on a frame, drawn on the `data-focus-visible` that
 * `FocusFrame` sets, because no focus selector matches a frame whose document
 * holds focus (see `./focus-frame`).
 */
export const frameFocusOutlineClass =
  'data-focus-visible:outline-solid data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-ring';
