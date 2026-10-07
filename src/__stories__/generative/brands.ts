import type { BrandManifest } from '../../brand';
import { fixtureLabel } from '../../generative';
import { type BrandBuild, BRAND_BUILDS } from './brands/generated';
import './brands/index.css';

/**
 * The brands a generative story can paint a page in - STORY fixtures, not
 * package data.
 *
 * A page with an app bar needs a brand whatever else is true: the bar reads
 * a logo pair and a name off the manifest, and nothing on the page names a
 * brand itself. So a story has to bring one. Besides the stock palette, they
 * are the corpus under `data/brands/`, which the brand study produced from
 * real sites and which `make brands` compiles with the brand entry's own
 * `assembleBrand` into `./brands/`. What they are for is the question a
 * single palette cannot answer: whether a layout reads because of the layout
 * or because of the colours it was written against.
 *
 * `scope` is the class the compiled stylesheet sets its custom properties on
 * (and their dark values under `.dark`, and the brand's typeface). Everything
 * below that class - the catalog's own components, the kernel's controls -
 * reads the tokens it always reads, which is the whole of what a brand does
 * to a page.
 *
 * All of this is outside every entry tree, so it ships in nothing. See
 * docs/brand.md.
 */

export interface BrandFixture {
  /** The brand's key, for a story's args. */
  key: string;
  /** What produced the tokens, for a story title. */
  producedBy: string;
  /** The class the compiled stylesheet scopes its tokens to, or null for the stock palette. */
  scope: string | null;
  manifest: BrandManifest;
}

/**
 * The stock palette: this package's own `theme.css`, with a manifest that
 * names the standard rather than a company. It is the baseline every layout
 * is shown under first - a page that only works in a brand's colours is a
 * page with a problem the brand is hiding.
 */
export const STOCK: BrandFixture = {
  key: 'stock',
  producedBy: 'the stock palette',
  scope: null,
  manifest: {
    name: 'MTHDS',
    website: 'https://mthds.ai/',
    logo: {
      onLight: 'https://mthds.ai/latest/images/mthds-black_on_transparent.png',
      onDark: 'https://mthds.ai/latest/images/mthds-white_on_transparent.png',
    },
    webfont: null,
  },
};

function fixtureOf(build: BrandBuild): BrandFixture {
  return {
    key: `${build.brand}--${build.producerId}`,
    producedBy: fixtureLabel(build),
    scope: build.scope,
    manifest: build.manifest,
  };
}

/** The corpus brand a story names, or a loud failure: a story must never paint in a brand it did not name. */
function corpusBrand(brand: string, producerId: string): BrandFixture {
  const found = BRAND_BUILDS.find(
    (build) => build.brand === brand && build.producerId === producerId,
  );
  if (!found) throw new Error(`No brand ${brand}/${producerId} in data/brands/; run make brands.`);
  return fixtureOf(found);
}

/** The two brands the captured layouts were looked at under. */
export const MTHDS = corpusBrand('mthds', 'pipelex-method--claude-4.8-opus');
export const PIPELEX = corpusBrand('pipelex', 'pipelex-method--claude-4.8-opus');

/** Every brand a story may paint in, stock first. */
export const BRANDS: readonly BrandFixture[] = [STOCK, ...BRAND_BUILDS.map(fixtureOf)];
