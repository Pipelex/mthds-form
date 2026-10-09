import { describe, expect, it } from 'vitest';
import {
  type BrandTokens,
  colorHex,
  composite,
  contrastRatio,
  resolveColor,
  validateBrandTokens,
} from '../tokens';
import { corpusSource } from './corpus';

/**
 * The validator's cases. Each is a way a token file can be wrong that a
 * standard DTCG tool lets through - Terrazzo 2.7.1 turned an unparseable string
 * colour into black, crashed on a hex with no components and on a colour
 * outside sRGB, and checked contrast in the light mode only - and the reason
 * the contract is held here rather than left to one.
 */

const base = (): BrandTokens =>
  structuredClone(corpusSource('pipelex', 'pipelex-method--claude-4.8-opus').tokens) as BrandTokens;

const problemsOf = (tokens: unknown) => {
  const result = validateBrandTokens(tokens);
  return result.ok ? [] : result.problems;
};

describe('the token validator', () => {
  it('accepts a committed brand', () => {
    expect(problemsOf(base())).toEqual([]);
  });

  it('refuses a string colour, naming its path', () => {
    const tokens = base();
    (tokens.color.background as { $value: unknown }).$value = 'not a colour';
    expect(
      problemsOf(tokens).some((problem) => problem.startsWith('color.background.$value')),
    ).toBe(true);
  });

  it('refuses a colour outside sRGB', () => {
    const tokens = base();
    (tokens.color.primary as { $value: unknown }).$value = {
      colorSpace: 'display-p3',
      components: [0, 0.73, 0.58],
      alpha: 1,
    };
    expect(problemsOf(tokens).join('\n')).toMatch(/color\.primary\.\$value/);
  });

  it('refuses a token the contract does not name', () => {
    const tokens = base();
    (tokens.color as Record<string, unknown>).tertiary = tokens.color.primary;
    expect(problemsOf(tokens).join('\n')).toMatch(/tertiary/);
  });

  it('refuses a missing token', () => {
    const tokens = base();
    delete (tokens.color as Record<string, unknown>).ring;
    expect(problemsOf(tokens).join('\n')).toMatch(/color\.ring/);
  });

  it('refuses a token with no description', () => {
    const tokens = base();
    tokens.radius.base.$description = '';
    expect(problemsOf(tokens).join('\n')).toMatch(/radius\.base\.\$description/);
  });

  it('refuses a mode other than dark', () => {
    const tokens = base();
    (tokens.color.primary.$extensions!.mode as Record<string, unknown>).light =
      tokens.color.primary.$value;
    expect(problemsOf(tokens).join('\n')).toMatch(/mode/);
  });

  it('accepts an alias with no dark value, which stands for both modes', () => {
    const tokens = base();
    tokens.color['card-foreground'] = {
      $value: '{color.foreground}',
      $description: 'Text on a card: the page ink, in both modes.',
    };
    const result = validateBrandTokens(tokens);
    expect(result.ok ? [] : result.problems).toEqual([]);
    if (!result.ok) throw new Error('unreachable');
    expect(resolveColor(result.tokens, 'card-foreground', 'dark')).toEqual(
      resolveColor(result.tokens, 'foreground', 'dark'),
    );
  });

  it('refuses a colour with no dark value: only an alias stands for both modes', () => {
    const tokens = base();
    delete (tokens.color.primary as { $extensions?: unknown }).$extensions;
    expect(problemsOf(tokens).join('\n')).toMatch(/color\.primary\.\$extensions/);
  });

  it('refuses an alias cycle', () => {
    const tokens = base();
    tokens.color.card.$value = '{color.popover}';
    tokens.color.popover.$value = '{color.card}';
    expect(problemsOf(tokens).join('\n')).toMatch(/alias cycle/);
  });

  it('refuses an alias to a token the contract has no colour for', () => {
    const tokens = base();
    tokens.color.ring.$value = '{color.tertiary}';
    expect(problemsOf(tokens).join('\n')).toMatch(/tertiary/);
  });

  it('refuses a hex that disagrees with its components', () => {
    const tokens = base();
    tokens.color.primary.$value = {
      colorSpace: 'srgb',
      components: [0, 0.7333, 0.5843],
      alpha: 1,
      hex: '#ff0000',
    };
    expect(problemsOf(tokens).join('\n')).toMatch(/hex #ff0000 does not agree/);
  });

  it('refuses a hex one step from what its components compile to', () => {
    // 0.499 compiles to 7f; a hex of 7e was once let through as rounding, and
    // the brand then shipped a colour other than the one its file named.
    const tokens = base();
    tokens.color.primary.$value = {
      colorSpace: 'srgb',
      components: [0.499, 0.499, 0.499],
      alpha: 1,
      hex: '#7e7e7e',
    };
    expect(problemsOf(tokens).join('\n')).toMatch(/hex #7e7e7e does not agree/);
  });

  it('measures contrast on the colours as compiled, so rounding cannot carry a pair below AA', () => {
    // 0.465 on white is 4.505:1 at full precision, but it compiles to #777777,
    // which renders at 4.478:1.
    const grey = { colorSpace: 'srgb' as const, alpha: 1 };
    const tokens = base();
    tokens.color.background.$value = { ...grey, components: [1, 1, 1] };
    tokens.color['muted-foreground'].$value = { ...grey, components: [0.465, 0.465, 0.465] };
    expect(problemsOf(tokens).join('\n')).toMatch(
      /color\.muted-foreground on color\.background \(light\): contrast 4\.48/,
    );
  });

  it('measures a translucent ink at the alpha it compiles to', () => {
    // Alpha 0.54105 clears 4.5:1, but rgb() is given 0.541, which does not.
    const tokens = base();
    tokens.color.background.$value = { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 };
    tokens.color['muted-foreground'].$value = {
      colorSpace: 'srgb',
      components: [3 / 255, 3 / 255, 3 / 255],
      alpha: 0.54105,
    };
    expect(problemsOf(tokens).join('\n')).toMatch(
      /color\.muted-foreground on color\.background \(light\): contrast/,
    );
  });

  it('refuses a pair below AA in the dark mode as well as in the light one', () => {
    const tokens = base();
    tokens.color['muted-foreground'].$extensions!.mode.dark = {
      colorSpace: 'srgb',
      components: [0.2, 0.2, 0.2],
      alpha: 1,
    };
    expect(problemsOf(tokens).join('\n')).toMatch(
      /color\.muted-foreground on color\.background \(dark\): contrast/,
    );
  });

  it('measures a translucent ink at the strength it renders with, so a transparent one fails', () => {
    const tokens = base();
    tokens.color.foreground.$value = {
      colorSpace: 'srgb',
      components: [0.04, 0.04, 0.04],
      alpha: 0,
    };
    tokens.color['muted-foreground'].$value = {
      colorSpace: 'srgb',
      components: [0.04, 0.04, 0.04],
      alpha: 0.3,
    };
    const problems = problemsOf(tokens).join('\n');
    expect(problems).toMatch(/color\.foreground on color\.background \(light\): contrast 1\.00/);
    expect(problems).toMatch(/color\.muted-foreground on color\.background \(light\): contrast/);
  });

  it('refuses a translucent canvas, which nobody can promise a contrast on', () => {
    const tokens = base();
    tokens.color.background.$value = { colorSpace: 'srgb', components: [1, 1, 1], alpha: 0.9 };
    expect(problemsOf(tokens).join('\n')).toMatch(
      /color\.background \(light\): alpha 0\.9, but text is measured against it, so it must be opaque/,
    );
  });

  it('refuses a family name holding a control character, which would end its string', () => {
    const tokens = base();
    tokens.font.sans.$value = ['Inter\f} body { background: red } .z {'];
    expect(problemsOf(tokens).join('\n')).toMatch(
      /font\.sans\.\$value\.0: a family name holds no control characters/,
    );
  });

  it('reports every problem at once', () => {
    const tokens = base();
    tokens.color.ring.$value = '{color.tertiary}';
    tokens.color.card.$value = '{color.popover}';
    tokens.color.popover.$value = '{color.card}';
    expect(problemsOf(tokens).length).toBeGreaterThanOrEqual(2);
  });
});

describe('the colour arithmetic', () => {
  const black = {
    colorSpace: 'srgb' as const,
    components: [0, 0, 0] as [number, number, number],
    alpha: 1,
  };
  const white = {
    colorSpace: 'srgb' as const,
    components: [1, 1, 1] as [number, number, number],
    alpha: 1,
  };

  it('measures WCAG contrast', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBe(1);
  });

  it('blends a translucent colour over an opaque one by its alpha', () => {
    expect(composite({ ...black, alpha: 0.25 }, white).components).toEqual([0.75, 0.75, 0.75]);
    expect(composite({ ...black, alpha: 0 }, white).components).toEqual([1, 1, 1]);
  });

  it('writes a hex without the alpha', () => {
    expect(colorHex({ ...white, alpha: 0.5 })).toBe('#ffffff');
  });
});
