import {
  deriveBrandRoles,
  resolveRoleColor,
  type BrandSeeds,
  type ColorTokenName,
  type StyleRoles,
} from '../../../brand';

/**
 * Teams' colours, as a team sets them: up to three seeds (the button,
 * the accent, the header band) and a logo. The seeds are real sites' own
 * colours, read off the custom properties each site's stylesheets declare.
 * They were picked from brands a brand-reading method produced from those
 * sites on 2026-10-10 (claude-5.5-opus), a corpus kept outside this
 * repository, unlike the one under `data/brands/` that `make brands`
 * compiles. So `provenance` is the audit trail here: it names the property
 * behind each seed, which anyone can read off the live site again. A team's
 * name and logo are the site's, loaded from the site on every render (no
 * check depends on them arriving), and nothing here is that organisation's
 * endorsement.
 *
 * They are story fixtures, not package data: what they are for is whether a
 * style still reads as itself under somebody's colours - a saturated violet,
 * a government's green and blue, a near-black band with a teal button.
 */

export type TeamKey = 'stripe' | 'gov-uk' | 'typer';

export interface Team {
  key: TeamKey;
  name: string;
  /** The site the colours were read from. */
  site: string;
  /** Where each seed came from, in the site's own words. */
  provenance: Partial<Record<keyof BrandSeeds, string>>;
  /** The seeds, as a person would set them; one set serves both themes. */
  seeds: BrandSeeds;
  /**
   * The logo pair, from the site. `wide` when the mark is a wordmark, which
   * the band shows alone; a square mark is followed by the team's name.
   */
  logo: { onLight: string; onDark: string; wide: boolean; height?: number };
}

export const TEAMS: Readonly<Record<TeamKey, Team>> = {
  stripe: {
    key: 'stripe',
    name: 'Stripe',
    site: 'https://stripe.com/',
    provenance: {
      action: '--hds-color-core-brand-600, the fill of its buttons and links',
    },
    seeds: { action: '#533afd' },
    logo: {
      onLight:
        'https://images.stripeassets.com/fzn2n1nzq965/1hgcBNd12BfT9VLgbId7By/01d91920114b124fb4cf6d448f9f06eb/favicon.svg',
      onDark:
        'https://images.stripeassets.com/fzn2n1nzq965/1hgcBNd12BfT9VLgbId7By/01d91920114b124fb4cf6d448f9f06eb/favicon.svg',
      wide: false,
    },
  },
  'gov-uk': {
    key: 'gov-uk',
    name: 'GOV.UK',
    site: 'https://www.gov.uk/',
    provenance: {
      action: '--primary-button-color, its start button',
      accent: '--govuk-link-colour',
      header: '--govuk-brand-colour, the blue of its header',
    },
    seeds: { action: '#00703c', accent: '#1a65a6', header: '#1d70b8' },
    logo: {
      onLight:
        'https://www.gov.uk/assets/frontend/favicon-d962d21b5bb443f546c097ea21b567cde639adef7370da45be5e349ba8d62d33.svg',
      onDark:
        'https://www.gov.uk/assets/frontend/favicon-d962d21b5bb443f546c097ea21b567cde639adef7370da45be5e349ba8d62d33.svg',
      wide: false,
    },
  },
  typer: {
    key: 'typer',
    name: 'Typer',
    site: 'https://typer.tiangolo.com/',
    provenance: {
      action: '--md-accent-fg-color under its teal accent',
      accent: '--md-typeset-a-color, its link colour',
      header: '--md-primary-fg-color under its black primary, hsla(225deg, 15%, 9%)',
    },
    seeds: { action: '#00bda4', accent: '#4051b5', header: '#14151a' },
    logo: {
      onLight: 'https://typer.tiangolo.com/img/logo-margin/logo-margin-vector.svg',
      onDark: 'https://typer.tiangolo.com/img/logo-margin/logo-margin-white-vector.svg',
      wide: true,
      // The file draws a margin around the wordmark: at the band's usual
      // height the word itself is smaller than the app's name beside it.
      height: 40,
    },
  },
};

export const TEAM_KEYS = Object.keys(TEAMS) as TeamKey[];

export type Theme = 'light' | 'dark';

/**
 * The host's palette in each theme, as `frame.css` writes it (a test holds
 * the two to each other): the roles a style's panel names, and `canvas`, the
 * page behind the host's panels, a shade off its `background`.
 */
export const HOST_PALETTE: Readonly<
  Record<Theme, { canvas: string } & Partial<Record<ColorTokenName, string>>>
> = {
  light: {
    canvas: '#f6f7f9',
    background: '#ffffff',
    foreground: '#0f1729',
    card: '#ffffff',
    muted: '#eef1f5',
    border: '#dde2e9',
    primary: '#0f1729',
  },
  dark: {
    canvas: '#0b0d12',
    background: '#12151c',
    foreground: '#eef1f6',
    card: '#12151c',
    muted: '#1c212b',
    border: '#353c49',
    primary: '#eef1f6',
  },
};

/** The page a team's accent is measured on: the host's `--background`, which fills its panels, a layout's cards and the band. */
export const HOST_PAGE: Readonly<Record<Theme, string>> = {
  light: HOST_PALETTE.light.background!,
  dark: HOST_PALETTE.dark.background!,
};

/**
 * The other surfaces the accent's ink sits on, in `theme`: the canvas, where
 * a result's eyebrow is set, and the panel a style draws with the fields set
 * into it, or the host's own card. `deriveBrandRoles` moves the ink until it
 * reads on all of them: measured on the page alone, it fell just under 4.5:1
 * on `bold`'s muted panel and on `soft`'s lifted dark one, and on the light
 * canvas, a shade darker than the page.
 */
export function styleSurfaces(roles: StyleRoles, theme: Theme): string[] {
  const palette = HOST_PALETTE[theme];
  const panel = roles.panel?.[theme];
  const fills = panel
    ? [panel.fill, ...(panel.field ? [panel.field] : [])]
    : [{ role: 'card' as const }];
  return [palette.canvas, ...fills.map((fill) => resolveRoleColor(fill, palette))];
}

/**
 * The band in `theme`: the team's header colour as the band's ground, or, on
 * a dark page, the page itself with the header colour as a rule under it. A
 * saturated band on a near-black page read as a different site's, and a band
 * taken partway to the page left a logo drawn on the header colour as a tile.
 */
export function bandOn(header: string, onHeader: string, theme: Theme): Record<string, string> {
  // `initial` unsets what the light page's rule set, which also applies on a
  // dark page, so the band falls back to the host's own.
  if (theme === 'dark')
    return { '--band': 'initial', '--on-band': 'initial', '--band-rule': header };
  return { '--band': header, '--on-band': onHeader };
}

/**
 * A team's colours as the kernel's tokens, in one theme, mapped as
 * docs/brand.md § "Mapping the roles onto tokens" says: the button colour
 * onto `--primary`, the accent's ink onto `--link` and `--ring`, its pale
 * fill onto `--selected`. The header band's two roles go to the host's own
 * band, which the controls do not draw. An absent role sets nothing, so the
 * host's own token stays. `surfaces` are the other surfaces the accent's ink
 * must read on (`styleSurfaces`).
 */
export function teamTokens(
  team: Team,
  theme: Theme,
  surfaces: readonly string[] = [],
): Record<string, string> {
  const roles = deriveBrandRoles(team.seeds, HOST_PAGE[theme], surfaces);
  const tokens: Record<string, string> = {};
  if (roles.action !== undefined) {
    tokens['--primary'] = roles.action;
    tokens['--primary-foreground'] = roles.onAction;
  }
  if (roles.accent !== undefined) {
    tokens['--link'] = roles.accentInk;
    tokens['--ring'] = roles.accentInk;
    tokens['--selected'] = roles.accentFill;
  }
  if (roles.header !== undefined)
    Object.assign(tokens, bandOn(roles.header, roles.onHeader, theme));
  return tokens;
}
