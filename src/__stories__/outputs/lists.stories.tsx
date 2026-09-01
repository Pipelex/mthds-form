import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/lists';
import { PAYLOADS } from '../_generated/lists.payloads';
import { ResultView } from '../result-view';

/**
 * Result LISTS, one story per element shape.
 *
 * A list's layout is decided from its **element's descriptor** and from nothing
 * else — never from the payload — so this section is organised by what the
 * element is. That is also why it is a section of its own rather than a few more
 * stories beside the rest: the branches are the interesting thing, and a corpus
 * that only ever met one of them proves nothing about the others.
 *
 * | The element is… | It renders as | Because |
 * | --- | --- | --- |
 * | a scalar | inline chips | the entries ARE the values; an index labels nothing |
 * | a short record | a **table** | every entry has the same keys — that is a table |
 * | a wide record | a table that **scrolls** | twelve columns fit no panel; crushing them is worse than scrolling |
 * | a record with prose | cards | a paragraph in a cell drags every row's height with it |
 * | a record holding records | cards, containing tables | the entries are structures, so the index earns its place |
 * | an image | a **gallery** | a picture is the whole content; a card per picture is a screenful each |
 * | a document | rows | a name and a link is not a structure |
 *
 * Every payload here is a real run. The gallery is a `PipeImgGen` resolving to
 * `Image[3]`, because the language forbids a `PipeLLM` resolving to a concept
 * that contains images.
 */

const meta = {
  title: 'Outputs/Lists',
  component: ResultView,
  args: { contracts: CONTRACTS, outputForm: OUTPUT_FORM, domain: 'lists' },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

function items(pipeCode: string): unknown[] {
  const payload = PAYLOADS[`lists.${pipeCode}`] as { items?: unknown[] };
  return payload.items ?? [];
}

function story(pipeCode: string, maxWidth?: number) {
  return { pipeCode, value: PAYLOADS[`lists.${pipeCode}`], ...(maxWidth ? { maxWidth } : {}) };
}

// ─── Scalars ─────────────────────────────────────────────────────────────────

/**
 * A list of `Text`. Chips, inline: the entries of a scalar list are the values,
 * and a bordered card with an index number around each of eight words is a
 * screenful spent on nothing.
 */
export const OfText: Story = {
  args: story('texts'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(items('texts').length).toBeGreaterThan(4);
    await expect(canvas.queryAllByRole('table')).toHaveLength(0);
  },
};

/** A list of `Number`. The same chips, because the layout follows the kind. */
export const OfNumbers: Story = {
  args: story('numbers'),
};

/**
 * A list of `Date`. The one scalar-looking case that is NOT a scalar:
 * `native.Date`'s content model is `{date, time}`, two properties, so its node
 * is an `object` — and a list of two-column records is a table.
 */
export const OfDates: Story = {
  args: story('dates'),
};

// ─── Records ─────────────────────────────────────────────────────────────────

/** A list of short records — a table, with the labels as headers stated once. */
export const OfShortRecords: Story = {
  args: story('steps'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('table')).toHaveLength(BOTH_THEMES);
    // The label appears once per theme - as a header - not once per row.
    await expect(canvas.getAllByRole('columnheader', { name: 'Label' })).toHaveLength(BOTH_THEMES);
  },
};

/**
 * **A twelve-column record.** No panel is that wide, and the two ways to lose
 * are to crush the columns (a date wrapping onto four lines) or to break the
 * page's own width. So the table keeps a floor under each column and the
 * container scrolls: the panel stays its size, and the table is as wide as it
 * needs to be.
 *
 * Scroll it sideways.
 */
export const OfWideRecords: Story = {
  args: story('readings', 640),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headers = canvas.getAllByRole('columnheader');
    // Twelve columns per theme, all of them stated.
    await expect(headers.length).toBe(12 * BOTH_THEMES);
  },
};

/**
 * A record carrying PROSE. Cards, deliberately: a paragraph in a `<td>` forces
 * one column to the width of the longest answer and drags every other row's
 * height with it, so `prose` is outside the tabular set.
 */
export const OfRecordsWithProse: Story = {
  args: story('findings', 640),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('table')).toHaveLength(0);
  },
};

/**
 * **A list of records holding lists of records holding lists.** Chapters, each
 * with sections, each with its points.
 *
 * The outer two levels are cards — their entries are structures, so the index
 * earns its place — and the innermost list is chips. Three list layouts in one
 * result, each chosen from its own element.
 */
export const OfNestedRecords: Story = {
  args: story('chapters', 720),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chapters = items('chapters') as { sections: { points: string[] }[] }[];
    const deepest = chapters[0]!.sections[0]!.points[0]!;
    await expect(canvas.getAllByText(deepest)).toHaveLength(BOTH_THEMES);
  },
};

// ─── Files ───────────────────────────────────────────────────────────────────

/**
 * A list of `Document`. Rows, not cards: a document's whole content is a name
 * and a link, and wrapping each in a bordered box with an index spends the
 * chrome of a structure on two fields.
 */
export const OfDocuments: Story = {
  args: story('sources', 640),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(items('sources').length).toBeGreaterThan(0);
    await expect(canvas.queryByText(/\[object Object\]/)).toBeNull();
  },
};

/**
 * A list of `Image` — a **gallery**.
 *
 * A card per picture is a screenful each, when the picture is the entire
 * content. A grid shows them the way a person looks at images: several at once,
 * compared side by side. These are three real generations, and their URLs are
 * `pipelex-storage://` references a browser cannot paint — so each tile keeps
 * its reference rather than showing a broken-image glyph, which is what a host
 * with no storage resolver sees.
 */
export const OfImages: Story = {
  args: story('gallery', 640),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(items('gallery')).toHaveLength(3);
    await expect(canvas.queryByText(/\[object Object\]/)).toBeNull();
  },
};

// ─── Edges ───────────────────────────────────────────────────────────────────

/**
 * An empty list. A successful run may resolve a `Concept[]` as none — an absent
 * plural IS the empty list, which the contract states by never marking a plural
 * output optional — so this is a normal state, not an error.
 */
export const Empty: Story = {
  args: { pipeCode: 'steps', value: { items: [] } },
};

/** One entry. The table's header is still worth its line: it names the columns. */
export const OneItem: Story = {
  args: { pipeCode: 'steps', value: { items: items('steps').slice(0, 1) } },
};
