/**
 * The app styles as the designer's brief names them: each style's id, its
 * name and its direction in one sentence, and nothing else.
 *
 * The styles themselves, with the roles each sets and the typefaces beside
 * them, belong to a host, which also derives the tokens a style paints with
 * (docs/theming.md, "Style tokens"). The brief only carries a style's words,
 * so this is all of a style the kernel keeps: `buildInputBrief` and
 * `buildResultBrief` take a host's stored style id and hand the method its
 * name and direction. It is the generative layer's own, never exported from
 * an entry, and it leaves when the brief stops carrying a style direction
 * and carries the name of the host's page shell instead.
 *
 * The words are the method's input, so changing one changes what the
 * designer reads: a host that matches a brief back to its style by name
 * reads the name written here.
 */

/** The id of an app style, as a host stores it. */
export type AppStyleId = 'quiet' | 'soft' | 'editorial' | 'bold';

/** A style's words, as the brief carries them. */
export interface StyleDirection {
  name: string;
  /** The direction, in one sentence, as a designer reads it. */
  direction: string;
}

/** Every style's words, keyed by its id. */
export const STYLE_DIRECTIONS: Readonly<Record<AppStyleId, StyleDirection>> = Object.freeze({
  quiet: Object.freeze({
    name: 'Quiet',
    direction:
      'The host’s own look, unstyled: its light titles and hairline panels, generous air, nothing decorated.',
  }),
  soft: Object.freeze({
    name: 'Soft',
    direction:
      'Friendly and rounded: generous corners, panels that float on a soft shadow with no outline, warm medium-weight titles.',
  }),
  editorial: Object.freeze({
    name: 'Editorial',
    direction:
      'Considered and literary: serif display titles, fine hairlines, wide margins and a reading rhythm.',
  }),
  bold: Object.freeze({
    name: 'Bold',
    direction:
      'Confident and graphic: heavy, tightly set titles, solid panels with firm edges, a compact rhythm.',
  }),
});

/** The style ids, in the order a sweep over them takes. */
export const APP_STYLE_IDS: readonly AppStyleId[] = Object.freeze([
  'quiet',
  'soft',
  'editorial',
  'bold',
]);

/** Whether `value` names one of the app styles. */
export function isAppStyle(value: unknown): value is AppStyleId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(STYLE_DIRECTIONS, value);
}
