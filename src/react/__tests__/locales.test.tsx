import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FIELD_STRINGS,
  EN_FIELD_STRINGS,
  FR_FIELD_STRINGS,
  FieldStringsProvider,
  SUPPORTED_LOCALES,
  fieldStringsFor,
  useFieldStrings,
} from '..';

function AddItem() {
  return <span>{useFieldStrings().addItem}</span>;
}

describe('locale switch', () => {
  it('picks the pack by the primary language subtag', () => {
    expect(fieldStringsFor('fr')).toBe(FR_FIELD_STRINGS);
    expect(fieldStringsFor('fr-FR')).toBe(FR_FIELD_STRINGS);
    expect(fieldStringsFor('FR_ca')).toBe(FR_FIELD_STRINGS);
    expect(fieldStringsFor('en-GB')).toBe(EN_FIELD_STRINGS);
  });

  it('falls back to English for an unknown or missing locale', () => {
    expect(fieldStringsFor('de-DE')).toBe(EN_FIELD_STRINGS);
    expect(fieldStringsFor(undefined)).toBe(EN_FIELD_STRINGS);
    expect(fieldStringsFor('')).toBe(EN_FIELD_STRINGS);
  });

  it('keeps DEFAULT_FIELD_STRINGS as the English pack and lists the shipped locales', () => {
    expect(DEFAULT_FIELD_STRINGS).toBe(EN_FIELD_STRINGS);
    expect(SUPPORTED_LOCALES).toEqual(['en', 'fr']);
  });

  it('lets the provider switch language by locale, with per-key overrides on top', () => {
    const { rerender } = render(
      <FieldStringsProvider locale="fr-FR">
        <AddItem />
      </FieldStringsProvider>,
    );
    expect(screen.getByText(FR_FIELD_STRINGS.addItem)).toBeTruthy();
    rerender(
      <FieldStringsProvider locale="en">
        <AddItem />
      </FieldStringsProvider>,
    );
    expect(screen.getByText(EN_FIELD_STRINGS.addItem)).toBeTruthy();
    rerender(
      <FieldStringsProvider locale="fr" strings={{ addItem: 'Ajouter une ligne' }}>
        <AddItem />
      </FieldStringsProvider>,
    );
    expect(screen.getByText('Ajouter une ligne')).toBeTruthy();
  });
});
