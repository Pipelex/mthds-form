'use client';

import { cn } from './utils';
import type { BooleanRunField } from '../core';
import { ConceptPill } from './concept-pill';
import { fieldLabel, shownDescription, useFieldPresentation } from './field-presentation';
import { FieldDescription, FieldHeader, OptionalPill } from './field-shell';
import { useStructureDepth } from './field-context';
import { shownAsOptional } from '../core/readiness';
import { Switch } from './ui/switch';
import { useFieldDomId } from './field-dom-id';

interface BooleanFieldProps {
  field: BooleanRunField;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  id: string;
  disabled?: boolean;
}

/**
 * A toggle. Unlike the other fields the label sits inline with the control on a
 * single hairline row - a boolean reads better as a switchable statement than as
 * a labelled box.
 */
export function BooleanField({ field, value, onChange, id, disabled }: BooleanFieldProps) {
  // Same label chrome switch as `FieldShell` - this control owns its own label
  // because it sits inline with the switch. See `field-presentation.tsx`.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const domId = useFieldDomId(id);
  const label = fieldLabel(field.title, field.name, presentation);
  const description = shownDescription(field.description, label, ['boolean'], presentation);
  const depth = useStructureDepth();
  const toggle = (
    <Switch
      id={domId}
      checked={value ?? false}
      onCheckedChange={onChange}
      disabled={disabled}
      className="shrink-0"
    />
  );
  if (isApp && label.trim() !== '' && depth > 0) {
    // A structure's yes or no: one of its rows, the switch at the end of the
    // control column, and under its label once the structure is narrow.
    return (
      <div
        data-field-row=""
        className="grid grid-cols-1 items-center gap-x-4 gap-y-1.5 py-[7px] @min-[521px]:grid-cols-[minmax(0,1fr)_min(400px,54cqi)]"
      >
        <div className="flex min-w-0 flex-col gap-px">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <label
              htmlFor={domId}
              className="text-[13px] font-medium leading-[18px] text-foreground"
            >
              {label}
            </label>
            {shownAsOptional(field) && <OptionalPill />}
          </div>
          {description && (
            <p className="m-0 text-[12px] leading-4 text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex @min-[521px]:justify-end">{toggle}</div>
      </div>
    );
  }
  if (isApp) {
    // An input of its own: one compact row, the label and description on the
    // left and the switch on the right, off meaning no.
    return (
      <div className={cn('flex items-center gap-4', disabled && 'opacity-50')}>
        <div className="min-w-0 flex-1">
          <FieldHeader
            label={label}
            htmlFor={domId}
            optional={shownAsOptional(field)}
            description={description}
          />
        </div>
        {toggle}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-md border border-border bg-input px-3.5 py-3',
        disabled && 'opacity-50',
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <label
            htmlFor={domId}
            className="font-mono text-[13px] font-medium leading-none text-foreground"
          >
            {label}
          </label>
          <ConceptPill conceptRef={field.conceptRef} category="boolean" />
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
      </div>
      {toggle}
    </div>
  );
}
