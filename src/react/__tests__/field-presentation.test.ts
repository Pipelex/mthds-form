import { describe, expect, it } from 'vitest';
import {
  descriptionAddsToLabel,
  enumLabeler,
  fieldLabel,
  shownDescription,
  shownItemDescription,
} from '../field-presentation';

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

describe('enumLabeler', () => {
  const STATUSES = ['matches_po', 'unit_price_differs_from_po', 'HIGH_RISK', 'USD'];

  it('shows every value as its code in studio', () => {
    const label = enumLabeler(STATUSES, 'studio');
    expect(STATUSES.map(label)).toEqual(STATUSES);
  });

  it('shows every value as the kernel words it in app', () => {
    const label = enumLabeler(STATUSES, 'app');
    expect(STATUSES.map(label)).toEqual([
      'Matches po',
      'Unit price differs from po',
      'High risk',
      'USD',
    ]);
  });

  it('keeps the fallback to the codes in app when two options would read the same', () => {
    const options = ['high_risk', 'HIGH_RISK', 'low_risk'];
    expect(options.map(enumLabeler(options, 'app'))).toEqual(options);
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

  it('says nothing in studio, where every row shows it', () => {
    const note = 'Email address the invoice is sent to';
    expect(shownItemDescription(note, 'contacts', undefined, kinds, 'studio')).toBeUndefined();
  });

  it('says it in a list that is a row, which the list above it does not', () => {
    const note = 'Email address the invoice is sent to';
    expect(shownItemDescription(note, '', undefined, kinds, 'app')).toBe(note);
    expect(shownItemDescription(note, '', 'Who receives the invoice', kinds, 'app')).toBe(note);
    expect(shownItemDescription('A contact', '', 'A contact', kinds, 'app')).toBeUndefined();
  });
});
