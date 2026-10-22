import { describe, expect, it } from 'vitest';
import {
  type BrandRoles,
  type BrandSeeds,
  deriveBrandRoles,
  isAccentAdjusted,
  isActionFaint,
  MIN_CONTROL_CONTRAST,
  PIPELEX_GREEN,
  readableTextOn,
  resolveDarkSeeds,
} from '../index';
import { contrastRatio, type SrgbColor } from '../tokens';

/**
 * The guarantees a host builds on, pinned across a sweep of seeds rather than
 * a handful of chosen ones: a person picks a colour for how it looks, so the
 * seeds that matter are exactly the ones nobody would pick as text - near
 * white, near black, amber, pale yellow, every hue at every lightness - on
 * the light and the dark page a host renders, plus a page near the middle of
 * the lightness scale, where the extremes barely read.
 */

const hex = (value: string): SrgbColor => ({
  colorSpace: 'srgb',
  components: [1, 3, 5].map((at) => parseInt(value.slice(at, at + 2), 16) / 255) as [
    number,
    number,
    number,
  ],
  alpha: 1,
});

const contrast = (a: string, b: string) => contrastRatio(hex(a), hex(b));

/** A deterministic `#rrggbb` from hue (degrees), saturation and lightness (0..1). */
function hsl(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = hue / 60;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const [r, g, b] =
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
  return `#${[r, g, b]
    .map((channel) =>
      Math.round((channel + offset) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Every hue at every lightness, at three saturations, plus the seeds people actually pick. */
const SEEDS: readonly string[] = [
  ...new Set([
    ...[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].flatMap((hue) =>
      [0, 0.5, 1].flatMap((saturation) =>
        [0.02, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.98].map((lightness) =>
          hsl(hue, saturation, lightness),
        ),
      ),
    ),
    '#ffffff', // white
    '#fefefe', // near white
    '#f5f5f5',
    '#000000', // black
    '#010101', // near black
    '#0d0d0d',
    '#f59e0b', // amber
    '#fbbf24',
    '#fef9c3', // pale yellow
    '#fde68a',
    '#ffff00', // yellow
    '#14213d', // navy
    '#2563eb', // a link blue that reads on white by a hair
    '#dc2626', // red
    PIPELEX_GREEN,
  ]),
];

const LIGHT_PAGES = ['#ffffff', '#faf7f2'];
const DARK_PAGES = ['#0d0d0d', '#09090b'];
const MIDDLE_PAGE = '#777777';
const PAGES = [...LIGHT_PAGES, ...DARK_PAGES, MIDDLE_PAGE];

const LOWER_HEX = /^#[0-9a-f]{6}$/;

/** Each seed in every slot it can take, alone and with the others set. */
function seedSets(seed: string, index: number): BrandSeeds[] {
  const other = SEEDS[(index * 7 + 3) % SEEDS.length]!;
  const third = SEEDS[(index * 13 + 5) % SEEDS.length]!;
  return [
    { action: seed },
    { accent: seed },
    { header: seed },
    { action: seed, accent: other, header: third },
    { action: other, accent: seed, header: third },
  ];
}

function textRoles(roles: BrandRoles, page: string): [string, string, string][] {
  return [
    ['onAction on action', roles.onAction, roles.action],
    ['onHeader on header', roles.onHeader, roles.header],
    ['accentInk on the page', roles.accentInk, page],
    ['accentInk on accentFill', roles.accentInk, roles.accentFill],
  ];
}

describe('deriveBrandRoles across a sweep of seeds', () => {
  it('sweeps a couple of hundred distinct seeds, so a failure is a property and not a pick', () => {
    expect(SEEDS.length).toBeGreaterThan(200);
  });

  for (const page of PAGES) {
    it(`reads every text role at 4.5:1 or more on its background, on ${page}`, () => {
      const failures: string[] = [];
      SEEDS.forEach((seed, index) => {
        for (const seeds of seedSets(seed, index)) {
          const roles = deriveBrandRoles(seeds, page);
          for (const [pair, ink, background] of textRoles(roles, page)) {
            const ratio = contrast(ink, background);
            if (ratio < 4.5) {
              failures.push(`${JSON.stringify(seeds)}: ${pair} ${ratio.toFixed(2)}`);
            }
          }
        }
      });
      expect(failures).toEqual([]);
    });

    it(`returns every role as lower-case #rrggbb, on ${page}`, () => {
      SEEDS.forEach((seed, index) => {
        for (const seeds of seedSets(seed.toUpperCase(), index)) {
          const roles = deriveBrandRoles(seeds, page.toUpperCase());
          for (const value of Object.values(roles)) expect(value).toMatch(LOWER_HEX);
        }
      });
    });

    it(`returns each set seed as its own fill, never Pipelex's palette, on ${page}`, () => {
      const unbranded = deriveBrandRoles({}, page);
      SEEDS.forEach((seed, index) => {
        if (seed === PIPELEX_GREEN) return;
        for (const seeds of seedSets(seed, index)) {
          const roles = deriveBrandRoles(seeds, page);
          if (seeds.header) expect(roles.header).toBe(seeds.header);
          if (seeds.action && seeds.action !== PIPELEX_GREEN) {
            expect(roles.action).toBe(seeds.action);
            expect(roles.action).not.toBe(unbranded.action);
          }
          // Whichever seed colours the accent - its own, or the button colour it
          // follows - the accent, its fill and its ink all come from that seed,
          // and none of them is the green's.
          const accentSeed = seeds.accent ?? seeds.action;
          if (accentSeed && accentSeed !== PIPELEX_GREEN) {
            expect(roles.accent).toBe(accentSeed);
            expect(roles.accentFill).not.toBe(unbranded.accentFill);
            expect(roles.accentInk).not.toBe(unbranded.accentInk);
          }
        }
      });
    });
  }

  it('makes the accent its own ink when it already reads', () => {
    const roles = deriveBrandRoles({ accent: '#14213d' }, '#ffffff');
    expect(roles.accentInk).toBe('#14213d');
  });

  it('adjusts the ink only as far as it has to: one step short of the bar, not past it', () => {
    for (const page of [...LIGHT_PAGES, ...DARK_PAGES]) {
      for (const seed of SEEDS) {
        const roles = deriveBrandRoles({ accent: seed }, page);
        if (roles.accentInk === roles.accent) continue;
        const weakest = Math.min(
          contrast(roles.accentInk, page),
          contrast(roles.accentInk, roles.accentFill),
        );
        // A byte's step moves the ratio by a few percent at most, so an ink that
        // only just reaches the bar sits within a few percent above it.
        expect(weakest, `${seed} on ${page}`).toBeLessThan(4.5 * 1.08);
      }
    }
  });

  it('darkens the accent on a light page and lightens it on a dark one, keeping its hue', () => {
    const amber = '#f59e0b';
    const onLight = deriveBrandRoles({ accent: amber }, '#ffffff').accentInk;
    const onDark = deriveBrandRoles({ accent: '#14213d' }, '#0d0d0d').accentInk;
    const luminanceOrder = (a: string, b: string) =>
      contrast(a, '#000000') - contrast(b, '#000000');
    expect(luminanceOrder(onLight, amber)).toBeLessThan(0);
    expect(luminanceOrder(onDark, '#14213d')).toBeGreaterThan(0);
    // Still an amber: red over green over blue, as the seed is.
    const [r, g, b] = hex(onLight).components;
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
  });

  it('keeps a pale fill pale on a light page and deep on a dark one', () => {
    for (const seed of SEEDS) {
      for (const page of LIGHT_PAGES) {
        const { accentFill } = deriveBrandRoles({ accent: seed }, page);
        expect(readableTextOn(accentFill), `${seed} on ${page}`).toBe('#000000');
      }
      for (const page of DARK_PAGES) {
        const { accentFill } = deriveBrandRoles({ accent: seed }, page);
        expect(readableTextOn(accentFill), `${seed} on ${page}`).toBe('#ffffff');
      }
    }
  });
});

describe('deriveBrandRoles fallbacks', () => {
  for (const page of PAGES) {
    it(`falls back to Pipelex green and the page colour with no seeds, on ${page}`, () => {
      for (const seeds of [undefined, null, {}, { action: null, accent: null, header: null }]) {
        const roles = deriveBrandRoles(seeds, page);
        expect(roles.action).toBe(PIPELEX_GREEN);
        expect(roles.accent).toBe(PIPELEX_GREEN);
        expect(roles.header).toBe(page);
        expect(roles.onAction).toBe('#000000');
      }
    });
  }

  it('makes an unset accent follow a set button colour', () => {
    const roles = deriveBrandRoles({ action: '#DC2626' }, '#ffffff');
    expect(roles.action).toBe('#dc2626');
    expect(roles.accent).toBe('#dc2626');
  });

  it('keeps the button on Pipelex green when only the accent is set', () => {
    const roles = deriveBrandRoles({ accent: '#2563eb' }, '#ffffff');
    expect(roles.action).toBe(PIPELEX_GREEN);
    expect(roles.accent).toBe('#2563eb');
  });

  it('turns an unset header into the page, so no band shows', () => {
    const roles = deriveBrandRoles({ action: '#dc2626' }, '#0D0D0D');
    expect(roles.header).toBe('#0d0d0d');
    expect(roles.onHeader).toBe('#ffffff');
  });

  it('paints the text on a fill pure black or pure white', () => {
    expect(deriveBrandRoles({ action: '#14213d' }, '#ffffff').onAction).toBe('#ffffff');
    expect(deriveBrandRoles({ action: '#fef9c3' }, '#ffffff').onAction).toBe('#000000');
    expect(deriveBrandRoles({ header: '#14213d' }, '#ffffff').onHeader).toBe('#ffffff');
  });

  it('refuses a seed or a page that is not #rrggbb, naming it', () => {
    expect(() => deriveBrandRoles({ action: 'red' }, '#ffffff')).toThrow(/action seed/);
    expect(() => deriveBrandRoles({ accent: '#fff' }, '#ffffff')).toThrow(/accent seed/);
    expect(() => deriveBrandRoles({ header: '' }, '#ffffff')).toThrow(/header seed/);
    expect(() => deriveBrandRoles({}, 'white')).toThrow(/page colour/);
  });
});

describe('the settings screen checks', () => {
  it('calls a button colour faint below 3:1 against the page, per page', () => {
    expect(isActionFaint({ action: '#fefefe' }, '#ffffff')).toBe(true);
    expect(isActionFaint({ action: '#14213d' }, '#ffffff')).toBe(false);
    expect(isActionFaint({ action: '#14213d' }, '#0d0d0d')).toBe(true);
    expect(isActionFaint({ action: '#fef9c3' }, '#0d0d0d')).toBe(false);
    for (const page of PAGES) {
      for (const seed of SEEDS) {
        expect(isActionFaint({ action: seed }, page)).toBe(
          contrast(seed, page) < MIN_CONTROL_CONTRAST,
        );
      }
    }
  });

  it('never calls Pipelex green faint when the button colour is unset', () => {
    expect(contrast(PIPELEX_GREEN, '#ffffff')).toBeLessThan(MIN_CONTROL_CONTRAST);
    expect(isActionFaint({}, '#ffffff')).toBe(false);
    expect(isActionFaint(null, '#ffffff')).toBe(false);
  });

  it('says the accent was adjusted exactly when its ink differs from it', () => {
    for (const page of PAGES) {
      SEEDS.forEach((seed, index) => {
        for (const seeds of seedSets(seed, index)) {
          if (seeds.accent == null && seeds.action == null) continue;
          const roles = deriveBrandRoles(seeds, page);
          expect(isAccentAdjusted(seeds, page)).toBe(roles.accentInk !== roles.accent);
        }
      });
    }
    expect(isAccentAdjusted({ accent: '#fef9c3' }, '#ffffff')).toBe(true);
    expect(isAccentAdjusted({ accent: '#14213d' }, '#ffffff')).toBe(false);
    expect(isAccentAdjusted({ accent: '#14213d' }, '#0d0d0d')).toBe(true);
  });

  it('judges an unset accent through the button colour it follows, and never Pipelex green', () => {
    expect(isAccentAdjusted({ action: '#fef9c3' }, '#ffffff')).toBe(true);
    expect(isAccentAdjusted({ header: '#14213d' }, '#ffffff')).toBe(false);
    expect(isAccentAdjusted({}, '#ffffff')).toBe(false);
    expect(deriveBrandRoles({}, '#ffffff').accentInk).not.toBe(PIPELEX_GREEN);
  });
});

describe('resolveDarkSeeds', () => {
  it('takes each dark colour where set and the light one where not', () => {
    expect(
      resolveDarkSeeds(
        { action: '#14213d', accent: '#2563eb', header: '#ffffff' },
        { action: '#93c5fd', accent: null },
      ),
    ).toEqual({ action: '#93c5fd', accent: '#2563eb', header: '#ffffff' });
  });

  it('lets a light accent outrank the dark button colour it would otherwise follow', () => {
    const dark = resolveDarkSeeds({ accent: '#2563eb' }, { action: '#93c5fd' });
    expect(deriveBrandRoles(dark, '#0d0d0d').accent).toBe('#2563eb');
  });

  it('leaves a colour set in neither unset, for deriveBrandRoles to fall back', () => {
    expect(resolveDarkSeeds(null, undefined)).toEqual({ action: null, accent: null, header: null });
    expect(deriveBrandRoles(resolveDarkSeeds(null, null), '#0d0d0d').action).toBe(PIPELEX_GREEN);
  });
});
