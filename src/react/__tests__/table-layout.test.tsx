// @vitest-environment jsdom
/**
 * The opt-in table layout, `tableLayout="stack"`: a table of records that never
 * scrolls sideways.
 *
 * Without the option a table wider than its panel scrolls, which is right for a
 * builder's panel and wrong for a phone, so the layout is a host's choice and
 * the default renders exactly what it rendered before. With it, a table of up
 * to three columns stays a table and wraps, one of four to six becomes a block
 * of label and value pairs per row while its own container is narrower than
 * 640px, and one of more than six does so at every width.
 *
 * jsdom has no layout and no container queries, so this file pins the markup
 * the browser acts on: which elements carry the size container and the
 * stacking classes, which cells carry their column's label, and that nothing is
 * left that only a sideways scroll could reach. The `Outputs/Stacked tables`
 * stories measure the result in Chromium at 343px and 720px.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  ListRunField,
  NumberRunField,
  ObjectRunField,
  RunField,
  TextRunField,
} from '../../core';
import { FieldPresentationProvider } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { ResultEnvProvider } from '../result-env';
import { StuffViewer } from '../stuff-viewer';

const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const number = (name: string): NumberRunField => ({
  kind: 'number',
  name,
  conceptRef: 'native.Number',
  required: true,
  integer: false,
});
const record = (fields: RunField[]): ObjectRunField => ({
  kind: 'object',
  name: 'reading',
  conceptRef: 'demo.Reading',
  required: true,
  fields,
});
const list = (item: RunField): ListRunField => ({
  kind: 'list',
  name: 'readings',
  conceptRef: 'demo.Reading',
  required: true,
  item,
});

/** A record of `count` fields: a name, then numbers, so every column fits a cell whole. */
function columns(count: number): RunField[] {
  return [text('reference'), ...Array.from({ length: count - 1 }, (_, i) => number(`v${i + 1}`))];
}
function rowsOf(fields: readonly RunField[], count = 2): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, row) =>
    Object.fromEntries(
      fields.map((field, i) => [field.name, field.kind === 'text' ? `R-${row + 1}` : row + i]),
    ),
  );
}

function renderTable(
  fields: RunField[],
  options: { layout?: 'scroll' | 'stack'; budget?: number; app?: boolean } = {},
) {
  const field = list(record(fields));
  const viewer = (
    <StuffViewer
      field={field}
      value={rowsOf(fields)}
      {...(options.layout ? { tableLayout: options.layout } : {})}
    />
  );
  const withBudget =
    options.budget === undefined ? (
      viewer
    ) : (
      <ResultEnvProvider tableColumns={options.budget}>{viewer}</ResultEnvProvider>
    );
  return render(
    options.app ? (
      <FieldPresentationProvider presentation="app">{withBudget}</FieldPresentationProvider>
    ) : (
      withBudget
    ),
  );
}

/** The table's own box: the named group that holds it. */
const box = () => screen.getByRole('group', { name: 'Readings' });
const table = (container: HTMLElement) => container.querySelector('table') as HTMLTableElement;
const firstRow = (container: HTMLElement) =>
  container.querySelector('tbody tr') as HTMLTableRowElement;

describe('without the option', () => {
  it('keeps the scroller every host had, untouched', () => {
    const { container } = renderTable(columns(4));
    // A focusable, named scroller: the keyboard's way to the columns past the
    // fold. No size container, no stacking, no label inside a cell.
    expect(box().getAttribute('tabindex')).toBe('0');
    expect(box().className).toContain('overflow-x-auto');
    expect(box().className).not.toContain('@container');
    expect(table(container).className).not.toContain('block');
    for (const header of container.querySelectorAll('thead th')) {
      if (header.textContent !== DEFAULT_FIELD_STRINGS.rowDetailsColumn) {
        expect(header.className).toContain('whitespace-nowrap');
      }
    }
    for (const cell of firstRow(container).cells) {
      expect(cell.children).toHaveLength(1);
    }
  });

  it('renders the same markup as asking for the scroller by name', () => {
    const plain = renderTable(columns(5)).container.innerHTML;
    document.body.innerHTML = '';
    expect(renderTable(columns(5), { layout: 'scroll' }).container.innerHTML).toBe(plain);
  });
});

describe('tableLayout="stack"', () => {
  it('makes the table its own size container and drops the scroller from the tab order', () => {
    renderTable(columns(4), { layout: 'stack' });
    // The container query reads the table's own box, not the viewport: a
    // result panel beside a sidebar is narrow on a wide screen.
    expect(box().className).toContain('@container');
    // Nothing scrolls, so a tab stop would be a stop with nothing to do.
    expect(box().hasAttribute('tabindex')).toBe(false);
  });

  it('keeps a table of three columns a table at every width, wrapping above a share of the box', () => {
    const { container } = renderTable(columns(3), { layout: 'stack' });
    expect(table(container).className).not.toMatch(/(^|\s)(@max-\[640px\]:)?block(\s|$)/);
    for (const header of container.querySelectorAll('thead th')) {
      expect(header.className).not.toContain('whitespace-nowrap');
      expect(header.className).toContain('wrap-anywhere');
    }
    const values = [...firstRow(container).cells].map((cell) => {
      // The value alone: a table has headers, so a cell carries no label.
      expect(cell.children).toHaveLength(1);
      return cell.firstElementChild as HTMLElement;
    });
    for (const value of values) {
      // No fixed floor: the scroller's 16ch would push a narrow box sideways.
      expect(value.className).not.toContain('min-w-[16ch]');
      expect(value.className).not.toContain('truncate');
      expect(value.className).toContain('wrap-anywhere');
    }
    // The floor is a share of the box, capped in characters, and the record's
    // name gets the larger one so a word in it is not broken mid-way.
    const [name, ...others] = values;
    expect(name?.className).toContain('min-w-[min(16ch,28cqw)]');
    for (const value of others) {
      expect(value.className).toContain('min-w-[min(8ch,14cqw)]');
    }
  });

  it('stacks four to six columns while the container is narrower than 640px', () => {
    for (const count of [4, 6]) {
      const { container, unmount } = renderTable(columns(count), { layout: 'stack', budget: 6 });
      expect(table(container).className).toContain('@max-[640px]:block');
      expect(container.querySelector('thead')!.className).toContain('@max-[640px]:hidden');
      for (const cell of firstRow(container).cells) {
        expect(cell.className).toContain('@max-[640px]:grid');
        // The cell's own label, shown only once the header is gone.
        const label = cell.firstElementChild as HTMLElement;
        expect(label.className).toContain('hidden');
        expect(label.className).toContain('@max-[640px]:block');
      }
      unmount();
    }
  });

  it('stacks more than six columns at every width', () => {
    const { container } = renderTable(columns(7), { layout: 'stack', budget: 7 });
    expect(table(container).className).toMatch(/(^|\s)block(\s|$)/);
    expect(container.querySelector('thead')!.className).toMatch(/(^|\s)hidden(\s|$)/);
    for (const cell of firstRow(container).cells) {
      expect(cell.className).toMatch(/(^|\s)grid(\s|$)/);
      expect(cell.className).not.toContain('@max-[640px]');
      const label = cell.firstElementChild as HTMLElement;
      expect(label.className).toMatch(/(^|\s)block(\s|$)/);
      expect(label.className).not.toMatch(/(^|\s)hidden(\s|$)/);
    }
  });

  it('labels each stacked value with its column header, in the presentation the header uses', () => {
    const fields = [text('reference'), number('unit_price'), number('quantity'), number('total')];
    const { container } = renderTable(fields, { layout: 'stack', app: true });
    const labels = [...firstRow(container).cells].map(
      (cell) => (cell.firstElementChild as HTMLElement).textContent,
    );
    const headers = [...container.querySelectorAll('thead th')].map((th) => th.textContent);
    expect(labels).toEqual(['Reference', 'Unit price', 'Quantity', 'Total']);
    expect(labels).toEqual(headers);
  });

  it('counts the columns the table shows, after the budget', () => {
    // Twelve fields under the default budget of five: five columns, so the
    // table stacks only while narrow, and the row opens onto the rest.
    const { container } = renderTable(columns(12), { layout: 'stack' });
    expect(table(container).className).toContain('@max-[640px]:block');
    expect(table(container).className).not.toMatch(/(^|\s)block(\s|$)/);
    expect(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeTruthy();
  });

  it('opens a row onto the whole record without pinning it to a measured width', async () => {
    const { container } = renderTable(columns(12), { layout: 'stack' });
    await userEvent.click(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    );
    const detail = container.querySelector('td[colspan]') as HTMLElement;
    expect(detail.textContent).toContain('v11');
    // The scroller's width was pinned onto the detail so it stayed in view
    // while the columns scrolled. A table that fits has nothing to pin it to.
    const inner = detail.firstElementChild as HTMLElement;
    expect(inner.getAttribute('style')).toBeNull();
    expect(inner.className).not.toContain('sticky');
  });

  it('reaches a table nested inside an open row', async () => {
    const nested: ListRunField = { ...list(record(columns(4))), name: 'samples' };
    const outer = record([text('site'), nested]);
    render(
      <StuffViewer
        field={{ ...list(outer), name: 'sites' }}
        value={[{ site: 'Ridge', samples: rowsOf(columns(4)) }]}
        tableLayout="stack"
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    );
    const inner = screen.getByRole('group', { name: 'Samples' });
    expect(inner.className).toContain('@container');
    expect(inner.querySelector('table')!.className).toContain('@max-[640px]:block');
  });

  it('is offered on the provider too, and the panel’s own setting wins', () => {
    const fields = columns(4);
    const value = rowsOf(fields);
    const field = list(record(fields));
    const { rerender } = render(
      <ResultEnvProvider tableLayout="stack">
        <StuffViewer field={field} value={value} />
      </ResultEnvProvider>,
    );
    expect(box().className).toContain('@container');
    rerender(
      <ResultEnvProvider tableLayout="stack">
        <StuffViewer field={field} value={value} tableLayout="scroll" />
      </ResultEnvProvider>,
    );
    expect(box().className).not.toContain('@container');
    expect(box().getAttribute('tabindex')).toBe('0');
  });
});
