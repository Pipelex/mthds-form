'use client';

import type * as React from 'react';
import { useCallback, useState } from 'react';
import { Check, Copy, Download, Loader2 } from 'lucide-react';
import type { RunField } from '../core';
import { Absent, ResultField, ResultHeader, stringifyValue } from './result-field';
import { useFieldStrings } from './field-strings';
import { downloadStuff } from './download-stuff';
import { useResolveUrl } from './result-env';
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

export type StuffViewerView = 'rendered' | 'json';

export interface StuffViewerProps {
  field: RunField;
  value: unknown;
  /**
   * The STUFF's name, for the header — `report_pages`, not `output`.
   *
   * A result descriptor's root node is named by the engine that built it, and
   * `build_output_form` calls it `output` for every pipe there has ever been.
   * That is correct in the artifact: the descriptor describes a pipe's output
   * slot, which has no name of its own. It is wrong on screen, where the reader
   * is looking at ONE data item and every other surface — the graph node they
   * clicked, the input panel beside it, the method's own code — calls that item
   * by the name the author gave it.
   *
   * So the name comes from the caller, because only the caller knows it: the
   * graph knows which node was opened, a run page knows which variable it is
   * showing. Absent, the descriptor's own name stands, which keeps a host that
   * has nothing better to say honest rather than blank.
   *
   * It also supplies `downloadBaseName`'s default, so the file a reader saves
   * is named after the thing they were reading rather than `output.json`.
   */
  name?: string;
  /** Which view opens first. Rendered, unless a host has a reason. */
  defaultView?: StuffViewerView;
  /**
   * Names the saved files: `<baseName>.json`, and any file inside the stuff
   * that carries no name of its own. Defaults to the field's name, which is
   * what the header shows.
   */
  downloadBaseName?: string;
  /**
   * Hide the download control. For a host that saves results its own way, or a
   * surface where saving makes no sense — a preview inside an editor, say.
   */
  hideDownload?: boolean;
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

export function StuffViewer({
  field,
  value,
  name,
  defaultView = 'rendered',
  downloadBaseName,
  hideDownload = false,
  className,
}: StuffViewerProps) {
  const s = useFieldStrings();
  // The caller's name wins over the descriptor's, and it is applied to the
  // FIELD rather than passed to the header alone: the download's default base
  // name reads the same property, and the two naming the item differently is
  // exactly the drift this component exists to prevent.
  const named = name ? { ...field, name } : field;
  const [view, setView] = useState<StuffViewerView>(defaultView);
  const [saving, setSaving] = useState(false);
  // The same resolver the rendered view paints images through, so a download
  // fetches exactly what the reader is looking at — a host that proxies its
  // storage does not need to configure the two separately.
  const resolveUrl = useResolveUrl();

  const handleDownload = useCallback(async () => {
    setSaving(true);
    try {
      await downloadStuff({
        field,
        value,
        baseName: downloadBaseName ?? named.name ?? 'result',
        resolveUrl,
      });
    } finally {
      setSaving(false);
    }
  }, [field, named.name, value, downloadBaseName, resolveUrl]);
  const views: { id: StuffViewerView; label: string }[] = [
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
          <ResultHeader field={named} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!hideDownload && (
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={saving}
              aria-label={s.download}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {saving ? s.downloading : s.download}
            </button>
          )}
          <div
            role="group"
            aria-label={s.resultViewGroup}
            className="flex rounded-md border border-border p-0.5"
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
      </div>

      {view === 'json' ? (
        <JsonView value={value} />
      ) : (
        <ResultField field={field} value={value} hideLabel />
      )}
    </div>
  );
}
