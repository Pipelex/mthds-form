'use client';

import type * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Loader2 } from 'lucide-react';
import type { RunField } from '../core';
import { isNativeHtmlNode, readHtmlContent } from '../core/native-content';
import { planFileSave, planStuffSave } from '../core/save-plan';
import { readStuffFile } from '../core/stuff-files';
import { Absent, ResultField, ResultHeader, stringifyValue } from './result-field';
import { useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { HtmlPreview } from './html-preview';
import {
  DownloadDisplayOverride,
  useFileDownloadShown,
  usePdfSaveShown,
  useResolveUrl,
  useResultDownloadShown,
  useSaveFiles,
  type DownloadDisplay,
} from './result-env';
import { SaveAsPdfButton } from './save-as-pdf-button';
import { ResultRoot } from './result-location';
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
 *
 * ## Which views a reader is offered
 *
 * The JSON view is a builder's tool. In `studio` both views are offered; in
 * `app` only the result is, so a person reading a method app's answer is not
 * handed a switch to a receipt they have no use for. `views` overrides either
 * default, and the switch is drawn only when it offers more than one view.
 *
 * ## A result that is one page
 *
 * A result whose node IS `native.Html`, or a concept refining it (read off the
 * descriptor's `concept_ref` and `refines`, never off the value), is one page,
 * and the panel shows it as that page: one row holding the title, "Save as PDF"
 * and one download, then the page edge to edge with no box around it. The
 * page's own control row and the header's download saved the same file, so
 * they are one control here.
 */

export type StuffViewerView = 'rendered' | 'json';

/** Both views, the result first: what `studio` offers. */
const ALL_VIEWS: readonly StuffViewerView[] = ['rendered', 'json'];
/** The result alone: what `app` offers, where the JSON receipt is a builder's tool. */
const RESULT_ONLY: readonly StuffViewerView[] = ['rendered'];

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
  /**
   * Which views the reader may switch between, in the switch's order. Unset,
   * it follows the presentation: both in `studio`, the rendered result alone in
   * `app`, where the JSON receipt is a builder's tool. The switch is drawn only
   * when more than one view is offered; an empty list counts as the rendered
   * result alone.
   */
  views?: readonly StuffViewerView[];
  /**
   * Which view opens first. Rendered, unless a host has a reason. A view not
   * among `views` opens the first one offered instead.
   */
  defaultView?: StuffViewerView;
  /**
   * Names the saved files, whichever control saved them: the base name names
   * the whole stuff, so the JSON copy is `<baseName>.json`, a file inside the
   * stuff that carries no name of its own is `<baseName>-<place>`, and a stuff
   * that is one file saves as `<baseName>.<ext>`. Defaults to the field's name,
   * which is what the header shows. Give each stuff a distinct base name, as
   * the default already is: two panels handed the same one save their unnamed
   * files under the same names.
   */
  downloadBaseName?: string;
  /**
   * Which download controls this panel draws, laid key by key over what
   * `ResultEnvProvider` says: `{ result: false }` drops the header's Download
   * and keeps each file's own button, `{ files: false }` the reverse. For a
   * surface where saving makes no sense (a preview inside an editor, say), set
   * both to `false`.
   */
  downloads?: DownloadDisplay;
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
  // The check mark reverts after a moment. The timer belongs to the effect, so
  // it is cleared when the control unmounts rather than firing into a
  // component, or a document, that is gone.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);
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
            void navigator.clipboard.writeText(text).then(() => setCopied(true));
          }}
          aria-label={s.copyJson}
          className="absolute right-2 top-2 rounded border border-border bg-card p-1 text-muted-foreground hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1"
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

/** One press of the header's Download, and the result it saved. */
interface DownloadAttempt {
  field: RunField;
  baseName: string;
  value: unknown;
  /** The same three as text, written once, when the press is made. */
  key: string | undefined;
}

/**
 * Whether an attempt was made on the result now shown.
 *
 * The same descriptor, base name and value objects answer at once. Otherwise
 * the two are compared as text, so an equal result a host rebuilt on this
 * render still matches, while two results that hold an equal value under
 * different names or descriptors do not. The text is written only while an
 * attempt is on screen, which is the only time the question is asked.
 */
function isShownResult(
  attempt: DownloadAttempt,
  field: RunField,
  baseName: string,
  value: unknown,
): boolean {
  if (attempt.field === field && attempt.baseName === baseName && attempt.value === value) {
    return true;
  }
  return attempt.key !== undefined && attempt.key === resultKey(field, baseName, value);
}

/** A result as text, for {@link isShownResult}; `undefined` for a value JSON cannot write. */
function resultKey(field: RunField, baseName: string, value: unknown): string | undefined {
  try {
    return JSON.stringify([baseName, field, value], (_key, member: unknown) =>
      typeof member === 'bigint' ? `${member}n` : member,
    );
  } catch {
    return undefined;
  }
}

export function StuffViewer({ downloads, ...props }: StuffViewerProps) {
  // The panel's own display settings reach every file button in its tree, not
  // only its header, so they are laid over the provider's before anything
  // beneath reads them.
  return (
    <DownloadDisplayOverride downloads={downloads}>
      <StuffPanel {...props} />
    </DownloadDisplayOverride>
  );
}

function StuffPanel({
  field,
  value,
  name,
  views: viewsProp,
  defaultView = 'rendered',
  downloadBaseName,
  className,
}: Omit<StuffViewerProps, 'downloads'>) {
  const s = useFieldStrings();
  const presentation = useFieldPresentation();
  const offered =
    viewsProp && viewsProp.length > 0
      ? viewsProp
      : viewsProp || presentation === 'app'
        ? RESULT_ONLY
        : ALL_VIEWS;
  // The caller's name wins over the descriptor's, and it is applied to the
  // FIELD rather than passed to the header alone: the download's default base
  // name reads the same property, and the two naming the item differently is
  // exactly the drift this component exists to prevent.
  const named = name ? { ...field, name } : field;
  const baseName = downloadBaseName ?? named.name ?? 'result';
  const [chosen, setView] = useState<StuffViewerView>(defaultView);
  // A host may narrow the views after mounting (a presentation switched to
  // `app`), so the view shown is always one still offered.
  const view = offered.includes(chosen) ? chosen : (offered[0] ?? 'rendered');
  // A download belongs to the result it was made from. A host that keeps this
  // panel mounted and hands it the next result (a rerun, another node) must not
  // see the last result's failures under the new one, nor a save still in
  // flight for the last one disable the control or report on this one. So each
  // attempt records the result it saved, and only an attempt on the result now
  // shown is drawn — matched by what it holds rather than by the object, since
  // a host may rebuild an equal result on every render.
  const [saving, setSaving] = useState<DownloadAttempt | null>(null);
  // The names of the files the last download could not hand over, shown until
  // the next one. Empty when everything arrived.
  const [missed, setMissed] = useState<{
    attempt: DownloadAttempt;
    names: readonly string[];
  } | null>(null);
  const latest = useRef<DownloadAttempt | null>(null);
  const savingShown = saving !== null && isShownResult(saving, field, baseName, value);
  const missedShown =
    missed && isShownResult(missed.attempt, field, baseName, value) ? missed.names : [];
  // The same resolver the rendered view paints images through, so a download
  // saves exactly what the reader is looking at — a host that proxies its
  // storage does not need to configure the two separately.
  const resolveUrl = useResolveUrl();
  const save = useSaveFiles();
  const resultDownloadShown = useResultDownloadShown();
  const pageDownloadShown = useFileDownloadShown('markup');
  const pdfShown = usePdfSaveShown();
  // A result that is one page: its node is `native.Html` or refines it, which
  // the descriptor states, and the value holds the markup that kind documents.
  const page = isNativeHtmlNode(field) ? readHtmlContent(value) : undefined;
  // For a page, the header's download and the page's own saved the same file,
  // so the one control drawn is there when either setting asks for it.
  const downloadShown = resultDownloadShown || (page !== undefined && pageDownloadShown);

  const handleDownload = useCallback(async () => {
    const attempt: DownloadAttempt = {
      field,
      baseName,
      value,
      key: resultKey(field, baseName, value),
    };
    latest.current = attempt;
    setSaving(attempt);
    setMissed(null);
    try {
      // The descriptor's own field, not the renamed one: each planned file's
      // path is its place in the result, which is the descriptor's, and the
      // file buttons below plan from the same place.
      const plan = planStuffSave(field, value, {
        baseName,
        ...(resolveUrl ? { resolveUrl } : {}),
      });
      const { failed } = await save(plan.files);
      if (latest.current !== attempt) return;
      setMissed({
        attempt,
        names: [
          ...plan.unavailable.map((file) => file.name),
          ...failed.map((failure) => failure.file.name),
        ],
      });
    } finally {
      setSaving((current) => (current === attempt ? null : current));
    }
  }, [field, value, baseName, resolveUrl, save]);
  const labels: Record<StuffViewerView, string> = { rendered: s.viewRendered, json: s.viewJson };
  // The PDF is named as the page's HTML download is, without the extension, so
  // the two files a reader saves of one page share a name.
  const pdfName = page && pdfShown ? pdfFileName(field, value, baseName) : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {/* The header is drawn once, here, and `ResultField` is told to skip its
          own - two headers that agree today drift tomorrow. It stays put across
          both views, so switching does not move the thing you are reading. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="min-w-0 space-y-1">
          <ResultHeader field={named} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {page && pdfName !== undefined && (
            <SaveAsPdfButton
              content={page}
              {...(pdfName ? { fileName: pdfName } : {})}
              className="gap-1.5 rounded-md border border-border px-2 py-1 font-normal"
            />
          )}
          {downloadShown && (
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={savingShown}
              aria-label={s.download}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-60"
            >
              {savingShown ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {savingShown ? s.downloading : s.download}
            </button>
          )}
          {offered.length > 1 && (
            <div
              role="group"
              aria-label={s.resultViewGroup}
              className="flex rounded-md border border-border p-0.5"
            >
              {offered.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  aria-pressed={view === id}
                  className={cn(
                    'rounded px-2 py-0.5 text-[12px] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1',
                    view === id
                      ? 'bg-card font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {labels[id]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Said, not swallowed: a reader expecting three attachments and getting
          two could not tell before. The JSON copy still carries each missing
          file's reference, when it was planned. The live region is there from
          the start and only its text changes, because a region inserted with
          its message already in it is not reliably announced. */}
      {downloadShown && (
        <p
          role="status"
          className={cn('text-[12px] text-destructive', missedShown.length === 0 && 'sr-only')}
        >
          {missedShown.length > 0 ? s.downloadIncomplete(missedShown) : ''}
        </p>
      )}

      {view === 'json' ? (
        <JsonView value={value} />
      ) : page ? (
        // The page is the panel's main view: drawn here rather than through
        // `ResultField`, whose page arm would add a second control row saving
        // the same file, and with no box around it.
        <HtmlPreview content={page} saveAsPdf={false} bare />
      ) : (
        <ResultRoot baseName={baseName} path={[field.name]}>
          <ResultField field={field} value={value} hideLabel />
        </ResultRoot>
      )}
    </div>
  );
}

/**
 * The name the print dialog proposes for a one-page result's PDF: the page's
 * own HTML download name, without its extension. `''` when the page plans no
 * file, which leaves the dialog to propose the tab's title.
 */
function pdfFileName(field: RunField, value: unknown, baseName: string): string {
  const file = readStuffFile('markup', value, field.name);
  const name = file ? planFileSave(file, { baseName })?.name : undefined;
  return name === undefined ? '' : name.replace(/\.[^.]+$/, '');
}
