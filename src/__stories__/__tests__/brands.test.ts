import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';
import { BRANDS } from '../_generated/brands/brands';
import {
  type BrandFixture,
  brandCssFilename,
  brandStylesheet,
} from '../generative/brand/brand-fixture';
import { BRAND_CONTRACT, renderBrandContract } from '../generative/brand/contract';
import { assembleBrand } from '../generative/brand/pipeline';
import { validateBrandTokens } from '../generative/brand/tokens-schema';
import { promptHashOf } from '../generative/prompt-hash';

/**
 * The brands guard - the corpus guard's arrangement, for `data/brands/`.
 *
 * A brand is data a producer wrote and a build compiled, both committed. What
 * can go wrong is what always can with that arrangement: data edited without
 * a rebuild, a build left behind by data that was removed, a contract changed
 * under a brand written against the old one. So this rebuilds every brand
 * from its data through the same pipeline `make brands` runs and asserts the
 * committed stylesheet is what came out, that the tree and the fixture module
 * name the same set, and that the contract, its rendered brief and
 * `theme.css` still agree with each other.
 *
 * The validator's own cases are here too: each is a way a token file can be
 * wrong that Terrazzo would let through, and the reason our validation runs
 * first.
 */

const REPO = path.resolve(__dirname, '../../..');
const BRANDS_DIR = path.join(REPO, 'data/brands');
const GENERATED_DIR = path.join(REPO, 'src/__stories__/_generated/brands');
const BRIEF_PATH = path.join(REPO, 'wip/generative-ui/briefs/brand-contract.md');

interface BrandDir {
  brand: string;
  producerId: string;
  dir: string;
}

function brandDirs(): BrandDir[] {
  const dirs: BrandDir[] = [];
  for (const brand of readdirSync(BRANDS_DIR, { withFileTypes: true })) {
    if (!brand.isDirectory()) continue;
    const brandDir = path.join(BRANDS_DIR, brand.name);
    for (const producer of readdirSync(brandDir, { withFileTypes: true })) {
      if (!producer.isDirectory()) continue;
      dirs.push({
        brand: brand.name,
        producerId: producer.name,
        dir: path.join(brandDir, producer.name),
      });
    }
  }
  return dirs.sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
}

function keyOf(entry: { brand: string; producerId: string }) {
  return `${entry.brand}/${entry.producerId}`;
}

function readJson(dir: string, file: string): unknown {
  return JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
}

const contractHash = promptHashOf(renderBrandContract());

/** The custom properties a CSS block declares, `--name`. */
function declaredVariables(css: string, selector: string): string[] {
  const block = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`No ${selector} block.`);
  return [...block[1]!.matchAll(/(--[a-z-]+)\s*:/g)].map((match) => match[1]!).sort();
}

describe('the brand contract', () => {
  it('names the variables theme.css sets, and no others', () => {
    const theme = readFileSync(path.join(REPO, 'src/styles/theme.css'), 'utf8');
    // The typefaces are the contract's and not the default theme's: Tailwind
    // defines `--font-sans` and `--font-mono` itself, and a brand overrides
    // them; every other variable the contract names, `theme.css` sets.
    const themed = BRAND_CONTRACT.filter((token) => token.type !== 'fontFamily');
    expect(declaredVariables(theme, ':root')).toEqual(themed.map((token) => token.variable).sort());
    expect(declaredVariables(theme, '.dark')).toEqual(
      themed
        .filter((token) => token.type === 'color')
        .map((token) => token.variable)
        .sort(),
    );
  });

  it('is what the committed brief renders', () => {
    // `make briefs` writes the brief with the hash in its first line; a
    // contract edited without re-rendering leaves the two apart.
    const brief = readFileSync(BRIEF_PATH, 'utf8');
    expect(brief).toContain(`Contract hash: ${contractHash} `);
    expect(brief).toContain(renderBrandContract().trimEnd());
  });
});

describe('the brands corpus', () => {
  const dirs = brandDirs();

  it('has at least one brand', () => {
    expect(dirs.length).toBeGreaterThan(0);
  });

  it('pairs every brand directory with a built fixture and a stylesheet, and vice versa', () => {
    const expected = dirs.map(keyOf);
    expect(BRANDS.map(keyOf).sort()).toEqual(expected);
    const stylesheets = readdirSync(GENERATED_DIR)
      .filter((file) => file.endsWith('.css') && file !== 'index.css')
      .sort();
    expect(stylesheets).toEqual(
      dirs.map((entry) => brandCssFilename(entry.brand, entry.producerId)).sort(),
    );
    const index = readFileSync(path.join(GENERATED_DIR, 'index.css'), 'utf8');
    for (const file of stylesheets) expect(index).toContain(`@import './${file}';`);
  });

  it('builds every brand from its data to exactly the committed stylesheet', async () => {
    for (const entry of dirs) {
      const result = await assembleBrand({
        brand: entry.brand,
        producerId: entry.producerId,
        manifest: readJson(entry.dir, 'brand.json'),
        tokens: readJson(entry.dir, 'tokens.json'),
        provenance: readJson(entry.dir, 'provenance.json'),
        contractHash,
      });
      expect(result.ok, `${keyOf(entry)}: ${result.ok ? '' : result.problems.join('; ')}`).toBe(
        true,
      );
      if (!result.ok) continue;
      const committed = BRANDS.find((candidate) => keyOf(candidate) === keyOf(entry));
      expect(committed).toEqual(result.fixture);
      const filePath = path.join(GENERATED_DIR, brandCssFilename(entry.brand, entry.producerId));
      const expected = await format(brandStylesheet(result.fixture), {
        ...(await resolveConfig(filePath)),
        parser: 'css',
      });
      expect(readFileSync(filePath, 'utf8')).toBe(expected);
    }
  });

  it('writes a stylesheet that sets every variable of the contract, scoped', () => {
    for (const fixture of BRANDS) {
      expect(declaredVariables(fixture.css, `.${fixture.scope}`)).toEqual(
        BRAND_CONTRACT.map((token) => token.variable).sort(),
      );
      expect(declaredVariables(fixture.css, `.dark .${fixture.scope}`)).toEqual(
        BRAND_CONTRACT.filter((token) => token.type === 'color')
          .map((token) => token.variable)
          .sort(),
      );
      // Scoped means no rule at the root; a description may well mention `:root`.
      expect(fixture.css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/:root/);
    }
  });
});

describe('the token validator', () => {
  const base = (): BrandFixture['tokens'] =>
    structuredClone(BRANDS[0]!.tokens) as BrandFixture['tokens'];

  const problemsOf = (tokens: unknown) => {
    const result = validateBrandTokens(tokens);
    return result.ok ? [] : result.problems;
  };

  it('accepts a built brand', () => {
    expect(problemsOf(base())).toEqual([]);
  });

  it('refuses a string colour, which Terrazzo would parse to black', () => {
    const tokens = base();
    (tokens.color.background as { $value: unknown }).$value = 'not a colour';
    expect(
      problemsOf(tokens).some((problem) => problem.startsWith('color.background.$value')),
    ).toBe(true);
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

  it('refuses a mode other than dark', () => {
    const tokens = base();
    (tokens.color.primary.$extensions.mode as Record<string, unknown>).light =
      tokens.color.primary.$value;
    expect(problemsOf(tokens).join('\n')).toMatch(/mode/);
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

  it('refuses a pair below AA in the dark mode, which Terrazzo checks only in the light one', () => {
    const tokens = base();
    tokens.color['muted-foreground'].$extensions.mode.dark = {
      colorSpace: 'srgb',
      components: [0.2, 0.2, 0.2],
      alpha: 1,
    };
    expect(problemsOf(tokens).join('\n')).toMatch(
      /color\.muted-foreground on color\.background \(dark\): contrast/,
    );
  });
});
