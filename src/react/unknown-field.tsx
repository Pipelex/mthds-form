'use client';

import { shownAsOptional } from '../core/readiness';
import { cn } from './utils';
import type { UnknownRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { controlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';
import { useFieldPresentation } from './field-presentation';
import { JsonStatus, jsonStatusOf } from './paste-json';
import { useCompactControl } from './field-context';

interface UnknownFieldProps {
  field: UnknownRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Escape hatch for a concept whose shape we can't map to a known control. Rather
 * than block the run, we let the user hand-write the value as JSON - rare, but it
 * keeps every method runnable instead of dead-ending on an unusual input.
 */
export function UnknownField({ field, value, onChange, id, error, disabled }: UnknownFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  const isApp = useFieldPresentation() === 'app';
  const compact = useCompactControl();
  const statusId = `${domId}-status`;
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="structured"
      description={field.description}
      // In an app the hint is the status line under the box, which says
      // whether what is typed is JSON yet.
      hint={isApp ? undefined : s.jsonHint}
      stack
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={domId}
    >
      <textarea
        id={domId}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={!!error}
        rows={3}
        spellCheck={false}
        placeholder={isApp ? '{ }' : '{\n  "key": "value"\n}'}
        aria-describedby={isApp ? statusId : undefined}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        className={cn(
          controlClass(isApp),
          'resize-y px-3 py-2.5 font-mono',
          isApp
            ? compact
              ? 'min-h-[72px] text-[12.5px] leading-[19px]'
              : 'min-h-[170px] text-[12.5px] leading-[19px]'
            : 'min-h-[80px] text-[12px]',
        )}
      />
      {isApp && <JsonStatus id={statusId} className="mt-3" status={jsonStatusOf(value ?? '', s)} />}
    </FieldShell>
  );
}
