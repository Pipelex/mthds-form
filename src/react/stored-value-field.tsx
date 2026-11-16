'use client';

import { useState } from 'react';
import type { RunField } from '../core';
import { conceptCategory } from '../core/descriptor';
import { shownAsOptional } from '../core/readiness';
import type { LoadText, StoredReferenceView } from '../core/stored-value';
import { loadedRunValue } from '../core/values';
import { FieldShell } from './field-shell';
import { useFieldDomId } from './field-dom-id';
import { useFieldStrings } from './field-strings';
import { focusOutlineClass } from './role-tokens';
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

  const edit = async () => {
    if (!loadText) return;
    setLoading(true);
    setFailed(false);
    try {
      const text = await loadText(reference.url);
      const loaded = typeof text === 'string' ? loadedRunValue(field, value, text) : undefined;
      if (loaded === undefined) setFailed(true);
      else onChange(loaded);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
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
        {reference.preview ? (
          <p className="whitespace-pre-wrap wrap-anywhere text-[13px] leading-relaxed text-foreground">
            {reference.preview}…
          </p>
        ) : null}
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
