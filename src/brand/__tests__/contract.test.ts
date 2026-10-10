import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BRAND_CONTRACT, COLOR_TOKEN_NAMES, contractVariable } from '../contract';
import { REPO } from './corpus';

/**
 * The contract is the theme seen from the other side, so the two must name the
 * same properties: a token added to the theme is a token a producer must set,
 * and a token dropped from it is one a brand must stop setting. The build
 * holds the same line over `dist/` (`scripts/assert-bundle.mjs`); this holds
 * it over the source, where a failure is cheapest to read.
 */

const THEME = readFileSync(path.join(REPO, 'src/styles/theme.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/** The custom properties a top-level block of `theme.css` declares. */
function declared(selector: string): string[] {
  const block = new RegExp(`(?:^|\\s)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`).exec(THEME);
  if (!block) throw new Error(`theme.css has no ${selector} block.`);
  return [...block[1]!.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]!).sort();
}

const variablesOf = (type: string) =>
  BRAND_CONTRACT.filter((token) => token.type === type).map((token) => token.variable);

describe('the brand contract', () => {
  it('names the colours and the radius theme.css sets in :root, and no others', () => {
    expect([...variablesOf('color'), ...variablesOf('dimension')].sort()).toEqual(
      declared(':root'),
    );
  });

  it('names every colour theme.css restates under .dark', () => {
    expect(variablesOf('color').sort()).toEqual(declared('.dark'));
  });

  it("names Tailwind's two typeface variables, which theme.css leaves to the host", () => {
    // Unlayered, a value in theme.css would override every host's own typeface;
    // the stock typeface is the host's, and only a brand's scope sets these.
    expect(variablesOf('fontFamily')).toEqual(['--font-sans', '--font-mono']);
    expect(THEME).not.toMatch(/--font-/);
  });

  it('keeps the colour list in theme order, one token per name', () => {
    expect(variablesOf('color')).toEqual(COLOR_TOKEN_NAMES.map((name) => `--${name}`));
    expect(new Set(BRAND_CONTRACT.map((token) => token.id)).size).toBe(BRAND_CONTRACT.length);
  });

  it('fails loudly on a token it does not name', () => {
    expect(contractVariable('color.primary')).toBe('--primary');
    expect(() => contractVariable('color.tertiary')).toThrow(/no token color\.tertiary/);
  });
});
