'use client';

import { shownAsOptional } from '../core/readiness';
import { cn } from './utils';
import type { ProseRunField, TextRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { appControlHeight, appLineWidthClass, controlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';
import { useFieldPresentation } from './field-presentation';
import { useCompactControl } from './field-context';

interface TextFieldProps {
  field: TextRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/** Single-line string input (short native.Text or a plain string property). */
export function TextField({ field, value, onChange, id, error, disabled }: TextFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  const isApp = useFieldPresentation() === 'app';
  const compact = useCompactControl();
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="text"
      description={field.description}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={domId}
    >
      <input
        id={domId}
        type="text"
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={!!error}
        placeholder={field.placeholder ?? s.typeValuePlaceholder}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        className={cn(
          controlClass(isApp),
          'px-3',
          // In an app a line of text is never wider than 560 pixels as an input
          // of its own; inside a structure it fills the row's control column.
          isApp ? [appControlHeight(compact), !compact && appLineWidthClass] : 'h-11',
        )}
      />
    </FieldShell>
  );
}

interface ProseFieldProps {
  field: ProseRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Multi-line free text. Auto-grows with content (`field-sizing-content`) so long
 * prompts don't trap the user in a tiny scrollbox - the field that carries most
 * of a method's intent should feel roomy.
 */
export function ProseField({ field, value, onChange, id, error, disabled }: ProseFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  const isApp = useFieldPresentation() === 'app';
  const compact = useCompactControl();
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="text"
      description={field.description}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={domId}
      stack
    >
      <textarea
        id={domId}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={!!error}
        rows={3}
        placeholder={field.placeholder ?? s.writeHerePlaceholder}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        className={cn(
          controlClass(isApp),
          'w-full resize-y px-3 py-2.5 field-sizing-content',
          isApp
            ? compact
              ? 'min-h-[72px] text-[13.5px] leading-[21px]'
              : 'min-h-[104px] leading-[21px]'
            : 'min-h-[88px] leading-relaxed',
        )}
      />
    </FieldShell>
  );
}
