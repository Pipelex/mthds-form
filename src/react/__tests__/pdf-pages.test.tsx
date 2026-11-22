/**
 * A PDF the view draws itself, from bytes its host hands it.
 *
 * The frame rule refuses a document a host resolves onto another origin (a
 * presigned storage link), which is every document a host whose view runs in a
 * chat host's sandboxed frame has. With the bytes seam (`loadBytes`) and a
 * pdf.js worker (`pdfWorker`), such a PDF is drawn page by page, by react-pdf
 * over pdf.js; without either, or whenever drawing fails, it keeps its link,
 * never a blank frame.
 *
 * jsdom has no canvas, so react-pdf is replaced at the module boundary by a
 * stand-in that records what the renderer hands it: the bytes, the options,
 * the security settings, and the worker it points pdf.js at. What a real page
 * looks like is the browser's question, answered by the `Outputs/PDF pages`
 * story.
 */
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FileRunField } from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { PDF_PAGES_MAX_BYTES, PDF_PAGES_MAX_IMAGE_PIXELS } from '../pdf-pages';
import {
  ResultEnvProvider,
  type LoadBytes,
  type OpenExternal,
  type PdfWorkerConfig,
  type ResolveUrl,
} from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';
import { hostFiles, stored } from './host-files';

/** What the stand-in react-pdf saw, and how its document load behaves. */
const pdf = vi.hoisted(() => ({
  version: '6.5.438',
  workerOptions: {
    workerSrc: 'pdf.worker.mjs',
    workerPort: null as unknown,
    rendererSrc: '',
    rendererPorts: [] as unknown[],
  },
  documents: [] as Record<string, unknown>[],
  pages: [] as Record<string, unknown>[],
  load: 'success' as 'success' | 'failure' | 'mismatch',
  numPages: 2,
}));

vi.mock('react-pdf', async () => {
  const { useEffect } = await import('react');
  function Document(props: {
    children?: ReactNode;
    onLoadSuccess?: (document: unknown) => void;
    onLoadError?: (error: Error) => void;
  }) {
    pdf.documents.push(props);
    useEffect(() => {
      if (pdf.load === 'success') {
        props.onLoadSuccess?.({
          numPages: pdf.numPages,
          getPage: async () => ({ getViewport: () => ({ width: 100, height: 141 }) }),
        });
      } else if (pdf.load === 'mismatch') {
        props.onLoadError?.(
          new Error('The API version "6.5.438" does not match the Worker version "6.4.0".'),
        );
      } else {
        props.onLoadError?.(new Error('Invalid PDF structure.'));
      }
      // The stand-in loads once, as react-pdf does for a stable `file`.
    }, []);
    return <div data-testid="pdf-document">{props.children}</div>;
  }
  function Page(props: { pageNumber: number }) {
    pdf.pages.push(props);
    return (
      <div data-testid="pdf-page" data-page={props.pageNumber}>
        <div className="annotationLayer">
          <section className="linkAnnotation">
            <a href="https://example.com/terms">Terms</a>
          </section>
          <section className="linkAnnotation">
            <a href="#page=2">Next page</a>
          </section>
          <section className="linkAnnotation">
            <a href="ftp://example.com/file">An FTP file</a>
          </section>
        </div>
      </div>
    );
  }
  return {
    Document,
    Page,
    pdfjs: { version: pdf.version, GlobalWorkerOptions: pdf.workerOptions },
  };
});

const documentField = (name: string): FileRunField => ({
  kind: 'document',
  name,
  conceptRef: 'native.Document',
  required: true,
  formats: formatsForKind('document'),
});

const PDF = {
  url: stored('report.pdf'),
  filename: 'report.pdf',
  mime_type: 'application/pdf',
  title: 'Quarterly report',
};

/** Where a host whose view cannot frame resolves its file: a presigned link on a bucket. */
const BUCKET = 'https://bucket.example.com/run/report.pdf?X-Amz-Signature=abc';
const presigned: ResolveUrl = (url) => (url.startsWith('pipelex-storage://') ? BUCKET : undefined);

const WORKER: PdfWorkerConfig = { workerSrc: 'https://assets.example.com/pdf.worker.min.mjs' };
const BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

function host({
  presentation = 'studio',
  resolveUrl = presigned,
  loadBytes,
  pdfWorker = WORKER,
  openExternal,
  children,
}: {
  presentation?: FieldPresentation;
  resolveUrl?: ResolveUrl;
  loadBytes?: LoadBytes;
  pdfWorker?: PdfWorkerConfig;
  openExternal?: OpenExternal;
  children: ReactNode;
}) {
  return (
    <FieldPresentationProvider presentation={presentation}>
      <ResultEnvProvider
        resolveUrl={resolveUrl}
        loadBytes={loadBytes}
        pdfWorker={pdfWorker}
        openExternal={openExternal}
      >
        {children}
      </ResultEnvProvider>
    </FieldPresentationProvider>
  );
}

const lastDocument = () => pdf.documents.at(-1) as Record<string, unknown>;

/** The document's own link, which every fallback keeps. */
function expectLink() {
  const link = screen.getByRole('link', { name: 'report.pdf' });
  expect(link).toHaveAttribute('href', BUCKET);
}

/** The document is its name and link: no pages, no loading box, no toggle, no frame. */
async function expectLinkOnly() {
  await waitFor(() => expect(screen.queryByText(S.documentPdfPreparing)).toBeNull());
  expect(screen.queryByRole('group', { name: 'Quarterly report' })).toBeNull();
  expect(screen.queryByRole('button', { name: S.preview })).toBeNull();
  expect(document.querySelector('iframe')).toBeNull();
  expectLink();
}

beforeEach(() => {
  pdf.documents.length = 0;
  pdf.pages.length = 0;
  pdf.load = 'success';
  pdf.numPages = 2;
  pdf.workerOptions.workerSrc = 'pdf.worker.mjs';
  pdf.workerOptions.workerPort = null;
  pdf.workerOptions.rendererSrc = '';
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('a PDF the frame rule refuses, under a host that answers its bytes', () => {
  it('draws its pages in place of the frame, beside its link', async () => {
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(
      host({ loadBytes, children: <ResultField field={documentField('report')} value={PDF} /> }),
    );
    const region = await screen.findByRole('group', { name: 'Quarterly report' });
    await waitFor(() => expect(screen.getAllByTestId('pdf-page')).toHaveLength(2));
    expect(region).toHaveClass('mthds-pdf-pages', 'h-112');
    expect(document.querySelector('iframe')).toBeNull();
    // The same name, link and toggle as a framed document.
    expectLink();
    expect(screen.getByRole('button', { name: S.preview })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('asks the seam with the document’s own url member and the ceiling', async () => {
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(
      host({ loadBytes, children: <ResultField field={documentField('report')} value={PDF} /> }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(loadBytes).toHaveBeenCalledTimes(1);
    expect(loadBytes).toHaveBeenCalledWith(PDF.url, { maxBytes: PDF_PAGES_MAX_BYTES });
  });

  it('shows that it is loading, in a frame-sized box, while the bytes arrive', async () => {
    let answer: (bytes: Uint8Array) => void = () => {};
    const loadBytes: LoadBytes = () => new Promise((resolve) => (answer = resolve));
    render(
      host({ loadBytes, children: <ResultField field={documentField('report')} value={PDF} /> }),
    );
    const status = (await screen.findByText(S.documentPdfPreparing)).closest('[role="status"]');
    expect(status).not.toBeNull();
    expect(status!.parentElement).toHaveClass('h-112');
    await act(async () => answer(BYTES));
    await screen.findByRole('group', { name: 'Quarterly report' });
  });

  it('hands pdf.js a copy of the bytes, never the seam’s own array', async () => {
    const bytes = BYTES.slice();
    render(
      host({
        loadBytes: async () => bytes,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    const { data } = lastDocument().file as { data: Uint8Array };
    expect(data).not.toBe(bytes);
    expect(data.buffer).not.toBe(bytes.buffer);
    expect([...data]).toEqual([...bytes]);
    // pdf.js transferring its copy to the worker would detach that buffer, not
    // the host's, which a host may therefore cache and answer again.
    structuredClone(data, { transfer: [data.buffer] });
    expect(bytes.byteLength).toBe(BYTES.byteLength);
  });

  it('pins the security settings: new-tab links, no forms, no XFA, bounded images', async () => {
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await waitFor(() => expect(pdf.pages.length).toBeGreaterThan(0));
    const props = lastDocument();
    expect(props.externalLinkTarget).toBe('_blank');
    expect(props.externalLinkRel).toBe('noopener noreferrer');
    expect(props.options).toMatchObject({
      enableXfa: false,
      maxImageSize: PDF_PAGES_MAX_IMAGE_PIXELS,
    });
    for (const page of pdf.pages) {
      expect(page.renderForms).toBe(false);
      expect(page.renderTextLayer).toBe(true);
      expect(page.renderAnnotationLayer).toBe(true);
    }
  });

  it('points pdf.js at the host’s worker URL, over react-pdf’s relative default', async () => {
    pdf.workerOptions.workerPort = { stale: true };
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(pdf.workerOptions.workerSrc).toBe(WORKER.workerSrc);
    expect(pdf.workerOptions.workerPort).toBeNull();
    // The renderer source is pdf.js's own business.
    expect(pdf.workerOptions.rendererSrc).toBe('');
  });

  it('hands pdf.js a worker the host started', async () => {
    const port = { postMessage() {} } as unknown as Worker;
    render(
      host({
        loadBytes: async () => BYTES,
        pdfWorker: { workerPort: port },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(pdf.workerOptions.workerPort).toBe(port);
  });

  it('passes the host’s data files through, and none it did not supply', async () => {
    const { unmount } = render(
      host({
        loadBytes: async () => BYTES,
        pdfWorker: {
          ...WORKER,
          cMapUrl: '/pdfjs/cmaps/',
          standardFontDataUrl: '/pdfjs/standard_fonts/',
          wasmUrl: '/pdfjs/wasm/',
          iccUrl: '/pdfjs/iccs/',
        },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(lastDocument().options).toEqual({
      cMapUrl: '/pdfjs/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/pdfjs/standard_fonts/',
      wasmUrl: '/pdfjs/wasm/',
      iccUrl: '/pdfjs/iccs/',
      maxImageSize: PDF_PAGES_MAX_IMAGE_PIXELS,
      enableXfa: false,
    });
    unmount();
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(lastDocument().options).toEqual({
      maxImageSize: PDF_PAGES_MAX_IMAGE_PIXELS,
      enableXfa: false,
    });
  });

  it('is the whole result in an app at a page’s size, with no toggle', async () => {
    render(
      host({
        presentation: 'app',
        loadBytes: async () => BYTES,
        children: <StuffViewer field={documentField('output')} value={PDF} />,
      }),
    );
    const region = await screen.findByRole('group', { name: 'Quarterly report' });
    expect(region).toHaveClass('aspect-[1/1.414]', 'max-h-[80vh]');
    expect(screen.queryByRole('button', { name: S.preview })).toBeNull();
  });

  it('folds away from its toggle and asks again when unfolded', async () => {
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(
      host({ loadBytes, children: <ResultField field={documentField('report')} value={PDF} /> }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    fireEvent.click(screen.getByRole('button', { name: S.preview }));
    expect(screen.queryByRole('group', { name: 'Quarterly report' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: S.preview }));
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(loadBytes).toHaveBeenCalledTimes(2);
  });
});

describe('only the pages near the visible part of the frame are drawn', () => {
  let observed: { target: Element; callback: IntersectionObserverCallback }[] = [];
  beforeEach(() => {
    observed = [];
    class StubObserver {
      constructor(private readonly callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        observed.push({ target, callback: this.callback });
      }
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', StubObserver);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('draws a page as it nears the view and lets it go as it leaves', async () => {
    pdf.numPages = 40;
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await waitFor(() => expect(observed).toHaveLength(40));
    expect(screen.queryAllByTestId('pdf-page')).toHaveLength(0);
    const near = (index: number, isIntersecting: boolean) =>
      act(() => {
        const { target, callback } = observed[index]!;
        callback(
          [{ target, isIntersecting } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });
    near(0, true);
    near(1, true);
    expect(screen.getAllByTestId('pdf-page').map((page) => page.dataset.page)).toEqual(['1', '2']);
    near(0, false);
    expect(screen.getAllByTestId('pdf-page').map((page) => page.dataset.page)).toEqual(['2']);
  });
});

describe('a link inside the PDF', () => {
  it('goes through the host when it offers a way out', async () => {
    const openExternal = vi.fn<OpenExternal>();
    render(
      host({
        loadBytes: async () => BYTES,
        openExternal,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    const [page] = await screen.findAllByTestId('pdf-page');
    const terms = page!.querySelector('a[href="https://example.com/terms"]')!;
    expect(fireEvent.click(terms)).toBe(false);
    expect(openExternal).toHaveBeenCalledWith('https://example.com/terms');
    // A scheme the host is not handed is still kept from navigating the view.
    expect(fireEvent.click(page!.querySelector('a[href^="ftp:"]')!)).toBe(false);
    expect(openExternal).toHaveBeenCalledTimes(1);
    // An internal link is pdf.js's own, and scrolls the frame.
    expect(fireEvent.click(page!.querySelector('a[href="#page=2"]')!)).toBe(true);
    expect(openExternal).toHaveBeenCalledTimes(1);
  });

  it('is left to open in a new tab when the host offers no way out', async () => {
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    const [page] = await screen.findAllByTestId('pdf-page');
    // Read whether the renderer took the click, then keep jsdom, which cannot
    // open a tab, from navigating.
    let taken: boolean | undefined;
    const settle = (event: Event) => {
      taken = event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener('click', settle);
    try {
      fireEvent.click(page!.querySelector('a[href="https://example.com/terms"]')!);
    } finally {
      document.removeEventListener('click', settle);
    }
    expect(taken).toBe(false);
    expect(lastDocument().externalLinkTarget).toBe('_blank');
  });
});

describe('every way it cannot be drawn falls back to the link', () => {
  it('with no bytes seam', async () => {
    render(host({ children: <ResultField field={documentField('report')} value={PDF} /> }));
    await expectLinkOnly();
    expect(pdf.documents).toHaveLength(0);
  });

  it('with no worker', async () => {
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(
      host({
        loadBytes,
        pdfWorker: { workerSrc: '  ' },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
    expect(loadBytes).not.toHaveBeenCalled();
  });

  it('when the seam rejects', async () => {
    render(
      host({
        loadBytes: async () => {
          throw new Error('not this host’s file');
        },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
  });

  it('when the seam throws before it returns a promise', async () => {
    render(
      host({
        loadBytes: () => {
          throw new Error('no bridge');
        },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
  });

  it('when the seam answers something other than bytes', async () => {
    render(
      host({
        loadBytes: async () => 'JVBERi0xLjc=' as unknown as Uint8Array,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
  });

  it('when the document is over the ceiling', async () => {
    render(
      host({
        loadBytes: async () => new Uint8Array(PDF_PAGES_MAX_BYTES + 1),
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
    expect(pdf.documents).toHaveLength(0);
  });

  it('when pdf.js cannot parse it', async () => {
    pdf.load = 'failure';
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
  });

  it('when the host states a worker of another version, out loud', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      host({
        loadBytes: async () => BYTES,
        pdfWorker: { ...WORKER, version: '6.4.0' },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
    expect(pdf.documents).toHaveLength(0);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('6.4.0'));
  });

  it('accepts a worker of the same version', async () => {
    render(
      host({
        loadBytes: async () => BYTES,
        pdfWorker: { ...WORKER, version: pdf.version },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
  });

  it('when pdf.js itself refuses the worker’s version, out loud', async () => {
    pdf.load = 'mismatch';
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('does not match the Worker version'),
    );
  });

  it('when the bytes never arrive', async () => {
    vi.useFakeTimers();
    render(
      host({
        loadBytes: () => new Promise<Uint8Array>(() => {}),
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    expect(screen.getByText(S.documentPdfPreparing).closest('[role="status"]')).not.toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.queryByText(S.documentPdfPreparing)).toBeNull();
    expect(screen.queryByRole('button', { name: S.preview })).toBeNull();
    expectLink();
  });
});

describe('where the renderer does not apply', () => {
  it('a PDF the host serves on the page’s own origin keeps its frame', async () => {
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    Object.defineProperty(window.navigator, 'pdfViewerEnabled', {
      configurable: true,
      get: () => true,
    });
    try {
      render(
        host({
          resolveUrl: hostFiles,
          loadBytes,
          children: <ResultField field={documentField('report')} value={PDF} />,
        }),
      );
      await waitFor(() => expect(document.querySelector('iframe')).not.toBeNull());
      expect(loadBytes).not.toHaveBeenCalled();
      expect(screen.queryByRole('group', { name: 'Quarterly report' })).toBeNull();
    } finally {
      delete (window.navigator as { pdfViewerEnabled?: boolean }).pdfViewerEnabled;
    }
  });

  it('a document that is not a PDF is not drawn', async () => {
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(
      host({
        loadBytes,
        children: (
          <ResultField
            field={documentField('report')}
            value={{
              url: stored('report.docx'),
              filename: 'report.docx',
              mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            }}
          />
        ),
      }),
    );
    await waitFor(() => expect(screen.queryByText(S.documentPdfPreparing)).toBeNull());
    expect(loadBytes).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: S.preview })).toBeNull();
  });
});
