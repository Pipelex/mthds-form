'use client';

import { useEffect, useRef, useState } from 'react';
import type { RunField } from '../core';
import { conceptCategory } from '../core/descriptor';
import { shownAsOptional } from '../core/readiness';
import { readStoredReference, type LoadText, type StoredReferenceView } from '../core/stored-value';
import { loadedRunValue } from '../core/values';
import { FieldShell } from './field-shell';
import { useFieldDomId } from './field-dom-id';
import { useFieldStrings } from './field-strings';
import { focusOutlineClass } from './role-tokens';
import { StoredTextStart } from './stored-text';
import { cn } from './utils';

interface StoredValueFieldProps {
  field: RunField;
  /** The value as the form holds it: the stored reference, `{url, size, mime_type, preview}`. */
  value: unknown;
  reference: StoredReferenceView;
  onChange: (value: unknown) => void;
  id: string;
  error?: string;
  disabled?: boolean;
  /** The host's loader, which "Edit the text" reads the text through. */
  loadText?: LoadText;
}

const ACTION = cn(
  'inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-[13px] font-medium text-foreground',
  'hover:bg-accent disabled:pointer-events-none disabled:opacity-50',
  focusOutlineClass,
);

/**
 * An input holding a text kept in storage: a `Text`, `Markdown`, `Html` or
 * `JSON` value given as its reference rather than as its text, such as a
 * large input a run stored when it started, handed back to the form to run
 * again.
 *
 * The reference is a value the runtime takes, so the field keeps it and the
 * run sends it as it came; it is never emptied into the control it cannot
 * fill. The field shows what it holds, the text's start and size, and offers
 * two ways out: "Edit the text", when the host supplies a loader, puts the
 * loaded text in the field's own control, and "Replace" empties the field for
 * another value.
 *
 * A load answers into the field as it is when the answer comes, not as it was
 * when it was asked: the answer is dropped when the field has gone (a list row
 * removed), when a later Edit asked again, or when the field no longer holds
 * the reference it loaded (a reset, a seed, another row's value moved in), and
 * it is handed to the newest `onChange`, so a list writes it into the rows it
 * holds now rather than the ones it held at the press.
 */
export function StoredValueField({
  field,
  value,
  reference,
  onChange,
  id,
  error,
  disabled,
  loadText,
}: StoredValueFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  // What the field holds now, read when a load answers.
  const current = useRef({ field, value, onChange });
  useEffect(() => {
    current.current = { field, value, onChange };
  });
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const lastAsk = useRef(0);

  const edit = async () => {
    if (!loadText) return;
    const ask = ++lastAsk.current;
    const url = reference.url;
    setLoading(true);
    setFailed(false);
    let text: unknown;
    try {
      text = await loadText(url);
    } catch {
      text = undefined;
    }
    if (!mounted.current || ask !== lastAsk.current) return;
    setLoading(false);
    const now = current.current;
    if (readStoredReference(now.field, now.value)?.url !== url) return;
    const loaded =
      typeof text === 'string' ? loadedRunValue(now.field, now.value, text) : undefined;
    if (loaded === undefined) setFailed(true);
    else now.onChange(loaded);
  };

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category={conceptCategory(field)}
      description={field.description}
      required={!shownAsOptional(field)}
      error={error}
    >
      <div
        id={domId}
        className="space-y-2 rounded-lg border border-dashed border-border bg-card/40 px-3 py-2"
        data-stored-text="held"
      >
        <p className="text-[12px] text-muted-foreground">{s.storedTextHeld(reference.size)}</p>
        <StoredTextStart preview={reference.preview} />
        <div className="flex flex-wrap gap-2">
          {loadText ? (
            <button
              type="button"
              className={ACTION}
              disabled={disabled || loading}
              aria-busy={loading || undefined}
              onClick={() => void edit()}
            >
              {s.storedTextEdit}
            </button>
          ) : null}
          <button
            type="button"
            className={ACTION}
            disabled={disabled || loading}
            onClick={() => onChange(undefined)}
          >
            {s.storedTextReplace}
          </button>
        </div>
        {failed ? (
          <p className="text-[12px] text-muted-foreground" role="status">
            {s.storedTextEditFailed}
          </p>
        ) : null}
      </div>
    </FieldShell>
  );
}
