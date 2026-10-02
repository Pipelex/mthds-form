import type { FlowLayout, Span, TableBox } from './paginate';

/**
 * Measure the PDF copy's laid-out flow for `paginate`: where its lines, atomic
 * boxes, rows and tables sit, and what its break properties say. Everything is
 * read off the copy's own layout (`getBoundingClientRect`, a `Range` over each
 * text node for its line boxes) and its computed style, after the print rules
 * were promoted, so a `break-*` written only for print counts.
 *
 * Elements laid out `position: fixed` are not part of the flow: a print engine
 * repeats them on every page, and so does the PDF, from a separate raster.
 * They are marked with `FIXED_ATTRIBUTE` for the rasteriser to tell apart.
 */

/** Set on each element laid out `position: fixed` in the copy, outermost only. */
export const FIXED_ATTRIBUTE = 'data-mthds-pdf-fixed';

/** Elements whose content is one picture: never cut, never walked into. */
const ATOMIC_TAGS = new Set([
  'IMG',
  'SVG',
  'CANVAS',
  'VIDEO',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'BUTTON',
  'HR',
  'PICTURE',
  'svg',
]);

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

/** Break values that start a new page. */
const FORCED = new Set(['page', 'always', 'left', 'right', 'recto', 'verso']);
/** Break values that keep the two sides of a boundary together. */
const AVOIDED = new Set(['avoid', 'avoid-page']);

export interface MeasuredFlow {
  layout: FlowLayout;
  /** The elements laid out `position: fixed`, which every page repeats. */
  fixed: HTMLElement[];
}

export function measureFlow(doc: Document): MeasuredFlow {
  const win = doc.defaultView!;
  const root = doc.documentElement;
  const offset = root.getBoundingClientRect().top;
  const y = (value: number) => value - offset;
  const spanOf = (el: Element): Span => {
    const rect = el.getBoundingClientRect();
    return { top: y(rect.top), bottom: y(rect.bottom) };
  };

  const hard: Span[] = [];
  const avoid: Span[] = [];
  const forced: number[] = [];
  const tables: TableBox[] = [];
  const fixed: HTMLElement[] = [];
  // Boundaries to keep together, resolved once every line is known.
  const keepAfter: Span[] = [];
  const keepBefore: Span[] = [];

  const walk = (el: Element) => {
    const style = win.getComputedStyle(el);
    if (style.display === 'none') return;
    if (style.position === 'fixed') {
      fixed.push(el as HTMLElement);
      return;
    }
    const span = spanOf(el);
    const display = style.display;

    if (FORCED.has(style.breakBefore) || FORCED.has(style.getPropertyValue('page-break-before'))) {
      forced.push(span.top);
    }
    if (FORCED.has(style.breakAfter) || FORCED.has(style.getPropertyValue('page-break-after'))) {
      forced.push(span.bottom);
    }
    if (AVOIDED.has(style.breakAfter) || HEADING_TAGS.has(el.tagName)) keepAfter.push(span);
    if (AVOIDED.has(style.breakBefore)) keepBefore.push(span);

    // An inline-level box (`inline-block`, `inline-flex`, `inline-table`…) sits
    // on a line, so it is cut no more than the line is.
    const atomic = ATOMIC_TAGS.has(el.tagName) || display.startsWith('inline-');
    if (atomic) {
      if (span.bottom > span.top) hard.push(span);
      return;
    }
    if (
      AVOIDED.has(style.breakInside) ||
      AVOIDED.has(style.getPropertyValue('page-break-inside')) ||
      display === 'table-row'
    ) {
      avoid.push(span);
    }
    if (display === 'table' || display === 'inline-table') {
      tables.push(tableBox(el, span));
    }

    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 1) walk(child as Element);
      else if (child.nodeType === 3 && /\S/.test(child.textContent ?? '')) {
        hard.push(...lineSpans(doc, child, y));
      }
    }
  };

  const tableBox = (table: Element, span: Span): TableBox => {
    const box: TableBox = { ...span };
    for (const part of Array.from(table.children)) {
      const display = win.getComputedStyle(part).display;
      if (display === 'table-header-group' && !box.head) box.head = spanOf(part);
      if (display === 'table-footer-group' && !box.foot) box.foot = spanOf(part);
    }
    return box;
  };

  walk(doc.body ?? root);
  fixed.forEach((el) => el.setAttribute(FIXED_ATTRIBUTE, ''));

  const lines = [...hard].sort((a, b) => a.top - b.top);
  const firstLineFrom = (at: number) => lines.find((line) => line.top >= at - 0.5);
  const lastLineBefore = (at: number) =>
    [...lines].reverse().find((line) => line.bottom <= at + 0.5);

  // A heading, or a box saying `break-after: avoid`, stays with the line after it.
  for (const span of keepAfter) {
    const next = firstLineFrom(span.bottom);
    if (next) avoid.push({ top: span.top, bottom: next.bottom });
  }
  // A box saying `break-before: avoid` stays with the line before it.
  for (const span of keepBefore) {
    const previous = lastLineBefore(span.top);
    const first = firstLineFrom(span.top);
    if (previous && first) avoid.push({ top: previous.top, bottom: first.bottom });
  }
  // A table's header is never left alone at the foot of a page: it stays with
  // the first line below it.
  for (const table of tables) {
    if (!table.head) continue;
    const next = firstLineFrom(table.head.bottom);
    if (next && next.bottom <= (table.foot?.top ?? table.bottom) + 0.5) {
      avoid.push({ top: table.top, bottom: next.bottom });
    }
  }

  return {
    layout: { height: root.scrollHeight, hard, avoid, forced, tables },
    fixed,
  };
}

/**
 * The line boxes a text node was laid out in: one rectangle per line fragment,
 * read from a `Range`, merged where fragments share a line.
 */
function lineSpans(doc: Document, text: Node, y: (value: number) => number): Span[] {
  const range = doc.createRange();
  range.selectNodeContents(text);
  const spans: Span[] = [];
  for (const rect of Array.from(range.getClientRects())) {
    if (rect.height === 0) continue;
    const span = { top: y(rect.top), bottom: y(rect.bottom) };
    const same = spans.find((line) => span.top < line.bottom && span.bottom > line.top);
    if (same) {
      same.top = Math.min(same.top, span.top);
      same.bottom = Math.max(same.bottom, span.bottom);
    } else spans.push(span);
  }
  return spans;
}
