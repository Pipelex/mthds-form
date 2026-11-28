/**
 * What a method's meaning draws on a result page (MTHDS `9.2.0`), asserted by
 * rendering: numbers in their unit, a meter between two bounds, a choice in
 * its tone, a record's verdict first with its title, summary and metrics,
 * cards for a list of titled records in `app`, counts by verdict, and only the
 * totals and averages a field declares. Hand-built `RunField`s, one branch
 * each; the payloads stay as a run returns them.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type {
  EnumRunField,
  ListRunField,
  NumberRunField,
  ObjectRunField,
  TextRunField,
} from '../../core/descriptor';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { FieldStringsProvider } from '../field-strings';
import { ResultField } from '../result-field';
import { columnAggregates } from '../result-parts';

const text = (name: string, part?: string): TextRunField => ({
  kind: 'text',
  name,
  required: true,
  ...(part ? { hints: { part } } : {}),
});
const number = (name: string, facts: Partial<NumberRunField> = {}): NumberRunField => ({
  kind: 'number',
  name,
  required: true,
  integer: false,
  ...facts,
});
const status: EnumRunField = {
  kind: 'enum',
  name: 'status',
  required: true,
  options: ['up', 'redirect', 'down'],
  hints: { part: 'verdict' },
  optionDetails: [
    { value: 'up', label: 'Up', tone: 'positive' },
    { value: 'redirect', label: 'Redirect', tone: 'caution' },
    { value: 'down', label: 'Down', tone: 'negative' },
  ],
};
const record = (fields: ObjectRunField['fields']): ObjectRunField => ({
  kind: 'object',
  name: 'output',
  conceptRef: 'demo.Check',
  required: true,
  fields,
});
const listOf = (item: ListRunField['item']): ListRunField => ({
  kind: 'list',
  name: 'output',
  conceptRef: 'demo.Check',
  required: true,
  item,
});

function renderIn(presentation: FieldPresentation, ui: React.ReactElement, locale?: string) {
  const inner = (
    <FieldPresentationProvider presentation={presentation}>{ui}</FieldPresentationProvider>
  );
  return render(
    locale ? <FieldStringsProvider locale={locale}>{inner}</FieldStringsProvider> : inner,
  );
}

// A number keeps a no-break space beside its unit, which `getByText` does not
// match against a plain one; the assertions on those read the text itself.
const LINKS = [
  { url: 'https://a.example', status: 'up', response_ms: 400 },
  { url: 'https://b.example', status: 'up', response_ms: 200 },
  { url: 'https://c.example', status: 'down', response_ms: 3000 },
];

describe('a number in its unit', () => {
  it('writes money in its currency and a measure with its symbol', () => {
    const { container } = renderIn(
      'app',
      <ResultField
        field={record([number('total', { unit: 'EUR' }), number('area', { unit: 'm2' })])}
        value={{ total: 1840.5, area: 40 }}
      />,
    );
    expect(screen.getByText('€1,840.50')).toBeTruthy();
    expect(container.textContent).toContain('40\u00a0m²');
  });

  it('writes money where the reader’s locale writes it', () => {
    const { container } = renderIn(
      'app',
      <ResultField field={record([number('total', { unit: 'EUR' })])} value={{ total: 1840.5 }} />,
      'fr',
    );
    expect(container.textContent).toContain('1\u202f840,50\u00a0€');
  });

  it('draws a number with both bounds as a meter', () => {
    renderIn(
      'studio',
      <ResultField
        field={record([number('confidence', { min: 0, max: 1 })])}
        value={{ confidence: 0.85 }}
      />,
    );
    const meter = screen.getByRole('meter');
    expect(meter.getAttribute('aria-valuenow')).toBe('0.85');
    expect(meter.getAttribute('aria-valuetext')).toContain('0.85');
  });
});

describe('a choice in its tone', () => {
  it('draws a toned choice as a badge with its label', () => {
    const { container } = renderIn(
      'studio',
      <ResultField field={record([{ ...status, hints: undefined }])} value={{ status: 'down' }} />,
    );
    const badge = container.querySelector('[data-tone="negative"]');
    expect(badge?.textContent).toContain('Down');
  });

  it('draws a choice with no tones as words, never as a colour', () => {
    const plain: EnumRunField = { ...status, hints: undefined, optionDetails: undefined };
    const { container } = renderIn(
      'app',
      <ResultField field={record([plain])} value={{ status: 'down' }} />,
    );
    expect(container.querySelector('[data-tone]')).toBeNull();
    expect(screen.getByText('Down')).toBeTruthy();
  });
});

describe('a record’s anatomy', () => {
  const check = record([
    text('url', 'title'),
    text('note', 'summary'),
    status,
    number('ms', { unit: 'ms', hints: { part: 'metric' } }),
  ]);
  const value = { url: 'https://a.example', note: 'Answered quickly.', status: 'up', ms: 412 };

  it('draws the verdict first, then the title, the summary and the metric, in app', () => {
    const { container } = renderIn('app', <ResultField field={check} value={value} />);
    const head = container.querySelector('[data-record-head]')!;
    expect(head.firstElementChild?.hasAttribute('data-verdict-line')).toBe(true);
    expect(within(head as HTMLElement).getByText('https://a.example')).toBeTruthy();
    expect(within(head as HTMLElement).getByText('Answered quickly.')).toBeTruthy();
    expect(head.textContent).toContain('412\u00a0ms');
  });

  it('keeps every field in its authored place in studio', () => {
    const { container } = renderIn('studio', <ResultField field={check} value={value} />);
    expect(container.querySelector('[data-record-head]')).toBeNull();
  });
});

describe('a list of records', () => {
  const element = record([
    text('url', 'title'),
    status,
    number('response_ms', { unit: 'ms', aggregate: 'average' }),
  ]);

  it('counts the records by verdict, in the options’ order, leaving out an empty one', () => {
    renderIn('app', <ResultField field={listOf(element)} value={LINKS} />);
    const counts = screen.getByRole('list', { name: 'By verdict' });
    const items = within(counts)
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(items).toEqual(['2 Up', '1 Down']);
  });

  it('draws titled records as cards in app, and as a table in studio', () => {
    const app = renderIn('app', <ResultField field={listOf(element)} value={LINKS} />);
    expect(app.container.querySelector('[data-record-cards]')).not.toBeNull();
    expect(app.container.querySelector('table')).toBeNull();
    app.unmount();
    const studio = renderIn('studio', <ResultField field={listOf(element)} value={LINKS} />);
    expect(studio.container.querySelector('table')).not.toBeNull();
  });

  it('shows the average its field declares, in its unit', () => {
    const { container } = renderIn('studio', <ResultField field={listOf(element)} value={LINKS} />);
    const average = container.querySelector('[data-aggregate="average"]')!;
    expect(average.textContent).toContain('Average');
    expect(average.textContent).toContain('1,200 ms');
  });

  it('shows no total for a field that declares none', () => {
    const bare = record([text('url'), number('response_ms')]);
    expect(columnAggregates(bare, LINKS)).toEqual([]);
    const { container } = renderIn('studio', <ResultField field={listOf(bare)} value={LINKS} />);
    expect(container.querySelector('[data-aggregates]')).toBeNull();
  });

  it('sums over the records that carry a number, and leaves out a column none fills', () => {
    const priced = record([
      number('price', { aggregate: 'sum' }),
      number('tax', { aggregate: 'sum' }),
    ]);
    expect(columnAggregates(priced, [{ price: 2 }, { price: 3 }, { price: null }])).toEqual([
      { field: priced.fields[0], rule: 'sum', value: 5 },
    ]);
  });
});
