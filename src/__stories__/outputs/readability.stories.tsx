import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/readability';
import { PAYLOADS } from '../_generated/readability.payloads';
import {
  CONTRACTS as RESULT_CONTRACTS,
  OUTPUT_FORM as RESULT_OUTPUT_FORM,
} from '../_generated/results';
import { PAYLOADS as RESULT_PAYLOADS } from '../_generated/results.payloads';
import { humanizeEnumValue } from '../../react';
import { ResultView, itemsOf } from '../result-view';

/**
 * A result's ENUM values, in the two presentations - the pair is the point.
 *
 * `studio` is a builder's view, where a value has to match the bundle and the
 * JSON the builder reads next, so an enum value is its code. `app` is for a
 * person who has seen neither, so the code reads as words: a snake_case code
 * and an all-caps one alike, in a stacked row and in a table cell. An enum
 * value is the only value the two presentations show differently; every other
 * value on these pages renders the same in both.
 *
 * The invoice check is `data/structures/readability.mthds`, captured from one
 * real run. The two `results` stories below it take enums the existing corpus
 * already holds, whose `studio` renderings are `Outputs/Results`.
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
  status: string;
}

interface InvoiceCheck {
  verdict: string;
  risk: string;
  lines: CheckedLine[];
}

const CHECK = PAYLOADS['readability.invoice_check'] as InvoiceCheck;

/** The body of the table that holds the invoice's lines, found by its `status` column. */
function linesBody(canvasElement: HTMLElement, statusHeader: string): HTMLTableSectionElement {
  const table = within(canvasElement)
    .getAllByRole('table')
    .find((candidate) => within(candidate).queryByRole('columnheader', { name: statusHeader }));
  if (!table) throw new Error(`no table with a "${statusHeader}" column - re-read the fixture`);
  return (table as HTMLTableElement).tBodies[0] as HTMLTableSectionElement;
}

/**
 * `studio`: every enum value is its code, as the bundle declares it - the
 * snake_case verdict, the all-caps risk and each line's status.
 */
export const StudioEnumCodes: Story = {
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(CHECK.verdict)).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(CHECK.risk)).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(humanizeEnumValue(CHECK.verdict))).toBeNull();
    await expect(canvas.queryByText(humanizeEnumValue(CHECK.risk))).toBeNull();

    const [first] = CHECK.lines;
    const body = linesBody(canvasElement, 'status');
    await expect(within(body).getByText(first!.status)).toBeTruthy();
  },
};

/**
 * `app`: the same run with its enum values in words. The verdict, the
 * capitalised risk and every line's status read as sentence-case words, and
 * none of the codes reaches the page.
 */
export const AppEnumWords: Story = {
  args: { presentation: 'app' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(humanizeEnumValue(CHECK.verdict))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(humanizeEnumValue(CHECK.risk))).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(CHECK.verdict)).toBeNull();
    await expect(canvas.queryByText(CHECK.risk)).toBeNull();

    const [first] = CHECK.lines;
    const body = linesBody(canvasElement, 'Status');
    await expect(within(body).getByText(humanizeEnumValue(first!.status))).toBeTruthy();
    await expect(body.textContent).not.toContain(first!.status);
  },
};

/**
 * The milestone plan from `Outputs/Results`, in `app`: every status in the
 * table reads as words.
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
 * Every scalar kind from `Outputs/Results`, in `app`: the priority, the one
 * enum among them, reads as words.
 */
export const EveryKindInApp: Story = {
  name: 'Every kind in app',
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
    const value = RESULT_PAYLOADS['results.every_kind_result'] as { priority: string };
    await expect(canvas.getAllByText(humanizeEnumValue(value.priority))).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(value.priority)).toBeNull();
  },
};
