'use client';

import { createContext, use, type ReactNode } from 'react';

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
 *   follows the label and reads as words (`enumLabeler`).
 *
 * An enum value is the only value the two presentations show differently. A
 * number, a text, a date and every other value render the same in both.
 *
 * Deliberately a context rather than a prop or a `FieldEnv` flag: only the
 * components that own label chrome or an enum value's wording read it -
 * `FieldShell`, `ObjectField`, `BooleanField`, `ListField`, `EnumField` and the
 * result view - and threading a prop would have meant editing every field
 * control and both recursive containers.
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
 * It is `humanizeFieldName`, applied after an all-caps code of several words is
 * lowercased. The capitals of `HIGH_RISK` are a convention of the code, not an
 * emphasis its author meant, and "HIGH RISK" on a sentence-case page reads as
 * an alarm.
 *
 * A single all-caps token is left exactly as written: `USD`, `EUR`, `OK` and
 * `HIGH` hold no separator, and a lone capitalised word is far more often an
 * acronym, a unit or a currency than a shouted word, so lowercasing it would
 * misspell it ("Usd"). Only a code that is several words joined by `_` or `-`
 * is taken to be capitalised by convention.
 *
 * Acronyms inside a longer code are not guessed: `po` stays `po` where a reader
 * expects `PO`, just as a field name does. The cure for both is a label the
 * method's author writes, and that is a question for the standard rather than
 * for the kernel.
 *
 * Only a code is humanised. A value that is not an identifier is authored
 * words already, and its separators are spelling rather than structure, so it
 * is shown verbatim: `18-24`, `N/A` and `Very satisfied` do not start with a
 * letter or hold something other than letters, digits, `_` and `-`. That is
 * the line `humanizeFieldName` draws between an identifier and an authored
 * title.
 *
 * This words ONE code, with no knowledge of the enum it belongs to. The form's
 * options and the result view go one step further: when two options of one
 * enum would read the same, they show that enum's codes instead (see
 * `enumLabeler`).
 *
 * Only what a person READS changes. The value a form stores, the JSON view,
 * the copy control and the download all keep the code.
 */
export function humanizeEnumValue(code: string): string {
  if (!ENUM_CODE.test(code)) return code;
  const allCaps = code === code.toUpperCase() && code !== code.toLowerCase();
  if (!allCaps) return humanizeFieldName(code);
  return CODE_SEPARATOR.test(code) ? humanizeFieldName(code.toLowerCase()) : code;
}

/** An identifier: a letter, then letters, digits and `_` or `-` separators. */
const ENUM_CODE = /^\p{L}[\p{L}\p{N}_-]*$/u;

/** What joins the words of a code. A space never reaches it: no code holds one. */
const CODE_SEPARATOR = /[_-]/;

/**
 * How ONE enum's values are shown: the rule the form's options and the result
 * view's value both go through, so a result and the form that produced it read
 * the same way. Built from the enum's options, it maps a value to what a person
 * reads.
 *
 * In `studio` every value is its code, because it has to match the bundle. In
 * `app` a declared option reads as words (`humanizeEnumValue`), except in two
 * cases, where the code is shown as written:
 *
 * - **Every option, when two of them would read the same.** `high_risk` and
 *   `HIGH_RISK`, or `foo-bar` and `foo_bar`, are distinct codes that humanise
 *   to one label, and a person offered two identical choices is choosing
 *   blind. Wording the others while showing those two as codes would make one
 *   enum read in two registers, so the whole enum falls back.
 * - **A value the enum does not declare.** It is the payload disagreeing with
 *   its descriptor, and worded it could pass for an option it is not.
 */
export function enumLabeler(
  options: readonly string[],
  presentation: FieldPresentation,
): (value: string) => string {
  if (presentation !== 'app') return asWritten;
  let labeler = APP_LABELERS.get(options);
  if (labeler === undefined) {
    labeler = wordsOrCodes(options);
    APP_LABELERS.set(options, labeler);
  }
  return labeler;
}

function asWritten(value: string): string {
  return value;
}

/**
 * The `app` labeler for one enum: its options in words, or its codes as
 * written when two DISTINCT options humanise to the same label. A repeated
 * option is not a collision: it is one code, and reads as one.
 */
function wordsOrCodes(options: readonly string[]): (value: string) => string {
  const labels = new Map<string, string>();
  const owners = new Map<string, string>();
  for (const option of options) {
    const label = humanizeEnumValue(option);
    const owner = owners.get(label);
    if (owner !== undefined && owner !== option) return asWritten;
    owners.set(label, option);
    labels.set(option, label);
  }
  return (value) => labels.get(value) ?? value;
}

/**
 * One `app` labeler per options array, built on first use and kept: the result
 * view asks once for every cell of an enum column, and the answer depends on
 * the options alone.
 */
const APP_LABELERS = new WeakMap<readonly string[], (value: string) => string>();

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
