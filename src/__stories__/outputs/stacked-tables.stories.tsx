import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CONTRACTS as LISTS, OUTPUT_FORM as LISTS_FORM } from '../_generated/lists';
import { PAYLOADS as LIST_RUNS } from '../_generated/lists.payloads';
import { CONTRACTS as RESULTS, OUTPUT_FORM as RESULTS_FORM } from '../_generated/results';
import { PAYLOADS as RESULT_RUNS } from '../_generated/results.payloads';
import { CONTRACTS as TABLES, OUTPUT_FORM as TABLES_FORM } from '../_generated/tables';
import { PAYLOADS as TABLE_RUNS } from '../_generated/tables.payloads';
import { DEFAULT_FIELD_STRINGS } from '../../react';
import { ResultView, itemsOf } from '../result-view';
import { REPORT } from './media-payloads';

/**
 * Record tables under `tableLayout="stack"`, the layout a host opts into for a
 * reader on a phone, where nothing may scroll sideways.
 *
 * | The table shows… | At 343px | At 720px |
 * | --- | --- | --- |
 * | up to three columns | a table, wrapping | a table, wrapping |
 * | four to six columns | one block of label and value pairs per row | a table, wrapping |
 * | more than six columns | blocks | blocks |
 *
 * 343px is what a 375px phone leaves inside 16px gutters, and 720px a result
 * column on a desktop. The width is the table's own box, read by a container
 * query, so each story pins the panel to it exactly rather than leaving it to
 * whatever the runner's viewport gives.
 *
 * Every story asserts the one promise first, in a browser because jsdom lays
 * nothing out: no table's box is wider inside than out. Then it asserts which
 * of the two shapes the table took, from computed styles, since a class name
 * says what was asked for and only the browser says what the container query
 * answered.
 *
 * Every payload is a real run, or a real run's rows sliced, except the file
 * case's, which `media-payloads.ts` supplies for the reason it gives.
 */

const meta = {
  title: 'Outputs/Stacked tables',
  component: ResultView,
  args: {
    contracts: TABLES,
    outputForm: TABLES_FORM,
    domain: 'tables',
    tableLayout: 'stack',
    presentation: 'app',
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;
/** What a 375px phone leaves inside 16px gutters. */
const PHONE = 343;
/** A result column on a desktop. */
const COLUMN = 720;

const lists = { contracts: LISTS, outputForm: LISTS_FORM, domain: 'lists' };
const results = { contracts: RESULTS, outputForm: RESULTS_FORM, domain: 'results' };

function tablesIn(canvasElement: HTMLElement): HTMLTableElement[] {
  return [...canvasElement.querySelectorAll('table')];
}

/** The promise the layout makes: no table's box scrolls, and nothing in it pokes out. */
async function expectNothingScrollsSideways(canvasElement: HTMLElement) {
  const tables = tablesIn(canvasElement);
  await expect(tables.length).toBeGreaterThan(0);
  for (const table of tables) {
    const box = table.parentElement as HTMLElement;
    await expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
    const right = box.getBoundingClientRect().right;
    for (const cell of table.querySelectorAll('td, th')) {
      if (getComputedStyle(cell).display === 'none') continue;
      await expect(cell.getBoundingClientRect().right).toBeLessThanOrEqual(right + 0.5);
    }
  }
}

/** A row's value cells: every cell but the chevron's, whose own child is the toggle. */
function valueCells(row: HTMLTableRowElement): HTMLTableCellElement[] {
  return [...row.cells].filter((cell) => !cell.querySelector(':scope > button'));
}

/** The header row's column names, without the chevron column's hidden one. */
function headerNames(table: HTMLTableElement): string[] {
  return [...table.tHead!.rows[0]!.cells]
    .map((cell) => cell.textContent ?? '')
    .filter((name) => name !== DEFAULT_FIELD_STRINGS.rowDetailsColumn);
}

async function expectTable(table: HTMLTableElement, columns: number) {
  await expect(getComputedStyle(table).display).toBe('table');
  await expect(getComputedStyle(table.tHead!).display).toBe('table-header-group');
  await expect(headerNames(table)).toHaveLength(columns);
  for (const row of table.tBodies[0]!.rows) {
    for (const cell of valueCells(row)) {
      // A table carries its labels in its header, so no cell shows one: a
      // table that would stack while narrow keeps its labels, hidden.
      for (const label of [...cell.children].slice(0, -1)) {
        await expect(getComputedStyle(label).display).toBe('none');
      }
    }
  }
}

async function expectStacked(table: HTMLTableElement, columns: number) {
  await expect(getComputedStyle(table).display).toBe('block');
  await expect(getComputedStyle(table.tHead!).display).toBe('none');
  const names = headerNames(table);
  await expect(names).toHaveLength(columns);
  for (const row of table.tBodies[0]!.rows) {
    await expect(getComputedStyle(row).display).toBe('block');
    const cells = valueCells(row);
    // The row's pairs, labelled by the header they replace, in its order.
    await expect(cells.map((cell) => cell.firstElementChild!.textContent)).toEqual(names);
    for (const cell of cells) {
      await expect(getComputedStyle(cell).display).toBe('grid');
      await expect(getComputedStyle(cell.firstElementChild!).display).toBe('block');
    }
  }
}

// ─── Up to three columns: a table ────────────────────────────────────────────

/** A checklist of three short columns, on a phone: still a table, header and all. */
export const ThreeColumnsPhone: Story = {
  name: 'Three columns, 343px → a table',
  args: { ...lists, pipeCode: 'steps', value: LIST_RUNS['lists.steps'], width: PHONE },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectTable(table, 3);
  },
};

/** The same checklist in a desktop column: the table it always was. */
export const ThreeColumnsColumn: Story = {
  name: 'Three columns, 720px → a table',
  args: { ...lists, pipeCode: 'steps', value: LIST_RUNS['lists.steps'], width: COLUMN },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectTable(table, 3);
  },
};

/**
 * **Three columns of full sentences, on a phone.** A services contract's
 * clauses, under a budget of three: the subject, the obligation and the
 * exception. Headers and cells wrap with no fixed floor, so the three fit the
 * 343px, and a cell shows three lines of its sentence with the row opening onto
 * the rest. No column is squeezed into a ribbon beside a longer one.
 */
export const ThreeLongColumnsPhone: Story = {
  name: 'Three long columns, 343px → a table that wraps',
  args: {
    pipeCode: 'clauses',
    value: TABLE_RUNS['tables.clauses'],
    tableColumns: 3,
    width: PHONE,
  },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) {
      await expectTable(table, 3);
      for (const cell of valueCells(table.tBodies[0]!.rows[0]!)) {
        // A share of the box each, not one letter a line.
        await expect(cell.getBoundingClientRect().width).toBeGreaterThan(PHONE / 6);
      }
    }
    // Opening a row shows the whole clause, the column the budget left out
    // included.
    const canvas = within(canvasElement);
    const [toggle] = canvas.getAllByRole('button', {
      name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1),
    });
    await userEvent.click(toggle!);
    const first = itemsOf(TABLE_RUNS['tables.clauses'])[0] as { remedy: string };
    await waitFor(() => expect(canvas.getByText(first.remedy)).toBeTruthy());
    await expectNothingScrollsSideways(canvasElement);
  },
};

// ─── Long English and French text ────────────────────────────────────────────

/**
 * **The same contract in French, four columns, on a phone.** Four columns stack
 * below 640px: each clause becomes one block, its four parts labelled by the
 * headers they replace. French runs longer than English and its words do too
 * ("réciproquement", "confidentialité"), which is what a value that wraps
 * anywhere has to absorb without pushing its line wider than the block.
 */
export const FrenchPhone: Story = {
  name: 'Long French text, four columns, 343px → blocks',
  args: { pipeCode: 'clauses_fr', value: TABLE_RUNS['tables.clauses_fr'], width: PHONE },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    const tables = tablesIn(canvasElement);
    await expect(tables).toHaveLength(BOTH_THEMES);
    for (const table of tables) await expectStacked(table, 4);
  },
};

/** The French clauses in a desktop column: four columns are a table from 640px. */
export const FrenchColumn: Story = {
  name: 'Long French text, four columns, 720px → a table that wraps',
  args: { pipeCode: 'clauses_fr', value: TABLE_RUNS['tables.clauses_fr'], width: COLUMN },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectTable(table, 4);
  },
};

/** The English clauses, four columns, on a phone: blocks, as the French. */
export const EnglishPhone: Story = {
  name: 'Long English text, four columns, 343px → blocks',
  args: { pipeCode: 'clauses', value: TABLE_RUNS['tables.clauses'], width: PHONE },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectStacked(table, 4);
  },
};

// ─── Four to six columns: blocks while narrow ────────────────────────────────

/**
 * **Six columns of instrument readings, on a phone**, under a budget of six and
 * in the builder's own identifiers, the harder labels to fit. Six columns are
 * blocks below 640px; the row still opens onto the six fields the budget left
 * out.
 */
export const SixColumnsPhone: Story = {
  name: 'Six columns, 343px → blocks',
  args: {
    ...lists,
    pipeCode: 'readings',
    value: LIST_RUNS['lists.readings'],
    tableColumns: 6,
    presentation: 'studio',
    width: PHONE,
  },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectStacked(table, 6);
  },
};

/** The same six columns in a desktop column: a table from 640px, wrapping to fit. */
export const SixColumnsColumn: Story = {
  name: 'Six columns, 720px → a table',
  args: {
    ...lists,
    pipeCode: 'readings',
    value: LIST_RUNS['lists.readings'],
    tableColumns: 6,
    presentation: 'studio',
    width: COLUMN,
  },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectTable(table, 6);
  },
};

/** What the wire says each column of the link checker means, in the order the table shows them. */
function linkDescriptions(): string[] {
  const { field } = TABLES_FORM['tables.links']!;
  if (field.kind !== 'list' || field.item.kind !== 'object') {
    throw new Error('tables.links is a list of records');
  }
  return field.item.fields.map((column) => column.description ?? '');
}

/**
 * **A record whose rows cannot open, on a phone.** A link checker's four
 * columns are an address, which wraps whole, and three values that fit a cell
 * whole, so no row has more to show and no row opens. Four columns stack below
 * 640px, which hides the header and the descriptions it carries, so each label
 * in a block carries its column's description instead, on hover and on focus.
 */
export const DescribedLabelsPhone: Story = {
  name: 'Rows that cannot open, 343px → descriptions on the labels',
  args: { pipeCode: 'links', value: TABLE_RUNS['tables.links'], width: PHONE },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    const canvas = within(canvasElement);
    await expect(
      canvas.queryAllByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toHaveLength(0);
    const [table] = tablesIn(canvasElement);
    await expectStacked(table!, 4);
    const descriptions = linkDescriptions();
    await expect(descriptions.every((description) => description !== '')).toBe(true);
    // The last label of the first block: focus reaches it, and the tooltip
    // says what the column means.
    const label = valueCells(table!.tBodies[0]!.rows[0]!)[3]!.firstElementChild!
      .firstElementChild as HTMLElement;
    label.focus();
    await expect(document.activeElement).toBe(label);
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(tooltip).toHaveTextContent(descriptions[3]!);
  },
};

// ─── More than six columns: blocks at every width ────────────────────────────

/** Seven columns in a desktop column: about ninety pixels each would be a column of broken words. */
export const SevenColumnsColumn: Story = {
  name: 'Seven columns, 720px → blocks',
  args: {
    ...lists,
    pipeCode: 'readings',
    value: LIST_RUNS['lists.readings'],
    tableColumns: 7,
    presentation: 'studio',
    width: COLUMN,
  },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectStacked(table, 7);
  },
};

/** Every one of the twelve columns, for a host that lifts the budget: blocks, at a desktop's width. */
export const TwelveColumnsColumn: Story = {
  name: 'Twelve columns, 720px → blocks',
  args: {
    ...lists,
    pipeCode: 'readings',
    value: LIST_RUNS['lists.readings'],
    tableColumns: Infinity,
    presentation: 'studio',
    width: COLUMN,
  },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) await expectStacked(table, 12);
  },
};

// ─── Edges ───────────────────────────────────────────────────────────────────

/**
 * **Fifteen milestones of a project plan, on a phone**: fifteen blocks, each
 * divided from the next by the hairline a table row carries.
 */
export const ManyRowsPhone: Story = {
  name: 'Many rows, 343px → a block each',
  args: {
    ...results,
    pipeCode: 'long_list_result',
    value: RESULT_RUNS['results.long_list_result'],
    width: PHONE,
  },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    const rows = itemsOf(RESULT_RUNS['results.long_list_result']);
    await expect(rows.length).toBeGreaterThan(10);
    for (const table of tablesIn(canvasElement)) {
      await expectStacked(table, 4);
      await expect(table.tBodies[0]!.rows).toHaveLength(rows.length);
    }
  },
};

/** No rows: the sentence a list without entries always says, and no table to stack. */
export const EmptyPhone: Story = {
  name: 'An empty list, 343px → the empty sentence',
  args: { ...lists, pipeCode: 'steps', value: { items: [] }, width: PHONE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(tablesIn(canvasElement)).toHaveLength(0);
    await expect(canvas.getAllByText(DEFAULT_FIELD_STRINGS.noItemsYet)).toHaveLength(BOTH_THEMES);
  },
};

/**
 * **A file in a cell, on a phone.** A report's figures are a table of a caption
 * and a picture, and the picture's cell keeps the kernel's thumbnail, linked to
 * the file, at any width.
 */
export const FileCellPhone: Story = {
  name: 'A file cell, 343px → its thumbnail, in a table',
  args: { ...results, pipeCode: 'nested_media_result', value: REPORT, width: PHONE },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    for (const table of tablesIn(canvasElement)) {
      await expectTable(table, 2);
      await expect(table.querySelectorAll('tbody img')).toHaveLength(REPORT.figures.length);
    }
  },
};

/**
 * **A nested field, on a phone.** A company's divisions are four columns, one of
 * them its teams, which a cell can only count, so they stack. Opening a division
 * shows its record, and its teams are four columns of their own, one of them a
 * paragraph: the nested table queries its own box, narrower still, and stacks
 * too.
 */
export const NestedPhone: Story = {
  name: 'A nested field, 343px → blocks inside blocks',
  args: {
    ...results,
    pipeCode: 'deep_result',
    value: RESULT_RUNS['results.deep_result'],
    width: PHONE,
  },
  play: async ({ canvasElement }) => {
    await expectNothingScrollsSideways(canvasElement);
    const [outer] = tablesIn(canvasElement);
    await expectStacked(outer!, 4);
    // The light theme's table: open its first division.
    await userEvent.click(
      within(outer!).getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    );
    await waitFor(() => expect(outer!.querySelectorAll('table')).toHaveLength(1));
    const inner = outer!.querySelector('table') as HTMLTableElement;
    await expectStacked(inner, 4);
    await expectNothingScrollsSideways(canvasElement);
  },
};
