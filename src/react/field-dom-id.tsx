'use client';

import { createContext, use, useId, type ReactNode } from 'react';

/**
 * The DOM id a control writes, derived from the field id rather than equal to it.
 *
 * `FieldRenderer`'s `id` is a value PATH - `ObjectField` composes children as
 * `parent.child`, `ListField` rows as `list.0`, and a host writes an upload back
 * with `setValueAtPath(values, id.split('.'), uploaded)`. See `upload-seam.md`;
 * that contract is unchanged and this module does not touch it.
 *
 * The same string used to be written verbatim as the control's `id` and its
 * `<label for>` target, where it must instead be document-UNIQUE, and nothing
 * made it so. Two forms mounted at once whose methods each declare an input
 * named `text` emitted two `<textarea id="text">`; per HTML a `<label for>` binds
 * the first element in tree order, so the second form's label went dead and its
 * control fell down the accessible-name chain to its placeholder - a screen
 * reader announcing "Write here…" instead of the field's name.
 *
 * A path is not unique across forms and cannot be made so without breaking the
 * write-back, so the two roles are separated instead: the path stays the path,
 * and only the DOM write is namespaced.
 *
 * **No host change is required.** With no provider above it, each control mints
 * its own prefix from `useId`, which is already unique per instance and
 * hydration-stable - so mounting the same method twice is correct by default.
 * `FieldDomIdProvider` is for hosts that want the ids to be PREDICTABLE rather
 * than merely unique: a deterministic prefix makes `getElementById` and
 * deep-link focus work. Passing `prefix=""` restores path-as-id exactly, which
 * is the escape hatch for a host that addressed the old ids and has not moved
 * yet - and it reintroduces the collision, so it is only safe for one form.
 */
const FieldDomIdContext = createContext<string | null>(null);

export function FieldDomIdProvider({
  prefix,
  children,
}: {
  /** Omit to mint one from `useId`; `''` writes the path unprefixed. */
  prefix?: string;
  children: ReactNode;
}) {
  const generated = useId();
  return <FieldDomIdContext value={prefix ?? generated}>{children}</FieldDomIdContext>;
}

/**
 * The DOM id for a field path - the ONE place a path becomes an attribute.
 *
 * Called once per control so the `<label for>` and the control's `id` are the
 * same string by construction: the pairing cannot drift, because there is only
 * one call. `useId` runs unconditionally (hooks must) and is simply unused when
 * a provider supplies the prefix.
 */
export function useFieldDomId(path: string): string {
  const scoped = use(FieldDomIdContext);
  const local = useId();
  const prefix = scoped ?? local;
  return prefix === '' ? path : `${prefix}-${path}`;
}
