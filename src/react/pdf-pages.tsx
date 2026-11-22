'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';
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
 * ## The four overrides, each closing what a react-pdf default would open
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
 * - **Encrypted PDFs.** react-pdf's default `onPassword` asks for the password
 *   with `window.prompt`, and again after every wrong answer: a modal in the
 *   host's page asking the reader for a secret, on a document the method chose,
 *   for as long as they keep answering. Here every request is refused, so an
 *   encrypted PDF fails to load and keeps its link, and nothing is prompted.
 *
 * Beside them, the bytes are copied before pdf.js takes them (pdf.js transfers
 * the buffer to its worker, which would empty the host's copy),
 * `maxImageSize` bounds what a small file can expand into, and at most
 * {@link PDF_PAGES_MAX_PAGES} pages are laid out.
 *
 * ## A worker per document, and no global
 *
 * Each document gets its own pdf.js worker, handed to pdf.js as the document's
 * `worker` option, so the renderer writes nothing into pdf.js's process-wide
 * `GlobalWorkerOptions`, which a host running pdf.js itself also reads. From a
 * host's `workerSrc` the renderer starts the worker itself, exactly as pdf.js
 * would (a cross-origin URL is wrapped in a `blob:` module that imports it,
 * which a sandboxed frame admits where it refuses the URL itself, and which
 * holds the messages pdf.js posts while the import is under way), and stops it
 * when the document leaves. A host's `workerPort` is the host's, is never
 * stopped, and must already be listening, since pdf.js posts to it at once.
 * react-pdf's own module still sets `GlobalWorkerOptions.workerSrc` to a
 * relative `pdf.worker.mjs` as it loads, which is react-pdf's doing and which
 * nothing here reads.
 *
 * ## Nothing loads until the document is near the view
 *
 * Every preview starts open, so a result holding a list of PDFs would download
 * every one, copy every one and start a worker for every one as it mounts.
 * Instead each document's frame-sized placeholder waits until it comes within a
 * viewport's height of the visible part of the page, watched by ONE
 * `IntersectionObserver` shared by every document on the page
 * (`NearViewport`), and only then asks the host for the bytes and imports
 * react-pdf. Where the browser has no `IntersectionObserver`, it loads at once.
 *
 * ## Client only
 *
 * react-pdf's link service imports pdf.js's viewer module, which reads
 * `document` at its top level, so react-pdf is imported here with `import()`,
 * in an effect: only in a browser, only once the preview is open and near the
 * view, and never on a server, where effects do not run.
 * `scripts/assert-bundle.mjs` refuses a static edge to `react-pdf` or
 * `pdfjs-dist` from any entry.
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
 * The most pages the view lays out for one document: 500. Each page is a place
 * in the stack, observed for whether it is near the visible part of the frame,
 * so a document claiming a million pages would otherwise cost a million of
 * them before one was drawn. A longer document shows its first pages, then a
 * line saying it continues, with its link.
 */
export const PDF_PAGES_MAX_PAGES = 500;

/**
 * How long pdf.js may take, once the bytes have arrived, to load, start its
 * worker and parse the document before the preview folds away with its toggle
 * kept, so a worker that never starts costs the reader a minute rather than a
 * spinner for good.
 *
 * The download has no deadline here, deliberately: only the host can tell a
 * large file arriving slowly from a connection that stalled, and a deadline on
 * the whole download would fail the same large file on the same slow link at
 * every retry. The host bounds its own download (typically by aborting when no
 * data has arrived for a while) and rejects, which folds the preview the same
 * way; the view aborts the request's signal when the reader folds the preview
 * or the document leaves.
 */
const PARSE_TIMEOUT_MS = 60_000;

/**
 * Why the pages could not be drawn, which decides whether the view tries again.
 *
 * - `transient`: something that may pass (the seam rejected or threw, react-pdf
 *   could not be loaded, the minute after the bytes arrived ran out). The
 *   preview folds away and keeps its toggle, and unfolding it tries again.
 * - `final`: an answer that would be the same next time (not bytes, no bytes,
 *   over the ceiling, a worker of another version or one that would not start,
 *   a document pdf.js cannot parse or that is encrypted). The document keeps
 *   its link alone.
 */
export type PdfPagesFailure = 'transient' | 'final';

type ReactPdf = typeof import('react-pdf');
type PdfJsWorker = InstanceType<ReactPdf['pdfjs']['PDFWorker']>;

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

/** The tag `Object.prototype.toString` gives a value, which holds across frames where `instanceof` does not. */
function tagOf(value: unknown): string {
  return Object.prototype.toString.call(value);
}

/**
 * The seam's answer as bytes: a `Uint8Array`, or an `ArrayBuffer` viewed as
 * one, from any realm. `undefined` for anything else.
 */
function asBytes(value: unknown): Uint8Array | undefined {
  const tag = tagOf(value);
  if (tag === '[object Uint8Array]') return value as Uint8Array;
  if (tag === '[object ArrayBuffer]') return new Uint8Array(value as ArrayBuffer);
  return undefined;
}

/** What the seam answered instead of bytes, named for the report. */
function describeAnswer(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value !== 'object') return `a ${typeof value}`;
  return tagOf(value).slice('[object '.length, -1);
}

/**
 * Whether a URL is on the page's own origin, as pdf.js's own `isSameOrigin`
 * decides it: a page whose origin is opaque (`null`, a sandboxed frame's) has
 * no URL on its origin.
 */
function onPageOrigin(src: string): boolean {
  const base = new URL(window.location.href);
  if (!base.origin || base.origin === 'null') return false;
  return new URL(src, base).origin === base.origin;
}

/**
 * The body of the `blob:` module that starts a worker whose URL is not on the
 * page's own origin.
 *
 * pdf.js, handed a started worker, posts its first messages to it at once
 * (`configure`, then the document's `GetDocRequest`) and waits for no
 * handshake (`#initializeFromPort` in `pdfjs-dist/build/pdf.mjs`). pdf.js's
 * worker module starts listening only once it has been evaluated, which inside
 * the wrapper is once the import of it across the origins has finished. The
 * browser delivers the messages while the wrapper's top-level `await` is still
 * pending, so with nobody listening they were lost, and the document waited
 * out the parse timer before falling back to its link. The wrapper therefore
 * holds every message that arrives during the import and dispatches each again
 * once the import has finished, with its data and its ports, in the order it
 * came, to the listener pdf.js's worker installed in the meantime. The holding
 * listener is the first installed, and keeps a held message from every listener
 * after it, so a message is never seen twice, even one that arrived after
 * pdf.js's worker started listening and before the import's `await` resumed. A
 * worker started from the URL directly has no such window, since nothing runs
 * before the module itself.
 *
 * The import stays dynamic: a static `import` of the URL is a fetch the page's
 * `worker-src` judges, and a chat host's frame admits `blob:` workers alone.
 * The URL is embedded as a JSON string, which is a valid JavaScript string
 * literal for any URL.
 */
function wrapperSource(url: string): string {
  return [
    'const held = [];',
    'const hold = (event) => {',
    '  event.stopImmediatePropagation();',
    '  held.push(event);',
    '};',
    'self.addEventListener("message", hold);',
    'try {',
    `  await import(${JSON.stringify(url)});`,
    '} finally {',
    '  self.removeEventListener("message", hold);',
    '}',
    'for (const event of held) {',
    '  self.dispatchEvent(new MessageEvent("message", { data: event.data, ports: [...event.ports] }));',
    '}',
    '',
  ].join('\n');
}

/**
 * Start pdf.js's worker module from a URL, as pdf.js itself does in
 * `PDFWorker` (`getWorkerSrc` in `pdfjs-dist/build/pdf.mjs`): a URL on the
 * page's origin directly, and any other wrapped in a `blob:` module that
 * imports it, since a page may start a worker only from its own origin, and a
 * sandboxed frame, whose origin is opaque, admits a `blob:` worker where it
 * refuses every URL.
 *
 * The wrapper holds the messages that arrive while it imports, and dispatches
 * them again, in order, once the import has finished ({@link wrapperSource}).
 */
function moduleWorker(src: string): { worker: Worker; stop: () => void } {
  let script = src;
  let blob: string | undefined;
  if (!onPageOrigin(src)) {
    const wrapper = wrapperSource(new URL(src, window.location.href).href);
    blob = URL.createObjectURL(new Blob([wrapper], { type: 'text/javascript' }));
    script = blob;
  }
  const revoke = () => {
    if (blob) URL.revokeObjectURL(blob);
  };
  try {
    const worker = new Worker(script, { type: 'module' });
    return {
      worker,
      stop: () => {
        worker.terminate();
        revoke();
      },
    };
  } catch (error) {
    revoke();
    throw error;
  }
}

/** The document's own pdf.js worker, and how to let it go when the document leaves. */
interface StartedWorker {
  worker: PdfJsWorker;
  /** Stops a worker the renderer started; leaves a host's alone. */
  release: () => void;
}

/**
 * The worker this document is parsed in, handed to pdf.js as its `worker`
 * option rather than through `GlobalWorkerOptions`, which is process-wide.
 *
 * A stated worker version that is not the version of the pdf.js the renderer
 * runs is a second copy of `pdfjs-dist` in the host's build. pdf.js would
 * refuse it later with a message in a console nobody opens, so it is refused
 * here, out loud.
 *
 * `onStartFailure` is called if a worker the renderer started from `workerSrc`
 * fails before it says anything (a URL that does not load, a policy that
 * refuses it), which pdf.js, handed a started worker, would never notice.
 */
function startWorker(
  { pdfjs }: ReactPdf,
  config: PdfWorkerConfig,
  onStartFailure: () => void,
): StartedWorker | undefined {
  if (config.version !== undefined && config.version !== pdfjs.version) {
    report(
      `[mthds-form] The pdf.js worker the host supplies is version ${config.version}, and the PDF renderer runs pdf.js ${pdfjs.version}. ` +
        'They must be the same build, so the document is shown as its link. Serve the worker from the pdfjs-dist that react-pdf resolves.',
    );
    return undefined;
  }
  try {
    if (config.workerPort) {
      // pdf.js keeps one `PDFWorker` per port and hands it back on the next
      // call, so documents drawn from the host's worker share it; it is never
      // destroyed here, which would also stop pdf.js listening to the port.
      return { worker: pdfjs.PDFWorker.create({ port: config.workerPort }), release: () => {} };
    }
    const own = moduleWorker(config.workerSrc ?? '');
    const listening = new AbortController();
    const failed = () => {
      listening.abort();
      report(
        `[mthds-form] The pdf.js worker at ${config.workerSrc} did not start, so the document is shown as its link. ` +
          'Check that the URL serves pdf.worker.min.mjs, with Access-Control-Allow-Origin when it is on another origin, and that the page admits blob: workers.',
      );
      onStartFailure();
    };
    own.worker.addEventListener('error', failed, { signal: listening.signal });
    // pdf.js's worker speaks first, once it is running.
    own.worker.addEventListener('message', () => listening.abort(), { signal: listening.signal });
    let worker: PdfJsWorker;
    try {
      worker = pdfjs.PDFWorker.create({ port: own.worker });
    } catch (error) {
      listening.abort();
      own.stop();
      throw error;
    }
    return {
      worker,
      release: () => {
        listening.abort();
        worker.destroy();
        own.stop();
      },
    };
  } catch (error) {
    report('[mthds-form] The pdf.js worker the host supplies could not be started:', error);
    return undefined;
  }
}

/** The options pdf.js parses the document with: its worker, the host's data files, and the bounds. */
function documentOptions(worker: PdfWorkerConfig, started: PdfJsWorker) {
  return {
    worker: started,
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

/**
 * pdf.js's request for an encrypted document's password, refused: react-pdf's
 * default would ask the reader with `window.prompt`, again after every wrong
 * answer. pdf.js's `updatePassword` (its `PasswordRequest` handler in
 * `pdfjs-dist/build/pdf.mjs`) rejects the request when it is handed an
 * `Error`, and its worker then fails the load with the `PasswordException`,
 * which reaches `onLoadError` as a final refusal. react-pdf types the answer as
 * a password, which an `Error` is not, hence the cast.
 */
function refusePassword(answer: (password: string | null) => void): void {
  answer(
    new Error(
      'The PDF is encrypted, and the view asks no one for its password.',
    ) as unknown as string,
  );
}

/**
 * Which documents' placeholders are near the visible part of the page, read by
 * ONE `IntersectionObserver` for every document rather than one each. A
 * placeholder is near once it is within a viewport's height of the visible
 * part, and is let go as soon as it is: a document that started loading keeps
 * loading wherever the reader scrolls. The observer is made with the first
 * placeholder and dropped with the last, so nothing is held once no document
 * waits. Only asked where the browser has an `IntersectionObserver`.
 */
class NearViewport {
  private observer: IntersectionObserver | undefined;
  private readonly waiting = new Map<Element, () => void>();

  /** Calls `onNear` once, when `element` nears the view; returns the cancel. */
  watch(element: Element, onNear: () => void): () => void {
    this.observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const near = entry.isIntersecting && this.waiting.get(entry.target);
          if (!near) continue;
          this.forget(entry.target);
          near();
        }
      },
      { rootMargin: '100% 0px' },
    );
    this.waiting.set(element, onNear);
    this.observer.observe(element);
    return () => this.forget(element);
  }

  private forget(element: Element): void {
    if (!this.waiting.delete(element)) return;
    this.observer?.unobserve(element);
    if (this.waiting.size === 0) {
      this.observer?.disconnect();
      this.observer = undefined;
    }
  }
}

const nearViewport = new NearViewport();

interface Ready {
  lib: ReactPdf;
  /** What pdf.js is handed: a copy of the host's bytes, never the host's own array. */
  file: { data: Uint8Array };
  options: ReturnType<typeof documentOptions>;
}

/** The parsed document, as react-pdf hands it to `onLoadSuccess`. */
type LoadedPdf = Parameters<NonNullable<ComponentProps<ReactPdf['Document']>['onLoadSuccess']>>[0];

export interface PdfPagesProps {
  /** The document's own `url` member, as the host's `loadBytes` is asked with it. */
  url: string;
  /** What the pages are named for assistive technology: the document's title or file name. */
  name: string;
  /** The document's link, offered below the last page when the document has more pages than the view lays out. */
  href: string | undefined;
  /** The frame's size classes, the ones the document's frame would have had. */
  sizeClass: string;
  loadBytes: LoadBytes;
  worker: PdfWorkerConfig;
  openExternal: OpenExternal | undefined;
  /**
   * Called once when the pages cannot be drawn, with whether it may pass
   * ({@link PdfPagesFailure}), so the document falls back to its link rather
   * than a blank frame.
   */
  onUnavailable: (failure: PdfPagesFailure) => void;
}

/**
 * The pages, stacked in the frame the document's iframe would have had, each
 * fitted to its width; only the pages near the visible part of the frame are
 * drawn, so a long document holds a few canvases at a time. Nothing is
 * downloaded or imported until the frame-sized placeholder nears the view
 * (`NearViewport`).
 */
export function PdfPages({
  url,
  name,
  href,
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
  const [watch] = useState(() => new PageWatch());
  useEffect(() => (frame ? watch.connect(frame) : undefined), [frame, watch]);
  // Whether the placeholder has come near the view, which starts the load.
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');
  const [placeholder, setPlaceholder] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (near || !placeholder) return;
    return nearViewport.watch(placeholder, () => setNear(true));
  }, [near, placeholder]);

  // The host's functions are read when they are needed rather than restarting
  // the load whenever a host passes a new inline function.
  const latest = useRef({ loadBytes, worker, openExternal, onUnavailable });
  useEffect(() => {
    latest.current = { loadBytes, worker, openExternal, onUnavailable };
  });

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const settled = useRef(false);
  const loaded = useRef<LoadedPdf | undefined>(undefined);
  const refuse = useCallback((failure: PdfPagesFailure) => {
    if (settled.current) return;
    settled.current = true;
    clearTimeout(timer.current);
    latest.current.onUnavailable(failure);
  }, []);

  useEffect(() => {
    if (!near) return;
    let live = true;
    let started: StartedWorker | undefined;
    settled.current = false;
    const download = new AbortController();
    const give = (failure: PdfPagesFailure) => {
      if (!live) return;
      download.abort();
      refuse(failure);
    };
    const { loadBytes: load, worker: config } = latest.current;
    const bytes = Promise.resolve().then(() => {
      // A document that left before this turn is not asked about at all.
      download.signal.throwIfAborted();
      return load(url, { maxBytes: PDF_PAGES_MAX_BYTES, signal: download.signal });
    });
    // The minute starts once the bytes are here: the download is the host's to
    // bound (`PARSE_TIMEOUT_MS`).
    bytes.then(
      () => {
        if (live && !settled.current) {
          timer.current = setTimeout(() => give('transient'), PARSE_TIMEOUT_MS);
        }
      },
      () => {},
    );
    Promise.all([bytes, loadReactPdf()]).then(
      ([answer, lib]) => {
        if (!live) return;
        const bytes = asBytes(answer);
        if (!bytes) {
          report(
            `[mthds-form] loadBytes answered ${describeAnswer(answer)} for ${url}, where a Uint8Array or an ArrayBuffer was expected, so the document is shown as its link.`,
          );
          give('final');
          return;
        }
        if (bytes.byteLength === 0 || bytes.byteLength > PDF_PAGES_MAX_BYTES) {
          give('final');
          return;
        }
        started = startWorker(lib, config, () => give('final'));
        if (!started) {
          give('final');
          return;
        }
        setReady({
          lib,
          file: { data: bytes.slice() },
          options: documentOptions(config, started.worker),
        });
      },
      () => give('transient'),
    );
    return () => {
      live = false;
      clearTimeout(timer.current);
      download.abort();
      const own = started;
      const doc = loaded.current;
      loaded.current = undefined;
      if (own) {
        // The document is let go before its worker, so pdf.js's goodbye to the
        // worker is answered rather than left waiting on a stopped one.
        void Promise.resolve()
          .then(() => doc?.loadingTask.destroy())
          .catch(() => {})
          .finally(own.release);
      }
    };
  }, [url, refuse, near]);

  // A click on a link the PDF holds, routed through the host when it offers a
  // way out. Internal links (`#…`) are pdf.js's own, and scroll the frame. Of
  // the other buttons, only the middle one opens a link.
  const route = (event: MouseEvent<HTMLDivElement>) => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const open = latest.current.openExternal;
    if (!open || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (!link || !link.closest('.annotationLayer')) return;
    const target = link.getAttribute('href') ?? '';
    if (target === '' || target.startsWith('#')) return;
    event.preventDefault();
    if (EXTERNAL_LINK_RE.test(target)) open(target);
  };

  // An internal link to a page: react-pdf scrolls only to a page it has drawn,
  // so a link to a page far from the view would do nothing. The page's place
  // is drawn and scrolled to within the frame, never the host's own page.
  const frameRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);
  const goToPage = useCallback(
    ({ pageNumber }: { pageNumber: number }) => {
      const element = frameRef.current;
      if (!element) return;
      const place = watch.find(pageNumber);
      if (!place) {
        // A page past the ones laid out: the line that says the document continues.
        element.scrollTop = element.scrollHeight;
        return;
      }
      place.reveal();
      element.scrollTop +=
        place.element.getBoundingClientRect().top - element.getBoundingClientRect().top;
    },
    [watch],
  );

  if (!ready) {
    return (
      <PagesLoading boxRef={setPlaceholder} sizeClass={sizeClass} label={s.documentPdfPreparing} />
    );
  }
  const { Document } = ready.lib;
  const laidOut = pageCount === undefined ? 0 : Math.min(pageCount, PDF_PAGES_MAX_PAGES);
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
        onItemClick={goToPage}
        onPassword={refusePassword}
        onLoadSuccess={(pdf) => {
          clearTimeout(timer.current);
          loaded.current = pdf;
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
          refuse('final');
        }}
        onSourceError={() => refuse('final')}
      >
        {Array.from({ length: laidOut }, (_, index) => (
          <PageSlot
            key={index + 1}
            lib={ready.lib}
            pageNumber={index + 1}
            width={width}
            ratio={ratio}
            watch={watch}
          />
        ))}
        {pageCount !== undefined && pageCount > laidOut && (
          <MorePages shown={laidOut} total={pageCount} href={href} openExternal={openExternal} />
        )}
      </Document>
    </div>
  );
}

/**
 * The line below the last page laid out, for a document with more pages than
 * {@link PDF_PAGES_MAX_PAGES}: it says so, and offers the document's link.
 */
function MorePages({
  shown,
  total,
  href,
  openExternal,
}: {
  shown: number;
  total: number;
  href: string | undefined;
  openExternal: OpenExternal | undefined;
}) {
  const s = useFieldStrings();
  return (
    <p className="px-2 py-3 text-center text-[12px] text-muted-foreground">
      {s.pdfPagesContinue(shown, total)}
      {href && (
        <>
          {' '}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('rounded-sm underline underline-offset-2', focusOutlineClass)}
            onClick={(event) => {
              // The resolved URL, as the browser would open it.
              const resolved = event.currentTarget.href;
              if (!openExternal || !EXTERNAL_LINK_RE.test(resolved)) return;
              event.preventDefault();
              openExternal(resolved);
            }}
          >
            {s.openInNewTab}
          </a>
        </>
      )}
    </p>
  );
}

/** The frame-sized box shown until the document nears the view, and while the bytes and pdf.js load. */
function PagesLoading({
  boxRef,
  sizeClass,
  label,
}: {
  boxRef: (element: HTMLDivElement | null) => void;
  sizeClass: string;
  label: string;
}) {
  return (
    <div
      ref={boxRef}
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
 * Which pages' places are near the visible part of the frame, read by ONE
 * `IntersectionObserver` for the whole stack rather than one per place. A
 * place is near while it is within one frame's height of the visible part.
 * Places register as they mount, before or after the frame is connected.
 */
class PageWatch {
  private observer: IntersectionObserver | undefined;
  private readonly places = new Map<Element, (near: boolean) => void>();
  private readonly pages = new Map<number, { element: HTMLElement; reveal: () => void }>();

  /** Starts watching within the frame; returns the disconnect. */
  connect(root: HTMLElement): (() => void) | undefined {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) this.places.get(entry.target)?.(entry.isIntersecting);
      },
      { root, rootMargin: '100% 0px' },
    );
    this.observer = observer;
    for (const element of this.places.keys()) observer.observe(element);
    return () => {
      observer.disconnect();
      if (this.observer === observer) this.observer = undefined;
    };
  }

  /** Registers one page's place; returns the unregister. */
  watch(pageNumber: number, element: HTMLElement, setNear: (near: boolean) => void): () => void {
    this.places.set(element, setNear);
    this.pages.set(pageNumber, { element, reveal: () => setNear(true) });
    this.observer?.observe(element);
    return () => {
      this.places.delete(element);
      if (this.pages.get(pageNumber)?.element === element) this.pages.delete(pageNumber);
      this.observer?.unobserve(element);
    };
  }

  /** A page's place, when it is laid out. */
  find(pageNumber: number): { element: HTMLElement; reveal: () => void } | undefined {
    return this.pages.get(pageNumber);
  }
}

/**
 * One page's place in the stack. The page is drawn while its place is within
 * one frame's height of the visible part of the frame, and let go beyond it,
 * so a long document holds a few canvases at a time; a place not drawn keeps
 * the height its page last had at this width, or the first page's shape, so
 * the scroll does not jump. Where the browser has no `IntersectionObserver`,
 * every page is drawn. A page pdf.js cannot load or draw is replaced by a line
 * that says so, and reported, rather than left blank.
 */
function PageSlot({
  lib,
  pageNumber,
  width,
  ratio,
  watch,
}: {
  lib: ReactPdf;
  pageNumber: number;
  width: number | undefined;
  ratio: number;
  watch: PageWatch;
}) {
  const s = useFieldStrings();
  const place = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');
  const [failed, setFailed] = useState(false);
  const [measured, setMeasured] = useState<{ width: number | undefined; height: number }>();
  useEffect(() => {
    const element = place.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    return watch.watch(pageNumber, element, setNear);
  }, [watch, pageNumber]);
  const height =
    measured && measured.width === width
      ? measured.height
      : width !== undefined
        ? Math.round(width * ratio)
        : undefined;
  const fail = (what: string) => (error: Error) => {
    report(`[mthds-form] Page ${pageNumber} of the PDF could not be ${what}:`, error);
    setFailed(true);
  };
  const { Page } = lib;
  return (
    <div
      ref={place}
      data-page-number={pageNumber}
      className="flex w-full justify-center"
      style={(near && !failed) || height === undefined ? undefined : { height }}
    >
      {failed ? (
        <div
          className="flex size-full min-h-16 items-center justify-center rounded-sm border border-dashed border-border bg-card px-3 text-center text-[12px] text-muted-foreground"
          style={width === undefined ? undefined : { width }}
        >
          {s.pdfPageNotDrawn}
        </div>
      ) : (
        near && (
          <Page
            pageNumber={pageNumber}
            width={width}
            renderForms={false}
            renderTextLayer
            renderAnnotationLayer
            loading={<div style={height === undefined ? undefined : { height, width }} />}
            error={null}
            className="shadow-sm"
            onLoadError={fail('loaded')}
            onRenderError={fail('drawn')}
            onRenderSuccess={() => {
              const box = place.current?.getBoundingClientRect();
              if (box && box.height > 0) setMeasured({ width, height: box.height });
            }}
          />
        )
      )}
    </div>
  );
}
