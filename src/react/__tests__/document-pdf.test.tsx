/**
 * A document the browser cannot render, shown as the PDF its host makes of it.
 *
 * The first half is the promise to every other host: a viewer whose host does
 * not answer draws exactly what it drew before the seam existed. The second is
 * the seam itself: the toggle, the question asked when the preview opens, and
 * each state the host can answer. The preview opens on the reader's click
 * everywhere but one place, which is the third half: the document the run
 * delivered, in `app` (the whole result, or a whole-result record's only
 * document), whose preview opens at once, so it is asked for as it mounts.
 */
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { FileRunField, ObjectRunField, SaveFiles, TextRunField } from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { DOCUMENT_PDF_ASK_TIMEOUT_MS, DOCUMENT_PDF_PREPARING_LIMIT_MS } from '../document-pdf';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import {
  ResultEnvProvider,
  type AskDocumentPdf,
  type DocumentPdfAnswer,
  type ResolveDocumentPdf,
} from '../result-env';
import { StuffViewer } from '../stuff-viewer';

const document = (name: string): FileRunField => ({
  kind: 'document',
  name,
  conceptRef: 'native.Document',
  required: true,
  formats: formatsForKind('document'),
});
const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const report: ObjectRunField = {
  kind: 'object',
  name: 'output',
  conceptRef: 'demo.Report',
  required: true,
  fields: [text('title'), document('source')],
};

const DOCX = {
  url: 'pipelex-storage://org/contract.docx',
  public_url: 'https://cdn.example/contract.docx',
  filename: 'contract.docx',
  mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  title: 'Supply agreement',
};
const PDF = {
  url: 'https://cdn.example/report.pdf',
  filename: 'report.pdf',
  mime_type: 'application/pdf',
  title: 'Quarterly report',
};
const PPTX = {
  url: 'pipelex-storage://org/deck.pptx',
  public_url: 'https://cdn.example/deck.pptx',
  filename: 'deck.pptx',
  mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  title: 'Quarterly review',
};
const READY: DocumentPdfAnswer = { state: 'ready', url: 'https://cdn.example/contract.pdf' };

function setPdfViewer(enabled: boolean) {
  Object.defineProperty(window.navigator, 'pdfViewerEnabled', {
    configurable: true,
    get: () => enabled,
  });
}

function inPresentation(presentation: FieldPresentation, node: ReactNode) {
  return <FieldPresentationProvider presentation={presentation}>{node}</FieldPresentationProvider>;
}

/** A viewer of `value` under a host answering with `resolveDocumentPdf`. */
function viewer(
  resolveDocumentPdf: ResolveDocumentPdf | undefined,
  value: unknown = DOCX,
  presentation: FieldPresentation = 'studio',
  field: FileRunField | ObjectRunField = document('output'),
) {
  return inPresentation(
    presentation,
    <ResultEnvProvider resolveDocumentPdf={resolveDocumentPdf}>
      <StuffViewer field={field} value={value} />
    </ResultEnvProvider>,
  );
}

/**
 * A host whose ask returns each answer in turn, holding the last one. Its
 * resolver hands over a new function on every call, as a host writing it inline
 * does, and `ask` counts the questions across all of them.
 */
function answering(...answers: DocumentPdfAnswer[]) {
  const ask = vi.fn<AskDocumentPdf>(() => {
    const answer = answers.length > 1 ? answers.shift()! : answers[0]!;
    return Promise.resolve(answer);
  });
  const resolve = vi.fn<ResolveDocumentPdf>(() => () => ask());
  return { ask, resolve };
}

const previewToggle = () => screen.queryByRole('button', { name: S.preview });
/** Whether a frame, or the box holding its place, takes a page's size or a toggle's 28rem. */
const sizeOf = (element: Element | null | undefined) =>
  element?.className.includes('aspect-[1/1.414]')
    ? 'page'
    : element?.className.includes('h-112')
      ? 'nested'
      : undefined;
const frame = (container: HTMLElement) => container.querySelector('iframe');
/** Through `window`, because this file's `document` builds a field. */
const focused = () => window.document.activeElement;
/** The live region saying `words`: a panel holds empty ones for its downloads' reports too. */
const statusSaying = (words: string) => screen.getByText(words).closest('[role="status"]');

/** Lets the promises already settled run, and the timers due by `ms` fire. */
const elapse = (ms = 0) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

/** `useId`'s values differ between two roots, and are not what is being compared. */
const markup = (container: HTMLElement) =>
  container.innerHTML.replace(/\b(id|aria-labelledby|aria-describedby|for)="[^"]*"/g, '');

beforeEach(() => {
  vi.useFakeTimers();
  setPdfViewer(true);
});

afterEach(() => {
  vi.useRealTimers();
  delete (window.navigator as { pdfViewerEnabled?: boolean }).pdfViewerEnabled;
});

describe('a viewer whose host does not answer behaves as today', () => {
  it('offers a .docx no preview, with no function and with one answering nothing', () => {
    const today = render(<StuffViewer field={document('output')} value={DOCX} />);
    expect(previewToggle()).toBeNull();
    expect(frame(today.container)).toBeNull();
    const before = markup(today.container);
    today.unmount();

    const noFunction = render(viewer(undefined));
    expect(previewToggle()).toBeNull();
    expect(markup(noFunction.container)).toBe(before);
    noFunction.unmount();

    const resolve = vi.fn<ResolveDocumentPdf>(() => undefined);
    const answersNothing = render(viewer(resolve));
    expect(resolve).toHaveBeenCalled();
    expect(previewToggle()).toBeNull();
    expect(frame(answersNothing.container)).toBeNull();
    expect(markup(answersNothing.container)).toBe(before);
  });

  it('leaves a document the browser can render alone, and never asks about it', () => {
    const { ask, resolve } = answering(READY);
    const { container } = render(viewer(resolve, PDF, 'app'));
    expect(resolve).not.toHaveBeenCalled();
    expect(ask).not.toHaveBeenCalled();
    expect(frame(container)?.getAttribute('src')).toBe(PDF.url);
  });

  it('never asks about a PDF it cannot frame, which a PDF of it would not help', () => {
    const { resolve } = answering(READY);
    render(
      viewer(resolve, {
        url: 'pipelex-storage://org/report.pdf',
        mime_type: 'application/pdf',
      }),
    );
    expect(resolve).not.toHaveBeenCalled();
    expect(previewToggle()).toBeNull();
  });
});

describe('a host that answers a PDF', () => {
  it('offers a toggle, closed, and asks nothing until a reader opens it', async () => {
    const { ask, resolve } = answering(READY);
    const { container } = render(viewer(resolve));
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(frame(container)).toBeNull();
    await elapse(60_000);
    expect(ask).not.toHaveBeenCalled();
  });

  it('asks with the document’s own reference and what the payload declares', () => {
    const { resolve } = answering(READY);
    render(viewer(resolve));
    expect(resolve).toHaveBeenCalledWith(DOCX.url, {
      filename: DOCX.filename,
      mimeType: DOCX.mime_type,
    });
  });

  it('asks about any document the browser cannot render, keeping no list of formats', () => {
    for (const filename of ['a.docx', 'a.xlsx', 'a.pptx', 'a.doc', 'a.xls', 'a.ppt', 'a.odt']) {
      const { resolve } = answering(READY);
      const { unmount } = render(viewer(resolve, { url: `https://cdn.example/${filename}` }));
      expect(previewToggle(), filename).toBeTruthy();
      unmount();
    }
    for (const filename of ['a.ods', 'a.odp']) {
      const { resolve } = answering(READY);
      const { unmount } = render(viewer(resolve, { url: 'pipelex-storage://org/a', filename }));
      expect(previewToggle(), filename).toBeTruthy();
      unmount();
    }
  });

  it('opens onto the PDF, framed with no referrer and no sandbox', async () => {
    const { ask, resolve } = answering(READY);
    const { container } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(ask).toHaveBeenCalledTimes(1);
    const shown = frame(container);
    expect(shown?.getAttribute('src')).toBe('https://cdn.example/contract.pdf');
    expect(shown?.getAttribute('title')).toBe(DOCX.title);
    expect(shown?.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(shown?.hasAttribute('sandbox')).toBe(false);
  });

  it('frames a path the host chose, as it does for a resolver', async () => {
    const { resolve } = answering({ state: 'ready', url: '/api/assets/contract.pdf' });
    const { container } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(frame(container)?.getAttribute('src')).toBe('/api/assets/contract.pdf');
  });

  it('keeps the toggle on a whole result in studio, so nothing converts unasked', async () => {
    const { ask, resolve } = answering(READY);
    const { container } = render(viewer(resolve, PPTX, 'studio'));
    await elapse(60_000);
    expect(ask).not.toHaveBeenCalled();
    expect(frame(container)).toBeNull();
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(sizeOf(frame(container))).toBe('nested');
  });

  it('works on a document inside a larger result', async () => {
    const { resolve } = answering(READY);
    const { container } = render(viewer(resolve, { title: 'Q3', source: DOCX }, 'studio', report));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(frame(container)?.getAttribute('src')).toBe('https://cdn.example/contract.pdf');
  });

  it('keeps the original file for the copy control and every download', async () => {
    const { resolve } = answering(READY);
    const saveFiles: SaveFiles = vi.fn(async () => ({ failed: [] }));
    render(
      <ResultEnvProvider resolveDocumentPdf={resolve} saveFiles={saveFiles}>
        <StuffViewer field={document('output')} value={DOCX} />
      </ResultEnvProvider>,
    );
    fireEvent.click(previewToggle()!);
    await elapse();
    fireEvent.click(screen.getByRole('button', { name: S.downloadFile('contract.docx') }));
    await elapse();
    const [files] = vi.mocked(saveFiles).mock.calls[0]!;
    expect(files.map((file) => [file.name, file.url])).toEqual([
      ['contract.docx', DOCX.public_url],
    ]);
  });

  it('shows the same card as any PDF where the browser has no viewer', async () => {
    setPdfViewer(false);
    const { resolve } = answering(READY);
    const { container } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(frame(container)).toBeNull();
    expect(screen.getByText(S.pdfViewerUnavailable)).toBeTruthy();
    // The link is the way to the pages; the download is the file the result holds.
    const link = screen.getByRole('link', { name: S.openInNewTab });
    expect(link.getAttribute('href')).toBe('https://cdn.example/contract.pdf');
    expect(
      within(link.parentElement!).getByRole('button', { name: S.downloadFile('contract.docx') }),
    ).toBeTruthy();
  });
});

describe('while the host prepares the PDF', () => {
  it('says so at once, asks again, and frames the PDF when it is ready', async () => {
    const { ask, resolve } = answering({ state: 'preparing' }, READY);
    const { container } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(ask).toHaveBeenCalledTimes(1);
    expect(statusSaying(S.documentPdfPreparing)).toBeTruthy();
    expect(frame(container)).toBeNull();

    await elapse(1_500);
    expect(ask).toHaveBeenCalledTimes(2);
    expect(frame(container)?.getAttribute('src')).toBe('https://cdn.example/contract.pdf');
    expect(screen.queryByText(S.documentPdfPreparing)).toBeNull();
  });

  it('asks less often as the wait goes on', async () => {
    const { ask, resolve } = answering({ state: 'preparing' });
    render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    await elapse(1_500);
    expect(ask).toHaveBeenCalledTimes(2);
    await elapse(2_249);
    expect(ask).toHaveBeenCalledTimes(2);
    await elapse(1);
    expect(ask).toHaveBeenCalledTimes(3);
  });

  it('stops asking when the reader closes the preview, and asks anew when it reopens', async () => {
    const { ask, resolve } = answering({ state: 'preparing' });
    render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(ask).toHaveBeenCalledTimes(1);
    fireEvent.click(previewToggle()!);
    await elapse(60_000);
    expect(ask).toHaveBeenCalledTimes(1);
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(ask).toHaveBeenCalledTimes(2);
  });

  it('does not restart the asking when a host hands over a new function', async () => {
    const { ask, resolve } = answering({ state: 'preparing' });
    const { rerender } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(ask).toHaveBeenCalledTimes(1);
    rerender(viewer((...args) => resolve(...args)));
    await elapse();
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it('gives up after the limit, and lets the reader try again', async () => {
    const { ask, resolve } = answering({ state: 'preparing' });
    render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse(DOCUMENT_PDF_PREPARING_LIMIT_MS + 1_000);
    expect(screen.getByRole('alert').textContent).toBe(S.documentPdfFailed);
    const asked = ask.mock.calls.length;
    await elapse(60_000);
    expect(ask).toHaveBeenCalledTimes(asked);
    expect(screen.getByRole('button', { name: S.tryAgain })).toBeTruthy();
  });

  it('never lands one document’s answer on the next', async () => {
    let answerFirst: (answer: DocumentPdfAnswer) => void = () => {};
    const first = new Promise<DocumentPdfAnswer>((settle) => {
      answerFirst = settle;
    });
    const resolve: ResolveDocumentPdf = (url) =>
      url === DOCX.url
        ? () => first
        : () => Promise.resolve({ state: 'ready', url: 'https://cdn.example/second.pdf' });
    const second = { ...DOCX, url: 'pipelex-storage://org/second.docx', public_url: undefined };
    const { container, rerender } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    rerender(viewer(resolve, second));
    await elapse();
    answerFirst({ state: 'ready', url: 'https://cdn.example/first.pdf' });
    await elapse();
    expect(frame(container)?.getAttribute('src')).toBe('https://cdn.example/second.pdf');
  });
});

describe('when the host cannot make the PDF', () => {
  it('says so, and asks from the start on Try again', async () => {
    const { ask, resolve } = answering({ state: 'failed' }, READY);
    const { container } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(screen.getByRole('alert').textContent).toBe(S.documentPdfFailed);
    expect(frame(container)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: S.tryAgain }));
    expect(statusSaying(S.documentPdfPreparing)).toBeTruthy();
    await elapse();
    expect(ask).toHaveBeenCalledTimes(2);
    expect(frame(container)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('moves the focus to the preparing region on Try again, as the button goes away', async () => {
    const { resolve } = answering({ state: 'failed' }, { state: 'preparing' });
    render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    const tryAgain = screen.getByRole('button', { name: S.tryAgain });
    tryAgain.focus();
    expect(focused()).toBe(tryAgain);
    fireEvent.click(tryAgain);
    expect(focused()).toBe(statusSaying(S.documentPdfPreparing));
  });

  it('leaves the focus where the reader put it when a poll follows Try again', async () => {
    const { ask, resolve } = answering({ state: 'failed' }, { state: 'preparing' });
    render(viewer(resolve));
    const toggle = previewToggle()!;
    fireEvent.click(toggle);
    await elapse();
    fireEvent.click(screen.getByRole('button', { name: S.tryAgain }));
    await elapse();
    expect(focused()).toBe(statusSaying(S.documentPdfPreparing));
    expect(ask).toHaveBeenCalledTimes(2);
    toggle.focus();
    await elapse(1_500);
    expect(ask).toHaveBeenCalledTimes(3);
    expect(focused()).toBe(toggle);
  });

  it('takes the focus neither when the preview opens nor on a poll', async () => {
    const { ask, resolve } = answering({ state: 'preparing' });
    render(viewer(resolve));
    const toggle = previewToggle()!;
    toggle.focus();
    fireEvent.click(toggle);
    await elapse();
    expect(statusSaying(S.documentPdfPreparing)).toBeTruthy();
    expect(focused()).toBe(toggle);
    await elapse(1_500);
    expect(ask).toHaveBeenCalledTimes(2);
    expect(focused()).toBe(toggle);
  });

  it('shows the host’s own reason when it gives one', async () => {
    const { resolve } = answering({
      state: 'failed',
      message: 'This file is protected by a password.',
    });
    render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(screen.getByRole('alert').textContent).toBe('This file is protected by a password.');
  });

  it('reads an ask that throws, rejects or answers nonsense as a failure', async () => {
    const asks: AskDocumentPdf[] = [
      () => {
        throw new Error('no bridge');
      },
      () => Promise.reject(new Error('offline')),
      () => Promise.resolve({ state: 'done' } as unknown as DocumentPdfAnswer),
      () => Promise.resolve(undefined as unknown as DocumentPdfAnswer),
    ];
    for (const ask of asks) {
      const { unmount } = render(viewer(() => ask));
      fireEvent.click(previewToggle()!);
      await elapse();
      expect(screen.getByRole('alert').textContent).toBe(S.documentPdfFailed);
      unmount();
    }
  });

  // A render that throws rejects `elapse`, so getting past it is the proof that
  // nothing did.
  it.each<[string, unknown]>([
    ['an empty message', { state: 'failed', message: '' }],
    ['a message that is a structure', { state: 'failed', message: { code: 'x' } }],
    ['a URL that is a number', { state: 'ready', url: 123 }],
    ['a URL that is empty', { state: 'ready', url: '' }],
    ['no URL', { state: 'ready' }],
  ])('says it in the package’s own words for %s', async (_, answer) => {
    const { container } = render(viewer(() => () => Promise.resolve(answer as DocumentPdfAnswer)));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(screen.getByRole('alert').textContent).toBe(S.documentPdfFailed);
    expect(screen.getByRole('button', { name: S.tryAgain })).toBeTruthy();
    expect(frame(container)).toBeNull();
  });

  it('reads an ask that never answers as a failure', async () => {
    const resolve: ResolveDocumentPdf = () => () => new Promise<DocumentPdfAnswer>(() => {});
    render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse(DOCUMENT_PDF_ASK_TIMEOUT_MS - 1);
    expect(screen.queryByRole('alert')).toBeNull();
    await elapse(1);
    expect(screen.getByRole('alert').textContent).toBe(S.documentPdfFailed);
  });
});

describe('when the host has no PDF to offer', () => {
  it('says there is no preview, with nothing to try again', async () => {
    const { ask, resolve } = answering({ state: 'unavailable' });
    const { container } = render(viewer(resolve));
    fireEvent.click(previewToggle()!);
    await elapse();
    expect(statusSaying(S.documentPdfUnavailable)).toBeTruthy();
    expect(frame(container)).toBeNull();
    expect(screen.queryByRole('button', { name: S.tryAgain })).toBeNull();
    await elapse(60_000);
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it('frames nothing the URL policy refuses, and reads it the same way', async () => {
    for (const url of ['javascript:alert(1)', 'data:application/pdf;base64,JVBERi0=']) {
      const { resolve } = answering({ state: 'ready', url });
      const { container, unmount } = render(viewer(resolve));
      fireEvent.click(previewToggle()!);
      await elapse();
      expect(frame(container)).toBeNull();
      expect(statusSaying(S.documentPdfUnavailable)).toBeTruthy();
      unmount();
    }
  });
});

describe('the document the run delivered, in app', () => {
  it('asks for the PDF of a whole-result deck as it mounts, with no toggle', async () => {
    const { ask, resolve } = answering({ state: 'preparing' }, READY);
    const { container } = render(viewer(resolve, PPTX, 'app'));
    expect(previewToggle()).toBeNull();
    // Preparing at once, at the size the pages will take.
    const preparing = statusSaying(S.documentPdfPreparing);
    expect(sizeOf(preparing)).toBe('page');
    await elapse();
    expect(ask).toHaveBeenCalledTimes(1);
    await elapse(1_500);
    expect(ask).toHaveBeenCalledTimes(2);
    const shown = frame(container);
    expect(shown?.getAttribute('src')).toBe('https://cdn.example/contract.pdf');
    expect(shown?.getAttribute('title')).toBe(PPTX.title);
    expect(sizeOf(shown)).toBe('page');
    expect(previewToggle()).toBeNull();
  });

  it('holds a page’s size when the conversion fails, and on Try again', async () => {
    const { ask, resolve } = answering({ state: 'failed' }, { state: 'preparing' });
    render(viewer(resolve, PPTX, 'app'));
    await elapse();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe(S.documentPdfFailed);
    expect(sizeOf(alert.parentElement)).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: S.tryAgain }));
    expect(sizeOf(statusSaying(S.documentPdfPreparing))).toBe('page');
    await elapse();
    expect(ask).toHaveBeenCalledTimes(2);
  });

  it('starts again from Preparing for a new file', async () => {
    const resolve: ResolveDocumentPdf = (url) =>
      url === PPTX.url
        ? () => Promise.resolve(READY)
        : () => Promise.resolve({ state: 'preparing' });
    const second = { ...PPTX, url: 'pipelex-storage://org/second.pptx', public_url: undefined };
    const { container, rerender } = render(viewer(resolve, PPTX, 'app'));
    await elapse();
    expect(frame(container)).toBeTruthy();
    rerender(viewer(resolve, second, 'app'));
    await elapse();
    expect(frame(container)).toBeNull();
    expect(statusSaying(S.documentPdfPreparing)).toBeTruthy();
  });

  it('asks for the PDF of a record’s lone document as it mounts, its toggle pressed', async () => {
    const { ask, resolve } = answering({ state: 'preparing' });
    render(viewer(resolve, { title: 'Q3', source: DOCX }, 'app', report));
    const toggle = previewToggle();
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(sizeOf(statusSaying(S.documentPdfPreparing))).toBe('nested');
    await elapse();
    expect(ask).toHaveBeenCalledTimes(1);
    // Folding it away stops the asking, as closing any preview does.
    fireEvent.click(toggle!);
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    await elapse(60_000);
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it('frames a record’s lone document at a toggle’s size once ready', async () => {
    const { resolve } = answering(READY);
    const { container } = render(viewer(resolve, { title: 'Q3', source: DOCX }, 'app', report));
    await elapse();
    expect(sizeOf(frame(container))).toBe('nested');
  });

  it('asks nothing of a record’s lone document in studio', async () => {
    const { ask, resolve } = answering(READY);
    render(viewer(resolve, { title: 'Q3', source: DOCX }, 'studio', report));
    await elapse(60_000);
    expect(ask).not.toHaveBeenCalled();
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('false');
  });

  it('asks nothing of a record holding two documents', async () => {
    const { ask, resolve } = answering(READY);
    const twoDocuments: ObjectRunField = {
      ...report,
      fields: [text('title'), document('source'), document('annex')],
    };
    render(viewer(resolve, { title: 'Q3', source: DOCX, annex: PPTX }, 'app', twoDocuments));
    await elapse(60_000);
    expect(ask).not.toHaveBeenCalled();
    expect(
      screen
        .getAllByRole('button', { name: S.preview })
        .map((toggle) => toggle.getAttribute('aria-expanded')),
    ).toEqual(['false', 'false']);
  });

  it('asks nothing of a list of one deck', async () => {
    const { ask, resolve } = answering(READY);
    render(
      inPresentation(
        'app',
        <ResultEnvProvider resolveDocumentPdf={resolve}>
          <StuffViewer
            field={{
              kind: 'list',
              name: 'output',
              conceptRef: 'native.Document',
              required: true,
              item: document('item'),
            }}
            value={[PPTX]}
          />
        </ResultEnvProvider>,
      ),
    );
    await elapse(60_000);
    expect(ask).not.toHaveBeenCalled();
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('false');
  });
});
