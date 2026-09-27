import { viewableUrl } from '../core/native-content';

/**
 * A root-relative path the URL gate admits, made absolute against this
 * document; anything else verbatim.
 *
 * For a URL that leaves the document: the clipboard, or a host's delivery
 * outside the view's frame, where `/api/assets/x` would otherwise be read
 * against whatever page it lands in.
 *
 * Resolved against `document.baseURI`, which is how the browser resolves the
 * same path for an `<img>` or a `fetch` in this document: it honours a
 * `<base>`, and in a `srcdoc` frame it is the parent's URL. `location.origin`
 * is the string `"null"` there, which made the old answer `null/api/assets/x`.
 *
 * The gate decides what counts as a path, so there is one answer to that
 * question: `/\host/x`, which the URL parser reads as another origin, is left
 * as it was rather than resolved to that origin.
 */
export function absoluteUrl(url: string): string {
  const gated = viewableUrl(url);
  if (!gated?.startsWith('/') || typeof document === 'undefined') return url;
  try {
    return new URL(gated, document.baseURI).href;
  } catch {
    // An opaque base, such as a `data:` document's, resolves nothing.
    return url;
  }
}
