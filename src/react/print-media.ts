/**
 * A page's print stylesheet, applied on screen: what the PDF copy needs before
 * it is laid out and rasterised, since a browser offers no way to lay a frame
 * out as `print` media short of printing it.
 *
 * ## Promoting the print rules
 *
 * Every media query in the copy's stylesheets is rewritten to say what it would
 * say on paper: a query on `print` becomes one on `all`, a query on `screen` (or
 * any other media type) becomes `not all`, and `not` flips both, so `@media
 * print { … }` now applies and `@media screen { … }` no longer does, in the
 * order the author wrote them. A query with no media type (`@media (min-width:
 * 600px)`) is left alone: it is about the page's size, which the copy is laid
 * out at. A `<style media="print">` is rewritten the same way.
 *
 * Rewriting the queries in place, rather than unwrapping the rules out of their
 * blocks, keeps the cascade exactly as written: a print rule still comes after
 * the screen rules it overrides, and nested blocks keep their nesting.
 *
 * ## The page box
 *
 * `@page` says the sheet's size and margins. A rule with no selector is read,
 * the last one winning per property, as in the cascade; `:first`, `:left` and
 * named pages are not. A size is a keyword (`A4`, `letter`, optionally with
 * `landscape`) or two lengths; a margin is a length. What a page does not say is
 * A4 portrait with 1 cm margins on every side — what Chrome's own print uses
 * when a page names none, so a template laid out against Chrome's print lands
 * the same way.
 */

/** A page's size and margins, in CSS pixels (96 to the inch). */
export interface PageBox {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

const PX_PER_MM = 96 / 25.4;

/** Paper sizes by name, portrait, in millimetres. */
const PAPER: Record<string, [number, number]> = {
  a3: [297, 420],
  a4: [210, 297],
  a5: [148, 210],
  b4: [250, 353],
  b5: [176, 250],
  'jis-b4': [257, 364],
  'jis-b5': [182, 257],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
  ledger: [279.4, 431.8],
};

/** A4 with Chrome's default 1 cm margins: what a page that says nothing prints on. */
export const DEFAULT_PAGE_BOX: PageBox = {
  width: 210 * PX_PER_MM,
  height: 297 * PX_PER_MM,
  margin: {
    top: 10 * PX_PER_MM,
    right: 10 * PX_PER_MM,
    bottom: 10 * PX_PER_MM,
    left: 10 * PX_PER_MM,
  },
};

/** Rewrite every media query in `doc` to what it says on paper. */
export function promotePrintRules(doc: Document): void {
  for (const sheet of Array.from(doc.styleSheets)) {
    if (sheet.media.length > 0) rewriteMedia(sheet.media);
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // a sheet the copy cannot read is one it cannot rewrite either
    }
    rewriteRules(rules);
  }
}

function rewriteRules(rules: CSSRuleList): void {
  for (const rule of Array.from(rules)) {
    if (isMediaRule(rule)) rewriteMedia(rule.media);
    if ('cssRules' in rule) rewriteRules((rule as CSSGroupingRule).cssRules);
  }
}

function isMediaRule(rule: CSSRule): rule is CSSMediaRule {
  return rule.constructor.name === 'CSSMediaRule' || rule.type === 4;
}

function rewriteMedia(media: MediaList): void {
  const queries = Array.from({ length: media.length }, (_, i) => media.item(i) ?? '');
  const printed = queries.map(onPaper);
  if (printed.every((query, i) => query === queries[i])) return;
  media.mediaText = printed.join(', ');
}

const MEDIA_QUERY = /^\s*(not\s+|only\s+)?([a-z][a-z-]*)(\s+and\s+[\s\S]*)?\s*$/i;

/** One media query as it reads in print. Exported for its tests. */
export function onPaper(query: string): string {
  const match = MEDIA_QUERY.exec(query);
  // No media type, or not one this parser reads: about size, not medium.
  if (!match) return query;
  const [, prefix = '', type = '', rest = ''] = match;
  const negated = /^not/i.test(prefix);
  const typeHolds = ['print', 'all'].includes(type.toLowerCase());
  if (negated) return typeHolds ? `not all${rest}` : 'all';
  return typeHolds ? `all${rest}` : 'not all';
}

/** The page box `doc`'s `@page` rules declare, over A4 with 1 cm margins. */
export function readPageBox(doc: Document): PageBox {
  let size = '';
  const margin: Partial<Record<keyof PageBox['margin'], string>> = {};
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule.constructor.name === 'CSSPageRule' || rule.type === 6) {
        const page = rule as CSSPageRule;
        if (page.selectorText.trim() !== '') continue;
        size = page.style.getPropertyValue('size') || size;
        for (const side of ['top', 'right', 'bottom', 'left'] as const) {
          const value = page.style.getPropertyValue(`margin-${side}`);
          if (value) margin[side] = value;
        }
      } else if (isMediaRule(rule)) {
        if (doc.defaultView?.matchMedia(rule.media.mediaText).matches !== false)
          visit(rule.cssRules);
      } else if ('cssRules' in rule) {
        visit((rule as CSSGroupingRule).cssRules);
      }
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // unreadable: it declares nothing we can see
    }
  }
  const [width, height] = pageSize(size);
  const side = (name: keyof PageBox['margin']) => {
    const declared = margin[name];
    const px = declared === undefined ? undefined : toPx(declared);
    return px ?? DEFAULT_PAGE_BOX.margin[name];
  };
  return {
    width,
    height,
    margin: { top: side('top'), right: side('right'), bottom: side('bottom'), left: side('left') },
  };
}

/** A `size` value as width and height in pixels; A4 portrait when it says neither. */
function pageSize(value: string): [number, number] {
  const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const landscape = words.includes('landscape');
  const named = words.find((word) => word in PAPER);
  const lengths = words.map(toPx).filter((px): px is number => px !== undefined);
  let width = DEFAULT_PAGE_BOX.width;
  let height = DEFAULT_PAGE_BOX.height;
  if (named) {
    [width, height] = PAPER[named]!.map((mm) => mm * PX_PER_MM) as [number, number];
  } else if (lengths.length === 2) {
    [width, height] = lengths as [number, number];
  } else if (lengths.length === 1) {
    width = height = lengths[0]!;
  }
  if (landscape && width < height) [width, height] = [height, width];
  return [width, height];
}

const UNIT_PX: Record<string, number> = {
  px: 1,
  in: 96,
  cm: 10 * PX_PER_MM,
  mm: PX_PER_MM,
  q: PX_PER_MM / 4,
  pt: 96 / 72,
  pc: 16,
};

/** An absolute CSS length in pixels; `undefined` for anything else. */
function toPx(value: string): number | undefined {
  const match = /^(-?\d*\.?\d+)([a-z]*)$/i.exec(value.trim());
  if (!match) return undefined;
  const amount = Number(match[1]);
  const unit = (match[2] || 'px').toLowerCase();
  if (amount === 0) return 0;
  const factor = UNIT_PX[unit];
  return factor === undefined ? undefined : amount * factor;
}
