import { build, defineConfig, type LogEntry, Logger, parse } from '@terrazzo/parser';
import cssPlugin from '@terrazzo/plugin-css';
import { describe, expect, it } from 'vitest';
import { assembleBrand } from '../assemble';
import { COLOR_TOKEN_NAMES, contractVariable } from '../contract';
import type { BrandTokens } from '../tokens';
import { corpusSources } from './corpus';

/**
 * The cross-check: every committed brand compiled by Terrazzo, the standard
 * DTCG tool, and its declarations compared with the kernel's own.
 *
 * The kernel compiles a brand itself, because the contract is closed and the
 * study found Terrazzo routing around faults the validator now refuses
 * (docs/brand.md). What this keeps is the guarantee the study had: the token
 * file stays standard DTCG, and the stylesheet the kernel writes is the one a
 * standard tool writes for it. It is Terrazzo's only use, a devDependency
 * reached by this file and by nothing that ships.
 *
 * The comparison is by declaration, never by bytes: the two write different
 * formats (Terrazzo `rgb(0% 73.33% 58.43%)`, the kernel `#00bb95`), so each
 * selector's properties are compared, colours as channels within the rounding
 * a hex carries.
 */

class SilentLogger extends Logger {
  readonly errors: string[] = [];

  constructor() {
    super({ level: 'silent' });
  }

  override error(...entries: LogEntry[]) {
    for (const entry of entries) this.errors.push(entry.message);
    this.errorCount += entries.length;
  }

  override warn() {}

  override info() {}

  override debug() {}
}

/** What Terrazzo writes for one brand, scoped as the kernel scopes it. */
async function terrazzoCss(tokens: BrandTokens, scope: string): Promise<string> {
  // Terrazzo wants a dark value on every colour, so an alias that stands for
  // both modes is handed over with its dark mode stated as itself.
  const color = { ...tokens.color };
  for (const name of COLOR_TOKEN_NAMES) {
    const token = tokens.color[name];
    if (!token.$extensions) {
      color[name] = { ...token, $extensions: { mode: { dark: token.$value } } };
    }
  }
  const logger = new SilentLogger();
  const config = defineConfig(
    {
      tokens: ['./tokens.json'],
      outDir: './out/',
      plugins: [
        cssPlugin({
          filename: 'brand.css',
          baseSelector: `.${scope}`,
          modeSelectors: [{ mode: 'dark', selectors: [`.dark .${scope}`] }],
          variableName: (token) => contractVariable(token.id),
        }),
      ],
    },
    { cwd: new URL(import.meta.url) },
  );
  const parsed = await parse(
    [{ filename: new URL('file:///tokens.json'), src: JSON.stringify({ ...tokens, color }) }],
    { config, logger },
  );
  const result = await build(parsed.tokens, {
    sources: parsed.sources,
    resolver: parsed.resolver,
    config,
    logger,
  });
  expect(logger.errors).toEqual([]);
  const file = result.outputFiles.find((output) => output.filename === 'brand.css');
  if (!file) throw new Error('Terrazzo wrote no stylesheet.');
  return String(file.contents);
}

/** Each selector's declarations, comments dropped. */
function declarations(css: string): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>();
  for (const match of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const props = new Map<string, string>();
    for (const part of match[2]!.split(';')) {
      const colon = part.indexOf(':');
      if (colon !== -1) props.set(part.slice(0, colon).trim(), part.slice(colon + 1).trim());
    }
    out.set(match[1]!.trim().replace(/\s+/g, ' '), props);
  }
  return out;
}

/** A colour as `[r, g, b, a]` in 0..1, or null for a value that is not one. */
function channels(value: string): number[] | null {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  if (hex) return [...hex.slice(1, 4).map((pair) => parseInt(pair, 16) / 255), 1];
  const rgb = /^rgb\(\s*([\d.]+)(%?)\s+([\d.]+)%?\s+([\d.]+)%?(?:\s*\/\s*([\d.]+))?\s*\)$/.exec(
    value,
  );
  if (!rgb) return null;
  const scale = rgb[2] === '%' ? 100 : 255;
  return [
    Number(rgb[1]) / scale,
    Number(rgb[3]) / scale,
    Number(rgb[4]) / scale,
    Number(rgb[5] ?? 1),
  ];
}

/** Whether two declared values say the same thing. */
function sameValue(kernel: string, terrazzo: string): boolean {
  const a = channels(kernel);
  const b = channels(terrazzo);
  if (a && b) return a.every((channel, index) => Math.abs(channel - b[index]!) <= 0.5 / 255 + 1e-4);
  const plain = (value: string) => value.replace(/["']/g, '').replace(/\s+/g, ' ');
  return plain(kernel) === plain(terrazzo);
}

describe('the kernel compiler against Terrazzo', () => {
  it.each(corpusSources().map((source) => [`${source.brand}/${source.producerId}`, source]))(
    '%s compiles to the declarations Terrazzo writes',
    async (_label, source) => {
      const result = assembleBrand(source);
      if (!result.ok) throw new Error(result.problems.join('; '));
      const kernel = declarations(result.brand.css);
      const terrazzo = declarations(await terrazzoCss(result.brand.tokens, result.brand.scope));
      expect([...kernel.keys()].sort()).toEqual([...terrazzo.keys()].sort());
      for (const [selector, props] of terrazzo) {
        const ours = kernel.get(selector)!;
        // The kernel adds one declaration Terrazzo has no token for: the family
        // that makes the scoped typeface reach the text.
        expect([...ours.keys()].filter((name) => name !== 'font-family').sort()).toEqual(
          [...props.keys()].sort(),
        );
        for (const [name, value] of props) {
          expect(
            sameValue(ours.get(name)!, value),
            `${selector} ${name}: ${ours.get(name)} vs ${value}`,
          ).toBe(true);
        }
      }
    },
  );
});
