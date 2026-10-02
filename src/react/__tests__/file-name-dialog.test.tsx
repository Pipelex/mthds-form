/**
 * Asking for a download's name first (`downloads.askFileName`): the dialog
 * itself — prefilled and selected, Enter and the button confirming, Escape,
 * the backdrop and Cancel cancelling, focus kept inside and handed back — and
 * that the chosen name reaches the plan a host's save function receives from
 * every download control: the PDF, a file's own button, and the whole-result
 * download for one file and for several.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField, ObjectRunField, RunField, TextRunField } from '../../core';
import { IMAGE_FORMATS } from '../../core/file-formats';
import type { SaveFile } from '../../core/save-plan';
import { DEFAULT_FIELD_STRINGS as S, FieldStringsProvider } from '../field-strings';
import { renderHtmlPdf } from '../html-pdf';
import { FR_FIELD_STRINGS as FR } from '../locales/fr';
import { ResultEnvProvider, type DownloadDisplay } from '../result-env';
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
  renderPdf.mockReset();
  resolvePdf();
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
const image = (name: string): FileRunField => ({
  kind: 'image',
  name,
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
});
const report: ObjectRunField = {
  kind: 'object',
  name: 'output',
  conceptRef: 'demo.Report',
  required: true,
  fields: [image('figure'), text('title')],
};
const QUOTE = { inner_html: '<p>Devis</p>', css_class: null };
const REPORT = { figure: { url: 'https://cdn.example/a.png' }, title: 'Q3' };

function recorder() {
  const saved: SaveFile[][] = [];
  const saveFiles = vi.fn(async (files: readonly SaveFile[]) => {
    saved.push([...files]);
    return { failed: [] };
  });
  return { saved, saveFiles };
}

function Quote({
  downloads = { askFileName: true },
  saveFiles,
}: {
  downloads?: DownloadDisplay;
  saveFiles: ReturnType<typeof recorder>['saveFiles'];
}) {
  return (
    <ResultEnvProvider saveFiles={saveFiles} downloads={downloads}>
      <StuffViewer field={page('quote')} value={QUOTE} downloadBaseName="Devis Q-2026-0042" />
    </ResultEnvProvider>
  );
}

const dialog = () => screen.queryByRole('dialog', { name: S.fileNameTitle });
const field = () => screen.getByRole('textbox', { name: S.fileNameTitle });
const pdfButton = () => screen.getByRole('button', { name: S.downloadPdf });

describe('the dialog', () => {
  it('opens on the planned name without its extension, focused and selected', async () => {
    const { saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(pdfButton());
    const box = dialog();
    expect(box).not.toBeNull();
    expect(box).toHaveAttribute('aria-modal', 'true');
    const input = field() as HTMLInputElement;
    expect(input.value).toBe('Devis Q-2026-0042');
    expect(input).toHaveFocus();
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, input.value.length]);
    // The extension is a fixed suffix, outside the field, and describes it.
    expect(input).toHaveAccessibleDescription('.pdf');
    expect(saveFiles).not.toHaveBeenCalled();
    expect(renderPdf).not.toHaveBeenCalled();
  });

  it('confirms with Enter, saving under the typed name with the extension kept', async () => {
    const { saved, saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(pdfButton());
    await userEvent.keyboard('Devis client{Enter}');
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]![0]!.name).toBe('Devis client.pdf');
    // The PDF is made under the chosen name, not renamed after the fact.
    expect(renderPdf.mock.calls[0]![1]?.title).toBe('Devis client');
    expect(dialog()).toBeNull();
  });

  it('confirms with its Download button', async () => {
    const { saved, saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(pdfButton());
    await userEvent.clear(field());
    await userEvent.type(field(), 'Q3');
    await userEvent.click(screen.getByRole('button', { name: S.fileNameConfirm }));
    await waitFor(() => expect(saved[0]?.[0]?.name).toBe('Q3.pdf'));
  });

  it.each([
    ['Escape', async () => userEvent.keyboard('{Escape}')],
    [
      'its Cancel button',
      async () => userEvent.click(screen.getByRole('button', { name: S.fileNameCancel })),
    ],
    [
      'a click on the backdrop',
      async () => {
        const backdrop = document.querySelector('[data-file-name-backdrop]')!;
        fireEvent.mouseDown(backdrop);
        fireEvent.click(backdrop);
      },
    ],
  ])('cancels on %s, saving nothing and handing focus back', async (_how, cancel) => {
    const { saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(pdfButton());
    await cancel();
    expect(dialog()).toBeNull();
    expect(pdfButton()).toHaveFocus();
    expect(saveFiles).not.toHaveBeenCalled();
    expect(renderPdf).not.toHaveBeenCalled();
  });

  it('does not cancel on a drag from the field released over the backdrop', async () => {
    const { saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(pdfButton());
    fireEvent.mouseDown(field());
    fireEvent.click(document.querySelector('[data-file-name-backdrop]')!);
    expect(dialog()).not.toBeNull();
  });

  it('keeps focus inside: Tab from the last control returns to the field', async () => {
    const { saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(pdfButton());
    await userEvent.tab();
    expect(screen.getByRole('button', { name: S.fileNameCancel })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: S.fileNameConfirm })).toHaveFocus();
    await userEvent.tab();
    expect(field()).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: S.fileNameConfirm })).toHaveFocus();
  });

  it.each([
    ['Devis 12/2026', 'Devis 12-2026.pdf'],
    ['a\\b:c*d?e"f<g>h|i', 'a-b-c-d-e-f-g-h-i.pdf'],
    ['  ..cachée.  ', 'cachée.pdf'],
    ['devis.PDF', 'devis.pdf'],
    ['tab\there', 'tabhere.pdf'],
    ['   ', 'Devis Q-2026-0042.pdf'],
    ['', 'Devis Q-2026-0042.pdf'],
  ])('makes %j safe, as %j', async (typed, saved_) => {
    const { saved, saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(pdfButton());
    fireEvent.change(field(), { target: { value: typed } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    await waitFor(() => expect(saved[0]?.[0]?.name).toBe(saved_));
  });

  it('speaks French under the French strings', async () => {
    const { saveFiles } = recorder();
    render(
      <FieldStringsProvider strings={FR}>
        <Quote saveFiles={saveFiles} />
      </FieldStringsProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: FR.downloadPdf }));
    expect(screen.getByRole('dialog', { name: 'Nom du fichier' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Nom du fichier' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Télécharger' })).toBeInTheDocument();
  });
});

describe('the setting', () => {
  it('is off by default: one click saves, with no dialog', async () => {
    const { saved, saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} downloads={{}} />);
    await userEvent.click(pdfButton());
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(dialog()).toBeNull();
    expect(saved[0]![0]!.name).toBe('Devis Q-2026-0042.pdf');
  });

  it('is laid over the provider by one panel, key by key', async () => {
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles} downloads={{ askFileName: true }}>
        <StuffViewer
          field={page('quote')}
          value={QUOTE}
          name="a"
          downloads={{ askFileName: false }}
        />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButton());
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(dialog()).toBeNull();
  });

  it('can be turned on by one panel alone', async () => {
    const { saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer
          field={page('quote')}
          value={QUOTE}
          name="a"
          downloads={{ askFileName: true }}
        />
      </ResultEnvProvider>,
    );
    await userEvent.click(pdfButton());
    expect(dialog()).not.toBeNull();
  });
});

describe('every download control asks, and the name reaches the plan', () => {
  it("the page's HTML download, which is the whole result as one file", async () => {
    const { saved, saveFiles } = recorder();
    render(<Quote saveFiles={saveFiles} />);
    await userEvent.click(screen.getByRole('button', { name: S.downloadHtml }));
    expect(field()).toHaveValue('Devis Q-2026-0042');
    expect(field()).toHaveAccessibleDescription('.html');
    await userEvent.keyboard('Devis final{Enter}');
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]!.map((file) => file.name)).toEqual(['Devis final.html']);
  });

  it("a file's own button, keeping the extension its plan chose", async () => {
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles} downloads={{ askFileName: true }}>
        <StuffViewer field={report} value={REPORT} name="report" />
      </ResultEnvProvider>,
    );
    await userEvent.click(
      screen.getByRole('button', { name: S.downloadFile('report-figure.png') }),
    );
    expect(field()).toHaveValue('report-figure');
    expect(field()).toHaveAccessibleDescription('.png');
    await userEvent.keyboard('graphique{Enter}');
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toEqual([
      expect.objectContaining({ name: 'graphique.png', url: 'https://cdn.example/a.png' }),
    ]);
  });

  it('the whole-result download of several files, renaming the name they share', async () => {
    const { saved, saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles} downloads={{ askFileName: true }}>
        <StuffViewer field={report} value={REPORT} name="report" />
      </ResultEnvProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: S.download }));
    expect(field()).toHaveValue('report');
    // No suffix: the name is shared by files of more than one type.
    expect(field()).not.toHaveAccessibleDescription();
    await userEvent.keyboard('trimestre{Enter}');
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]!.map((file) => file.name)).toEqual(['trimestre-figure.png', 'trimestre.json']);
  });

  it('a cancelled whole-result download saves nothing and never shows as downloading', async () => {
    const { saveFiles } = recorder();
    render(
      <ResultEnvProvider saveFiles={saveFiles} downloads={{ askFileName: true }}>
        <StuffViewer field={report} value={REPORT} name="report" />
      </ResultEnvProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: S.download }));
    expect(screen.queryByText(S.downloading)).toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(saveFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: S.download })).toHaveFocus();
  });
});
