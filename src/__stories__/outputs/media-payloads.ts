/**
 * Payloads of files a browser can fetch, shared by the result stories that need
 * one: `Outputs/Media` and `Outputs/Downloads`.
 *
 * **Hand-built, and they have to be.** Every other result story renders what a
 * run produced, but a run's file-bearing results carry `pipelex-storage://`
 * references, which resolve only through the host's own resolver and cannot be
 * fetched by a browser looking at Storybook. The files named here are served by
 * Storybook itself. The descriptors these payloads are rendered against are the
 * corpus's own, generated like every other.
 */

/**
 * The served PDF, as an ABSOLUTE url.
 *
 * The gate would PAINT `/solar_system.pdf` — a root-relative path is viewable,
 * because that is what a host's URL resolver hands back. It would not FRAME one
 * from a payload, though, and this story frames it: a path is the embedding
 * page's own origin, so only a resolver may choose one. Absolute is also what
 * the fixture should say either way — the standard says a `native.Document`'s
 * `url` is a storage URI, an HTTP(S) URL or a base64 data URL, and a path is
 * none of those. Resolving it against the origin costs one line and keeps the
 * fixture honest about its provenance.
 */
export const PDF_URL =
  typeof window === 'undefined'
    ? 'https://example.invalid/solar_system.pdf'
    : new URL('/solar_system.pdf', window.location.origin).href;

/**
 * The served files, absolute for the same reason `PDF_URL` is.
 *
 * They are three real generations, downscaled to a size worth committing — the
 * originals a run wrote are around two megabytes each, which is a fixture nobody
 * wants in a repository.
 */
const figureUrl = (n: number) =>
  typeof window === 'undefined'
    ? `https://example.invalid/figure_${n}.jpg`
    : new URL(`/figure_${n}.jpg`, window.location.origin).href;

/**
 * A payload for `results.nested_media_result`, of files a browser can fetch.
 *
 * **Hand-built, and it has to be.** The descriptor is the corpus's own,
 * generated like every other; the payload cannot be, twice over. The language
 * forbids a `PipeLLM` resolving to a concept that contains images, so no single
 * carrier produces this shape at all — and even if one did, its file URLs would
 * be `pipelex-storage://` references a browser cannot fetch, so the story would
 * show three grey tiles and a preview button that could not fire. Which is the
 * case `A storage reference` above already covers.
 */
export const REPORT = {
  title: 'Retrofit review, March 2026',
  summary: {
    inner_html:
      "<h3>Findings</h3><p>Two of the three findings <strong>block</strong>. The coating order has no confirmed delivery date, and the damping prototype has not been tested at the mount's real mass.</p><table><tr><th>Finding</th><th>Blocks</th></tr><tr><td>Coating delivery</td><td>Yes</td></tr><tr><td>Damping prototype</td><td>Yes</td></tr><tr><td>Handover checklist</td><td>No</td></tr></table>",
    css_class: null,
  },
  source: {
    url: PDF_URL,
    filename: 'solar_system.pdf',
    mime_type: 'application/pdf',
    title: 'The Solar System: An Overview',
    snippet: 'The source document the review was drawn from.',
  },
  figures: [
    { caption: 'The bed sign as delivered', image: { url: figureUrl(1), mime_type: 'image/jpeg' } },
    { caption: 'After recoating', image: { url: figureUrl(2), mime_type: 'image/jpeg' } },
    { caption: 'Under morning light', image: { url: figureUrl(3), mime_type: 'image/jpeg' } },
  ],
};
