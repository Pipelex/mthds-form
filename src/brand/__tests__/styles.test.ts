import { describe, expect, it } from 'vitest';
import {
  APP_STYLES,
  APP_STYLE_IDS,
  TYPEFACES,
  contrastRatio,
  deriveBrandRoles,
  deriveStyleRoles,
  isAppStyle,
  isTypeface,
  resolveRoleColor,
  type ColorTokenName,
  type SrgbColor,
} from '..';

/**
 * The app styles and the typefaces: the roles each choice sets and none for
 * an unknown id, every face's generic fallback, and the accent's ink held
 * readable on every surface a style draws. What the roles look like on a
 * page is the `Generative/App styles` stories' to show; the tokens' fallbacks
 * are `make assert-bundle`'s to hold.
 */

const THEMES = ['light', 'dark'] as const;
const BODY_FACES = TYPEFACES.filter((face) => face.use === 'body');

describe('deriveStyleRoles', () => {
  it('sets nothing for quiet, for an unknown style and for none, with no typeface', () => {
    expect(deriveStyleRoles('quiet')).toEqual({});
    expect(deriveStyleRoles('glossy')).toEqual({});
    expect(deriveStyleRoles(null)).toEqual({});
    expect(deriveStyleRoles(undefined, null)).toEqual({});
  });

  it("gives quiet a team's typeface as its body and its heading face, and nothing else", () => {
    const manrope = TYPEFACES.find((face) => face.id === 'manrope')!;
    expect(deriveStyleRoles('quiet', 'manrope')).toEqual({
      bodyFace: manrope,
      headingFace: manrope,
    });
  });

  it('treats an unknown typeface, and a heading-only one, as no typeface', () => {
    for (const id of APP_STYLE_IDS) {
      expect(deriveStyleRoles(id, 'comic-sans')).toEqual(deriveStyleRoles(id));
      expect(deriveStyleRoles(id, 'newsreader')).toEqual(deriveStyleRoles(id));
    }
  });

  it("replaces every style's body face with a team's typeface", () => {
    for (const id of APP_STYLE_IDS) {
      for (const face of BODY_FACES) expect(deriveStyleRoles(id, face.id).bodyFace).toEqual(face);
    }
  });

  it("replaces the heading face only where a style's headings follow its body", () => {
    const plex = TYPEFACES.find((face) => face.id === 'ibm-plex-sans')!;
    expect(deriveStyleRoles('soft', plex.id).headingFace).toEqual(plex);
    expect(deriveStyleRoles('bold', plex.id).headingFace).toEqual(plex);
    expect(deriveStyleRoles('editorial', plex.id).headingFace?.id).toBe('newsreader');
  });

  it('gives every style but quiet the whole set of roles', () => {
    for (const id of APP_STYLE_IDS.filter((candidate) => candidate !== 'quiet')) {
      expect(Object.keys(deriveStyleRoles(id)).sort(), id).toEqual(
        [
          'actionShadow',
          'bodyFace',
          'density',
          'headingFace',
          'headingTracking',
          'headingWeight',
          'panel',
          'radius',
        ].sort(),
      );
    }
  });

  it('is what APP_STYLES holds for a team that picked no typeface', () => {
    for (const id of APP_STYLE_IDS) {
      expect(APP_STYLES[id].id).toBe(id);
      expect(APP_STYLES[id].direction).toMatch(/^[A-Z].+\.$/);
      expect(APP_STYLES[id].roles).toEqual(deriveStyleRoles(id));
    }
  });

  it('hands out a copy, so a host that edits what it got changes nothing for the next', () => {
    const roles = deriveStyleRoles('soft');
    roles.panel!.light.edgeWidth = 9;
    expect(deriveStyleRoles('soft').panel!.light.edgeWidth).toBe(1);
  });

  it('hands out its faces as copies too, and keeps the catalogue and the styles frozen', () => {
    // A process serves many teams: what one host edits on the roles it got
    // must reach neither the next derivation nor the lists every host reads.
    const roles = deriveStyleRoles('soft', 'manrope');
    roles.bodyFace!.stack = 'Comic Sans MS';
    (roles.bodyFace!.weights as number[]).push(900);
    expect(roles.headingFace!.stack).toMatch(/^"Manrope"/);
    expect(deriveStyleRoles('soft', 'manrope').bodyFace!.stack).toMatch(/^"Manrope"/);
    expect(TYPEFACES.find((face) => face.id === 'manrope')!.weights).not.toContain(900);
    expect(Object.isFrozen(TYPEFACES)).toBe(true);
    expect(Object.isFrozen(TYPEFACES[0]!.weights)).toBe(true);
    expect(Object.isFrozen(APP_STYLES.soft.roles.panel!.dark)).toBe(true);
  });

  it('draws a shadow per theme, never the light one on a dark page', () => {
    for (const id of APP_STYLE_IDS) {
      const panel = deriveStyleRoles(id).panel;
      if (!panel?.light.shadow) continue;
      expect(panel.dark.shadow, id).not.toBe(panel.light.shadow);
    }
  });

  it('sets a dark field a step above its panel, never down at the page under it', () => {
    // On a dark page a field darker than the panel round it reads as a well
    // cut into the panel, a hole rather than a control on it. Held on the
    // host's palette and on the stock one, whose card is its background.
    const lighter = (a: string, b: string) => luminance(hex(a)) > luminance(hex(b));
    for (const palette of [PALETTE.dark, STOCK_DARK]) {
      for (const id of APP_STYLE_IDS) {
        const panel = deriveStyleRoles(id).panel?.dark;
        if (!panel?.field) continue;
        const fill = resolveRoleColor(panel.fill, palette);
        const field = resolveRoleColor(panel.field, palette);
        if (field === fill) continue;
        expect(lighter(field, fill), `${id}: field ${field} on panel ${fill}`).toBe(true);
        expect(field, `${id}: the page`).not.toBe(palette.background);
      }
    }
  });

  it("never lays a call to action's light shadow on a dark page", () => {
    for (const id of APP_STYLE_IDS) {
      const shadow = deriveStyleRoles(id).actionShadow;
      if (!shadow || shadow.light === 'none') continue;
      expect(shadow.dark, id).not.toEqual(shadow.light);
    }
  });

  it('asks only for weights every face is loaded in', () => {
    for (const id of APP_STYLE_IDS) {
      const { headingWeight } = deriveStyleRoles(id);
      if (headingWeight === undefined) continue;
      for (const face of TYPEFACES) expect(face.weights, face.family).toContain(headingWeight);
    }
  });
});

describe('the typefaces', () => {
  it('ends every stack on a generic family, so a face that never loads still renders its kind', () => {
    for (const face of TYPEFACES) {
      expect(face.stack).toBe(`"${face.family}", ${face.fallback}`);
      expect(face.fallback).toMatch(new RegExp(`\\b${face.category}$`));
    }
  });

  it("loads the host's light title weight too, which a team's face carries on quiet", () => {
    for (const face of TYPEFACES) expect(face.weights).toContain(300);
  });

  it("offers a team every body face and no style's heading-only face", () => {
    for (const face of TYPEFACES) expect(isTypeface(face.id), face.id).toBe(face.use === 'body');
    expect(isTypeface('comic-sans')).toBe(false);
    expect(isTypeface(undefined)).toBe(false);
  });

  it('knows the four styles and nothing else', () => {
    for (const id of APP_STYLE_IDS) expect(isAppStyle(id)).toBe(true);
    expect(isAppStyle('glossy')).toBe(false);
    expect(isAppStyle(null)).toBe(false);
    expect(isAppStyle('toString')).toBe(false);
  });

  it('keeps the list of styles frozen, so no caller can add one the definitions lack', () => {
    expect(Object.isFrozen(APP_STYLE_IDS)).toBe(true);
    expect(() => (APP_STYLE_IDS as string[]).push('glossy')).toThrow(TypeError);
    expect(isAppStyle('glossy')).toBe(false);
    expect(deriveStyleRoles('glossy')).toEqual({});
  });
});

/** A host's palette, as hex, in each theme: the surfaces a style's roles name. */
const PALETTE: Record<'light' | 'dark', Partial<Record<ColorTokenName, string>>> = {
  light: {
    background: '#ffffff',
    foreground: '#0f1729',
    card: '#ffffff',
    muted: '#eef1f5',
    border: '#dde2e9',
  },
  dark: {
    background: '#12151c',
    foreground: '#eef1f6',
    card: '#12151c',
    muted: '#1c212b',
    border: '#353c49',
  },
};

/** `theme.css`'s dark palette, the stock one, as hex: its card is its background. */
const STOCK_DARK: Partial<Record<ColorTokenName, string>> = {
  background: '#09090b',
  foreground: '#fafafa',
  card: '#09090b',
  muted: '#27272a',
  border: '#27272a',
};

/** WCAG's relative luminance, to say which of two surfaces is the lighter. */
const luminance = (color: SrgbColor): number => {
  const [r, g, b] = color.components.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const hex = (value: string): SrgbColor => {
  const channel = (at: number) => parseInt(value.slice(at, at + 2), 16) / 255;
  return { colorSpace: 'srgb', components: [channel(1), channel(3), channel(5)], alpha: 1 };
};

describe('resolveRoleColor', () => {
  it('reads a role off the palette', () => {
    expect(resolveRoleColor({ role: 'muted' }, PALETTE.dark)).toBe('#1c212b');
  });

  it("mixes toward another role in Oklab, as CSS's color-mix() does", () => {
    // color-mix(in oklab, #12151c 93%, #eef1f6), as Chromium computes it.
    expect(
      resolveRoleColor({ role: 'card', toward: { role: 'foreground', share: 0.07 } }, PALETTE.dark),
    ).toBe('#1e2129');
  });

  it('lays a translucent role over what it lies on, and refuses to guess what that is', () => {
    const edge = { role: 'foreground', alpha: 0.5 } as const;
    expect(resolveRoleColor(edge, { foreground: '#000000' }, '#ffffff')).toBe('#808080');
    expect(() => resolveRoleColor(edge, PALETTE.light)).toThrow(/lies over/);
  });

  it('refuses a role the palette does not hold', () => {
    expect(() => resolveRoleColor({ role: 'popover' }, PALETTE.light)).toThrow(/popover/);
  });
});

describe("a team's accent on a style's surfaces", () => {
  // The three teams the stories wear, as their sites set them, and a sweep of
  // hues at the lightness a person picks an accent in.
  const ACCENTS = [
    '#533afd',
    '#1a65a6',
    '#4051b5',
    '#00bda4',
    ...Array.from({ length: 12 }, (_, index) => hsl(index * 30, 0.7, 0.5)),
  ];

  it("reads at 4.5:1 or more on the page, the pale fill and each style's panel and fields, in both themes", () => {
    for (const id of APP_STYLE_IDS) {
      for (const theme of THEMES) {
        const panel = deriveStyleRoles(id).panel?.[theme];
        const page = PALETTE[theme].background!;
        const surfaces = panel
          ? [panel.fill, ...(panel.field ? [panel.field] : [])].map((color) =>
              resolveRoleColor(color, PALETTE[theme]),
            )
          : [];
        for (const accent of ACCENTS) {
          const roles = deriveBrandRoles({ accent }, page, surfaces);
          for (const background of [page, roles.accentFill!, ...surfaces]) {
            expect(
              contrastRatio(hex(roles.accentInk!), hex(background)),
              `${id} ${theme} ${accent} on ${background}`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });
});

function hsl(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const [r, g, b] =
    hue < 60
      ? [chroma, second, 0]
      : hue < 120
        ? [second, chroma, 0]
        : hue < 180
          ? [0, chroma, second]
          : hue < 240
            ? [0, second, chroma]
            : hue < 300
              ? [second, 0, chroma]
              : [chroma, 0, second];
  const offset = lightness - chroma / 2;
  return `#${[r, g, b]
    .map((channel) =>
      Math.round((channel + offset) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}
