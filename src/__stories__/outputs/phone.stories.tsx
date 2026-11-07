import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CONTRACTS as COMPOSITES, OUTPUT_FORM as COMPOSITES_FORM } from '../_generated/composites';
import { PAYLOADS as COMPOSITE_RUNS } from '../_generated/composites.payloads';
import { CONTRACTS as RESULTS, OUTPUT_FORM as RESULTS_FORM } from '../_generated/results';
import { PAYLOADS as RESULT_RUNS } from '../_generated/results.payloads';
import { DEFAULT_FIELD_STRINGS as S, JsonView } from '../../react';
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

// ─── A report of parts, and its Download ─────────────────────────────────────

const launch = {
  contracts: COMPOSITES,
  outputForm: COMPOSITES_FORM,
  domain: 'composites',
  pipeCode: 'launch_report',
  value: COMPOSITE_RUNS['composites.launch_report'],
};

/** The summary's own heading, which names it in place of its member's name. */
const SUMMARY_HEADING = 'Launch Executive Summary';

/**
 * **A launch report of three parts, on a phone**, as a host that heads the
 * result itself mounts it. The summary opens with its own heading, which
 * names it, so its member's name ("Executive summary") is said to assistive
 * technology and not drawn over it. The panel's Download, with nothing beside
 * it, is drawn at the report's foot rather than alone at its top right, and is
 * 44 pixels tall.
 */
export const LaunchReportPhone: Story = {
  name: 'A report of parts and its Download, phone',
  ...pinnedTo('phone'),
  args: launch,
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectNoSidewaysScroll(canvasElement);
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { name: SUMMARY_HEADING })).toHaveLength(2);
    for (const name of canvas.getAllByText('Executive summary')) {
      await expect(name.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    }
    const downloads = canvas.getAllByRole('button', { name: S.download });
    await expect(downloads).toHaveLength(2);
    const tables = canvas.getAllByRole('table');
    for (const download of downloads) {
      await expectTouchTarget(download);
      // Under the report, past its last table.
      const table = tables.filter((candidate) => sameCanvas(candidate, download)).at(-1)!;
      await expect(download.getBoundingClientRect().top).toBeGreaterThan(
        table.getBoundingClientRect().bottom,
      );
    }
  },
};

/** The same report on a desktop: the Download the 28 pixels it always was. */
export const LaunchReportDesktop: Story = {
  name: 'A report of parts and its Download, desktop',
  ...pinnedTo('desktop'),
  args: launch,
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    for (const download of within(canvasElement).getAllByRole('button', { name: S.download })) {
      await expect(sizeOf(download).height).toBe(28);
    }
  },
};

/**
 * **The same report under the name a host gives it, with both views offered.**
 * Beside a title and a view switch the Download stays in the header, and the
 * switch's two buttons, like the Download, are 44 by 44 on a phone, and so is
 * the JSON view's Copy JSON.
 */
export const LaunchReportSwitchPhone: Story = {
  name: 'A named report and its view switch, phone',
  ...pinnedTo('phone'),
  args: { ...launch, name: 'launch_report', views: ['rendered', 'json'] },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectNoSidewaysScroll(canvasElement);
    const canvas = within(canvasElement);
    const controls = [
      ...canvas.getAllByRole('button', { name: S.download }),
      ...canvas.getAllByRole('button', { name: S.viewRendered }),
      ...canvas.getAllByRole('button', { name: S.viewJson }),
    ];
    await expect(controls).toHaveLength(6);
    for (const control of controls) await expectTouchTarget(control);
    // The JSON view's one action, Copy JSON, is a target of its own.
    for (const json of canvas.getAllByRole('button', { name: S.viewJson }))
      await userEvent.click(json);
    const copies = await canvas.findAllByRole('button', { name: S.copyJson });
    await expect(copies).toHaveLength(2);
    for (const copy of copies) await expectTouchTarget(copy);
  },
};

/**
 * **A scalar's JSON, on a phone.** One line of JSON is shorter than the 44
 * pixel Copy JSON button and its inset, so the block keeps a floor that holds
 * the button inside its border rather than hanging it past the edge.
 */
export const ScalarJsonPhone: Story = {
  name: "A scalar's JSON, phone",
  ...pinnedTo('phone'),
  args: text,
  render: () => <JsonView value="Lisbon" />,
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    const copies = await within(canvasElement).findAllByRole('button', { name: S.copyJson });
    await expect(copies).toHaveLength(2);
    for (const copy of copies) {
      await expectTouchTarget(copy);
      const block = copy.parentElement?.querySelector('pre');
      await expect(block).toBeTruthy();
      const button = copy.getBoundingClientRect();
      const box = block!.getBoundingClientRect();
      await expect(button.bottom).toBeLessThanOrEqual(box.bottom);
    }
  },
};

/** Whether two elements are drawn in the same theme pane. */
function sameCanvas(a: Element, b: Element): boolean {
  const pane = (element: Element) => element.closest('.dark') !== null;
  return pane(a) === pane(b);
}
