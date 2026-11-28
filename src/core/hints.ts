/**
 * Reading a field's intent hints, and the words of its choice options, by
 * name.
 *
 * A field's `hints` is the flat `string → string` map the standard defines,
 * carried verbatim by `buildRunFields`; unknown keys and words ride through it
 * untouched. These readers answer the three keys MTHDS `9.2.0` defines -
 * `intent`, `role` and `part` - with a word this build knows or `undefined`,
 * so a word from a later version, or an author's own, is ignored rather than
 * misread: a renderer that ignores a hint stays correct, which is the
 * standard's own rule.
 *
 * The vocabularies are restated here as values because `mthds` is a
 * types-only dependency (docs/dependency-budget.md); each tuple is checked
 * against the standard's union in both directions by
 * `src/core/__tests__/hints.test.ts`, so a word the standard adds fails the
 * build until it is read here.
 *
 * Pure module: no React.
 */

import type { ChoiceOption, IntentWord, OptionTone, PartWord, RoleWord } from 'mthds/protocol';

import type { EnumRunField, RunField } from './descriptor';
import { ownProp } from './own-property';

/** The `intent` words of MTHDS `9.2.0`, in the standard's order. */
export const INTENT_WORDS = [
  'prose',
  'label',
  'rating',
  'quantity',
  'code',
  'identifier',
  'question',
  'photo',
  'screenshot',
  'scan',
] as const satisfies readonly IntentWord[];

/** The `role` words of MTHDS `9.2.0`: what part an input plays in the job. */
export const ROLE_WORDS = [
  'subject',
  'context',
  'guidance',
  'reference',
  'setting',
] as const satisfies readonly RoleWord[];

/** The `part` words of MTHDS `9.2.0`: what part of its record a structure field is. */
export const PART_WORDS = [
  'title',
  'summary',
  'verdict',
  'metric',
  'body',
  'evidence',
  'detail',
] as const satisfies readonly PartWord[];

/** The four tones of a choice option, a group of their own in the theme (docs/theming.md). */
export const OPTION_TONES = [
  'positive',
  'caution',
  'negative',
  'neutral',
] as const satisfies readonly OptionTone[];

function wordOf<T extends string>(
  vocabulary: readonly T[],
  field: Pick<RunField, 'hints'>,
  key: string,
): T | undefined {
  const word = field.hints ? ownProp(field.hints, key) : undefined;
  return typeof word === 'string' && (vocabulary as readonly string[]).includes(word)
    ? (word as T)
    : undefined;
}

/** The field's `intent`, when it is a word this build knows. */
export function intentOf(field: Pick<RunField, 'hints'>): IntentWord | undefined {
  return wordOf(INTENT_WORDS, field, 'intent');
}

/**
 * The input's `role`, when it states one this build knows. Meaningful on a
 * top-level field only: a `role` on a nested field applies to nothing, and a
 * caller reading a structure's member does not ask.
 */
export function roleOf(field: Pick<RunField, 'hints'>): RoleWord | undefined {
  return wordOf(ROLE_WORDS, field, 'role');
}

/**
 * The structure field's `part`, when it states one this build knows and it
 * applies to the field: `title` and `summary` to a text-valued field,
 * `verdict` to a choice, a yes or no or a number, `metric` to a number, and
 * none of those four to a list, as the standard rules. A word attached where
 * it does not apply has no defined meaning, so it reads as absent.
 */
export function partOf(field: RunField): PartWord | undefined {
  const part = wordOf(PART_WORDS, field, 'part');
  switch (part) {
    case 'title':
    case 'summary':
      return field.kind === 'text' || field.kind === 'prose' ? part : undefined;
    case 'verdict':
      return field.kind === 'enum' ||
        field.kind === 'boolean' ||
        field.kind === 'number' ||
        field.kind === 'object'
        ? part
        : undefined;
    case 'metric':
      return field.kind === 'number' ? part : undefined;
    default:
      return part;
  }
}

/**
 * The first member of a structure holding `part`, in declared order: the
 * standard's rule when two fields claim one of the singular parts, so two
 * consumers pick the same field.
 */
export function memberWithPart(fields: readonly RunField[], part: PartWord): RunField | undefined {
  return fields.find((member) => partOf(member) === part);
}

/** The words and tone the method gives one option of a choice, if any. */
export function optionDetail(field: EnumRunField, value: string): ChoiceOption | undefined {
  return field.optionDetails?.find((option) => option.value === value);
}

/**
 * How an option reads: its stated tone, or `neutral`. A tone is never
 * inferred from a value or a label - only the method knows that `HIGH_RISK`
 * is bad.
 */
export function optionTone(field: EnumRunField, value: string): OptionTone {
  return optionDetail(field, value)?.tone ?? 'neutral';
}

/** Whether any option of the choice carries a tone, so a renderer draws badges at all. */
export function hasTones(field: EnumRunField): boolean {
  return field.optionDetails?.some((option) => option.tone !== undefined) ?? false;
}

/** Whether any option of the choice carries a description, so a picker draws described cards. */
export function hasOptionDescriptions(field: EnumRunField): boolean {
  return field.optionDetails?.some((option) => option.description !== undefined) ?? false;
}
