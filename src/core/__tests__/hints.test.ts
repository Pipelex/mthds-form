import { describe, expect, expectTypeOf, it } from 'vitest';
import type { IntentWord, OptionTone, PartWord, RoleWord } from 'mthds/protocol';
import type { EnumRunField, NumberRunField, ObjectRunField, RunField } from '..';
import {
  INTENT_WORDS,
  OPTION_TONES,
  PART_WORDS,
  ROLE_WORDS,
  hasOptionDescriptions,
  hasTones,
  intentOf,
  memberWithPart,
  optionTone,
  partOf,
  roleOf,
} from '..';

describe('the vocabularies are the standard’s', () => {
  // `satisfies` in the module holds every word here to the standard's union;
  // these hold the union to the words here, so a word the standard adds fails
  // the build until it is read.
  it('names every intent word', () => {
    expectTypeOf<IntentWord>().toEqualTypeOf<(typeof INTENT_WORDS)[number]>();
    expect(new Set(INTENT_WORDS).size).toBe(INTENT_WORDS.length);
  });
  it('names every role word', () => {
    expectTypeOf<RoleWord>().toEqualTypeOf<(typeof ROLE_WORDS)[number]>();
  });
  it('names every part word', () => {
    expectTypeOf<PartWord>().toEqualTypeOf<(typeof PART_WORDS)[number]>();
  });
  it('names every tone', () => {
    expectTypeOf<OptionTone>().toEqualTypeOf<(typeof OPTION_TONES)[number]>();
  });
});

const text = (name: string, hints?: Record<string, string>): RunField => ({
  kind: 'text',
  name,
  required: true,
  ...(hints ? { hints } : {}),
});
const number = (name: string, hints?: Record<string, string>): NumberRunField => ({
  kind: 'number',
  name,
  required: true,
  integer: false,
  ...(hints ? { hints } : {}),
});
const status: EnumRunField = {
  kind: 'enum',
  name: 'status',
  required: true,
  options: ['up', 'redirect', 'down'],
  hints: { part: 'verdict' },
  optionDetails: [
    { value: 'up', tone: 'positive', description: 'Answers.' },
    { value: 'redirect' },
    { value: 'down', tone: 'negative' },
  ],
};

describe('reading a hint', () => {
  it('reads a known word and ignores an unknown one', () => {
    expect(intentOf(text('a', { intent: 'identifier' }))).toBe('identifier');
    expect(intentOf(text('a', { intent: 'hologram' }))).toBeUndefined();
    expect(roleOf(text('a', { role: 'subject' }))).toBe('subject');
    expect(roleOf(text('a'))).toBeUndefined();
  });

  it('reads no inherited key', () => {
    const hints = Object.create({ intent: 'code' }) as Record<string, string>;
    expect(intentOf(text('a', hints))).toBeUndefined();
  });

  it('applies a part only where the standard says it applies', () => {
    expect(partOf(text('a', { part: 'title' }))).toBe('title');
    expect(partOf(number('n', { part: 'title' }))).toBeUndefined();
    expect(partOf(number('n', { part: 'metric' }))).toBe('metric');
    expect(partOf(text('a', { part: 'metric' }))).toBeUndefined();
    expect(partOf(status)).toBe('verdict');
    const list: RunField = {
      kind: 'list',
      name: 'l',
      required: true,
      item: text('x'),
      hints: { part: 'summary' },
    } as RunField;
    expect(partOf(list)).toBeUndefined();
  });

  it('gives a part to the first field that claims it', () => {
    const record: ObjectRunField = {
      kind: 'object',
      name: 'r',
      required: true,
      fields: [text('a', { part: 'title' }), text('b', { part: 'title' })],
    };
    expect(memberWithPart(record.fields, 'title')?.name).toBe('a');
  });
});

describe('an option’s tone and description', () => {
  it('reads an option’s tone, and an option with none as neutral', () => {
    expect(optionTone(status, 'up')).toBe('positive');
    expect(optionTone(status, 'redirect')).toBe('neutral');
    expect(optionTone(status, 'unknown')).toBe('neutral');
  });

  it('says whether any option carries a tone or a description', () => {
    expect(hasTones(status)).toBe(true);
    expect(hasOptionDescriptions(status)).toBe(true);
    const plain: EnumRunField = { ...status, optionDetails: undefined };
    expect(hasTones(plain)).toBe(false);
    expect(hasOptionDescriptions(plain)).toBe(false);
  });
});

describe('a tone this build does not know', () => {
  // The wire types the slot, but a later producer or a hand-built descriptor
  // can send another word; a renderer keys its icons by the tone, and an
  // unknown word made the icon undefined and the result page throw.
  const choice = {
    kind: 'enum',
    name: 'risk',
    required: true,
    options: ['LOW', 'HIGH'],
    optionDetails: [
      { value: 'LOW', tone: 'glowing' },
      { value: 'HIGH', tone: 'negative' },
    ],
  } as unknown as EnumRunField;

  it('reads as neutral', () => {
    expect(optionTone(choice, 'LOW')).toBe('neutral');
    expect(optionTone(choice, 'HIGH')).toBe('negative');
  });

  it('does not count as a tone', () => {
    const unknownOnly = {
      ...choice,
      optionDetails: [{ value: 'LOW', tone: 'glowing' }, { value: 'HIGH' }],
    } as unknown as EnumRunField;
    expect(hasTones(unknownOnly)).toBe(false);
  });
});
