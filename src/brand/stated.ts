import { z } from 'zod';
import { type BrandManifest, httpUrl } from './manifest';
import { type BrandTokens, colorHex, colorIsHex, resolveColor } from './tokens';

/**
 * What a person states beside a site's URL: the things a site does not show and
 * no reading can supply. The accent of a site with no button, per mode when its
 * dark canvas needs another, and the logo for a canvas the site draws none for.
 *
 * A stated fact enters the site facts as `stated` (`withStatedFacts`), a
 * producer is told it outranks every reading, the brand must honour it
 * (`statedFactProblems`), and the provenance records it.
 */

const statedHex = z.string().regex(/^#[0-9a-f]{6}$/i, 'a stated accent is #rrggbb');

export const statedFactsSchema = z.strictObject({
  /** The accent per mode, `#rrggbb`: what `color.primary` resolves to in that mode. */
  accent: z
    .strictObject({
      light: statedHex.optional(),
      dark: statedHex.optional(),
    })
    .optional(),
  /**
   * The logo for a canvas: `logo.onLight` or `logo.onDark` in the manifest,
   * which the brand must carry exactly, so it obeys the manifest's rule (http
   * or https) or no brand could ever honour it.
   */
  logo: z
    .strictObject({
      onLight: httpUrl.optional(),
      onDark: httpUrl.optional(),
    })
    .optional(),
});

export type StatedFacts = z.infer<typeof statedFactsSchema>;

/**
 * Where the brand does not carry what the person stated, in the words a repair
 * round is told. Only the modes and canvases that were stated are checked.
 */
export function statedFactProblems(
  stated: StatedFacts | undefined,
  manifest: BrandManifest,
  tokens: BrandTokens,
): string[] {
  if (!stated) return [];
  const problems: string[] = [];
  for (const mode of ['light', 'dark'] as const) {
    const accent = stated.accent?.[mode];
    if (!accent) continue;
    const primary = resolveColor(tokens, 'primary', mode);
    if (!primary) continue;
    if (!colorIsHex(primary, accent)) {
      problems.push(
        `tokens.json: color.primary (${mode}) resolves to ${colorHex(primary)}, but the accent for ${mode} mode was stated as ${accent}`,
      );
    }
    // A hex carries no alpha, so the components alone would let a primary
    // nobody can see honour the accent: a stated accent is an opaque colour.
    if (primary.alpha < 1) {
      problems.push(
        `tokens.json: color.primary (${mode}) has alpha ${primary.alpha}, but the accent for ${mode} mode was stated as the opaque ${accent}, so it must be opaque (alpha 1)`,
      );
    }
  }
  for (const canvas of ['onLight', 'onDark'] as const) {
    const url = stated.logo?.[canvas];
    if (url && manifest.logo[canvas] !== url) {
      problems.push(
        `brand.json: logo.${canvas} is ${manifest.logo[canvas]}, but the logo for that canvas was stated as ${url}`,
      );
    }
  }
  return problems;
}

/**
 * The facts a producer reads, with what the person stated placed right after
 * the site's identity and ahead of every reading, because it outranks them.
 * What they state replaces whatever the facts were stated with before.
 */
export function withStatedFacts<Facts extends { url: string; finalUrl: string; fetchedAt: string }>(
  facts: Facts,
  stated: StatedFacts | null | undefined,
): Facts & { stated?: StatedFacts } {
  if (!stated) return facts;
  // The earlier statement is dropped, so it cannot follow the new one in and win.
  const {
    url,
    finalUrl,
    fetchedAt,
    stated: _previous,
    ...rest
  } = facts as Facts & {
    stated?: StatedFacts;
  };
  const site = 'site' in rest ? { site: rest.site } : {};
  return { url, finalUrl, fetchedAt, ...site, stated, ...rest } as Facts & { stated: StatedFacts };
}
