// @vitest-environment jsdom
/**
 * A result's VALUES, as a person reads them.
 *
 * Three rules, each asserted by rendering because each is a fact about what
 * reaches the page:
 *
 * - an enum value is its code in `studio` and its code in words in `app`;
 * - a number is printed as it arrived in `studio`, and grouped with bounded
 *   decimals in `app`, in a locale the host states rather than the runtime's;
 * - a `text` value the descriptor does not bound to a cell is typeset as
 *   Markdown in both presentations, except in a table cell or a chip, and a
 *   one-line value keeps exactly the markup it had.
 *
 * And the constraint under all three: only the rendering changes. The JSON
 * view, the copy control and the download carry the payload as it came.
 *
 * The fixtures are hand-built `RunField`s for the reason `result-field.test.tsx`
 * gives: unit inputs chosen to hit one branch each. A bounded `text` is one of
 * them, and no generated fixture can produce it - a structures-only corpus has
 * no way to declare `max_length`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  EnumRunField,
  ListRunField,
  NumberRunField,
  ObjectRunField,
  TextRunField,
} from '../../core';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { formatNumber } from '../number-format';
import { ResultEnvProvider } from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';

const text = (name: string, maxLength?: number): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
  ...(maxLength !== undefined ? { maxLength } : {}),
});
const choice = (name: string, options: string[]): EnumRunField => ({
  kind: 'enum',
  name,
  conceptRef: 'demo.Status',
  required: true,
  options,
});
const number = (name: string): NumberRunField => ({
  kind: 'number',
  name,
  conceptRef: 'native.Number',
  required: true,
  integer: false,
});
const record = (fields: ObjectRunField['fields'], name = 'output'): ObjectRunField => ({
  kind: 'object',
  name,
  conceptRef: 'demo.Review',
  required: true,
  fields,
});
const listOf = (name: string, item: ListRunField['item']): ListRunField => ({
  kind: 'list',
  name,
  conceptRef: 'demo.Review',
  required: true,
  item,
});

/** Render under one presentation, the way a host sets it on its result. */
function renderIn(presentation: FieldPresentation, ui: React.ReactElement) {
  return render(
    <FieldPresentationProvider presentation={presentation}>{ui}</FieldPresentationProvider>,
  );
}

const STATUSES = ['matches_po', 'unit_price_differs_from_po', 'HIGH_RISK'];
const MEMO =
  '## Memo\n\nThe unit price is **above** the order.\n\n| Line | Price |\n|---|---|\n| Pump | 612.40 |';

describe('an enum value follows the presentation', () => {
  const review = record([choice('status', STATUSES), choice('risk', STATUSES)]);
  const value = { status: 'unit_price_differs_from_po', risk: 'HIGH_RISK' };

  it('shows the code verbatim in studio', () => {
    renderIn('studio', <ResultField field={review} value={value} />);
    expect(screen.getByText('unit_price_differs_from_po')).toBeTruthy();
    expect(screen.getByText('HIGH_RISK')).toBeTruthy();
    expect(screen.queryByText('Unit price differs from po')).toBeNull();
  });

  it('shows it in words in app', () => {
    renderIn('app', <ResultField field={review} value={value} />);
    expect(screen.getByText('Unit price differs from po')).toBeTruthy();
    expect(screen.getByText('High risk')).toBeTruthy();
    expect(screen.queryByText('unit_price_differs_from_po')).toBeNull();
  });

  it('carries the rule into a table cell', () => {
    const lines = listOf('lines', record([text('item', 40), choice('status', STATUSES)], 'line'));
    const rows = [{ item: 'Pump', status: 'unit_price_differs_from_po' }];
    const { container, unmount } = renderIn('studio', <ResultField field={lines} value={rows} />);
    expect(
      within(container.querySelector('tbody')!).getByText('unit_price_differs_from_po'),
    ).toBeTruthy();
    unmount();
    const app = renderIn('app', <ResultField field={lines} value={rows} />);
    const body = app.container.querySelector('tbody')!;
    expect(within(body).getByText('Unit price differs from po')).toBeTruthy();
    expect(body.textContent).not.toContain('unit_price_differs_from_po');
  });

  it('carries the rule into a chip', () => {
    const flags = listOf('flags', choice('flag', STATUSES));
    renderIn('app', <ResultField field={flags} value={['matches_po', 'HIGH_RISK']} />);
    expect(screen.getByText('Matches po')).toBeTruthy();
    expect(screen.getByText('High risk')).toBeTruthy();
  });

  it('prints a value that is not a string as it came', () => {
    // The payload disagreeing with its descriptor: shown, not worded.
    renderIn(
      'app',
      <ResultField field={record([choice('status', STATUSES)])} value={{ status: 3 }} />,
    );
    expect(screen.getByText('3')).toBeTruthy();
  });
});

describe('a number follows the presentation', () => {
  const amounts = record([number('total'), number('units'), number('variance'), number('score')]);
  const value = { total: 2116.2, units: 1200, variance: 0.0042, score: 0.85 };

  it('prints it as it arrived in studio', () => {
    renderIn('studio', <ResultField field={amounts} value={value} />);
    expect(screen.getByText('2116.2')).toBeTruthy();
    expect(screen.getByText('1200')).toBeTruthy();
    expect(screen.getByText('0.0042')).toBeTruthy();
  });

  it('groups it and bounds its decimals in app', () => {
    renderIn('app', <ResultField field={amounts} value={value} />);
    expect(screen.getByText('2,116.2')).toBeTruthy();
    // An integer only gains grouping.
    expect(screen.getByText('1,200')).toBeTruthy();
    // Below 1, three significant digits: the value does not collapse to 0.
    expect(screen.getByText('0.0042')).toBeTruthy();
    expect(screen.getByText('0.85')).toBeTruthy();
    expect(screen.queryByText('2116.2')).toBeNull();
  });

  it('keeps at most two decimals at a magnitude of 1 or more, and three significant digits below', () => {
    expect(formatNumber(3.14159, 'en-US')).toBe('3.14');
    expect(formatNumber(-1234.567, 'en-US')).toBe('-1,234.57');
    expect(formatNumber(0.123456, 'en-US')).toBe('0.123');
    expect(formatNumber(-0.5, 'en-US')).toBe('-0.5');
    expect(formatNumber(0, 'en-US')).toBe('0');
  });

  it('carries the rule into a table cell', () => {
    const lines = listOf('lines', record([text('item', 40), number('amount')], 'line'));
    const { container } = renderIn(
      'app',
      <ResultField field={lines} value={[{ item: 'Pump', amount: 2116.2 }]} />,
    );
    expect(within(container.querySelector('tbody')!).getByText('2,116.2')).toBeTruthy();
  });

  it('formats in the locale the host states', () => {
    renderIn(
      'app',
      <ResultEnvProvider locale="de-DE">
        <ResultField field={amounts} value={value} />
      </ResultEnvProvider>,
    );
    expect(screen.getByText('2.116,2')).toBeTruthy();
    expect(screen.getByText('0,0042')).toBeTruthy();
  });

  it('builds the formatters once per locale, not once per render', () => {
    // A locale no other test uses, so the module's cache is cold for it. The
    // spy forwards to the real constructor, and counts.
    const Real = Intl.NumberFormat;
    const construct = vi.spyOn(Intl, 'NumberFormat').mockImplementation(function (
      ...args: ConstructorParameters<typeof Real>
    ) {
      return new Real(...args);
    } as unknown as typeof Real);
    const ui = (
      <ResultEnvProvider locale="fr-CA">
        <ResultField field={amounts} value={value} />
      </ResultEnvProvider>
    );
    const { rerender } = renderIn('app', ui);
    const afterFirst = construct.mock.calls.length;
    expect(afterFirst).toBeGreaterThan(0);
    rerender(<FieldPresentationProvider presentation="app">{ui}</FieldPresentationProvider>);
    renderIn('app', ui);
    expect(construct.mock.calls.length).toBe(afterFirst);
    construct.mockRestore();
  });

  it('prints a value that is not a number as it came', () => {
    renderIn('app', <ResultField field={record([number('total')])} value={{ total: '2116.2' }} />);
    expect(screen.getByText('2116.2')).toBeTruthy();
  });
});

describe('an unbounded text value is typeset', () => {
  it.each(['studio', 'app'] as const)('typesets a heading and a table in %s', (presentation) => {
    const { container } = renderIn(
      presentation,
      <ResultField field={record([text('memo')])} value={{ memo: MEMO }} />,
    );
    expect(screen.getByRole('heading', { name: 'Memo' })).toBeTruthy();
    expect(screen.getByText('above').tagName).toBe('STRONG');
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.textContent).not.toContain('## Memo');
    expect(container.textContent).not.toContain('|');
  });

  it('keeps a BOUNDED text plain: its author said it is short', () => {
    const { container } = render(
      <ResultField field={record([text('memo', 60)])} value={{ memo: MEMO }} />,
    );
    expect(screen.queryByRole('heading', { name: 'Memo' })).toBeNull();
    expect(container.querySelector('table, strong')).toBeNull();
    expect(container.textContent).toContain('## Memo');
  });

  it('keeps a table cell plain', () => {
    const lines = listOf('memos', record([text('memo')], 'entry'));
    const { container } = render(<ResultField field={lines} value={[{ memo: MEMO }]} />);
    const body = container.querySelector('tbody')!;
    expect(within(body).queryByRole('heading')).toBeNull();
    expect(body.querySelector('table, strong')).toBeNull();
    expect(body.textContent).toContain('## Memo');
  });

  it('keeps a chip plain', () => {
    render(<ResultField field={listOf('notes', text('note'))} value={['a **bold** claim']} />);
    expect(screen.getByText('a **bold** claim')).toBeTruthy();
    expect(screen.queryByText('bold')).toBeNull();
  });

  it('typesets a text result at the top of the panel too', () => {
    render(<ResultField field={text('memo')} value={MEMO} />);
    expect(screen.getByRole('heading', { name: 'Memo' })).toBeTruthy();
  });
});

describe('a one-line text value keeps its markup', () => {
  // The hard constraint: a one-line value sits beside its label and ends at the
  // right edge of its column, and typesetting must not move it. So its markup
  // is pinned twice - against the literal element, and against the rendering a
  // bounded field still gets, which is the path it took before typesetting.
  const PLAIN =
    '<span class="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">Acme Logistics</span>';

  function valueCell(maxLength?: number) {
    const { container, unmount } = render(
      <ResultField
        field={record([text('supplier', maxLength)])}
        value={{ supplier: 'Acme Logistics' }}
      />,
    );
    const span = screen.getByText('Acme Logistics');
    const cell = span.parentElement!.parentElement!;
    const html = cell.outerHTML;
    unmount();
    return { container, span, cell, html };
  }

  it('renders exactly the span a plain value is', () => {
    const { span, cell } = valueCell();
    expect(span.outerHTML).toBe(PLAIN);
    // Inside the same flex row that puts it at the right edge.
    expect(cell.className).toContain('justify-end');
  });

  it('renders exactly what the unformatted path renders', () => {
    expect(valueCell().html).toBe(valueCell(40).html);
  });
});

describe('only the rendering changes', () => {
  const review = record([choice('status', STATUSES), number('total'), text('memo')]);
  const value = { status: 'unit_price_differs_from_po', total: 2116.2, memo: MEMO };

  function panel() {
    return renderIn('app', <StuffViewer field={review} value={value} name="review" />);
  }

  it('keeps the code, the number and the source on the JSON view', async () => {
    const { container } = panel();
    expect(screen.getByText('Unit price differs from po')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    const json = container.querySelector('pre')!.textContent!;
    expect(json).toBe(JSON.stringify(value, null, 2));
    expect(json).toContain('"status": "unit_price_differs_from_po"');
    expect(json).toContain('"total": 2116.2');
  });

  describe('the clipboard', () => {
    const writeText = vi.fn(() => Promise.resolve());
    beforeEach(() => {
      writeText.mockClear();
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    });

    it('copies the Markdown source of a typeset text, not its rendering', async () => {
      renderIn('app', <ResultField field={text('memo')} value={MEMO} />);
      await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyText }));
      expect(writeText).toHaveBeenCalledWith(MEMO);
    });

    it('copies the payload from the JSON view as it came', async () => {
      panel();
      await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
      await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyJson }));
      expect(writeText).toHaveBeenCalledWith(JSON.stringify(value, null, 2));
    });
  });

  describe('the download', () => {
    let saved: Blob[];
    beforeEach(() => {
      saved = [];
      vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
        saved.push(blob as Blob);
        return 'blob:stub';
      });
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    });
    afterEach(() => vi.restoreAllMocks());

    it('writes the payload as it came', async () => {
      panel();
      await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.download }));
      await waitFor(() => expect(saved).toHaveLength(1));
      expect(JSON.parse(await saved[0]!.text())).toEqual(value);
    });
  });
});
