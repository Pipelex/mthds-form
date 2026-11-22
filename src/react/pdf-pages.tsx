'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useFieldStrings } from './field-strings';
import type { LoadBytes, OpenExternal, PdfWorkerConfig } from './result-env';
import { focusOutlineClass } from './role-tokens';
import { cn } from './utils';

/**
 * A PDF's pages, drawn by the view itself from bytes its host hands it.
 *
 * ## Why the view draws a PDF at all
 *
 * The view frames a document only when the host's resolver answered it on the
 * page's own origin (`frameableUrl` in `./result-field`), so a method, which
 * chooses its documents' URLs, can never draw a third party's page inside the
 * host's. A host whose view runs in a chat host's sandboxed frame has no route
 * on that origin, and neither chat host shows a PDF in a frame anyway, so every
 * PDF it had was a name and a link. Drawing the pages onto canvases with pdf.js
 * (through react-pdf) shows them on every host, and frames nothing: the method
 * chooses the bytes, never a page. See `docs/result-view.md`, "A PDF the view
 * draws itself".
 *
 * ## The three overrides, each closing what a react-pdf default would open
 *
 * - **Links inside the PDF.** The annotation layer draws a PDF's links as
 *   anchors, and react-pdf gives an external one an empty `target`, so a click
 *   would navigate the view's own frame to a page the method chose. Here an
 *   external link goes through the host's `openExternal` when it has one, and
 *   otherwise opens in a new tab with `noopener noreferrer`.
 * - **Forms.** `renderForms` is pinned to `false`: with it on, a PDF's form
 *   fields become live `<input>` elements in the host's page, a working fake
 *   form.
 * - **XFA.** `enableXfa` is pinned to `false`, its default.
 *
 * Beside them, the bytes are copied before pdf.js takes them (pdf.js transfers
 * the buffer to its worker, which would empty the host's copy), and
 * `maxImageSize` bounds what a small file can expand into.
 *
 * ## Client only
 *
 * react-pdf's link service imports pdf.js's viewer module, which reads
 * `document` at its top level, so react-pdf is imported here with `import()`,
 * in an effect: only in a browser, only once the preview is open, and never on
 * a server, where effects do not run. `scripts/assert-bundle.mjs` refuses a
 * static edge to `react-pdf` or `pdfjs-dist` from any entry.
 */

/**
 * The largest document, in bytes, the view draws: 32 MiB. A larger one keeps
 * its link. The view downloads what it draws and pdf.js holds it in memory
 * while it is shown, inside a frame a host may have sized for a chat, so the
 * ceiling bounds both. It is handed to the host's `loadBytes` as `maxBytes`,
 * so a host that knows a file's size may refuse before it downloads.
 */
export const PDF_PAGES_MAX_BYTES = 32 * 1024 * 1024;

/**
 * The largest image, in pixels (width times height), pdf.js decodes when it
 * draws a page: 40 million, which admits a whole A4 or Letter page scanned at
 * 600 dpi (about 35 million) and holds one decoded image to about 160 MB. A
 * larger image is left out of the page and the rest is drawn. The byte ceiling
 * does not bound this, since a small file can describe a huge image.
 */
export const PDF_PAGES_MAX_IMAGE_PIXELS = 40_000_000;

/**
 * How long the bytes, pdf.js and the document's first parse may take before the
 * document falls back to its link, so a seam that never answers or a worker
 * that never starts costs the reader a minute rather than a spinner for good.
 */
const LOAD_TIMEOUT_MS = 60_000;

type ReactPdf = typeof import('react-pdf');

let reactPdf: Promise<ReactPdf> | undefined;

/** react-pdf, imported once per page; a failed import is forgotten so a later preview tries again. */
function loadReactPdf(): Promise<ReactPdf> {
  if (!reactPdf) {
    const loading = import('react-pdf');
    reactPdf = loading;
    loading.catch(() => {
      if (reactPdf === loading) reactPdf = undefined;
    });
  }
  return reactPdf;
}

/** Whether the host's worker config names a worker, by URL or as a started worker. */
export function hasPdfWorker(config: PdfWorkerConfig | undefined): config is PdfWorkerConfig {
  if (!config) return false;
  if (config.workerPort !== undefined && config.workerPort !== null) return true;
  return typeof config.workerSrc === 'string' && config.workerSrc.trim() !== '';
}

/** A `Uint8Array` from any realm: `instanceof` fails across frames. */
function isBytes(value: unknown): value is Uint8Array {
  return Object.prototype.toString.call(value) === '[object Uint8Array]';
}

/**
 * Point pdf.js at the host's worker. Always, because react-pdf sets `workerSrc`
 * to a relative `pdf.worker.mjs` when it loads, which resolves on whatever
 * origin the view runs on and is wrong in a sandboxed host. The renderer source
 * (`rendererSrc`, `rendererPorts`) is left as pdf.js has it.
 *
 * A stated worker version that is not the version of the pdf.js the renderer
 * runs is a second copy of `pdfjs-dist` in the host's build. pdf.js would
 * refuse it later with a message in a console nobody opens, so it is refused
 * here, out loud.
 */
function startWorker({ pdfjs }: ReactPdf, worker: PdfWorkerConfig): boolean {
  if (worker.version !== undefined && worker.version !== pdfjs.version) {
    report(
      `[mthds-form] The pdf.js worker the host supplies is version ${worker.version}, and the PDF renderer runs pdf.js ${pdfjs.version}. ` +
        'They must be the same build, so the document is shown as its link. Serve the worker from the pdfjs-dist that react-pdf resolves.',
    );
    return false;
  }
  try {
    if (worker.workerPort) {
      pdfjs.GlobalWorkerOptions.workerPort = worker.workerPort;
    } else {
      pdfjs.GlobalWorkerOptions.workerPort = null;
      pdfjs.GlobalWorkerOptions.workerSrc = worker.workerSrc ?? '';
    }
    return true;
  } catch (error) {
    report('[mthds-form] The pdf.js worker the host supplies was refused by pdf.js:', error);
    return false;
  }
}

/** The options pdf.js parses the document with: the host's data files, and the bounds. */
function documentOptions(worker: PdfWorkerConfig) {
  return {
    ...(worker.cMapUrl ? { cMapUrl: worker.cMapUrl, cMapPacked: true } : {}),
    ...(worker.standardFontDataUrl ? { standardFontDataUrl: worker.standardFontDataUrl } : {}),
    ...(worker.wasmUrl ? { wasmUrl: worker.wasmUrl } : {}),
    ...(worker.iccUrl ? { iccUrl: worker.iccUrl } : {}),
    maxImageSize: PDF_PAGES_MAX_IMAGE_PIXELS,
    enableXfa: false,
  };
}

/**
 * A host's misconfiguration, said where its developer looks: the document falls
 * back to its link either way, and a silent fallback is a renderer that looks
 * switched off for no reason.
 */
function report(...message: unknown[]): void {
  // eslint-disable-next-line no-console -- a host's failure, reported where it looks.
  console.error(...message);
}

/** The pdf.js message for an API and a worker of different versions. */
const VERSION_MISMATCH_RE = /does not match the Worker version/i;

/** The schemes a link inside a PDF may hand to the host. */
const EXTERNAL_LINK_RE = /^(https?|mailto):/i;

interface Ready {
  lib: ReactPdf;
  /** What pdf.js is handed: a copy of the host's bytes, never the host's own array. */
  file: { data: Uint8Array };
  options: ReturnType<typeof documentOptions>;
}

export interface PdfPagesProps {
  /** The document's own `url` member, as the host's `loadBytes` is asked with it. */
  url: string;
  /** What the pages are named for assistive technology: the document's title or file name. */
  name: string;
  /** The frame's size classes, the ones the document's frame would have had. */
  sizeClass: string;
  loadBytes: LoadBytes;
  worker: PdfWorkerConfig;
  openExternal: OpenExternal | undefined;
  /**
   * Called once when the pages cannot be drawn (no bytes, too many, no pdf.js,
   * a worker of another version, a document pdf.js cannot parse), so the
   * document falls back to its link rather than a blank frame.
   */
  onUnavailable: () => void;
}

/**
 * The pages, stacked in the frame the document's iframe would have had, each
 * fitted to its width; only the pages near the visible part of the frame are
 * drawn, so a long document holds a few canvases at a time.
 */
export function PdfPages({
  url,
  name,
  sizeClass,
  loadBytes,
  worker,
  openExternal,
  onUnavailable,
}: PdfPagesProps) {
  const s = useFieldStrings();
  const [ready, setReady] = useState<Ready | undefined>(undefined);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [ratio, setRatio] = useState(Math.SQRT2);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const width = useContentWidth(frame);

  // The host's functions are read when they are needed rather than restarting
  // the load whenever a host passes a new inline function.
  const latest = useRef({ loadBytes, worker, openExternal, onUnavailable });
  useEffect(() => {
    latest.current = { loadBytes, worker, openExternal, onUnavailable };
  });

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const settled = useRef(false);
  const refuse = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    clearTimeout(timer.current);
    latest.current.onUnavailable();
  }, []);

  useEffect(() => {
    let live = true;
    settled.current = false;
    const give = () => {
      if (live) refuse();
    };
    timer.current = setTimeout(give, LOAD_TIMEOUT_MS);
    const { loadBytes: load, worker: config } = latest.current;
    Promise.all([
      Promise.resolve().then(() => load(url, { maxBytes: PDF_PAGES_MAX_BYTES })),
      loadReactPdf(),
    ]).then(
      ([bytes, lib]) => {
        if (!live) return;
        if (!isBytes(bytes) || bytes.byteLength === 0 || bytes.byteLength > PDF_PAGES_MAX_BYTES) {
          give();
          return;
        }
        if (!startWorker(lib, config)) {
          give();
          return;
        }
        setReady({ lib, file: { data: bytes.slice() }, options: documentOptions(config) });
      },
      () => give(),
    );
    return () => {
      live = false;
      clearTimeout(timer.current);
    };
  }, [url, refuse]);

  // A click on a link the PDF holds, routed through the host when it offers a
  // way out. Internal links (`#…`) are pdf.js's own, and scroll the frame.
  const route = (event: MouseEvent<HTMLDivElement>) => {
    const open = latest.current.openExternal;
    if (!open || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (!link || !link.closest('.annotationLayer')) return;
    const href = link.getAttribute('href') ?? '';
    if (href === '' || href.startsWith('#')) return;
    event.preventDefault();
    if (EXTERNAL_LINK_RE.test(href)) open(href);
  };

  if (!ready) return <PagesLoading sizeClass={sizeClass} label={s.documentPdfPreparing} />;
  const { Document } = ready.lib;
  return (
    <div
      ref={setFrame}
      role="group"
      aria-label={name}
      tabIndex={0}
      onClickCapture={route}
      onAuxClickCapture={route}
      className={cn(
        sizeClass,
        'mthds-pdf-pages overflow-y-auto overscroll-contain rounded-lg border border-border bg-muted/40 p-2',
        focusOutlineClass,
      )}
    >
      <Document
        file={ready.file}
        options={ready.options}
        suspense={false}
        externalLinkTarget="_blank"
        externalLinkRel="noopener noreferrer"
        loading={<Spinner label={s.documentPdfPreparing} />}
        error={null}
        noData={null}
        className="flex flex-col items-center gap-2"
        onLoadSuccess={(pdf) => {
          clearTimeout(timer.current);
          setPageCount(pdf.numPages);
          pdf
            .getPage(1)
            .then((page) => {
              const viewport = page.getViewport({ scale: 1 });
              if (viewport.width > 0 && viewport.height > 0) {
                setRatio(viewport.height / viewport.width);
              }
            })
            .catch(() => {});
        }}
        onLoadError={(error) => {
          if (VERSION_MISMATCH_RE.test(error.message)) {
            report(
              `[mthds-form] pdf.js refused the host's worker: ${error.message} The document is shown as its link.`,
            );
          }
          refuse();
        }}
        onSourceError={() => refuse()}
      >
        {pageCount !== undefined &&
          Array.from({ length: pageCount }, (_, index) => (
            <PageSlot
              key={index + 1}
              lib={ready.lib}
              pageNumber={index + 1}
              width={width}
              ratio={ratio}
              root={frame}
            />
          ))}
      </Document>
    </div>
  );
}

/** The frame-sized box shown while the bytes and pdf.js load. */
function PagesLoading({ sizeClass, label }: { sizeClass: string; label: string }) {
  return (
    <div
      className={cn(
        sizeClass,
        'flex items-center justify-center rounded-lg border border-border bg-card/40',
      )}
    >
      <Spinner label={label} />
    </div>
  );
}

function Spinner({ label }: { label: string }): ReactNode {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 py-6 text-[12px] text-muted-foreground"
    >
      <Loader2 aria-hidden className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

/**
 * The width the pages are fitted to: the frame's content box, followed as it
 * resizes. `undefined` until measured, and where the browser cannot measure,
 * which draws a page at its own size.
 */
function useContentWidth(element: HTMLElement | null): number | undefined {
  const [width, setWidth] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!element) return;
    const measure = (next: number) => setWidth(next > 0 ? Math.floor(next) : undefined);
    if (typeof ResizeObserver === 'undefined') {
      const style = getComputedStyle(element);
      measure(
        element.clientWidth -
          (parseFloat(style.paddingLeft) || 0) -
          (parseFloat(style.paddingRight) || 0),
      );
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return width;
}

/**
 * One page's place in the stack. The page is drawn while its place is within
 * one frame's height of the visible part of the frame, and let go beyond it,
 * so a long document holds a few canvases at a time; a place not drawn keeps
 * the height its page last had at this width, or the first page's shape, so
 * the scroll does not jump. Where the browser has no `IntersectionObserver`,
 * every page is drawn.
 */
function PageSlot({
  lib,
  pageNumber,
  width,
  ratio,
  root,
}: {
  lib: ReactPdf;
  pageNumber: number;
  width: number | undefined;
  ratio: number;
  root: HTMLElement | null;
}) {
  const place = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');
  const [measured, setMeasured] = useState<{ width: number | undefined; height: number }>();
  useEffect(() => {
    const element = place.current;
    if (!element || !root || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setNear(entry.isIntersecting);
      },
      { root, rootMargin: '100% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [root]);
  const height =
    measured && measured.width === width
      ? measured.height
      : width !== undefined
        ? Math.round(width * ratio)
        : undefined;
  const { Page } = lib;
  return (
    <div
      ref={place}
      data-page-number={pageNumber}
      className="flex w-full justify-center"
      style={near || height === undefined ? undefined : { height }}
    >
      {near && (
        <Page
          pageNumber={pageNumber}
          width={width}
          renderForms={false}
          renderTextLayer
          renderAnnotationLayer
          loading={<div style={height === undefined ? undefined : { height, width }} />}
          error={null}
          className="shadow-sm"
          onRenderSuccess={() => {
            const box = place.current?.getBoundingClientRect();
            if (box && box.height > 0) setMeasured({ width, height: box.height });
          }}
        />
      )}
    </div>
  );
}
