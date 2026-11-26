/**
 * The PDF a host makes of a Word, Excel or PowerPoint file, drawn page by page
 * when its link cannot be framed.
 *
 * A host whose view runs in a chat host's sandboxed frame answers its PDF at a
 * presigned link on a storage bucket's host, which the frame rule refuses. With
 * the bytes seam (`loadBytes`) and a pdf.js worker (`pdfWorker`), the view asks
 * the seam with the answer's own `url` and draws the pages, as it draws a
 * stored PDF the frame refused; without either it reads the answer as
 * `unavailable`, as it always did. A host that answers on its own origin keeps
 * its frame.
 *
 * jsdom has no canvas, so react-pdf is replaced at the module boundary by a
 * stand-in that loads every document it is handed, or fails to parse it when
 * told to; `pdf-pages.test.tsx` pins the renderer itself.
 */
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FileRunField } from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { PDF_PAGES_MAX_BYTES } from '../pdf-pages';
import {
  ResultEnvProvider,
  type AskDocumentPdf,
  type DocumentPdfAnswer,
  type LoadBytes,
  type PdfWorkerConfig,
  type ResolveDocumentPdf,
} from '../result-env';
import { StuffViewer } from '../stuff-viewer';
import { hostFiles, served, stored } from './host-files';

const pdf = vi.hoisted(() => ({
  load: 'success' as 'success' | 'failure',
  documents: 0,
}));

vi.mock('react-pdf', async () => {
  const { useEffect } = await import('react');
  function Document(props: {
    children?: ReactNode;
    onLoadSuccess?: (document: unknown) => void;
    onLoadError?: (error: Error) => void;
  }) {
    useEffect(() => {
      pdf.documents += 1;
      if (pdf.load === 'success') {
        props.onLoadSuccess?.({
          numPages: 2,
          loadingTask: { destroy: async () => {} },
          getPage: async () => ({ getViewport: () => ({ width: 100, height: 141 }) }),
        });
      } else {
        props.onLoadError?.(new Error('Invalid PDF structure.'));
      }
    }, []);
    return <div data-testid="pdf-document">{props.children}</div>;
  }
  function Page(props: { pageNumber: number }) {
    return <div data-testid="pdf-page" data-page={props.pageNumber} />;
  }
  class PDFWorker {
    static create() {
      return new PDFWorker();
    }
    destroy() {}
  }
  return {
    Document,
    Page,
    pdfjs: {
      version: '6.5.438',
      GlobalWorkerOptions: { workerSrc: 'pdf.worker.mjs' },
      PDFWorker,
    },
  };
});

const documentField: FileRunField = {
  kind: 'document',
  name: 'output',
  conceptRef: 'native.Document',
  required: true,
  formats: formatsForKind('document'),
};

const PPTX = {
  url: stored('deck.pptx'),
  filename: 'deck.pptx',
  mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  title: 'Quarterly review',
};

/** The host's PDF of the deck, at a presigned link on its bucket: another origin. */
const PRESIGNED = 'https://bucket.example.com/org/deck.pptx.pdf?X-Amz-Signature=abc';
const BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
/** A worker the host started itself, so the renderer starts none. */
const WORKER: PdfWorkerConfig = { workerPort: { postMessage() {} } as unknown as Worker };

/** A host whose ask returns each answer in turn, holding the last one. */
function answering(...answers: DocumentPdfAnswer[]) {
  const ask = vi.fn<AskDocumentPdf>(() => {
    const answer = answers.length > 1 ? answers.shift()! : answers[0]!;
    return Promise.resolve(answer);
  });
  const resolve = vi.fn<ResolveDocumentPdf>(() => () => ask());
  return { ask, resolve };
}

function viewer({
  resolveDocumentPdf,
  loadBytes,
  pdfWorker = WORKER,
  presentation = 'studio',
}: {
  resolveDocumentPdf: ResolveDocumentPdf;
  loadBytes?: LoadBytes;
  pdfWorker?: PdfWorkerConfig;
  presentation?: FieldPresentation;
}) {
  return (
    <FieldPresentationProvider presentation={presentation}>
      <ResultEnvProvider
        resolveUrl={hostFiles}
        resolveDocumentPdf={resolveDocumentPdf}
        loadBytes={loadBytes}
        pdfWorker={pdfWorker}
      >
        <StuffViewer field={documentField} value={PPTX} />
      </ResultEnvProvider>
    </FieldPresentationProvider>
  );
}

const pagesRegion = () => screen.queryByRole('group', { name: 'Quarterly review' });
const previewToggle = () => screen.queryByRole('button', { name: S.preview });
const frame = () => window.document.querySelector('iframe');

beforeEach(() => {
  pdf.load = 'success';
  pdf.documents = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('a ready answer the frame rule refuses, under a host that answers its bytes', () => {
  it('is drawn page by page from the bytes, asked with the answer’s own url', async () => {
    const { resolve } = answering({ state: 'ready', url: PRESIGNED });
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(viewer({ resolveDocumentPdf: resolve, loadBytes }));
    const region = await screen.findByRole('group', { name: 'Quarterly review' });
    await waitFor(() => expect(screen.getAllByTestId('pdf-page')).toHaveLength(2));
    expect(region).toHaveClass('mthds-pdf-pages', 'h-112');
    expect(frame()).toBeNull();
    expect(loadBytes).toHaveBeenCalledTimes(1);
    expect(loadBytes).toHaveBeenCalledWith(PRESIGNED, {
      maxBytes: PDF_PAGES_MAX_BYTES,
      signal: expect.any(AbortSignal),
    });
    expect(screen.queryByText(S.documentPdfUnavailable)).toBeNull();
    // The original stays the file the result holds: its name and its toggle.
    expect(screen.getByRole('link', { name: 'deck.pptx' })).toBeTruthy();
    expect(previewToggle()).toHaveAttribute('aria-expanded', 'true');
  });

  it('is drawn at a page’s size, with no toggle, as the whole result in an app', async () => {
    const { resolve } = answering({ state: 'ready', url: PRESIGNED });
    render(
      viewer({ resolveDocumentPdf: resolve, loadBytes: async () => BYTES, presentation: 'app' }),
    );
    const region = await screen.findByRole('group', { name: 'Quarterly review' });
    expect(region).toHaveClass('aspect-[1/1.414]');
    expect(previewToggle()).toBeNull();
  });

  it('folds away on a failure that may pass, and asks the host and the seam again on unfold', async () => {
    const { ask, resolve } = answering({ state: 'ready', url: PRESIGNED });
    const loadBytes = vi
      .fn<LoadBytes>()
      .mockRejectedValueOnce(new Error('connection dropped'))
      .mockResolvedValue(BYTES);
    render(viewer({ resolveDocumentPdf: resolve, loadBytes }));
    await waitFor(() => expect(previewToggle()).toHaveAttribute('aria-expanded', 'false'));
    expect(pagesRegion()).toBeNull();
    expect(ask).toHaveBeenCalledTimes(1);

    fireEvent.click(previewToggle()!);
    await screen.findByRole('group', { name: 'Quarterly review' });
    expect(ask).toHaveBeenCalledTimes(2);
    expect(loadBytes).toHaveBeenCalledTimes(2);
  });

  it('shows a toggle for that failure even as the whole result in an app', async () => {
    const { resolve } = answering({ state: 'ready', url: PRESIGNED });
    const loadBytes = vi
      .fn<LoadBytes>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(BYTES);
    render(viewer({ resolveDocumentPdf: resolve, loadBytes, presentation: 'app' }));
    await waitFor(() => expect(previewToggle()).toHaveAttribute('aria-expanded', 'false'));
    fireEvent.click(previewToggle()!);
    const region = await screen.findByRole('group', { name: 'Quarterly review' });
    expect(region).toHaveClass('aspect-[1/1.414]');
    expect(previewToggle()).toBeNull();
  });

  it.each<[string, () => LoadBytes]>([
    ['bytes past the ceiling', () => async () => new Uint8Array(PDF_PAGES_MAX_BYTES + 1)],
    [
      'a PDF pdf.js refuses',
      () => {
        pdf.load = 'failure';
        return async () => BYTES;
      },
    ],
  ])('keeps the document’s link alone for %s, and asks no more', async (_, seam) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { ask, resolve } = answering({ state: 'ready', url: PRESIGNED });
    const loadBytes = vi.fn(seam());
    render(viewer({ resolveDocumentPdf: resolve, loadBytes }));
    await waitFor(() => expect(previewToggle()).toBeNull());
    expect(pagesRegion()).toBeNull();
    expect(screen.queryByText(S.documentPdfPreparing)).toBeNull();
    expect(screen.getByRole('link', { name: 'deck.pptx' })).toBeTruthy();
    expect(ask).toHaveBeenCalledTimes(1);
    expect(loadBytes).toHaveBeenCalledTimes(1);
  });
});

describe('what stays as it was', () => {
  it('reads a refused answer as unavailable when the host supplies no bytes seam', async () => {
    const { resolve } = answering({ state: 'ready', url: PRESIGNED });
    render(viewer({ resolveDocumentPdf: resolve }));
    expect(await screen.findByText(S.documentPdfUnavailable)).toBeTruthy();
    expect(pagesRegion()).toBeNull();
    expect(frame()).toBeNull();
  });

  it('reads a refused answer as unavailable when the host names no worker', async () => {
    const { resolve } = answering({ state: 'ready', url: PRESIGNED });
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(viewer({ resolveDocumentPdf: resolve, loadBytes, pdfWorker: { workerSrc: ' ' } }));
    expect(await screen.findByText(S.documentPdfUnavailable)).toBeTruthy();
    expect(loadBytes).not.toHaveBeenCalled();
  });

  it('reads an answer the URL gate refuses as unavailable, and never asks the seam', async () => {
    for (const url of ['javascript:alert(1)', 'ftp://bucket.example.com/deck.pdf']) {
      const { resolve } = answering({ state: 'ready', url });
      const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
      const { unmount } = render(viewer({ resolveDocumentPdf: resolve, loadBytes }));
      expect(await screen.findByText(S.documentPdfUnavailable)).toBeTruthy();
      expect(loadBytes).not.toHaveBeenCalled();
      unmount();
    }
  });

  it('frames an answer on the page’s own origin, and never asks the seam', async () => {
    const { resolve } = answering({ state: 'ready', url: served('deck.pdf') });
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(viewer({ resolveDocumentPdf: resolve, loadBytes }));
    await waitFor(() => expect(frame()).toHaveAttribute('src', served('deck.pdf')));
    expect(pagesRegion()).toBeNull();
    expect(loadBytes).not.toHaveBeenCalled();
  });
});
