'use client';

import type * as React from 'react';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { RunField } from '../core';
import { Absent, ResultField, ResultHeader, stringifyValue } from './result-field';
import { useFieldStrings } from './field-strings';
import { cn } from './utils';

/**
 * A pipe's result, with the two views a result actually needs.
 *
 * ## Two, and why not three
 *
 * **Rendered** is the answer for a person: the descriptor-driven view, which
 * knows a field is an enum, that a date arrived in the serializer's typed
 * envelope, that fifteen records are a table. **JSON** is the answer for whoever
 * is debugging the pipe: what exactly came back, verbatim, copyable. Those are
 * different jobs and neither substitutes for the other.
 *
 * They are deliberately NOT peers, and the toggle should not read as a menu of
 * equal options. One is the result; the other is the receipt. Rendered opens
 * first, always.
 *
 * A third view is the one to resist. An engine-rendered HTML or plain-text
 * presentation — the shape the runtime's own viewer offers — is a second human
 * rendering of the same payload, produced by another codebase, carrying no
 * descriptor (so it cannot know a kind, a plurality or a nesting) and unable to
 * match a host's design system. It is a renderer that cannot be improved without
 * shipping the engine. If a plain-text form is wanted, it is a COPY FORMAT and
 * belongs behind a copy control, not beside the view that reads the standard.
 */

export type ResultPanelView = 'rendered' | 'json';

export interface ResultPanelProps {
  field: RunField;
  value: unknown;
  /** Which view opens first. Rendered, unless a host has a reason. */
  defaultView?: ResultPanelView;
  className?: string;
}

/**
 * JSON, with the structure receding and the data forward.
 *
 * A flat `<pre>` is the right shape for a receipt and stays one — what it was
 * missing is contrast. Keys, braces and commas are scaffolding a reader skips;
 * values are what they came for, and undifferentiated monospace makes finding
 * one a character-by-character scan.
 *
 * Two decisions worth stating. **Weight and the muted token, never a palette**:
 * the host owns its colours and a hand-picked green for strings is a colour that
 * fails somebody's theme, so structure is `muted-foreground` and data is
 * `foreground`. And **no collapsible tree**: that would be a second structured
 * browser competing with the Result view, which already reads the descriptor and
 * does structure properly. Two views, not three — the same argument, one level
 * down.
 */
const JSON_TOKEN_RE =
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function highlight(json: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const match of json.matchAll(JSON_TOKEN_RE)) {
    const [token, key, str, literal] = match;
    const at = match.index;
    if (at > last) {
      // Braces, brackets, commas and whitespace - the scaffolding.
      out.push(
        <span key={`p${last}`} className="text-muted-foreground">
          {json.slice(last, at)}
        </span>,
      );
    }
    out.push(
      <span
        key={at}
        className={
          key ? 'text-muted-foreground' : str ? 'text-foreground' : 'font-semibold text-foreground'
        }
      >
        {token}
      </span>,
    );
    last = at + token.length;
    void literal;
  }
  if (last < json.length) {
    out.push(
      <span key="tail" className="text-muted-foreground">
        {json.slice(last)}
      </span>,
    );
  }
  return out;
}

/**
 * The payload as JSON — the receipt, with the whole of it one click from the
 * clipboard.
 *
 * Exported because it is also the honest FLOOR: a host that holds a value but
 * not the artifacts describing it (an older engine, a spec restored without its
 * validate report) should show the value and say why it is not laid out, rather
 * than show nothing. That is a different thing from what `StuffViewer`'s JSON
 * tab was — one labelled fallback, not one of three guesses offered as a
 * choice.
 */
export function JsonView({ value }: { value: unknown }) {
  const s = useFieldStrings();
  const [copied, setCopied] = useState(false);
  // `stringifyValue` handles the shapes `JSON.stringify` refuses (a BigInt, a
  // circular reference) rather than throwing inside a view whose whole purpose
  // is to show what is there.
  const text =
    value === null || value === undefined
      ? undefined
      : typeof value === 'object'
        ? stringifyValue(value)
        : JSON.stringify(value);

  if (text === undefined) {
    return <Absent />;
  }
  return (
    <div className="relative">
      {typeof navigator !== 'undefined' && navigator.clipboard && (
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
          aria-label={s.copyJson}
          className="absolute right-2 top-2 rounded border border-border bg-card p-1 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        >
          {copied ? (
            <Check aria-hidden className="size-3.5" />
          ) : (
            <Copy aria-hidden className="size-3.5" />
          )}
        </button>
      )}
      <pre className="overflow-x-auto rounded-lg border border-border bg-card/40 px-3.5 py-3 pr-12 font-mono text-[12px] leading-relaxed">
        {highlight(text)}
      </pre>
    </div>
  );
}

export function ResultPanel({
  field,
  value,
  defaultView = 'rendered',
  className,
}: ResultPanelProps) {
  const s = useFieldStrings();
  const [view, setView] = useState<ResultPanelView>(defaultView);
  const views: { id: ResultPanelView; label: string }[] = [
    { id: 'rendered', label: s.viewRendered },
    { id: 'json', label: s.viewJson },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {/* The header is drawn once, here, and `ResultField` is told to skip its
          own - two headers that agree today drift tomorrow. It stays put across
          both views, so switching does not move the thing you are reading. */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0 space-y-1">
          <ResultHeader field={field} />
        </div>
        <div
          role="group"
          aria-label={s.resultViewGroup}
          className="flex shrink-0 rounded-md border border-border p-0.5"
        >
          {views.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-pressed={view === id}
              className={cn(
                'rounded px-2 py-0.5 text-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1',
                view === id
                  ? 'bg-card font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'json' ? (
        <JsonView value={value} />
      ) : (
        <ResultField field={field} value={value} hideLabel />
      )}
    </div>
  );
}
