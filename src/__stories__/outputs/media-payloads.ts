/**
 * Payloads of files a browser can fetch, shared by the result stories that need
 * one: `Outputs/Media`, `Outputs/Downloads` and `Outputs/PDF pages`.
 *
 * **Hand-built, and they have to be.** Every other result story renders what a
 * run produced, but a run's file-bearing results carry `pipelex-storage://`
 * references, which resolve only through the host's own resolver and cannot be
 * fetched by a browser looking at Storybook. The files named here are served by
 * Storybook itself. The descriptors these payloads are rendered against are the
 * corpus's own, generated like every other.
 *
 * Beside them, `pdfViewer` pins what the browser says of its PDF viewer, which
 * decides whether an opened PDF is a frame or a card, and `servedFiles` is the
 * resolver of a host that serves these files, without which none is framed.
 */
import type { ResolveUrl } from '../../react';

/**
 * The served PDF, as an ABSOLUTE url.
 *
 * The standard says a `native.Document`'s `url` is a storage URI, an HTTP(S)
 * URL or a base64 data URL, and a path is none of those, so the fixture names
 * the file absolutely. The view frames it only because the story's host says it
 * serves it (`servedFiles`): a payload's URL alone is never framed.
 */
export const PDF_URL =
  typeof window === 'undefined'
    ? 'https://example.invalid/solar_system.pdf'
    : new URL('/solar_system.pdf', window.location.origin).href;

/**
 * The resolver of a host that serves the files these payloads name: a URL on
 * the page's own origin is answered as the path it serves it at, and anything
 * else is not the host's to answer.
 *
 * The result view frames a document only when the host's resolver answered it
 * on the page's own origin, never on the strength of a payload's URL, so a story
 * that frames one of these files passes this. It answers a PATH rather than the
 * URL it was given because a resolver that hands the payload's own member back
 * unchanged has added nothing, and the view counts such an answer as the
 * payload's. Compare a frame's `src` with `servedAt`.
 */
export const servedFiles: ResolveUrl = (url) => {
  if (typeof window === 'undefined') return undefined;
  const origin = window.location.origin;
  return url.startsWith(`${origin}/`) ? url.slice(origin.length) : undefined;
};

/** A URL as an absolute one on the page's origin, to compare a frame's `src` with a payload's URL. */
export const servedAt = (url: string | null) =>
  url === null ? null : new URL(url, window.location.origin).href;

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

/**
 * A payload for `results.two_documents_result`: a review sent with the document
 * it reviews and an appendix, both the served PDF under names of their own.
 * Hand-built for the reason `REPORT` is: a run's documents are storage
 * references a browser cannot fetch.
 */
export const REVIEW_PACKET = {
  title: 'Retrofit review, March 2026',
  reviewed: {
    url: PDF_URL,
    filename: 'retrofit_plan.pdf',
    mime_type: 'application/pdf',
    title: 'Retrofit plan',
  },
  appendix: {
    url: PDF_URL,
    filename: 'site_survey.pdf',
    mime_type: 'application/pdf',
    title: 'Site survey',
  },
};

/**
 * A payload for a `native.Document` result that is the served PDF under its
 * own name, which `Outputs/PDF pages` hands a host that cannot frame it, so the
 * view draws its pages. Hand-built for the reason `REPORT` is.
 */
export const DRAWN_PDF = {
  url: PDF_URL,
  filename: 'solar_system.pdf',
  mime_type: 'application/pdf',
  title: 'The Solar System: An Overview',
};

/**
 * Pins what the browser says of its PDF viewer for one story, and gives the
 * browser its own answer back afterwards.
 *
 * The result view asks `navigator.pdfViewerEnabled`, and the answer is the
 * browser's: the headless Chromium the stories run in says it has no viewer,
 * as Android's browsers do, and a desktop browser says it has one. A story
 * about one case has to say which it is, so it reads the same in both.
 */
export function pdfViewer(enabled: boolean) {
  return () => {
    Object.defineProperty(navigator, 'pdfViewerEnabled', {
      configurable: true,
      get: () => enabled,
    });
    return () => {
      delete (navigator as { pdfViewerEnabled?: boolean }).pdfViewerEnabled;
    };
  };
}
