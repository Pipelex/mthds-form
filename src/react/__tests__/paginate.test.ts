/**
 * Where a PDF's pages are cut, and how a print rule reads on paper: the pure
 * halves of the PDF download, which need no browser. Measuring a real page and
 * painting it are driven in Chromium by `Outputs/Html page`.
 */
import { describe, expect, it } from 'vitest';
import { paginate, type FlowLayout, type Span } from '../paginate';
import { onPaper } from '../print-media';

/** Lines of `height` pixels stacked from `top`, `count` of them. */
function lines(top: number, count: number, height = 20): Span[] {
  return Array.from({ length: count }, (_, i) => ({
    top: top + i * height,
    bottom: top + (i + 1) * height,
  }));
}

function layout(partial: Partial<FlowLayout> & { height: number }): FlowLayout {
  return { hard: [], avoid: [], forced: [], tables: [], ...partial };
}

describe('paginate', () => {
  it('keeps a page that fits on one page', () => {
    const pages = paginate(layout({ height: 300, hard: lines(0, 15) }), 1000);
    expect(pages).toEqual([{ heads: [], body: { top: 0, bottom: 300 }, feet: [] }]);
  });

  it('never cuts through a line', () => {
    // Lines of 30px from 5: a 100px page fits three, and the cut falls between
    // the third and the fourth rather than at 100.
    const pages = paginate(layout({ height: 305, hard: lines(5, 10, 30) }), 100);
    expect(pages.map((page) => page.body)).toEqual([
      { top: 0, bottom: 95 },
      { top: 95, bottom: 185 },
      { top: 185, bottom: 275 },
      { top: 275, bottom: 305 },
    ]);
  });

  it('keeps a box marked avoid whole when it fits, and drops the rule when it cannot', () => {
    const fits = paginate(
      layout({ height: 400, hard: lines(0, 20), avoid: [{ top: 60, bottom: 140 }] }),
      100,
    );
    expect(fits[0]!.body.bottom).toBe(60);
    const tooTall = paginate(
      layout({ height: 400, hard: lines(0, 20), avoid: [{ top: 60, bottom: 260 }] }),
      100,
    );
    expect(tooTall[0]!.body.bottom).toBe(100);
  });

  it('starts a new page at a forced break', () => {
    const pages = paginate(layout({ height: 200, hard: lines(0, 10), forced: [40] }), 1000);
    expect(pages.map((page) => page.body)).toEqual([
      { top: 0, bottom: 40 },
      { top: 40, bottom: 200 },
    ]);
  });

  it('cuts a line taller than a page where the page ends', () => {
    const pages = paginate(layout({ height: 250, hard: [{ top: 0, bottom: 250 }] }), 100);
    expect(pages.map((page) => page.body.bottom)).toEqual([100, 200, 250]);
  });

  it('drops a trailing stretch with nothing on it', () => {
    const pages = paginate(layout({ height: 1050, hard: lines(0, 5) }), 1000);
    expect(pages).toHaveLength(1);
    expect(pages[0]!.body).toEqual({ top: 0, bottom: 1000 });
  });

  it('repeats a cut table’s header and footer', () => {
    // A table from 0 to 400: a 30px header, rows of 30px, a 20px footer.
    const rows = lines(30, 11, 30);
    const table = {
      top: 0,
      bottom: 380,
      head: { top: 0, bottom: 30 },
      foot: { top: 360, bottom: 380 },
    };
    const pages = paginate(layout({ height: 380, hard: rows, avoid: rows, tables: [table] }), 200);
    // The first page keeps 20px for the footer: header + 5 rows = 180.
    expect(pages[0]).toEqual({ heads: [], body: { top: 0, bottom: 180 }, feet: [table.foot] });
    // The next carries the header again over the rows that follow.
    expect(pages[1]!.heads).toEqual([table.head]);
    expect(pages[1]!.body.top).toBe(180);
    // Every page fits its drawable height.
    for (const page of pages) {
      const drawn = [...page.heads, page.body, ...page.feet].reduce(
        (sum, span) => sum + span.bottom - span.top,
        0,
      );
      expect(drawn).toBeLessThanOrEqual(200);
    }
    // And the last ends on the table's own footer, with no copy of it.
    expect(pages.at(-1)!.body.bottom).toBe(380);
    expect(pages.at(-1)!.feet).toEqual([]);
  });
});

describe('a media query on paper', () => {
  it.each([
    ['print', 'all'],
    ['screen', 'not all'],
    ['only print', 'all'],
    ['not print', 'not all'],
    ['not screen', 'all'],
    ['print and (orientation: portrait)', 'all and (orientation: portrait)'],
    ['screen and (min-width: 600px)', 'not all'],
    ['all', 'all'],
    ['(min-width: 600px)', '(min-width: 600px)'],
    ['speech', 'not all'],
  ])('%s reads %s', (query, expected) => {
    expect(onPaper(query)).toBe(expected);
  });
});
