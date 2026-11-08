import { z } from 'zod';

/**
 * The brand manifest, `brand.json`: what a page needs from a brand that is not
 * a token - its name, its site, the logo pair, the web font to load. The tokens
 * are the palette; the manifest is what the page says it is. The generative
 * layer's app bar reads it through `BrandProvider`, which also loads the web
 * font, and `assembleBrand` validates it beside the tokens.
 */

/**
 * Every URL in a manifest is http(s) and nothing else, but for a logo, which
 * may also be a root-relative path on the host (`rootRelativePath`).
 *
 * A bare `z.url()` accepts any scheme - `javascript:`, `data:`, `file:` - and
 * the two logo URLs are handed straight to an `<img src>` in the app bar. A
 * manifest is produced content with the same provenance as a layout, so the
 * scheme is checked where the manifest is parsed rather than trusted at the
 * point it reaches the DOM.
 */
export const httpUrl = z.url({ protocol: /^https?$/ });

/** The origin a root-relative path is resolved against to see where it lands. */
const SENTINEL_ORIGIN = 'https://brand-path.invalid';

/**
 * A root-relative path on the host's own origin: `/brand/logo.svg`, which a
 * host served from `localhost` points at a file in its own public folder
 * with. It is accepted only when resolving it against a sentinel origin stays
 * on that origin, the same test the result view's URL gate applies, so a
 * protocol-relative `//elsewhere.example/x.svg`, or a backslash a browser
 * reads as one, is refused rather than taken for a path.
 */
export const rootRelativePath = z.string().refine(
  (value) => {
    if (!value.startsWith('/') || /[\\\s]/.test(value)) return false;
    try {
      return new URL(value, SENTINEL_ORIGIN).origin === SENTINEL_ORIGIN;
    } catch {
      return false;
    }
  },
  { message: 'a logo is an http(s) URL or a root-relative path on the host' },
);

/** A logo: an http(s) URL, or a root-relative path on the host's own origin. */
export const logoUrl = z.union([httpUrl, rootRelativePath]);

export const brandManifestSchema = z.strictObject({
  name: z.string().min(1),
  website: httpUrl,
  logo: z.strictObject({
    /** The mark drawn on the light canvas: usually the dark version of the logo. */
    onLight: logoUrl,
    /** The mark drawn on the dark canvas: usually the light version of the logo. */
    onDark: logoUrl,
  }),
  webfont: z
    .strictObject({
      provider: z.literal('google-fonts'),
      family: z.string().min(1),
    })
    .nullable(),
});

export type BrandManifest = z.infer<typeof brandManifestSchema>;
