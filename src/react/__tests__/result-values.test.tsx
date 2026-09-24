// @vitest-environment jsdom
/**
 * A result's ENUM values, as a person reads them.
 *
 * An enum value is its code in `studio` and its code in words in `app`, in a
 * stacked row, a table cell and a chip alike, and through the same rule
 * `EnumField` offers its options under - so an enum whose options would read
 * the same shows its codes in the result too. It is the only value the two
 * presentations show differently. Each rule is asserted by rendering, because
 * each is a fact about what reaches the page.
 *
 * And the constraint under it: only the rendering changes. The JSON view, the
 * copy control and the download carry the payload as it came.
 *
 * The fixtures are hand-built `RunField`s for the reason `result-field.test.tsx`
 * gives: unit inputs chosen to hit one branch each. A colliding enum is one of
 * them, and no real method would declare one on purpose.
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

const STATUSES = ['matches_po', 'unit_price_differs_from_po', 'HIGH_RISK', 'USD'];
/** Two codes that both read "High risk" once worded. */
const COLLIDING = ['high_risk', 'HIGH_RISK', 'low_risk'];

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

  it('keeps a single all-caps token as written in app', () => {
    renderIn(
      'app',
      <ResultField field={record([choice('currency', STATUSES)])} value={{ currency: 'USD' }} />,
    );
    expect(screen.getByText('USD')).toBeTruthy();
    expect(screen.queryByText('Usd')).toBeNull();
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

  it('prints a value the enum does not declare as it came', () => {
    // Worded, an undeclared `in_review` would read as a choice the method
    // never offered.
    renderIn(
      'app',
      <ResultField field={record([choice('status', STATUSES)])} value={{ status: 'in_review' }} />,
    );
    expect(screen.getByText('in_review')).toBeTruthy();
    expect(screen.queryByText('In review')).toBeNull();
  });
});

describe('an enum whose options would read the same shows its codes', () => {
  // The same rule `EnumField` applies to its options, so a result reads as the
  // form that produced it did (`enum-field.test.tsx`).

  it('shows the codes in a stacked row in app', () => {
    const review = record([choice('risk', COLLIDING), choice('status', STATUSES)]);
    renderIn(
      'app',
      <ResultField field={review} value={{ risk: 'low_risk', status: 'matches_po' }} />,
    );
    // Every option of the colliding enum, not only the two that collide.
    expect(screen.getByText('low_risk')).toBeTruthy();
    expect(screen.queryByText('Low risk')).toBeNull();
    // Another enum on the same record is worded as usual: the fallback is per
    // enum, not per record.
    expect(screen.getByText('Matches po')).toBeTruthy();
  });

  it('shows the codes in a table cell and a chip in app', () => {
    const lines = listOf('lines', record([text('item', 40), choice('risk', COLLIDING)], 'line'));
    const rows = [
      { item: 'Pump', risk: 'high_risk' },
      { item: 'Kit', risk: 'HIGH_RISK' },
    ];
    const { container, unmount } = renderIn('app', <ResultField field={lines} value={rows} />);
    const body = container.querySelector('tbody')!;
    expect(within(body).getByText('high_risk')).toBeTruthy();
    expect(within(body).getByText('HIGH_RISK')).toBeTruthy();
    expect(body.textContent).not.toContain('High risk');
    unmount();

    const flags = listOf('flags', choice('flag', COLLIDING));
    renderIn('app', <ResultField field={flags} value={['high_risk', 'HIGH_RISK']} />);
    expect(screen.getByText('high_risk')).toBeTruthy();
    expect(screen.getByText('HIGH_RISK')).toBeTruthy();
    expect(screen.queryByText('High risk')).toBeNull();
  });
});

describe("a table cell's tooltip reads as its cell", () => {
  // A cell is truncated past its width cap, and its tooltip is then the only
  // way to read it whole, so it carries the label the cell shows.
  const lines = (options: string[]) =>
    listOf('lines', record([text('item', 40), choice('status', options)], 'line'));

  /** The `title` on the wrapper around the cell showing `shown`. */
  function tooltipOf(container: HTMLElement, shown: string) {
    const cell = within(container.querySelector('tbody')!).getByText(shown);
    return cell.closest('[title]')?.getAttribute('title');
  }

  it('carries the code in studio', () => {
    const { container } = renderIn(
      'studio',
      <ResultField field={lines(STATUSES)} value={[{ item: 'Pump', status: 'HIGH_RISK' }]} />,
    );
    expect(tooltipOf(container, 'HIGH_RISK')).toBe('HIGH_RISK');
  });

  it('carries the words in app', () => {
    const { container } = renderIn(
      'app',
      <ResultField
        field={lines(STATUSES)}
        value={[{ item: 'Pump', status: 'unit_price_differs_from_po' }]}
      />,
    );
    expect(tooltipOf(container, 'Unit price differs from po')).toBe('Unit price differs from po');
  });

  it('carries the code in app when the enum falls back to its codes', () => {
    const { container } = renderIn(
      'app',
      <ResultField field={lines(COLLIDING)} value={[{ item: 'Pump', status: 'high_risk' }]} />,
    );
    expect(tooltipOf(container, 'high_risk')).toBe('high_risk');
  });

  it("keeps the payload's text for every other kind", () => {
    const { container } = renderIn(
      'app',
      <ResultField field={lines(STATUSES)} value={[{ item: 'pump_housing', status: 'USD' }]} />,
    );
    // An identifier-looking `text` value is not an enum, and is not worded.
    expect(tooltipOf(container, 'pump_housing')).toBe('pump_housing');
  });
});

describe('no other value changes with the presentation', () => {
  // The enum arm is the whole difference: a number and a text read the same
  // in both presentations.
  const review = record([number('total'), text('memo')]);
  const value = { total: 2116.2, memo: 'The unit price is **above** the order.' };

  it.each(['studio', 'app'] as const)('prints a number and a text as they came in %s', (mode) => {
    const { container } = renderIn(mode, <ResultField field={review} value={value} />);
    expect(screen.getByText('2116.2')).toBeTruthy();
    expect(screen.getByText(value.memo)).toBeTruthy();
    expect(container.querySelector('strong')).toBeNull();
  });
});

describe('only the rendering changes', () => {
  const review = record([choice('status', STATUSES), choice('risk', STATUSES)]);
  const value = { status: 'unit_price_differs_from_po', risk: 'HIGH_RISK' };

  function panel() {
    return renderIn('app', <StuffViewer field={review} value={value} name="review" />);
  }

  it('keeps the code on the JSON view', async () => {
    const { container } = panel();
    expect(screen.getByText('Unit price differs from po')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    const json = container.querySelector('pre')!.textContent!;
    expect(json).toBe(JSON.stringify(value, null, 2));
    expect(json).toContain('"status": "unit_price_differs_from_po"');
    expect(json).toContain('"risk": "HIGH_RISK"');
  });

  describe('the clipboard', () => {
    const writeText = vi.fn(() => Promise.resolve());
    beforeEach(() => {
      writeText.mockClear();
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
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
