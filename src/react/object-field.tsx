'use client';

import { useState } from 'react';
import { cn } from './utils';
import type { ObjectRunField } from '../core';
import { ownProp } from '../core/own-property';
import { anyOptionalStructureOpen, isFoldedOptional, isOptionalStructure } from '../core/readiness';
import { closeOptionalStructures, openOptionalStructures } from '../core/seed';
import { ConceptPill } from './concept-pill';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { OptionalToggle } from './optional-toggle';

interface ObjectFieldProps {
  field: ObjectRunField;
  value: Record<string, unknown> | undefined;
  onChange: (value: Record<string, unknown>) => void;
  id: string;
  error?: string;
  env?: FieldEnv;
}

/**
 * A structured concept: its sub-fields rendered inside one hairline-grouped
 * card so nesting stays legible. Empty optional sub-fields collapse behind a
 * "+ N optional" toggle - required and already-filled fields always show.
 *
 * A CLOSED optional sub-structure (absent value) folds behind that toggle and
 * is counted like any empty optional field. The toggle also opens and closes
 * them: expanding writes `seedObjectValue` into every closed one, collapsing
 * writes `undefined` into every one, so they leave the payload. It reads
 * expanded while any of them is open, so a restored value that holds one
 * offers to close it. An open optional structure renders like any other: its
 * label, description and card, with no badge.
 */
export function ObjectField({ field, value, onChange, id, error, env }: ObjectFieldProps) {
  const [showOptional, setShowOptional] = useState(false);
  // A grouped concept reads as a section heading in an app, not as a typed field.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const data = value ?? {};

  const setChild = (name: string, childValue: unknown) => onChange({ ...data, [name]: childValue });

  // `ownProp`, not `data[f.name]`: the name is the method author's, the record
  // is a plain object a host built, and a child named `constructor` or
  // `toString` reads as the inherited function from a bare index. The kernel
  // spells this read one way at every one of its sites; the control set is the
  // other half of "every".
  const folded = field.fields.filter((f) => isFoldedOptional(f, ownProp(data, f.name)));
  const structureOpen = anyOptionalStructureOpen(field.fields, data);
  const expanded = showOptional || structureOpen;
  const visible = expanded
    ? field.fields
    : field.fields.filter((f) => !isFoldedOptional(f, ownProp(data, f.name)));
  const hasStructure = field.fields.some(isOptionalStructure);

  const toggle = () => {
    setShowOptional(!expanded);
    // Only write when there is a structure to open or close: a toggle over
    // leaf fields alone is view state the value never sees.
    if (hasStructure) {
      onChange(
        expanded
          ? closeOptionalStructures(field.fields, data)
          : openOptionalStructures(field.fields, data),
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            'text-[13px] font-medium leading-none text-foreground',
            isApp ? 'text-[13.5px]' : 'font-mono',
          )}
        >
          {fieldLabel(field.title, field.name, presentation)}
        </span>
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="structured" />}
      </div>
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}

      <div
        className={cn(
          'space-y-4 rounded-lg border bg-card/40 p-4',
          error ? 'border-destructive/50' : 'border-border',
        )}
      >
        {visible.map((child) => (
          <FieldRenderer
            key={child.name}
            field={child}
            value={ownProp(data, child.name)}
            onChange={(v) => setChild(child.name, v)}
            id={`${id}.${child.name}`}
            env={env}
          />
        ))}

        {(folded.length > 0 || structureOpen) && (
          <OptionalToggle
            count={folded.length}
            expanded={expanded}
            onToggle={toggle}
            noun="field"
          />
        )}
      </div>
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
