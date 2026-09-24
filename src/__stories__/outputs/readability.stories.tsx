import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/readability';
import { PAYLOADS } from '../_generated/readability.payloads';
import {
  CONTRACTS as RESULT_CONTRACTS,
  OUTPUT_FORM as RESULT_OUTPUT_FORM,
} from '../_generated/results';
import { PAYLOADS as RESULT_PAYLOADS } from '../_generated/results.payloads';
import { DEFAULT_FIELD_STRINGS, humanizeEnumValue } from '../../react';
import { ResultView, itemsOf } from '../result-view';

/**
 * A result's VALUES, in the two presentations - the pair is the point.
 *
 * `studio` is a builder's view, where a value has to match the bundle and the
 * JSON the builder reads next, so an enum is its code and a number is printed
 * as it arrived. `app` is for a person who has seen neither: the code reads as
 * words and the number is grouped, with bounded decimals. In BOTH, a `text`
 * field the descriptor does not bound to a cell is typeset as Markdown, except
 * in a table cell - and a one-line `text` value still ends at the right edge
 * of its column beside its label, exactly as it did before anything was
 * typeset.
 *
 * The invoice check is `data/structures/readability.mthds`, captured from one
 * real run: a model filled a plain `text` field with a heading, a paragraph and
 * a table because the method asked it to, which is what methods do. The two
 * `results` stories below it take enums and numbers the existing corpus already
 * holds, whose `studio` renderings are `Outputs/Results`.
 *
 * The assertions read their expected values out of the payload rather than
 * naming them, for the reason `Outputs/Results` gives: a re-captured run may
 * answer differently, and the renderer is what is under test.
 */

const meta = {
  title: 'Outputs/Readability',
  component: ResultView,
  parameters: { layout: 'fullscreen' },
  args: {
    contracts: CONTRACTS,
    outputForm: OUTPUT_FORM,
    domain: 'readability',
    pipeCode: 'invoice_check',
    value: PAYLOADS['readability.invoice_check'],
    maxWidth: 640,
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

interface CheckedLine {
  item: string;
  unit_price: number;
  status: string;
  note: string;
}

interface InvoiceCheck {
  supplier: string;
  verdict: string;
  risk: string;
  amount_due: number;
  price_variance: number;
  memo: string;
  lines: CheckedLine[];
}

const CHECK = PAYLOADS['readability.invoice_check'] as InvoiceCheck;

/**
 * An oracle for the number rule, written out here rather than imported: the
 * story checks the kernel against the rule as stated, not against itself.
 */
function inWords(value: number): string {
  const options: Intl.NumberFormatOptions = Number.isInteger(value)
    ? { maximumFractionDigits: 0 }
    : Math.abs(value) >= 1
      ? { maximumFractionDigits: 2 }
      : { maximumSignificantDigits: 3 };
  return new Intl.NumberFormat('en-US', options).format(value);
}

/** The memo's heading, as the run wrote it. */
function memoHeading(): string {
  const heading = /^#{1,6}\s+(.+)$/m.exec(CHECK.memo)?.[1];
  if (!heading) throw new Error('the captured memo has no heading - re-read the fixture');
  return heading;
}

/**
 * The memo is TYPESET: its heading is a heading and its table a table, and no
 * `#` or `|` reaches the reader. The same in both presentations.
 */
async function expectTypesetMemo(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('heading', { name: memoHeading() })).toHaveLength(BOTH_THEMES);
  // Found by its LAST header, which the lines table beside it does not share.
  const headerRow = CHECK.memo.split('\n').find((line) => line.trim().startsWith('|')) ?? '';
  const lastHeader = headerRow
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)
    .pop();
  const memoTables = canvas
    .getAllByRole('table')
    .filter((table) => within(table).queryByRole('columnheader', { name: lastHeader }));
  await expect(memoTables).toHaveLength(BOTH_THEMES);
  await expect(canvasElement.textContent).not.toMatch(/(^|\s)##\s/);
  await expect(canvasElement.textContent).not.toContain('|---');
}

/**
 * A one-line `text` value still ends at the right edge of its column: it is
 * the inline run it always was, not a block that fills the column.
 */
async function expectFlushRight(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const value = canvas.getAllByText(CHECK.supplier)[0] as HTMLElement;
  await expect(value.tagName).toBe('SPAN');
  const cell = value.parentElement?.parentElement as HTMLElement;
  await expect(
    Math.abs(value.getBoundingClientRect().right - cell.getBoundingClientRect().right),
  ).toBeLessThanOrEqual(1);
  await expect(value.getBoundingClientRect().width).toBeLessThan(
    cell.getBoundingClientRect().width,
  );
}

/**
 * `studio`: the codes as the bundle declares them, the numbers as the run
 * returned them, and the memo typeset.
 */
export const Studio: Story = {
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(CHECK.verdict)).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(CHECK.risk)).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(humanizeEnumValue(CHECK.verdict))).toBeNull();
    await expect(canvas.getAllByText(String(CHECK.amount_due))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(String(CHECK.price_variance))).toHaveLength(BOTH_THEMES);
    await expectTypesetMemo(canvasElement);
    await expectFlushRight(canvasElement);
  },
};

/**
 * `app`: the same run in words. The verdict, the capitalised risk and every
 * line's status read as sentence-case words, the amount is grouped and the
 * fraction keeps its significant digits. A line's Markdown note is plain in
 * its cell, where the point is one line, and typeset once the row is opened.
 */
export const App: Story = {
  args: { presentation: 'app' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(humanizeEnumValue(CHECK.verdict))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(humanizeEnumValue(CHECK.risk))).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(CHECK.verdict)).toBeNull();
    await expect(canvas.queryByText(CHECK.risk)).toBeNull();
    await expect(canvas.getAllByText(inWords(CHECK.amount_due))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(inWords(CHECK.price_variance))).toHaveLength(BOTH_THEMES);
    await expectTypesetMemo(canvasElement);
    await expectFlushRight(canvasElement);

    // The lines table: statuses in words, and the note plain in its cell.
    const [first] = CHECK.lines;
    const table = canvas
      .getAllByRole('table')
      .find((candidate) => within(candidate).queryByRole('columnheader', { name: 'Status' }));
    const body = (table as HTMLTableElement).tBodies[0] as HTMLTableSectionElement;
    await expect(within(body).getByText(humanizeEnumValue(first!.status))).toBeTruthy();
    await expect(body.textContent).not.toContain(first!.status);
    await expect(within(body).getByText(first!.note)).toBeTruthy();

    // Opened, the row is the record, and the note in it is typeset.
    const [toggle] = within(table as HTMLElement).getAllByRole('button', {
      name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1),
    });
    await userEvent.click(toggle!);
    const bold = /\*\*(.+?)\*\*/.exec(first!.note)?.[1] ?? '';
    await expect(
      [...body.querySelectorAll('td[colspan] strong')].map((node) => node.textContent),
    ).toContain(bold);
  },
};

/**
 * The milestone plan from `Outputs/Results`, in `app`: every status in the
 * table reads as words, and the week column is unchanged, because an integer
 * below a thousand has nothing to group.
 */
export const MilestonesInWords: Story = {
  name: 'Milestones in words',
  args: {
    contracts: RESULT_CONTRACTS,
    outputForm: RESULT_OUTPUT_FORM,
    domain: 'results',
    pipeCode: 'long_list_result',
    value: RESULT_PAYLOADS['results.long_list_result'],
    presentation: 'app',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const milestones = itemsOf(RESULT_PAYLOADS['results.long_list_result']) as {
      status: string;
    }[];
    for (const status of new Set(milestones.map((milestone) => milestone.status))) {
      await expect(canvas.getAllByText(humanizeEnumValue(status)).length).toBeGreaterThanOrEqual(
        BOTH_THEMES,
      );
    }
    await expect(canvas.queryByText('in_progress')).toBeNull();
  },
};

/**
 * Every scalar kind from `Outputs/Results`, in `app`: the priority in words,
 * the ratio below 1 with its significant digits, and the whole number as it is.
 */
export const EveryKindInWords: Story = {
  name: 'Every kind in words',
  args: {
    contracts: RESULT_CONTRACTS,
    outputForm: RESULT_OUTPUT_FORM,
    domain: 'results',
    pipeCode: 'every_kind_result',
    value: RESULT_PAYLOADS['results.every_kind_result'],
    presentation: 'app',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = RESULT_PAYLOADS['results.every_kind_result'] as {
      priority: string;
      ratio: number;
      quantity: number;
    };
    await expect(canvas.getAllByText(humanizeEnumValue(value.priority))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(inWords(value.ratio))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(inWords(value.quantity))).toHaveLength(BOTH_THEMES);
  },
};
