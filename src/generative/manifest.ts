import { z } from 'zod';

/**
 * The brand manifest, `brand.json`: what the page needs from a brand that is
 * not a token - its name, its site, the logo pair, the web font to load. The
 * schema is rendered into the contract brief as JSON Schema, so a producer
 * reads exactly what the build will check.
 */
/**
 * Every URL in a manifest is http(s) and nothing else.
 *
 * A bare `z.url()` accepts any scheme - `javascript:`, `data:`, `file:` - and
 * the two logo URLs are handed straight to an `<img src>` in the app bar. A
 * manifest is produced content with the same provenance as a layout, so the
 * scheme is checked where the manifest is parsed rather than trusted at the
 * point it reaches the DOM.
 */
const httpUrl = z.url({ protocol: /^https?$/ });

export const brandManifestSchema = z.strictObject({
  name: z.string().min(1),
  website: httpUrl,
  logo: z.strictObject({
    /** The mark drawn on the light canvas: usually the dark version of the logo. */
    onLight: httpUrl,
    /** The mark drawn on the dark canvas: usually the light version of the logo. */
    onDark: httpUrl,
  }),
  webfont: z
    .strictObject({
      provider: z.literal('google-fonts'),
      family: z.string().min(1),
    })
    .nullable(),
});

export type BrandManifest = z.infer<typeof brandManifestSchema>;
