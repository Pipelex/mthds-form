/**
 * The classes every heading, panel and call to action the controls and the
 * generative layer draw read a page's style through: the optional tokens a
 * host sets from the roles `./brand`'s `deriveStyleRoles` returns.
 *
 * - `--font-heading`, `--heading-weight` and `--heading-tracking`: the face,
 *   the weight and the letter spacing of a heading - a page's title, a
 *   section's, a panel's, a dialog's, a heading in a typeset result. A
 *   structure's name over its fields takes the face alone: it labels a group
 *   rather than titling the page, so it keeps the kernel's weight. An
 *   uppercase eyebrow is not a title and reads none.
 * - `--panel-fill`, `--panel-edge`, `--panel-edge-width` and `--panel-shadow`:
 *   a panel the generative layer draws on the page, its rail and its card,
 *   each marked `data-style-panel` so a host can write the style's field fill
 *   onto `--input` inside it, as on its own panel. A group inside a panel is
 *   not a panel and reads none.
 * - `--action-shadow`: a designed page's call to action.
 *
 * Each read carries the value the element painted before it read the token,
 * so a host that sets none renders exactly as it always did: a heading keeps
 * its face, its own weight and its own tracking; the rail keeps
 * its large shadow and the card none; the call to action keeps its glow in
 * the button colour. `theme.css` defines none of them, since a value there
 * would win over the fallback for every host loading it, and
 * `make assert-bundle` holds each read to its fallback. See docs/theming.md
 * § "Style tokens".
 *
 * They are arbitrary properties, written out whole, for the reason
 * `./role-tokens` gives: a host's Tailwind build compiles the package's
 * classes against its own theme, and finds a class only by reading it whole
 * in source. A token read around the `@theme inline` mapping spells
 * `theme.css`'s light value as its innermost fallback.
 */

/**
 * A heading's face: the style's heading face, or whatever the heading wore
 * before. `revert-layer` rolls the property back past the utilities layer,
 * so a host's own stylesheet for its headings, in an earlier layer, still
 * applies, and a heading no rule sets inherits its face, as it did. It rolls
 * back any other utility setting the same property on that element too, so a
 * heading that reads it is given no other face or tracking utility.
 */
export const headingFaceClass = '[font-family:var(--font-heading,revert-layer)]';

/** A heading's letter spacing: the style's, or whatever it wore before (see `headingFaceClass`). */
export const headingTrackingClass = '[letter-spacing:var(--heading-tracking,revert-layer)]';

/** A heading's letter spacing: the style's, or Tailwind's `tracking-tight` it was set in. */
export const headingTrackingTightClass = '[letter-spacing:var(--heading-tracking,-0.025em)]';

/** A heading's weight: the style's, or the weight it was set in. */
export const headingWeightClass = {
  500: '[font-weight:var(--heading-weight,500)]',
  600: '[font-weight:var(--heading-weight,600)]',
  700: '[font-weight:var(--heading-weight,700)]',
} as const;

/**
 * A heading in the style: its face, its weight (falling back to `weight`) and
 * its tracking (falling back to `tracking-tight` when `tight`, else to what it
 * wore before). The size and the leading stay the element's own.
 */
export function headingClass(weight: keyof typeof headingWeightClass, tight = false): string {
  return [
    headingFaceClass,
    headingWeightClass[weight],
    tight ? headingTrackingTightClass : headingTrackingClass,
  ].join(' ');
}

/**
 * A panel's surface in the style: its fill, its edge and the edge's width,
 * falling back to the card on a hairline it was drawn as.
 */
export const panelSurfaceClass =
  '[border-style:solid] [border-width:var(--panel-edge-width,1px)] [border-color:var(--panel-edge,var(--border,hsl(240_5.9%_90%)))] [background-color:var(--panel-fill,var(--card,hsl(0_0%_100%)))]';

/** A panel that floated on a large shadow (`shadow-xl`): the style's shadow, or that one. */
export const panelRaisedShadowClass =
  '[box-shadow:var(--panel-shadow,0_20px_25px_-5px_rgb(0_0_0/0.1),0_8px_10px_-6px_rgb(0_0_0/0.1))]';

/** A panel that had no shadow: the style's shadow, or none. */
export const panelFlatShadowClass = '[box-shadow:var(--panel-shadow,none)]';

/**
 * The call to action's shadow: the style's, or the glow in the button colour
 * it had, stronger under the pointer. Focus is never drawn as a box-shadow
 * beside it: this class would replace a `focus-visible:` ring, so a style's
 * shadow would hide where focus is. The call to action wears
 * `focusOutlineClass` instead, an outline no shadow touches.
 */
export const actionShadowClass =
  '[box-shadow:var(--action-shadow,0_0_28px_color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_35%,transparent))] hover:[box-shadow:var(--action-shadow,0_0_44px_color-mix(in_oklab,var(--primary,hsl(240_5.9%_10%))_50%,transparent))]';
