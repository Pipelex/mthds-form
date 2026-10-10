import { compileBrand } from './compile';
import { type BrandManifest, brandManifestSchema } from './manifest';
import {
  type BrandProvenance,
  brandProducerId,
  brandProvenanceSchema,
  brandScope,
} from './provenance';
import { statedFactProblems } from './stated';
import { type BrandTokens, validateBrandTokens } from './tokens';

/**
 * One brand's three files in - the manifest, the tokens, the provenance - and
 * either the brand, validated and compiled, or every problem with it.
 *
 * This is the verdict on whether a brand is VALID under the contract as it is
 * now: the manifest, the tokens with their contrast, and the facts the person
 * stated. It is a hard verdict, and a brand that fails it is not compiled.
 * Whether a brand was produced against the current brief, and from the facts
 * its recording holds now, is a different question and never a reason to
 * refuse one - an older brand stays a valid brand - so the provenance's
 * contract hash and facts hash are recorded here and judged by the producer,
 * not by this function.
 *
 * The problems come in the order a producer would want to be told: the
 * manifest and the provenance first, because they are cheap and their errors
 * exact, then the tokens, then the stated facts, which can only be checked
 * against files that parsed. Each names the file and the path.
 */

export interface BrandSource {
  /** The brand's directory name: `pipelex`. */
  brand: string;
  /** The producer's directory name under it: `pipelex-method--claude-4.8-opus`. */
  producerId: string;
  manifest: unknown;
  tokens: unknown;
  provenance: unknown;
}

export interface AssembledBrand extends BrandProvenance {
  brand: string;
  producerId: string;
  manifest: BrandManifest;
  tokens: BrandTokens;
  /** The class a page root carries; the stylesheet is scoped to it. */
  scope: string;
  /** The compiled stylesheet. */
  css: string;
}

export type AssembleResult =
  { ok: true; brand: AssembledBrand } | { ok: false; problems: string[] };

function issues(file: string, error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((issue) => {
    const where = issue.path.map(String).join('.') || '(root)';
    return `${file}: ${where}: ${issue.message}`;
  });
}

export function assembleBrand(source: BrandSource): AssembleResult {
  const problems: string[] = [];
  const manifest = brandManifestSchema.safeParse(source.manifest);
  if (!manifest.success) problems.push(...issues('brand.json', manifest.error));
  const provenance = brandProvenanceSchema.safeParse(source.provenance);
  if (!provenance.success) problems.push(...issues('provenance.json', provenance.error));
  else {
    const expected = brandProducerId(provenance.data);
    if (expected !== source.producerId) {
      problems.push(
        `provenance.json: names producer ${expected}, but the brand is filed as ${source.producerId}`,
      );
    }
  }
  const tokens = validateBrandTokens(source.tokens);
  if (!tokens.ok) problems.push(...tokens.problems.map((problem) => `tokens.json: ${problem}`));
  if (!manifest.success || !provenance.success || !tokens.ok) return { ok: false, problems };
  problems.push(...statedFactProblems(provenance.data.stated, manifest.data, tokens.tokens));
  if (problems.length > 0) return { ok: false, problems };
  const scope = brandScope(source.brand, source.producerId);
  return {
    ok: true,
    brand: {
      ...provenance.data,
      brand: source.brand,
      producerId: source.producerId,
      manifest: manifest.data,
      tokens: tokens.tokens,
      scope,
      css: compileBrand(tokens.tokens, scope),
    },
  };
}
