import type { HtmlContentView } from '../core/native-content';
import { DEFAULT_IMG_SRC, frameDocument, frameStyles, pageTypography } from './html-frame';

/**
 * Save an HTML result as PDF the way a reader would by hand: print it with the
 * browser's own engine, so the page's `@media print` rules, page breaks and
 * `@page` margins apply, and let the print dialog's "Save as PDF" destination
 * write the file. Nothing is rasterised and nothing leaves the browser.
 *
 * ## A separate, script-free copy, printed from the host
 *
 * The page is printed from a copy in a hidden frame of its own, never from the
 * preview frame on screen. The preview carries the host's theme (a light text
 * colour in a dark theme would print near-white on white paper) and its height
 * is clipped to the panel, and it should not gain a permission it does not need.
 *
 * The copy is sandboxed `allow-same-origin allow-modals`, and not
 * `allow-scripts`, so the policy the preview follows holds here unchanged:
 * nothing in the markup runs. Each token is needed, measured on Chromium:
 *
 * - `print()` on a frame sandboxed WITHOUT `allow-modals` is ignored ("Ignored
 *   call to 'print()'. The document is sandboxed, and the 'allow-modals'
 *   keyword is not set."), and no `beforeprint` fires.
 * - Without `allow-same-origin` the frame's origin is opaque, so the host cannot
 *   reach its window to call `print()` at all (a cross-origin `SecurityError`),
 *   nor wait on its fonts and images.
 *
 * Same-origin is dangerous only together with scripts, and with no scripts the
 * modal permission is one only the host can use, which is the point. The
 * frame's `Content-Security-Policy` is the preview's (`html-frame.ts`), so a
 * print is subject to the same `img-src` and `font-src` as the screen.
 *
 * ## The file name is the tab's title
 *
 * The dialog proposes the document title as the PDF's name. Chrome takes the
 * title of the TAB, not of the frame being printed: measured with Google Chrome
 * printing such a frame straight to "Save as PDF", a frame titled `FrameTitle`
 * in a tab titled `HostTitle` saved `HostTitle.pdf`. So the host document's
 * title is set to the suggested name for the duration of the print and put
 * back afterwards. `print()` on a frame returns at once, before Chrome has read
 * the title, so the title is restored on the frame's `afterprint` event and not
 * when the call returns: restored on return, the same measurement saved the
 * restored title instead. The copy carries the name as its own `<title>` too,
 * for a browser that reads the frame's.
 *
 * A view rendered inside a frame of its host's sets that frame's title, which
 * is not the tab's: such a host names the tab itself, or delivers the PDF its
 * own way.
 */

export interface PrintHtmlOptions {
  /**
   * The name the print dialog proposes for the PDF, without the extension (a
   * trailing `.pdf` is dropped). Unset, the dialog proposes what it would
   * anyway: the tab's title.
   */
  title?: string;
  /** The copy's `img-src`, as `HtmlPreview`'s. */
  imgSrc?: string;
  /** The copy's `font-src`, as `HtmlPreview`'s. Follows `imgSrc` when unset. */
  fontSrc?: string;
  /** The typeface a fragment is printed in, when its own CSS names none. */
  fontFamily?: string;
}

/** How long a print waits on fonts and images before printing anyway. */
const SETTLE_TIMEOUT_MS = 10_000;
/** How long `beforeprint` may take before the print is taken as refused. */
const PRINT_START_TIMEOUT_MS = 3_000;

/** The print in progress, so a second one first tears the first down. */
let active: (() => void) | undefined;

/**
 * Print `content` through the browser's print dialog. Resolves once the dialog
 * has started (`beforeprint` fired); rejects when the copy could not be built
 * or the browser refused to print it — inside a host frame sandboxed without
 * `allow-modals`, for one.
 */
export async function printHtml(
  content: HtmlContentView,
  {
    title,
    imgSrc = DEFAULT_IMG_SRC,
    fontSrc,
    fontFamily = 'system-ui, sans-serif',
  }: PrintHtmlOptions = {},
): Promise<void> {
  active?.();
  const host = document;
  const name = title === undefined ? undefined : pdfTitle(title);
  const frame = host.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.title = name ?? 'Print';
  // Laid out, at A4's width, rather than `display: none`: a frame that is not
  // rendered lays nothing out, so its fonts never start loading and
  // `fonts.ready` resolves over faces that were never asked for.
  Object.assign(frame.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '794px',
    height: '1123px',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
  });
  frame.srcdoc = frameDocument(content, {
    styles: frameStyles(pageTypography(fontFamily), { print: true }),
    imgSrc,
    fontSrc: fontSrc ?? imgSrc,
    ...(name === undefined ? {} : { title: name }),
  });

  const previousTitle = host.title;
  let swapped = false;
  const finish = () => {
    if (active === finish) active = undefined;
    // Only our own title is put back: a host that retitled its page meanwhile
    // keeps its new one.
    if (swapped && host.title === name) host.title = previousTitle;
    swapped = false;
    frame.remove();
  };
  active = finish;

  try {
    const loaded = new Promise<void>((resolve) =>
      frame.addEventListener('load', () => resolve(), { once: true }),
    );
    host.body.append(frame);
    await loaded;
    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!win || !doc) throw new Error('The print copy could not be opened');
    await settle(doc);
    if (active !== finish) return; // a later print took over while this one waited

    const started = new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), PRINT_START_TIMEOUT_MS);
      win.addEventListener(
        'beforeprint',
        () => {
          clearTimeout(timer);
          resolve(true);
        },
        { once: true },
      );
    });
    win.addEventListener('afterprint', finish, { once: true });
    if (name !== undefined) {
      host.title = name;
      swapped = true;
    }
    win.print();
    if (!(await started)) throw new Error('The browser did not open its print dialog');
  } catch (error) {
    finish();
    throw error;
  }
}

/** The suggested name as a title: trimmed, without a `.pdf` the dialog adds itself. */
function pdfTitle(name: string): string {
  return name
    .trim()
    .replace(/\.pdf$/i, '')
    .trim();
}

/**
 * Wait for what the copy will print to be there: every image decoded, lazy ones
 * included, and every face its stylesheets declare loaded. The frame's `load`
 * already waited on the images that were fetching; a lazy image below the
 * frame's fold had not started, and a font starts only once text asks for it.
 * Each face is asked for outright, which costs nothing a page did not declare.
 * Bounded, so an image that never answers delays the print rather than
 * swallowing it.
 */
async function settle(doc: Document): Promise<void> {
  const images = Array.from(doc.images, (image) => {
    image.loading = 'eager';
    if (image.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    });
  });
  const fonts = doc.fonts
    ? [
        ...Array.from(doc.fonts, (face) => face.load().then(noop, noop)),
        doc.fonts.ready.then(noop, noop),
      ]
    : [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.all([...images, ...fonts]),
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, SETTLE_TIMEOUT_MS);
    }),
  ]);
  clearTimeout(timer);
}

function noop(): void {}
