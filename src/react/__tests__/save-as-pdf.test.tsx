/**
 * "Save as PDF" on an HTML page: where the control is drawn, the switch that
 * hides it, its words, and what it asks `printHtml` for. The print itself (the
 * copy's sandbox, its fonts and images, the title the dialog reads) needs a
 * real browser, and `Outputs/Html page` drives it in Chromium.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ObjectRunField, RunField, TextRunField } from '../../core';
import { DEFAULT_FIELD_STRINGS as S, FieldStringsProvider } from '../field-strings';
import { HtmlPreview } from '../html-preview';
import { FR_FIELD_STRINGS } from '../locales/fr';
import { printHtml } from '../print-html';
import { ResultEnvProvider } from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';

vi.mock('../print-html', () => ({ printHtml: vi.fn(async () => undefined) }));
const print = vi.mocked(printHtml);

afterEach(() => {
  print.mockReset();
  print.mockResolvedValue(undefined);
});

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

const pdfButtons = () => screen.queryAllByRole('button', { name: S.saveAsPdf });

describe('the control on a result that is one page', () => {
  it('is drawn by default, once', () => {
    render(<StuffViewer field={page('quote')} value={VALUE} />);
    expect(pdfButtons()).toHaveLength(1);
  });

  it('proposes the panel’s download base name as the PDF’s', async () => {
    render(
      <StuffViewer
        field={page('quote')}
        value={VALUE}
        downloadBaseName="Devis 250883-1 HAMI THOMAS"
      />,
    );
    await userEvent.click(pdfButtons()[0]!);
    expect(print).toHaveBeenCalledTimes(1);
    const [content, options] = print.mock.calls[0]!;
    expect(content).toEqual({ innerHtml: QUOTE, cssClass: undefined });
    expect(options?.title).toBe('Devis 250883-1 HAMI THOMAS');
  });

  it('falls back to the panel’s name, as the page’s download does', async () => {
    render(<StuffViewer field={page('quote')} value={VALUE} name="devis" />);
    await userEvent.click(pdfButtons()[0]!);
    expect(print.mock.calls[0]![1]?.title).toBe('devis');
  });

  it('names a page inside a structure by its place, as its download does', async () => {
    const report: ObjectRunField = {
      kind: 'object',
      name: 'output',
      conceptRef: 'demo.Report',
      required: true,
      fields: [page('summary'), text('title')],
    };
    render(
      <StuffViewer
        field={report}
        value={{ summary: VALUE, title: 'Q3' }}
        downloadBaseName="report"
      />,
    );
    await userEvent.click(pdfButtons()[0]!);
    expect(print.mock.calls[0]![1]?.title).toBe('report-summary');
  });

  it('says so when the browser did not open its dialog', async () => {
    print.mockRejectedValueOnce(new Error('refused'));
    render(<StuffViewer field={page('quote')} value={VALUE} />);
    await userEvent.click(pdfButtons()[0]!);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: S.saveAsPdf })).toHaveAttribute(
        'title',
        S.saveAsPdfFailed,
      ),
    );
    const button = screen.getByRole('button', { name: S.saveAsPdf });
    const status = document.getElementById(button.getAttribute('aria-describedby')!);
    expect(status).toHaveTextContent(S.saveAsPdfFailed);
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

  it('draws one control row: the title, the PDF and one download', () => {
    const { container } = render(<StuffViewer field={refined} value={VALUE} name="devis" />);
    expect(pdfButtons()).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /download/i })).toHaveLength(1);
    expect(screen.getByRole('button', { name: S.download })).toBeTruthy();
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
    expect(screen.getAllByRole('button', { name: FR_FIELD_STRINGS.saveAsPdf })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: FR_FIELD_STRINGS.download })).toHaveLength(1);
  });

  it('draws the one download when only the page’s file button is asked for', () => {
    render(
      <StuffViewer
        field={refined}
        value={VALUE}
        downloads={{ result: false, files: ['markup'] }}
      />,
    );
    expect(screen.getAllByRole('button', { name: S.download })).toHaveLength(1);
  });

  it('draws no download when neither is asked for', () => {
    render(
      <StuffViewer field={refined} value={VALUE} downloads={{ result: false, files: false }} />,
    );
    expect(screen.queryByRole('button', { name: S.download })).toBeNull();
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
    expect(screen.getByRole('button', { name: S.download })).toBeTruthy();
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
    render(<HtmlPreview content={{ innerHtml: QUOTE }} pdfFileName="Devis 7" fontSrc="'self'" />);
    await userEvent.click(pdfButtons()[0]!);
    expect(print.mock.calls[0]![1]).toMatchObject({ title: 'Devis 7', fontSrc: "'self'" });
  });

  it('HtmlPreview hides it on request, and under the provider’s switch', () => {
    const { unmount } = render(<HtmlPreview content={{ innerHtml: QUOTE }} saveAsPdf={false} />);
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
    expect(screen.getByRole('button', { name: 'Enregistrer en PDF' })).toBeTruthy();
  });
});
