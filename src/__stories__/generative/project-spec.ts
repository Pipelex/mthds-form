import type { Spec, UIElement } from '@json-render/core';
import type { ObjectRunField, RunField } from '../../core';
import { isDelegatedInput, isDelegatedResult } from './brief';
import { INPUTS_ROOT, RESULT_ROOT, joinPath, keyForPath } from './paths';

/**
 * The deterministic floor: the descriptor transcribed into the catalog's font.
 *
 * `Projected` exists so the comparison at the checkpoint has its lower bound -
 * what a page looks like when nothing was CHOSEN. One control per input, one
 * row per result member, in declaration order, with the catalog's inputs where
 * they fit and the escape hatch where they do not. Pure and React-free: a spec
 * is data, and this is the one source of it that needs no model and no author.
 */

export interface PageMeta {
  title: string;
  description?: string;
}

type Elements = Record<string, UIElement>;

function labelOf(field: RunField): string {
  return field.title ?? field.name;
}

function add(
  elements: Elements,
  key: string,
  type: string,
  props: Record<string, unknown>,
  children: string[] = [],
  extras: Partial<UIElement> = {},
): string {
  elements[key] = { type, props, children, ...extras };
  return key;
}

// ─── Inputs ──────────────────────────────────────────────────────────────────

function projectInput(elements: Elements, field: RunField, path: string): string {
  const key = keyForPath(path);
  const label = labelOf(field);
  if (isDelegatedInput(field)) {
    return add(elements, key, 'MthdsField', { path });
  }
  switch (field.kind) {
    case 'text':
      return add(elements, key, 'Input', {
        label,
        name: key,
        type: 'text',
        placeholder: field.placeholder ?? field.description ?? null,
        value: { $bindState: path },
      });
    case 'prose':
      return add(elements, key, 'Textarea', {
        label,
        name: key,
        placeholder: field.placeholder ?? field.description ?? null,
        rows: 4,
        value: { $bindState: path },
      });
    case 'number':
      return add(elements, key, 'NumberInput', {
        label,
        name: key,
        placeholder: field.description ?? null,
        value: { $bindState: path },
      });
    case 'boolean':
      return add(elements, key, 'Switch', {
        label,
        name: key,
        checked: { $bindState: path },
      });
    case 'enum':
      return add(elements, key, 'Select', {
        label,
        name: key,
        options: field.options,
        placeholder: 'Choose…',
        value: { $bindState: path },
      });
    case 'object': {
      const children = field.fields.map((child) =>
        projectInput(elements, child, joinPath(path, child.name)),
      );
      return add(
        elements,
        key,
        'Card',
        { title: label, description: field.description ?? null },
        children,
      );
    }
    default:
      // date, document, image, list, unknown are delegated above; nothing
      // reaches here, and the fallback is the escape hatch either way.
      return add(elements, key, 'MthdsField', { path });
  }
}

export function projectInputSpec(fields: readonly RunField[], meta: PageMeta): Spec {
  const elements: Elements = {};
  const head = [add(elements, 'page-title', 'Heading', { text: meta.title, level: 'h2' })];
  if (meta.description) {
    head.push(
      add(elements, 'page-description', 'Text', { text: meta.description, variant: 'muted' }),
    );
  }
  const body = fields.map((field) =>
    projectInput(elements, field, joinPath(INPUTS_ROOT, field.name)),
  );
  const run = add(elements, 'run', 'Button', { label: 'Run', variant: 'primary' }, [], {
    on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
  });
  add(elements, 'page', 'Stack', { direction: 'vertical', gap: 'lg' }, [...head, ...body, run]);
  return { root: 'page', elements };
}

// ─── Results ─────────────────────────────────────────────────────────────────

/** A structure with no nested structure or list among its members. */
function isFlat(item: RunField): boolean {
  return (
    item.kind === 'object' &&
    item.fields.every((child) => child.kind !== 'object' && child.kind !== 'list')
  );
}

function scalarColumns(item: RunField): { path: string; label: string }[] {
  if (item.kind !== 'object') return [];
  return item.fields
    .filter((child) => child.kind !== 'object' && child.kind !== 'list')
    .map((child) => ({ path: child.name, label: labelOf(child) }));
}

/** A member of a structure, as the row that shows it. */
function projectMember(elements: Elements, field: RunField, path: string): string {
  const key = keyForPath(path);
  const label = labelOf(field);
  if (isDelegatedResult(field)) {
    return add(elements, key, 'MthdsResult', { path });
  }
  switch (field.kind) {
    case 'number':
      return add(elements, key, 'Metric', {
        label,
        value: { $state: path },
        format: field.integer ? 'integer' : 'decimal',
      });
    case 'text':
    case 'enum':
    case 'boolean': {
      const value =
        field.kind === 'enum'
          ? add(elements, `${key}-value`, 'Badge', {
              text: { $state: path },
              variant: 'secondary',
            })
          : field.kind === 'boolean'
            ? add(elements, `${key}-value`, 'Badge', {
                text: { $cond: { $state: path }, $then: 'yes', $else: 'no' },
                variant: 'outline',
              })
            : add(elements, `${key}-value`, 'Text', { text: { $state: path } });
      const caption = add(elements, `${key}-label`, 'Text', { text: label, variant: 'muted' });
      return add(
        elements,
        key,
        'Stack',
        { direction: 'horizontal', justify: 'between', align: 'center', gap: 'md' },
        [caption, value],
      );
    }
    case 'list': {
      // A table shows scalar columns and nothing else; a list whose items
      // nest further would lose the depth, so the whole subtree goes to the
      // kernel's expandable view instead.
      if (field.item.kind === 'object' && !isDelegatedResult(field.item) && isFlat(field.item)) {
        return add(elements, key, 'DataTable', {
          rows: { $state: path },
          columns: scalarColumns(field.item),
          caption: label,
        });
      }
      return add(elements, key, 'MthdsResult', { path });
    }
    case 'object':
      return projectStructure(elements, field, path);
    default:
      return add(elements, key, 'MthdsResult', { path });
  }
}

function projectStructure(elements: Elements, field: ObjectRunField, path: string): string {
  const key = keyForPath(path);
  const children = field.fields.map((child) =>
    projectMember(elements, child, joinPath(path, child.name)),
  );
  return add(
    elements,
    key,
    'Card',
    { title: labelOf(field), description: field.description ?? null },
    children,
  );
}

export function projectResultSpec(field: RunField, meta: PageMeta): Spec {
  const elements: Elements = {};
  const title = add(elements, 'page-title', 'Heading', { text: meta.title, level: 'h2' });
  const body =
    field.kind === 'object' && !isDelegatedResult(field)
      ? field.fields.map((child) =>
          projectMember(elements, child, joinPath(RESULT_ROOT, child.name)),
        )
      : [projectMember(elements, field, RESULT_ROOT)];
  add(elements, 'page', 'Stack', { direction: 'vertical', gap: 'lg' }, [title, ...body]);
  return { root: 'page', elements };
}
