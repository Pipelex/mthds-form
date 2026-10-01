import type { HtmlContentView } from '../core/native-content';
import { DEFAULT_IMG_SRC, frameDocument, frameStyles, pageTypography } from './html-frame';
import { FIXED_ATTRIBUTE, measureFlow } from './page-layout';
import { paginate, type PageSlice } from './paginate';
import { promotePrintRules, readPageBox, type PageBox } from './print-media';

/**
 * Make a PDF of an HTML page in the browser, with no server and no dialog: lay
 * a script-free copy of the page out as it would print, rasterise it, cut the
 * raster into pages at block boundaries, and wrap the pages in a PDF.
 *
 * ## The copy
 *
 * The page is laid out in a hidden frame of its own, never the preview on
 * screen, which carries the host's theme and is sized to the panel. The frame
 * document is the preview's (`html-frame.ts`), under the same policy: the same
 * `img-src` and `font-src`, no scripts. It is sandboxed `allow-same-origin` and
 * nothing else, so the host can read its layout and computed style, and the
 * markup still runs nothing: same-origin is dangerous only together with
 * scripts.
 *
 * Once loaded, every image is made eager and awaited and every face the page
 * declares is asked for and awaited, a face used only in print included; then
 * the page's print rules are promoted (`print-media.ts`), its `@page` box read,
 * and the frame resized to the page's drawable width and height, so the copy is
 * laid out as the print engine would lay it out on one sheet.
 *
 * ## The raster
 *
 * `modern-screenshot` clones the copy into an SVG `foreignObject`, inlining each
 * element's computed style and embedding the fonts and images it uses as data
 * URLs, which is what lets the browser paint it as an image. It is rendered
 * once for the flow, with the elements laid out `position: fixed` left out,
 * and once for those elements alone at one page's height, laid over every page
 * as a print engine repeats them. Each stretch of the flow a page draws is
 * painted from the SVG through its own `viewBox` at `scale` device pixels per
 * CSS pixel, so only one page is ever held as pixels, and text is rasterised
 * at print resolution rather than scaled up.
 *
 * ## The PDF
 *
 * Each page is encoded as a JPEG and placed full-bleed on a page of the size
 * the page box says, by `jspdf`. Both libraries are loaded with `import()` on
 * first use, so a host that never makes a PDF ships neither.
 */

export interface HtmlPdfOptions {
  /** The copy's `img-src`, as `HtmlPreview`'s. */
  imgSrc?: string;
  /** The copy's `font-src`, as `HtmlPreview`'s. Follows `imgSrc` when unset. */
  fontSrc?: string;
  /** The typeface a fragment is laid out in, when its own CSS names none. */
  fontFamily?: string;
  /** The PDF's document title, in its metadata. */
  title?: string;
  /**
   * Device pixels per CSS pixel of the raster. 3 (288 dpi) when unset; 2 is
   * the least that prints crisp.
   */
  scale?: number;
  /** JPEG quality of each page, from 0 to 1. 0.92 when unset. */
  quality?: number;
}

/** What `renderHtmlPdf` produced, for a caller that wants more than the bytes. */
export interface HtmlPdf {
  blob: Blob;
  pageCount: number;
  /** The page box the PDF was laid out on, in CSS pixels. */
  page: PageBox;
}

/** How long the copy waits on fonts and images before laying out anyway. */
const SETTLE_TIMEOUT_MS = 10_000;
/** Points per CSS pixel: a PDF measures in points, 72 to the inch. */
const PT_PER_PX = 72 / 96;

/**
 * Render `content` to a PDF. Rejects when the copy cannot be built or painted,
 * or when the libraries that paint and assemble it cannot be loaded.
 */
export async function renderHtmlPdf(
  content: HtmlContentView,
  {
    imgSrc = DEFAULT_IMG_SRC,
    fontSrc,
    fontFamily = 'system-ui, sans-serif',
    title,
    scale = 3,
    quality = 0.92,
  }: HtmlPdfOptions = {},
): Promise<HtmlPdf> {
  // Started first: the libraries load while the copy does.
  const libraries = Promise.all([import('modern-screenshot'), import('jspdf')]);
  const copy = await openCopy(content, {
    imgSrc,
    fontSrc: fontSrc ?? imgSrc,
    fontFamily,
  });
  try {
    const { doc } = copy;
    promotePrintRules(doc);
    const page = readPageBox(doc);
    const area = {
      width: page.width - page.margin.left - page.margin.right,
      height: page.height - page.margin.top - page.margin.bottom,
    };
    copy.frame.style.width = `${area.width}px`;
    copy.frame.style.height = `${area.height}px`;
    // Laid out at the new size before anything is measured; reading a box's
    // geometry forces the layout, and a frame resize needs a frame to apply.
    await nextFrame();
    // Again: a print rule can show an image or a face the screen hid, and
    // rewriting the media queries rebuilds the copy's faces, unloaded.
    await settle(doc);

    const { layout, fixed } = measureFlow(doc);
    const slices = paginate(layout, area.height);
    const [{ domToForeignObjectSvg }, { jsPDF }] = await libraries;

    const root = doc.documentElement;
    // The rasteriser reads default styles from a frame it adds to the copy;
    // that frame is not part of the page.
    const notOurs = (node: Node) =>
      node.nodeType !== 1 || !(node as Element).id.startsWith('__SANDBOX__');
    const flow = await domToForeignObjectSvg(root, {
      width: area.width,
      height: layout.height,
      filter: (node) => notOurs(node) && !isFixed(node),
    });
    const overlay =
      fixed.length > 0
        ? await paintFixed(doc, fixed, area, domToForeignObjectSvg, notOurs)
        : undefined;

    const landscape = page.width > page.height;
    const pdf = new jsPDF({
      unit: 'pt',
      format: [page.width * PT_PER_PX, page.height * PT_PER_PX],
      orientation: landscape ? 'landscape' : 'portrait',
      compress: true,
    });
    if (title) pdf.setProperties({ title });
    for (const [index, slice] of slices.entries()) {
      const jpeg = await paintPage(slice, page, area, scale, quality, flow, overlay);
      if (index > 0)
        pdf.addPage(
          [page.width * PT_PER_PX, page.height * PT_PER_PX],
          landscape ? 'landscape' : 'portrait',
        );
      pdf.addImage(
        jpeg,
        'JPEG',
        0,
        0,
        page.width * PT_PER_PX,
        page.height * PT_PER_PX,
        undefined,
        'NONE',
      );
    }
    return { blob: pdf.output('blob'), pageCount: slices.length, page };
  } finally {
    copy.frame.remove();
  }
}

function isFixed(node: Node): boolean {
  return node.nodeType === 1 && (node as Element).hasAttribute(FIXED_ATTRIBUTE);
}

type ToSvg = (typeof import('modern-screenshot'))['domToForeignObjectSvg'];

/**
 * The elements laid out `position: fixed`, alone, at one page's drawable size.
 * Everything else is made invisible rather than removed, so nothing moves; each
 * fixed element is pinned where the copy laid it out, in the page's coordinates,
 * since a `foreignObject` is not a viewport for `position: fixed`.
 */
async function paintFixed(
  doc: Document,
  fixed: readonly HTMLElement[],
  area: { width: number; height: number },
  toSvg: ToSvg,
  notOurs: (node: Node) => boolean,
): Promise<SVGElement> {
  const root = doc.documentElement;
  const keep = new Set<Node>();
  for (const el of fixed) {
    for (let node: Node | null = el; node; node = node.parentNode) keep.add(node);
  }
  const pins = new Map(fixed.map((el, i) => [String(i), el.getBoundingClientRect()]));
  fixed.forEach((el, i) => el.setAttribute(FIXED_ATTRIBUTE, String(i)));
  const previous = root.style.getPropertyValue('visibility');
  root.style.setProperty('visibility', 'hidden', 'important');
  fixed.forEach((el) => el.style.setProperty('visibility', 'visible', 'important'));
  try {
    return await toSvg(root, {
      width: area.width,
      height: area.height,
      filter: (node) => notOurs(node) && (keep.has(node) || insideFixed(node, fixed)),
      onCloneNode: (clone) => {
        const cloned = clone as HTMLElement;
        cloned.style.setProperty('position', 'relative');
        for (const el of Array.from(cloned.querySelectorAll<HTMLElement>(`[${FIXED_ATTRIBUTE}]`))) {
          const pin = pins.get(el.getAttribute(FIXED_ATTRIBUTE) ?? '');
          if (!pin) continue;
          Object.assign(el.style, {
            position: 'absolute',
            top: `${pin.top}px`,
            left: `${pin.left}px`,
            width: `${pin.width}px`,
            height: `${pin.height}px`,
            right: 'auto',
            bottom: 'auto',
            margin: '0',
          });
        }
      },
    });
  } finally {
    if (previous) root.style.setProperty('visibility', previous);
    else root.style.removeProperty('visibility');
    fixed.forEach((el) => el.style.removeProperty('visibility'));
  }
}

function insideFixed(node: Node, fixed: readonly HTMLElement[]): boolean {
  return fixed.some((el) => el.contains(node));
}

/**
 * One page as a JPEG: white paper, the page's stretches of the flow at its
 * margins (repeated table headers, its body, repeated table footers), then the
 * fixed elements over the drawable area.
 */
async function paintPage(
  slice: PageSlice,
  page: PageBox,
  area: { width: number; height: number },
  scale: number,
  quality: number,
  flow: SVGElement,
  overlay: SVGElement | undefined,
): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(page.width * scale);
  canvas.height = Math.round(page.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No 2D canvas to paint the PDF page on');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  let y = page.margin.top;
  for (const span of [...slice.heads, slice.body, ...slice.feet]) {
    const height = span.bottom - span.top;
    if (height <= 0) continue;
    const image = await svgImage(flow, { top: span.top, width: area.width, height }, scale);
    context.drawImage(
      image,
      page.margin.left * scale,
      y * scale,
      area.width * scale,
      height * scale,
    );
    y += height;
  }
  if (overlay) {
    const image = await svgImage(overlay, { top: 0, ...area }, scale);
    context.drawImage(
      image,
      page.margin.left * scale,
      page.margin.top * scale,
      area.width * scale,
      area.height * scale,
    );
  }
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
  if (!blob) throw new Error('The PDF page could not be encoded');
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * A stretch of an SVG as an image whose own pixel size is the stretch's at
 * `scale`, so the browser rasterises the text at that resolution rather than
 * scaling a screen-resolution bitmap up.
 */
async function svgImage(
  svg: SVGElement,
  { top, width, height }: { top: number; width: number; height: number },
  scale: number,
): Promise<HTMLImageElement> {
  const copy = svg.cloneNode(false) as SVGElement;
  copy.setAttribute('viewBox', `0 ${top} ${width} ${height}`);
  copy.setAttribute('width', String(Math.max(1, Math.round(width * scale))));
  copy.setAttribute('height', String(Math.max(1, Math.round(height * scale))));
  copy.setAttribute('preserveAspectRatio', 'none');
  for (const child of Array.from(svg.childNodes)) copy.appendChild(child.cloneNode(true));
  // The library sizes its `foreignObject` at 100% of the viewport, which a
  // `viewBox` narrowed to one stretch would shrink to that stretch, leaving
  // everything below the first one out. Pinned to the whole flow instead.
  const object = Array.from(copy.children).find((child) => child.localName === 'foreignObject');
  object?.setAttribute('width', svg.getAttribute('width') ?? String(width));
  object?.setAttribute('height', svg.getAttribute('height') ?? String(top + height));
  const markup = new XMLSerializer()
    .serializeToString(copy)
    // Characters XML forbids, which a page's text can carry and which would
    // make the whole image fail to decode. Matching them is the point.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\v\f\u000E-\u001F￾￿]/g, '');
  const image = new Image();
  image.decoding = 'sync';
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await image.decode();
  return image;
}

interface Copy {
  frame: HTMLIFrameElement;
  doc: Document;
}

/**
 * The page in a hidden frame of its own: script-free, same-origin so its layout
 * can be read, laid out (not `display: none`, which lays nothing out and loads
 * no font) off screen, at A4's width until its own page box is known.
 */
async function openCopy(
  content: HtmlContentView,
  { imgSrc, fontSrc, fontFamily }: { imgSrc: string; fontSrc: string; fontFamily: string },
): Promise<Copy> {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('data-mthds-pdf-copy', '');
  frame.tabIndex = -1;
  frame.title = 'PDF';
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
    styles: frameStyles(pageTypography(fontFamily)),
    imgSrc,
    fontSrc,
  });
  const loaded = new Promise<void>((resolve) =>
    frame.addEventListener('load', () => resolve(), { once: true }),
  );
  document.body.append(frame);
  try {
    await loaded;
    const doc = frame.contentDocument;
    if (!doc?.defaultView) throw new Error('The PDF copy could not be opened');
    await settle(doc);
    return { frame, doc };
  } catch (error) {
    frame.remove();
    throw error;
  }
}

/**
 * Wait for what the copy will paint to be there: every image decoded, lazy ones
 * included, and every face its stylesheets declare loaded. A lazy image below
 * the frame's fold has not started, and a font starts only once text asks for
 * it, so each face is asked for outright. Bounded, so an image that never
 * answers delays the PDF rather than swallowing it.
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

/** One rendering frame of the host, bounded for a tab that renders none. */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 100);
    requestAnimationFrame(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function noop(): void {}
