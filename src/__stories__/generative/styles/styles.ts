/**
 * The app styles and the typefaces, as data: the one place their values live
 * while they are tried in Storybook.
 *
 * A style is a small set of design values a team picks from a closed list,
 * on top of its own colours and logo: how its headings, its panels, its
 * corners and its rhythm look. A typeface is picked from a short list beside
 * it, and replaces the style's body face (and its heading face wherever the
 * style's headings follow the body). Neither adds a colour: every fill, edge
 * and ink a style uses is an existing role of the theme contract, or a shadow.
 *
 * Nothing here ships. The stylesheet beside this file (`styles.css`) applies
 * these values to the rendered page through custom properties, and it is
 * disposable: the package's own styles are expected to replace it with token
 * reads in the components themselves, at which point this table is what they
 * encode. Until then, a value changed here is a value changed everywhere the
 * stories show a style.
 *
 * `quiet` sets nothing at all. It is the host's own look, named, so that "no
 * style" and "the default style" are one state.
 */

export type AppStyleId = 'quiet' | 'soft' | 'editorial' | 'bold';

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

export interface Typeface {
  id: TypefaceId;
  /** The family name, as Google Fonts and a stylesheet name it. */
  family: string;
  category: 'sans-serif' | 'serif';
  /** The weights the stories load it in, read off `axes`. */
  weights: readonly number[];
  /** What renders while the face loads, or when it never does. */
  fallback: string;
  /** Whether a team may pick it as its body face, or a style uses it for headings only. */
  use: 'body' | 'heading';
  /**
   * The Google Fonts axis spec the stories load it with. It starts at 300,
   * the host's own title weight, which a team's face carries on `quiet`.
   */
  axes: string;
}

/**
 * The faces, all on Google Fonts under the SIL Open Font License. The body
 * faces are what a team picks from; Newsreader is the editorial style's
 * heading face and is not offered as a body.
 */
export const TYPEFACES: readonly Typeface[] = [
  face('inter', 'Inter', 'sans-serif', 'body', 'wght@300..700'),
  face('dm-sans', 'DM Sans', 'sans-serif', 'body', 'opsz,wght@9..40,300..700'),
  face('plus-jakarta-sans', 'Plus Jakarta Sans', 'sans-serif', 'body', 'wght@300..700'),
  face('manrope', 'Manrope', 'sans-serif', 'body', 'wght@300..700'),
  face('ibm-plex-sans', 'IBM Plex Sans', 'sans-serif', 'body', 'wght@300;400;500;600;700'),
  face('source-sans-3', 'Source Sans 3', 'sans-serif', 'body', 'wght@300..700'),
  face('work-sans', 'Work Sans', 'sans-serif', 'body', 'wght@300..700'),
  face('space-grotesk', 'Space Grotesk', 'sans-serif', 'body', 'wght@300..700'),
  face('newsreader', 'Newsreader', 'serif', 'heading', 'opsz,wght@6..72,300..700'),
];

function face(
  id: TypefaceId,
  family: string,
  category: Typeface['category'],
  use: Typeface['use'],
  axes: string,
): Typeface {
  return {
    id,
    family,
    category,
    weights: axisWeights(axes),
    fallback:
      category === 'serif'
        ? 'ui-serif, Georgia, Cambria, "Times New Roman", serif'
        : 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    use,
    axes,
  };
}

/**
 * The weights a Google Fonts axis spec loads: every hundred of a `wght`
 * range (`wght@300..700`, `opsz,wght@9..40,300..700`), or each weight it
 * lists (`wght@300;400;500`).
 */
export function axisWeights(axes: string): number[] {
  const [names = '', values = ''] = axes.split('@');
  const at = names.split(',').indexOf('wght');
  if (at < 0) return [];
  const weights = new Set<number>();
  for (const tuple of values.split(';')) {
    const value = tuple.split(',')[at] ?? '';
    const [low, high] = value.split('..').map(Number);
    if (low === undefined || Number.isNaN(low)) continue;
    const top = high === undefined || Number.isNaN(high) ? low : high;
    for (let weight = Math.ceil(low / 100) * 100; weight <= top; weight += 100) weights.add(weight);
  }
  return [...weights].sort((a, b) => a - b);
}

export function typeface(id: TypefaceId): Typeface {
  const found = TYPEFACES.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No typeface ${id}.`);
  return found;
}

/** A face as a `font-family` value: the family, then its generic fallback. */
export function fontStack(id: TypefaceId): string {
  const found = typeface(id);
  return `"${found.family}", ${found.fallback}`;
}

/** A value that differs by theme, or one value for both. */
export type Themed = string | { light: string; dark: string };

export function inTheme(value: Themed, theme: 'light' | 'dark'): string {
  return typeof value === 'string' ? value : value[theme];
}

/**
 * How a style draws the host's panel - the composer's, with its action row:
 * its fill and its edge as references to roles the theme already has, and
 * its shadow, which is a value of its own in each theme because a shadow that
 * reads on a light page is invisible on a dark one.
 *
 * It reaches no other box. A group inside the panel (a structure's fields, a
 * list's rows) keeps the kernel's own fill and hairline, and a captured
 * layout keeps its own cards: the stories apply a style to neither, so the
 * table holds no value for them that a page has shown.
 */
export interface PanelTreatment {
  /**
   * The panel's fill: a role of the theme contract, or one mixed with the
   * foreground, per theme where a dark page needs the panel lifted off it.
   */
  fill: Themed;
  /** The panel's edge colour: a role, the foreground at a reduced strength, or none. */
  edge: Themed;
  /** The panel's edge width. */
  edgeWidth: string;
  /** The panel's shadow in each theme, or none. */
  shadow: { light: string; dark: string } | null;
  /**
   * The fields' own fill (the kernel's `--input`), where the host's would
   * sink into the panel; absent, the host's.
   */
  field?: Themed;
}

export interface AppStyle {
  id: AppStyleId;
  name: string;
  /** The direction, in one sentence, as the designer method will read it. */
  direction: string;
  /** The heading face, or `body` for the body face. */
  headingFace: TypefaceId | 'body' | null;
  headingWeight: number | null;
  headingTracking: string | null;
  /** The body face when a team picks none. */
  bodyFace: TypefaceId | null;
  /** The control radius; panels derive theirs from it, as the host does. */
  radius: string | null;
  panel: PanelTreatment | null;
  /**
   * The designed page's call to action: its shadow, `none` for a plain fill,
   * or null for the host's.
   */
  actionShadow: string | null;
  /**
   * The rhythm, as a multiple of the host frame's own margins, paddings and
   * gaps around the form (`frame.css` reads it), or null for the host's own.
   * It reaches neither the form inside nor a control: scoping Tailwind's
   * `--spacing` to the page, the first way tried, scaled every control's
   * height with the rhythm (a text field 39.6px tall under `bold`, under the
   * 44px a finger needs; 52.8px under `editorial`).
   */
  density: number | null;
}

/** The foreground at a reduced strength: a firm edge that is no new colour. */
const FIRM_EDGE = 'color-mix(in oklab, var(--foreground) 62%, transparent)';

export const APP_STYLES: Readonly<Record<AppStyleId, AppStyle>> = {
  quiet: {
    id: 'quiet',
    name: 'Quiet',
    direction: 'Calm and precise: light titles, hairline panels, generous air, nothing decorated.',
    headingFace: null,
    headingWeight: null,
    headingTracking: null,
    bodyFace: null,
    radius: null,
    panel: null,
    actionShadow: null,
    density: null,
  },
  soft: {
    id: 'soft',
    name: 'Soft',
    direction:
      'Friendly and rounded: generous corners, panels that float on a soft shadow with no outline, warm medium-weight titles.',
    headingFace: 'body',
    headingWeight: 500,
    headingTracking: '-0.015em',
    bodyFace: 'dm-sans',
    radius: '12px',
    panel: {
      // On a dark page a shadow barely shows, so the panel is lifted by its
      // fill instead: the card, a little toward the foreground.
      fill: {
        light: 'var(--card)',
        dark: 'color-mix(in oklab, var(--card) 93%, var(--foreground))',
      },
      edge: 'transparent',
      edgeWidth: '1px',
      shadow: {
        light: '0 1px 2px rgb(16 24 40 / 0.05), 0 12px 32px -10px rgb(16 24 40 / 0.16)',
        dark: '0 2px 4px rgb(0 0 0 / 0.55), 0 24px 56px -12px rgb(0 0 0 / 0.95)',
      },
      // Fields set into the panel: white on a light page, the page itself
      // under the lifted panel on a dark one.
      field: { light: 'var(--card)', dark: 'var(--background)' },
    },
    actionShadow: '0 8px 20px -8px color-mix(in oklab, var(--primary) 60%, transparent)',
    density: 1.08,
  },
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    direction:
      'Considered and literary: serif display titles, fine hairlines, wide margins and a reading rhythm.',
    headingFace: 'newsreader',
    headingWeight: 500,
    headingTracking: '-0.01em',
    bodyFace: 'source-sans-3',
    radius: '2px',
    panel: {
      fill: 'var(--card)',
      edge: 'var(--border)',
      edgeWidth: '1px',
      shadow: null,
    },
    actionShadow: 'none',
    density: 1.25,
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    direction:
      'Confident and graphic: heavy, tightly set titles, solid panels with firm edges, a compact rhythm.',
    headingFace: 'body',
    headingWeight: 700,
    headingTracking: '-0.03em',
    bodyFace: 'space-grotesk',
    radius: '6px',
    panel: {
      // One firm edge around a solid panel, softer on a dark page.
      fill: 'var(--muted)',
      edge: { light: FIRM_EDGE, dark: 'color-mix(in oklab, var(--foreground) 30%, transparent)' },
      edgeWidth: '2px',
      shadow: null,
    },
    actionShadow: 'none',
    density: 0.85,
  },
};

export const APP_STYLE_IDS = Object.keys(APP_STYLES) as AppStyleId[];

/** The custom properties a choice sets, in one theme. An absent value is not a key. */
export type StyleTokens = Record<string, string>;

/**
 * The tokens a style and a typeface set, in one theme. `quiet` with no
 * typeface sets none, so a page wearing it renders exactly as without it.
 *
 * - `--font-sans` and `--font-heading`: the body face (the team's typeface,
 *   else the style's) and the heading face (the style's own, or the body's).
 * - `--heading-weight`, `--heading-tracking`.
 * - `--radius`: the control radius; panels derive theirs from it.
 * - `--panel-fill`, `--panel-edge`, `--panel-edge-width`, `--panel-shadow`:
 *   the host's panel, read by `frame.css`.
 * - `--input`, the fields' fill, where a style sets one.
 * - `--action-shadow`: the designed page's call to action.
 * - `--density`: the rhythm, read by the host's frame around the form.
 */
export function styleTokens(
  styleId: AppStyleId,
  typefaceId: TypefaceId | null,
  theme: 'light' | 'dark',
): StyleTokens {
  const style = APP_STYLES[styleId];
  const tokens: StyleTokens = {};
  const body = typefaceId ?? style.bodyFace;
  if (body) tokens['--font-sans'] = fontStack(body);
  // A style's own heading face holds whatever the team picks; headings that
  // follow the body (and `quiet`'s, which are the host's) take the team's.
  const heading =
    style.headingFace === null || style.headingFace === 'body' ? body : style.headingFace;
  if (heading) tokens['--font-heading'] = fontStack(heading);
  if (style.headingWeight !== null) tokens['--heading-weight'] = String(style.headingWeight);
  if (style.headingTracking !== null) tokens['--heading-tracking'] = style.headingTracking;
  if (style.radius !== null) tokens['--radius'] = style.radius;
  if (style.panel) {
    tokens['--panel-fill'] = inTheme(style.panel.fill, theme);
    tokens['--panel-edge'] = inTheme(style.panel.edge, theme);
    tokens['--panel-edge-width'] = style.panel.edgeWidth;
    tokens['--panel-shadow'] = style.panel.shadow ? style.panel.shadow[theme] : 'none';
    if (style.panel.field) tokens['--input'] = inTheme(style.panel.field, theme);
  }
  if (style.actionShadow !== null) tokens['--action-shadow'] = style.actionShadow;
  if (style.density !== null) tokens['--density'] = String(style.density);
  return tokens;
}

/**
 * The Google Fonts stylesheet the stories load every face from. Story-only:
 * a host self-hosts the faces of the closed list, with no runtime request.
 */
export function googleFontsHref(): string {
  const families = TYPEFACES.map(
    (candidate) => `family=${candidate.family.replace(/ /g, '+')}:${candidate.axes}`,
  );
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
