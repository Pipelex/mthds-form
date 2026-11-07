import {
  TYPEFACES,
  type ActionShadow,
  type PanelRoles,
  type RoleColor,
  type StyleRoles,
  type TypefaceId,
} from '../../../brand';

/**
 * A host's mapping of the style roles onto the tokens it paints with, as the
 * stories' host page writes it: the kernel's optional tokens (`--font-heading`,
 * `--heading-weight`, `--heading-tracking`, `--panel-*`, `--action-shadow`,
 * docs/theming.md), the contract's own (`--font-sans`, `--radius`), and the
 * two the host's frame reads for itself (`--panel-field`, which its panel
 * turns into `--input`, and `--density`, its rhythm). `deriveStyleRoles`
 * says what a choice sets; this is where each role lands on this host.
 */

/** The custom properties a choice sets, in one theme. An absent role is not a key. */
export type StyleTokens = Record<string, string>;

/** A role colour as CSS over the contract's own tokens. */
export function roleColorCss(color: RoleColor): string {
  let css = `var(--${color.role})`;
  if (color.toward) {
    const kept = Math.round((1 - color.toward.share) * 100);
    css = `color-mix(in oklab, ${css} ${kept}%, var(--${color.toward.role}))`;
  }
  if (color.alpha !== undefined && color.alpha < 1) {
    css = `color-mix(in oklab, ${css} ${Math.round(color.alpha * 100)}%, transparent)`;
  }
  return css;
}

function actionShadowCss(shadow: ActionShadow | 'none'): string {
  if (shadow === 'none') return 'none';
  const { x, y, blur, spread, color } = shadow;
  return `${x}px ${y}px ${blur}px ${spread}px ${roleColorCss(color)}`;
}

function panelTokens(panel: PanelRoles): StyleTokens {
  const tokens: StyleTokens = {
    '--panel-fill': roleColorCss(panel.fill),
    '--panel-edge': panel.edge ? roleColorCss(panel.edge) : 'transparent',
    '--panel-edge-width': `${panel.edgeWidth}px`,
    '--panel-shadow': panel.shadow ?? 'none',
  };
  if (panel.field) tokens['--panel-field'] = roleColorCss(panel.field);
  return tokens;
}

/** The tokens the roles set on this host, in one theme. */
export function styleTokens(roles: StyleRoles, theme: 'light' | 'dark'): StyleTokens {
  const tokens: StyleTokens = {};
  if (roles.bodyFace) tokens['--font-sans'] = roles.bodyFace.stack;
  if (roles.headingFace) tokens['--font-heading'] = roles.headingFace.stack;
  if (roles.headingWeight !== undefined) tokens['--heading-weight'] = String(roles.headingWeight);
  if (roles.headingTracking !== undefined) tokens['--heading-tracking'] = roles.headingTracking;
  if (roles.radius !== undefined) tokens['--radius'] = `${roles.radius}px`;
  if (roles.panel) Object.assign(tokens, panelTokens(roles.panel[theme]));
  if (roles.actionShadow) tokens['--action-shadow'] = actionShadowCss(roles.actionShadow[theme]);
  if (roles.density !== undefined) tokens['--density'] = String(roles.density);
  return tokens;
}

/**
 * How the stories load each face from Google Fonts: its axes, from the host's
 * own light titles (300) to the boldest a style sets (700). Story-only: a
 * host self-hosts the closed list, with no runtime request to a font service.
 */
const AXES: Readonly<Record<TypefaceId, string>> = {
  inter: 'wght@300..700',
  'dm-sans': 'opsz,wght@9..40,300..700',
  'plus-jakarta-sans': 'wght@300..700',
  manrope: 'wght@300..700',
  'ibm-plex-sans': 'wght@300;400;500;600;700',
  'source-sans-3': 'wght@300..700',
  'work-sans': 'wght@300..700',
  'space-grotesk': 'wght@300..700',
  newsreader: 'opsz,wght@6..72,300..700',
};

/** The Google Fonts stylesheet the stories load every face from. */
export function googleFontsHref(): string {
  const families = TYPEFACES.map(
    (face) => `family=${face.family.replace(/ /g, '+')}:${AXES[face.id]}`,
  );
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
