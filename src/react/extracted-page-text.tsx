'use client';

import { useMemo } from 'react';
import { splitExtractedText, type ExtractedTable } from './extracted-text';
import { useFieldStrings } from './field-strings';
import { Markdown } from './markdown';
import { focusOutlineClass } from './role-tokens';
import { cn } from './utils';

/**
 * One extracted page's text, typeset: Markdown where the extractor wrote
 * Markdown, a table where it wrote a `<table>`, and nothing where it wrote a
 * comment. The reading is `splitExtractedText`'s, which returns text and
 * never markup, so every cell reaches the DOM as a text child. See
 * `./extracted-text` for what is read and why nothing is injected.
 */
export function ExtractedPageText({ text }: { text: string }) {
  const segments = useMemo(() => splitExtractedText(text), [text]);
  return (
    <div className="space-y-2">
      {segments.map((segment, index) =>
        segment.kind === 'markdown' ? (
          <Markdown key={index} text={segment.text} />
        ) : (
          <ExtractedTableView key={index} table={segment.table} />
        ),
      )}
    </div>
  );
}

/**
 * A table read out of a page, drawn as the Markdown walker draws a table, so
 * an extracted table and a model's table read the same. Header rows at the top
 * are the table's head; a header cell further down heads its row.
 *
 * The box scrolls sideways rather than widening the panel, like every table in
 * the result view, so it is a named, focusable group: a scrollable region a
 * keyboard cannot reach is an accessibility failure. It is named by its
 * caption, or by `extractedTable` when the page gave it none.
 */
function ExtractedTableView({ table }: { table: ExtractedTable }) {
  const s = useFieldStrings();
  const headRows = leadingHeaderRows(table);
  const head = table.rows.slice(0, headRows);
  const body = table.rows.slice(headRows);
  return (
    <figure className="space-y-1.5">
      {table.caption && (
        <figcaption className="text-[12.5px] text-muted-foreground">{table.caption}</figcaption>
      )}
      {table.rows.length > 0 && (
        <div
          role="group"
          aria-label={table.caption ?? s.extractedTable}
          tabIndex={0}
          className={cn('overflow-x-auto rounded-lg border border-border', focusOutlineClass)}
        >
          <table className="min-w-full border-collapse text-[12.5px] text-foreground">
            {head.length > 0 && (
              <thead>
                {head.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border bg-card/40">
                    {row.map((cell, cellIndex) => (
                      <th
                        key={cellIndex}
                        scope="col"
                        {...spans(cell)}
                        className="whitespace-pre-line px-2.5 py-1.5 text-start align-bottom font-semibold"
                      >
                        {cell.text}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            )}
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/60 last:border-b-0">
                  {row.map((cell, cellIndex) =>
                    cell.header ? (
                      <th
                        key={cellIndex}
                        scope="row"
                        {...spans(cell)}
                        className="whitespace-pre-line px-2.5 py-1.5 text-start align-top font-semibold"
                      >
                        {cell.text}
                      </th>
                    ) : (
                      <td
                        key={cellIndex}
                        {...spans(cell)}
                        className="whitespace-pre-line px-2.5 py-1.5 align-top"
                      >
                        {cell.text}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

/** How many rows at the top hold header cells only: the table's head. */
function leadingHeaderRows(table: ExtractedTable): number {
  let count = 0;
  for (const row of table.rows) {
    if (!row.every((cell) => cell.header)) break;
    count += 1;
  }
  // A table of header cells alone has no body to head; its rows are its body.
  return count === table.rows.length ? 0 : count;
}

function spans(cell: { colSpan?: number; rowSpan?: number }) {
  return {
    ...(cell.colSpan !== undefined ? { colSpan: cell.colSpan } : {}),
    ...(cell.rowSpan !== undefined ? { rowSpan: cell.rowSpan } : {}),
  };
}
