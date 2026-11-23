import { parseMarkup } from './markup-parse';

/**
 * A `native.Html` page's links rewritten so that nothing in it can move the
 * frame it is shown in. Internal to the `./react` entry; `frameDocument`
 * (`html-frame.ts`) applies it to every page it frames, which is the on-screen
 * preview, the PDF's layout copy and the document a host's own `renderPdf` is
 * handed.
 *
 * ## Why the frame needed it
 *
 * The frame is a `srcdoc` document sandboxed without scripts, and a sandboxed
 * frame may still navigate itself. A `srcdoc` document's base URL is its
 * embedder's, so before this rewrite a click on a link to another site loaded
 * that site inside the host's page, a relative link loaded the host's own page
 * there (same-origin and readable, requested with the host's cookies), and an
 * in-page `#` link, which every generated report's table of contents is made
 * of, replaced the result with the host page itself. A listener the parent
 * adds to the frame's document cannot stop any of it, since WebKit never runs
 * one inside a script-less frame, so the markup is rewritten before it is
 * framed instead.
 *
 * ## What each link becomes
 *
 * - A link (`<a>`, `<area>`, and SVG's `<a>` by `href` or `xlink:href`) is
 *   resolved against `baseUrl`, the host document's own base unless given, as
 *   the browser would resolve it. It keeps its `href` only for `http:`,
 *   `https:` and `mailto:`, the schemes the PDF view admits for its links too,
 *   and is given `target="_blank"` and `rel="noopener noreferrer"`, whatever
 *   target it named: it opens in a new tab with no handle back to the host and
 *   no referrer, and the frame stays where it is. Its `ping`, a request on
 *   click to wherever it names, is removed.
 * - Any other scheme (`tel:`, `ftp:`, `javascript:`, an application's own)
 *   loses its `href` and keeps its words, as a Markdown result's links do.
 * - An in-page link (`#x`) becomes `about:srcdoc#x` with `target="_self"`,
 *   which scrolls the frame to `#x` with no load. The explicit target is what
 *   keeps it out of a new tab, since the frame's head carries a
 *   `<base target="_blank">`. A page that is printed rather than shown
 *   (`inPageLinks: 'document'`) keeps `#x` as written, which a PDF renderer
 *   turns into a link to the page's own heading.
 * - Every `<meta http-equiv="refresh">`, whatever its letter case, is removed,
 *   so no page can move its frame without a click either.
 *
 * Markup with nothing to rewrite comes back as the very same string, and so
 * does all markup where there is no `DOMParser` (a server render): the preview
 * builds its document in a layout effect and so frames nothing there, and a
 * host's own `renderPdf` handed such a page is responsible for its own
 * navigation policy (`docs/result-view.md` § Markup).
 */

export interface NavigationOptions {
  /**
   * What a relative link resolves against: the host document's base when
   * unset. A relative link with nothing to resolve against loses its `href`.
   */
  baseUrl?: string;
  /**
   * `frame`, the default, keeps an in-page link in the frame as
   * `about:srcdoc#x`; `document` leaves it as written, for a page that prints.
   */
  inPageLinks?: 'frame' | 'document';
}

/** The schemes a link keeps. */
const KEPT_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

/** The frame document's own URL, which an in-page link names to stay in it. */
const FRAME_URL = 'about:srcdoc';

/** Whether the markup may hold a link or a meta refresh at all: a substring test, so most pages are never parsed. */
function mayNavigate(markup: string): boolean {
  return /href|http-equiv/i.test(markup);
}

/** The attributes a link names its destination in. */
function hrefAttributes(element: Element): string[] {
  const names = ['href'];
  if (element.namespaceURI === 'http://www.w3.org/2000/svg') names.push('xlink:href');
  return names.filter((name) => element.hasAttribute(name));
}

/** What one link's destination becomes: kept and sent to a tab, kept in the frame, or dropped. */
type Destination = { href: string; target: '_blank' | '_self' } | { href: null };

function destinationOf(
  value: string,
  base: string | undefined,
  inPageLinks: 'frame' | 'document',
): Destination | undefined {
  const href = value.trim();
  if (href.startsWith('#') || href.toLowerCase().startsWith(`${FRAME_URL}#`)) {
    if (inPageLinks === 'document') return undefined;
    const fragment = href.slice(href.indexOf('#'));
    return { href: `${FRAME_URL}${fragment}`, target: '_self' };
  }
  let url: URL;
  try {
    url = base === undefined ? new URL(href) : new URL(href, base);
  } catch {
    return { href: null };
  }
  return KEPT_SCHEMES.has(url.protocol) ? { href: url.href, target: '_blank' } : { href: null };
}

/** The host document's base, when there is a host document. */
function hostBase(): string | undefined {
  return typeof document === 'undefined' ? undefined : document.baseURI;
}

/**
 * The markup with every link sent to a new tab or kept in the frame, every
 * other scheme dropped and every meta refresh removed; see the module comment.
 */
export function rewriteNavigation(markup: string, options: NavigationOptions = {}): string {
  if (!mayNavigate(markup)) return markup;
  const parsed = parseMarkup(markup);
  if (!parsed) return markup;
  const base = options.baseUrl ?? hostBase();
  const inPageLinks = options.inPageLinks ?? 'frame';
  let changed = false;

  for (const element of Array.from(parsed.root.querySelectorAll('*'))) {
    const tag = element.localName;
    if (tag === 'meta') {
      if ((element.getAttribute('http-equiv') ?? '').trim().toLowerCase() === 'refresh') {
        element.remove();
        changed = true;
      }
      continue;
    }
    if (tag !== 'a' && tag !== 'area') continue;
    let target: '_blank' | '_self' | undefined;
    for (const name of hrefAttributes(element)) {
      const destination = destinationOf(element.getAttribute(name) ?? '', base, inPageLinks);
      if (destination === undefined) continue;
      changed = true;
      if (destination.href === null) {
        element.removeAttribute(name);
        continue;
      }
      element.setAttribute(name, destination.href);
      // A link sent anywhere outside the page goes to a tab, even when another
      // of its attributes names the page itself.
      if (target !== '_blank') target = destination.target;
    }
    if (target === undefined) continue;
    element.setAttribute('target', target);
    if (target === '_blank') element.setAttribute('rel', 'noopener noreferrer');
    element.removeAttribute('ping');
  }
  return changed ? parsed.serialize() : markup;
}
