/**
 * "Download PDF" on an HTML page: where the control is drawn, the switch that
 * hides it, its words, what it asks `renderHtmlPdf` for and what it hands the
 * save delivery. Making the PDF itself (the copy, its print rules, the raster,
 * the pages) needs a real browser, and `Outputs/Html page` drives it in
 * Chromium.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ObjectRunField, RunField, SaveFile, TextRunField } from '../../core';
import { DEFAULT_FIELD_STRINGS as S, FieldStringsProvider } from '../field-strings';
import { HtmlPreview } from '../html-preview';
import { renderHtmlPdf } from '../html-pdf';
import { FR_FIELD_STRINGS } from '../locales/fr';
import { ResultEnvProvider } from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';

vi.mock('../html-pdf', () => ({ renderHtmlPdf: vi.fn() }));
const renderPdf = vi.mocked(renderHtmlPdf);
const PDF = new Blob(['%PDF-1.3 fake'], { type: 'application/pdf' });
const resolvePdf = () =>
  renderPdf.mockResolvedValue({
    blob: PDF,
    pageCount: 1,
    page: { width: 794, height: 1123, margin: { top: 38, right: 38, bottom: 38, left: 38 } },
  });
resolvePdf();

afterEach(() => {
  renderPdf.mockReset();
  resolvePdf();
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
const page = (name: string): RunField => ({
  kind: 'object',
  name,
  conceptRef: 'native.Html',
  required: true,
  fields: [text('inner_html'), text('css_class')],
});
const QUOTE = '<!doctype html><html><head><title>x</title></head><body>Devis</body></html>';
const VALUE = { inner_html: QUOTE, css_class: null };

const pdfButtons = () => screen.queryAllByRole('button', { name: S.downloadPdf });

describe('the control on a result that is one page', () => {
  it('is drawn by default, once', () => {
    render(<StuffViewer field={page('quote')} value={VALUE} />);
    expect(pdfButtons()).toHaveLength(1);
  });

  it('saves <downloadBaseName>.pdf through the delivery, in one click', async () => {
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer
          field={page('quote')}
          value={VALUE}
          downloadBaseName="Devis 250883-1 HAMI THOMAS"
        />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButtons()[0]!);
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(renderPdf).toHaveBeenCalledTimes(1);
    const [content, options] = renderPdf.mock.calls[0]!;
    expect(content).toEqual({ innerHtml: QUOTE, cssClass: undefined });
    expect(options?.title).toBe('Devis 250883-1 HAMI THOMAS');
    expect(saved[0]).toMatchObject({
      name: 'Devis 250883-1 HAMI THOMAS.pdf',
      mimeType: 'application/pdf',
      kind: 'markup',
      path: 'quote',
    });
    // A data: URL, which a delivery in another frame can read.
    expect(saved[0]!.url).toMatch(/^data:application\/pdf;base64,/);
  });

  it('is busy while the PDF is made', async () => {
    let finish: (() => void) | undefined;
    renderPdf.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = () =>
            resolve({
              blob: PDF,
              pageCount: 1,
              page: { width: 1, height: 1, margin: { top: 0, right: 0, bottom: 0, left: 0 } },
            });
        }),
    );
    const { saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer field={page('quote')} value={VALUE} />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButtons()[0]!);
    const busy = screen.getByRole('button', { name: S.downloadPdfBusy });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    finish!();
    await waitFor(() => expect(pdfButtons()[0]).toBeEnabled());
    expect(saveFiles).toHaveBeenCalledTimes(1);
  });

  it('falls back to the panel’s name, as the page’s download does', async () => {
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer field={page('quote')} value={VALUE} name="devis" />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButtons()[0]!);
    await waitFor(() => expect(saved[0]?.name).toBe('devis.pdf'));
  });

  it('names a page inside a structure by its place, as its download does', async () => {
    const report: ObjectRunField = {
      kind: 'object',
      name: 'output',
      conceptRef: 'demo.Report',
      required: true,
      fields: [page('summary'), text('title')],
    };
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer
          field={report}
          value={{ summary: VALUE, title: 'Q3' }}
          downloadBaseName="report"
        />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButtons()[0]!);
    await waitFor(() => expect(saved[0]?.name).toBe('report-summary.pdf'));
    expect(saved[0]?.path).toBe('output.summary');
  });

  it('says so when the PDF could not be made', async () => {
    renderPdf.mockRejectedValueOnce(new Error('no canvas'));
    render(<StuffViewer field={page('quote')} value={VALUE} />);
    await userEvent.click(pdfButtons()[0]!);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: S.downloadPdf })).toHaveAttribute(
        'title',
        S.downloadPdfFailed,
      ),
    );
    const button = screen.getByRole('button', { name: S.downloadPdf });
    const status = document.getElementById(button.getAttribute('aria-describedby')!);
    expect(status).toHaveTextContent(S.downloadPdfFailed);
  });

  it('says so when the delivery did not hand it over', async () => {
    const saveFiles = vi.fn(async (files: readonly SaveFile[]) => ({
      failed: files.map((file) => ({ file })),
    }));
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer field={page('quote')} value={VALUE} />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButtons()[0]!);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: S.downloadPdf })).toHaveAttribute(
        'title',
        S.downloadPdfFailed,
      ),
    );
  });
});

describe('a result that is one page', () => {
  const refined: RunField = {
    kind: 'object',
    name: 'output',
    conceptRef: 'quotes.ClientQuote',
    refines: ['native.Html'],
    required: true,
    fields: [text('inner_html'), text('css_class')],
  };

  it('draws one control row: the title, the PDF and one HTML download', () => {
    const { container } = render(<StuffViewer field={refined} value={VALUE} name="devis" />);
    expect(pdfButtons()).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /download/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: S.downloadHtml })).toBeTruthy();
    // The page's own row, which saved the same file, is not drawn.
    expect(screen.queryByRole('button', { name: S.downloadFile('devis.html') })).toBeNull();
    // And the page has no box around it.
    const box = container.querySelector('[data-html-page]')!;
    expect(box.className).not.toContain('border');
  });

  it('reads the refinement off the descriptor, in French', () => {
    render(
      <FieldStringsProvider locale="fr">
        <StuffViewer field={refined} value={VALUE} name="devis_client" />
      </FieldStringsProvider>,
    );
    expect(screen.getAllByRole('button', { name: FR_FIELD_STRINGS.downloadPdf })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: FR_FIELD_STRINGS.downloadHtml })).toHaveLength(1);
  });

  it('draws the one download when only the page’s file button is asked for', () => {
    render(
      <StuffViewer
        field={refined}
        value={VALUE}
        downloads={{ result: false, files: ['markup'] }}
      />,
    );
    expect(screen.getAllByRole('button', { name: S.downloadHtml })).toHaveLength(1);
  });

  it('draws no download when neither is asked for', () => {
    render(
      <StuffViewer field={refined} value={VALUE} downloads={{ result: false, files: false }} />,
    );
    expect(screen.queryByRole('button', { name: S.downloadHtml })).toBeNull();
    expect(pdfButtons()).toHaveLength(1);
  });

  it('keeps the page’s own row for a page inside a structure', () => {
    const report: ObjectRunField = {
      kind: 'object',
      name: 'output',
      conceptRef: 'demo.Report',
      required: true,
      fields: [page('summary'), text('title')],
    };
    render(
      <StuffViewer field={report} value={{ summary: VALUE, title: 'Q3' }} downloadBaseName="r" />,
    );
    expect(screen.getByRole('button', { name: S.downloadFile('r-summary.html') })).toBeTruthy();
  });
});

describe('the switch', () => {
  it('hides it on the provider, with the downloads left as they are', () => {
    render(
      <ResultEnvProvider downloads={{ pdf: false }}>
        <StuffViewer field={page('quote')} value={VALUE} />
      </ResultEnvProvider>,
    );
    expect(pdfButtons()).toHaveLength(0);
    expect(screen.getByRole('button', { name: S.downloadHtml })).toBeTruthy();
  });

  it('hides it on one panel, key by key over the provider', () => {
    render(
      <ResultEnvProvider downloads={{ files: false }}>
        <StuffViewer field={page('quote')} value={VALUE} downloads={{ pdf: false }} />
        <StuffViewer field={page('other')} value={VALUE} />
      </ResultEnvProvider>,
    );
    expect(pdfButtons()).toHaveLength(1);
    expect(screen.queryByRole('button', { name: S.downloadFile('quote.html') })).toBeNull();
  });

  it('is not drawn on a result that carries no markup', () => {
    render(<ResultField field={page('quote')} value={{ css_class: 'x' }} />);
    expect(pdfButtons()).toHaveLength(0);
  });
});

describe('a page outside a result', () => {
  it('HtmlPreview draws it, under the name the host passes', async () => {
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <HtmlPreview content={{ innerHtml: QUOTE }} pdfFileName="Devis 7" fontSrc="'self'" />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButtons()[0]!);
    await waitFor(() => expect(saved[0]?.name).toBe('Devis 7.pdf'));
    expect(renderPdf.mock.calls[0]![1]).toMatchObject({ title: 'Devis 7', fontSrc: "'self'" });
  });

  it('HtmlPreview hides it on request, and under the provider’s switch', () => {
    const { unmount } = render(<HtmlPreview content={{ innerHtml: QUOTE }} downloadPdf={false} />);
    expect(pdfButtons()).toHaveLength(0);
    unmount();
    render(
      <ResultEnvProvider downloads={{ pdf: false }}>
        <HtmlPreview content={{ innerHtml: QUOTE }} />
      </ResultEnvProvider>,
    );
    expect(pdfButtons()).toHaveLength(0);
  });
});

describe('its words', () => {
  it('reads French under the French pack', () => {
    render(
      <FieldStringsProvider strings={FR_FIELD_STRINGS}>
        <StuffViewer field={page('quote')} value={VALUE} />
      </FieldStringsProvider>,
    );
    expect(screen.getByRole('button', { name: 'Télécharger le PDF' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Télécharger le HTML' })).toBeTruthy();
  });
});
