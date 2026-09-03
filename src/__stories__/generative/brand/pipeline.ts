import { brandManifestSchema } from './manifest';
import {
  type BrandFixture,
  brandProducerId,
  brandProvenanceSchema,
  brandScope,
} from './brand-fixture';
import { compileBrandTokens } from './terrazzo';
import { validateBrandTokens } from './tokens-schema';

/**
 * One brand directory's three files in, a `BrandFixture` or every problem
 * with them out. Shared by the build script (which writes the fixture), the
 * node test (which asserts the committed build is what the data still
 * produces) and the producer's repair loop (which needs the problems).
 *
 * The order is the order a producer would want to be told: the manifest and
 * the provenance first, because they are cheap and their errors are exact;
 * then our own token validation, which states the contract's rules in the
 * contract's words; then Terrazzo, on a file it can only accept, so what it
 * reports is what only it can see.
 */

export interface BrandSource {
  brand: string;
  producerId: string;
  manifest: unknown;
  tokens: unknown;
  provenance: unknown;
  /** The hash of the contract brief as rendered now. */
  contractHash: string;
}

export type AssembleResult =
  | { ok: true; fixture: BrandFixture; warnings: string[] }
  | { ok: false; problems: string[]; warnings: string[] };

function issues(prefix: string, error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((issue) => {
    const where = issue.path.map(String).join('.') || '(root)';
    return `${prefix}: ${where}: ${issue.message}`;
  });
}

export async function assembleBrand(source: BrandSource): Promise<AssembleResult> {
  const problems: string[] = [];
  const manifest = brandManifestSchema.safeParse(source.manifest);
  if (!manifest.success) problems.push(...issues('brand.json', manifest.error));
  const provenance = brandProvenanceSchema.safeParse(source.provenance);
  if (!provenance.success) problems.push(...issues('provenance.json', provenance.error));
  else {
    const expectedId = brandProducerId(provenance.data);
    if (expectedId !== source.producerId) {
      problems.push(
        `provenance.json: names producer ${expectedId}, but the directory is ${source.producerId}`,
      );
    }
    if (provenance.data.contractHash !== source.contractHash) {
      problems.push(
        `provenance.json: contractHash ${provenance.data.contractHash} is not the contract as rendered now (${source.contractHash}); the brand was produced against an older contract`,
      );
    }
  }
  const tokens = validateBrandTokens(source.tokens);
  if (!tokens.ok) problems.push(...tokens.problems.map((problem) => `tokens.json: ${problem}`));
  if (problems.length > 0 || !manifest.success || !provenance.success || !tokens.ok) {
    return { ok: false, problems, warnings: [] };
  }
  const scope = brandScope(source.brand, source.producerId);
  const compiled = await compileBrandTokens(tokens.tokens, scope);
  if (!compiled.ok) {
    return {
      ok: false,
      problems: compiled.problems.map((problem) => `tokens.json: ${problem}`),
      warnings: compiled.warnings,
    };
  }
  return {
    ok: true,
    warnings: compiled.warnings,
    fixture: {
      ...provenance.data,
      brand: source.brand,
      producerId: source.producerId,
      manifest: manifest.data,
      tokens: tokens.tokens,
      scope,
      css: compiled.css,
      warnings: compiled.warnings,
    },
  };
}
