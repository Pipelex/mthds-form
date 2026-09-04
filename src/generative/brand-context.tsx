'use client';

import * as React from 'react';
import type { BrandManifest } from './manifest';

/**
 * The manifest, handed down to the brand components: the app bar reads the
 * logo pair and the name off it, and nothing on the page names a brand
 * itself. The provider also loads the manifest's web font, once per family,
 * by appending the Google Fonts link a host would put in its document head -
 * so a brand story needs nothing in `.storybook/preview-head.html`, and the
 * Storybook carries no font any story did not ask for.
 */

const BrandContext = React.createContext<BrandManifest | null>(null);

export function BrandProvider({
  manifest,
  children,
}: {
  manifest: BrandManifest;
  children: React.ReactNode;
}) {
  useWebfont(manifest.webfont);
  return <BrandContext.Provider value={manifest}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandManifest {
  const manifest = React.useContext(BrandContext);
  if (!manifest) throw new Error('useBrand: no BrandProvider above this component.');
  return manifest;
}

/** The weights the page sets: regular, medium, semibold, bold. */
const WEIGHTS = '400;500;600;700';

function useWebfont(webfont: BrandManifest['webfont']) {
  const provider = webfont?.provider;
  const family = webfont?.family;
  React.useEffect(() => {
    if (!provider || !family) return;
    const key = `${provider}:${family}`;
    if (document.head.querySelector(`link[data-brand-webfont="${CSS.escape(key)}"]`)) return;
    for (const origin of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
      if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) continue;
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = origin;
      if (origin.endsWith('gstatic.com')) preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${WEIGHTS}&display=swap`;
    link.dataset.brandWebfont = key;
    document.head.appendChild(link);
  }, [provider, family]);
}
