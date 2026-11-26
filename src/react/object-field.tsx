'use client';

import { createContext, use, useState } from 'react';
import { shownAsOptional } from '../core/readiness';
import { cn } from './utils';
import type { ObjectRunField, RunField } from '../core';
import { ownProp } from '../core/own-property';
import {
  anyOptionalStructureOpen,
  gateRefusal,
  isFoldedOptional,
  isOptionalStructure,
} from '../core/readiness';
import { closeOptionalStructures, openOptionalStructures } from '../core/seed';
import { ConceptPill } from './concept-pill';
import { useFieldDomId } from './field-dom-id';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { fieldLabel, shownDescription, useFieldPresentation } from './field-presentation';
import { FieldDescription } from './field-shell';
import { useFieldStrings } from './field-strings';
import { OptionalToggle } from './optional-toggle';
import { headingFaceClass } from './style-tokens';
import { StructureDepthContext } from './field-context';
import { FieldHeader, OptionalPill } from './field-shell';
import { PasteJsonEditor, PasteJsonSwitch } from './paste-json';

interface ObjectFieldProps {
  field: ObjectRunField;
  value: Record<string, unknown> | undefined;
  onChange: (value: Record<string, unknown>) => void;
  id: string;
  error?: string;
  env?: FieldEnv;
}

/**
 * Whether the host draws the form inside a panel of its own, which
 * `MethodForm`'s `framed` states. Only the host knows it: the kernel cannot
 * see the box around it, and a form on a bare page still needs its own card
 * to say where a structure ends. Only `ObjectField` reads it, and only for a
 * form's own structure (`section`, below).
 */
export const FramedFormContext = createContext(false);

/**
 * Whether the form's input sits in a card the form draws for it, which
 * `MethodForm`'s `layout="grid"` does for each input. A structure in a card
 * draws no card of its own: the card is the structure's.
 */
export const InputCardContext = createContext(false);

/**
 * The id of the structure the form's own run gate refuses, after the person
 * has tried to run, whose members it refuses are marked one by one: each
 * empty required member `requiredField`, each started optional one that is
 * not complete `incompleteField`, at every depth, as `MethodForm` marks its
 * own inputs. `MethodForm` sets it for an input it refuses, and a structure
 * sets it for a member it marks; any other structure, a list's row included,
 * sees an id that is not its own and marks nothing. A host's `errors` entry
 * sets none: its message is about the structure.
 */
export const RefusedStructureContext = createContext<string | null>(null);

/**
 * How a structure groups its sub-fields, by where it stands.
 *
 * - `box`: a structure that is a form's own field, under its name - one
 *   hairline card, which is what says where the structure ends.
 * - `section`: the same structure when the host has framed the form in a
 *   panel of its own (`FramedFormContext`). The host's panel is already the
 *   card, so a second one inside it read as a box in a box: the structure's
 *   name heads its fields with nothing drawn around them, and `MethodForm`
 *   sets a hairline between it and any input beside it, which is what says
 *   where it ends. In error it has no outline to turn red, so it draws its
 *   own edge instead (`SECTION_ERROR_EDGE`) and sets its message at its
 *   heading.
 * - `rule`: a structure inside a structure, under its name - its fields hang
 *   from a rule along their left edge rather than from a second card inside
 *   the first. A card in a card in a host's panel is three boxes deep, and on
 *   a phone each one's padding took the width a field needed: the stay's city
 *   of a trip request came out about 237 pixels wide.
 * - `none`: a structure whose name is not drawn, which is a list's row. The
 *   row is already a box, so the structure adds nothing around its fields.
 */
type StructureGrouping = 'box' | 'section' | 'rule' | 'none';

function structureGrouping(depth: number, labelled: boolean, framed: boolean): StructureGrouping {
  if (!labelled) return 'none';
  if (depth > 0) return 'rule';
  return framed ? 'section' : 'box';
}

/**
 * What a section in error draws where a card would turn its outline red: a
 * bar in the error colour down the section's whole height, from its heading
 * to its last field, just outside the form's start edge. It stands out of
 * the flow, so it moves no field when the error comes or goes, and it is one
 * edge rather than four, so no card comes back inside the host's panel.
 *
 * It stands 4 pixels off the form, as a field's own error outline stands 4
 * pixels off the field (`FieldShell`), so it asks for 7 pixels of room
 * beside the form, little more than the 5 that outline already takes; a
 * host's panel pads its form by more than that, and a host that clips
 * closer loses the bar as it loses the outline, while the section's message
 * at its heading stays. Three pixels in the solid error colour, where the
 * card's outline is one, because a single edge has less length to be seen
 * by; the brand contract holds that colour to the 3:1 a mark needs on the
 * page and on a card. `m-0` undoes the spacing the stack
 * it heads gives its children, which would shorten it.
 */
const SECTION_ERROR_EDGE =
  'pointer-events-none absolute inset-y-0 -start-[7px] m-0 w-[3px] rounded-full bg-destructive';

/**
 * A structure's name, set as a heading over its fields' labels in `app`: the
 * form's own structures largest, and one inside another a step below, so the
 * levels of a request read as levels rather than as one flat list of labels.
 * `studio` keeps the mono identifier every label there is set in.
 */
function structureNameClass(isApp: boolean, depth: number): string {
  if (!isApp) return 'font-mono text-[13px] font-medium leading-none';
  // A structure's name takes the page's heading face, so a style's serif
  // reaches the form's sections, and keeps the kernel's own weight: it labels
  // a group of fields rather than titling the page.
  return cn(
    depth === 0
      ? 'text-[16px] font-semibold leading-snug'
      : 'text-[14.5px] font-semibold leading-snug',
    headingFaceClass,
  );
}

/**
 * A structured concept: its sub-fields under its name, grouped by where the
 * structure stands (`StructureGrouping`): a card for a form's own structure,
 * or a section when the host has framed the form in its own panel, a rule
 * for one inside another, and nothing for a list's row, so nesting
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
  const description = shownDescription(field.description, label, ['structured'], presentation);
  const grouping = structureGrouping(depth, label.trim() !== '', use(FramedFormContext));
  // Document-unique, as every control's id is: two forms mounting the same
  // method must not label one structure with the other's name.
  const domId = useFieldDomId(id);
  // Whether the form's run gate refuses this structure, in which case each
  // member it refuses is marked as the form marks its own inputs.
  const refused = use(RefusedStructureContext) === id;
  const s = useFieldStrings();
  const markOf = (child: RunField): string | undefined => {
    if (!refused) return undefined;
    const refusal = gateRefusal(child, ownProp(data, child.name), child.required);
    if (refusal === 'required') return s.requiredField;
    return refusal === 'incomplete' ? s.incompleteField : undefined;
  };

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

  // A named structure is a group its name labels, so assistive technology
  // hears the levels a reader sees: two cities in two structures are each
  // announced inside their own. A list's row draws no name and is no group.
  const nameId = `${domId}--name`;
  const descriptionId = `${domId}--description`;
  const group =
    grouping === 'none'
      ? {}
      : {
          role: 'group',
          'aria-labelledby': nameId,
          'aria-describedby': description ? descriptionId : undefined,
        };

  const inCard = use(InputCardContext);
  const [json, setJson] = useState(false);

  if (isApp) {
    const fields = (
      <StructureDepthContext value={depth + 1}>
        {visible.map((child) => {
          const childId = `${id}.${child.name}`;
          const mark = markOf(child);
          return (
            <RefusedStructureContext key={child.name} value={mark ? childId : null}>
              <FieldRenderer
                field={child}
                value={ownProp(data, child.name)}
                onChange={(v) => setChild(child.name, v)}
                id={childId}
                error={mark}
                env={env}
              />
            </RefusedStructureContext>
          );
        })}
      </StructureDepthContext>
    );
    const optionalToggle = (folded.length > 0 || structureOpen) && (
      <OptionalToggle count={folded.length} expanded={expanded} onToggle={toggle} noun="field" />
    );
    const appCaption = error && (
      <p className="text-[11px] text-destructive" role="alert">
        {error}
      </p>
    );
    if (grouping === 'none') {
      // A list's row: its fields one under the other, nothing around them.
      return (
        <div data-structure-group="none" className="flex flex-col gap-0.5">
          {fields}
          {optionalToggle}
          {appCaption}
        </div>
      );
    }
    if (grouping === 'rule') {
      // A structure inside a structure: its name on a row of its own, its
      // fields hanging from a thin rule under it.
      return (
        <div {...group}>
          <div className="flex flex-col gap-px pt-2.5 pb-0.5">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span
                id={nameId}
                className={cn(
                  'text-[13px] font-semibold leading-[18px] text-foreground',
                  headingFaceClass,
                )}
              >
                {label}
              </span>
              {shownAsOptional(field) && <OptionalPill />}
            </div>
            {description && (
              <p id={descriptionId} className="m-0 text-[12px] leading-4 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div
            data-structure-group="rule"
            className={cn(
              'flex flex-col gap-0.5 border-l-[1.5px] pl-3.5',
              error ? 'border-destructive' : 'border-border',
            )}
          >
            {fields}
            {optionalToggle}
          </div>
          {appCaption}
        </div>
      );
    }
    // A form's own structure: the input's header, its Form / Paste JSON
    // switch, then its fields as rows. In a card the card is the structure's;
    // on a bare page the structure draws the card itself.
    const section = grouping === 'section';
    const card = grouping === 'box' && !inCard;
    return (
      <div
        data-form-section={section ? '' : undefined}
        data-structure-group={grouping}
        {...group}
        className={cn(
          'relative flex flex-col gap-3 @container',
          card && 'rounded-xl bg-card px-[18px] pt-4 pb-[18px] ring-1 ring-border',
          card && error && 'ring-destructive',
        )}
      >
        {section && error && (
          <span aria-hidden="true" data-error-edge="" className={SECTION_ERROR_EDGE} />
        )}
        <FieldHeader
          label={label}
          labelId={nameId}
          optional={shownAsOptional(field)}
          description={description}
          descriptionId={descriptionId}
          aside={
            <PasteJsonSwitch
              label={label}
              json={json}
              onChange={setJson}
              disabled={env?.disabled}
            />
          }
        />
        {json ? (
          <PasteJsonEditor
            field={field}
            value={value}
            disabled={env?.disabled}
            onUse={(next) => {
              onChange(next as Record<string, unknown>);
              setJson(false);
            }}
          />
        ) : (
          <div className="flex flex-col gap-0.5">
            {fields}
            {optionalToggle}
          </div>
        )}
        {appCaption}
      </div>
    );
  }

  const section = grouping === 'section';
  const caption = error && (
    <p className="text-[11px] text-destructive" role="alert">
      {error}
    </p>
  );

  const content = (
    <>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span id={nameId} className={cn('text-foreground', structureNameClass(isApp, depth))}>
          {label}
        </span>
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="structured" />}
        {/* A section has no outline to turn red, so its message is set where
            it starts, beside its name, rather than under its last field,
            which on a tall section is a screen away from the heading. The
            heading's row has room for it, so it adds no line unless the row
            wraps. */}
        {section && caption}
      </div>
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}

      <div
        // Names the grouping for a host's stylesheet and for tests, which
        // cannot read a box or a rule from the classes that draw it.
        data-structure-group={grouping}
        className={cn(
          'space-y-4',
          grouping === 'box' && 'rounded-lg border bg-card/40 p-4 max-sm:p-3',
          grouping === 'section' && 'pt-2',
          grouping === 'rule' && 'border-l-2 pl-4 max-sm:pl-3',
          // In error, a card's outline and a rule turn the error colour
          // itself, which the brand contract holds at 3:1 on the page and on
          // a card: at half of it they read under that bar in every palette.
          (grouping === 'box' || grouping === 'rule') &&
            (error ? 'border-destructive' : 'border-border'),
        )}
      >
        <StructureDepthContext value={depth + 1}>
          {visible.map((child) => {
            const childId = `${id}.${child.name}`;
            const mark = markOf(child);
            return (
              <RefusedStructureContext key={child.name} value={mark ? childId : null}>
                <FieldRenderer
                  field={child}
                  value={ownProp(data, child.name)}
                  onChange={(v) => setChild(child.name, v)}
                  id={childId}
                  error={mark}
                  env={env}
                />
              </RefusedStructureContext>
            );
          })}
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
      {!section && caption}
    </>
  );

  return (
    <div
      className={section ? undefined : 'space-y-2'}
      // What `MethodForm` sets its hairline against, beside a framed form's
      // own structure.
      data-form-section={section ? '' : undefined}
      {...group}
    >
      {section ? (
        // The section's content, without the padding `MethodForm`'s
        // hairlines give the section's own box: what the error edge runs
        // beside. Positioned whether or not it is in error, so an error
        // changes nothing a descendant is placed against.
        <div className="relative space-y-2">
          {error && <span aria-hidden="true" data-error-edge="" className={SECTION_ERROR_EDGE} />}
          {content}
        </div>
      ) : (
        content
      )}
    </div>
  );
}
