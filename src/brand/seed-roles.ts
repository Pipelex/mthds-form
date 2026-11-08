import { MIN_CONTRAST, MIN_CONTROL_CONTRAST } from './contract';
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
 * - **The accent as text is ink** (`accentInk`): the accent with its hue
 *   and saturation kept and its lightness moved just until it reads at 4.5:1
 *   on the page, on the pale accent fill and on every other surface the host
 *   names (a style's panel and its fields), the backgrounds a host draws
 *   accent text on. The lightness moves toward the page's extreme, darker on
 *   a light page and lighter on a dark one, and away from it only when a
 *   surface on the far side of the page's lightness leaves no shade that way
 *   reading on every background at once. A random search over accents and
 *   surfaces on a white and on a black page found no case of it; on a
 *   mid-tone page it happens: `#1e40af` on the grey `#767676`, which counts
 *   as light, inks as `#000001` alone and as `#fefeff` beside a black panel.
 *   An accent that already reads is its own ink.
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
  /**
   * The accent as text, reading at 4.5:1 or more on the page, on `accentFill`
   * and on every other surface the host named (`deriveBrandRoles`' `surfaces`).
   */
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
 *
 * `surfaces` are the other colours accent text sits on besides the page and
 * the pale fill, each `#rrggbb`: a style's panel and the fields inside it
 * (`resolveRoleColor` turns a style's role colour into one), or a canvas
 * behind the page. The ink is moved until it reads on all of them, and an
 * accent that already reads on every one is its own ink. When there is an
 * accent to derive and no shade of it reads on the page, the pale fill and
 * every surface at once, which a surface on the far side of the page's
 * lightness can cause, it throws, naming them. With no accent, no ink is
 * derived, and the surfaces are only parsed.
 */
export function deriveBrandRoles(
  seeds: BrandSeeds | null | undefined,
  page: string,
  surfaces: readonly string[] = [],
): BrandRoles {
  const canvas = parseHex(page, 'The page colour');
  const extreme = textOn(canvas) === '#000000' ? BLACK : WHITE;
  const others = surfaces.map((surface, index) => parseHex(surface, `Surface ${index + 1}`));
  const action = seeds?.action == null ? null : parseHex(seeds.action, 'The action seed');
  // An unset accent follows the button colour, and is unset too when that is.
  const accent = seeds?.accent == null ? action : parseHex(seeds.accent, 'The accent seed');
  const header = seeds?.header == null ? null : parseHex(seeds.header, 'The header seed');

  const actionRoles: ActionRoles | Absent<ActionRoles> =
    action === null ? {} : { action: colorHex(action), onAction: textOn(action) };
  const accentRoles: AccentRoles | Absent<AccentRoles> =
    accent === null ? {} : accentRolesOf(accent, canvas, extreme, others);
  const headerRoles: HeaderRoles | Absent<HeaderRoles> =
    header === null ? {} : { header: colorHex(header), onHeader: textOn(header) };
  return { ...actionRoles, ...accentRoles, ...headerRoles };
}

/**
 * The accent as a fill, its pale fill on the page, and its ink on both and on
 * every other surface. The way accent text moves first is the way text on the
 * page moves, toward `extreme`: whichever of black and white reads better
 * there, which always reaches 4.58:1 on the page itself. The accent is
 * measured before any surface is judged, so an accent that already reads
 * everywhere is kept, and a surface is refused only when no shade of the
 * accent reads on it and on the others at once.
 */
function accentRolesOf(
  accent: SrgbColor,
  canvas: SrgbColor,
  extreme: SrgbColor,
  surfaces: readonly SrgbColor[],
): AccentRoles {
  const accentFill = paleFill(accent, canvas, extreme);
  const backgrounds = [canvas, accentFill, ...surfaces];
  const accentInk = inkFor(accent, backgrounds, extreme);
  if (accentInk === undefined) {
    throw new Error(
      `No accent ink can read on every surface at once: no shade of ${colorHex(accent)} reaches ${MIN_CONTRAST}:1 on the page ${colorHex(canvas)}, the pale fill ${colorHex(accentFill)} and ${surfaces.map(colorHex).join(', ')}.`,
    );
  }
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
 * page (and on the `surfaces`, as `deriveBrandRoles` takes them), so links read
 * in a shade of it rather than in the colour itself. Only
 * a colour the person set is judged, and the accent counts as set when it
 * follows a button colour the person set: with neither, the answer is `false`.
 */
export function isAccentAdjusted(
  seeds: BrandSeeds | null | undefined,
  page: string,
  surfaces: readonly string[] = [],
): boolean {
  const roles = deriveBrandRoles(seeds, page, surfaces);
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

/** A `#rrggbb` colour, or a throw naming `what` it was meant to be. Module-internal: not on the entry. */
export function parseHex(value: string, what: string): SrgbColor {
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
 * Every shade of one hue and saturation, as the lightness of a point inside
 * it, from black to white. Each channel is linear in the lightness on either
 * side of the middle (`fromHsl`), so the lightness at which it turns over to
 * its next byte is solved for rather than searched; between two neighbouring
 * turnovers every channel keeps its byte, and the hex is one shade. A walk in
 * fixed steps could not promise this: where two channels turn over close
 * together, a shade spans less lightness than any step, and the one shade
 * that reads may be it.
 */
function shadeLightnesses(hue: number, saturation: number): number[] {
  const bounds = new Set<number>([0, 0.5, 1]);
  for (const [low, high] of [
    [0, 0.5],
    [0.5, 1],
  ] as const) {
    const from = fromHsl(hue, saturation, low);
    const to = fromHsl(hue, saturation, high);
    for (let channel = 0; channel < 3; channel++) {
      const start = from[channel]! * 255;
      const rise = to[channel]! * 255 - start;
      if (rise === 0) continue;
      // `snapped` rounds a channel, so its byte turns over at each half.
      for (let byte = 0; byte < 255; byte++) {
        const at = low + ((byte + 0.5 - start) / rise) * (high - low);
        if (at > low && at < high) bounds.add(at);
      }
    }
  }
  const sorted = [...bounds].sort((a, b) => a - b);
  return sorted.slice(1).map((bound, index) => (sorted[index]! + bound) / 2);
}

/**
 * The accent as text on every background given: the accent itself if it
 * reads, otherwise the accent with its lightness moved just until it does, or
 * `undefined` when no lightness reads on all of them. Hue and saturation are
 * kept, so a pale yellow becomes a gold rather than a grey.
 *
 * The lightness moves toward the extreme (black or white) first. When the
 * extreme reads on every background, which it does on the page by the choice
 * of direction and on the fill by `paleFill`'s construction, each step that
 * way only brings the ink closer to reading, and a search halves the
 * lightness between a value known to fall short and one known to read. It
 * only ever returns the one known to read, measured as a hex, so the result
 * reads whatever the rounding does.
 *
 * A surface on the far side of the page's lightness, a dark panel on a light
 * page, is one the extreme does not read on. The shades that read on every
 * background then lie between the two extremes, if there are any: a shade
 * dark enough for the light backgrounds and light enough for the dark ones,
 * and sometimes a single one. Every shade of the accent's hue and saturation
 * is tried (`shadeLightnesses`), nearest first, toward the extreme and then
 * away from it, and the first that reads is the ink; `undefined` means no
 * shade does.
 */
function inkFor(
  accent: SrgbColor,
  backgrounds: readonly SrgbColor[],
  extreme: SrgbColor,
): SrgbColor | undefined {
  const reads = (color: SrgbColor) =>
    backgrounds.every((background) => contrastRatio(color, background) >= MIN_CONTRAST);
  if (reads(accent)) return accent;
  const [hue, saturation, lightness] = toHsl(accent.components);
  const at = (value: number) => snapped(fromHsl(hue, saturation, value));
  /** The first lightness that reads between one known to fall short and one known to read. */
  const narrowed = (short: number, enough: number): SrgbColor => {
    for (let step = 0; step < SEARCH_STEPS; step++) {
      const middle = (short + enough) / 2;
      if (reads(at(middle))) enough = middle;
      else short = middle;
    }
    return at(enough);
  };
  const toward = extreme === BLACK ? 0 : 1;
  if (reads(extreme)) return narrowed(lightness, toward);
  const shades = shadeLightnesses(hue, saturation);
  const darker = shades.filter((value) => value < lightness).reverse();
  const lighter = shades.filter((value) => value > lightness);
  for (const side of toward === 0 ? [darker, lighter] : [lighter, darker]) {
    for (const value of side) {
      const shade = at(value);
      if (reads(shade)) return shade;
    }
  }
  return undefined;
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
