import type { BrandManifest } from '../../generative/manifest';
import './brands/mthds.css';
import './brands/pipelex.css';

/**
 * The brands a generative story can paint a page in - STORY fixtures, not
 * package data.
 *
 * A product page needs a brand whatever else is true: its app bar reads a
 * logo pair and a name off the manifest, and nothing on the page names a
 * brand itself. So a story has to bring one, and the two here are the ones
 * the captured layouts were actually looked at under.
 *
 * Both came from the brand study on the `feature/Generative-ui` branch, where
 * a pipeline read a site and wrote its tokens; that pipeline did not come
 * with the layer, so nothing in this repo reproduces either the manifest or
 * the stylesheet, and neither is meant to be edited. What they are for is the
 * question a single palette cannot answer: whether a layout reads because of
 * the layout or because of the colours it was written against.
 *
 * `scope` is the class the compiled stylesheet sets its custom properties on
 * (and their dark values under `.dark`). Everything below that class - the
 * catalog's own components, the kernel's controls - reads the tokens it
 * always reads, which is the whole of what a brand does to a page.
 *
 * All of this is outside both entry trees, so it ships in nothing. See
 * docs/theming.md.
 */

export interface BrandFixture {
  /** The brand's key, for a story id. */
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

export const MTHDS: BrandFixture = {
  key: 'mthds',
  producedBy: 'Pipelex method · claude-4.8-opus',
  scope: 'brand-mthds-pipelex-method--claude-4-8-opus',
  manifest: {
    name: 'MTHDS',
    website: 'https://mthds.ai/',
    logo: {
      onLight: 'https://mthds.ai/latest/images/mthds-black_on_transparent.png',
      onDark: 'https://mthds.ai/latest/images/mthds-white_on_transparent.png',
    },
    webfont: { provider: 'google-fonts', family: 'Roboto' },
  },
};

export const PIPELEX: BrandFixture = {
  key: 'pipelex',
  producedBy: 'Pipelex method · claude-4.8-opus',
  scope: 'brand-pipelex-pipelex-method--claude-4-8-opus',
  manifest: {
    name: 'Pipelex',
    website: 'https://pipelex.com/',
    logo: {
      onLight: 'https://d2cinlfp2qnig1.cloudfront.net/logo/Pipelex-logo-bot-1119x352.png',
      onDark: 'https://pipelex.com/logo.png',
    },
    webfont: { provider: 'google-fonts', family: 'Inter' },
  },
};

/** Every brand a story may paint in, stock first. */
export const BRANDS: readonly BrandFixture[] = [STOCK, MTHDS, PIPELEX];
