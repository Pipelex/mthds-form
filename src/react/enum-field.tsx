'use client';

import { Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import type { EnumRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { useFieldDomId } from './field-dom-id';

interface EnumFieldProps {
  field: EnumRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Radix `Select` cannot carry an item whose value is `""` - it reserves the empty
 * string for "no selection". The field is optional and was clearable through a
 * blank `<option>`, so the clear entry rides a sentinel instead and maps back to
 * `undefined` on the way out.
 */
const CLEAR_VALUE = '__none__';

/**
 * Pick-one. A short option set (≤4, each label brief) renders as a segmented
 * control - every choice visible at a glance - and falls back to a select once
 * the set grows past what fits on a row.
 */
export function EnumField({ field, value, onChange, id, error, disabled }: EnumFieldProps) {
  const s = useFieldStrings();
  const isSegmented = field.options.length <= 4 && field.options.every((o) => o.length <= 16);
  const domId = useFieldDomId(id);

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="choice"
      description={field.description}
      required={field.required}
      error={error}
      htmlFor={isSegmented ? undefined : domId}
    >
      {isSegmented ? (
        // `type="single"` gives the roving tabindex and arrow-key navigation a
        // radiogroup owes its user, and emits `''` when the active item is
        // pressed again - which is the field's "clear" path.
        <ToggleGroup
          type="single"
          value={value ?? ''}
          onValueChange={(next) => onChange(next === '' ? undefined : next)}
          disabled={disabled}
          aria-label={field.title ?? field.name}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {field.options.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              variant="outline"
              className="h-9 min-w-0 gap-1.5 border-border bg-input px-3 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:font-medium data-[state=on]:text-foreground"
            >
              {value === option && (
                <Check className="size-3.5 text-primary" strokeWidth={2.5} aria-hidden="true" />
              )}
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : (
        <Select
          value={value ?? ''}
          disabled={disabled}
          onValueChange={(next) => onChange(next === CLEAR_VALUE ? undefined : next)}
        >
          <SelectTrigger id={domId} aria-invalid={!!error} className="h-11">
            <SelectValue placeholder={s.selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CLEAR_VALUE}>{s.selectPlaceholder}</SelectItem>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  );
}
