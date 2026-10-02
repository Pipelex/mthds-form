import type { HtmlContentView } from '../core/native-content';

/**
 * The document a `native.Html` result is framed in: the on-screen preview's and
 * the PDF copy's, built by one function so the two cannot drift on the policy
 * that keeps model markup from reaching the host. Internal to the `./react`
 * entry; see `html-preview.tsx` for why a frame at all, and
 * `docs/result-view.md` § Markup for the policy.
 */

/**
 * What `img-src` allows by default: the host's own origin, inline data and
 * ordinary remote images. `'self'` is the host's origin because the frame is
 * same-origin with it; it is what lets a page served from a plain-`http:`
 * development host reach `/images/…`, which `https:` already covers in
 * production.
 */
export const DEFAULT_IMG_SRC = "'self' data: https:";

/** The colours and face the frame's own stylesheet is written in. */
export interface FrameTypography {
  color: string;
  mutedColor: string;
  borderColor: string;
  font: string;
}

/**
 * A page's colours: ink on paper, whatever the theme around it. A whole
 * document is a page its author laid out for a white sheet, and a fragment of
 * one printed must not keep a dark theme's near-white text either.
 */
export function pageTypography(font: string): FrameTypography {
  return { color: '#000', mutedColor: '#555', borderColor: '#bbb', font };
}

/**
 * The frame's own stylesheet: the host's typography, and table chrome. Every
 * rule but `body`'s is `:where()`, and the sheet comes first in the head, so a
 * page's own CSS wins over all of it.
 */
export function frameStyles({ color, mutedColor, borderColor, font }: FrameTypography): string {
  return `
    :root { color-scheme: inherit; }
    body {
      margin: 0;
      color: ${color};
      font-family: ${font};
      font-size: 13px;
      line-height: 1.55;
      background: transparent;
      overflow-wrap: anywhere;
    }
    :where(h1, h2, h3, h4, h5, h6) { margin: 0 0 0.4em; line-height: 1.25; }
    :where(h1) { font-size: 1.4em; }
    :where(h2) { font-size: 1.2em; }
    :where(h3) { font-size: 1.05em; }
    :where(p, ul, ol, table, pre, blockquote) { margin: 0 0 0.75em; }
    :where(ul, ol) { padding-inline-start: 1.25em; }
    :where(table) { border-collapse: collapse; width: 100%; }
    :where(th, td) {
      border: 1px solid ${borderColor};
      padding: 4px 8px;
      text-align: left;
      vertical-align: top;
    }
    :where(th) { font-weight: 600; }
    :where(caption) { caption-side: top; color: ${mutedColor}; padding-bottom: 4px; text-align: left; }
    :where(a) { color: inherit; }
    :where(code, pre) { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.92em; }
    :where(pre) { white-space: pre-wrap; }
    :where(blockquote) { border-inline-start: 2px solid ${borderColor}; margin-inline-start: 0; padding-inline-start: 0.75em; color: ${mutedColor}; }
    :where(img) { max-width: 100%; height: auto; }
    :where(hr) { border: 0; border-top: 1px solid ${borderColor}; }
    :where(*:last-child) { margin-bottom: 0; }
  `;
}

/**
 * Whether the markup is a whole document rather than a fragment: it opens, past
 * any whitespace and comments, on a doctype, an `<html>` or a `<head>`. A
 * method that renders a printable page (a quote, an invoice) usually writes the
 * whole document, with its own head, styles and print rules.
 */
export function isWholeDocument(markup: string): boolean {
  return /^\s*(?:<!--[\s\S]*?-->\s*)*<(?:!doctype\b|html[\s>]|head[\s>])/i.test(markup);
}

export interface FrameDocumentOptions {
  styles: string;
  imgSrc: string;
  fontSrc: string;
}

/**
 * The whole frame document. The policy rides a `<meta>` because a `srcdoc`
 * document has no response to carry a header.
 *
 * ## A whole document is continued, not nested
 *
 * A fragment goes into a `<body>` of ours. A whole document used to go there
 * too, so its doctype, `<html>` and `<head>` landed inside our body, where the
 * parser drops them and leaves its styles and title in the body. Now our head
 * is written first and the document follows it as it is. The HTML parser,
 * having closed our head, treats what comes next as the rest of ONE document:
 * the second doctype and `<head>` tag are ignored, the `<html>` tag's
 * attributes (`lang`) are moved onto the root, and every `<meta>`, `<link>`,
 * `<style>` and `<title>` the document's head holds is put into our head, after
 * ours. So the policy meta is the first thing in the head whatever the markup
 * says, which a `<meta>` CSP needs (it governs only what follows it), and no
 * string search for the document's `<head>` is needed, which a comment holding
 * the text `<head>` would have fooled into writing the policy inside the
 * comment.
 *
 * The page's own stylesheet comes after ours and so wins.
 * The stated `css_class` wraps a fragment only, since a document has its own
 * body.
 */
export function frameDocument(
  content: HtmlContentView,
  { styles, imgSrc, fontSrc }: FrameDocumentOptions,
): string {
  const head = [
    '<!doctype html><html><head><meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src ${imgSrc}; font-src ${fontSrc}; base-uri 'none'; form-action 'none'">`,
    `<style>${styles}</style></head>`,
  ].join('');
  if (isWholeDocument(content.innerHtml)) return head + content.innerHtml;
  const body = content.cssClass
    ? // The class the value states, honoured the way the runtime's own HTML
      // rendering honours it: as a wrapper, not as something merged into ours.
      `<div class="${escapeAttribute(content.cssClass)}">${content.innerHtml}</div>`
    : content.innerHtml;
  return `${head}<body>${body}</body></html>`;
}

/** A class name is written into an attribute, so its quotes must not close it. */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
