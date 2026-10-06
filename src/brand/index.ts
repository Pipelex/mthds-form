/**
 * `@pipelex/mthds-form/brand` - a brand as data, held to the theme contract.
 *
 * A brand is two files a producer writes - `tokens.json`, a DTCG token file
 * setting the theme contract's custom properties in both modes, and
 * `brand.json`, the manifest the page's chrome reads - plus the provenance
 * that says who wrote them. This entry validates the three, compiles the
 * tokens into a stylesheet scoped to one class, and reads a website's design
 * facts for a producer to judge.
 *
 * It is isomorphic and network-free: no React, no DOM, no fetch, and zod as
 * its one dependency, so the same code runs in a build script, a test, a
 * browser and a server's own guarded fetcher. Nothing here calls a model.
 *
 * The public API is this file. Deep paths are not exported and not stable.
 */

// The contract: which token sets which custom property, and what it paints.
export {
  BRAND_CONTRACT,
  COLOR_TOKEN_NAMES,
  CONTRAST_PAIRS,
  MIN_CONTRAST,
  contractVariable,
  isColorTokenName,
  type ColorTokenName,
  type ContractToken,
  type ContractTokenType,
} from './contract';

// The token file, its validator, and the colour arithmetic the validator uses.
export {
  colorHex,
  colorIsHex,
  contrastRatio,
  resolveColor,
  srgbColorSchema,
  validateBrandTokens,
  type BrandTokens,
  type ColorMode,
  type ColorToken,
  type ColorValue,
  type DimensionToken,
  type FontFamilyToken,
  type SrgbColor,
  type TokensValidation,
} from './tokens';

// The manifest, the stated facts, the provenance.
export { brandManifestSchema, type BrandManifest } from './manifest';
export { statedFactProblems, statedFactsSchema, withStatedFacts, type StatedFacts } from './stated';
export {
  BRAND_PRODUCERS,
  brandProducerId,
  brandProvenanceSchema,
  brandScope,
  type BrandProducer,
  type BrandProvenance,
} from './provenance';

// Three files in, a validated and compiled brand out.
export {
  assembleBrand,
  type AssembleResult,
  type AssembledBrand,
  type BrandSource,
} from './assemble';
export { BRAND_VARIABLES, compileBrand } from './compile';

// The site reader: pure functions over texts the host fetched.
export {
  siteFacts,
  stylesheetUrls,
  type FetchedPage,
  type FetchedStylesheet,
  type LogoCandidate,
  type PropertyFacts,
  type Ranked,
  type SiteFacts,
} from './site-facts';
