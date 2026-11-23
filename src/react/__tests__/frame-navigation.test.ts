import { afterEach, describe, expect, it, vi } from 'vitest';
import { rewriteNavigation } from '../frame-navigation';

/**
 * The rewrite that keeps a framed page's links from moving its frame
 * (`frame-navigation.ts`). Where each rewritten link then goes, in a real
 * engine, is the `Outputs/Html navigation` stories' question; this suite pins
 * the markup the frame is given.
 */

const BASE = 'https://host.example/app/results/42';

function parse(markup: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template.content;
}

function rewritten(markup: string, options: Parameters<typeof rewriteNavigation>[1] = {}) {
  return parse(rewriteNavigation(markup, { baseUrl: BASE, ...options }));
}

describe('rewriteNavigation: links that leave the page', () => {
  it('sends an HTML link to a new tab with no opener and no referrer', () => {
    const link = rewritten('<a href="https://remote.example/x">x</a>').querySelector('a')!;
    expect(link.getAttribute('href')).toBe('https://remote.example/x');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does the same for an image map area', () => {
    const area = rewritten(
      '<map name="m"><area shape="rect" coords="0,0,1,1" href="https://remote.example/a" alt="a"></map>',
    ).querySelector('area')!;
    expect(area.getAttribute('target')).toBe('_blank');
    expect(area.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does the same for an SVG link, by href and by xlink:href', () => {
    const fragment = rewritten(
      '<svg><a id="plain" href="https://remote.example/p"><text>p</text></a><a id="xlink" xlink:href="https://remote.example/x"><text>x</text></a></svg>',
    );
    const plain = fragment.querySelector('#plain')!;
    const xlink = fragment.querySelector('#xlink')!;
    expect(plain.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(plain.getAttribute('target')).toBe('_blank');
    expect(plain.getAttribute('rel')).toBe('noopener noreferrer');
    expect(xlink.getAttribute('xlink:href')).toBe('https://remote.example/x');
    expect(xlink.getAttribute('target')).toBe('_blank');
  });

  it('keeps http:, https: and mailto:', () => {
    const fragment = rewritten(
      '<a id="h" href="http://remote.example/">h</a><a id="s" href="https://remote.example/">s</a><a id="m" href="mailto:desk@example.com">m</a>',
    );
    expect(fragment.querySelector('#h')!.getAttribute('href')).toBe('http://remote.example/');
    expect(fragment.querySelector('#s')!.getAttribute('href')).toBe('https://remote.example/');
    expect(fragment.querySelector('#m')!.getAttribute('href')).toBe('mailto:desk@example.com');
  });

  it.each([
    ['tel:', 'tel:+33100000000'],
    ['ftp:', 'ftp://files.example/report.pdf'],
    ['javascript:', 'javascript:alert(1)'],
    ['a custom scheme', 'someapp://open/42'],
  ])('drops a %s link and keeps its words', (_name, href) => {
    const link = rewritten(`<p>Call <a href="${href}">the desk</a>.</p>`).querySelector('a')!;
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.textContent).toBe('the desk');
  });

  it('resolves a relative link against the base', () => {
    const fragment = rewritten('<a id="root" href="/account">a</a><a id="near" href="other">b</a>');
    expect(fragment.querySelector('#root')!.getAttribute('href')).toBe(
      'https://host.example/account',
    );
    expect(fragment.querySelector('#near')!.getAttribute('href')).toBe(
      'https://host.example/app/results/other',
    );
  });

  it('resolves against the host document when no base is given', () => {
    const link = parse(rewriteNavigation('<a href="/account">a</a>')).querySelector('a')!;
    expect(link.getAttribute('href')).toBe(new URL('/account', document.baseURI).href);
  });

  it.each(['_self', '_top', '_parent', 'named-frame'])(
    'replaces a link’s own target="%s" with _blank',
    (target) => {
      const link = rewritten(
        `<a href="https://remote.example/" target="${target}">x</a>`,
      ).querySelector('a')!;
      expect(link.getAttribute('target')).toBe('_blank');
    },
  );

  it('replaces a link’s own rel and drops its ping', () => {
    const link = rewritten(
      '<a href="https://remote.example/" rel="opener" ping="https://tracker.example/">x</a>',
    ).querySelector('a')!;
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.hasAttribute('ping')).toBe(false);
  });
});

describe('rewriteNavigation: links within the page', () => {
  it('points an in-page link at the frame document and keeps it in the frame', () => {
    const link = rewritten('<a href="#findings">Findings</a>').querySelector('a')!;
    expect(link.getAttribute('href')).toBe('about:srcdoc#findings');
    expect(link.getAttribute('target')).toBe('_self');
  });

  it('keeps an in-page link that already names the frame document', () => {
    const link = rewritten('<a href="about:srcdoc#top">Top</a>').querySelector('a')!;
    expect(link.getAttribute('href')).toBe('about:srcdoc#top');
    expect(link.getAttribute('target')).toBe('_self');
  });

  it('leaves an in-page link as written for a page that prints', () => {
    const link = rewritten('<a href="#findings">Findings</a>', {
      inPageLinks: 'document',
    }).querySelector('a')!;
    expect(link.getAttribute('href')).toBe('#findings');
    expect(link.hasAttribute('target')).toBe(false);
  });

  it('leaves a link with no href alone', () => {
    const markup = '<a name="anchor">here</a>';
    expect(rewriteNavigation(markup, { baseUrl: BASE })).toBe(markup);
  });
});

describe('rewriteNavigation: meta refresh', () => {
  it('removes a meta refresh in a fragment, in any letter case', () => {
    const fragment = rewritten(
      '<meta http-equiv="REFRESH" content="0;url=https://remote.example/"><meta http-equiv=" Refresh " content="1"><p>x</p>',
    );
    expect(fragment.querySelector('meta')).toBeNull();
    expect(fragment.querySelector('p')!.textContent).toBe('x');
  });

  it('removes a meta refresh from a whole document’s head and keeps its other metas', () => {
    const page = rewriteNavigation(
      '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta http-equiv="Refresh" content="0;url=/secret"><title>Devis</title></head><body><p>x</p></body></html>',
      { baseUrl: BASE },
    );
    const doc = new DOMParser().parseFromString(page, 'text/html');
    expect(doc.querySelector('meta[http-equiv]')).toBeNull();
    expect(doc.querySelector('meta[charset]')).not.toBeNull();
    expect(doc.title).toBe('Devis');
  });
});

describe('rewriteNavigation: what it leaves as it was', () => {
  it('returns markup with nothing to rewrite as the very same string', () => {
    const markup = '<p>No <b>links</b> here.</p>';
    expect(rewriteNavigation(markup, { baseUrl: BASE })).toBe(markup);
  });

  it('serialises a whole document otherwise unchanged', () => {
    const page =
      '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Devis</title><style>p { color: red; }</style></head><body><p class="x">Voir <a href="https://remote.example/">la source</a>.</p></body></html>';
    expect(rewriteNavigation(page, { baseUrl: BASE })).toBe(
      page.replace(
        '<a href="https://remote.example/">',
        '<a href="https://remote.example/" target="_blank" rel="noopener noreferrer">',
      ),
    );
  });

  it('returns the markup as given where there is no DOMParser', () => {
    vi.stubGlobal('DOMParser', undefined);
    const markup = '<meta http-equiv="refresh" content="0;url=https://remote.example/">';
    expect(rewriteNavigation(markup, { baseUrl: BASE })).toBe(markup);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
