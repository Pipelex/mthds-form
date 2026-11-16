'use client';

import { useEffect, useState } from 'react';
import type { LoadText, StoredReferenceView } from '../core/stored-value';
import { useFieldStrings } from './field-strings';

/**
 * Where a stored text's load stands: not asked (no loader), in flight, loaded,
 * or failed. A view keyed on it shows the preview, then the value.
 */
export type StoredTextState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; text: string }
  | { status: 'failed' };

/**
 * Load a stored text through the host's loader, once per url.
 *
 * The answer is recorded against the url it was asked for, so a value that
 * changes under a pending load never shows the previous value's text, and a
 * load that resolves after the view has gone is dropped. A rejection is an
 * ordinary answer (storage unreachable, a link expired) and never escapes.
 */
export function useStoredText(
  url: string | undefined,
  load: LoadText | undefined,
): StoredTextState {
  const [answer, setAnswer] = useState<{ url: string; state: StoredTextState } | null>(null);
  useEffect(() => {
    if (!url || !load) return;
    let live = true;
    void Promise.resolve()
      .then(() => load(url))
      .then(
        (text) => {
          if (!live) return;
          setAnswer({
            url,
            state: typeof text === 'string' ? { status: 'loaded', text } : { status: 'failed' },
          });
        },
        () => {
          if (live) setAnswer({ url, state: { status: 'failed' } });
        },
      );
    return () => {
      live = false;
    };
  }, [url, load]);
  if (!url || !load) return { status: 'idle' };
  return answer?.url === url ? answer.state : { status: 'loading' };
}

/**
 * A stored text shown by its reference: its start (`preview`), and a line that
 * says what it is: the start of a longer text, one being loaded, or one that
 * could not be loaded, each with the text's size.
 *
 * The preview is shown as written, never typeset or framed: it is the true
 * start of the value cut wherever a few hundred characters end, so a Markdown
 * heading may be half a line and an HTML tag may be cut open.
 */
export function StoredTextPreview({
  reference,
  status,
}: {
  reference: StoredReferenceView;
  status: 'idle' | 'loading' | 'failed';
}) {
  const s = useFieldStrings();
  const note =
    status === 'failed'
      ? s.storedTextUnloaded(reference.size)
      : status === 'loading'
        ? s.storedTextLoading(reference.size)
        : s.storedTextStart(reference.size);
  return (
    <div
      className="space-y-1 rounded-lg border border-dashed border-border bg-card/40 px-3 py-2"
      aria-busy={status === 'loading' || undefined}
      data-stored-text={status}
    >
      {status === 'failed' ? <p className="text-[12px] text-muted-foreground">{note}</p> : null}
      {reference.preview ? (
        <p className="whitespace-pre-wrap wrap-anywhere text-[13px] leading-relaxed text-foreground">
          {reference.preview}…
        </p>
      ) : null}
      {status === 'failed' ? null : (
        <p className="text-[11px] text-muted-foreground" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
