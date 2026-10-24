import { MIN_CONTRAST } from './contract';
import { colorHex, contrastRatio, type SrgbColor } from './tokens';

/**
 * Up to three seed colours in, the colour roles a page paints with out.
 *
 * A team brands its pages with at most three colours, each optional, each a
 * `#rrggbb` a person picked: the button colour (`action`), the accent
 * (`accent`) and the header band (`header`). A person picks a colour for how
 * it looks, never for how text reads on it, so nothing here assumes a seed is
 * readable. What this derives is everything a page needs around the seeds,
 * with every text role readable by construction:
 *
 * - **Fills are the seeds, exactly.** `action`, `accent` and `header` come
 *   back as they were given, in lower case, so the button and the band are the
 *   colours the person chose.
 * - **Text on a fill is pure black or pure white**, whichever contrasts more
 *   (`onAction`, `onHeader`). One of the two reaches at least 4.58:1 on any
 *   colour, so every label clears WCAG AA. Only the two extremes carry that
 *   guarantee: a warm near-black or an off-white falls below 4.5:1 on some
 *   mid-tone, so no other colour is ever returned for text.
 * - **The accent as text is ink** (`accentInk`): the accent darkened on a
 *   light page or lightened on a dark one, keeping its hue and saturation,
 *   just until it reads at 4.5:1 on the page and on the pale accent fill, the
 *   two backgrounds a host draws accent text on. An accent that already reads
 *   is its own ink.
 * - **The pale accent fill** (`accentFill`) is the accent laid over the page
 *   at a low strength: a pale tint on a light page, a deep one on a dark page.
 *
 * **An unset seed produces no role.** The roles a seed paints are present
 * when it is set and absent when it is not, so a host keeps its own token for
 * whatever the team left unset: the team's colours where it chose some, and
 * the host's palette everywhere else. The one seed that reaches further is the
 * button colour, which the accent follows when the accent is unset, so a red
 * button never sits beside links in another hue. With no seed at all, there
 * is no colour role to return.
 *
 * The page colour is an argument because every text role is measured against
 * it: a host renders a light and a dark theme, and it calls this once per
 * theme with that theme's page colour and that theme's seeds. Which seeds a
 * theme uses is the host's to decide; `resolveDarkSeeds` is the rule for a
 * dark set that falls back, colour by colour, to the light one.
 *
 * It returns roles, never custom property names: each host maps the roles onto
 * its own tokens. See docs/brand.md § "Three seed colours".
 */

/**
 * The contrast a control's outline needs against what surrounds it: WCAG 2's
 * level for a user interface component (1.4.11). A button colour below it
 * against the page is a button whose shape is hard to see.
 */
export const MIN_CONTROL_CONTRAST = 3;

/**
 * How strongly the accent is laid over the page to make the pale accent fill:
 * the same order as a control's `bg-primary/10` and `bg-primary/15` tints.
 */
const ACCENT_FILL_STRENGTH = 0.12;

/**
 * How many halvings the searches below run. Thirty-two pins a lightness far
 * below the step a byte can express, so the result is the first colour that
 * reads, to the byte.
 */
const SEARCH_STEPS = 32;

/**
 * Up to three seed colours, each `#rrggbb` in any case, or unset. `null` and
 * `undefined` both mean unset, so a host can pass a team's stored colours as
 * they arrive.
 */
export interface BrandSeeds {
  /** The button colour: the run button, every main button, the selected state of a pill. */
  action?: string | null;
  /** The accent: links, the active tab, the upload area on hover, progress. */
  accent?: string | null;
  /** The band across the top of the page, behind the logo. */
  header?: string | null;
}

/** Text on a fill: only the two colours that read on every fill. */
export type TextOnFill = '#000000' | '#ffffff';

/** The button colour's roles, present when the button colour is set. */
interface ActionRoles {
  /** The button colour, as a fill. Never text. */
  action: string;
  /** Text and icons on the button colour. */
  onAction: TextOnFill;
}

/** The accent's roles, present when the accent or the button colour it follows is set. */
interface AccentRoles {
  /** The accent, as a fill: an active tab's underline, a progress bar. Never text. */
  accent: string;
  /** A pale accent fill (deep on a dark page), behind accent ink: a pill, a badge. */
  accentFill: string;
  /** The accent as text, reading at 4.5:1 or more on the page and on `accentFill`. */
  accentInk: string;
}

/** The header band's roles, present when the header is set. */
interface HeaderRoles {
  /** The header band, as a fill. */
  header: string;
  /** Text on the header band: the back link, a wordmark. */
  onHeader: TextOnFill;
}

/** A group of roles that is either all there or not there at all. */
type Absent<Roles> = { [Role in keyof Roles]?: never };

/**
 * The colours a page paints with, each `#rrggbb` in lower case. The roles come
 * in groups, each present whole or absent whole: checking one role of a group
 * (`roles.action !== undefined`) narrows the rest of it.
 */
export type BrandRoles = (ActionRoles | Absent<ActionRoles>) &
  (AccentRoles | Absent<AccentRoles>) &
  (HeaderRoles | Absent<HeaderRoles>);

/**
 * The roles a page paints with, from up to three seeds and the colour of the
 * page they render on. Throws when a seed or the page is not a `#rrggbb`
 * colour: a host validates what a person typed before it reaches here.
 */
export function deriveBrandRoles(seeds: BrandSeeds | null | undefined, page: string): BrandRoles {
  const canvas = parseHex(page, 'The page colour');
  const action = seeds?.action == null ? null : parseHex(seeds.action, 'The action seed');
  // An unset accent follows the button colour, and is unset too when that is.
  const accent = seeds?.accent == null ? action : parseHex(seeds.accent, 'The accent seed');
  const header = seeds?.header == null ? null : parseHex(seeds.header, 'The header seed');

  const actionRoles: ActionRoles | Absent<ActionRoles> =
    action === null ? {} : { action: colorHex(action), onAction: textOn(action) };
  const accentRoles: AccentRoles | Absent<AccentRoles> =
    accent === null ? {} : accentRolesOf(accent, canvas);
  const headerRoles: HeaderRoles | Absent<HeaderRoles> =
    header === null ? {} : { header: colorHex(header), onHeader: textOn(header) };
  return { ...actionRoles, ...accentRoles, ...headerRoles };
}

/** The accent as a fill, its pale fill on the page, and its ink on both. */
function accentRolesOf(accent: SrgbColor, canvas: SrgbColor): AccentRoles {
  // The way accent text moves is the way text on the page moves: toward
  // whichever of black and white reads better there, which always reaches
  // 4.58:1 on the page itself, so the ink's search always has an end.
  const extreme = textOn(canvas) === '#000000' ? BLACK : WHITE;
  const accentFill = paleFill(accent, canvas, extreme);
  const accentInk = inkFor(accent, [canvas, accentFill], extreme);
  return {
    accent: colorHex(accent),
    accentFill: colorHex(accentFill),
    accentInk: colorHex(accentInk),
  };
}

/**
 * Whether the button colour sits below 3:1 against the page, so a button may
 * be hard to see in that theme. Only a colour the person set is judged: with
 * no button colour the button is the host's own, and the answer is `false`.
 */
export function isActionFaint(seeds: BrandSeeds | null | undefined, page: string): boolean {
  const canvas = parseHex(page, 'The page colour');
  if (seeds?.action == null) return false;
  return contrastRatio(parseHex(seeds.action, 'The action seed'), canvas) < MIN_CONTROL_CONTRAST;
}

/**
 * Whether the accent had to be darkened or lightened to become ink on the
 * page, so links read in a shade of it rather than in the colour itself. Only
 * a colour the person set is judged, and the accent counts as set when it
 * follows a button colour the person set: with neither, the answer is `false`.
 */
export function isAccentAdjusted(seeds: BrandSeeds | null | undefined, page: string): boolean {
  const roles = deriveBrandRoles(seeds, page);
  return roles.accentInk !== undefined && roles.accentInk !== roles.accent;
}

/**
 * The seeds a dark theme uses: each dark colour where one is set, and the
 * light one where it is not. Colour by colour, before the accent follows the
 * button colour in `deriveBrandRoles`, so a light accent the person set
 * outranks a dark button colour the accent would otherwise follow. A colour
 * set in neither stays unset. Either set may be absent.
 */
export function resolveDarkSeeds(
  colors: BrandSeeds | null | undefined,
  darkColors: BrandSeeds | null | undefined,
): BrandSeeds {
  return {
    action: darkColors?.action ?? colors?.action ?? null,
    accent: darkColors?.accent ?? colors?.accent ?? null,
    header: darkColors?.header ?? colors?.header ?? null,
  };
}

/** Pure black or pure white, whichever reads better on a `#rrggbb` fill. */
export function readableTextOn(fill: string): TextOnFill {
  return textOn(parseHex(fill, 'The fill'));
}

const BLACK: SrgbColor = { colorSpace: 'srgb', components: [0, 0, 0], alpha: 1 };
const WHITE: SrgbColor = { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 };

/** Ties go to black: on a colour where both measure the same, either clears 4.58:1. */
function textOn(fill: SrgbColor): TextOnFill {
  return contrastRatio(BLACK, fill) >= contrastRatio(WHITE, fill) ? '#000000' : '#ffffff';
}

function parseHex(value: string, what: string): SrgbColor {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`${what} must be a #rrggbb colour, not ${JSON.stringify(value)}.`);
  }
  const channel = (at: number) => parseInt(value.slice(at, at + 2), 16) / 255;
  return { colorSpace: 'srgb', components: [channel(1), channel(3), channel(5)], alpha: 1 };
}

/**
 * A colour as a hex can carry it, each channel rounded to its byte. Every
 * contrast below is measured on this, the colour a page renders, never on the
 * unrounded value a search produced, so a colour that clears the bar by a
 * rounding error is never returned.
 */
function snapped(components: readonly number[]): SrgbColor {
  const [r, g, b] = components.map(
    (channel) => Math.round(Math.min(1, Math.max(0, channel)) * 255) / 255,
  ) as [number, number, number];
  return { colorSpace: 'srgb', components: [r, g, b], alpha: 1 };
}

/**
 * The accent laid over the page at `ACCENT_FILL_STRENGTH`. On a page near the
 * middle of the lightness scale, a fill that strong can leave even black or
 * white below 4.5:1, and then no ink would read on it; the fill moves back
 * toward the page until the extreme reads again. On a page a person would
 * actually use, light or dark, that never happens.
 */
function paleFill(accent: SrgbColor, page: SrgbColor, extreme: SrgbColor): SrgbColor {
  const at = (strength: number) =>
    snapped(
      page.components.map(
        (channel, index) => channel + (accent.components[index]! - channel) * strength,
      ),
    );
  const nominal = at(ACCENT_FILL_STRENGTH);
  if (contrastRatio(extreme, nominal) >= MIN_CONTRAST) return nominal;
  // At strength 0 the fill is the page, on which the extreme reads.
  let enough = 0;
  let short = ACCENT_FILL_STRENGTH;
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const middle = (enough + short) / 2;
    if (contrastRatio(extreme, at(middle)) >= MIN_CONTRAST) enough = middle;
    else short = middle;
  }
  return at(enough);
}

/**
 * The accent as text on every background given: the accent itself if it
 * reads, otherwise the accent with its lightness moved toward the extreme
 * (black or white) just until it does. Hue and saturation are kept, so a pale
 * yellow becomes a gold rather than a grey.
 *
 * The search halves the lightness between a value known to fall short and one
 * known to read, and only ever returns the one known to read, measured as a
 * hex - so the result reads whatever the rounding does. The extreme itself
 * reads on the page by the choice of direction and on the fill by
 * `paleFill`'s construction, so the search starts with an answer.
 */
function inkFor(
  accent: SrgbColor,
  backgrounds: readonly SrgbColor[],
  extreme: SrgbColor,
): SrgbColor {
  const reads = (color: SrgbColor) =>
    backgrounds.every((background) => contrastRatio(color, background) >= MIN_CONTRAST);
  if (reads(accent)) return accent;
  const [hue, saturation, lightness] = toHsl(accent.components);
  const at = (value: number) => snapped(fromHsl(hue, saturation, value));
  let short = lightness;
  let enough = extreme === BLACK ? 0 : 1;
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const middle = (short + enough) / 2;
    if (reads(at(middle))) enough = middle;
    else short = middle;
  }
  return at(enough);
}

/** sRGB components to hue (degrees), saturation and lightness, each of the last two in 0..1. */
function toHsl(components: readonly number[]): [number, number, number] {
  const [r, g, b] = components as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const chroma = max - min;
  if (chroma === 0) return [0, 0, lightness];
  const saturation = chroma / (1 - Math.abs(2 * lightness - 1));
  const sector =
    max === r
      ? ((g - b) / chroma + 6) % 6
      : max === g
        ? (b - r) / chroma + 2
        : (r - g) / chroma + 4;
  return [sector * 60, Math.min(1, saturation), lightness];
}

/**
 * Hue, saturation and lightness back to sRGB components. Lightness 0 is black
 * and lightness 1 is white whatever the hue, which is what lets the ink's
 * search end on an extreme.
 */
function fromHsl(hue: number, saturation: number, lightness: number): [number, number, number] {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = hue / 60;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const [r, g, b]: [number, number, number] =
    sector < 1
      ? [chroma, second, 0]
      : sector < 2
        ? [second, chroma, 0]
        : sector < 3
          ? [0, chroma, second]
          : sector < 4
            ? [0, second, chroma]
            : sector < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];
  const offset = lightness - chroma / 2;
  return [r + offset, g + offset, b + offset];
}
