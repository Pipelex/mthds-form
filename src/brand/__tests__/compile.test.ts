import { describe, expect, it } from 'vitest';
import { assembleBrand } from '../assemble';
import { compileBrand } from '../compile';
import { BRAND_CONTRACT } from '../contract';
import type { BrandTokens } from '../tokens';
import { corpusSource, corpusSources } from './corpus';

/** The custom properties a block of compiled CSS declares, sorted. */
function declaredIn(css: string, selector: string): Map<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`).exec(
    css.replace(/\/\*[\s\S]*?\*\//g, ''),
  );
  if (!block) throw new Error(`No ${selector} block.`);
  return new Map(
    [...block[1]!.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1]!, match[2]!]),
  );
}

const tokensOf = () =>
  structuredClone(corpusSource('pipelex', 'pipelex-method--claude-4.8-opus').tokens) as BrandTokens;

const SCOPE = 'brand-acme';

describe('compiling a brand', () => {
  it('sets every property of the contract on the scope, and every colour again under .dark', () => {
    for (const source of corpusSources()) {
      const result = assembleBrand(source);
      if (!result.ok) throw new Error(result.problems.join('; '));
      const { css, scope } = result.brand;
      const light = declaredIn(css, `.${scope}`);
      const dark = declaredIn(css, `.dark .${scope}`);
      expect([...light.keys()].filter((name) => name.startsWith('--')).sort()).toEqual(
        BRAND_CONTRACT.map((token) => token.variable).sort(),
      );
      expect([...dark.keys()].sort()).toEqual(
        BRAND_CONTRACT.filter((token) => token.type === 'color')
          .map((token) => token.variable)
          .sort(),
      );
      // Scoped means no rule at the root; a description may well mention `:root`.
      expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/:root/);
    }
  });

  it("declares the brand's typeface where its scope is, so it reaches the text", () => {
    const light = declaredIn(compileBrand(tokensOf(), SCOPE), `.${SCOPE}`);
    expect(light.get('font-family')).toBe('var(--font-sans)');
  });

  it('writes an opaque colour as its hex, a translucent one with its alpha, an alias as a reference', () => {
    const tokens = tokensOf();
    tokens.color.primary.$value = {
      colorSpace: 'srgb',
      components: [0, 0.7333, 0.5843],
      alpha: 1,
    };
    tokens.color.card.$value = { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.05 };
    tokens.color['card-foreground'] = { $value: '{color.foreground}', $description: 'Ink.' };
    const light = declaredIn(compileBrand(tokens, SCOPE), `.${SCOPE}`);
    expect(light.get('--primary')).toBe('#00bb95');
    expect(light.get('--card')).toBe('rgb(0 0 0 / 0.05)');
    expect(light.get('--card-foreground')).toBe('var(--foreground)');
  });

  it('restates an alias that stands for both modes in the dark block', () => {
    const tokens = tokensOf();
    tokens.color['card-foreground'] = { $value: '{color.foreground}', $description: 'Ink.' };
    const dark = declaredIn(compileBrand(tokens, SCOPE), `.dark .${SCOPE}`);
    expect(dark.get('--card-foreground')).toBe('var(--foreground)');
  });

  it("quotes a family's name and leaves CSS's own keywords bare", () => {
    const tokens = tokensOf();
    tokens.font.sans.$value = ['Inter', "O'Hara Sans", 'system-ui', 'sans-serif'];
    tokens.font.mono.$value = ['SFMono-Regular', 'ui-monospace', 'monospace'];
    const light = declaredIn(compileBrand(tokens, SCOPE), `.${SCOPE}`);
    expect(light.get('--font-sans')).toBe("'Inter', 'O\\'Hara Sans', system-ui, sans-serif");
    expect(light.get('--font-mono')).toBe("'SFMono-Regular', ui-monospace, monospace");
  });

  it('writes the radius as a length', () => {
    const tokens = tokensOf();
    tokens.radius.base.$value = { value: 0.75, unit: 'rem' };
    expect(declaredIn(compileBrand(tokens, SCOPE), `.${SCOPE}`).get('--radius')).toBe('0.75rem');
  });

  it('keeps a description inside its comment, whatever it says', () => {
    const tokens = tokensOf();
    tokens.color.primary.$description = 'Teal */ .x { color: red } /* and more';
    const css = compileBrand(tokens, SCOPE);
    expect(css).not.toContain('*/ .x');
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toContain('color: red');
  });

  it("writes a family name so that nothing in it can end its string or the page's style element", () => {
    const tokens = tokensOf();
    tokens.font.sans.$value = ['Evil\f} body { background: red } .z {', 'A</style><img>'];
    const css = compileBrand(tokens, SCOPE);
    expect(css).toContain(
      "  --font-sans: 'Evil\\c } body { background: red } .z {', 'A\\3c /style\\3e \\3c img\\3e ';\n",
    );
    expect(css).not.toContain('</style');
  });

  it("keeps a description from closing the page's style element", () => {
    const tokens = tokensOf();
    tokens.color.primary.$description = 'Teal </style><script>alert(1)</script>';
    expect(compileBrand(tokens, SCOPE)).not.toContain('</');
  });

  it('refuses a scope that is not a class name', () => {
    expect(() => compileBrand(tokensOf(), 'brand x { }')).toThrow(/not a scope class/);
  });
});
