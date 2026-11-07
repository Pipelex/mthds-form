'use client';

import { createContext, use, type ReactNode } from 'react';
import { enumValueLabeler, humanizeFieldName } from '../core/humanize';

/**
 * How a field's LABEL chrome, and the enum values a person reads, should read.
 * What a control stores never changes.
 *
 * - `studio` (default): the field's name verbatim in mono, with its concept
 *   pill. The name IS the identifier a builder writes in the `.mthds` file, so
 *   showing it exactly - and typed - is the point. An enum value is shown as its
 *   code for the same reason: it has to match the bundle and the JSON the
 *   builder reads next.
 * - `app`: the field's name as a human question in sans, no concept pill. Inside
 *   a method app, `full_name` and `native.Text` are implementation detail; the
 *   person filling the form has never seen the method's source. An enum value
 *   follows the label and reads as words, worded by the kernel's rule
 *   (`enumValueLabeler` in the core entry).
 *
 * An enum value is the only value the two presentations show differently. A
 * number, a text, a date and every other value render the same in both.
 *
 * Deliberately a context rather than a prop or a `FieldEnv` flag: only the
 * components that own label chrome or an enum value's wording read it -
 * `FieldShell`, `ObjectField`, `BooleanField`, `ListField`, `EnumField`, the
 * result view and the generative layer's choice controls (`Select`, `Radio`,
 * `Segmented`) - plus the file control, whose card hides a storage reference
 * in `app`, and threading a prop would have meant editing every field control
 * and both recursive containers.
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
 * How ONE enum's values are shown under a presentation: the switch the form's
 * options, the result view's value and the generative layer's choice controls
 * all go through, so a result and the form that produced it read the same way.
 *
 * In `studio` every value is its code, because it has to match the bundle. In
 * `app` it is the kernel's wording, `enumValueLabeler`: a declared option reads
 * as words, unless two options of the enum would read the same or the value is
 * one the enum does not declare.
 */
export function enumLabeler(
  options: readonly string[],
  presentation: FieldPresentation,
): (value: string) => string {
  return presentation === 'app' ? enumValueLabeler(options) : asWritten;
}

function asWritten(value: string): string {
  return value;
}

/**
 * The one label expression every chrome-owning component uses: an authored
 * `title` is authoritative and shown verbatim in both presentations; only the
 * identifier fallback is humanised in app mode. An empty title stays empty -
 * that is how a list row suppresses its per-row label.
 */
export function fieldLabel(
  title: string | undefined,
  name: string,
  presentation: FieldPresentation,
): string {
  if (title !== undefined) return title;
  return presentation === 'app' ? humanizeFieldName(name) : name;
}
