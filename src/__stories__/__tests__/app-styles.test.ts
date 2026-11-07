import { describe, expect, it } from 'vitest';
import { deriveBrandRoles } from '../../brand';
import {
  APP_STYLES,
  APP_STYLE_IDS,
  TYPEFACES,
  fontStack,
  inTheme,
  googleFontsHref,
  styleTokens,
  typeface,
} from '../generative/styles/styles';
import { HOST_PAGE, TEAMS, TEAM_KEYS, bandOn, teamTokens } from '../generative/styles/teams';

/**
 * The app styles' table, held to the rules the stories rely on: `quiet` sets
 * nothing, a team's typeface replaces what D3 says it replaces, a style adds
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
        const optional = ['--action-shadow', '--inset-nested-fill', '--input'];
        const rest = Object.keys(tokens).filter((name) => !optional.includes(name));
        expect(rest.sort()).toEqual(
          [
            '--density',
            '--font-heading',
            '--font-sans',
            '--heading-tracking',
            '--heading-weight',
            '--inset-edge',
            '--inset-fill',
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
      for (const themed of [panel.fill, panel.edge, panel.inset.fill, panel.inset.edge]) {
        for (const theme of THEMES) {
          const value = inTheme(themed, theme);
          expect(value, `${id}: ${value}`).not.toMatch(literal);
          expect(value === 'transparent' || value.includes('var(--'), `${id}: ${value}`).toBe(true);
        }
      }
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

  it('loads every face, each with the weights a style asks of it', () => {
    const href = googleFontsHref();
    for (const face of TYPEFACES)
      expect(href).toContain(`family=${face.family.replace(/ /g, '+')}:`);
    expect(href).toMatch(/&display=swap$/);
    for (const id of APP_STYLE_IDS) {
      const { headingWeight } = APP_STYLES[id];
      if (headingWeight === null) continue;
      for (const face of TYPEFACES) expect(face.weights).toContain(headingWeight);
    }
  });
});

describe('teamTokens', () => {
  it('draws the band in the header colour on a light page, and as a rule under a dark page’s band', () => {
    expect(bandOn('#1d70b8', '#ffffff', HOST_PAGE.light)).toEqual({
      '--band': '#1d70b8',
      '--on-band': '#ffffff',
    });
    expect(bandOn('#1d70b8', '#ffffff', HOST_PAGE.dark)).toEqual({
      '--band': 'initial',
      '--on-band': 'initial',
      '--band-rule': '#1d70b8',
    });
  });

  it("maps a team's roles onto the tokens docs/brand.md names, and leaves the host's where a role is absent", () => {
    for (const key of TEAM_KEYS) {
      for (const theme of THEMES) {
        const roles = deriveBrandRoles(TEAMS[key].seeds, HOST_PAGE[theme]);
        const tokens = teamTokens(TEAMS[key], HOST_PAGE[theme]);
        const expected: Record<string, string> = {};
        if (roles.action !== undefined) {
          expected['--primary'] = roles.action;
          expected['--primary-foreground'] = roles.onAction;
        }
        if (roles.accent !== undefined) {
          expected['--link'] = roles.accentInk;
          expected['--ring'] = roles.accentInk;
          expected['--selected'] = roles.accentFill;
        }
        if (roles.header !== undefined) {
          Object.assign(expected, bandOn(roles.header, roles.onHeader, HOST_PAGE[theme]));
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
    const light = teamTokens(govuk, HOST_PAGE.light);
    const dark = teamTokens(govuk, HOST_PAGE.dark);
    expect(light['--primary']).toBe(govuk.seeds.action);
    expect(light['--link']).not.toBe(dark['--link']);
  });
});
