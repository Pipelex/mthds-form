'use client';

import { createContext, use, type ReactNode } from 'react';

/**
 * How a field's LABEL chrome, and the values a person reads, should read. What
 * a control stores never changes.
 *
 * - `studio` (default): the field's name verbatim in mono, with its concept
 *   pill. The name IS the identifier a builder writes in the `.mthds` file, so
 *   showing it exactly - and typed - is the point. Values are shown exactly as
 *   the payload holds them, for the same reason: an enum code and a number have
 *   to match the bundle and the JSON the builder reads next.
 * - `app`: the field's name as a human question in sans, no concept pill. Inside
 *   a method app, `full_name` and `native.Text` are implementation detail; the
 *   person filling the form has never seen the method's source. Values follow
 *   the label: an enum value reads as words (`humanizeEnumValue`), and a
 *   result's number is grouped with bounded decimals.
 *
 * Deliberately a context rather than a prop or a `FieldEnv` flag: only the
 * components that own label chrome or a value's wording read it - `FieldShell`,
 * `ObjectField`, `BooleanField`, `ListField`, `EnumField` and the result view -
 * and threading a prop would have meant editing every field control and both
 * recursive containers.
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
 * Takes IDENTIFIERS only - snake_case or kebab-case names, where a separator
 * is structure. An authored `title` never goes through here: it is already
 * human-facing, and its hyphens are spelling (`E-mail address`), not structure.
 */
export function humanizeFieldName(name: string): string {
  const words = name.replace(/[_-]+/g, ' ').trim();
  if (words === '') return name;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * An enum CODE as words: `unit_price_differs_from_po` → `Unit price differs
 * from po`, `HIGH_RISK` → `High risk`.
 *
 * It is `humanizeFieldName`, applied after an all-caps code is lowercased. An
 * all-caps code is a convention of the code, not an emphasis its author meant,
 * and "HIGH RISK" on a sentence-case page reads as an alarm.
 *
 * Acronyms are not guessed: `po` stays `po` where a reader expects `PO`, just
 * as a field name does. The cure for both is a label the method's author
 * writes, and that is a question for the standard rather than for the kernel.
 *
 * Only a code is humanised. A value that is not an identifier is authored
 * words already, and its separators are spelling rather than structure, so it
 * is shown verbatim: `18-24`, `N/A` and `Very satisfied` do not start with a
 * letter or hold something other than letters, digits, `_` and `-`. That is
 * the line `humanizeFieldName` draws between an identifier and an authored
 * title.
 *
 * Only what a person READS changes. The value a form stores, the JSON view,
 * the copy control and the download all keep the code.
 */
export function humanizeEnumValue(code: string): string {
  if (!ENUM_CODE.test(code)) return code;
  const allCaps = code === code.toUpperCase() && code !== code.toLowerCase();
  return humanizeFieldName(allCaps ? code.toLowerCase() : code);
}

/** An identifier: a letter, then letters, digits and `_` or `-` separators. */
const ENUM_CODE = /^\p{L}[\p{L}\p{N}_-]*$/u;

/**
 * The one expression every place that SHOWS an enum value uses: the code
 * verbatim in `studio`, where it has to match the bundle, and in words in
 * `app`, where the reader has never seen the bundle.
 */
export function enumValueLabel(code: string, presentation: FieldPresentation): string {
  return presentation === 'app' ? humanizeEnumValue(code) : code;
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
