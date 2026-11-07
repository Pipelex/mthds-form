import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveBrandRoles } from '../../brand';
import {
  APP_STYLES,
  APP_STYLE_IDS,
  TYPEFACES,
  axisWeights,
  fontStack,
  inTheme,
  googleFontsHref,
  styleTokens,
  typeface,
} from '../generative/styles/styles';
import { HOST_PAGE, TEAMS, TEAM_KEYS, bandOn, teamTokens } from '../generative/styles/teams';

/**
 * The app styles' table, held to the rules the stories rely on: `quiet` sets
 * nothing, a team's typeface replaces the body face and, where a style's
 * headings follow the body, the heading face, a style adds
 * no colour of its own, and a team's colours land on the tokens docs/brand.md
 * maps them to. The rendering itself is the `Generative/App styles` stories'
 * to show.
 */

const THEMES = ['light', 'dark'] as const;
const BODY_FACES = TYPEFACES.filter((face) => face.use === 'body');

describe('styleTokens', () => {
  it('sets nothing for quiet with no typeface, in either theme', () => {
    for (const theme of THEMES) expect(styleTokens('quiet', null, theme)).toEqual({});
  });

  it("gives quiet a team's typeface as both its body and its heading face, and nothing else", () => {
    const tokens = styleTokens('quiet', 'manrope', 'light');
    expect(tokens).toEqual({
      '--font-sans': fontStack('manrope'),
      '--font-heading': fontStack('manrope'),
    });
  });

  it("replaces every style's body face with a team's typeface", () => {
    for (const id of APP_STYLE_IDS) {
      for (const face of BODY_FACES) {
        expect(styleTokens(id, face.id, 'light')['--font-sans']).toBe(fontStack(face.id));
      }
    }
  });

  it("replaces the heading face only where a style's headings follow its body", () => {
    for (const id of APP_STYLE_IDS) {
      const style = APP_STYLES[id];
      const heading = styleTokens(id, 'ibm-plex-sans', 'light')['--font-heading'];
      if (style.headingFace === null || style.headingFace === 'body') {
        expect(heading).toBe(fontStack('ibm-plex-sans'));
      } else {
        expect(heading).toBe(fontStack(style.headingFace));
      }
    }
  });

  it('gives every style but quiet a full set of tokens, in both themes', () => {
    for (const id of APP_STYLE_IDS.filter((candidate) => candidate !== 'quiet')) {
      for (const theme of THEMES) {
        const tokens = styleTokens(id, null, theme);
        expect('--action-shadow' in tokens).toBe(APP_STYLES[id].actionShadow !== null);
        // The tokens a style sets only where it departs from the host's.
        const optional = ['--action-shadow', '--input'];
        const rest = Object.keys(tokens).filter((name) => !optional.includes(name));
        expect(rest.sort()).toEqual(
          [
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
      }
    }
  });

  it('draws a shadow per theme, never the light one on a dark page', () => {
    for (const id of APP_STYLE_IDS) {
      const shadow = APP_STYLES[id].panel?.shadow;
      if (!shadow) continue;
      expect(shadow.dark).not.toBe(shadow.light);
      expect(styleTokens(id, null, 'dark')['--panel-shadow']).toBe(shadow.dark);
    }
  });

  it('adds no colour: every fill and edge is a role of the theme, a mix of one, or none', () => {
    const literal = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i;
    for (const id of APP_STYLE_IDS) {
      const panel = APP_STYLES[id].panel;
      if (!panel) continue;
      const themes = [panel.fill, panel.edge, ...(panel.field ? [panel.field] : [])];
      for (const themed of themes) {
        for (const theme of THEMES) {
          const value = inTheme(themed, theme);
          expect(value, `${id}: ${value}`).not.toMatch(literal);
          expect(value === 'transparent' || value.includes('var(--'), `${id}: ${value}`).toBe(true);
        }
      }
    }
  });

  it('never fills a field from `--input`, the token the fill itself sets', () => {
    for (const id of APP_STYLE_IDS) {
      const field = APP_STYLES[id].panel?.field;
      if (!field) continue;
      for (const theme of THEMES) expect(inTheme(field, theme), id).not.toMatch(/var\(--input\b/);
    }
  });
});

describe('the typefaces', () => {
  it('ends every stack on a generic family, so a face that never loads still renders its kind', () => {
    for (const face of TYPEFACES) {
      expect(fontStack(face.id)).toMatch(new RegExp(`^"${face.family}", .*\\b${face.category}$`));
    }
  });

  it("names only faces on the list, and offers a style's heading-only face as no body", () => {
    for (const id of APP_STYLE_IDS) {
      const { bodyFace, headingFace } = APP_STYLES[id];
      if (bodyFace) expect(typeface(bodyFace).use).toBe('body');
      if (headingFace && headingFace !== 'body') expect(typeface(headingFace)).toBeDefined();
    }
    expect(() => typeface('comic-sans' as never)).toThrow();
  });

  it('reads the weights an axis spec loads, from a range or a list', () => {
    expect(axisWeights('wght@300..700')).toEqual([300, 400, 500, 600, 700]);
    expect(axisWeights('opsz,wght@9..40,350..600')).toEqual([400, 500, 600]);
    expect(axisWeights('wght@400;600')).toEqual([400, 600]);
    expect(axisWeights('opsz@9..40')).toEqual([]);
  });

  it("loads every face, each with the weights a style asks of it and the host's own title weight", () => {
    const href = googleFontsHref();
    for (const face of TYPEFACES)
      expect(href).toContain(`family=${face.family.replace(/ /g, '+')}:${face.axes}`);
    expect(href).toMatch(/&display=swap$/);
    // The host's titles keep their weight under a team's face on `quiet`.
    const frame = readFileSync(new URL('../generative/styles/frame.css', import.meta.url), 'utf8');
    const host = Number(/--heading-weight:\s*(\d+)/.exec(frame)?.[1]);
    expect(host).toBeGreaterThan(0);
    const asked = [host];
    for (const id of APP_STYLE_IDS) {
      const { headingWeight } = APP_STYLES[id];
      if (headingWeight !== null) asked.push(headingWeight);
    }
    for (const face of TYPEFACES) {
      expect(face.weights).toEqual(axisWeights(face.axes));
      for (const weight of asked) expect(face.weights, face.family).toContain(weight);
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
  it("measures each theme against the page the host's palette paints", () => {
    const frame = readFileSync(new URL('../generative/styles/frame.css', import.meta.url), 'utf8');
    const background = (selector: string) =>
      new RegExp(`^${selector} \\{[^}]*?--background:\\s*([^;]+);`, 'm').exec(frame)?.[1];
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
