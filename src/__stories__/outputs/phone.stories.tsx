import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CONTRACTS as RESULTS, OUTPUT_FORM as RESULTS_FORM } from '../_generated/results';
import { PAYLOADS as RESULT_RUNS } from '../_generated/results.payloads';
import { DEFAULT_FIELD_STRINGS as S } from '../../react';
import { ResultView } from '../result-view';
import { atWidth, expectTouchTarget, pinnedTo } from '../touch-target';
import { REPORT } from './media-payloads';

/**
 * The result view's controls on a phone, and the same controls on a desktop.
 *
 * Below the `sm` breakpoint every control a finger has to hit is given at
 * least 44 by 44 pixels: a text's copy button, a file's link, its copy and
 * download buttons, a document's Preview and a table row's chevron. Each grows
 * where it stands, because each sits in a row beside other controls or in a
 * box that clips, where an invisible area would land on its neighbour or be
 * cut off. From `sm` up nothing moves, which the desktop stories hold to the
 * sizes the controls always had.
 *
 * The phone stories pin a 375px viewport; the two theme panes then stack, and
 * each keeps the 24px gutters of a host's page, so the panel is 327px wide.
 */

const meta = {
  title: 'Outputs/On a Phone',
  component: ResultView,
  args: {
    contracts: RESULTS,
    outputForm: RESULTS_FORM,
    domain: 'results',
    tableLayout: 'stack',
    presentation: 'app',
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

const report = { pipeCode: 'nested_media_result', value: REPORT };
const text = { pipeCode: 'plain_text_result', value: RESULT_RUNS['results.plain_text_result'] };
const milestones = {
  pipeCode: 'long_list_result',
  value: RESULT_RUNS['results.long_list_result'],
};

/**
 * The file controls of the report, in both theme panes: the source document's
 * link, its copy and download buttons and its Preview, and the summary page's
 * download button.
 */
function reportControls(canvasElement: HTMLElement): HTMLElement[] {
  const canvas = within(canvasElement);
  return [
    ...canvas.getAllByRole('link', { name: REPORT.source.filename }),
    ...canvas.getAllByRole('button', { name: S.copyUrl }),
    ...canvas.getAllByRole('button', { name: /^Download .+\.(pdf|html)$/ }),
    ...canvas.getAllByRole('button', { name: S.preview }),
  ];
}

/** Every row chevron in the canvas: the ones whose label `toggleRowDetails` wrote. */
function rowToggles(canvasElement: HTMLElement): HTMLElement[] {
  return within(canvasElement)
    .getAllByRole('button')
    .filter((button) => {
      const label = button.getAttribute('aria-label') ?? '';
      const index = /\d+$/.exec(label)?.[0];
      return index !== undefined && label === S.toggleRowDetails(Number(index));
    });
}

/** A control's box, rounded to whole pixels. */
function sizeOf(control: Element): { width: number; height: number } {
  const { width, height } = control.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
}

/** Nothing in any result panel reaches past the panel's right edge. */
async function expectNoSidewaysScroll(canvasElement: HTMLElement) {
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  for (const box of canvasElement.querySelectorAll<HTMLElement>('[role="group"]')) {
    await expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
  }
}

// ─── A report ────────────────────────────────────────────────────────────────

/**
 * **A report with a source document and figures, on a phone.** The document's
 * link, its copy and download buttons and its Preview, the summary's download
 * button and each figure row's chevron are 44 pixels square or more, and a tap
 * at each edge of each one lands on it.
 */
export const ReportPhone: Story = {
  name: 'A report with a document, phone',
  ...pinnedTo('phone'),
  args: report,
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectNoSidewaysScroll(canvasElement);
    const controls = reportControls(canvasElement);
    // The link, copy URL, two downloads and Preview, in each theme.
    await expect(controls).toHaveLength(2 * 5);
    const toggles = rowToggles(canvasElement);
    await expect(toggles).toHaveLength(2 * REPORT.figures.length);
    for (const control of [...controls, ...toggles]) await expectTouchTarget(control);
  },
};

/** The same report on a desktop: every control the size it always was. */
export const ReportDesktop: Story = {
  name: 'A report with a document, desktop',
  ...pinnedTo('desktop'),
  args: report,
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    const canvas = within(canvasElement);
    const small = [
      ...canvas.getAllByRole('button', { name: S.copyUrl }),
      ...canvas.getAllByRole('button', { name: /^Download .+\.(pdf|html)$/ }),
    ];
    for (const control of small) await expect(sizeOf(control)).toEqual({ width: 18, height: 18 });
    for (const link of canvas.getAllByRole('link', { name: REPORT.source.filename })) {
      await expect(sizeOf(link).height).toBeLessThan(20);
    }
    for (const preview of canvas.getAllByRole('button', { name: S.preview })) {
      await expect(sizeOf(preview).height).toBe(28);
    }
    for (const toggle of rowToggles(canvasElement)) {
      await expect(sizeOf(toggle)).toEqual({ width: 24, height: 24 });
    }
  },
};

// ─── A text ──────────────────────────────────────────────────────────────────

/** **A text result, on a phone.** Its copy button, on the label row, is 44 pixels square. */
export const TextPhone: Story = {
  name: 'A text, phone',
  ...pinnedTo('phone'),
  args: text,
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    const copies = within(canvasElement).getAllByRole('button', { name: S.copyText });
    await expect(copies).toHaveLength(2);
    for (const copy of copies) await expectTouchTarget(copy);
  },
};

/** The same text on a desktop: an 18 pixel copy button. */
export const TextDesktop: Story = {
  name: 'A text, desktop',
  ...pinnedTo('desktop'),
  args: text,
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    for (const copy of within(canvasElement).getAllByRole('button', { name: S.copyText })) {
      await expect(sizeOf(copy)).toEqual({ width: 18, height: 18 });
    }
  },
};

// ─── Rows that open ──────────────────────────────────────────────────────────

/**
 * **Fifteen milestones, one block each, on a phone.** Each block's chevron is
 * 44 pixels square, in the block's left margin, which widens to hold it, so it
 * covers none of the block's values.
 */
export const BlocksPhone: Story = {
  name: 'Rows as blocks, phone',
  ...pinnedTo('phone'),
  args: milestones,
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectNoSidewaysScroll(canvasElement);
    const toggles = rowToggles(canvasElement);
    await expect(toggles.length).toBeGreaterThan(2 * 10);
    for (const toggle of toggles) {
      const area = await expectTouchTarget(toggle);
      // The block's values start to the right of the chevron.
      const row = toggle.closest('tr')!;
      for (const cell of row.querySelectorAll('td')) {
        if (cell.contains(toggle)) continue;
        await expect(cell.getBoundingClientRect().left).toBeGreaterThanOrEqual(area.right);
      }
    }
  },
};

/**
 * **The same milestones in a table that scrolls, on a phone.** The chevron
 * column widens to hold a 44 pixel chevron, and an opened row's record still
 * ends at the scroller's right edge rather than past it.
 */
export const ScrollingTablePhone: Story = {
  name: 'Rows in a table that scrolls, phone',
  ...pinnedTo('phone'),
  args: { ...milestones, tableLayout: 'scroll' },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    const toggles = rowToggles(canvasElement);
    await expect(toggles.length).toBeGreaterThan(2 * 10);
    for (const toggle of toggles) await expectTouchTarget(toggle);
    const first = within(canvasElement).getAllByRole('button', { name: S.toggleRowDetails(1) });
    for (const toggle of first) await userEvent.click(toggle);
    await waitFor(() =>
      expect(first.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual(['true', 'true']),
    );
    for (const toggle of first) {
      const scroller = toggle.closest<HTMLElement>('[role="group"]')!;
      const detail = toggle.closest('tr')!.querySelector('td[colspan] > div')!;
      await expect(detail.getBoundingClientRect().right).toBeLessThanOrEqual(
        scroller.getBoundingClientRect().right + 0.5,
      );
    }
  },
};

/** The same table on a desktop: a 24 pixel chevron in its 2rem column. */
export const ScrollingTableDesktop: Story = {
  name: 'Rows in a table that scrolls, desktop',
  ...pinnedTo('desktop'),
  args: { ...milestones, tableLayout: 'scroll' },
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    for (const toggle of rowToggles(canvasElement)) {
      await expect(sizeOf(toggle)).toEqual({ width: 24, height: 24 });
      await expect(sizeOf(toggle.closest('td')!).width).toBe(32);
    }
  },
};
