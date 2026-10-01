/**
 * Where a page laid out as one long flow is cut into printed pages. Pure: it
 * reads a measured layout (`page-layout.ts` measures one in the PDF copy) and
 * returns, for each page, the stretches of the flow to draw on it, so the rules
 * can be tested without a browser.
 *
 * A browser's print engine fragments a page as it lays it out; a raster has
 * already been laid out, so the cuts are chosen after the fact, at block
 * boundaries, from what the layout says must stay whole:
 *
 * - **A line of text, an image or any atomic box is never cut** (a `hard`
 *   span), unless one is taller than a page, which cannot be helped.
 * - **A table row, a box marked `break-inside: avoid`, a heading with the line
 *   after it, and a table's header with its first row stay together** (an
 *   `avoid` span) when they fit on a page. One that does not fit is dropped as
 *   a constraint, which is what a print engine does with it too.
 * - **A forced break** (`break-before: page`, `break-after: page` and their
 *   `page-break-*` aliases) starts a new page.
 * - **A table cut across pages repeats its header** at the top of the next
 *   page and **its footer** at the bottom of the page it was cut on, as a
 *   print engine repeats `thead` and `tfoot`.
 */

/** A stretch of the flow, in CSS pixels from the top of the document. */
export interface Span {
  top: number;
  bottom: number;
}

/** A table, for its repeated header and footer. */
export interface TableBox extends Span {
  /** Its `thead` (a `table-header-group`), when it has one. */
  head?: Span;
  /** Its `tfoot` (a `table-footer-group`), when it has one. */
  foot?: Span;
}

export interface FlowLayout {
  /** The height of the whole flow: where the last page ends. */
  height: number;
  /** Lines of text and atomic boxes: never cut, unless taller than a page. */
  hard: Span[];
  /** What should stay together on one page when it fits. */
  avoid: Span[];
  /** Positions a new page must start at. */
  forced: number[];
  tables: TableBox[];
}

/** What one page draws, top to bottom, each stretch in flow coordinates. */
export interface PageSlice {
  /** The repeated headers of the tables this page continues, outermost first. */
  heads: Span[];
  /** The page's own stretch of the flow. */
  body: Span;
  /** The repeated footers of the tables cut at the page's end, innermost first. */
  feet: Span[];
}

/** Below this, two positions are the same position: layout is fractional. */
const EPSILON = 0.5;

/**
 * Cut `layout` into pages whose drawable area is `pageHeight` CSS pixels tall.
 */
export function paginate(layout: FlowLayout, pageHeight: number): PageSlice[] {
  const pages: PageSlice[] = [];
  const end = layout.height;
  // What carries ink, so a trailing stretch of blank flow (a bottom margin, a
  // min-height) does not become a page of its own.
  const inkBottom = Math.max(0, ...layout.hard.map((span) => span.bottom));
  const forced = [...layout.forced].sort((a, b) => a - b);
  let start = 0;

  // A page always moves the cut forward, so the loop ends; the bound is a
  // backstop against a layout that reports nonsense.
  for (let guard = 0; start < end - EPSILON && guard < 10_000; guard++) {
    const heads = openAt(layout.tables, start)
      .filter((table) => table.head && start >= table.head.bottom - EPSILON)
      .map((table) => table.head!);
    const room = pageHeight - total(heads);
    const nextForced = forced.find((at) => at > start + EPSILON && at < end - EPSILON);

    if (end - start <= room + EPSILON && nextForced === undefined) {
      pages.push({ heads, body: { top: start, bottom: end }, feet: [] });
      break;
    }

    // The tables cut at the page's end lend it their footers, which take room
    // from the page, which can move the cut: settle it in a few passes.
    let feet: Span[] = [];
    let cut = start;
    for (let pass = 0; pass < 4; pass++) {
      const limit = start + room - total(feet);
      cut =
        nextForced !== undefined && nextForced <= limit + EPSILON
          ? nextForced
          : bestCut(layout, start, limit);
      const needed = openAt(layout.tables, cut)
        .filter((table) => table.foot)
        .map((table) => table.foot!)
        .reverse();
      if (total(needed) <= total(feet) + EPSILON) {
        feet = needed;
        break;
      }
      feet = needed;
    }
    pages.push({ heads, body: { top: start, bottom: cut }, feet });
    start = cut;
    if (inkBottom <= cut + EPSILON) break;
  }
  return pages;
}

/**
 * The lowest position in `(start, limit]` that cuts nothing that must stay
 * whole: first honouring every span, then lines and atomic boxes alone, then
 * the limit itself when even one line is taller than a page.
 */
function bestCut(layout: FlowLayout, start: number, limit: number): number {
  const room = limit - start;
  const hard = layout.hard.filter((span) => span.bottom - span.top <= room);
  const avoid = layout.avoid.filter((span) => span.bottom - span.top <= room);
  const candidates = new Set<number>([limit]);
  for (const span of [...hard, ...avoid]) {
    candidates.add(span.top);
    candidates.add(span.bottom);
  }
  for (const table of layout.tables) {
    candidates.add(table.top);
    candidates.add(table.bottom);
  }
  const sorted = [...candidates]
    .filter((at) => at > start + EPSILON && at <= limit + EPSILON)
    .sort((a, b) => b - a);
  for (const constraints of [[...hard, ...avoid], hard]) {
    const cut = sorted.find((at) => !constraints.some((span) => inside(span, at)));
    if (cut !== undefined) return Math.min(cut, limit);
  }
  return limit;
}

/** Whether cutting at `at` would cut through `span`. */
function inside(span: Span, at: number): boolean {
  return at > span.top + EPSILON && at < span.bottom - EPSILON;
}

/**
 * The tables a cut at `at` leaves open: begun above it, with body rows still to
 * come below it. A cut at a table's footer or past it has closed the table.
 */
function openAt(tables: readonly TableBox[], at: number): TableBox[] {
  return tables
    .filter((table) => at > table.top + EPSILON && at < (table.foot?.top ?? table.bottom) - EPSILON)
    .sort((a, b) => a.top - b.top);
}

function total(spans: readonly Span[]): number {
  return spans.reduce((sum, span) => sum + (span.bottom - span.top), 0);
}
