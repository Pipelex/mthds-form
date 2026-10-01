import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { HtmlPreview } from '../html-preview';
import { DEFAULT_IMG_SRC, frameDocument, isWholeDocument } from '../html-frame';

/**
 * The frame document a `native.Html` result is shown in. The parse below is
 * the HTML parser's own (jsdom's is parse5, which follows the specification's
 * tree construction), so what it builds is what a browser builds.
 */
const OPTIONS = { styles: 'body{}', imgSrc: DEFAULT_IMG_SRC, fontSrc: DEFAULT_IMG_SRC };

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const policyOf = (doc: Document) =>
  doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') ?? '';

const QUOTE = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Devis 250883-1</title>
  <style>@font-face{font-family:'Calibri';src:url(/fonts/calibri-regular.woff2) format('woff2')}
  body{font-family:'Calibri';margin:12mm} @media print{.no-print{display:none}}</style>
</head>
<body class="quote"><h1>DEVIS N° 250883-1</h1><p>Montant : 1 200 €</p></body>
</html>`;

describe('isWholeDocument', () => {
  it('reads a doctype, an <html> or a <head> as a whole document, past whitespace and comments', () => {
    expect(isWholeDocument(QUOTE)).toBe(true);
    expect(isWholeDocument('  <html><body>x</body></html>')).toBe(true);
    expect(isWholeDocument('<!-- generated --><!doctype html><p>x</p>')).toBe(true);
    expect(isWholeDocument('<head><title>x</title></head><p>x</p>')).toBe(true);
  });

  it('reads anything else as a fragment', () => {
    expect(isWholeDocument('<h2>Invoice</h2>')).toBe(false);
    expect(isWholeDocument('<header>x</header>')).toBe(false);
    expect(isWholeDocument('<p>see <html> below</p>')).toBe(false);
  });
});

describe('frameDocument over a whole document', () => {
  it('continues the document rather than nesting it in a body of ours', () => {
    const doc = parse(frameDocument({ innerHtml: QUOTE }, OPTIONS));
    // The document's head content is in the ONE head, after ours.
    const head = doc.head;
    expect(head.querySelector('meta[http-equiv="Content-Security-Policy"]')).toBeTruthy();
    const styles = Array.from(head.querySelectorAll('style'), (style) => style.textContent);
    expect(styles).toHaveLength(2);
    expect(styles[0]).toBe('body{}');
    expect(styles[1]).toContain('@media print');
    expect(doc.body.querySelector('style, title, meta')).toBeNull();
    // The root keeps the document's language, and its body keeps its class.
    expect(doc.documentElement.getAttribute('lang')).toBe('fr');
    expect(doc.body.className).toBe('quote');
    expect(doc.body.querySelector('h1')?.textContent).toBe('DEVIS N° 250883-1');
  });

  it('puts the policy before anything the document says', () => {
    // A `<meta>` policy governs only what follows it.
    const doc = parse(frameDocument({ innerHtml: QUOTE }, OPTIONS));
    const policy = doc.head.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const firstStyle = doc.head.querySelector('style');
    expect(policy!.compareDocumentPosition(firstStyle!) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('is not fooled by a comment that mentions <head>', () => {
    // A string search for the document's head would have written the policy
    // into the comment, where it governs nothing.
    const doc = parse(
      frameDocument({ innerHtml: `<!-- <head> --><!doctype html><head></head><p>x</p>` }, OPTIONS),
    );
    expect(policyOf(doc)).toContain("default-src 'none'");
  });

  it('gives the print copy its title ahead of the document’s own', () => {
    const doc = parse(frameDocument({ innerHtml: QUOTE }, { ...OPTIONS, title: 'Devis A&B <1>' }));
    expect(doc.title).toBe('Devis A&B <1>');
  });

  it('wraps a fragment in the stated class, and a whole document not at all', () => {
    const fragment = parse(frameDocument({ innerHtml: '<p>x</p>', cssClass: 'invoice' }, OPTIONS));
    expect(fragment.body.firstElementChild?.className).toBe('invoice');
    const page = parse(frameDocument({ innerHtml: QUOTE, cssClass: 'invoice' }, OPTIONS));
    expect(page.querySelector('.invoice')).toBeNull();
  });
});

describe('the frame policy', () => {
  it('allows fonts from where it allows images by default', () => {
    const { container } = render(<HtmlPreview content={{ innerHtml: '<p>x</p>' }} />);
    const policy = policyOf(parse(container.querySelector('iframe')!.getAttribute('srcdoc')!));
    expect(policy).toContain(`img-src ${DEFAULT_IMG_SRC};`);
    expect(policy).toContain(`font-src ${DEFAULT_IMG_SRC};`);
    // Still nothing else: no script, no fetch, no form.
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("form-action 'none'");
  });

  it('follows imgSrc, and takes fontSrc over it', () => {
    const narrowed = render(<HtmlPreview content={{ innerHtml: '<p>x</p>' }} imgSrc="data:" />);
    expect(
      policyOf(parse(narrowed.container.querySelector('iframe')!.getAttribute('srcdoc')!)),
    ).toContain('font-src data:;');
    const own = render(
      <HtmlPreview content={{ innerHtml: '<p>x</p>' }} imgSrc="data:" fontSrc="'self'" />,
    );
    expect(
      policyOf(parse(own.container.querySelector('iframe')!.getAttribute('srcdoc')!)),
    ).toContain("font-src 'self';");
  });

  it('keeps the frame sandboxed without scripts', () => {
    const { container } = render(<HtmlPreview content={{ innerHtml: QUOTE }} />);
    expect(container.querySelector('iframe')!.getAttribute('sandbox')).toBe('allow-same-origin');
  });
});

describe('a whole document on screen', () => {
  it('is shown as a page: edge to edge, on white, with no height limit', () => {
    const { container } = render(<HtmlPreview content={{ innerHtml: QUOTE }} />);
    const box = container.querySelector<HTMLElement>('[data-html-page]');
    expect(box).toBeTruthy();
    expect(box!.className).toContain('bg-white');
    expect(box!.className).not.toContain('px-3.5');
    expect(container.querySelector('iframe')!.style.maxHeight).toBe('');
  });

  it('keeps a fragment in the themed preview box with its limit', () => {
    const { container } = render(<HtmlPreview content={{ innerHtml: '<p>x</p>' }} />);
    expect(container.querySelector('[data-html-page]')).toBeNull();
    expect(container.querySelector('iframe')!.style.maxHeight).toBe('1400px');
  });
});
