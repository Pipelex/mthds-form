/**
 * The edges of the controls a method's meaning draws (MTHDS `9.2.0`), each a
 * defect a review found: the role layout's folded group (who opens and closes
 * it, an optional structure in it), a list naming its refused item, a slider
 * and a stepper at their bounds, a rating holding a value between its steps,
 * the scan button's name, a pasted screenshot's file name and note, the date
 * and time inputs around a time zone, and two options sharing a label.
 * Unit inputs are hand-built `RunField`s; the form-level cases take generated
 * fixtures and state the facts through `prepareFields`, as a host would.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type {
  EnumRunField,
  FileRunField,
  NumberRunField,
  RunField,
  TextRunField,
} from '../../core/descriptor';
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import { formatsForKind } from '../../core/file-formats';
import { FieldRenderer } from '../field-renderer';
import { FieldPresentationProvider } from '../field-presentation';
import { MethodForm, useMethodForm, type MethodFormValues } from '../method-form';
import { pastedFileName } from '../file-field';
import { optionLabeler } from '../enum-field';
import { dateTimeInputValue, dateTimeValue, isNonexistentLocalTime } from '../text-field';
import { numberStep } from '../number-field';
import {
  CONTRACTS as SCALARS,
  INPUT_FORM as SCALARS_FORM,
} from '../../__stories__/_generated/scalars';
import { CONTRACTS as LISTS, INPUT_FORM as LISTS_FORM } from '../../__stories__/_generated/lists';

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
  name: 'when',
  required: true,
  ...facts,
});

// ─── the form ────────────────────────────────────────────────────────────────

interface FormProps {
  domain: 'scalars' | 'lists';
  code: string;
  prepare: (fields: RunField[]) => RunField[];
  errors?: Record<string, string>;
  initialValues?: MethodFormValues;
  framed?: boolean;
}

function Form({ domain, code, prepare, errors, initialValues, framed }: FormProps) {
  const [contracts, inputForm] =
    domain === 'scalars' ? [SCALARS, SCALARS_FORM] : [LISTS, LISTS_FORM];
  const contract = getPipeIOContract(contracts, domain, code)!;
  const descriptor = getPipeInputForm(inputForm, domain, code)!;
  const form = useMethodForm({
    descriptor,
    contract,
    prepareFields: prepare,
    initialValues,
    uploadFile: async () => 'blob:x',
  });
  return (
    <>
      <MethodForm form={form} presentation="app" errors={errors} framed={framed} />
      <button type="button" onClick={() => form.attempt()}>
        Run
      </button>
      <output data-testid="values">{JSON.stringify(form.values)}</output>
    </>
  );
}

/** `scalars.presence_axis`, with roles: a subject, a context, and an optional setting capped at three characters. */
const withSetting = (fields: RunField[]): RunField[] =>
  fields.map((field) => {
    if (field.name === 'required_plain')
      return { ...field, title: 'Brief', hints: { role: 'subject' } };
    if (field.name === 'required_forced') return { ...field, title: 'Context' };
    if (field.name === 'may_be_absent' && field.kind === 'prose')
      return { ...field, title: 'Tone', maxLength: 3, hints: { role: 'setting' } };
    return field;
  });

const showGroup = () => screen.queryByRole('button', { name: 'Show 1 reference or setting' });
const hideGroup = () => screen.queryByRole('button', { name: 'Hide references and settings' });

async function fillRequiredAndOverfillTone() {
  await userEvent.type(screen.getByLabelText(/^Brief/), 'a');
  await userEvent.type(screen.getByLabelText(/^Context/), 'b');
  await userEvent.click(showGroup()!);
  await userEvent.type(screen.getByLabelText(/^Tone/), 'abcdef');
  await userEvent.click(hideGroup()!);
  expect(screen.queryByLabelText(/^Tone/)).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Run' }));
}

describe('the folded group of references and settings', () => {
  it('opens on a refusal, and its Hide button then closes it', async () => {
    render(<Form domain="scalars" code="presence_axis" prepare={withSetting} />);
    await fillRequiredAndOverfillTone();
    expect(hideGroup()).not.toBeNull();
    expect(screen.getByText(/at most 3 characters/i)).toBeTruthy();
    await userEvent.click(hideGroup()!);
    expect(showGroup()).not.toBeNull();
    expect(screen.queryByLabelText(/^Tone/)).toBeNull();
  });

  it('stays open once the refused value is put right', async () => {
    render(<Form domain="scalars" code="presence_axis" prepare={withSetting} />);
    await fillRequiredAndOverfillTone();
    const tone = screen.getByLabelText(/^Tone/);
    await userEvent.clear(tone);
    await userEvent.type(tone, 'ab');
    expect(screen.queryByText(/at most 3 characters/i)).toBeNull();
    expect(hideGroup()).not.toBeNull();
    expect(screen.getByLabelText(/^Tone/)).toBeTruthy();
  });

  it('opens on a host’s error for one of its inputs', () => {
    render(
      <Form
        domain="scalars"
        code="presence_axis"
        prepare={withSetting}
        errors={{ may_be_absent: 'The server refused this tone.' }}
      />,
    );
    expect(hideGroup()).not.toBeNull();
    expect(screen.getByText('The server refused this tone.')).toBeTruthy();
  });
});

describe('the folded group in a framed form', () => {
  it('is drawn among the form’s own children, where its section rules reach', () => {
    render(<Form domain="scalars" code="presence_axis" prepare={withSetting} framed />);
    const disclosure = showGroup()!;
    expect(disclosure.parentElement?.className).toContain('[data-form-section]');
  });
});

describe('an optional structure stating a setting role', () => {
  /** `scalars.number_kinds`, with the amount the subject and the optional date a setting. */
  const withOptionalSetting = (fields: RunField[]): RunField[] =>
    fields.map((field) => {
      if (field.name === 'amount') return { ...field, hints: { role: 'subject' } };
      if (field.name === 'due')
        return {
          ...field,
          title: 'Due',
          required: false,
          gating: false,
          hints: { role: 'setting' },
        };
      return field;
    });

  it('keeps the optional disclosure that opens it seeded and closes it', async () => {
    render(<Form domain="scalars" code="number_kinds" prepare={withOptionalSetting} />);
    expect(showGroup()).toBeNull();
    const toggle = screen.getByRole('button', { name: '1 optional input' });
    await userEvent.click(toggle);
    const values = () =>
      JSON.parse(screen.getByTestId('values').textContent!) as Record<string, unknown>;
    expect(values().due).toEqual(expect.any(Object));
    await userEvent.click(screen.getByRole('button', { name: 'Hide optional inputs' }));
    expect(values().due).toBeUndefined();
  });
});

describe('a list holding a refused item', () => {
  const scores = (fields: RunField[]): RunField[] =>
    fields.map((field) =>
      field.name === 'note'
        ? {
            kind: 'list',
            name: 'note',
            title: 'Scores',
            required: true,
            gating: true,
            item: { kind: 'number', name: 'score', required: true, integer: true, min: 0, max: 10 },
          }
        : field,
    );

  it('names the item and what is wrong with it', async () => {
    render(
      <Form domain="lists" code="numbers" prepare={scores} initialValues={{ note: [3, 12] }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(screen.getByText('Item 2: Must be at most 10.')).toBeTruthy();
  });
});

// ─── numbers ─────────────────────────────────────────────────────────────────

describe('the slider', () => {
  it('reads as unset until it is moved, and its minimum can be picked', () => {
    const { container } = render(<Controlled field={number({ min: 0, max: 100 })} />);
    const slider = container.querySelector<HTMLInputElement>('[data-number-slider]')!;
    expect(slider.hasAttribute('data-unset')).toBe(true);
    expect(slider.getAttribute('aria-valuetext')).toBe('Not set');
    // A press on the thumb where it rests, at the minimum, fires no change.
    fireEvent.pointerUp(slider);
    expect(valueOf()).toBe(0);
    expect(slider.hasAttribute('data-unset')).toBe(false);
  });

  it('steps by what its bounds allow, so both bounds can be reached', () => {
    expect(numberStep(number({ min: 0, max: 0.05 }))).toBeLessThanOrEqual(0.0005);
    const step = numberStep(number({ min: 0.05, max: 1 }));
    expect(Number.isInteger(Math.round(((1 - 0.05) / step) * 1e9) / 1e9)).toBe(true);
    expect(numberStep(number({ min: 0, max: 100 }))).toBe(1);
    expect(numberStep(number({ integer: true, min: 0, max: 5 }))).toBe(1);
    expect(numberStep(number({ unit: 'EUR' }))).toBe(0.01);
  });
});

describe('a rating holding a value between its steps', () => {
  it('shows that value as the selected step', () => {
    render(
      <Controlled field={number({ min: 1, max: 5, hints: { intent: 'rating' } })} initial={3.5} />,
    );
    const chosen = screen.getByRole('radio', { checked: true });
    expect(chosen.textContent).toBe('3.5');
  });
});

describe('the stepper', () => {
  it('writes no floating-point noise', async () => {
    render(<Controlled field={number({ unit: 'EUR' })} initial={0.1} />);
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(valueOf()).toBe(0.12);
    render(<Controlled field={number({ name: 'other' })} initial={0.05} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Increase' })[1]!);
    expect(JSON.parse(screen.getAllByTestId('value')[1]!.textContent!)).toBe(0.15);
  });

  it('never steps onto an excluded bound', async () => {
    render(<Controlled field={number({ exclusiveMin: 0, exclusiveMax: 1 })} initial={0.5} />);
    for (let i = 0; i < 6; i += 1)
      await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(valueOf()).toBeGreaterThan(0);
    for (let i = 0; i < 12; i += 1)
      await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(valueOf()).toBeLessThan(1);
  });
});

// ─── files ───────────────────────────────────────────────────────────────────

describe('the scan button', () => {
  const scan: FileRunField = {
    kind: 'document',
    name: 'receipt',
    title: 'Receipt',
    required: true,
    formats: formatsForKind('document'),
    hints: { intent: 'scan' },
  };

  it('carries the field’s label in its name', () => {
    render(<Controlled field={scan} />);
    expect(screen.getByRole('button', { name: 'Scan pages for Receipt' })).toBeTruthy();
  });
});

describe('a pasted screenshot', () => {
  it('is named with the extension its type has, from a label made safe', () => {
    expect(pastedFileName('Before / after: v2', 'image/svg+xml')).toBe('Before - after- v2.svg');
    expect(pastedFileName('Shot', 'image/jpeg')).toBe('Shot.jpg');
    expect(pastedFileName('', 'image/png')).toBe('Screenshot.png');
    expect(pastedFileName('Shot', 'image/x-weird')).toBe('Shot.png');
  });

  describe('the note under the paste button', () => {
    const screenshot: FileRunField = {
      kind: 'image',
      name: 'shot',
      title: 'Shot',
      required: true,
      formats: formatsForKind('image'),
      hints: { intent: 'screenshot' },
    };
    let read: ReturnType<typeof vi.fn>;
    beforeEach(() => {
      read = vi.fn();
      Object.defineProperty(navigator, 'clipboard', { value: { read }, configurable: true });
    });
    afterEach(() => {
      Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('says the browser refused, when it did', async () => {
      read.mockRejectedValue(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
      render(<Controlled field={screenshot} />);
      await userEvent.click(screen.getByRole('button', { name: 'Paste a screenshot' }));
      expect(await screen.findByText(/did not let this page read the clipboard/i)).toBeTruthy();
    });

    it('goes once a file is dropped', async () => {
      read.mockResolvedValue([]);
      const { container } = render(<Controlled field={screenshot} />);
      await userEvent.click(screen.getByRole('button', { name: 'Paste a screenshot' }));
      expect(await screen.findByText('The clipboard holds no picture.')).toBeTruthy();
      const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
      await act(async () => {
        await userEvent.upload(input, new File(['x'], 'a.png', { type: 'image/png' }));
      });
      expect(screen.queryByText('The clipboard holds no picture.')).toBeNull();
    });
  });
});

// ─── dates and times ─────────────────────────────────────────────────────────

describe('the date-time control around time zones', () => {
  const zone = process.env.TZ;
  afterEach(() => {
    if (zone === undefined) Reflect.deleteProperty(process.env, 'TZ');
    else process.env.TZ = zone;
  });

  it('shows a bare date on its own day, west of UTC', () => {
    process.env.TZ = 'America/New_York';
    expect(dateTimeInputValue('2026-11-28')).toBe('2026-11-28T00:00:00');
  });

  it('keeps a year of fewer than four digits padded both ways', () => {
    process.env.TZ = 'UTC';
    expect(dateTimeValue('0002-11-28T14:30')).toBe('0002-11-28T14:30:00+00:00');
    expect(dateTimeInputValue('0002-11-28T14:30:00+00:00')).toBe('0002-11-28T14:30:00');
  });

  it('refuses a local time the clocks skip, rather than another instant', () => {
    process.env.TZ = 'Europe/Paris';
    expect(isNonexistentLocalTime('2026-03-29T02:30')).toBe(true);
    expect(dateTimeValue('2026-03-29T02:30')).toBeUndefined();
    expect(isNonexistentLocalTime('2026-03-29T03:30')).toBe(false);
  });

  it('names the skipped time on the field', () => {
    process.env.TZ = 'Europe/Paris';
    const { container } = render(<Controlled field={text({ format: 'date-time' })} />);
    const input = container.querySelector<HTMLInputElement>('input[type="datetime-local"]')!;
    fireEvent.change(input, { target: { value: '2026-03-29T02:30' } });
    expect(screen.getByText(/does not exist/i)).toBeTruthy();
    expect(valueOf()).toBeNull();
  });

  it('reads only a whole date-time', () => {
    expect(dateTimeValue('2026-11-28T14:30garbage')).toBeUndefined();
    expect(dateTimeInputValue('2026-11-28T14:30:00+01:00 trailing')).toBe('');
  });
});

describe('a restored time with a zone', () => {
  it('stays visible and editable', () => {
    render(<Controlled field={text({ format: 'time' })} initial="14:30:00Z" />);
    expect(screen.getByDisplayValue('14:30:00Z')).toBeTruthy();
    render(<Controlled field={text({ name: 'other', format: 'time' })} initial="14:30:00+01:00" />);
    expect(screen.getByDisplayValue('14:30:00+01:00')).toBeTruthy();
  });
});

// ─── choices ─────────────────────────────────────────────────────────────────

describe('two options sharing an authored label', () => {
  it('reads each with its own code', () => {
    const field: EnumRunField = {
      kind: 'enum',
      name: 'plan',
      required: true,
      options: ['basic_monthly', 'basic_yearly', 'pro'],
      optionDetails: [
        { value: 'basic_monthly', label: 'Basic' },
        { value: 'basic_yearly', label: 'Basic' },
        { value: 'pro', label: 'Pro' },
      ],
    };
    const label = optionLabeler(field, 'app');
    const names = field.options.map(label);
    expect(new Set(names).size).toBe(3);
    expect(names).toEqual(['Basic (Basic monthly)', 'Basic (Basic yearly)', 'Pro']);
    expect(names).toContain('Pro');
  });
});
