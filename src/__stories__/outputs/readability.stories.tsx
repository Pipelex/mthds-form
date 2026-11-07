import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/readability';
import { PAYLOADS } from '../_generated/readability.payloads';
import {
  CONTRACTS as RESULT_CONTRACTS,
  OUTPUT_FORM as RESULT_OUTPUT_FORM,
} from '../_generated/results';
import { PAYLOADS as RESULT_PAYLOADS } from '../_generated/results.payloads';
import { PAYLOADS as COMPOSITE_PAYLOADS } from '../_generated/composites.payloads';
// The kernel's own wording, read as an oracle, from the core entry that
// exports it.
import { humanizeEnumValue } from '../../core';
import { DEFAULT_FIELD_STRINGS } from '../../react';
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
 * The invoice check is `src/__stories__/_structures/readability.mthds`, captured from one
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
  memo: string;
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

/** The memo's heading, read out of its Markdown source. */
function memoHeading(): string {
  const heading = /^#+ (.+)$/m.exec(CHECK.memo)?.[1];
  if (!heading) throw new Error('The memo holds no heading - re-read the fixture');
  return heading;
}

/**
 * A long `text` value in `app`: the memo, which the model wrote in Markdown,
 * takes the full width under its label and is typeset, its heading a heading
 * and its table a table. A short `text` value, the supplier, stays beside its
 * label as written.
 */
export const LongTextTypesetInApp: Story = {
  name: 'Long text typeset in app',
  args: { presentation: 'app' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { name: memoHeading() })).toHaveLength(BOTH_THEMES);
    await expect(canvasElement.textContent).not.toContain('## ');
    await expect(canvasElement.textContent).not.toContain('|---');
  },
};

/** The same memo in `studio`: the source the model wrote, as a builder reads it. */
export const LongTextAsWrittenInStudio: Story = {
  name: 'Long text as written in studio',
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading', { name: memoHeading() })).toBeNull();
    await expect(canvasElement.textContent).toContain(`## ${memoHeading()}`);
  },
};

/**
 * A launch report's executive summary, a `native.Text` member of a real
 * parallel run, which the model opened with its own heading. Shown here as the
 * whole result of a text pipe, the same concept, under the name a host gives it.
 */
const SUMMARY = (
  COMPOSITE_PAYLOADS['composites.launch_report'] as { executive_summary: { text: string } }
).executive_summary;

function summaryHeading(): string {
  const heading = /^#+ (.+)$/m.exec(SUMMARY.text)?.[1];
  if (!heading) throw new Error('The summary holds no heading - re-read the fixture');
  return heading;
}

/**
 * **A host-named text that opens with its own heading, in `app`.** The host
 * names the result `executive_summary`, and the text opens with its own
 * heading, so the title and the heading read as the same title twice. The
 * host's title gives way: it is said to assistive technology where it would
 * have stood, the heading opens the result, and the Download, alone, follows
 * the text.
 */
export const NamedTextThatNamesItself: Story = {
  name: 'A named text that opens with its own heading, in app',
  args: {
    contracts: RESULT_CONTRACTS,
    outputForm: RESULT_OUTPUT_FORM,
    domain: 'results',
    pipeCode: 'plain_text_result',
    value: SUMMARY,
    name: 'executive_summary',
    presentation: 'app',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headings = canvas.getAllByRole('heading', { name: summaryHeading() });
    await expect(headings).toHaveLength(BOTH_THEMES);
    // Said where the title would have stood, and not drawn.
    const said = canvas.getAllByText(/^Executive summary/);
    await expect(said).toHaveLength(BOTH_THEMES);
    for (const name of said) await expect(name.className).toContain('sr-only');
    const downloads = canvas.getAllByRole('button', { name: DEFAULT_FIELD_STRINGS.download });
    await expect(downloads).toHaveLength(BOTH_THEMES);
    // The text ends on a list, the same in each theme's pane, in document order.
    const items = canvas.getAllByRole('listitem');
    const perPane = items.length / BOTH_THEMES;
    for (const [index, download] of downloads.entries()) {
      // The heading opens the result, and the Download follows the whole text,
      // its last line included.
      const last = items[(index + 1) * perPane - 1]!;
      await expect(
        headings[index]!.compareDocumentPosition(download) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      await expect(
        last.compareDocumentPosition(download) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  },
};
