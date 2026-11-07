import { deriveBrandRoles, type BrandSeeds } from '../../../brand';

/**
 * Three teams' colours, as a team sets them: up to three seeds (the button,
 * the accent, the header band) and a logo. The seeds are real sites' own
 * colours, read off the custom properties each site's stylesheets declare,
 * from the brands a brand-reading method produced from those sites on
 * 2026-10-10 (`pipelex-method`, claude-5.5-opus); `provenance` names the
 * property behind each seed. A team's name and logo are the site's, loaded
 * from the site, and nothing here is that organisation's endorsement.
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

/**
 * The page colour a team's accent is measured against, in each theme: the
 * host's panel surface, where the form and the result are read. It is the
 * `--background` of the host's palette in `frame.css`.
 */
export const HOST_PAGE = { light: '#ffffff', dark: '#12151c' } as const;

/**
 * A team's colours as the kernel's tokens, in one theme, mapped as
 * docs/brand.md § "Mapping the roles onto tokens" says: the button colour
 * onto `--primary`, the accent's ink onto `--link` and `--ring`, its pale
 * fill onto `--selected`. The header band's two roles go to the host's own
 * band, which the controls do not draw. An absent role sets nothing, so the
 * host's own token stays.
 */
/**
 * The band's ground on `page`. On a dark page, a band that carries light text
 * is taken halfway toward the page, so a saturated header does not sit on a
 * near-black page like a different site's; its text, already light, reads
 * better still. A band with dark text is left as the team set it.
 */
export function bandOn(header: string, onHeader: string, page: string): string {
  const darkPage = page === HOST_PAGE.dark;
  return darkPage && onHeader === '#ffffff'
    ? `color-mix(in oklab, ${header} 50%, ${page})`
    : header;
}

export function teamTokens(team: Team, page: string): Record<string, string> {
  const roles = deriveBrandRoles(team.seeds, page);
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
  if (roles.header !== undefined) {
    tokens['--band'] = bandOn(roles.header, roles.onHeader, page);
    tokens['--on-band'] = roles.onHeader;
  }
  return tokens;
}
