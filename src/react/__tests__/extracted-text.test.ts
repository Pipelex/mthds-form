import { describe, expect, it } from 'vitest';
import { PAYLOADS } from '../../__stories__/_generated/results.payloads';
import { readPageContent } from '../../core/native-content';
import { splitExtractedText } from '../extracted-text';

/** The real extraction in the corpus: one page of a PDF, with a table and a page-number comment. */
function extractedPage(): string {
  const payload = PAYLOADS['results.page_result'] as { items: unknown[] };
  const text = readPageContent(payload.items[0])?.text;
  if (text === undefined) throw new Error('The page fixture holds no text');
  return text;
}

describe('splitExtractedText', () => {
  it('drops every comment, whatever it holds', () => {
    const segments = splitExtractedText(
      '<!-- PageHeader="Report" -->\n# Title\n\nBody\n<!-- PageNumber="1" -->',
    );
    expect(segments).toEqual([{ kind: 'markdown', text: '\n# Title\n\nBody\n' }]);
  });

  it("reads the real page's table, caption, header row and all", () => {
    const segments = splitExtractedText(extractedPage());
    const tables = segments.flatMap((segment) => (segment.kind === 'table' ? [segment.table] : []));
    expect(tables).toHaveLength(1);
    const [table] = tables;
    expect(table?.caption).toMatch(/^Table 1:/);
    const [head, ...body] = table?.rows ?? [];
    expect(head?.every((cell) => cell.header)).toBe(true);
    expect(head?.[0]?.text).toBe('Planet');
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((row) => row.every((cell) => !cell.header))).toBe(true);
    // The Markdown on either side survives, and no tag or comment does.
    const markdown = segments.flatMap((segment) =>
      segment.kind === 'markdown' ? [segment.text] : [],
    );
    expect(markdown.join('')).toContain('# The Solar System');
    expect(markdown.join('')).not.toMatch(/<\/?t[rdh]\b|<!--|PageNumber/);
  });

  it('keeps the order of text and tables', () => {
    const segments = splitExtractedText(
      'Before\n<table><tr><td>a</td></tr></table>\nBetween\n<table><tr><td>b</td></tr></table>After',
    );
    expect(segments.map((segment) => segment.kind)).toEqual([
      'markdown',
      'table',
      'markdown',
      'table',
      'markdown',
    ]);
  });

  it("reads a cell's markup as its text, a line break kept and entities decoded", () => {
    const [segment] = splitExtractedText(
      '<table><tr><td><strong>Gross</strong><br/>margin &amp; &lt;tax&gt; &#8364;5 &#x2014; ok</td></tr></table>',
    );
    expect(segment).toEqual({
      kind: 'table',
      table: { rows: [[{ text: 'Gross\nmargin & <tax> €5 — ok', header: false }]] },
    });
  });

  it('keeps a span, and drops one that is no span or no table', () => {
    const [segment] = splitExtractedText(
      '<table><tr><th colspan="2">Both</th><td rowspan=3>Tall</td><td colspan="1">One</td><td colspan="5000">Wild</td></tr></table>',
    );
    expect(segment?.kind === 'table' && segment.table.rows[0]).toEqual([
      { text: 'Both', header: true, colSpan: 2 },
      { text: 'Tall', header: false, rowSpan: 3 },
      { text: 'One', header: false },
      { text: 'Wild', header: false },
    ]);
  });

  it('reads a nested table as rows of the outer one, so its close does not end the outer early', () => {
    const segments = splitExtractedText(
      '<table><tr><td>outer<table><tr><td>inner</td></tr></table></td></tr><tr><td>last</td></tr></table>tail',
    );
    expect(segments.map((segment) => segment.kind)).toEqual(['table', 'markdown']);
    const [table] = segments;
    const texts = table?.kind === 'table' ? table.table.rows.flat().map((cell) => cell.text) : [];
    expect(texts).toContain('inner');
    expect(texts).toContain('last');
    expect(texts.join(' ')).not.toMatch(/</);
  });

  it('leaves an unclosed table and a stray closing tag to the Markdown walker', () => {
    expect(splitExtractedText('Text <table><tr><td>a</td></tr>')).toEqual([
      { kind: 'markdown', text: 'Text <table><tr><td>a</td></tr>' },
    ]);
    expect(splitExtractedText('Text </table> more')).toEqual([
      { kind: 'markdown', text: 'Text </table> more' },
    ]);
  });

  it('drops a table with neither a caption nor a row, and blank stretches', () => {
    expect(splitExtractedText('<table></table>\n\n')).toEqual([]);
  });

  it('splits text that is only comments into nothing', () => {
    expect(splitExtractedText('<!-- PageNumber="1" -->\n<!-- PageFooter="x" -->\n')).toEqual([]);
  });

  it('decodes the named references an extractor writes, French and the euro sign included', () => {
    const [segment] = splitExtractedText(
      '<table><caption>R&eacute;sum&eacute; des co&ucirc;ts</caption>' +
        '<tr><td>Total&nbsp;: 12&nbsp;&euro; &mdash; pay&eacute;</td>' +
        '<td>&Eacute;t&eacute; &laquo;&nbsp;&agrave; venir&nbsp;&raquo; &amp; &notanentity;</td></tr></table>',
    );
    expect(segment).toEqual({
      kind: 'table',
      table: {
        caption: 'Résumé des coûts',
        rows: [
          [
            { text: 'Total : 12 € — payé', header: false },
            { text: 'Été « à venir » & &notanentity;', header: false },
          ],
        ],
      },
    });
  });
});

describe('splitExtractedText around code', () => {
  it('leaves a fenced code block exactly as written, its comment and its table included', () => {
    const fence = '```html\n<!-- note -->\n<table><tr><td>a</td></tr></table>\n```';
    const text = `Markup for a table:\n${fence}\nAfter the sample.`;
    expect(splitExtractedText(text)).toEqual([{ kind: 'markdown', text }]);
  });

  it('never splits a fence: a table or a comment around one cannot end inside it', () => {
    const fence = '~~~\n</table> and -->\n~~~';
    for (const opener of ['<table><tr><td>a</td></tr>', '<!-- unclosed']) {
      const text = `${opener}\n${fence}\n`;
      const [segment] = splitExtractedText(text);
      expect(segment?.kind).toBe('markdown');
      expect(segment?.kind === 'markdown' && segment.text).toContain(fence);
    }
  });

  it('keeps an inline code span as written, and reads a real table after it', () => {
    expect(
      splitExtractedText(
        'Write `<table>` and `<!-- x -->` by hand:\n<table><tr><td>real</td></tr></table>',
      ),
    ).toEqual([
      { kind: 'markdown', text: 'Write `<table>` and `<!-- x -->` by hand:\n' },
      { kind: 'table', table: { rows: [[{ text: 'real', header: false }]] } },
    ]);
  });

  it('opens no code span at an escaped or an unmatched backtick', () => {
    const table = '<table><tr><td>t</td></tr></table>';
    for (const text of [
      `An escaped \\\` before ${table} and a \` after`,
      `A lone \` ${table} after`,
    ]) {
      expect(splitExtractedText(text).map((segment) => segment.kind)).toEqual([
        'markdown',
        'table',
        'markdown',
      ]);
    }
  });
});

describe('splitExtractedText with markup other than a table', () => {
  it('reads a figure as its caption and its text, with no tag left', () => {
    const segments = splitExtractedText(
      'Intro\n<figure>\n<figcaption>Figure 1: Revenue by quarter</figcaption>\n' +
        'Revenue <b>rose</b> in Q3.<br/>Costs held.\n<style>p { color: red }</style></figure>\nOutro',
    );
    expect(segments).toHaveLength(1);
    const [segment] = segments;
    const text = segment?.kind === 'markdown' ? segment.text : '';
    expect(text).not.toMatch(/[<>]/);
    expect(text).not.toContain('color');
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    expect(lines).toEqual([
      'Intro',
      'Figure 1: Revenue by quarter',
      'Revenue rose in Q3.',
      'Costs held.',
      'Outro',
    ]);
  });

  it('leaves an autolink, a placeholder and a comparison as written', () => {
    const text = 'See <https://example.com>, fill in <name@example.com> and <your name>; 1 < 2.';
    expect(splitExtractedText(text)).toEqual([{ kind: 'markdown', text }]);
  });
});
