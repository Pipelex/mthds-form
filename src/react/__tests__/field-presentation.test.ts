import { describe, expect, it } from 'vitest';
import {
  descriptionAddsToLabel,
  enumLabeler,
  fieldLabel,
  humanizeEnumValue,
  humanizeFieldName,
  shownDescription,
  shownItemDescription,
} from '../field-presentation';

describe('humanizeFieldName', () => {
  it('turns a snake_case identifier into a sentence-case label', () => {
    expect(humanizeFieldName('full_name')).toBe('Full name');
  });

  it('handles kebab-case and runs of separators', () => {
    expect(humanizeFieldName('invoice-number')).toBe('Invoice number');
    expect(humanizeFieldName('a__b--c')).toBe('A b c');
  });

  it('capitalises only the first word - these are labels, not titles', () => {
    expect(humanizeFieldName('date_of_birth')).toBe('Date of birth');
  });

  it('passes an already-humanised name through unchanged', () => {
    expect(humanizeFieldName('Your full name')).toBe('Your full name');
  });

  it('leaves a name that is only separators or blank alone', () => {
    expect(humanizeFieldName('___')).toBe('___');
    expect(humanizeFieldName('')).toBe('');
  });
});

describe('fieldLabel', () => {
  it('preserves an authored title verbatim in app mode - hyphens included', () => {
    expect(fieldLabel('E-mail address', 'email', 'app')).toBe('E-mail address');
    expect(fieldLabel('Pre-Tax Deduction', 'deduction', 'app')).toBe('Pre-Tax Deduction');
  });

  it('humanises the identifier fallback only in app mode', () => {
    expect(fieldLabel(undefined, 'full_name', 'app')).toBe('Full name');
    expect(fieldLabel(undefined, 'full_name', 'studio')).toBe('full_name');
  });

  it('shows the title verbatim in studio mode too', () => {
    expect(fieldLabel('E-mail address', 'email', 'studio')).toBe('E-mail address');
  });

  it('keeps an empty title empty - a list row suppresses its label that way', () => {
    expect(fieldLabel('', 'items[0]', 'app')).toBe('');
    expect(fieldLabel('', 'items[0]', 'studio')).toBe('');
  });
});

describe('humanizeEnumValue', () => {
  it('words a snake_case code as a field name is worded', () => {
    expect(humanizeEnumValue('unit_price_differs_from_po')).toBe('Unit price differs from po');
    expect(humanizeEnumValue('in_progress')).toBe('In progress');
  });

  it('words a kebab-case code', () => {
    expect(humanizeEnumValue('hold-for-review')).toBe('Hold for review');
  });

  it('lowercases an all-caps code of several words before wording it', () => {
    // "HIGH RISK" in a sentence-case page reads as an alarm; the capitals are a
    // convention of the code, not an emphasis its author meant.
    expect(humanizeEnumValue('HIGH_RISK')).toBe('High risk');
    expect(humanizeEnumValue('Q1_REPORT')).toBe('Q1 report');
    expect(humanizeEnumValue('HOLD-FOR-REVIEW')).toBe('Hold for review');
  });

  it('leaves a single all-caps token exactly as written', () => {
    // No separator: far more often an acronym, a unit or a currency than a
    // shouted word, and lowercasing it would misspell it ("Usd").
    expect(humanizeEnumValue('USD')).toBe('USD');
    expect(humanizeEnumValue('EUR')).toBe('EUR');
    expect(humanizeEnumValue('OK')).toBe('OK');
    expect(humanizeEnumValue('HIGH')).toBe('HIGH');
    expect(humanizeEnumValue('Q1')).toBe('Q1');
    expect(humanizeEnumValue('A')).toBe('A');
  });

  it('does not guess acronyms inside a longer code', () => {
    // Accepted: `po` where a reader expects `PO`, exactly as a field name
    // reads today. The cure is a label the author writes, not a guess here.
    expect(humanizeEnumValue('matches_po')).toBe('Matches po');
    expect(humanizeEnumValue('unit_price_differs_from_po')).toBe('Unit price differs from po');
    expect(humanizeEnumValue('PAID_IN_USD')).toBe('Paid in usd');
  });

  it('capitalises a lowercase single word and leaves a mixed-case one alone', () => {
    expect(humanizeEnumValue('positive')).toBe('Positive');
    expect(humanizeEnumValue('HighRisk')).toBe('HighRisk');
  });

  it('shows a value that is not a code verbatim', () => {
    // Its separators are spelling rather than structure: a range, an
    // abbreviation and authored words.
    expect(humanizeEnumValue('18-24')).toBe('18-24');
    expect(humanizeEnumValue('N/A')).toBe('N/A');
    expect(humanizeEnumValue('Very satisfied')).toBe('Very satisfied');
    expect(humanizeEnumValue('_private')).toBe('_private');
  });

  it('leaves an empty string empty', () => {
    expect(humanizeEnumValue('')).toBe('');
  });
});

describe('enumLabeler', () => {
  const STATUSES = ['matches_po', 'unit_price_differs_from_po', 'HIGH_RISK', 'USD'];

  it('shows every value as its code in studio', () => {
    const label = enumLabeler(STATUSES, 'studio');
    expect(STATUSES.map(label)).toEqual(STATUSES);
  });

  it('words every declared option in app', () => {
    const label = enumLabeler(STATUSES, 'app');
    expect(STATUSES.map(label)).toEqual([
      'Matches po',
      'Unit price differs from po',
      'High risk',
      'USD',
    ]);
  });

  it('shows a value the enum does not declare as it came', () => {
    // The payload disagreeing with its descriptor: worded, `HIGH_RISK` could
    // pass for the declared `high_risk`.
    expect(enumLabeler(['high_risk', 'low_risk'], 'app')('HIGH_RISK')).toBe('HIGH_RISK');
  });

  describe('falls back to the codes, for every option, when two would read the same', () => {
    it.each([
      ['a snake_case code and its all-caps twin', ['high_risk', 'HIGH_RISK', 'low_risk']],
      ['a kebab-case code and its snake_case twin', ['foo-bar', 'foo_bar', 'baz']],
      ['a code and its capitalised twin', ['approve', 'Approve', 'reject']],
      ['a code and the words it would become', ['very_satisfied', 'Very satisfied', 'unhappy']],
    ])('%s', (_, options) => {
      const label = enumLabeler(options, 'app');
      expect(options.map(label)).toEqual(options);
    });
  });

  it('does not count a repeated option as a collision', () => {
    // One code listed twice is still one code, and reads as one.
    const label = enumLabeler(['in_progress', 'in_progress', 'done'], 'app');
    expect(label('in_progress')).toBe('In progress');
    expect(label('done')).toBe('Done');
  });

  it('answers the same for the same options, however often it is asked', () => {
    // The labeler is kept per options array; a second ask must not change the
    // answer.
    const options = ['foo-bar', 'foo_bar'];
    expect(enumLabeler(options, 'app')('foo-bar')).toBe('foo-bar');
    expect(enumLabeler(options, 'app')('foo_bar')).toBe('foo_bar');
    const distinct = ['foo_bar', 'baz'];
    expect(enumLabeler(distinct, 'app')('foo_bar')).toBe('Foo bar');
    expect(enumLabeler(distinct, 'app')('foo_bar')).toBe('Foo bar');
  });
});

/**
 * The description an `app` page shows is one that says something the label
 * and the control do not. The cases are the trip planner's, where the rule
 * was found wanting: three sentences restating "Arriving on" over a date.
 */
describe('descriptionAddsToLabel', () => {
  it('drops a sentence that only restates the label, whatever its inflection', () => {
    expect(descriptionAddsToLabel('The day they arrive', 'Arriving on', ['date'])).toBe(false);
    expect(descriptionAddsToLabel('The day they leave', 'Leaving on', ['date'])).toBe(false);
    expect(descriptionAddsToLabel('A name for the trip', 'Trip name', ['text'])).toBe(false);
    expect(descriptionAddsToLabel('The city', 'City', ['text'])).toBe(false);
    expect(descriptionAddsToLabel("Their team's name", 'Team name', ['text'])).toBe(false);
  });

  it("drops a concept's own definition, which the control already says", () => {
    expect(descriptionAddsToLabel('An image', 'Inspiration', ['image'])).toBe(false);
    expect(descriptionAddsToLabel('A document', 'Contract', ['document'])).toBe(false);
    expect(descriptionAddsToLabel('Some images', 'Moodboard', ['list', 'image'])).toBe(false);
  });

  it('keeps a sentence holding any word the label does not', () => {
    expect(descriptionAddsToLabel('Places they must not miss', 'Must see', ['list'])).toBe(true);
    expect(descriptionAddsToLabel('Who is going', 'Travellers', ['list'])).toBe(true);
    expect(descriptionAddsToLabel('The currency the budget is in', 'Currency', ['choice'])).toBe(
      true,
    );
    expect(descriptionAddsToLabel('A photo of the receipt', 'Photo', ['image'])).toBe(true);
  });

  it('never counts a negation as filler', () => {
    expect(descriptionAddsToLabel('Not the city', 'City', ['text'])).toBe(true);
    expect(descriptionAddsToLabel('No city', 'City', ['text'])).toBe(true);
  });

  it('keeps a description in a language it has no filler words for', () => {
    expect(descriptionAddsToLabel("Le jour de l'arrivée", 'Arrivée', ['date'])).toBe(true);
  });

  it('keeps a description it has no content word to judge by', () => {
    // "Or" is gold in French, and only English filler to the rule.
    expect(descriptionAddsToLabel('Or', 'Matière', ['choice'])).toBe(true);
    expect(descriptionAddsToLabel('If any', 'Allergies', ['text'])).toBe(true);
    expect(descriptionAddsToLabel('In %', 'Discount', ['number'])).toBe(true);
  });

  it('keeps a word whole across its combining marks', () => {
    // Different words over the same base letters: the vowel signs are marks.
    expect(descriptionAddsToLabel('नीम', 'नाम', ['text'])).toBe(true);
    expect(descriptionAddsToLabel('Pâté'.normalize('NFD'), 'Pâte', ['text'])).toBe(true);
    // An accent typed as a mark is the same word as the precomposed letter.
    expect(descriptionAddsToLabel('The pâte'.normalize('NFD'), 'Pâte', ['text'])).toBe(false);
  });

  it('counts a symbol as a word', () => {
    expect(descriptionAddsToLabel('Rate in %', 'Rate', ['number'])).toBe(true);
    expect(descriptionAddsToLabel('In €', 'Budget', ['number'])).toBe(true);
    expect(descriptionAddsToLabel('Budget in €', 'Budget (€)', ['number'])).toBe(false);
  });

  it('counts any description as adding to an empty label', () => {
    expect(descriptionAddsToLabel('One person on the trip', '', ['structured'])).toBe(true);
  });
});

describe('shownDescription', () => {
  it('shows every description in studio, where it documents an identifier', () => {
    expect(shownDescription('The day they arrive', 'arriving_on', ['date'], 'studio')).toBe(
      'The day they arrive',
    );
    expect(shownDescription('One person on the trip', '', ['structured'], 'studio')).toBe(
      'One person on the trip',
    );
  });

  it('shows a description in app only when it adds to the label', () => {
    expect(shownDescription('The day they arrive', 'Arriving on', ['date'], 'app')).toBeUndefined();
    expect(shownDescription('Who is going', 'Travellers', ['list'], 'app')).toBe('Who is going');
  });

  it('shows no description on a list row in app, where the list said once what its rows are', () => {
    expect(shownDescription('One person on the trip', '', ['structured'], 'app')).toBeUndefined();
  });

  it('answers undefined for no description, or an empty one', () => {
    expect(shownDescription(undefined, 'City', ['text'], 'app')).toBeUndefined();
    expect(shownDescription('', 'City', ['text'], 'studio')).toBeUndefined();
  });
});

describe('shownItemDescription', () => {
  const kinds = ['list', 'text'] as const;

  it("says once in app what an item's description adds to the list's label and description", () => {
    expect(
      shownItemDescription(
        'Email address the invoice is sent to',
        'Contacts',
        'Who receives the invoice',
        kinds,
        'app',
      ),
    ).toBe('Email address the invoice is sent to');
  });

  it("leaves out an item description the list's label or description already says", () => {
    expect(shownItemDescription('A contact', 'Contacts', undefined, kinds, 'app')).toBeUndefined();
    expect(
      shownItemDescription('A text', 'Must see', 'Places they must not miss', kinds, 'app'),
    ).toBeUndefined();
  });

  it("says nothing for a slot whose item carries the list's own description", () => {
    expect(
      shownItemDescription('One photo', 'Gallery', 'One photo', ['list', 'image'], 'app'),
    ).toBeUndefined();
  });

  it('says nothing in studio, where every row shows it, nor for a list that is a row', () => {
    const note = 'Email address the invoice is sent to';
    expect(shownItemDescription(note, 'contacts', undefined, kinds, 'studio')).toBeUndefined();
    expect(shownItemDescription(note, '', undefined, kinds, 'app')).toBeUndefined();
  });
});
