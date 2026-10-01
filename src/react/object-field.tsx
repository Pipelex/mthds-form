'use client';

import { useState } from 'react';
import { cn } from './utils';
import type { ObjectRunField } from '../core';
import { ownProp } from '../core/own-property';
import {
  foldsBehindOptionalDisclosure,
  hasPresenceSwitch,
  isFilled,
  presenceSwitchOn,
} from '../core/readiness';
import { seedObjectValue } from '../core/seed';
import { ConceptPill } from './concept-pill';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { useFieldDomId } from './field-dom-id';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { OptionalToggle } from './optional-toggle';
import { Switch } from './ui/switch';

interface ObjectFieldProps {
  field: ObjectRunField;
  value: Record<string, unknown> | undefined;
  /** `undefined` only from an optional structure's switch turned OFF. */
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
 * An OPTIONAL structure carries a presence switch in its header instead of the
 * optional badge (`hasPresenceSwitch`), and is its own disclosure: it never
 * folds behind its parent's toggle. The switch reads the value - ON over any
 * object, OFF over an absent one - and holds no state of its own. Turning it
 * off writes `undefined`, so the structure leaves the payload; turning it on
 * writes `seedObjectValue(field)`, the structure seeded from its children's
 * authored defaults by the kernel's own seed.
 */
export function ObjectField({ field, value, onChange, id, error, env }: ObjectFieldProps) {
  const s = useFieldStrings();
  const [showOptional, setShowOptional] = useState(false);
  // A grouped concept reads as a section heading in an app, not as a typed field.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const domId = useFieldDomId(id);
  const switchable = hasPresenceSwitch(field);
  const on = !switchable || presenceSwitchOn(value);
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

  const labelId = `${domId}-label`;
  const includeId = `${domId}-include`;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex flex-wrap gap-x-2 gap-y-1',
          switchable ? 'items-center' : 'items-baseline',
        )}
      >
        <span
          id={labelId}
          className={cn(
            'text-[13px] font-medium leading-none text-foreground',
            isApp ? 'text-[13.5px]' : 'font-mono',
          )}
        >
          {fieldLabel(field.title, field.name, presentation)}
        </span>
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="structured" />}
        {switchable && (
          <span className="ml-auto flex items-center gap-2">
            <label id={includeId} htmlFor={domId} className="text-[11px] text-muted-foreground">
              {s.includeOptional}
            </label>
            <Switch
              id={domId}
              aria-labelledby={`${includeId} ${labelId}`}
              checked={on}
              onCheckedChange={(checked) => onChange(checked ? seedObjectValue(field) : undefined)}
              disabled={env?.disabled}
              className="shrink-0"
            />
          </span>
        )}
      </div>
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}

      {on && (
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
