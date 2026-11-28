import type { BrandManifest } from '../../generative';

/**
 * The brand a generative story paints a page in - a STORY fixture, not
 * package data.
 *
 * A page with an app bar needs a brand whatever else is true: the bar reads
 * a logo pair and a name off the manifest, and nothing on the page names a
 * brand itself. So a story has to bring one. The stories paint every layout
 * in the stock palette, `theme.css`, under a manifest that names the
 * standard. Brands compiled from real sites' tokens used to sit beside it;
 * they went with the brand entry, which a host now owns, and a host's
 * palette is what the `Generative/App styles` stories paint with instead.
 *
 * All of this is outside every entry tree, so it ships in nothing.
 */

export interface BrandFixture {
  /** The brand's key, for a story's args. */
  key: string;
  /** What produced the tokens, for a story title. */
  producedBy: string;
  /** The class a brand's stylesheet scopes its tokens to, or null for the stock palette. */
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

/** Every brand a story may paint in. */
export const BRANDS: readonly BrandFixture[] = [STOCK];
