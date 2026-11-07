import { isColorTokenName, type ColorTokenName } from './contract';
import { parseHex } from './seed-roles';
import { colorHex, linearChannel, type SrgbColor } from './tokens';

/**
 * The app styles and the typefaces, as data, and the roles a team's choice of
 * the two sets.
 *
 * A style is a small set of design values a team picks from a closed list, on
 * top of its own colours and logo: how its headings, its panels, its corners,
 * its call to action and its rhythm look. A typeface is picked from a short
 * list beside it, and replaces the style's body face, and its heading face
 * wherever the style's headings follow the body. Neither adds a colour: every
 * fill, edge and ink a style uses is a role the theme contract already has,
 * named here by that role (`RoleColor`), or a shadow.
 *
 * `deriveStyleRoles` returns roles, never custom property names, the way
 * `deriveBrandRoles` does for the seed colours: each host maps them onto its
 * own tokens, and the kernel's controls and the generative layer read the few
 * optional tokens docs/theming.md lists, each with today's look as its
 * fallback. A role a choice does not set is not a key, so a host keeps its own
 * value there; `quiet` with no typeface sets nothing at all, which is what
 * makes "no style" and "the default style" one state.
 *
 * See docs/brand.md § "App styles and typefaces".
 */

// ─── Typefaces ───────────────────────────────────────────────────────────────

/** The faces of the closed list, all on Google Fonts under the SIL Open Font License. */
export type TypefaceId =
  | 'inter'
  | 'dm-sans'
  | 'plus-jakarta-sans'
  | 'manrope'
  | 'ibm-plex-sans'
  | 'source-sans-3'
  | 'work-sans'
  | 'space-grotesk'
  | 'newsreader';

/** The faces a team may pick as its typeface: every face but a style's own heading face. */
export type BodyTypefaceId = Exclude<TypefaceId, 'newsreader'>;

export interface Typeface {
  id: TypefaceId;
  /** The family name, as a stylesheet and a font service name it. */
  family: string;
  category: 'sans-serif' | 'serif';
  /** The weights a host loads it in: from the host's own light titles (300) to the boldest a style sets (700). */
  weights: readonly number[];
  /** The generic stack that renders while the face loads, or when it never does. */
  fallback: string;
  /** The face first, then its fallback: a whole `font-family` value. */
  stack: string;
  /** Whether a team may pick it (`body`), or a style uses it for its headings only (`heading`). */
  use: 'body' | 'heading';
}

const SANS_FALLBACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF_FALLBACK = 'ui-serif, Georgia, Cambria, "Times New Roman", serif';
const WEIGHTS: readonly number[] = [300, 400, 500, 600, 700];

function face(
  id: TypefaceId,
  family: string,
  category: Typeface['category'],
  use: Typeface['use'],
): Typeface {
  const fallback = category === 'serif' ? SERIF_FALLBACK : SANS_FALLBACK;
  return {
    id,
    family,
    category,
    weights: WEIGHTS,
    fallback,
    stack: `"${family}", ${fallback}`,
    use,
  };
}

/**
 * Every face a style or a team can set. The body faces are the list a team
 * picks from; Newsreader is the `editorial` style's heading face, listed so a
 * host loads it, and is not a team's choice. Frozen, like `APP_STYLES`: a
 * process serves many teams, so the catalogue one of them reads cannot be
 * one another has edited.
 */
export const TYPEFACES: readonly Typeface[] = deepFreeze([
  face('inter', 'Inter', 'sans-serif', 'body'),
  face('dm-sans', 'DM Sans', 'sans-serif', 'body'),
  face('plus-jakarta-sans', 'Plus Jakarta Sans', 'sans-serif', 'body'),
  face('manrope', 'Manrope', 'sans-serif', 'body'),
  face('ibm-plex-sans', 'IBM Plex Sans', 'sans-serif', 'body'),
  face('source-sans-3', 'Source Sans 3', 'sans-serif', 'body'),
  face('work-sans', 'Work Sans', 'sans-serif', 'body'),
  face('space-grotesk', 'Space Grotesk', 'sans-serif', 'body'),
  face('newsreader', 'Newsreader', 'serif', 'heading'),
]);

const FACES = new Map(TYPEFACES.map((candidate) => [candidate.id as string, candidate]));

/** Whether `value` names a face a team may pick: a body face of `TYPEFACES`. */
export function isTypeface(value: unknown): value is BodyTypefaceId {
  return typeof value === 'string' && FACES.get(value)?.use === 'body';
}

function faceOf(id: TypefaceId): Typeface {
  return FACES.get(id)!;
}

// ─── The roles a style paints with ──────────────────────────────────────────

/**
 * A colour a style paints with, named by the role of the theme contract it
 * is: never a colour of its own, so a team's palette and the host's theme
 * stay the only sources of colour, and their readability guarantees hold.
 */
export interface RoleColor {
  role: ColorTokenName;
  /** Mixed toward another role, in Oklab, by `share` (0 to 1): the card a little toward the foreground. */
  toward?: { role: ColorTokenName; share: number };
  /** Its opacity over what lies behind it, 0 to 1; absent, opaque. */
  alpha?: number;
}

/** How a style draws a panel - a host's composer, a designed page's rail or card - in one theme. */
export interface PanelRoles {
  fill: RoleColor;
  /** The edge's colour, or `null` for no visible edge (the width is kept, so a panel's box does not move). */
  edge: RoleColor | null;
  /** The edge's width, in CSS pixels. */
  edgeWidth: number;
  /** A CSS `box-shadow` in a neutral ink, or `null` for none. */
  shadow: string | null;
  /**
   * The fill of the fields set into the panel, where the host's field fill
   * would sink into it; absent, the host's own.
   */
  field?: RoleColor;
}

/** The call to action's shadow: a CSS shadow's geometry, in pixels, tinted with a role. */
export interface ActionShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: RoleColor;
}

/**
 * The roles a style and a typeface set. An absent role is not a key: a host
 * keeps its own value there.
 */
export interface StyleRoles {
  /** The face of everything on the page. */
  bodyFace?: Typeface;
  /** The face of the page's titles and its sections' and panels' headings. */
  headingFace?: Typeface;
  headingWeight?: number;
  /** The headings' letter spacing, in `em`. */
  headingTracking?: string;
  /** A control's corner radius, in CSS pixels; a panel takes one and a half of it. */
  radius?: number;
  /** The panel treatment in each theme: a shadow that reads on a light page is lost on a dark one. */
  panel?: { light: PanelRoles; dark: PanelRoles };
  /**
   * The call to action's shadow in each theme, or `none` for a plain fill: a
   * shadow in the button colour that lifts a button on a light page smears
   * under it on a dark one.
   */
  actionShadow?: { light: ActionShadow | 'none'; dark: ActionShadow | 'none' };
  /** The rhythm: a multiple of the host's own margins, paddings and gaps around the form. Never a control's size. */
  density?: number;
}

// ─── The styles ──────────────────────────────────────────────────────────────

export type AppStyleId = 'quiet' | 'soft' | 'editorial' | 'bold';

export interface AppStyle {
  id: AppStyleId;
  name: string;
  /** The direction, in one sentence, as a designer reads it. */
  direction: string;
  /** The roles the style sets when the team picks no typeface. */
  roles: StyleRoles;
}

interface Definition {
  name: string;
  direction: string;
  /** The style's own body face, or none (the host's). */
  bodyFace: BodyTypefaceId | null;
  /** The heading face: the body's, or a face of the style's own that a team's typeface does not replace. */
  headingFace: 'body' | TypefaceId;
  roles: Omit<StyleRoles, 'bodyFace' | 'headingFace'>;
}

const role = (name: ColorTokenName, more: Omit<RoleColor, 'role'> = {}): RoleColor => ({
  role: name,
  ...more,
});

const DEFINITIONS: Readonly<Record<AppStyleId, Definition>> = {
  // The host's own look, named: it sets nothing, and a team's typeface is its
  // body and its headings.
  quiet: {
    name: 'Quiet',
    direction: 'Calm and precise: light titles, hairline panels, generous air, nothing decorated.',
    bodyFace: null,
    headingFace: 'body',
    roles: {},
  },
  soft: {
    name: 'Soft',
    direction:
      'Friendly and rounded: generous corners, panels that float on a soft shadow with no outline, warm medium-weight titles.',
    bodyFace: 'dm-sans',
    headingFace: 'body',
    roles: {
      headingWeight: 500,
      headingTracking: '-0.015em',
      radius: 12,
      panel: {
        light: {
          fill: role('card'),
          edge: null,
          edgeWidth: 1,
          shadow: '0 1px 2px rgb(16 24 40 / 0.05), 0 12px 32px -10px rgb(16 24 40 / 0.16)',
          field: role('card'),
        },
        // On a dark page a shadow barely shows, so the panel is lifted by its
        // fill instead, the card a little toward the foreground, with a faint
        // highlight along its top edge where light would catch it, and its
        // fields sink back to the page's own background.
        dark: {
          fill: role('card', { toward: { role: 'foreground', share: 0.07 } }),
          edge: null,
          edgeWidth: 1,
          shadow:
            'inset 0 1px 0 rgb(255 255 255 / 0.07), 0 2px 4px rgb(0 0 0 / 0.55), 0 24px 56px -12px rgb(0 0 0 / 0.95)',
          field: role('background'),
        },
      },
      // A short shadow in the button colour on a light page, kept within the
      // gap a host leaves under its button. On a dark page the panel is lifted
      // by its fill, and a glow in a light button colour reads as a smear.
      actionShadow: {
        light: { x: 0, y: 6, blur: 14, spread: -6, color: role('primary', { alpha: 0.5 }) },
        dark: 'none',
      },
      density: 1.08,
    },
  },
  editorial: {
    name: 'Editorial',
    direction:
      'Considered and literary: serif display titles, fine hairlines, wide margins and a reading rhythm.',
    bodyFace: 'source-sans-3',
    headingFace: 'newsreader',
    roles: {
      headingWeight: 500,
      headingTracking: '-0.01em',
      radius: 2,
      // Hairlines all the way in: the fields inside the panel take its own
      // fill, so each reads as its fine edge rather than as a grey block.
      panel: {
        light: {
          fill: role('card'),
          edge: role('border'),
          edgeWidth: 1,
          shadow: null,
          field: role('card'),
        },
        dark: {
          fill: role('card'),
          edge: role('border'),
          edgeWidth: 1,
          shadow: null,
          field: role('card'),
        },
      },
      actionShadow: { light: 'none', dark: 'none' },
      density: 1.25,
    },
  },
  bold: {
    name: 'Bold',
    direction:
      'Confident and graphic: heavy, tightly set titles, solid panels with firm edges, a compact rhythm.',
    bodyFace: 'space-grotesk',
    headingFace: 'body',
    roles: {
      headingWeight: 700,
      headingTracking: '-0.03em',
      radius: 6,
      // One firm edge around a solid panel, softer on a dark page. The panel
      // is the muted fill, which the host's fields all but match, so fields
      // set into it take the card on a light page and the page's background
      // on a dark one.
      panel: {
        light: {
          fill: role('muted'),
          edge: role('foreground', { alpha: 0.62 }),
          edgeWidth: 2,
          shadow: null,
          field: role('card'),
        },
        dark: {
          fill: role('muted'),
          edge: role('foreground', { alpha: 0.3 }),
          edgeWidth: 2,
          shadow: null,
          field: role('background'),
        },
      },
      actionShadow: { light: 'none', dark: 'none' },
      density: 0.85,
    },
  },
};

export const APP_STYLE_IDS: readonly AppStyleId[] = Object.freeze([
  'quiet',
  'soft',
  'editorial',
  'bold',
]);

/** Whether `value` names one of the app styles. */
export function isAppStyle(value: unknown): value is AppStyleId {
  // Against the definitions themselves, which no caller can reach, rather
  // than the exported list.
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(DEFINITIONS, value);
}

/**
 * The roles a team's choice sets: its style and its typeface, each a stored
 * id or nothing. An unknown or absent style is `quiet`, which sets nothing;
 * an unknown typeface, or one a team may not pick, is no typeface, so the
 * style's own face (or the host's) stays. The team's typeface replaces the
 * style's body face, and its heading face wherever the style's headings
 * follow the body.
 */
export function deriveStyleRoles(
  style: string | null | undefined,
  typeface?: string | null,
): StyleRoles {
  const definition = DEFINITIONS[isAppStyle(style) ? style : 'quiet'];
  const roles: StyleRoles = {};
  const body = isTypeface(typeface)
    ? faceOf(typeface)
    : definition.bodyFace === null
      ? undefined
      : faceOf(definition.bodyFace);
  if (body) roles.bodyFace = body;
  const heading = definition.headingFace === 'body' ? body : faceOf(definition.headingFace);
  if (heading) roles.headingFace = heading;
  // A copy, faces included, so a host that edits what it got changes nothing
  // for the next caller and nothing in the catalogue.
  return copyData({ ...roles, ...definition.roles });
}

/** The styles, each with its own roles: what it sets for a team that picked no typeface. */
export const APP_STYLES: Readonly<Record<AppStyleId, AppStyle>> = deepFreeze(
  Object.fromEntries(
    APP_STYLE_IDS.map((id) => [
      id,
      {
        id,
        name: DEFINITIONS[id].name,
        direction: DEFINITIONS[id].direction,
        roles: deriveStyleRoles(id),
      },
    ]),
  ) as Record<AppStyleId, AppStyle>,
);

/**
 * A deep copy of plain data - objects, arrays and primitives, which is all a
 * style's roles are. Spelled out rather than `structuredClone`, which is a
 * host API rather than the language's, and which this isomorphic entry would
 * otherwise call at import time through `APP_STYLES`.
 */
function copyData<T>(value: T): T {
  if (Array.isArray(value)) return value.map(copyData) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, copyData(inner)]),
    ) as T;
  }
  return value;
}

/** Freezes plain data all the way down, and hands it back. */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const inner of Object.values(value)) deepFreeze(inner);
    Object.freeze(value);
  }
  return value;
}

// ─── Measuring a role ────────────────────────────────────────────────────────

/**
 * A role colour as a `#rrggbb` hex over the palette it names, to measure a
 * surface a style draws: the ink a team's accent needs on a style's panel
 * (`deriveBrandRoles`' `surfaces`). The mix is Oklab's, as CSS `color-mix()`
 * computes it. A translucent colour is laid over `behind`; without it, it
 * throws, since a translucent colour has no one value. Throws, too, for a
 * role the palette does not hold or a palette colour that is not a hex.
 */
export function resolveRoleColor(
  color: RoleColor,
  palette: Partial<Record<ColorTokenName, string>>,
  behind?: string,
): string {
  const of = (name: ColorTokenName): SrgbColor => {
    const value = palette[name];
    if (!isColorTokenName(name) || value === undefined) {
      throw new Error(`The palette has no ${name} to resolve a style's colour against.`);
    }
    return parseHex(value, `The palette's ${name}`);
  };
  let rgb = of(color.role).components as [number, number, number];
  if (color.toward) {
    const share = clampUnit(color.toward.share);
    rgb = mixOklab(rgb, of(color.toward.role).components as [number, number, number], share);
  }
  if (color.alpha !== undefined && color.alpha < 1) {
    if (behind === undefined) {
      throw new Error(`A translucent ${color.role} has no one colour: say what it lies over.`);
    }
    const under = parseHex(behind, 'The colour behind').components;
    const alpha = clampUnit(color.alpha);
    rgb = rgb.map((channel, index) => under[index]! + (channel - under[index]!) * alpha) as [
      number,
      number,
      number,
    ];
  }
  return colorHex({ colorSpace: 'srgb', components: rgb, alpha: 1 });
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

type Rgb = [number, number, number];

/** `a` moved toward `b` by `share` in Oklab, as `color-mix(in oklab, a, b share)` paints it. */
function mixOklab(a: Rgb, b: Rgb, share: number): Rgb {
  const [l1, a1, b1] = toOklab(a);
  const [l2, a2, b2] = toOklab(b);
  const at = (from: number, to: number) => from + (to - from) * share;
  return fromOklab([at(l1, l2), at(a1, a2), at(b1, b2)]).map(clampUnit) as Rgb;
}

const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab(rgb: Rgb): Rgb {
  const [r, g, b] = rgb.map(linearChannel) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([lightness, a, b]: Rgb): Rgb {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => fromLinear(clampUnit(channel))) as Rgb;
}
