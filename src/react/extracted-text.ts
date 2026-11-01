/**
 * An extracted page's text, made readable: its comments dropped, its tables
 * read into a table model and its other markup reduced to text, so the result
 * view can typeset the rest as Markdown and draw the tables as tables.
 *
 * ## Why a page's text needs this and a model's answer does not
 *
 * A document extractor writes Markdown, but not only Markdown. It marks the
 * page's furniture with HTML comments (`<!-- PageHeader="Report" -->`,
 * `<!-- PageNumber="1" -->`), it writes every table as an HTML `<table>`,
 * because a Markdown table cannot hold a caption or a merged cell, and it wraps
 * a figure's caption and text in a `<figure>`. The `Markdown` walker
 * deliberately shows HTML as its own source rather than injecting it (see
 * `./markdown`), so a page used to print its comments, a wall of `<tr>`/`<td>`
 * tags where its tables were, and `<figure>` tags around its figures.
 *
 * The answer is not to inject the markup. The extracted text is data from a
 * document nobody here wrote, and putting it into the host's DOM as HTML would
 * be an injection path. So the tables are READ instead: their rows and cells
 * are taken out as text, and the result view draws a table of its own around
 * them. Nothing here returns markup to render, and nothing that reads this
 * module's output can render one, because a cell is a string and a stretch of
 * Markdown is typeset by a walker that never injects.
 *
 * ## What is read, and what is left alone
 *
 * - **A comment is dropped**, whatever it holds. A comment is by definition not
 *   content, and an extractor's comments are page furniture.
 * - **A `<table>` is read**: its `<caption>`, its rows, and each row's `<th>`
 *   and `<td>` cells with their `colspan` and `rowspan`. A cell's own markup
 *   (`<strong>`, a `<br>`) becomes its text, a line break kept as one, and its
 *   character references are decoded (`./html-entities`). Tables are found by
 *   counting `<table>` and `</table>` tags, so a table inside a cell does not
 *   end its outer table early, and the outer table's rows are read counting
 *   them the same way, so a nested row's end does not end the outer row: the
 *   nested table is part of the text of the cell holding it, a line for each
 *   of its cells, which is readable and never shows a tag.
 * - **Any other HTML element is reduced to its text**: its tags are dropped, a
 *   block's tags (`<figure>`, `<figcaption>`, `<p>`, a `<br>`) leaving a line
 *   break so its text stays a line of its own, and a `<script>` or a `<style>`
 *   is dropped with its content, which is not text a reader reads. So a
 *   figure reads as its caption and its text. Inside a row of a Markdown pipe
 *   table, where a line break would end the row, such a tag leaves a space
 *   instead, so `| Ada | One<br>Two |` stays one row. A table's own tags outside a
 *   table that closes, and a tag whose name is not an HTML element's (an
 *   autolink such as `<https://…>`, a placeholder such as `<name>`), are left
 *   to the walker, which shows them as source: a table whose closing tag never
 *   comes is left there rather than guessed at.
 * - **Code is left exactly as written.** A fenced code block and an inline code
 *   span are copied through untouched, so a code sample that shows a comment, a
 *   `<table>` or a `<figure>` still shows it, and a table or a comment around a
 *   fence never ends inside it, so a fence is never split.
 *
 * Patterns are fine here where they are not for a page the view frames
 * (`./markup-storage`), because nothing is executed or fetched on the strength
 * of what they find: the worst a misread can do is draw a cell's text in the
 * wrong cell, or show a tag's text where its markup was.
 */

import { decodeHtmlEntities } from './html-entities';

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

/**
 * Split an extracted page's text into the Markdown around its tables and the
 * tables themselves, in order. Empty stretches are left out, so a page whose
 * text is only comments or empty markup splits into nothing.
 *
 * One pass from left to right, because what a stretch of text is depends on
 * what came before it: a `<table>` inside a code span is code, and a backtick
 * inside a table's cell is a character.
 */
export function splitExtractedText(text: string): ExtractedSegment[] {
  const segments: ExtractedSegment[] = [];
  const tableRows = text.includes('|') ? pipeTableRows(text) : [];
  let markdown = '';
  let index = 0;
  while (index < text.length) {
    if (index === 0 || text[index - 1] === '\n') {
      const fenceEnd = fencedBlockEnd(text, index);
      if (fenceEnd !== undefined) {
        markdown += text.slice(index, fenceEnd);
        index = fenceEnd;
        continue;
      }
    }
    const char = text.charAt(index);
    // An escaped character is literal: `\`` opens no code span and `\<` no tag.
    if (char === '\\' && ESCAPABLE.test(text.charAt(index + 1))) {
      markdown += text.slice(index, index + 2);
      index += 2;
      continue;
    }
    if (char === '`') {
      const end = codeSpanEnd(text, index);
      markdown += text.slice(index, end);
      index = end;
      continue;
    }
    if (char === '<') {
      const markup = readMarkup(text, index);
      if (markup) {
        if ('table' in markup) {
          pushMarkdown(segments, markdown);
          markdown = '';
          if (markup.table) segments.push({ kind: 'table', table: markup.table });
        } else if (markup.text === '\n' && within(tableRows, index)) {
          // A line break inside a row of a Markdown table would end the row
          // there, and its cells after it would become a row of their own.
          // The walker has no line break inside a cell, so a space it is.
          markdown += ' ';
        } else {
          markdown += markup.text;
        }
        index = markup.end;
        continue;
      }
    }
    markdown += char;
    index += 1;
  }
  pushMarkdown(segments, markdown);
  return segments;
}

function pushMarkdown(segments: ExtractedSegment[], text: string) {
  if (text.trim() !== '') segments.push({ kind: 'markdown', text });
}

/** A stretch of the text, from its first character to just before its end. */
type Span = readonly [start: number, end: number];

function within(spans: readonly Span[], index: number): boolean {
  return spans.some(([start, end]) => index >= start && index < end);
}

/**
 * The stretches of the text that are the rows of a Markdown pipe table, as
 * GFM reads one: a header row, the delimiter row under it with as many cells
 * (`| --- | :-: |`), then every following line that holds a pipe, up to the
 * first that does not. A table that GFM would continue through a line holding
 * no pipe is cut short there, which leaves that line as it would be anyway.
 */
function pipeTableRows(text: string): Span[] {
  const lines: Span[] = [];
  for (let start = 0; ;) {
    const newline = text.indexOf('\n', start);
    lines.push([start, newline === -1 ? text.length : newline]);
    if (newline === -1) break;
    start = newline + 1;
  }
  const lineAt = (at: number) => {
    const [start, end] = lines[at] ?? [0, 0];
    return text.slice(start, end);
  };
  const rows: Span[] = [];
  for (let at = 1; at < lines.length; at += 1) {
    const header = lineAt(at - 1);
    const delimiter = lineAt(at);
    if (!header.includes('|') || !isDelimiterRow(delimiter)) continue;
    if (rowCells(header).length !== rowCells(delimiter).length) continue;
    let last = at;
    while (last + 1 < lines.length && lineAt(last + 1).includes('|')) last += 1;
    rows.push([lines[at - 1]?.[0] ?? 0, lines[last]?.[1] ?? text.length]);
    at = last;
  }
  return rows;
}

/** A table row's cells: the line between its outer pipes, split at every pipe not escaped. */
function rowCells(line: string): string[] {
  let row = line.trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
  // Walked rather than split with a lookbehind, which an older engine refuses
  // to parse at all, taking the whole entry down with it.
  const cells: string[] = [];
  let cell = '';
  for (let at = 0; at < row.length; at += 1) {
    const char = row.charAt(at);
    if (char === '\\') {
      cell += row.slice(at, at + 2);
      at += 1;
    } else if (char === '|') {
      cells.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

/** A delimiter row: a pipe, and cells of dashes with an optional colon at either end. */
function isDelimiterRow(line: string): boolean {
  return line.includes('|') && rowCells(line).every((cell) => /^\s*:?-+:?\s*$/.test(cell));
}

/** ASCII punctuation: the characters a backslash makes literal in Markdown. */
const ESCAPABLE = /^[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]$/;

/** A fence's opening line: its indentation, its marker, and its info string. */
const FENCE_OPEN = /[ \t]*(`{3,}|~{3,})([^\n]*)/y;
/** Any line that could open a fence, for the searches that must step over one. */
const FENCE_LINE = /^[ \t]*(?:`{3,}|~{3,})/gm;

/**
 * Where a fenced code block opening at `start`, a line's start, ends: just
 * past its closing fence's line, or the end of the text when it never closes,
 * as CommonMark has it. `undefined` when no fence opens there. A backtick
 * fence's info string holds no backtick, so a line that does opens inline code
 * instead.
 */
function fencedBlockEnd(text: string, start: number): number | undefined {
  FENCE_OPEN.lastIndex = start;
  const open = FENCE_OPEN.exec(text);
  if (!open) return undefined;
  const marker = open[1] ?? '';
  const fenceChar = marker.charAt(0);
  if (fenceChar === '`' && (open[2] ?? '').includes('`')) return undefined;
  let lineEnd = text.indexOf('\n', start);
  while (lineEnd !== -1) {
    const next = text.indexOf('\n', lineEnd + 1);
    const end = next === -1 ? text.length : next;
    const line = text.slice(lineEnd + 1, end).trim();
    if (line.length >= marker.length && [...line].every((c) => c === fenceChar)) return end;
    lineEnd = next;
  }
  return text.length;
}

/** A blank line, which no code span crosses. */
const BLANK_LINE = /\n[ \t]*\n/g;

/**
 * Where a code span opening at `start` ends: past the next run of exactly as
 * many backticks, within its paragraph. A run that nothing closes is literal
 * backticks, and the scan goes on after it.
 */
function codeSpanEnd(text: string, start: number): number {
  const open = backtickRun(text, start);
  BLANK_LINE.lastIndex = start;
  const blank = BLANK_LINE.exec(text);
  const limit = blank ? blank.index : text.length;
  let cursor = start + open;
  for (;;) {
    const next = text.indexOf('`', cursor);
    if (next === -1 || next >= limit) return start + open;
    const length = backtickRun(text, next);
    if (length === open) return next + length;
    cursor = next + length;
  }
}

function backtickRun(text: string, start: number): number {
  let end = start;
  while (text.charAt(end) === '`') end += 1;
  return end - start;
}

/**
 * The first match of a global `pattern` at or after `from` that is not inside a
 * fenced code block: what a comment's end and a table's closing tag are
 * searched with, so neither can end inside a fence and split it.
 */
function nextOutsideFences(text: string, from: number, pattern: RegExp): RegExpExecArray | null {
  let cursor = from;
  for (;;) {
    pattern.lastIndex = cursor;
    const match = pattern.exec(text);
    if (!match) return null;
    FENCE_LINE.lastIndex = cursor;
    const fence = FENCE_LINE.exec(text);
    if (!fence || fence.index >= match.index) return match;
    cursor = fencedBlockEnd(text, fence.index) ?? fence.index + fence[0].length;
  }
}

const COMMENT = /<!--[\s\S]*?-->/g;
const COMMENT_END = /-->/g;
const TABLE_OPEN = /<table\b[^>]*>/iy;
const TABLE_TAG = /<(\/?)table\b[^>]*>/gi;
/** An HTML tag: its closing slash, its name, and its attributes up to the `>`. */
const HTML_TAG = /<(\/?)([a-z][a-z0-9]*)(?=[\s/>])[^<>]*>/iy;

/**
 * The elements whose tags leave a line break when dropped, so their text stays
 * a line of its own: the block elements an extractor or a web page writes.
 */
const BLOCK_ELEMENTS: ReadonlySet<string> = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'body',
  'br',
  'center',
  'dd',
  'details',
  'dialog',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'legend',
  'li',
  'main',
  'nav',
  'ol',
  'option',
  'p',
  'pre',
  'section',
  'summary',
  'title',
  'ul',
]);

/** The elements whose tags are dropped with nothing in their place: text-level markup. */
const INLINE_ELEMENTS: ReadonlySet<string> = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'big',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'font',
  'i',
  'img',
  'ins',
  'kbd',
  'label',
  'mark',
  'picture',
  'q',
  's',
  'samp',
  'small',
  'source',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'time',
  'tt',
  'u',
  'var',
  'wbr',
]);

/** The elements whose content is not text a reader reads, dropped with their tags. */
const RAW_TEXT_ENDS: ReadonlyMap<string, RegExp> = new Map([
  ['script', /<\/script\s*>/gi],
  ['style', /<\/style\s*>/gi],
]);

/** What a `<` turned out to open: text to keep in the Markdown, or a table read whole. */
type Markup = { end: number; text: string } | { end: number; table: ExtractedTable | undefined };

/**
 * Read the markup a `<` at `start` opens: a comment, a table, or a tag. A table
 * is read whole; a comment is dropped; an HTML element's tag is reduced to the
 * line break or the nothing it stands for. `undefined` for anything else, which
 * stays in the text as written: an unclosed comment or table, a table's own
 * tags outside one, and a name that is not an HTML element's.
 */
function readMarkup(text: string, start: number): Markup | undefined {
  if (text.startsWith('<!--', start)) {
    const close = nextOutsideFences(text, start + 4, COMMENT_END);
    return close ? { end: close.index + close[0].length, text: '' } : undefined;
  }
  TABLE_OPEN.lastIndex = start;
  if (TABLE_OPEN.test(text)) {
    const end = tableEnd(text, start);
    if (end === undefined) return undefined;
    return { end, table: readTable(text.slice(start, end).replace(COMMENT, '')) };
  }
  HTML_TAG.lastIndex = start;
  const tag = HTML_TAG.exec(text);
  if (!tag) return undefined;
  const closing = tag[1] === '/';
  const name = (tag[2] ?? '').toLowerCase();
  const end = start + tag[0].length;
  const rawTextEnd = closing ? undefined : RAW_TEXT_ENDS.get(name);
  if (rawTextEnd) {
    rawTextEnd.lastIndex = end;
    const close = rawTextEnd.exec(text);
    return { end: close ? close.index + close[0].length : end, text: '\n' };
  }
  if (RAW_TEXT_ENDS.has(name) || BLOCK_ELEMENTS.has(name)) return { end, text: '\n' };
  if (INLINE_ELEMENTS.has(name)) return { end, text: '' };
  return undefined;
}

/**
 * Where the table whose opening tag is at `start` ends, counting its nested
 * tables: just past the `</table>` that closes it, or `undefined` when none
 * does. A tag inside a fenced code block is not counted.
 */
function tableEnd(text: string, start: number): number | undefined {
  let depth = 0;
  let cursor = start;
  for (;;) {
    const tag = nextOutsideFences(text, cursor, TABLE_TAG);
    if (!tag) return undefined;
    depth += tag[1] === '/' ? -1 : 1;
    cursor = tag.index + tag[0].length;
    if (depth === 0) return cursor;
  }
}

/** The tags a table is built of, opening or closing: its own, its caption's, its rows' and its cells'. */
const TABLE_STRUCTURE = /<(\/?)(table|caption|tr|td|th)\b([^>]*)>/gi;

/**
 * One table's markup, read. `undefined` when it holds neither a caption nor a row.
 *
 * The table's tags are read in order, counting the tables nested in it, and
 * only the tags of the table itself build its caption, its rows and its
 * cells: a nested table's `</tr>` does not end the row of the cell holding it,
 * so the cells after that one stay in their row. The nested table is part of
 * its cell's text (see `cellText`). A cell ends at its closing tag, or where
 * the next cell, row or the table's end begins, as the HTML parser ends one.
 * What lies outside a row (the table's groups, stray text) is not read.
 */
function readTable(markup: string): ExtractedTable | undefined {
  let caption = '';
  let captionStart: number | undefined;
  const rows: ExtractedTableCell[][] = [];
  let row: ExtractedTableCell[] | undefined;
  let cell: { header: boolean; attributes: string; start: number } | undefined;
  let depth = 0;

  const endCell = (at: number) => {
    if (cell && row) {
      const colSpan = span(cell.attributes, COLSPAN);
      const rowSpan = span(cell.attributes, ROWSPAN);
      row.push({
        text: cellText(markup.slice(cell.start, at)),
        header: cell.header,
        ...(colSpan !== undefined ? { colSpan } : {}),
        ...(rowSpan !== undefined ? { rowSpan } : {}),
      });
    }
    cell = undefined;
  };
  const endRow = (at: number) => {
    endCell(at);
    if (row && row.length > 0) rows.push(row);
    row = undefined;
  };

  for (const tag of markup.matchAll(TABLE_STRUCTURE)) {
    const closing = tag[1] === '/';
    const name = (tag[2] ?? '').toLowerCase();
    if (name === 'table') {
      depth += closing ? -1 : 1;
      if (depth === 0) break;
      continue;
    }
    // A nested table's own caption, rows and cells are its cell's text.
    if (depth !== 1) continue;
    if (name === 'caption') {
      if (!closing && caption === '' && captionStart === undefined) {
        captionStart = tag.index + tag[0].length;
      } else if (closing && captionStart !== undefined) {
        caption = cellText(markup.slice(captionStart, tag.index));
        captionStart = undefined;
      }
      continue;
    }
    if (name === 'tr') {
      endRow(tag.index);
      if (!closing) row = [];
      continue;
    }
    endCell(tag.index);
    if (!closing && row) {
      cell = {
        header: name === 'th',
        attributes: tag[3] ?? '',
        start: tag.index + tag[0].length,
      };
    }
  }
  endRow(markup.length);
  if (rows.length === 0 && caption === '') return undefined;
  return { ...(caption !== '' ? { caption } : {}), rows };
}

const COLSPAN = /\bcolspan\s*=\s*["']?(\d+)/i;
const ROWSPAN = /\browspan\s*=\s*["']?(\d+)/i;

/**
 * A span attribute, as the number a table cell takes. One is no span at all,
 * and a value past a thousand is the markup misbehaving rather than a table:
 * both are dropped, and the cell spans one.
 */
function span(attributes: string, pattern: RegExp): number | undefined {
  const match = pattern.exec(attributes);
  const value = match ? Number(match[1]) : undefined;
  return value !== undefined && value > 1 && value <= 1000 ? value : undefined;
}

/**
 * A cell's markup as its text: tags removed, a `<br>` kept as a line break,
 * references decoded. A table nested in the cell is read into it too, each of
 * its cells (and its caption) a line of the cell's text, so its words stay
 * apart and no tag of it is shown.
 */
function cellText(markup: string): string {
  return decodeHtmlEntities(
    markup
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?(?:table|caption|tr|td|th)\b[^>]*>/gi, '\n')
      .replace(/<[^>]*>/g, ''),
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line !== '')
    .join('\n');
}
