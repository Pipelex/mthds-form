import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_STYLE_IDS, TYPEFACES, deriveBrandRoles, deriveStyleRoles } from '../../brand';
import { googleFontsHref, roleColorCss, styleTokens } from '../generative/styles/styles';
import {
  HOST_PAGE,
  HOST_PALETTE,
  TEAMS,
  TEAM_KEYS,
  bandOn,
  styleSurfaces,
  teamTokens,
} from '../generative/styles/teams';

/**
 * The stories' host, held to the rules the stories rely on: it writes the
 * roles `deriveStyleRoles` returns onto the tokens docs/brand.md maps them to,
 * `quiet` sets nothing, a style adds no colour of its own, the faces load in
 * every weight a style or the host asks of them, and a team's colours land on
 * the tokens docs/brand.md names, the accent's ink measured on every surface
 * the style draws. The roles themselves are `src/brand/__tests__/styles.test.ts`'s,
 * and the rendering the `Generative/App styles` stories'.
 */

const THEMES = ['light', 'dark'] as const;
const FRAME = readFileSync(new URL('../generative/styles/frame.css', import.meta.url), 'utf8');

describe('styleTokens', () => {
  it('sets nothing for quiet with no typeface, in either theme', () => {
    for (const theme of THEMES) expect(styleTokens(deriveStyleRoles('quiet'), theme)).toEqual({});
  });

  it("gives quiet a team's typeface as both its body and its heading face, and nothing else", () => {
    const manrope = TYPEFACES.find((face) => face.id === 'manrope')!;
    expect(styleTokens(deriveStyleRoles('quiet', 'manrope'), 'light')).toEqual({
      '--font-sans': manrope.stack,
      '--font-heading': manrope.stack,
    });
  });

  it('writes every role of a style but quiet onto its token, in both themes', () => {
    for (const id of APP_STYLE_IDS.filter((candidate) => candidate !== 'quiet')) {
      const roles = deriveStyleRoles(id);
      for (const theme of THEMES) {
        const tokens = styleTokens(roles, theme);
        expect('--panel-field' in tokens, id).toBe(roles.panel![theme].field !== undefined);
        expect(
          Object.keys(tokens)
            .filter((name) => name !== '--panel-field')
            .sort(),
          id,
        ).toEqual(
          [
            '--action-shadow',
            '--density',
            '--font-heading',
            '--font-sans',
            '--heading-tracking',
            '--heading-weight',
            '--panel-edge',
            '--panel-edge-width',
            '--panel-fill',
            '--panel-shadow',
            '--radius',
          ].sort(),
        );
        expect(tokens['--heading-weight']).toBe(String(roles.headingWeight));
        expect(tokens['--radius']).toBe(`${roles.radius}px`);
        expect(tokens['--panel-shadow']).toBe(roles.panel![theme].shadow ?? 'none');
      }
    }
  });

  it('adds no colour: every fill and edge is a role of the theme, a mix of one, or none', () => {
    const literal = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i;
    for (const id of APP_STYLE_IDS) {
      for (const theme of THEMES) {
        const tokens = styleTokens(deriveStyleRoles(id), theme);
        for (const name of ['--panel-fill', '--panel-edge', '--panel-field', '--action-shadow']) {
          const value = tokens[name];
          if (value === undefined || value === 'none' || value === 'transparent') continue;
          expect(value, `${id} ${name}`).not.toMatch(literal);
          expect(value, `${id} ${name}`).toContain('var(--');
          expect(value, `${id} ${name}`).not.toMatch(/var\(--panel-field\b/);
        }
      }
    }
  });

  it("writes a role colour as color-mix() over the contract's tokens, as resolveRoleColor measures it", () => {
    expect(roleColorCss({ role: 'muted' })).toBe('var(--muted)');
    expect(roleColorCss({ role: 'card', toward: { role: 'foreground', share: 0.07 } })).toBe(
      'color-mix(in oklab, var(--card) 93%, var(--foreground))',
    );
    expect(roleColorCss({ role: 'foreground', alpha: 0.62 })).toBe(
      'color-mix(in oklab, var(--foreground) 62%, transparent)',
    );
  });

  it('sets no `--input` on the page, so a field fill reaches the host panel alone', () => {
    for (const id of APP_STYLE_IDS) {
      for (const theme of THEMES)
        expect('--input' in styleTokens(deriveStyleRoles(id), theme), id).toBe(false);
    }
    expect(FRAME).toMatch(/\.af-panel \{[^}]*--input: var\(--panel-field, var\(--host-input\)\)/);
  });
});

describe('the faces the stories load', () => {
  /** The weights a Google Fonts axis spec loads, from a range or a list. */
  function axisWeights(spec: string): number[] {
    const [axes, values] = spec.split('@') as [string, string];
    const at = axes.split(',').indexOf('wght');
    if (at < 0) return [];
    return values.split(';').flatMap((tuple) => {
      const weight = tuple.split(',')[at]!;
      if (!weight.includes('..')) return [Number(weight)];
      const [from, to] = weight.split('..').map(Number) as [number, number];
      return [100, 200, 300, 400, 500, 600, 700, 800, 900].filter((w) => w >= from && w <= to);
    });
  }

  it("loads every face in each weight it is listed in, which covers the host's own title weight", () => {
    const href = googleFontsHref();
    expect(href).toMatch(/&display=swap$/);
    const host = Number(/--heading-weight:\s*(\d+)/.exec(FRAME)?.[1]);
    expect(host).toBeGreaterThan(0);
    for (const face of TYPEFACES) {
      const spec = new RegExp(`family=${face.family.replace(/ /g, '\\+')}:([^&]+)`).exec(href)?.[1];
      expect(spec, face.family).toBeDefined();
      const loaded = axisWeights(spec!);
      for (const weight of [...face.weights, host]) expect(loaded, face.family).toContain(weight);
    }
  });
});

/**
 * docs/brand.md § "Mapping the roles onto tokens", as written there: each
 * token a team's colours set, and the role it takes. The header's roles go to
 * the host's band, which `bandOn` draws.
 */
const BRAND_MAPPING = {
  '--primary': 'action',
  '--primary-foreground': 'onAction',
  '--link': 'accentInk',
  '--selected': 'accentFill',
  '--ring': 'accentInk',
} as const;

describe('teamTokens', () => {
  it("holds the host's palette to the one frame.css paints", () => {
    for (const theme of THEMES) {
      const rule = theme === 'light' ? '\\.app-host' : '\\.dark \\.app-host';
      const block = new RegExp(`^${rule} \\{([^}]*)\\}`, 'm').exec(FRAME)?.[1] ?? '';
      for (const [name, value] of Object.entries(HOST_PALETTE[theme]))
        expect(new RegExp(`--${name}:\\s*([^;]+);`).exec(block)?.[1], `${theme} --${name}`).toBe(
          value,
        );
    }
  });

  it("measures the accent's ink on the canvas and on the panel and fields a style draws", () => {
    expect(styleSurfaces(deriveStyleRoles('quiet'), 'light')).toEqual(['#f6f7f9', '#ffffff']);
    // bold's muted panel, and its fields on the card.
    expect(styleSurfaces(deriveStyleRoles('bold'), 'light')).toEqual([
      '#f6f7f9',
      '#eef1f5',
      '#ffffff',
    ]);
    // soft's dark panel, lifted toward the foreground, and its fields on the page.
    expect(styleSurfaces(deriveStyleRoles('soft'), 'dark')).toEqual([
      '#0b0d12',
      '#1e2129',
      '#12151c',
    ]);
    for (const key of TEAM_KEYS) {
      for (const theme of THEMES) {
        for (const id of APP_STYLE_IDS) {
          const surfaces = styleSurfaces(deriveStyleRoles(id), theme);
          expect(teamTokens(TEAMS[key], theme, surfaces)['--link']).toBe(
            deriveBrandRoles(TEAMS[key].seeds, HOST_PAGE[theme], surfaces).accentInk,
          );
        }
      }
    }
  });

  it("measures each theme against the page the host's palette paints", () => {
    const background = (selector: string) =>
      new RegExp(`^${selector} \\{[^}]*?--background:\\s*([^;]+);`, 'm').exec(FRAME)?.[1];
    expect(background('\\.app-host')).toBe(HOST_PAGE.light);
    expect(background('\\.dark \\.app-host')).toBe(HOST_PAGE.dark);
  });

  it('draws the band in the header colour on a light page, and as a rule under a dark page’s band', () => {
    expect(bandOn('#1d70b8', '#ffffff', 'light')).toEqual({
      '--band': '#1d70b8',
      '--on-band': '#ffffff',
    });
    expect(bandOn('#1d70b8', '#ffffff', 'dark')).toEqual({
      '--band': 'initial',
      '--on-band': 'initial',
      '--band-rule': '#1d70b8',
    });
  });

  it("maps a team's roles onto the tokens docs/brand.md names, and leaves the host's where a role is absent", () => {
    for (const key of TEAM_KEYS) {
      for (const theme of THEMES) {
        const roles: Record<string, string | undefined> = {
          ...deriveBrandRoles(TEAMS[key].seeds, HOST_PAGE[theme]),
        };
        const tokens = teamTokens(TEAMS[key], theme);
        const expected: Record<string, string> = {};
        for (const [token, role] of Object.entries(BRAND_MAPPING)) {
          const value = roles[role];
          if (value !== undefined) expected[token] = value;
        }
        if (roles.header !== undefined && roles.onHeader !== undefined) {
          Object.assign(expected, bandOn(roles.header, roles.onHeader, theme));
        }
        expect(tokens).toEqual(expected);
        // Every team on the list has a button colour; only some have a band.
        expect(tokens['--primary']).toBeDefined();
        const banded = TEAMS[key].seeds.header !== undefined;
        expect(tokens['--band']).toBe(
          banded ? (theme === 'light' ? TEAMS[key].seeds.header : 'initial') : undefined,
        );
        expect('--band-rule' in tokens).toBe(banded && theme === 'dark');
      }
    }
  });

  it('keeps the team’s button colour as read, and its accent ink legible on each theme’s page', () => {
    const govuk = TEAMS['gov-uk'];
    const light = teamTokens(govuk, 'light');
    const dark = teamTokens(govuk, 'dark');
    expect(light['--primary']).toBe(govuk.seeds.action);
    expect(light['--link']).not.toBe(dark['--link']);
  });
});
