import { z } from 'zod';

/**
 * The brand manifest, `brand.json`: what the page needs from a brand that is
 * not a token - its name, its site, the logo pair, the web font to load. The
 * schema is rendered into the contract brief as JSON Schema, so a producer
 * reads exactly what the build will check.
 */
export const brandManifestSchema = z.strictObject({
  name: z.string().min(1),
  website: z.url(),
  logo: z.strictObject({
    /** The mark drawn on the light canvas: usually the dark version of the logo. */
    onLight: z.url(),
    /** The mark drawn on the dark canvas: usually the light version of the logo. */
    onDark: z.url(),
  }),
  webfont: z
    .strictObject({
      provider: z.literal('google-fonts'),
      family: z.string().min(1),
    })
    .nullable(),
});

export type BrandManifest = z.infer<typeof brandManifestSchema>;
