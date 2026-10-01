'use client';

import { useState } from 'react';
import { cn } from './utils';
import type { ObjectRunField } from '../core';
import { ownProp } from '../core/own-property';
import {
  foldsBehindOptionalDisclosure,
  hasPresenceToggle,
  isFilled,
  presenceOpen,
} from '../core/readiness';
import { seedObjectValue } from '../core/seed';
import { ConceptPill } from './concept-pill';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { DisclosureButton, OptionalToggle } from './optional-toggle';

interface ObjectFieldProps {
  field: ObjectRunField;
  value: Record<string, unknown> | undefined;
  /** `undefined` only from an optional structure's presence toggle closing it. */
  onChange: (value: Record<string, unknown> | undefined) => void;
  id: string;
  error?: string;
  env?: FieldEnv;
}

/**
 * A structured concept: its sub-fields rendered inside one hairline-grouped
 * card so nesting stays legible. Empty optional sub-fields collapse behind a
 * "+ N optional" toggle - required and already-filled fields always show.
 *
 * An OPTIONAL structure is its own disclosure (`hasPresenceToggle`), drawn
 * with the same collapse control as the "+ N optional" toggle, worded by the
 * structure's label, and never folded behind its parent's toggle. It reads the
 * value - open over any object, closed over an absent one - and holds no state
 * of its own. Closed, the field is that button alone; opening it writes
 * `seedObjectValue(field)`, the structure seeded from its children's authored
 * defaults by the kernel's own seed, and shows the card; closing it writes
 * `undefined`, so the structure leaves the payload.
 */
export function ObjectField({ field, value, onChange, id, error, env }: ObjectFieldProps) {
  const [showOptional, setShowOptional] = useState(false);
  // A grouped concept reads as a section heading in an app, not as a typed field.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const toggleable = hasPresenceToggle(field);
  const open = !toggleable || presenceOpen(value);
  const data = value ?? {};

  const setChild = (name: string, childValue: unknown) => onChange({ ...data, [name]: childValue });

  // `ownProp`, not `data[f.name]`: the name is the method author's, the record
  // is a plain object a host built, and a child named `constructor` or
  // `toString` reads as the inherited function from a bare index. The kernel
  // spells this read one way at every one of its sites; the control set is the
  // other half of "every".
  const optionalEmpty = field.fields.filter(
    (f) => foldsBehindOptionalDisclosure(f) && !isFilled(ownProp(data, f.name)),
  );
  const visible = showOptional
    ? field.fields
    : field.fields.filter(
        (f) => !foldsBehindOptionalDisclosure(f) || isFilled(ownProp(data, f.name)),
      );

  const label = fieldLabel(field.title, field.name, presentation);
  const toggle = toggleable ? (
    <DisclosureButton
      expanded={open}
      onToggle={() => onChange(open ? undefined : seedObjectValue(field))}
      disabled={env?.disabled}
    >
      {label}
    </DisclosureButton>
  ) : null;

  // Closed, an optional structure is its disclosure and nothing else - the
  // same "+" control the optional fields fold behind, worded by its label.
  if (toggleable && !open) {
    return (
      <div className="space-y-2">
        {toggle}
        {error && (
          <p className="text-[11px] text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {toggle ?? (
          <span
            className={cn(
              'text-[13px] font-medium leading-none text-foreground',
              isApp ? 'text-[13.5px]' : 'font-mono',
            )}
          >
            {label}
          </span>
        )}
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="structured" />}
      </div>
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}

      {open && (
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

          {optionalEmpty.length > 0 && (
            <OptionalToggle
              count={optionalEmpty.length}
              expanded={showOptional}
              onToggle={() => setShowOptional((v) => !v)}
              noun="field"
            />
          )}
        </div>
      )}
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
