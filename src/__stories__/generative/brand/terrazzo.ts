import { build, defineConfig, type LogEntry, Logger, parse } from '@terrazzo/parser';
import cssPlugin from '@terrazzo/plugin-css';
import { contractVariable } from './contract';
import type { BrandTokens } from './tokens-schema';

/**
 * The token pipeline: a validated `tokens.json` in, the brand's stylesheet
 * out, through Terrazzo - the DTCG parser, its lint, and its CSS plugin.
 *
 * What comes out is exactly the theme contract, scoped: a `.brand-<scope>`
 * block setting every custom property `theme.css` sets, and a
 * `.dark .brand-<scope>` block setting the ones that have a dark value. The
 * `.dark` ancestor is the package's own dark-mode convention, so a brand page
 * inside the Storybook's dark pane picks its dark values up with nothing else
 * to wire.
 *
 * Nothing runs in a browser here: this module is imported by the build
 * script, the node test and the producer's repair loop, and by no story.
 *
 * Terrazzo's own logger prints and throws on the first error. This one
 * collects every entry instead, and `continueOnError` lets the parser reach
 * the end of the file, so a repair round is handed the whole list at once.
 */
class CapturingLogger extends Logger {
  readonly errors: string[] = [];
  readonly warnings: string[] = [];

  constructor() {
    super({ level: 'silent' });
  }

  override error(...entries: LogEntry[]) {
    for (const entry of entries) this.errors.push(format(entry));
    this.errorCount += entries.length;
  }

  override warn(...entries: LogEntry[]) {
    for (const entry of entries) this.warnings.push(format(entry));
    this.warnCount += entries.length;
  }

  override info() {}

  override debug() {}
}

function format(entry: LogEntry): string {
  return entry.label ? `${entry.label}: ${entry.message}` : entry.message;
}

export type CompileResult =
  | { ok: true; css: string; warnings: string[] }
  | { ok: false; problems: string[]; warnings: string[] };

/**
 * The stylesheet for one brand, or every problem Terrazzo found with its
 * tokens. `scope` is the class the page root carries (`brandScope`).
 */
export async function compileBrandTokens(
  tokens: BrandTokens,
  scope: string,
): Promise<CompileResult> {
  const logger = new CapturingLogger();
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
      lint: {
        rules: {
          'core/required-modes': ['error', { matches: [{ match: ['color.*'], modes: ['dark'] }] }],
          'core/descriptions': ['error', {}],
          // A colour outside sRGB crashes the CSS plugin's downsampler on a
          // colour-space id; as a lint it is a message a producer can act on.
          'core/max-gamut': ['error', { gamut: 'srgb' }],
          // Warns, never fails: this rule counts an alias of a colour as a
          // duplicate, and a shadcn palette legitimately repeats values (every
          // foreground on a coloured surface is white). Recorded, not refused.
          'core/duplicate-values': ['warn', {}],
        },
      },
    },
    { cwd: new URL(import.meta.url) },
  );
  try {
    const parsed = await parse(
      [{ filename: new URL('file:///tokens.json'), src: JSON.stringify(tokens) }],
      {
        config,
        logger,
        continueOnError: true,
      },
    );
    if (logger.errors.length > 0) {
      return { ok: false, problems: logger.errors, warnings: logger.warnings };
    }
    const result = await build(parsed.tokens, {
      sources: parsed.sources,
      resolver: parsed.resolver,
      config,
      logger,
    });
    if (logger.errors.length > 0) {
      return { ok: false, problems: logger.errors, warnings: logger.warnings };
    }
    const file = result.outputFiles.find((output) => output.filename === 'brand.css');
    if (!file) {
      return {
        ok: false,
        problems: ['Terrazzo produced no stylesheet.'],
        warnings: logger.warnings,
      };
    }
    return { ok: true, css: String(file.contents), warnings: logger.warnings };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      problems: [...logger.errors, `Terrazzo threw: ${message}`],
      warnings: logger.warnings,
    };
  }
}
