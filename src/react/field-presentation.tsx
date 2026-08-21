'use client';

import { createContext, use, type ReactNode } from 'react';

/**
 * How a field's LABEL chrome should read. The control itself never changes.
 *
 * - `studio` (default): the field's name verbatim in mono, with its concept
 *   pill. The name IS the identifier a builder writes in the `.mthds` file, so
 *   showing it exactly - and typed - is the point.
 * - `app`: the field's name as a human question in sans, no concept pill. Inside
 *   a method app, `full_name` and `native.Text` are implementation detail; the
 *   person filling the form has never seen the method's source.
 *
 * Deliberately a context rather than a prop or a `FieldEnv` flag: `FieldShell`
 * and `ObjectField` are the ONLY components that need it, and threading a prop
 * would have meant editing every field control and both recursive containers.
 */
export type FieldPresentation = 'studio' | 'app';

const FieldPresentationContext = createContext<FieldPresentation>('studio');

export function FieldPresentationProvider({
  presentation,
  children,
}: {
  presentation: FieldPresentation;
  children: ReactNode;
}) {
  return <FieldPresentationContext value={presentation}>{children}</FieldPresentationContext>;
}

export function useFieldPresentation(): FieldPresentation {
  return use(FieldPresentationContext);
}

/**
 * `full_name` → `Full name`. Only the first word is capitalised: these are
 * labels, not titles, and Title Case on every word reads as a form from 2009.
 * An already-humanised name (a `title` from the schema) passes through
 * unchanged because it contains no underscores.
 */
export function humanizeFieldName(name: string): string {
  const words = name.replace(/[_-]+/g, ' ').trim();
  if (words === '') return name;
  return words.charAt(0).toUpperCase() + words.slice(1);
}
