'use client';

import { cn } from './utils';
import type { ProseRunField, TextRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { fieldControlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';

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
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="text"
      description={field.description}
      required={field.required}
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
        className={cn(fieldControlClass, 'h-11 px-3')}
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
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="text"
      description={field.description}
      required={field.required}
      error={error}
      htmlFor={domId}
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
          fieldControlClass,
          'min-h-[88px] resize-y px-3 py-2.5 leading-relaxed field-sizing-content',
        )}
      />
    </FieldShell>
  );
}
