/**
 * A host's own words on a form: the label, the helper line, the placeholder and
 * an enum's option labels, set per field over what the descriptor states.
 *
 * The descriptor names a field by its identifier and describes it in its
 * method's language, which is not always the page's. A French app over a method
 * written in English, or one whose enum codes are `LILLE` and `PARIS_15`, needs
 * to say something else to the person filling the form, and that is a fact about
 * the app rather than about the method - so the host states it here, once, and
 * every control reads the result through the fields it already reads (`title`,
 * `description`, `placeholder`, `optionLabels`).
 *
 * Like `narrowFileFormats`, it reads `RunField`, the kernel's own output, and
 * never a JSON Schema. Pure: the input tree is never mutated.
 */

import type { RunField } from './descriptor';
import { ownProp } from './own-property';

/**
 * What a host may say about one field. Each key replaces the descriptor's own
 * value when present, an empty `title` included (it hides the label, as it does
 * for a list row). `placeholder` is read by the `text` and `prose` controls and
 * ignored on any other kind; `optionLabels` is read on an `enum` field only,
 * merged over any labels the field already has.
 */
export interface FieldOverride {
  title?: string;
  description?: string;
  placeholder?: string;
  optionLabels?: Record<string, string>;
}

/**
 * The field tree with each override applied to the field its path names.
 *
 * A path is the field names from the top, joined by dots: `customer` for a
 * top-level input, `customer.display_name` for a field of its structure. A list
 * is stepped into with `[]`, the convention `narrowFileFormats` names its paths
 * by: `illustrations` is the list itself, `illustrations[]` its item (a
 * `title: ''` there drops each row's label, as the list already does), and
 * `lines[].unit_price` a field of each row's record. One override therefore
 * applies to every row of a list alike, never to one row.
 *
 * A path that names no field is ignored, so a host's table can outlive a field
 * its method dropped without breaking the form. Pass `onUnmatched` to hear
 * about each such path - to warn in development, or to fail a test.
 *
 * The input tree is never mutated: a field an override reaches, and every
 * structure or list above it, comes back as a copy; every other field as the
 * same object it was.
 */
export function applyFieldOverrides(
  fields: readonly RunField[],
  overrides: Readonly<Record<string, FieldOverride>>,
  onUnmatched?: (path: string) => void,
): RunField[] {
  const matched = new Set<string>();

  const apply = (field: RunField, path: string): RunField => {
    let next = field;
    switch (field.kind) {
      case 'object': {
        const children = field.fields.map((child) => apply(child, `${path}.${child.name}`));
        if (children.some((child, index) => child !== field.fields[index])) {
          next = { ...field, fields: children };
        }
        break;
      }
      case 'list': {
        // The item carries the list's own name, so its path marks the step into
        // an item rather than repeating the name: `gallery[]`, `lines[].price`.
        const item = apply(field.item, `${path}[]`);
        if (item !== field.item) next = { ...field, item };
        break;
      }
      default:
        break;
    }
    const override = ownProp(overrides, path);
    if (override === undefined) return next;
    matched.add(path);
    return overridden(next, override);
  };

  const result = fields.map((field) => apply(field, field.name));
  if (onUnmatched) {
    for (const path of Object.keys(overrides)) {
      if (!matched.has(path)) onUnmatched(path);
    }
  }
  return result;
}

/** One field with one override applied: only the keys the override states. */
function overridden(field: RunField, override: FieldOverride): RunField {
  const next: RunField = { ...field };
  if (override.title !== undefined) next.title = override.title;
  if (override.description !== undefined) next.description = override.description;
  if (override.placeholder !== undefined && (next.kind === 'text' || next.kind === 'prose')) {
    next.placeholder = override.placeholder;
  }
  if (override.optionLabels !== undefined && next.kind === 'enum') {
    next.optionLabels = { ...next.optionLabels, ...override.optionLabels };
  }
  return next;
}
