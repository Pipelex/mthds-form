import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type { OutputForm, PipeIOContracts } from '../../core';
import { ResultView } from '../result-view';
import RUN from './cv-screening.run.json';

/**
 * A CV screening report, as a real run returned it.
 *
 * Like `ledger.stories.tsx`, this is an exception to the generated corpus, and
 * for the same reason: faults were reported against THIS result, rendered by a
 * method app, and none of the generated cases carries its shape. Unlike the
 * ledger, nothing here is rebuilt by hand. `cv-screening.run.json` holds the
 * run's main output exactly as `GET /v1/runs/{id}/results` returned it, beside
 * the output descriptor and the IO contract the method app generated for the
 * same bundle; the run id is in the file. The candidates, the company and the
 * CVs behind them are fictional, written for the method's test corpus.
 *
 * What it pins:
 *
 *   1. A paragraph held by an unbounded `text` field (`role_summary`) reads left
 *      to right inside its column, every line starting at the same edge. It was
 *      right-aligned beside its label, with a ragged left edge on every line.
 *   2. A one-line value beside it (`company_name`) still ends at the right edge.
 *   3. A nested record in a table cell is named, not printed: the Evaluation
 *      column shows the candidate's name and the rejection email column its
 *      subject, where both showed their JSON.
 */

const DOMAIN = 'cv_screening';
const PIPE = 'screen_candidates';

const meta = {
  title: 'Outputs/Screening',
  component: ResultView,
  parameters: { layout: 'fullscreen' },
  args: {
    contracts: RUN.pipe_io_contracts as unknown as PipeIOContracts,
    outputForm: RUN.output_form as unknown as OutputForm,
    domain: DOMAIN,
    pipeCode: PIPE,
    value: RUN.value,
    maxWidth: 640,
    presentation: 'app',
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Where each line a text wraps onto starts, left to right.
 *
 * A range reports more than one box per line: under `pre-wrap` the space that
 * hangs at a line's end gets a box of its own, out at the right. So the boxes
 * are grouped by the line they sit on, and each line starts at its leftmost.
 */
function lineStarts(element: HTMLElement): number[] {
  const range = document.createRange();
  range.selectNodeContents(element);
  const lines = new Map<number, number>();
  for (const box of range.getClientRects()) {
    const top = Math.round(box.top);
    lines.set(top, Math.min(lines.get(top) ?? Infinity, Math.round(box.left)));
  }
  return [...lines.values()];
}

/**
 * At the width a method app gives its result: the scorecard's summary wraps
 * over several lines, and the candidates table is wider than the panel.
 */
export const AScreeningReport: Story = {
  name: 'A screening report',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The harness renders every story twice, light beside dark - one is enough.
    const summary = canvas.getAllByText(/^Northwind Freight is seeking/)[0] as HTMLElement;
    const starts = lineStarts(summary);
    await expect(starts.length).toBeGreaterThan(1);
    await expect(Math.max(...starts) - Math.min(...starts)).toBeLessThanOrEqual(1);

    // A short value still shares its label's line and ends at the column's edge.
    const company = canvas.getAllByText('Northwind Freight')[0] as HTMLElement;
    const cell = company.parentElement?.parentElement as HTMLElement;
    await expect(
      Math.abs(company.getBoundingClientRect().right - cell.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);

    const tables = canvas.getAllByRole('table');
    const candidates = tables.find((table) =>
      within(table).queryByRole('columnheader', { name: 'Evaluation' }),
    ) as HTMLTableElement;
    const body = candidates.tBodies[0] as HTMLTableSectionElement;
    await expect(within(body).getByText('Amara Okafor')).toBeTruthy();
    const subject = RUN.value.candidates[1]?.rejection_email?.subject as string;
    await expect(within(body).getByText(subject)).toBeTruthy();
    await expect(body.textContent).not.toContain('{');
  },
};
