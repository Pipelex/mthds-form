import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/search';
import { DEFAULT_FIELD_STRINGS } from '../../react';
import { ResultView } from '../result-view';
import { atWidth, expectTouchTarget, pinnedTo } from '../touch-target';
import {
  CITATION_PAST_THE_END,
  DUPLICATE_SOURCES,
  NO_SOURCES,
  SEARCH_RESULT,
  UNTITLED_SOURCE,
  UNTITLED_URL,
} from './search-payloads';

/**
 * A search's ANSWER and the web pages it was written from, a
 * `native.SearchResult`, in the two presentations.
 *
 * The descriptor is the corpus's `search.search_result`; the payloads are
 * `search-payloads.ts`, one base and a variant per case, each changing one
 * thing (see that file for why they are hand-built). In `app` the answer is
 * typeset at the result's full width, each citation (`[2]`) a link to the
 * source it names, and the sources follow as links to their pages, each once,
 * marked with the citations that name it: a source is a web page, never a
 * file to download. In `studio` it stays the record of its members, which is
 * what a builder checks a search against.
 */

const meta = {
  title: 'Outputs/Search results',
  component: ResultView,
  args: {
    contracts: CONTRACTS,
    outputForm: OUTPUT_FORM,
    domain: 'search',
    pipeCode: 'search_result',
    value: SEARCH_RESULT,
    presentation: 'app',
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

const s = DEFAULT_FIELD_STRINGS;

/** A source's link in the list, found by the title (or address) it opens with. */
function sourceLinks(root: HTMLElement, name: string): HTMLElement[] {
  return within(root)
    .getAllByRole('link')
    .filter((link) => link.textContent?.startsWith(name) ?? false);
}

/**
 * The answer typeset, its citations linked, and its sources listed once each
 * as links to their pages, with the host name a reader recognises.
 */
export const AnswerWithCitations: Story = {
  name: 'An answer with citations',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Typeset: a heading, emphasis, a list, and no Markdown left showing.
    await expect(canvas.getAllByRole('heading', { name: 'Watering in winter' })).toHaveLength(
      BOTH_THEMES,
    );
    await expect(canvasElement.textContent).not.toContain('**');
    await expect(canvasElement.textContent).not.toContain('##');
    // `[2][3]` is two links, each to the source it counts to.
    for (const [index, source] of SEARCH_RESULT.sources.entries()) {
      const citations = canvas.getAllByRole('link', { name: `[${index + 1}]` });
      await expect(citations.length).toBeGreaterThanOrEqual(BOTH_THEMES);
      for (const citation of citations) {
        await expect(citation.getAttribute('href')).toBe(source.url);
        await expect(citation.getAttribute('target')).toBe('_blank');
        await expect(citation.getAttribute('rel')).toBe('noopener noreferrer');
      }
    }
    // The sources: a link per page, its title and its host, `www.` dropped.
    await expect(canvas.getAllByText(s.searchSources)).toHaveLength(BOTH_THEMES);
    for (const source of SEARCH_RESULT.sources) {
      const links = sourceLinks(canvasElement, source.title ?? source.url);
      await expect(links).toHaveLength(BOTH_THEMES);
      for (const link of links) {
        await expect(link.getAttribute('href')).toBe(source.url);
        await expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
    }
    await expect(canvas.getAllByText('example.com')).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText('plants.example.org')).toHaveLength(BOTH_THEMES);
    // Never a file: no download of its own, no copy of its address, no file
    // name, and no "Output" title.
    await expect(canvas.queryAllByRole('button', { name: /^Download ./ })).toHaveLength(0);
    await expect(canvas.queryAllByRole('button', { name: s.copyUrl })).toHaveLength(0);
    await expect(canvas.queryByText('Output')).toBeNull();
  },
};

/**
 * The first source listed again in third place, at its address with a
 * fragment: listed once, marked `[1][3]`, and `[3]` links to it.
 */
export const DuplicateSources: Story = {
  name: 'Duplicate sources',
  args: { value: DUPLICATE_SOURCES },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, , copy] = DUPLICATE_SOURCES.sources;
    if (!first?.title || !copy?.title) throw new Error('The duplicate case lost its sources.');
    await expect(sourceLinks(canvasElement, first.title)).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(copy.title)).toBeNull();
    await expect(canvas.getAllByText('[1][3]')).toHaveLength(BOTH_THEMES);
    for (const citation of canvas.getAllByRole('link', { name: '[3]' })) {
      await expect(citation.getAttribute('href')).toBe(first.url);
    }
    const lists = canvas.getAllByRole('list', { name: s.searchSources });
    await expect(lists).toHaveLength(BOTH_THEMES);
    for (const list of lists) {
      await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    }
  },
};

/** A source with no title: the list shows its address in the title's place. */
export const SourceWithNoTitle: Story = {
  name: 'A source with no title',
  args: { value: UNTITLED_SOURCE },
  play: async ({ canvasElement }) => {
    const links = sourceLinks(canvasElement, UNTITLED_URL);
    await expect(links).toHaveLength(BOTH_THEMES);
    for (const link of links) await expect(link.getAttribute('href')).toBe(UNTITLED_URL);
    // The other sources keep their titles.
    await expect(sourceLinks(canvasElement, UNTITLED_SOURCE.sources[0]?.title ?? '-')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** No sources: the answer alone, its citations plain text, and no list. */
export const NoSources: Story = {
  name: 'No sources',
  args: { value: NO_SOURCES },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { name: 'Light and warmth' })).toHaveLength(
      BOTH_THEMES,
    );
    await expect(canvas.queryByText(s.searchSources)).toBeNull();
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
    await expect(canvasElement.textContent).toContain('[2][3]');
  },
};

/** A citation past the end of the list stays the text it is; the others link. */
export const CitationPastTheEnd: Story = {
  name: 'A citation past the end',
  args: { value: CITATION_PAST_THE_END },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('link', { name: '[4]' })).toHaveLength(0);
    await expect(canvasElement.textContent).toContain('[4]');
    await expect(canvas.getAllByRole('link', { name: '[3]' }).length).toBeGreaterThanOrEqual(
      BOTH_THEMES,
    );
  },
};

/**
 * On a phone: the long untitled address wraps inside the panel rather than
 * pushing it wider, and each source's link, the whole entry, is a target a
 * finger can take, 44 pixels tall at least.
 */
export const OnAPhone: Story = {
  name: 'On a phone',
  ...pinnedTo('phone'),
  args: { value: UNTITLED_SOURCE },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    const canvas = within(canvasElement);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const lists = canvas.getAllByRole('list', { name: s.searchSources });
    for (const list of lists) {
      await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
      for (const link of within(list).getAllByRole('link')) await expectTouchTarget(link);
    }
    await expect(sourceLinks(canvasElement, UNTITLED_URL)).toHaveLength(BOTH_THEMES);
  },
};

/**
 * In `studio`: the record of its members under the method's own names, the
 * answer as written and every source as the run returned it, which is what a
 * builder checks a search against.
 */
export const InStudio: Story = {
  name: 'In studio',
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('answer')).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText('sources')).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(s.searchSources)).toBeNull();
    await expect(canvas.queryAllByRole('link', { name: '[1]' })).toHaveLength(0);
  },
};
