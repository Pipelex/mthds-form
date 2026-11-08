// @vitest-environment jsdom
/**
 * The opt-in table layout, `tableLayout="stack"`: a table of records that never
 * scrolls sideways.
 *
 * Without the option a table wider than its panel scrolls, which is right for a
 * builder's panel and wrong for a phone, so the layout is a host's choice and
 * the default renders exactly what it rendered before. With it, a table of up
 * to three columns stays a table and wraps (but for three whose rows open,
 * which are blocks on a phone), one of four to six becomes a block
 * of label and value pairs per row while its own container is narrower than
 * 640px, and one of more than six does so at every width.
 *
 * jsdom has no layout and no container queries, so this file pins the markup
 * the browser acts on: which elements carry the size container and the
 * stacking classes, which cells carry their column's label, and that nothing is
 * left that only a sideways scroll could reach. The `Outputs/Stacked tables`
 * stories measure the result in Chromium at 343px and 720px.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

  it('takes focus while its headers make the table wider than its box, and only then', () => {
    // jsdom lays nothing out, so the box's widths are what the browser would
    // measure when a box is too narrow for every header's longest word.
    const scroll = vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(340);
    const client = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(307);
    try {
      renderTable(columns(3), { layout: 'stack' });
      // The table scrolls inside its box, so the box is a place a keyboard
      // must reach.
      expect(box().getAttribute('tabindex')).toBe('0');
    } finally {
      scroll.mockRestore();
      client.mockRestore();
    }
  });

  it('keeps a table of three columns a table at every width, wrapping above a share of the box', () => {
    const { container } = renderTable(columns(3), { layout: 'stack' });
    expect(table(container).className).not.toMatch(/(^|\s)(@max-\[640px\]:)?block(\s|$)/);
    for (const header of container.querySelectorAll('thead th')) {
      // A header wraps between words, never inside one.
      expect(header.className).not.toContain('whitespace-nowrap');
      expect(header.className).toContain('wrap-normal');
      expect(header.className).not.toContain('wrap-anywhere');
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

  it('floors each value beside the name at its longest word, up to its share of the box', () => {
    const { container } = renderTable(columns(3), { layout: 'stack' });
    // The share is set once, on the table: two columns split what the name's
    // floor, the padding and the chevron, when there is one, leave.
    expect(table(container).className).toContain(
      '[--fit-share:calc((72cqw_-_4.5rem_-_var(--fit-chevron,0px))/2)]',
    );
    const [nameCell, ...otherCells] = [...firstRow(container).cells];
    // The name keeps its own floor and nothing more.
    expect(nameCell!.hasAttribute('data-fit')).toBe(false);
    expect(nameCell!.className).not.toContain('after:content-[attr(data-fit)]');
    // Every other value carries its own text for the floor to lay out.
    expect(otherCells.map((cell) => cell.getAttribute('data-fit'))).toEqual(['1', '2']);
    for (const cell of otherCells) {
      expect(cell.className).toContain('after:content-[attr(data-fit)]');
      expect(cell.className).toContain('after:max-w-[var(--fit-share,0px)]');
    }
    // A header needs no copy: its own words are its floor, since it never
    // breaks inside one, and no share caps them.
    for (const header of container.querySelectorAll('thead th')) {
      expect(header.hasAttribute('data-fit')).toBe(false);
      expect(header.className).not.toContain('after:content-[attr(data-fit)]');
    }
  });

  it('gives a table inside an open row none of the outer chevron', async () => {
    // An order's lines are a list of records, which no cell holds, so the
    // orders open; the lines are a name and a number, so they do not.
    const lines = { ...list(record([text('item'), number('qty')])), name: 'lines' };
    const orders = list(record([text('reference'), lines]));
    const { container } = render(
      <StuffViewer
        field={orders}
        value={[{ reference: 'O-1', lines: [{ item: 'pen', qty: 2 }] }]}
        tableLayout="stack"
      />,
    );
    const outer = table(container);
    expect(outer.className).toContain('[--fit-chevron:var(--expand-column,2rem)]');
    await userEvent.click(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    );
    const inner = outer.querySelector('table')!;
    expect(inner).toBeTruthy();
    // Set on the inner table itself: left unset, it would inherit the outer's.
    expect(inner.className).toContain('[--fit-chevron:0px]');
  });

  it('takes a chevron column from the share only when the rows open', () => {
    // A name and two numbers: every column fits a cell whole, so no row opens
    // and no chevron column is drawn, and none is taken from the share.
    const closed = renderTable(columns(3), { layout: 'stack' });
    expect(
      screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeNull();
    // Set to nothing rather than left unset: a custom property inherits, and
    // this table could be drawn inside an outer table's open row.
    expect(table(closed.container).className).toContain('[--fit-chevron:0px]');
    closed.unmount();
    // A column the budget hides: the rows open, and their chevron's width,
    // whichever the viewport gives it, is taken from the share.
    const open = renderTable(columns(4), { layout: 'stack', budget: 3 });
    expect(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeTruthy();
    expect(table(open.container).className).toContain('[--fit-chevron:var(--expand-column,2rem)]');
  });

  it('lets a studio header wrap after each underscore, between the words of its identifier', () => {
    const fields = [text('reference'), number('unit_price_differs'), number('quantity')];
    const { container } = renderTable(fields, { layout: 'stack' });
    const header = [...container.querySelectorAll('thead th')].find(
      (th) => th.textContent === 'unit_price_differs',
    )!;
    // A break after each underscore and none elsewhere, and the text as written.
    expect(header.querySelectorAll('wbr')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: 'unit_price_differs' })).toBe(header);
  });

  it('leaves an app header as it is, an authored title with an underscore included', () => {
    const fields = [
      text('reference'),
      { ...number('unit_price'), title: 'Unit price (EUR_HT)' },
      number('quantity'),
    ];
    const { container } = renderTable(fields, { layout: 'stack', app: true });
    expect(container.querySelector('thead wbr')).toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Unit price (EUR_HT)' })).toBeTruthy();
  });

  it('gives no word floor to a table that scrolls, or to one that is blocks at every width', () => {
    const scrolled = renderTable(columns(3));
    expect(scrolled.container.querySelector('[data-fit]')).toBeNull();
    expect(table(scrolled.container).className).not.toContain('--fit-share');
    scrolled.unmount();
    const blocks = renderTable(columns(7), { layout: 'stack', budget: 7 });
    expect(blocks.container.querySelector('[data-fit]')).toBeNull();
    expect(table(blocks.container).className).not.toContain('--fit-share');
  });

  it('stacks three columns whose rows open on a phone, and nowhere else', () => {
    // A column the budget hides: three shown, and the rows open onto the rest.
    const open = renderTable(columns(4), { layout: 'stack', budget: 3 });
    expect(table(open.container).className).toContain('max-sm:block');
    expect(open.container.querySelector('thead')!.className).toContain('max-sm:hidden');
    for (const cell of [...firstRow(open.container).cells].slice(1)) {
      expect(cell.className).toContain('max-sm:grid');
      const label = cell.firstElementChild as HTMLElement;
      expect(label.className).toContain('hidden');
      expect(label.className).toContain('max-sm:block');
    }
    // No container query: below `sm` every box is narrower than 640px.
    expect(table(open.container).className).not.toContain('@max-[640px]');
    open.unmount();
    // Three columns whose rows cannot open stay a table on a phone too.
    const closed = renderTable(columns(3), { layout: 'stack' });
    expect(table(closed.container).className).not.toContain('max-sm:block');
    expect(closed.container.querySelector('thead')!.className).toBe('');
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

  it('puts the description on a stacked label when the row cannot open', async () => {
    // Four bounded columns: nothing hidden, nothing clipped, so no row opens.
    // The header that carries a description is hidden once the table stacks,
    // so on a phone the label beside each value is the only place left to
    // reach it.
    const fields = [
      text('reference'),
      { ...number('unit_price'), description: 'Before tax' },
      number('quantity'),
      number('total'),
    ];
    const { container } = renderTable(fields, { layout: 'stack' });
    expect(
      screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeNull();
    // Nothing at rest, as on the header.
    expect(screen.queryByText('Before tax')).toBeNull();
    // Through focus, as the header's own description is asserted: a fact
    // reachable only by pointing is not reachable from a keyboard.
    within(firstRow(container)).getByText('unit_price').focus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Before tax');
  });

  it('keeps a stacked label plain when the row opens onto the described record', () => {
    // Twelve fields under the default budget of five: the row opens, and the
    // open record carries every description, so a label adds no tab stop.
    const fields = columns(12).map((field) =>
      field.name === 'v1' ? { ...field, description: 'Before tax' } : field,
    );
    const { container } = renderTable(fields, { layout: 'stack' });
    const label = within(firstRow(container)).getByText('v1');
    expect(label.closest('td')!.querySelector('[tabindex]')).toBeNull();
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

/**
 * A host that frames the result in a panel of its own says so with `framed`,
 * and a table then draws no outline of its own inside that panel: the panel
 * is the box, and a hairline box with its own radius inside it read as a box
 * in a box under every app style.
 */
describe('a table in a result the host frames', () => {
  const fields = columns(3);
  const viewer = (props: { framed?: boolean } = {}) => (
    <StuffViewer field={list(record(fields))} value={rowsOf(fields)} {...props} />
  );

  it('draws its hairline box when nothing says the host frames it', () => {
    render(viewer());
    expect(box().dataset.tableBox).toBe('box');
    expect(box().className).toContain('border');
  });

  it('drops its outline and keeps a corner for its header band when the panel says so', () => {
    render(viewer({ framed: true }));
    expect(box().dataset.tableBox).toBe('framed');
    expect(box().className.split(/\s+/)).not.toContain('border');
    expect(box().className).toContain('rounded-md');
  });

  it('takes the setting from the provider, the panel’s own winning', () => {
    const { unmount } = render(<ResultEnvProvider framed>{viewer()}</ResultEnvProvider>);
    expect(box().dataset.tableBox).toBe('framed');
    unmount();
    render(<ResultEnvProvider framed>{viewer({ framed: false })}</ResultEnvProvider>);
    expect(box().dataset.tableBox).toBe('box');
  });

  it('leaves a table inside an open row its own box, the outer table being what frames it', async () => {
    const lines = { ...list(record([text('item'), number('qty')])), name: 'lines' };
    const orders = list(record([text('reference'), lines]));
    const { container } = render(
      <StuffViewer
        field={orders}
        value={[{ reference: 'O-1', lines: [{ item: 'pen', qty: 2 }] }]}
        framed
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    );
    const boxes = [...container.querySelectorAll<HTMLElement>('[data-table-box]')];
    expect(boxes.map((b) => b.dataset.tableBox)).toEqual(['framed', 'box']);
  });
});
