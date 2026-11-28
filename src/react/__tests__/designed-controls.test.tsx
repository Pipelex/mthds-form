/**
 * The controls a method's meaning draws (MTHDS `9.2.0`), asserted by
 * rendering: the entry a number gets from its intent, unit and bounds, a
 * text's format-aware input, its length counter and its examples, described
 * option cards, the file intents, and the form's role layout and invalid
 * marks. Unit inputs are hand-built `RunField`s chosen to hit one branch
 * each; the form-level cases use the annotated story fixtures.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type {
  EnumRunField,
  FileRunField,
  NumberRunField,
  ProseRunField,
  RunField,
  TextRunField,
} from '../../core/descriptor';
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import { formatsForKind } from '../../core/file-formats';
import { FieldRenderer } from '../field-renderer';
import { FieldPresentationProvider } from '../field-presentation';
import { MethodForm, useMethodForm } from '../method-form';
import { numberEntry } from '../number-field';
import { dateTimeValue, timeValue } from '../text-field';
import { SPEC_INPUT_CONTRACTS, SPEC_INPUT_FORM } from '../../__stories__/_spec-shaped';

function Controlled({ field, initial }: { field: RunField; initial?: unknown }) {
  const [value, setValue] = useState<unknown>(initial);
  return (
    <FieldPresentationProvider presentation="app">
      <FieldRenderer
        field={field}
        id={field.name}
        value={value}
        onChange={setValue}
        env={{ onDropFile: () => {} }}
      />
      <output data-testid="value">{JSON.stringify(value ?? null)}</output>
    </FieldPresentationProvider>
  );
}
const valueOf = () => JSON.parse(screen.getByTestId('value').textContent!) as unknown;

const number = (facts: Partial<NumberRunField> = {}): NumberRunField => ({
  kind: 'number',
  name: 'amount',
  required: true,
  integer: false,
  ...facts,
});
const text = (facts: Partial<TextRunField> = {}): TextRunField => ({
  kind: 'text',
  name: 'contact',
  required: true,
  ...facts,
});

describe('a number’s entry', () => {
  it('is a scale for a rating with whole bounds at most ten apart', () => {
    expect(numberEntry(number({ min: 1, max: 5, hints: { intent: 'rating' } }))).toBe('scale');
    expect(numberEntry(number({ min: 0, max: 20, hints: { intent: 'rating' } }))).toBe('slider');
  });
  it('is a stepper for a quantity, a currency or an unbounded number', () => {
    expect(numberEntry(number({ min: 0, max: 9, hints: { intent: 'quantity' } }))).toBe('stepper');
    expect(numberEntry(number({ min: 0, max: 9, unit: 'EUR' }))).toBe('stepper');
    expect(numberEntry(number({ min: 0 }))).toBe('stepper');
  });
  it('is a slider for any other number with both bounds', () => {
    expect(numberEntry(number({ min: 0, max: 100, unit: 'percent' }))).toBe('slider');
  });
});

describe('the number control', () => {
  it('draws a currency’s symbol before the amount, and a percent sign after', () => {
    const { container, unmount } = render(<Controlled field={number({ unit: 'EUR' })} />);
    expect(container.querySelector('[data-unit-affix="before"]')?.textContent).toBe('€');
    unmount();
    const percent = render(<Controlled field={number({ unit: 'percent', min: 0, max: 100 })} />);
    expect(percent.container.querySelector('[data-unit-affix="after"]')?.textContent).toBe('%');
    expect(percent.container.querySelector('[data-number-slider]')).not.toBeNull();
  });

  it('draws a rating as one step per value, and a step picks it', async () => {
    render(<Controlled field={number({ min: 1, max: 5, hints: { intent: 'rating' } })} />);
    const group = screen.getByRole('radiogroup', { name: 'Amount' });
    expect(within(group).getAllByRole('radio')).toHaveLength(5);
    await userEvent.click(screen.getByRole('radio', { name: '4 out of 5' }));
    expect(valueOf()).toBe(4);
  });

  it('fills the value from an example chip, written in its unit', async () => {
    render(<Controlled field={number({ unit: 'EUR', examples: [1200] })} />);
    await userEvent.click(screen.getByRole('button', { name: /€1,200\.00/ }));
    expect(valueOf()).toBe(1200);
  });
});

describe('the text control', () => {
  it('gives an email the browser’s email input', () => {
    const { container } = render(<Controlled field={text({ format: 'email' })} />);
    const input = container.querySelector('input')!;
    expect(input.type).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('sets an identifier in monospace, without spelling help', () => {
    const { container } = render(<Controlled field={text({ hints: { intent: 'identifier' } })} />);
    const input = container.querySelector('input')!;
    expect(input.hasAttribute('data-mono')).toBe(true);
    expect(input.getAttribute('spellcheck')).toBe('false');
  });

  it('counts the characters against the cap, in code points', async () => {
    render(<Controlled field={text({ maxLength: 10 })} />);
    await userEvent.type(screen.getByRole('textbox'), '😀ab');
    expect(screen.getByText('3 / 10')).toBeTruthy();
  });

  it('fills the value from an example chip', async () => {
    render(<Controlled field={text({ examples: ['ada@example.org'] })} />);
    await userEvent.click(screen.getByRole('button', { name: /ada@example\.org/ }));
    expect(valueOf()).toBe('ada@example.org');
  });

  it('gives a formatted prose input one line', () => {
    const prose: ProseRunField = { kind: 'prose', name: 'site', required: true, format: 'uri' };
    const { container } = render(<Controlled field={prose} />);
    expect(container.querySelector('textarea')).toBeNull();
    expect(container.querySelector('input')!.type).toBe('url');
  });

  it('makes a question a composer box', () => {
    const prose: ProseRunField = {
      kind: 'prose',
      name: 'ask',
      required: true,
      hints: { intent: 'question' },
    };
    const { container } = render(<Controlled field={prose} />);
    expect(container.querySelector('textarea[data-intent="question"]')).not.toBeNull();
  });

  it('writes a time with its seconds and a date-time with its offset', () => {
    expect(timeValue('14:30')).toBe('14:30:00');
    expect(timeValue('14:30:05')).toBe('14:30:05');
    expect(dateTimeValue('2026-11-28T14:30')).toMatch(/^2026-11-28T14:30:00[+-]\d\d:\d\d$/);
    expect(dateTimeValue('garbage')).toBeUndefined();
  });
});

describe('described options', () => {
  const format: EnumRunField = {
    kind: 'enum',
    name: 'format',
    required: true,
    options: ['pdf', 'md'],
    optionDetails: [
      { value: 'pdf', label: 'PDF file', description: 'A fixed page.' },
      { value: 'md', description: 'Plain text.', tone: 'caution' },
    ],
  };

  it('draws each option as a card with its words, and a card picks it', async () => {
    const { container } = render(<Controlled field={format} />);
    expect(container.querySelector('[data-option-cards]')).not.toBeNull();
    expect(screen.getByText('A fixed page.')).toBeTruthy();
    await userEvent.click(screen.getByRole('radio', { name: /PDF file/ }));
    expect(valueOf()).toBe('pdf');
  });
});

describe('the file intents', () => {
  const file = (kind: 'image' | 'document', intent: string): FileRunField => ({
    kind,
    name: 'picture',
    required: true,
    formats: formatsForKind(kind),
    hints: { intent },
  });
  const picture = (intent: string) => file('image', intent);

  it('offers a paste for a screenshot', () => {
    render(<Controlled field={picture('screenshot')} />);
    expect(screen.getByRole('button', { name: 'Paste a screenshot' })).toBeTruthy();
  });

  it('offers the camera before the drop zone for a photo', () => {
    const { container } = render(<Controlled field={picture('photo')} />);
    const camera = container.querySelector('[data-take-photo]');
    expect(camera).not.toBeNull();
    const zone = container.querySelector('input[type="file"]')!;
    expect(camera!.compareDocumentPosition(zone) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('names the camera for scanning pages on a scan', () => {
    render(<Controlled field={file('document', 'scan')} />);
    expect(screen.getByText('Scan pages')).toBeTruthy();
  });
});

function FormHarness({ domain, code }: { domain: string; code: string }) {
  const contract = getPipeIOContract(SPEC_INPUT_CONTRACTS, domain, code)!;
  const descriptor = getPipeInputForm(SPEC_INPUT_FORM, domain, code)!;
  const form = useMethodForm({ descriptor, contract, uploadFile: async () => 'blob:x' });
  return (
    <>
      <MethodForm form={form} presentation="app" />
      <button type="button" onClick={() => form.attempt()}>
        Run
      </button>
      <output data-testid="state">
        {JSON.stringify({ names: form.fields.map((f) => f.name), ready: form.ready })}
      </output>
    </>
  );
}
const state = () =>
  JSON.parse(screen.getByTestId('state').textContent!) as { names: string[]; ready: boolean };

describe('the form’s role layout', () => {
  it('puts the subject first, whatever the declared order', () => {
    render(<FormHarness domain="structured" code="roles" />);
    expect(state().names).toEqual(['source', 'invoice']);
  });

  it('folds an optional reference behind its own disclosure', async () => {
    render(<FormHarness domain="trips" code="roles_folded" />);
    const toggle = screen.getByRole('button', { name: 'Show 1 reference or setting' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Inspiration')).toBeNull();
    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Hide references and settings' })).toBeTruthy();
    expect(screen.getAllByText('Inspiration').length).toBeGreaterThan(0);
  });
});

describe('an invalid value', () => {
  it('holds the run and is named after an attempt', async () => {
    const { container } = render(<FormHarness domain="scalars" code="formats" />);
    await userEvent.type(container.querySelector('input[type="email"]')!, 'not-an-email');
    await userEvent.type(container.querySelector('input[type="url"]')!, 'https://example.org');
    expect(state().ready).toBe(false);
    expect(screen.queryByText('Must be an email address.')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(screen.getByText('Must be an email address.')).toBeTruthy();
  });
});
