import { describe, expect, it } from 'vitest';
import {
  type BrandRoles,
  type BrandSeeds,
  deriveBrandRoles,
  isAccentAdjusted,
  isActionFaint,
  MIN_CONTROL_CONTRAST,
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

/** Every text role the roles carry, paired with the background it is read on. */
function textRoles(roles: BrandRoles, page: string): [string, string, string][] {
  const pairs: [string, string, string][] = [];
  if (roles.action !== undefined) pairs.push(['onAction on action', roles.onAction, roles.action]);
  if (roles.header !== undefined) pairs.push(['onHeader on header', roles.onHeader, roles.header]);
  if (roles.accent !== undefined) {
    pairs.push(['accentInk on the page', roles.accentInk, page]);
    pairs.push(['accentInk on accentFill', roles.accentInk, roles.accentFill]);
  }
  return pairs;
}

/** The roles a set of seeds must produce, and no others. */
function expectedRoles(seeds: BrandSeeds): string[] {
  return [
    ...(seeds.action == null ? [] : ['action', 'onAction']),
    ...(seeds.accent == null && seeds.action == null ? [] : ['accent', 'accentFill', 'accentInk']),
    ...(seeds.header == null ? [] : ['header', 'onHeader']),
  ].sort();
}

/** The accent's roles, which seeds naming an accent or a button colour always produce. */
function accentOf(roles: BrandRoles): { accent: string; accentFill: string; accentInk: string } {
  if (roles.accent === undefined) throw new Error('These seeds produced no accent roles.');
  return { accent: roles.accent, accentFill: roles.accentFill, accentInk: roles.accentInk };
}

describe('deriveBrandRoles across a sweep of seeds', () => {
  it('sweeps a couple of hundred distinct seeds, so a failure is a property and not a pick', () => {
    expect(SEEDS.length).toBeGreaterThan(200);
  });

  for (const page of PAGES) {
    it(`returns exactly the roles its seeds produce, on ${page}`, () => {
      SEEDS.forEach((seed, index) => {
        for (const seeds of seedSets(seed, index)) {
          const roles = deriveBrandRoles(seeds, page);
          expect(Object.keys(roles).sort(), JSON.stringify(seeds)).toEqual(expectedRoles(seeds));
        }
      });
    });

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

    it(`returns each set seed as its own fill, on ${page}`, () => {
      SEEDS.forEach((seed, index) => {
        for (const seeds of seedSets(seed, index)) {
          const roles = deriveBrandRoles(seeds, page);
          if (seeds.header) expect(roles.header).toBe(seeds.header);
          if (seeds.action) expect(roles.action).toBe(seeds.action);
          // Whichever seed colours the accent - its own, or the button colour it
          // follows - the accent is that seed, as it was set.
          const accentSeed = seeds.accent ?? seeds.action;
          if (accentSeed) expect(roles.accent).toBe(accentSeed);
        }
      });
    });
  }

  it('makes the accent its own ink when it already reads', () => {
    const roles = deriveBrandRoles({ accent: '#14213d' }, '#ffffff');
    expect(accentOf(roles).accentInk).toBe('#14213d');
  });

  it('adjusts the ink only as far as it has to: one step short of the bar, not past it', () => {
    for (const page of [...LIGHT_PAGES, ...DARK_PAGES]) {
      for (const seed of SEEDS) {
        const roles = accentOf(deriveBrandRoles({ accent: seed }, page));
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
    const onLight = accentOf(deriveBrandRoles({ accent: amber }, '#ffffff')).accentInk;
    const onDark = accentOf(deriveBrandRoles({ accent: '#14213d' }, '#0d0d0d')).accentInk;
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
        const { accentFill } = accentOf(deriveBrandRoles({ accent: seed }, page));
        expect(readableTextOn(accentFill), `${seed} on ${page}`).toBe('#000000');
      }
      for (const page of DARK_PAGES) {
        const { accentFill } = accentOf(deriveBrandRoles({ accent: seed }, page));
        expect(readableTextOn(accentFill), `${seed} on ${page}`).toBe('#ffffff');
      }
    }
  });
});

describe('deriveBrandRoles leaves what the team did not set to the host', () => {
  for (const page of PAGES) {
    it(`returns no colour role with no seeds, on ${page}`, () => {
      for (const seeds of [undefined, null, {}, { action: null, accent: null, header: null }]) {
        expect(Object.keys(deriveBrandRoles(seeds, page))).toEqual([]);
      }
    });
  }

  it('makes an unset accent follow a set button colour, and sets no header', () => {
    const roles = deriveBrandRoles({ action: '#DC2626' }, '#ffffff');
    expect(Object.keys(roles).sort()).toEqual(
      ['accent', 'accentFill', 'accentInk', 'action', 'onAction'].sort(),
    );
    expect(roles.action).toBe('#dc2626');
    expect(roles.onAction).toBe('#ffffff');
    expect(roles.accent).toBe('#dc2626');
    expect(accentOf(roles)).toEqual(accentOf(deriveBrandRoles({ accent: '#dc2626' }, '#ffffff')));
  });

  it('leaves the button to the host when only the accent is set', () => {
    const roles = deriveBrandRoles({ accent: '#2563eb' }, '#ffffff');
    expect(Object.keys(roles).sort()).toEqual(['accent', 'accentFill', 'accentInk']);
    expect(roles.action).toBeUndefined();
    expect(roles.onAction).toBeUndefined();
    expect(roles.accent).toBe('#2563eb');
  });

  it('leaves the header band absent when no header is set', () => {
    for (const seeds of [
      { action: '#dc2626' },
      { accent: '#2563eb' },
      { action: '#dc2626', accent: '#2563eb' },
    ]) {
      const roles = deriveBrandRoles(seeds, '#0D0D0D');
      expect(roles.header).toBeUndefined();
      expect(roles.onHeader).toBeUndefined();
    }
  });

  it('paints the header band alone when only the header is set', () => {
    const roles = deriveBrandRoles({ header: '#14213D' }, '#ffffff');
    expect(roles).toStrictEqual({ header: '#14213d', onHeader: '#ffffff' });
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
    expect(() => deriveBrandRoles({}, '#ffffff', ['#eee'])).toThrow(/Surface 1/);
  });

  it('refuses a surface no accent ink can read on, only when there is an accent', () => {
    // An ink dark enough for the white page reaches at most 3.94:1 on
    // #6b6b6b, and one light enough for #6b6b6b fails the page: no shade of
    // the accent reads on both.
    expect(() => deriveBrandRoles({ accent: '#2563eb' }, '#ffffff', ['#6b6b6b'])).toThrow(
      /No accent ink can read on every surface at once: .*#ffffff.* and #6b6b6b/,
    );
    // With no accent no ink is derived, so the same surface costs the team
    // nothing: its header is painted as it is without it.
    expect(deriveBrandRoles({ header: '#14213d' }, '#ffffff', ['#6b6b6b'])).toStrictEqual(
      deriveBrandRoles({ header: '#14213d' }, '#ffffff'),
    );
    expect(Object.keys(deriveBrandRoles(null, '#ffffff', ['#6b6b6b']))).toEqual([]);
  });
});

describe('a surface on the far side of the page', () => {
  /** Every grey a hex can carry, `#000000` to `#ffffff`. */
  const GREYS = Array.from(
    { length: 256 },
    (_, value) => `#${value.toString(16).padStart(2, '0').repeat(3)}`,
  );

  it('finds an ink between the extremes before it refuses the surface', () => {
    // A white page, the near-white pale fill of a pale accent and a black
    // panel: black, the page's extreme, cannot read on the panel, yet one
    // grey reads on all three, and it is the ink. The derivation used to
    // refuse the panel before it measured anything.
    const roles = deriveBrandRoles({ accent: '#f0f0f0' }, '#ffffff', ['#000000']);
    expect(roles.accentInk).toBe('#757575');
    for (const background of ['#ffffff', roles.accentFill!, '#000000']) {
      expect(contrast(roles.accentInk!, background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('refuses one only when no shade of the accent reads on every background at once', () => {
    // A grey accent's shades are the greys, so every one of them is tried
    // here and the derivation's answer is held to the whole set: an ink that
    // reads on the page, the pale fill and the surface, or a refusal exactly
    // when no grey does.
    for (const page of ['#ffffff', '#f6f7f9', '#0d0d0d', '#12151c']) {
      for (const surface of ['#000000', '#1a1a1a', '#6b6b6b', '#f2f2f2', '#ffffff']) {
        for (const accent of GREYS.filter((_, index) => index % 15 === 0)) {
          // The pale fill depends on the accent and the page alone.
          const fill = deriveBrandRoles({ accent }, page).accentFill!;
          const backgrounds = [page, fill, surface];
          const readable = GREYS.filter((grey) =>
            backgrounds.every((background) => contrast(grey, background) >= 4.5),
          );
          let ink: string | undefined;
          try {
            ink = deriveBrandRoles({ accent }, page, [surface]).accentInk;
          } catch {
            ink = undefined;
          }
          const where = `${accent} on ${page} beside ${surface}`;
          if (ink === undefined) expect(readable, where).toEqual([]);
          else expect(readable, where).toContain(ink);
        }
      }
    }
  });

  it('finds a shade that reads although it spans less lightness than a byte', () => {
    // On a chromatic accent two channels can turn over to their next byte
    // within a sliver of lightness, so the one shade that reads everywhere is
    // narrower than any fixed step a walk could take: these each have a
    // shade that reads at 4.5:1 on all three backgrounds, which a walk in
    // steps of 1/1024 stepped over and refused.
    const cases: [accent: string, page: string, surface: string, ink: string][] = [
      ['#f3f4ee', '#ffffff', '#040404', '#727a4f'],
      ['#100e11', '#000000', '#fdfdfd', '#7f7087'],
    ];
    for (const [accent, page, surface, ink] of cases) {
      const roles = deriveBrandRoles({ accent }, page, [surface]);
      expect(roles.accentInk, accent).toBe(ink);
      for (const background of [page, roles.accentFill!, surface]) {
        expect(contrast(ink, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('refuses a chromatic accent only when no shade of it reads', () => {
    // The accents a far-side surface leaves the most room for: a white page
    // beside a black panel and the reverse, swept over hues and
    // lightnesses with a fixed seed. A shade is any hex on the accent's line
    // of hue and saturation, sampled here independently, at a step far finer
    // than all but the narrowest shades; wherever the derivation refuses, the
    // sampling must find no shade that reads on every background.
    let seed = 0x5eed;
    const random = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
    const bytes = (channels: readonly number[]) =>
      channels.map((channel) => Math.round(Math.min(1, Math.max(0, channel)) * 255));
    const toHex = (channels: readonly number[]) =>
      `#${bytes(channels)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')}`;
    // Relative luminance by byte, so the sampling is cheap; a shade it finds
    // is confirmed with the contrast the derivation itself measures.
    const linear = Array.from({ length: 256 }, (_, byte) => {
      const value = byte / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    const luminance = ([r, g, b]: readonly number[]) =>
      0.2126 * linear[r!]! + 0.7152 * linear[g!]! + 0.0722 * linear[b!]!;
    const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    /** Each channel's weight on the chroma for the accent's hue, as `fromHsl` lays it out. */
    const lineOf = (accent: string) => {
      const [r, g, b] = [1, 3, 5].map((at) => parseInt(accent.slice(at, at + 2), 16) / 255) as [
        number,
        number,
        number,
      ];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;
      const lightness = (max + min) / 2;
      const saturation = chroma === 0 ? 0 : Math.min(1, chroma / (1 - Math.abs(2 * lightness - 1)));
      const sector =
        chroma === 0
          ? 0
          : max === r
            ? ((g - b) / chroma + 6) % 6
            : max === g
              ? (b - r) / chroma + 2
              : (r - g) / chroma + 4;
      const x = 1 - Math.abs((sector % 2) - 1);
      const weights = [
        [1, x, 0],
        [x, 1, 0],
        [0, 1, x],
        [0, x, 1],
        [x, 0, 1],
        [1, 0, x],
      ][Math.min(5, Math.floor(sector))]!;
      return { saturation, weights };
    };
    let refused = 0;
    let derived = 0;
    for (const [page, surface] of [
      ['#ffffff', '#000000'],
      ['#000000', '#ffffff'],
    ] as const) {
      for (let trial = 0; trial < 500; trial++) {
        const accent = toHex([random(), random(), random()]);
        const fill = deriveBrandRoles({ accent }, page).accentFill!;
        const backgrounds = [page, fill, surface];
        const where = `${accent} on ${page} beside ${surface}`;
        let ink: string | undefined;
        try {
          ink = deriveBrandRoles({ accent }, page, [surface]).accentInk;
        } catch {
          ink = undefined;
        }
        if (ink) {
          derived++;
          for (const background of backgrounds) {
            expect(contrast(ink, background), where).toBeGreaterThanOrEqual(4.5);
          }
          continue;
        }
        refused++;
        const under = backgrounds.map((background) => luminance(bytes(hex(background).components)));
        const { saturation, weights } = lineOf(accent);
        const [wr, wg, wb] = weights as [number, number, number];
        const byte = (channel: number) => Math.round(Math.min(1, Math.max(0, channel)) * 255);
        for (let step = 0; step <= 8192; step++) {
          // Scalar arithmetic, with nothing allocated, since it runs millions of times.
          const value = step / 8192;
          const c = (1 - Math.abs(2 * value - 1)) * saturation;
          const m = value - c / 2;
          const r = byte(c * wr + m);
          const g = byte(c * wg + m);
          const b = byte(c * wb + m);
          const own = 0.2126 * linear[r]! + 0.7152 * linear[g]! + 0.0722 * linear[b]!;
          if (!under.every((background) => ratio(own, background) >= 4.5)) continue;
          const candidate = toHex([r / 255, g / 255, b / 255]);
          const reads = backgrounds.every((background) => contrast(candidate, background) >= 4.5);
          expect(
            reads ? candidate : undefined,
            `${where}: refused, yet this reads`,
          ).toBeUndefined();
        }
      }
    }
    // The sweep reaches both answers.
    expect(derived).toBeGreaterThan(0);
    expect(refused).toBeGreaterThan(0);
    // A sweep of a thousand derivations, each refusal sampled finely: a
    // second here and several on a shared CI runner, past the default bound.
  }, 30_000);

  it('keeps every ink it found before, where the extreme reads on every surface', () => {
    // The path every style's surfaces take: the extreme reads on each, so the
    // ink is the first shade toward it that does, as it always was. Amber
    // moves a little further to read on the host's grey panel than on the
    // page alone.
    expect(deriveBrandRoles({ accent: '#f59e0b' }, '#ffffff').accentInk).toBe('#9c6406');
    expect(deriveBrandRoles({ accent: '#f59e0b' }, '#ffffff', ['#eef1f5']).accentInk).toBe(
      '#996206',
    );
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

  it("never calls an unset button colour faint, since the button is then the host's own", () => {
    expect(isActionFaint({}, '#ffffff')).toBe(false);
    expect(isActionFaint(null, '#ffffff')).toBe(false);
    expect(isActionFaint({ accent: '#fefefe', header: '#fefefe' }, '#ffffff')).toBe(false);
  });

  it('says the accent was adjusted exactly when its ink differs from it', () => {
    for (const page of PAGES) {
      SEEDS.forEach((seed, index) => {
        for (const seeds of seedSets(seed, index)) {
          if (seeds.accent == null && seeds.action == null) continue;
          const roles = accentOf(deriveBrandRoles(seeds, page));
          expect(isAccentAdjusted(seeds, page)).toBe(roles.accentInk !== roles.accent);
        }
      });
    }
    expect(isAccentAdjusted({ accent: '#fef9c3' }, '#ffffff')).toBe(true);
    expect(isAccentAdjusted({ accent: '#14213d' }, '#ffffff')).toBe(false);
    expect(isAccentAdjusted({ accent: '#14213d' }, '#0d0d0d')).toBe(true);
  });

  it('judges an unset accent through the button colour it follows, and nothing with neither', () => {
    expect(isAccentAdjusted({ action: '#fef9c3' }, '#ffffff')).toBe(true);
    expect(isAccentAdjusted({ header: '#14213d' }, '#ffffff')).toBe(false);
    expect(isAccentAdjusted({}, '#ffffff')).toBe(false);
    expect(deriveBrandRoles({}, '#ffffff').accentInk).toBeUndefined();
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

  it('leaves a colour set in neither unset, so its roles stay absent', () => {
    expect(resolveDarkSeeds(null, undefined)).toEqual({ action: null, accent: null, header: null });
    expect(Object.keys(deriveBrandRoles(resolveDarkSeeds(null, null), '#0d0d0d'))).toEqual([]);
    const dark = deriveBrandRoles(resolveDarkSeeds({ header: '#14213d' }, null), '#0d0d0d');
    expect(dark.action).toBeUndefined();
    expect(dark.header).toBe('#14213d');
  });
});
