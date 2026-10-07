import { describe, expect, it } from 'vitest';
import { assembleBrand, type BrandSource } from '../assemble';
import { brandProducerId, brandScope } from '../provenance';
import { withStatedFacts } from '../stated';
import { colorHex, resolveColor } from '../tokens';
import { corpusSource, corpusSources } from './corpus';

const problemsOf = (source: BrandSource) => {
  const result = assembleBrand(source);
  return result.ok ? [] : result.problems;
};

describe('assembling a brand', () => {
  it('assembles every committed brand', () => {
    const sources = corpusSources();
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(problemsOf(source), `${source.brand}/${source.producerId}`).toEqual([]);
    }
  });

  it('scopes the stylesheet to a class a selector can carry, model dots included', () => {
    const result = assembleBrand(corpusSource('pipelex', 'pipelex-method--claude-4.8-opus'));
    if (!result.ok) throw new Error(result.problems.join('; '));
    expect(result.brand.scope).toBe('brand-pipelex-pipelex-method--claude-4-8-opus');
    expect(result.brand.css).toContain(`.${result.brand.scope} {`);
  });

  it('refuses a provenance that names another producer than the one the brand is filed as', () => {
    const source = corpusSource('pipelex', 'pipelex-method--claude-4.8-opus');
    expect(problemsOf({ ...source, producerId: 'pipelex-method--claude-5.5-sonnet' })).toEqual([
      'provenance.json: names producer pipelex-method--claude-4.8-opus, but the brand is filed as pipelex-method--claude-5.5-sonnet',
    ]);
  });

  it('refuses a logo that is not http(s)', () => {
    const source = corpusSource('pipelex', 'pipelex-method--claude-4.8-opus');
    const manifest = structuredClone(source.manifest) as { logo: { onDark: string } };
    manifest.logo.onDark = 'javascript:alert(1)';
    expect(problemsOf({ ...source, manifest })).toEqual([
      expect.stringMatching(/^brand\.json: logo\.onDark: /),
    ]);
  });

  it('names the file of every problem, and reports the files together', () => {
    const source = corpusSource('pipelex', 'pipelex-method--claude-4.8-opus');
    const problems = problemsOf({ ...source, manifest: {}, tokens: {}, provenance: {} });
    expect(problems.some((problem) => problem.startsWith('brand.json: '))).toBe(true);
    expect(problems.some((problem) => problem.startsWith('provenance.json: '))).toBe(true);
    expect(problems.some((problem) => problem.startsWith('tokens.json: '))).toBe(true);
  });

  it('still assembles a brand produced against an older brief: freshness is not validity', () => {
    // The provenance records the brief a brand was written against; a newer
    // brief makes the brand old, never invalid. See docs/brand.md.
    const source = corpusSource('pipelex', 'pipelex-method--claude-4.8-opus');
    const provenance = { ...(source.provenance as object), contractHash: '000000000000' };
    expect(problemsOf({ ...source, provenance })).toEqual([]);
  });
});

describe('the stated facts', () => {
  // The brand whose accent was stated beside the URL: a site that shows no
  // button, so its accent is what its owner said, per mode.
  const source = corpusSource('mthds', 'pipelex-method--claude-4.8-opus');
  const assembled = assembleBrand(source);
  if (!assembled.ok) throw new Error(assembled.problems.join('; '));
  const brand = assembled.brand;
  const primaryHex = (mode: 'light' | 'dark') =>
    colorHex(resolveColor(brand.tokens, 'primary', mode)!);

  const problemsWith = (stated: unknown) =>
    problemsOf({ ...source, provenance: { ...(source.provenance as object), stated } });

  it('states the accent per mode, and the committed brand carries another in the dark', () => {
    // A near-black accent on a white canvas vanishes on a dark one: the stated
    // accent names each mode, and the brand's primary follows each.
    expect(brand.stated?.accent).toEqual({ light: primaryHex('light'), dark: primaryHex('dark') });
    expect(brand.stated?.accent?.light).not.toBe(brand.stated?.accent?.dark);
  });

  it('refuses a primary that is not the accent stated for its mode, naming the mode', () => {
    expect(problemsWith({ accent: { light: primaryHex('light'), dark: '#123456' } })).toEqual([
      `tokens.json: color.primary (dark) resolves to ${primaryHex('dark')}, but the accent for dark mode was stated as #123456`,
    ]);
  });

  it('checks only the modes that were stated', () => {
    expect(problemsWith({ accent: { dark: primaryHex('dark') } })).toEqual([]);
    const problems = problemsWith({ accent: { light: '#123456' } });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('color.primary (light)');
  });

  it('refuses a translucent primary, though its components are the stated accent', () => {
    // A hex carries no alpha: compared by its components alone, a primary
    // nobody can see once honoured the accent and compiled to `/ 0`.
    const tokens = structuredClone(source.tokens) as {
      color: { primary: { $value: { alpha: number } } };
    };
    tokens.color.primary.$value.alpha = 0;
    expect(
      problemsOf({
        ...source,
        tokens,
        provenance: { ...(source.provenance as object), stated: { accent: { light: '#1a1a1a' } } },
      }),
    ).toEqual([
      'tokens.json: color.primary (light) has alpha 0, but the accent for light mode was stated as the opaque #1a1a1a, so it must be opaque (alpha 1)',
    ]);
  });

  it('refuses an accent stated for no mode in particular', () => {
    const problems = problemsWith({ accent: '#123456' });
    expect(problems.some((problem) => problem.startsWith('provenance.json: stated.accent'))).toBe(
      true,
    );
  });

  it('refuses a manifest that does not carry the logo stated for its canvas', () => {
    expect(problemsWith({ logo: { onLight: 'https://mthds.ai/elsewhere.png' } })).toEqual([
      `brand.json: logo.onLight is ${brand.manifest.logo.onLight}, but the logo for that canvas was stated as https://mthds.ai/elsewhere.png`,
    ]);
  });

  it('refuses a stated logo that is not http(s), which no manifest could carry', () => {
    const problems = problemsWith({ logo: { onLight: 'data:image/png;base64,AAAA' } });
    expect(
      problems.some((problem) => problem.startsWith('provenance.json: stated.logo.onLight')),
    ).toBe(true);
  });

  it('places what was stated ahead of every reading in the facts a producer reads', () => {
    const facts = {
      url: 'https://acme.example/',
      finalUrl: 'https://acme.example/',
      fetchedAt: '2026-10-06',
      site: { name: 'Acme' },
      colors: { customProperties: [] },
    };
    const stated = { accent: { light: '#112233' } };
    expect(Object.keys(withStatedFacts(facts, stated))).toEqual([
      'url',
      'finalUrl',
      'fetchedAt',
      'site',
      'stated',
      'colors',
    ]);
    expect(withStatedFacts(facts, null)).toBe(facts);
  });
});

describe('naming a brand', () => {
  it('names a producer directory the way a layout fixture is named', () => {
    expect(brandProducerId({ producer: 'pipelex-method', model: 'claude-5.5-sonnet' })).toBe(
      'pipelex-method--claude-5.5-sonnet',
    );
    expect(
      brandProducerId({ producer: 'claude-code-session', model: 'claude-fable-5-1', seed: 'x' }),
    ).toBe('claude-code-session--claude-fable-5-1--seeded');
  });

  it('turns every character a class selector cannot carry into a hyphen', () => {
    expect(brandScope('Acme.io', 'pipelex-method--claude-5.5-sonnet')).toBe(
      'brand-acme-io-pipelex-method--claude-5-5-sonnet',
    );
  });
});
