import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/search';
import { DEFAULT_FIELD_STRINGS } from '../../react';
import { ResultView } from '../result-view';
import { atWidth, expectTouchTarget, pinnedTo } from '../touch-target';
import {
  CITATIONS,
  CITATION_PAST_THE_END,
  LAST_CITATION,
  NO_SOURCES,
  SEARCH_RESULT,
  UNTITLED_SOURCE,
  UNTITLED_URL,
  listedTwice,
  type SearchResult,
} from './search-payloads';

/**
 * A search's ANSWER and the web pages it was written from, a
 * `native.SearchResult`, in the two presentations.
 *
 * The descriptor is the corpus's `search.search_result`, and the payload is a
 * real run of it; the variants for what no run can be asked for (a source with
 * no title, no sources, a citation past the end) change that payload in one
 * place each (see `search-payloads.ts`). In `app` the answer is typeset at the
 * result's full width, each citation (`[2]`) a link to the source it names, and
 * the sources follow as links to their pages, each once, marked with the
 * citations that name it: a source is a web page, never a file to download. In
 * `studio` it stays the record of its members, which is what a builder checks
 * a search against.
 *
 * The assertions read what they expect out of the payload, as the corpus's
 * other result stories do, so a re-captured run asserts the renderer rather
 * than the search's answer of the day.
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

/** An address as a link's `href` carries it: parsed and written back. */
const hrefOf = (url: string) => new URL(url).href;

/** A site's name as a reader is shown it: the host, a leading `www.` dropped. */
const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/**
 * A title as the list shows it. The captured run wrote an ampersand in a
 * page's title escaped, `&amp;`, as runs did before the runtime decoded a
 * title, and the reader decodes it; the run escapes nothing else.
 */
const shownTitle = (title: string) => title.replaceAll('&amp;', '&').trim();

/**
 * Where citation `n` leads: the source listed `n`th, or, for the copy of the
 * page listed twice, the first listing kept for it.
 */
function citedHref(value: SearchResult, citation: number): string | undefined {
  const { kept, copy } = listedTwice();
  const source = value.sources[(citation === copy ? kept : citation) - 1];
  return source ? hrefOf(source.url) : undefined;
}

/** The sources lists, one per theme. */
function sourceLists(root: HTMLElement): HTMLElement[] {
  return within(root).getAllByRole('list', { name: s.searchSources });
}

/** A source's link in the list, found by the title (or address) it opens with. */
function sourceLinks(root: HTMLElement, name: string): HTMLElement[] {
  return sourceLists(root).flatMap((list) =>
    within(list)
      .getAllByRole('link')
      .filter((link) => link.textContent?.startsWith(name) ?? false),
  );
}

/**
 * A real search's answer typeset, its citations linked, and its sources
 * listed once each as links to their pages, with the host name a reader
 * recognises.
 */
export const AnswerWithCitations: Story = {
  name: 'An answer with citations',
  ...pinnedTo('desktop'),
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    const canvas = within(canvasElement);
    // Typeset: emphasis and a list, and no Markdown left showing.
    await expect(canvasElement.querySelector('strong')).not.toBeNull();
    await expect(canvasElement.textContent).not.toContain('**');
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    // Each citation, a run such as `[2][3]` included, links to the source it
    // counts to, in a tab of its own.
    for (const citation of new Set(CITATIONS)) {
      const links = canvas.getAllByRole('link', { name: `[${citation}]` });
      await expect(links.length).toBeGreaterThanOrEqual(BOTH_THEMES);
      for (const link of links) {
        await expect(link.getAttribute('href')).toBe(citedHref(SEARCH_RESULT, citation));
        await expect(link.getAttribute('target')).toBe('_blank');
        await expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
    }
    // The sources: one link per page, the page listed twice once, each with
    // its title, decoded, and its host, `www.` dropped.
    const { copy } = listedTwice();
    const kept = SEARCH_RESULT.sources.filter((_, index) => index + 1 !== copy);
    for (const list of sourceLists(canvasElement)) {
      const links = within(list).getAllByRole('link');
      await expect(links.map((link) => link.getAttribute('href'))).toEqual(
        kept.map((source) => hrefOf(source.url)),
      );
      for (const [index, link] of links.entries()) {
        const source = kept[index];
        if (!source?.title) throw new Error('A source of the captured run lost its title.');
        await expect(link.textContent).toContain(shownTitle(source.title));
        await expect(link.textContent).toContain(hostOf(source.url));
        await expect(link.getAttribute('target')).toBe('_blank');
        await expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
      await expect(list.textContent).not.toContain('&amp;');
    }
    // Never a file: no download of its own, no copy of its address, no file
    // name, and no "Output" title.
    await expect(canvas.queryAllByRole('button', { name: /^Download ./ })).toHaveLength(0);
    await expect(canvas.queryAllByRole('button', { name: s.copyUrl })).toHaveLength(0);
    await expect(canvas.queryByText('Output')).toBeNull();
  },
};

/**
 * The page the run listed twice, once with `www.` and once without: listed
 * once, at its first address, marked with both citations, and a citation of
 * either leads to it.
 */
export const DuplicateSources: Story = {
  name: 'Duplicate sources',
  play: async ({ canvasElement }) => {
    const { kept, copy } = listedTwice();
    const first = SEARCH_RESULT.sources[kept - 1];
    const second = SEARCH_RESULT.sources[copy - 1];
    if (!first?.title || !second) throw new Error('The duplicate case lost its sources.');
    const lists = sourceLists(canvasElement);
    await expect(lists).toHaveLength(BOTH_THEMES);
    for (const list of lists) {
      const hrefs = within(list)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'));
      await expect(hrefs.filter((href) => href === hrefOf(first.url))).toHaveLength(1);
      await expect(hrefs).not.toContain(hrefOf(second.url));
      await expect(within(list).getByText(`[${kept}][${copy}]`)).toBeTruthy();
    }
    for (const citation of [kept, copy]) {
      for (const link of within(canvasElement).queryAllByRole('link', { name: `[${citation}]` })) {
        await expect(link.getAttribute('href')).toBe(hrefOf(first.url));
      }
    }
  },
};

/**
 * A source with no title, at a long address, on a phone: the list shows the
 * address in the title's place, and it wraps inside the panel rather than
 * pushing it wider.
 */
export const SourceWithNoTitle: Story = {
  name: 'A source with no title',
  ...pinnedTo('phone'),
  args: { value: UNTITLED_SOURCE },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    const links = sourceLinks(canvasElement, UNTITLED_URL);
    await expect(links).toHaveLength(BOTH_THEMES);
    for (const link of links) await expect(link.getAttribute('href')).toBe(hrefOf(UNTITLED_URL));
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    for (const list of sourceLists(canvasElement)) {
      await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    }
    // The other sources keep their titles.
    const titled = UNTITLED_SOURCE.sources.find((source) => source.title);
    await expect(sourceLinks(canvasElement, shownTitle(titled?.title ?? '-'))).toHaveLength(
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
    await expect(canvas.queryByText(s.searchSources)).toBeNull();
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
    for (const citation of CITATIONS) {
      await expect(canvasElement.textContent).toContain(`[${citation}]`);
    }
  },
};

/** A citation past the end of the list stays the text it is; the others link. */
export const CitationPastTheEnd: Story = {
  name: 'A citation past the end',
  args: { value: CITATION_PAST_THE_END },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('link', { name: `[${LAST_CITATION}]` })).toHaveLength(0);
    await expect(canvasElement.textContent).toContain(`[${LAST_CITATION}]`);
    const linked = CITATIONS.find((citation) => citation < LAST_CITATION) ?? 1;
    await expect(
      canvas.getAllByRole('link', { name: `[${linked}]` }).length,
    ).toBeGreaterThanOrEqual(BOTH_THEMES);
  },
};

/**
 * The real search on a phone: its long titles wrap inside the panel rather
 * than pushing it wider, each source's link, the whole entry, is a target a
 * finger can take, 44 pixels tall at least, and every title starts at one
 * edge, after a two-digit marker and after the page listed twice's pair as
 * after `[1]`.
 */
export const OnAPhone: Story = {
  name: 'On a phone',
  ...pinnedTo('phone'),
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    const lists = sourceLists(canvasElement);
    await expect(lists).toHaveLength(BOTH_THEMES);
    for (const list of lists) {
      await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
      const links = within(list).getAllByRole('link');
      for (const link of links) await expectTouchTarget(link);
      const starts = links.map((link) => Math.round(link.getBoundingClientRect().left));
      await expect(new Set(starts).size).toBe(1);
    }
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
