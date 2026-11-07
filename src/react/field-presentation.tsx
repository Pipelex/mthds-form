'use client';

import { createContext, use, type ReactNode } from 'react';
import type { ConceptCategory } from '../core';
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
 * The chrome around a value follows it too: in `app` the optional mark, a
 * list's count and a file's formats are set in the page's face rather than in
 * mono, an empty list is its Add button, and a description that restates its
 * label is left out (`shownDescription`). See docs/architecture.md, "The
 * chrome in `app`".
 *
 * Deliberately a context rather than a prop or a `FieldEnv` flag: only the
 * components that own label chrome or an enum value's wording read it -
 * `FieldShell`, `ObjectField`, `BooleanField`, `ListField`, `EnumField`, the
 * result view and the generative layer's choice controls (`Select`, `Radio`,
 * `Segmented`) - plus the controls whose own chrome follows it: the file
 * control, whose card hides a storage reference in `app`, the date and number
 * inputs, and a list's drop area. Threading a prop would have meant editing
 * every field control and both recursive containers.
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

/**
 * The description a field shows under its label, or `undefined` for none.
 *
 * In `studio` it is the description as stated, always: under an identifier
 * such as `arriving_on`, it is the documentation a builder reads. In `app` it
 * is shown only when it says something that the label and the control do not
 * already say ({@link descriptionAddsToLabel}), because a page that reads
 * "Arriving on" over "The day they arrive" over a date picker says one thing
 * three times. The descriptor carries a concept's own definition as the
 * description of an input that states none, so "An image" under an image
 * field is the common case rather than an authoring slip.
 *
 * `kinds` are what the control itself says: a date picker already says "date",
 * a dropzone already says "image". A list passes its own kind and its item's.
 *
 * A list ROW has no label (`fieldLabel` gives it the empty one), and in `app`
 * it shows no description either: what a row holds is its item concept's
 * definition, the same on every row, so the list says it once, above its
 * rows, instead ({@link shownItemDescription}). "One person on the trip"
 * under every traveller is one sentence said once per traveller.
 */
export function shownDescription(
  description: string | undefined,
  label: string,
  kinds: readonly ConceptCategory[],
  presentation: FieldPresentation,
): string | undefined {
  if (!description || presentation !== 'app') return description || undefined;
  if (label.trim() === '') return undefined;
  return descriptionAddsToLabel(description, label, kinds) ? description : undefined;
}

/**
 * What a list says once about its rows, under its own description, or
 * `undefined` for nothing.
 *
 * In `app` a row shows no description ({@link shownDescription}), so the item's
 * description is said here when it says something the list's label and the
 * list's own description do not: "Email address the invoice is sent to" under
 * "Contacts" and "Who receives the invoice". A top-level plural slot carries
 * one string as both its description and its item's, and says it once.
 * `studio` shows it on every row, and says nothing here. A list that is
 * itself a row has no label, and says its item's description once in that
 * row, since the list above it says only what the row is; the wire states
 * no list of lists, but a host may hand one to the controls.
 */
export function shownItemDescription(
  itemDescription: string | undefined,
  listLabel: string,
  listDescription: string | undefined,
  kinds: readonly ConceptCategory[],
  presentation: FieldPresentation,
): string | undefined {
  if (!itemDescription || presentation !== 'app') return undefined;
  if (itemDescription === listDescription) return undefined;
  const said = listDescription ? `${listLabel} ${listDescription}` : listLabel;
  return descriptionAddsToLabel(itemDescription, said, kinds) ? itemDescription : undefined;
}

/**
 * Whether a description says anything beyond its label and its control's kind.
 *
 * It does when it holds a word, other than a filler word, that neither the
 * label nor the kind's own words hold, compared after a light stemming that
 * makes "arrive" and "arriving" one word. The rule only ever HIDES a sentence
 * whose every content word is already on the page, and it shows the
 * description whenever it is unsure, so its failure is a restatement left in
 * place, never a fact taken away: "Who is going" under "Travellers" stays,
 * because no word of the one is a word of the other, while "Not before noon"
 * under "Arrival" stays because `not` and `noon` are content words.
 *
 * A symbol is a word here: `%` and `€` say a unit the control does not, so
 * "Rate in %" under "Rate" stays. A description left with no content word at
 * all is one the rule cannot judge, and it is shown: "In %" under "Discount",
 * or "Or" (gold) under the French "Matière", whose only word reads as English
 * filler.
 *
 * The filler and kind words are English, as the descriptions it meets mostly
 * are; in another language few words match, and the description is shown, as
 * it was before the rule. An empty label says nothing, so any description
 * adds to it; `shownDescription` decides a list row's case on its own.
 */
export function descriptionAddsToLabel(
  description: string,
  label: string,
  kinds: readonly ConceptCategory[],
): boolean {
  if (label.trim() === '') return true;
  const words = contentStems(description);
  if (words.length === 0) return true;
  const said = new Set(contentStems(label));
  for (const kind of kinds) for (const word of KIND_WORDS[kind]) said.add(stem(word));
  return words.some((word) => !said.has(word));
}

/** The words a control of each kind says by being that control. */
const KIND_WORDS: Record<ConceptCategory, readonly string[]> = {
  text: ['text'],
  date: ['date', 'day'],
  document: ['document', 'file'],
  image: ['image', 'picture', 'photo'],
  number: ['number'],
  boolean: [],
  choice: [],
  structured: [],
  list: ['list'],
};

/**
 * Words that carry no content of their own. Deliberately short, and without
 * `not`, `no` or any question word: a word left out of it only keeps a
 * description on the page.
 */
const FILLER = new Set([
  'a',
  'an',
  'the',
  'of',
  'for',
  'to',
  'in',
  'on',
  'at',
  'by',
  'with',
  'and',
  'or',
  'is',
  'are',
  'be',
  'it',
  'its',
  'this',
  'that',
  'these',
  'those',
  'their',
  'they',
  'them',
  'his',
  'her',
  'your',
  'you',
  'our',
  'we',
  'if',
  'any',
  'as',
  'from',
  'some',
  'one',
]);

/**
 * A text's content words, stemmed: lower-cased, possessives and filler words
 * dropped. A word is a run of letters, combining marks and digits, or one
 * symbol (`€`, `%`, `+`, an emoji); sentence punctuation is not a word. The
 * marks keep a word whole where a vowel sign or an accent is a mark of its
 * own (Devanagari's "नाम" and "नीम" are two words, not one shared pair of
 * letters), and the text is composed first, so an accent typed as a mark
 * reads as the letter it decorates.
 */
function contentStems(text: string): string[] {
  return (
    text
      .normalize('NFC')
      .toLowerCase()
      .replace(/['’]s\b/gu, '')
      .match(WORD) ?? []
  )
    .filter((word) => !FILLER.has(word))
    .map(stem);
}

const WORD = /[\p{L}\p{M}\p{N}]+|[\p{S}%‰#@]/gu;

/** One suffix off, never below three letters: `arriving` and `arrive` both give `arriv`. */
function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

const SUFFIXES = ['ing', 'ed', 'es', 's', 'e'] as const;
