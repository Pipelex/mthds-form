/**
 * An extracted page's text, made readable: its comments dropped and its tables
 * read into a table model, so the result view can typeset the rest as Markdown
 * and draw the tables as tables.
 *
 * ## Why a page's text needs this and a model's answer does not
 *
 * A document extractor writes Markdown, but not only Markdown. It marks the
 * page's furniture with HTML comments (`<!-- PageHeader="Report" -->`,
 * `<!-- PageNumber="1" -->`), and it writes every table as an HTML `<table>`,
 * because a Markdown table cannot hold a caption or a merged cell. The
 * `Markdown` walker deliberately shows an HTML block as its own source rather
 * than injecting it (see `./markdown`), so a page used to print its comments
 * and a wall of `<tr>`/`<td>` tags where its tables were.
 *
 * The answer is not to inject the markup. The extracted text is data from a
 * document nobody here wrote, and putting it into the host's DOM as HTML would
 * be an injection path. So the tables are READ instead: their rows and cells
 * are taken out as text, and the result view draws a table of its own around
 * them. Nothing here returns markup, and nothing that reads this module's
 * output can render one, because a cell is a string.
 *
 * ## What is read, and what is left alone
 *
 * - **A comment is dropped**, whatever it holds. A comment is by definition not
 *   content, and an extractor's comments are page furniture.
 * - **A `<table>` is read**: its `<caption>`, its rows, and each row's `<th>`
 *   and `<td>` cells with their `colspan` and `rowspan`. A cell's own markup
 *   (`<strong>`, a `<br>`) becomes its text, a line break kept as one. Tables
 *   are found by counting `<table>` and `</table>` tags, so a table inside a
 *   cell does not end its outer table early; its rows are read as rows of the
 *   outer table, which is readable and never shows a tag.
 * - **Everything else is left to the Markdown walker**, including any other
 *   HTML an extractor writes, which it shows as source. A table whose closing
 *   tag never comes is left there too, rather than guessed at.
 *
 * Patterns are fine here where they are not for a page the view frames
 * (`./markup-storage`), because nothing is executed or fetched on the strength
 * of what they find: the worst a misread can do is draw a cell's text in the
 * wrong cell.
 */

/** One cell of an extracted table: its text, whether it is a header cell, and its spans. */
export interface ExtractedTableCell {
  text: string;
  header: boolean;
  colSpan?: number;
  rowSpan?: number;
}

/** A table read out of an extracted page. */
export interface ExtractedTable {
  caption?: string;
  rows: readonly (readonly ExtractedTableCell[])[];
}

/** A stretch of an extracted page: Markdown to typeset, or a table to draw. */
export type ExtractedSegment =
  { kind: 'markdown'; text: string } | { kind: 'table'; table: ExtractedTable };

const COMMENT = /<!--[\s\S]*?-->/g;
const TABLE_TAG = /<(\/?)table\b[^>]*>/gi;

/**
 * Split an extracted page's text into the Markdown around its tables and the
 * tables themselves, in order. Empty stretches are left out.
 */
export function splitExtractedText(text: string): ExtractedSegment[] {
  const source = text.replace(COMMENT, '');
  const segments: ExtractedSegment[] = [];
  let cursor = 0;
  let depth = 0;
  let start = -1;
  for (const match of source.matchAll(TABLE_TAG)) {
    const closing = match[1] === '/';
    if (!closing) {
      if (depth === 0) start = match.index;
      depth += 1;
      continue;
    }
    // A stray closing tag outside any table is text, and the walker shows it.
    if (depth === 0) continue;
    depth -= 1;
    if (depth > 0) continue;
    const end = match.index + match[0].length;
    pushMarkdown(segments, source.slice(cursor, start));
    const table = readTable(source.slice(start, end));
    if (table) segments.push({ kind: 'table', table });
    cursor = end;
  }
  // An unclosed table, and whatever follows the last closed one.
  pushMarkdown(segments, source.slice(cursor));
  return segments;
}

function pushMarkdown(segments: ExtractedSegment[], text: string) {
  if (text.trim() !== '') segments.push({ kind: 'markdown', text });
}

const CAPTION = /<caption\b[^>]*>([\s\S]*?)<\/caption\s*>/i;
const ROW_START = /<tr\b[^>]*>/i;
const ROW_END = /<\/tr\s*>/i;
const CELL = /<(td|th)\b([^>]*)>([\s\S]*?)(?=<(?:td|th)\b|$)/gi;
const CELL_END = /<\/t[dh]\s*>[\s\S]*$/i;

/** One table's markup, read. `undefined` when it holds neither a caption nor a row. */
function readTable(markup: string): ExtractedTable | undefined {
  const captionMatch = CAPTION.exec(markup);
  const caption = captionMatch ? cellText(captionMatch[1] ?? '') : '';
  const body = captionMatch ? markup.replace(CAPTION, '') : markup;
  const rows: ExtractedTableCell[][] = [];
  // Everything before the first `<tr>` is the table's own tag and its groups.
  for (const chunk of body.split(ROW_START).slice(1)) {
    const row = chunk.split(ROW_END)[0] ?? '';
    const cells: ExtractedTableCell[] = [];
    for (const match of row.matchAll(CELL)) {
      const [, tag = 'td', attributes = '', content = ''] = match;
      const colSpan = span(attributes, 'colspan');
      const rowSpan = span(attributes, 'rowspan');
      cells.push({
        text: cellText(content.replace(CELL_END, '')),
        header: tag.toLowerCase() === 'th',
        ...(colSpan !== undefined ? { colSpan } : {}),
        ...(rowSpan !== undefined ? { rowSpan } : {}),
      });
    }
    if (cells.length > 0) rows.push(cells);
  }
  if (rows.length === 0 && caption === '') return undefined;
  return { ...(caption !== '' ? { caption } : {}), rows };
}

/**
 * A span attribute, as the number a table cell takes. One is no span at all,
 * and a value past a thousand is the markup misbehaving rather than a table:
 * both are dropped, and the cell spans one.
 */
function span(attributes: string, name: 'colspan' | 'rowspan'): number | undefined {
  const match = new RegExp(`\\b${name}\\s*=\\s*["']?(\\d+)`, 'i').exec(attributes);
  const value = match ? Number(match[1]) : undefined;
  return value !== undefined && value > 1 && value <= 1000 ? value : undefined;
}

/** A cell's markup as its text: tags removed, a `<br>` kept as a line break, entities decoded. */
function cellText(markup: string): string {
  return decodeEntities(markup.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ''))
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line !== '')
    .join('\n');
}

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** The entities an extractor writes: the five XML ones, a no-break space and numeric references. */
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body.startsWith('#')) {
      const code =
        body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : Number(body.slice(1));
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : entity;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
  });
}
