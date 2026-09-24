import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/tables';
import { PAYLOADS } from '../_generated/tables.payloads';
import { ResultView, itemsOf } from '../result-view';

/**
 * Record TABLES, one story per rule a cell's value presses on.
 *
 * Which element shape gets a table at all is the lists section's subject; this
 * one takes the table as given and holds values that test what it then does
 * with them. A rule about a cell is a rule about layout, and jsdom lays nothing
 * out, so the assertions here are the only ones that measure it: they run in
 * the browser project, against the widths the page actually got.
 *
 * Every payload here is a real run.
 */

const meta = {
  title: 'Outputs/Tables',
  component: ResultView,
  args: { contracts: CONTRACTS, outputForm: OUTPUT_FORM, domain: 'tables' },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

interface Link {
  url: string;
}

function links(): Link[] {
  return itemsOf(PAYLOADS['tables.links']) as Link[];
}

/**
 * A record whose name is one long token. A link checker names each row by its
 * address, and an address has no space in it: the longest here carries a
 * single word wider than the panel on its own.
 *
 * The name is the one cell that wraps and the one with no width cap, so it is
 * never cut; and it wraps ANYWHERE, so its narrowest is its floor rather than
 * its longest word. Wrapping only between words would leave the table as wide
 * as that word - wider than the panel, scrolling sideways to show one cell
 * whole, which is exactly what a wrapping cell is there to prevent.
 */
export const OfLongNames: Story = {
  name: 'A name with no space in it → wrapped, table in the panel',
  args: { pipeCode: 'links', value: PAYLOADS['tables.links'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = links();
    await expect(rows.length).toBeGreaterThan(2);
    // The corpus holds the value the rule is about: a name no line can hold.
    await expect(Math.max(...rows.map((row) => row.url.length))).toBeGreaterThan(80);

    const tables = canvas.getAllByRole('table');
    await expect(tables).toHaveLength(BOTH_THEMES);
    for (const table of tables) {
      // The table's scroller is its container: no wider than the panel means
      // nothing to scroll.
      const scroller = table.parentElement!;
      await expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth);
    }

    for (const { url } of rows) {
      // Never cut: every address is on the page whole, in both themes, and its
      // cell shows all of it rather than clipping the end away.
      const names = canvas.getAllByText(url);
      await expect(names).toHaveLength(BOTH_THEMES);
      for (const name of names) {
        const cell = name.closest('td')!;
        await expect(cell.scrollWidth).toBeLessThanOrEqual(cell.clientWidth);
      }
    }
  },
};
