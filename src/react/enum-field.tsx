'use client';

import { shownAsOptional } from '../core/readiness';
import { Check } from 'lucide-react';
import { linkTextClass, selectedStateBorderClass } from './role-tokens';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import type { EnumRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { useFieldDomId } from './field-dom-id';
import { enumLabeler, fieldLabel, useFieldPresentation } from './field-presentation';
import { cn } from './utils';
import { hasOptionDescriptions, hasTones, optionDetail, optionTone } from '../core/hints';
import { ToneDot } from './tone-badge';

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
 *
 * An option's LABEL follows the presentation and its value does not. In `app`
 * a person picks "Unit price differs from po" and the form stores
 * `unit_price_differs_from_po`, because the result that run produces shows the
 * same field in words too, and a form and its result have to read the same
 * way - which is why both apply one rule, including its fallback to the codes
 * when two options would read the same. The segmented rule measures the label
 * it shows, which is the text that has to fit on the row.
 */
export function EnumField({ field, value, onChange, id, error, disabled }: EnumFieldProps) {
  const s = useFieldStrings();
  const presentation = useFieldPresentation();
  const labelOf = optionLabeler(field, presentation);
  const toned = hasTones(field);
  const described = hasOptionDescriptions(field);
  const isSegmented =
    !described && field.options.length <= 4 && field.options.every((o) => labelOf(o).length <= 16);
  const domId = useFieldDomId(id);
  const groupLabel = fieldLabel(field.title, field.name, presentation);

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="choice"
      description={field.description}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={isSegmented || described ? undefined : domId}
    >
      {described ? (
        // Options the method describes are cards: each its label, its tone's
        // dot and the sentence saying what choosing it means, so the person
        // reads the consequence before picking. The same single-choice group
        // as the segmented row, with its roving focus and arrow keys.
        <ToggleGroup
          type="single"
          value={value ?? ''}
          onValueChange={(next) => onChange(next === '' ? undefined : next)}
          disabled={disabled}
          aria-label={groupLabel}
          data-option-cards=""
          className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2"
        >
          {field.options.map((option) => {
            const detail = optionDetail(field, option);
            return (
              <ToggleGroupItem
                key={option}
                value={option}
                variant="outline"
                className={cn(
                  'h-auto min-w-0 flex-col items-start justify-start gap-1 whitespace-normal rounded-lg border-border bg-input px-3.5 py-3 text-left text-foreground hover:bg-muted',
                  selectedStateBorderClass,
                )}
              >
                <span className="flex w-full items-center gap-2 text-[13.5px] font-medium">
                  {toned && <ToneDot tone={optionTone(field, option)} />}
                  <span className="min-w-0 flex-1">{labelOf(option)}</span>
                  {value === option && (
                    <Check
                      className={cn('size-3.5 shrink-0', linkTextClass)}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  )}
                </span>
                {detail?.description && (
                  <span className="text-[12.5px] leading-snug font-normal text-muted-foreground">
                    {detail.description}
                  </span>
                )}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      ) : isSegmented ? (
        // `type="single"` gives the roving tabindex and arrow-key navigation a
        // radiogroup owes its user, and emits `''` when the active item is
        // pressed again - which is the field's "clear" path.
        <ToggleGroup
          type="single"
          value={value ?? ''}
          onValueChange={(next) => onChange(next === '' ? undefined : next)}
          disabled={disabled}
          // The group is named with the label the field SHOWS, so a screen
          // reader announces "Risk level" where the page reads it, not the
          // `risk_level` identifier behind it in `app`.
          aria-label={groupLabel}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {field.options.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              variant="outline"
              // The pressed fill and its text are the toggle's own selected state,
              // and the pressed edge is the accent's, as a tag's is. Below `sm`
              // each option grows to the 44 pixels a finger needs, in both
              // directions, as every other control of the kernel does there.
              className={cn(
                'h-9 min-w-0 gap-1.5 border-border bg-input px-3 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:font-medium max-sm:h-11 max-sm:min-w-11',
                selectedStateBorderClass,
              )}
            >
              {value === option ? (
                <Check
                  className={cn('size-3.5', linkTextClass)}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              ) : (
                toned && <ToneDot tone={optionTone(field, option)} />
              )}
              {labelOf(option)}
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
                <span className="flex items-center gap-2">
                  {toned && <ToneDot tone={optionTone(field, option)} />}
                  {labelOf(option)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  );
}

/**
 * How a choice's options are worded: the label the method gives an option
 * (MTHDS `9.2.0` option tables), shown verbatim in both presentations as an
 * authored title is, and otherwise the presentation's rule (`enumLabeler`):
 * the code in `studio`, the code in words in `app`. The stored value is always
 * the code. Shared with the result view, so a result reads as its form did.
 */
export function optionLabeler(
  field: EnumRunField,
  presentation: ReturnType<typeof useFieldPresentation>,
): (option: string) => string {
  const fallback = enumLabeler(field.options, presentation);
  return (option) => optionDetail(field, option)?.label ?? fallback(option);
}
