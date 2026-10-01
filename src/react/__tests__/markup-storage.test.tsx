/**
 * The `pipelex-storage://` references inside an HTML page, resolved through the
 * host before the page is framed, made into a PDF or saved as HTML.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RunField, SaveFile, TextRunField } from '../../core';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { HtmlPreview } from '../html-preview';
import { renderHtmlPdf } from '../html-pdf';
import {
  resolveHtmlStorageUrls,
  rewriteStorageRefs,
  storageRefsIn,
  MARKUP_RESOLVE_TIMEOUT_MS,
} from '../markup-storage';
import { ResultEnvProvider } from '../result-env';
import { StuffViewer } from '../stuff-viewer';

vi.mock('../html-pdf', () => ({ renderHtmlPdf: vi.fn() }));
const renderPdf = vi.mocked(renderHtmlPdf);
const resolvePdf = () =>
  renderPdf.mockResolvedValue({
    blob: new Blob(['%PDF-1.3 fake'], { type: 'application/pdf' }),
    pageCount: 1,
    page: { width: 794, height: 1123, margin: { top: 38, right: 38, bottom: 38, left: 38 } },
  });
resolvePdf();

afterEach(() => {
  vi.useRealTimers();
  renderPdf.mockReset();
  resolvePdf();
});

const PHOTO = 'pipelex-storage://runs/r1/photo.png';
const LOGO = 'pipelex-storage://runs/r1/logo.png';
const SIGNED = (ref: string) => `https://cdn.example/${ref.split('/').pop()}?sig=1`;

const QUOTE = `<!DOCTYPE html>
<html lang="fr">
<head><title>Devis</title><style>.hero{background:url('${LOGO}')}</style></head>
<body class="quote">
<!-- <img src="${LOGO}"> in a comment is not a picture -->
<h1>DEVIS</h1>
<img src="${PHOTO}" alt="montre">
<IMG SRC='${PHOTO}' alt="encore">
<p>Texte qui cite ${LOGO} sans le charger.</p>
</body>
</html>`;

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const signAll = (ref: string) => SIGNED(ref);

describe('reading the references a page names', () => {
  it('finds each distinct picture reference once, in document order, and nothing else', () => {
    expect(storageRefsIn(QUOTE)).toEqual([LOGO, PHOTO]);
  });

  it('reads srcset candidates, style attributes and <style> url()s', () => {
    const markup = `<img srcset="${PHOTO} 1x, https://cdn.example/b.png 2x"><div style="background-image: url(${LOGO})"></div>`;
    expect(storageRefsIn(markup)).toEqual([PHOTO, LOGO]);
  });

  it('finds nothing in markup that names no reference', () => {
    expect(storageRefsIn('<img src="https://cdn.example/a.png">')).toEqual([]);
  });
});

describe('rewriting them', () => {
  it('replaces every picture reference, and leaves text and comments alone', () => {
    const out = rewriteStorageRefs(QUOTE, signAll);
    const doc = parse(out);
    expect(Array.from(doc.images, (img) => img.getAttribute('src'))).toEqual([
      SIGNED(PHOTO),
      SIGNED(PHOTO),
    ]);
    expect(doc.querySelector('style')?.textContent).toContain(`url("${SIGNED(LOGO)}")`);
    expect(doc.body.textContent).toContain(`cite ${LOGO} sans`);
    expect(out).toContain(`<!-- <img src="${LOGO}">`);
  });

  it('keeps a whole document whole: its doctype, its language, its head', () => {
    const out = rewriteStorageRefs(QUOTE, signAll);
    expect(out.startsWith('<!DOCTYPE html>')).toBe(true);
    const doc = parse(out);
    expect(doc.documentElement.getAttribute('lang')).toBe('fr');
    expect(doc.title).toBe('Devis');
    expect(doc.body.className).toBe('quote');
  });

  it('keeps a fragment a fragment, a leading <style> included', () => {
    const out = rewriteStorageRefs(`<style>p{}</style><p><img src="${PHOTO}"></p>`, signAll);
    expect(out).toBe(`<style>p{}</style><p><img src="${SIGNED(PHOTO)}"></p>`);
  });

  it('rewrites srcset candidates with their descriptors', () => {
    const out = rewriteStorageRefs(
      `<img srcset="${PHOTO} 1x, https://cdn.example/b.png 2x">`,
      signAll,
    );
    expect(out).toBe(`<img srcset="${SIGNED(PHOTO)} 1x, https://cdn.example/b.png 2x">`);
  });

  it('leaves an unanswered reference as it was, and returns the same string when nothing changed', () => {
    const markup = `<img src="${PHOTO}">`;
    expect(rewriteStorageRefs(markup, () => undefined)).toBe(markup);
  });
});

describe('resolveHtmlStorageUrls', () => {
  it('asks a bulk resolver once, with the distinct references, and reads a Map', async () => {
    const resolveUrls = vi.fn(
      async (uris: readonly string[]) => new Map(uris.map((u) => [u, SIGNED(u)])),
    );
    const out = await resolveHtmlStorageUrls(QUOTE, { resolveUrls });
    expect(resolveUrls).toHaveBeenCalledTimes(1);
    expect(resolveUrls.mock.calls[0]![0]).toEqual([LOGO, PHOTO]);
    expect(parse(out).images[0]!.getAttribute('src')).toBe(SIGNED(PHOTO));
  });

  it('reads a plain record, and asks resolveUrl for what the bulk answer left out', async () => {
    const out = await resolveHtmlStorageUrls(QUOTE, {
      resolveUrls: async () => ({ [PHOTO]: SIGNED(PHOTO), [LOGO]: null }),
      resolveUrl: (ref) => `/api/assets/${ref.split('/').pop()}`,
    });
    expect(parse(out).images[0]!.getAttribute('src')).toBe(SIGNED(PHOTO));
    expect(out).toContain('url("/api/assets/logo.png")');
  });

  it('runs every answer through the URL gate', async () => {
    const out = await resolveHtmlStorageUrls(`<img src="${PHOTO}">`, {
      resolveUrls: async () => ({ [PHOTO]: 'javascript:alert(1)' }),
    });
    expect(out).toBe(`<img src="${PHOTO}">`);
  });

  it('falls back to resolveUrl when the bulk resolver rejects, and never rejects itself', async () => {
    const out = await resolveHtmlStorageUrls(`<img src="${PHOTO}">`, {
      resolveUrls: () => Promise.reject(new Error('down')),
      resolveUrl: SIGNED,
    });
    expect(out).toBe(`<img src="${SIGNED(PHOTO)}">`);
    await expect(
      resolveHtmlStorageUrls(`<img src="${PHOTO}">`, {
        resolveUrl: () => {
          throw new Error('boom');
        },
      }),
    ).resolves.toBe(`<img src="${PHOTO}">`);
  });

  it('stops waiting on a bulk resolver after its timeout', async () => {
    const out = await resolveHtmlStorageUrls(
      `<img src="${PHOTO}">`,
      { resolveUrls: () => new Promise(() => undefined) },
      { timeoutMs: 10 },
    );
    expect(out).toBe(`<img src="${PHOTO}">`);
  });
});

const srcdocOf = () => screen.getByTitle('HTML result').getAttribute('srcdoc') ?? '';

describe('the preview', () => {
  it('shows a short loading state, then the page with its pictures resolved', async () => {
    let answer: ((map: Map<string, string>) => void) | undefined;
    render(
      <ResultEnvProvider
        resolveUrls={() =>
          new Promise((resolve) => {
            answer = resolve;
          })
        }
      >
        <HtmlPreview content={{ innerHtml: QUOTE }} downloadPdf={false} />
      </ResultEnvProvider>,
    );
    expect(screen.getByRole('status').textContent).toBe(S.pageLoading);
    expect(screen.queryByTitle('HTML result')).toBeNull();
    await waitFor(() => expect(answer).toBeDefined());
    act(() => answer!(new Map([[PHOTO, SIGNED(PHOTO)]])));
    await waitFor(() => expect(srcdocOf()).toContain(SIGNED(PHOTO)));
    expect(srcdocOf()).not.toContain(`src="${PHOTO}"`);
  });

  it('resolves through the synchronous resolveUrl when no bulk resolver is given', async () => {
    render(
      <ResultEnvProvider resolveUrl={SIGNED}>
        <HtmlPreview content={{ innerHtml: QUOTE }} downloadPdf={false} />
      </ResultEnvProvider>,
    );
    await waitFor(() => expect(srcdocOf()).toContain(SIGNED(PHOTO)));
  });

  it('shows the page, pictures broken, when the bulk resolver never answers', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <ResultEnvProvider resolveUrls={() => new Promise(() => undefined)}>
        <HtmlPreview content={{ innerHtml: QUOTE }} downloadPdf={false} />
      </ResultEnvProvider>,
    );
    expect(screen.queryByTitle('HTML result')).toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(MARKUP_RESOLVE_TIMEOUT_MS);
    });
    await waitFor(() => expect(srcdocOf()).toContain(`src="${PHOTO}"`));
  });

  it('frames a page at once when the host gives no resolver', () => {
    render(<HtmlPreview content={{ innerHtml: QUOTE }} downloadPdf={false} />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(srcdocOf()).toContain(`src="${PHOTO}"`);
  });
});

/** A delivery that records what it was handed, in place of the browser's. */
function recorder() {
  const saved: SaveFile[] = [];
  const saveFiles = vi.fn(async (files: readonly SaveFile[]) => {
    saved.push(...files);
    return { failed: [] };
  });
  return { saved, saveFiles };
}

const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const page: RunField = {
  kind: 'object',
  name: 'quote',
  conceptRef: 'native.Html',
  required: true,
  fields: [text('inner_html'), text('css_class')],
};
const VALUE = { inner_html: QUOTE, css_class: null };

describe('the downloads', () => {
  it('makes the PDF from the page with its pictures resolved at the click', async () => {
    const resolveUrls = vi.fn(
      async (uris: readonly string[]) => new Map(uris.map((u) => [u, SIGNED(u)])),
    );
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider resolveUrls={resolveUrls} saveFiles={saveFiles}>
        <StuffViewer field={page} value={VALUE} />
      </ResultEnvProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: S.downloadPdf }));
    await waitFor(() => expect(saved).toHaveLength(1));
    const [content] = renderPdf.mock.calls[0]!;
    expect(parse(content.innerHtml).images[0]!.getAttribute('src')).toBe(SIGNED(PHOTO));
  });

  it('saves the page’s HTML with its pictures resolved', async () => {
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider resolveUrl={SIGNED} saveFiles={saveFiles}>
        <StuffViewer field={page} value={VALUE} />
      </ResultEnvProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: S.downloadHtml }));
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]!.mimeType).toBe('text/html');
    expect(parse(saved[0]!.text!).images[0]!.getAttribute('src')).toBe(SIGNED(PHOTO));
  });
});
