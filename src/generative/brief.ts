import type { RunField } from '../core';
import { isNativeCompositeNode, isNativeDateNode, isNativeHtmlNode } from '../core/native-content';
import type { Brief, PathEntry } from '../generated/layout-design/types';
import { INPUTS_ROOT, RESULT_ROOT, joinPath } from './paths';

/**
 * The brief: the model's view of the descriptor, as DATA.
 *
 * Rule 1, restated for a model. The model's input is the DESCRIPTOR, never JSON
 * Schema: it receives the kinds, the labels, the descriptions, the choices, the
 * presence and what gates the run - projected from `RunField[]` here, and from
 * nowhere else, into the `Brief` structure the designer method declares. On the
 * result side it also receives one real run's loaded state, so it can judge
 * magnitudes, but it never sees the wire: the state it reads is what
 * `payloadToState` produced, with the envelopes already gone.
 *
 * Nothing here is prose. The sentences a model reads - the headings, how a
 * path line is worded, what "delegated" says - are the method's own, in the
 * `render_brief` stage of `methods/layout-design.mthds`: a Jinja2 template
 * over this value, and the one place the brief's wording is edited. What this
 * module contributes is what only code can state: every path, flattened in
 * reading order with its depth, its kind in words, its constraints in words,
 * and which of them the kernel keeps. The shape is the method's own: codegen
 * projects its `Brief` and `PathEntry` structures into
 * `src/generated/layout-design/`, and the aliases below are those types,
 * imported type-only so the generated schemas stay out of the entry. A field
 * renamed in the bundle fails the type check on the literals here rather than
 * a run.
 *
 * Pure, no React, and the only place the descriptor is projected for a model.
 * What a path is marked as (delegated or not) is decided here too, so the
 * projection, the brief and the validator agree on which paths the kernel
 * renders.
 */

/** The `Brief` structure of `methods/layout-design.mthds`, as codegen projects it. */
export type DesignerBrief = Brief;
/** One path of the brief: where it is, what it holds, what constrains it, whether the kernel keeps it. */
export type DesignerPathEntry = PathEntry;

/** The concept a run request names for the `brief` input: the method's own, domain-qualified. */
export const DESIGNER_BRIEF_CONCEPT = 'generative.Brief';

/**
 * The component that runs the page, handed over as the brief's `run_control`
 * so the brief and the catalog agree on which one it is - and so the method's
 * own prose can go on naming none of the catalog's chrome. A rename in the
 * catalog does not have to be caught here: a brief asking for a component the
 * catalog no longer has produces a layout the validator refuses, loudly, on
 * the pass that made it.
 */
const RUN_COMPONENT = 'Cta';

export interface BriefSubject {
  /** `results.nested_result`. */
  pipeRef: string;
  /** The pipe's description, when the wire carries one. */
  description?: string;
  /**
   * The method's name as a host lists it - an authored method's, since a host
   * has one for every method it lists; absent on a synthesized carrier, which
   * no host lists. The brief hands it to the layout as the one product name
   * the page may carry, because the brand catalog's AppBar asks for a name
   * and a brief that gives none gets one invented.
   */
  name?: string;
}

/**
 * On the input side, the kinds the catalog's inputs cannot enter - and one
 * shape of a kind they otherwise can. The standard puts no floor on a choice,
 * so an enum may carry `""`; the catalog's own choices may not, because no
 * dropdown row or pill can offer nothing, and the validator refuses an empty
 * option. A model told to list the brief's choices exactly would copy the
 * empty one into a layout the validator then refuses, so the brief hands the
 * input back to the kernel's own control instead.
 */
export function isDelegatedInput(field: RunField): boolean {
  return (
    field.kind === 'document' ||
    field.kind === 'image' ||
    field.kind === 'date' ||
    field.kind === 'list' ||
    field.kind === 'unknown' ||
    (field.kind === 'enum' && field.options.includes(''))
  );
}

/** On the result side, the kinds and concepts the catalog cannot show. */
export function isDelegatedResult(field: RunField): boolean {
  if (isNativeHtmlNode(field) || isNativeDateNode(field) || isNativeCompositeNode(field)) {
    return true;
  }
  return (
    field.kind === 'document' ||
    field.kind === 'image' ||
    field.kind === 'date' ||
    field.kind === 'prose' ||
    field.kind === 'unknown'
  );
}

/** What a path holds, in words - the one rendering of a kind the brief carries. */
function kindLabel(field: RunField): string {
  if (isNativeHtmlNode(field)) return 'markup (native.Html)';
  if (isNativeDateNode(field)) return 'date (native.Date)';
  if (isNativeCompositeNode(field)) return 'composite (native.Composite)';
  switch (field.kind) {
    case 'text':
      return 'text';
    case 'prose':
      return 'prose (markdown)';
    case 'number':
      return field.integer ? 'integer' : 'number';
    case 'boolean':
      return 'boolean';
    case 'enum':
      return `choice of ${field.options.map((option) => JSON.stringify(option)).join(' | ')}`;
    case 'date':
      return field.datetime ? 'date with time' : 'date';
    case 'document':
      return 'document (a file)';
    case 'image':
      return 'image (a file)';
    case 'object':
      return `structure${field.conceptRef ? ` ${field.conceptRef}` : ''}`;
    case 'list':
      return `list of ${kindLabel(field.item)}`;
    case 'unknown':
      return 'unknown';
    default:
      return field satisfies never;
  }
}

/** The constraints and hints of a field, each one fact in words. */
function constraints(field: RunField): string[] {
  const notes: string[] = [];
  if (field.kind === 'number') {
    if (field.min !== undefined) notes.push(`min ${field.min}`);
    if (field.max !== undefined) notes.push(`max ${field.max}`);
  }
  if (field.kind === 'text' || field.kind === 'prose') {
    if (field.minLength !== undefined) notes.push(`at least ${field.minLength} characters`);
    if (field.maxLength !== undefined) notes.push(`at most ${field.maxLength} characters`);
    if (field.format) notes.push(`format ${field.format}`);
  }
  if (field.kind === 'list') {
    if (field.itemCount !== undefined) notes.push(`at least ${field.itemCount} items`);
    if (field.maxItemCount !== undefined) notes.push(`at most ${field.maxItemCount} items`);
  }
  if (field.defaultValue !== undefined) notes.push(`default ${JSON.stringify(field.defaultValue)}`);
  if (field.examples && field.examples.length > 0) {
    notes.push(`examples ${field.examples.map((example) => JSON.stringify(example)).join(', ')}`);
  }
  if (field.hints && Object.keys(field.hints).length > 0) {
    notes.push(
      `hints ${Object.entries(field.hints)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')}`,
    );
  }
  return notes;
}

type Side = 'input' | 'result';

/**
 * One path as the brief carries it. Presence is an input-page fact, so it is
 * stated on that side only; `relative` marks a path spelled from one item of
 * the list above, which is how a DataTable column or `$item` reads it.
 */
function entryOf(
  field: RunField,
  path: string,
  depth: number,
  side: Side,
  relative: boolean,
): DesignerPathEntry {
  const notes = constraints(field);
  return {
    depth,
    path,
    kind: kindLabel(field),
    name: field.name,
    title: field.title && field.title !== field.name ? field.title : undefined,
    description: field.description,
    required: side === 'input' ? field.required : undefined,
    gating: side === 'input' && field.gating ? true : undefined,
    notes: notes.length > 0 ? notes : undefined,
    default: field.defaultValue === undefined ? undefined : JSON.stringify(field.defaultValue),
    delegated: side === 'input' ? isDelegatedInput(field) : isDelegatedResult(field),
    relative: relative ? true : undefined,
  };
}

/**
 * A path and, beneath it, what the page can lay out: a structure's members at
 * their own paths, and - on a result page - a list's item, whose members
 * follow spelled relative to one item. A delegated path ends the walk: the
 * kernel renders it whole, so its members are nobody else's to bind.
 */
function describe(
  field: RunField,
  path: string,
  depth: number,
  side: Side,
  entries: DesignerPathEntry[],
): void {
  const entry = entryOf(field, path, depth, side, false);
  entries.push(entry);
  if (entry.delegated) return;
  if (field.kind === 'object') {
    for (const child of field.fields) {
      describe(child, joinPath(path, child.name), depth + 1, side, entries);
    }
  }
  if (field.kind === 'list' && side === 'result') {
    const item = field.item;
    entry.item_kind = kindLabel(item);
    entry.item_description = item.description;
    if (item.kind === 'object' && !isDelegatedResult(item)) {
      entry.item_laid_out = true;
      for (const child of item.fields) {
        describeRelative(child, child.name, depth + 2, entries);
      }
    }
  }
}

/** A member of a list's item, spelled relative to that item; a nested list's members go through `<i>`. */
function describeRelative(
  field: RunField,
  relativePath: string,
  depth: number,
  entries: DesignerPathEntry[],
): void {
  const entry = entryOf(field, relativePath, depth, 'result', true);
  entries.push(entry);
  if (entry.delegated) return;
  if (field.kind === 'object') {
    for (const child of field.fields) {
      describeRelative(child, joinPath(relativePath, child.name), depth + 1, entries);
    }
  }
  if (field.kind === 'list') {
    const item = field.item;
    if (item.kind === 'object' && !isDelegatedResult(item)) {
      entry.item_kind = kindLabel(item);
      entry.item_description = item.description;
      entry.item_laid_out = true;
      for (const child of item.fields) {
        describeRelative(child, joinPath(relativePath, '<i>', child.name), depth + 2, entries);
      }
    }
  }
}

/** The brief for an INPUT page: the form a run is started from. */
export function inputBrief(subject: BriefSubject, fields: readonly RunField[]): DesignerBrief {
  const paths: DesignerPathEntry[] = [];
  for (const field of fields) describe(field, joinPath(INPUTS_ROOT, field.name), 0, 'input', paths);
  return {
    side: 'input',
    pipe_ref: subject.pipeRef,
    description: subject.description,
    name: subject.name,
    paths,
    run_control: RUN_COMPONENT,
  };
}

/** The brief for a RESULT page: what one run produced, laid out. */
export function resultBrief(subject: BriefSubject, field: RunField, state: unknown): DesignerBrief {
  const paths: DesignerPathEntry[] = [];
  if (field.kind === 'object' && !isDelegatedResult(field)) {
    // The result itself is the root, and its line names no member: it IS the
    // structure, whose members then follow one level down.
    paths.push({
      depth: 0,
      path: RESULT_ROOT,
      kind: kindLabel(field),
      description: field.description,
      delegated: false,
    });
    for (const child of field.fields) {
      describe(child, joinPath(RESULT_ROOT, child.name), 1, 'result', paths);
    }
  } else {
    describe(field, RESULT_ROOT, 0, 'result', paths);
  }
  return {
    side: 'result',
    pipe_ref: subject.pipeRef,
    description: subject.description,
    paths,
    sample_state: JSON.stringify(state, null, 2),
  };
}
