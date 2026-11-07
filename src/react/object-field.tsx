'use client';

import { createContext, use, useState } from 'react';
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
 * How many structures a field sits inside: 0 for a form's own field, one more
 * inside each structure. A list's rows do not add to it, because a row is a
 * box the list draws, not a structure. Only `ObjectField` reads it.
 */
const StructureDepthContext = createContext(0);

/**
 * How a structure groups its sub-fields, by where it stands.
 *
 * - `box`: a structure that is a form's own field, under its name - one
 *   hairline card, which is what says where the structure ends.
 * - `rule`: a structure inside a structure, under its name - its fields hang
 *   from a rule along their left edge rather than from a second card inside
 *   the first. A card in a card in a host's panel is three boxes deep, and on
 *   a phone each one's padding took the width a field needed: the stay's city
 *   of a trip request came out about 237 pixels wide.
 * - `none`: a structure whose name is not drawn, which is a list's row. The
 *   row is already a box, so the structure adds nothing around its fields.
 */
type StructureGrouping = 'box' | 'rule' | 'none';

function structureGrouping(depth: number, labelled: boolean): StructureGrouping {
  if (!labelled) return 'none';
  return depth === 0 ? 'box' : 'rule';
}

/**
 * A structure's name, set as a heading over its fields' labels in `app`: the
 * form's own structures largest, and one inside another a step below, so the
 * levels of a request read as levels rather than as one flat list of labels.
 * `studio` keeps the mono identifier every label there is set in.
 */
function structureNameClass(isApp: boolean, depth: number): string {
  if (!isApp) return 'font-mono text-[13px] font-medium leading-none';
  return depth === 0
    ? 'text-[16px] font-semibold leading-snug'
    : 'text-[14.5px] font-semibold leading-snug';
}

/**
 * A structured concept: its sub-fields under its name, grouped by where the
 * structure stands (`StructureGrouping`): a card for a form's own structure,
 * a rule for one inside another, and nothing for a list's row, so nesting
 * stays legible without boxing a field into a sliver of a phone. Empty
 * optional sub-fields collapse behind a "+ N optional" toggle - required and
 * already-filled fields always show.
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
  const depth = use(StructureDepthContext);
  const data = value ?? {};
  const label = fieldLabel(field.title, field.name, presentation);
  const grouping = structureGrouping(depth, label.trim() !== '');

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
        <span className={cn('text-foreground', structureNameClass(isApp, depth))}>{label}</span>
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="structured" />}
      </div>
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}

      <div
        // Names the grouping for a host's stylesheet and for tests, which
        // cannot read a box or a rule from the classes that draw it.
        data-structure-group={grouping}
        className={cn(
          'space-y-4',
          grouping === 'box' && 'rounded-lg border bg-card/40 p-4 max-sm:p-3',
          grouping === 'rule' && 'border-l-2 pl-4 max-sm:pl-3',
          grouping !== 'none' && (error ? 'border-destructive/50' : 'border-border'),
        )}
      >
        <StructureDepthContext value={depth + 1}>
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
        </StructureDepthContext>

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
