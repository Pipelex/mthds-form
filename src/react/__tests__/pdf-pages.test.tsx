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
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import type { FileRunField } from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { PDF_PAGES_MAX_BYTES, PDF_PAGES_MAX_IMAGE_PIXELS, PDF_PAGES_MAX_PAGES } from '../pdf-pages';
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
  /** Every `PDFWorker` the renderer asked pdf.js for, with the port it was given. */
  pdfWorkers: [] as { port: unknown; destroy: () => void; destroyed: boolean }[],
  /** The loaded documents' loading tasks, which the renderer lets go before its worker. */
  tasks: [] as { destroy: () => Promise<void>; destroyed: boolean }[],
  /** The order things were let go in. */
  released: [] as string[],
  load: 'success' as 'success' | 'failure' | 'mismatch' | 'password' | 'never',
  /** What the renderer answered pdf.js's request for a password with. */
  passwordAnswers: [] as unknown[],
  numPages: 2,
  /** A page that fails, and how. */
  pageFailure: undefined as undefined | { page: number; at: 'load' | 'render' },
}));

vi.mock('react-pdf', async () => {
  const { useEffect } = await import('react');
  function Document(props: {
    children?: ReactNode;
    onLoadSuccess?: (document: unknown) => void;
    onLoadError?: (error: Error) => void;
    onPassword?: (answer: (password: unknown) => void, reason: number) => void;
  }) {
    pdf.documents.push(props);
    useEffect(() => {
      if (pdf.load === 'success') {
        const task = {
          destroyed: false,
          async destroy() {
            task.destroyed = true;
            pdf.released.push('document');
          },
        };
        pdf.tasks.push(task);
        props.onLoadSuccess?.({
          numPages: pdf.numPages,
          loadingTask: task,
          getPage: async () => ({ getViewport: () => ({ width: 100, height: 141 }) }),
        });
      } else if (pdf.load === 'password') {
        // An encrypted document: pdf.js asks for its password, through
        // react-pdf's default (`window.prompt`) when none is given, and an
        // Error for an answer fails the load with its PasswordException.
        const ask =
          props.onPassword ??
          ((answer: (password: unknown) => void) =>
            answer(window.prompt('Enter the password to open this PDF file.')));
        ask((answer) => {
          pdf.passwordAnswers.push(answer);
          if (answer instanceof Error) props.onLoadError?.(new Error('No password given.'));
        }, 1);
      } else if (pdf.load === 'never') {
        // A worker that never answers: the document never loads.
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
  function Page(props: {
    pageNumber: number;
    onLoadError?: (error: Error) => void;
    onRenderError?: (error: Error) => void;
  }) {
    pdf.pages.push(props);
    useEffect(() => {
      const failure = pdf.pageFailure;
      if (failure?.page !== props.pageNumber) return;
      if (failure.at === 'load') props.onLoadError?.(new Error('Invalid page tree.'));
      else props.onRenderError?.(new Error('Bad operator.'));
    }, []);
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
  class PDFWorker {
    destroyed = false;
    constructor(readonly port: unknown) {}
    static create({ port }: { port: unknown }) {
      const existing = pdf.pdfWorkers.find((worker) => worker.port === port);
      if (existing) return existing;
      const worker = new PDFWorker(port);
      pdf.pdfWorkers.push(worker);
      return worker;
    }
    destroy() {
      this.destroyed = true;
      pdf.released.push('pdf-worker');
    }
  }
  return {
    Document,
    Page,
    pdfjs: { version: pdf.version, GlobalWorkerOptions: pdf.workerOptions, PDFWorker },
  };
});

/** The workers the renderer started, as the browser's `Worker` records them. */
const started: FakeWorker[] = [];

/** jsdom has no `Worker`: this one records how it was started and whether it was stopped. */
class FakeWorker extends EventTarget {
  terminated = false;
  constructor(
    readonly script: string,
    readonly options: WorkerOptions | undefined,
  ) {
    super();
    started.push(this);
  }
  postMessage() {}
  terminate() {
    this.terminated = true;
    pdf.released.push('worker');
  }
}

/** The `blob:` URLs the renderer made, with what each holds, and the ones it revoked. */
const blobs = new Map<string, Blob>();
const revoked: string[] = [];

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

/** The document is folded away with its toggle kept, so unfolding it tries again. */
async function expectFolded() {
  await waitFor(() => expect(screen.queryByText(S.documentPdfPreparing)).toBeNull());
  expect(screen.queryByRole('group', { name: 'Quarterly report' })).toBeNull();
  expect(screen.getByRole('button', { name: S.preview })).toHaveAttribute('aria-expanded', 'false');
  expectLink();
}

beforeEach(() => {
  pdf.documents.length = 0;
  pdf.pages.length = 0;
  pdf.pdfWorkers.length = 0;
  pdf.tasks.length = 0;
  pdf.released.length = 0;
  pdf.load = 'success';
  pdf.passwordAnswers.length = 0;
  pdf.numPages = 2;
  pdf.pageFailure = undefined;
  pdf.workerOptions.workerSrc = 'pdf.worker.mjs';
  pdf.workerOptions.workerPort = null;
  pdf.workerOptions.rendererSrc = '';
  started.length = 0;
  blobs.clear();
  revoked.length = 0;
  vi.stubGlobal('Worker', FakeWorker);
  let next = 0;
  Object.assign(URL, {
    createObjectURL: (blob: Blob) => {
      const url = `blob:http://localhost:3000/${++next}`;
      blobs.set(url, blob);
      return url;
    },
    revokeObjectURL: (url: string) => revoked.push(url),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (URL as { createObjectURL?: unknown }).createObjectURL;
  delete (URL as { revokeObjectURL?: unknown }).revokeObjectURL;
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
    expect(loadBytes).toHaveBeenCalledWith(PDF.url, {
      maxBytes: PDF_PAGES_MAX_BYTES,
      signal: expect.any(AbortSignal),
    });
  });

  it('aborts the download when the document leaves before its bytes arrive', async () => {
    let signal: AbortSignal | undefined;
    const loadBytes: LoadBytes = (_url, request) => {
      signal = request.signal;
      return new Promise(() => {});
    };
    const { unmount } = render(
      host({ loadBytes, children: <ResultField field={documentField('report')} value={PDF} /> }),
    );
    await waitFor(() => expect(signal).toBeDefined());
    expect(signal!.aborted).toBe(false);
    unmount();
    expect(signal!.aborted).toBe(true);
  });

  it('aborts the download when the reader folds the preview away', async () => {
    let signal: AbortSignal | undefined;
    const loadBytes: LoadBytes = (_url, request) => {
      signal = request.signal;
      return new Promise(() => {});
    };
    render(
      host({ loadBytes, children: <ResultField field={documentField('report')} value={PDF} /> }),
    );
    await waitFor(() => expect(signal).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: S.preview }));
    expect(signal!.aborted).toBe(true);
  });

  it('takes an ArrayBuffer as the bytes', async () => {
    render(
      host({
        loadBytes: async () => BYTES.slice().buffer,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    const { data } = lastDocument().file as { data: Uint8Array };
    expect([...data]).toEqual([...BYTES]);
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

  it('starts its own worker from a cross-origin URL through a blob: module, touching no global', async () => {
    pdf.workerOptions.workerPort = { stale: true };
    const { unmount } = render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    // As pdf.js itself starts one: a module worker over a blob that imports the URL.
    expect(started).toHaveLength(1);
    const [worker] = started;
    expect(worker!.options).toEqual({ type: 'module' });
    expect(worker!.script).toMatch(/^blob:/);
    expect(await blobs.get(worker!.script)!.text()).toBe(`await import("${WORKER.workerSrc}");`);
    // Handed to pdf.js as this document's own worker.
    expect(pdf.pdfWorkers).toHaveLength(1);
    expect(pdf.pdfWorkers[0]!.port).toBe(worker);
    expect((lastDocument().options as { worker: unknown }).worker).toBe(pdf.pdfWorkers[0]);
    // pdf.js's process-wide options are as react-pdf left them.
    expect(pdf.workerOptions.workerSrc).toBe('pdf.worker.mjs');
    expect(pdf.workerOptions.workerPort).toEqual({ stale: true });
    expect(pdf.workerOptions.rendererSrc).toBe('');
    // Leaving lets the document go, then stops the worker and frees its blob.
    unmount();
    await waitFor(() => expect(worker!.terminated).toBe(true));
    expect(pdf.released).toEqual(['document', 'pdf-worker', 'worker']);
    expect(revoked).toEqual([worker!.script]);
  });

  it('starts a worker on the page’s own origin from its URL, with no blob', async () => {
    render(
      host({
        loadBytes: async () => BYTES,
        pdfWorker: { workerSrc: '/pdfjs/pdf.worker.min.mjs' },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(started.map((worker) => worker.script)).toEqual(['/pdfjs/pdf.worker.min.mjs']);
    expect(blobs.size).toBe(0);
  });

  it('starts one worker per document', async () => {
    render(
      host({
        loadBytes: async () => BYTES,
        children: (
          <>
            <ResultField field={documentField('report')} value={PDF} />
            <ResultField
              field={documentField('annex')}
              value={{ ...PDF, url: stored('annex.pdf'), title: 'Annex' }}
            />
          </>
        ),
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    await screen.findByRole('group', { name: 'Annex' });
    expect(started).toHaveLength(2);
    expect(pdf.pdfWorkers).toHaveLength(2);
  });

  it('falls back to the link, out loud, when its worker fails before it starts', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    act(() => {
      started[0]!.dispatchEvent(new Event('error'));
    });
    await expectLinkOnly();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('did not start'));
  });

  it('hands pdf.js a worker the host started, and never stops it', async () => {
    const port = new FakeWorker('host', undefined) as unknown as Worker;
    started.length = 0;
    const { unmount } = render(
      host({
        loadBytes: async () => BYTES,
        pdfWorker: { workerPort: port },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(started).toHaveLength(0);
    expect(pdf.pdfWorkers.map((worker) => worker.port)).toEqual([port]);
    expect((lastDocument().options as { worker: unknown }).worker).toBe(pdf.pdfWorkers[0]);
    expect(pdf.workerOptions.workerPort).toBeNull();
    unmount();
    await waitFor(() => expect(pdf.tasks[0]!.destroyed).toBe(true));
    expect(pdf.pdfWorkers[0]!.destroyed).toBe(false);
    expect((port as unknown as FakeWorker).terminated).toBe(false);
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
      worker: expect.anything(),
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
      worker: expect.anything(),
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
  let observers = 0;
  let observed: Element[] = [];
  let notify: IntersectionObserverCallback = () => {};
  beforeEach(() => {
    observers = 0;
    observed = [];
    // The pages' observer, rooted at the frame, is driven by the test; the
    // documents' own, rooted at the viewport, finds every document near.
    class StubObserver {
      private readonly frame: boolean;
      constructor(
        private readonly callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        this.frame = Boolean(options?.root);
        if (!this.frame) return;
        observers += 1;
        notify = callback;
      }
      observe(target: Element) {
        if (!this.frame) {
          this.callback(
            [{ target, isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
          return;
        }
        observed.push(target);
      }
      unobserve(target: Element) {
        if (this.frame) observed = observed.filter((element) => element !== target);
      }
      disconnect() {
        if (this.frame) observed = [];
      }
    }
    vi.stubGlobal('IntersectionObserver', StubObserver);
  });

  const near = (index: number, isIntersecting: boolean) =>
    act(() => {
      const target = document.querySelector(`[data-page-number="${index + 1}"]`)!;
      notify([{ target, isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

  it('draws a page as it nears the view and lets it go as it leaves, under one observer', async () => {
    pdf.numPages = 40;
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await waitFor(() => expect(observed).toHaveLength(40));
    expect(observers).toBe(1);
    expect(screen.queryAllByTestId('pdf-page')).toHaveLength(0);
    near(0, true);
    near(1, true);
    expect(screen.getAllByTestId('pdf-page').map((page) => page.dataset.page)).toEqual(['1', '2']);
    near(0, false);
    expect(screen.getAllByTestId('pdf-page').map((page) => page.dataset.page)).toEqual(['2']);
  });

  it(`lays out at most ${PDF_PAGES_MAX_PAGES} pages, then says the document continues, with its link`, async () => {
    pdf.numPages = 1_000_000;
    const openExternal = vi.fn<OpenExternal>();
    render(
      host({
        loadBytes: async () => BYTES,
        openExternal,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    const region = await screen.findByRole('group', { name: 'Quarterly report' });
    await waitFor(() => expect(observed).toHaveLength(PDF_PAGES_MAX_PAGES));
    expect(observers).toBe(1);
    expect(region.querySelectorAll('[data-page-number]')).toHaveLength(PDF_PAGES_MAX_PAGES);
    const line = within(region).getByText(
      (_, element) =>
        element?.tagName === 'P' &&
        (element.textContent ?? '').startsWith(S.pdfPagesContinue(PDF_PAGES_MAX_PAGES, 1_000_000)),
    );
    const link = within(line).getByRole('link', { name: S.openInNewTab });
    expect(link).toHaveAttribute('href', BUCKET);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    // Through the host, like the PDF's own links.
    expect(fireEvent.click(link)).toBe(false);
    expect(openExternal).toHaveBeenCalledWith(BUCKET);
  });

  it('sends the line’s link through the host’s current way out, not the first one', async () => {
    pdf.numPages = PDF_PAGES_MAX_PAGES + 1;
    const first = vi.fn<OpenExternal>();
    const second = vi.fn<OpenExternal>();
    const tree = (openExternal: OpenExternal) =>
      host({
        loadBytes: async () => BYTES,
        openExternal,
        children: <ResultField field={documentField('report')} value={PDF} />,
      });
    const { rerender } = render(tree(first));
    const region = await screen.findByRole('group', { name: 'Quarterly report' });
    await waitFor(() => expect(observed).toHaveLength(PDF_PAGES_MAX_PAGES));
    rerender(tree(second));
    fireEvent.click(within(region).getByRole('link', { name: S.openInNewTab }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(BUCKET);
  });

  it('draws and scrolls to the page an internal link names, however far it is', async () => {
    pdf.numPages = 40;
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    const region = await screen.findByRole('group', { name: 'Quarterly report' });
    await waitFor(() => expect(observed).toHaveLength(40));
    let scrollTop = 0;
    Object.defineProperty(region, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => (scrollTop = value),
    });
    const place = region.querySelector<HTMLElement>('[data-page-number="30"]')!;
    place.getBoundingClientRect = () => ({ top: 4200 }) as DOMRect;
    const onItemClick = lastDocument().onItemClick as (args: {
      dest: unknown;
      pageIndex: number;
      pageNumber: number;
    }) => void;
    act(() => onItemClick({ dest: [], pageIndex: 29, pageNumber: 30 }));
    expect(screen.getAllByTestId('pdf-page').map((page) => page.dataset.page)).toEqual(['30']);
    expect(scrollTop).toBe(4200);
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

  it('goes through the host on a middle click, and is left alone on a right click', async () => {
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
    // The right button opens the browser's menu, which must stay the reader's.
    expect(
      fireEvent(terms, new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 2 })),
    ).toBe(true);
    expect(openExternal).not.toHaveBeenCalled();
    expect(
      fireEvent(terms, new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 })),
    ).toBe(false);
    expect(openExternal).toHaveBeenCalledWith('https://example.com/terms');
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

  it('when the seam rejects, folded with its toggle, and unfolding asks again', async () => {
    let attempt = 0;
    const loadBytes = vi.fn<LoadBytes>(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error('network error');
      return BYTES;
    });
    render(
      host({ loadBytes, children: <ResultField field={documentField('report')} value={PDF} /> }),
    );
    await expectFolded();
    fireEvent.click(screen.getByRole('button', { name: S.preview }));
    await screen.findByRole('group', { name: 'Quarterly report' });
    expect(loadBytes).toHaveBeenCalledTimes(2);
  });

  it('when the seam rejects as the whole result in an app, with a toggle to try again', async () => {
    let attempt = 0;
    const loadBytes = vi.fn<LoadBytes>(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error('network error');
      return BYTES;
    });
    render(
      host({
        presentation: 'app',
        loadBytes,
        children: <StuffViewer field={documentField('output')} value={PDF} />,
      }),
    );
    await expectFolded();
    fireEvent.click(screen.getByRole('button', { name: S.preview }));
    const region = await screen.findByRole('group', { name: 'Quarterly report' });
    expect(region).toHaveClass('aspect-[1/1.414]');
    expect(screen.queryByRole('button', { name: S.preview })).toBeNull();
    expect(loadBytes).toHaveBeenCalledTimes(2);
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
    await expectFolded();
  });

  it('when the seam answers something other than bytes, out loud and for good', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      host({
        loadBytes: async () => 'JVBERi0xLjc=' as unknown as Uint8Array,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('loadBytes answered a string'));
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

  it('when pdf.js has not parsed it a minute after the bytes arrived, folded with its toggle', async () => {
    vi.useFakeTimers();
    pdf.load = 'never';
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(59_000);
    });
    expect(pdf.documents.length).toBeGreaterThan(0);
    expect(screen.getByRole('group', { name: 'Quarterly report' })).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(screen.queryByRole('group', { name: 'Quarterly report' })).toBeNull();
    expect(screen.getByRole('button', { name: S.preview })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expectLink();
  });

  it('when it is encrypted, for good, and never asks the reader for a password', async () => {
    pdf.load = 'password';
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null);
    render(
      host({
        loadBytes: async () => BYTES,
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await expectLinkOnly();
    expect(prompt).not.toHaveBeenCalled();
    expect(pdf.passwordAnswers).toHaveLength(1);
    expect(pdf.passwordAnswers[0]).toBeInstanceOf(Error);
  });
});

describe('the download has no deadline of the view’s', () => {
  it('draws a large file however long it takes to arrive', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    render(
      host({
        loadBytes: (_url, request) => {
          signal = request.signal;
          return new Promise<Uint8Array>((resolve) =>
            setTimeout(() => resolve(BYTES), 10 * 60_000),
          );
        },
        children: <ResultField field={documentField('report')} value={PDF} />,
      }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60_000 - 1);
    });
    expect(signal?.aborted).toBe(false);
    expect(screen.getByText(S.documentPdfPreparing).closest('[role="status"]')).not.toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByRole('group', { name: 'Quarterly report' })).toBeInTheDocument();
    expect(screen.getAllByTestId('pdf-page')).toHaveLength(2);
    expect(signal?.aborted).toBe(false);
  });
});

describe('a page that cannot be drawn', () => {
  for (const at of ['load', 'render'] as const) {
    it(`says so in its place when it fails to ${at}, out loud, and the others are drawn`, async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      pdf.pageFailure = { page: 2, at };
      render(
        host({
          loadBytes: async () => BYTES,
          children: <ResultField field={documentField('report')} value={PDF} />,
        }),
      );
      const region = await screen.findByRole('group', { name: 'Quarterly report' });
      const place = await waitFor(() => {
        const found = region.querySelector('[data-page-number="2"]')!;
        expect(found).toHaveTextContent(S.pdfPageNotDrawn);
        return found;
      });
      expect(within(place as HTMLElement).queryByTestId('pdf-page')).toBeNull();
      expect(screen.getAllByTestId('pdf-page').map((page) => page.dataset.page)).toEqual(['1']);
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining('Page 2 of the PDF could not be'),
        expect.any(Error),
      );
    });
  }
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

describe('a document waits until it nears the view', () => {
  const many = Array.from({ length: 6 }, (_, index) => ({
    url: stored(`report-${index + 1}.pdf`),
    filename: `report-${index + 1}.pdf`,
    mime_type: 'application/pdf',
  }));
  const list = (
    <ResultField
      field={{
        kind: 'list',
        name: 'reports',
        conceptRef: 'native.Document',
        required: true,
        item: documentField('item'),
      }}
      value={many}
    />
  );
  /** Each document's frame-sized placeholder, in the list's order. */
  const placeholders = () =>
    screen
      .getAllByText(S.documentPdfPreparing)
      .map((label) => label.closest('[role="status"]')!.parentElement!);

  it('asks for the bytes of only the documents whose placeholder nears the view, under one observer', async () => {
    let viewportObservers = 0;
    let watched: Element[] = [];
    let report: IntersectionObserverCallback = () => {};
    class StubObserver {
      private readonly frame: boolean;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        // The pages' own observer, rooted at a document's frame, is not this test's.
        this.frame = Boolean(options?.root);
        if (this.frame) return;
        viewportObservers += 1;
        report = callback;
      }
      observe(target: Element) {
        if (!this.frame) watched.push(target);
      }
      unobserve(target: Element) {
        if (!this.frame) watched = watched.filter((element) => element !== target);
      }
      disconnect() {
        if (!this.frame) watched = [];
      }
    }
    vi.stubGlobal('IntersectionObserver', StubObserver);
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    const { unmount } = render(host({ loadBytes, children: list }));
    await waitFor(() => expect(watched).toHaveLength(many.length));
    expect(viewportObservers).toBe(1);
    const boxes = placeholders();
    expect(watched).toEqual(boxes);
    await act(async () => {
      report(
        [
          { target: boxes[0]!, isIntersecting: false },
          { target: boxes[1]!, isIntersecting: true },
          { target: boxes[4]!, isIntersecting: true },
        ] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
    });
    await waitFor(() => expect(loadBytes).toHaveBeenCalledTimes(2));
    expect(loadBytes.mock.calls.map(([url]) => url)).toEqual([many[1]!.url, many[4]!.url]);
    // The two that started are let go; the others still wait.
    expect(watched).toHaveLength(many.length - 2);
    expect(started).toHaveLength(2);
    unmount();
    expect(watched).toHaveLength(0);
  });

  it('asks for every one at once where the browser has no IntersectionObserver', async () => {
    expect(typeof IntersectionObserver).toBe('undefined');
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    render(host({ loadBytes, children: list }));
    await waitFor(() => expect(loadBytes).toHaveBeenCalledTimes(many.length));
  });
});

describe('hydrating a PDF the host serves at an absolute URL on the page’s own origin', () => {
  it('frames it, and never starts the renderer while the origin is unknown', async () => {
    const sameOrigin: ResolveUrl = (url) =>
      url.startsWith('pipelex-storage://')
        ? `${window.location.origin}/api/assets/report.pdf`
        : undefined;
    const loadBytes = vi.fn<LoadBytes>(async () => BYTES);
    Object.defineProperty(window.navigator, 'pdfViewerEnabled', {
      configurable: true,
      get: () => true,
    });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const tree = () =>
      host({
        resolveUrl: sameOrigin,
        loadBytes,
        children: <ResultField field={documentField('report')} value={PDF} />,
      });
    try {
      // The server knows no origin, so it can frame nothing absolute and must
      // not decide the document is one to draw either.
      const html = renderToString(tree());
      expect(html).not.toContain(S.documentPdfPreparing);
      container.innerHTML = html;
      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(container, tree());
      });
      await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull());
      expect(loadBytes).not.toHaveBeenCalled();
      expect(started).toHaveLength(0);
      expect(pdf.documents).toHaveLength(0);
      act(() => root?.unmount());
    } finally {
      container.remove();
      delete (window.navigator as { pdfViewerEnabled?: boolean }).pdfViewerEnabled;
    }
  });
});
