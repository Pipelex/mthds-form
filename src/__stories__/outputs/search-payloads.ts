import { PAYLOADS } from '../_generated/search.payloads';

/**
 * Payloads for `search.search_result`, a `native.SearchResult`, shared by
 * `Outputs/Search results` and the arm's tests.
 *
 * **The base is a real run.** `SEARCH_RESULT` is the payload committed in
 * `_generated/search.payloads.ts`: what a search returned for the corpus
 * carrier's prompt, read from a run's saved results rather than bought again
 * (that module's `READ_FROM` names the run). It holds what nobody would have
 * written by hand: sources counted from one as they arrived, citations in runs
 * (`[2][3][9]`) with no space before them, one page listed twice, once with
 * `www.` and once without, and a title with its ampersand escaped as `&amp;`.
 * Its addresses and excerpts are public web pages.
 *
 * **The variants are hand-built, and they have to be.** A source with no title,
 * no sources at all and an answer citing past the end of its list are things a
 * search provider may return, and no run can be asked for any of them. So each
 * is the real payload with that one thing changed, and a story about it
 * compares one thing.
 */

export interface SearchSource {
  title: string | null;
  url: string;
  public_url: string | null;
  snippet: string | null;
  mime_type: string | null;
  filename: string | null;
}

export interface SearchResult {
  answer: string;
  sources: SearchSource[];
}

/** The real run's payload, as the runtime wrote it. */
export const SEARCH_RESULT = PAYLOADS['search.search_result'] as SearchResult;

/** Every citation the answer writes, in order, each number of a run on its own. */
export const CITATIONS: readonly number[] = [
  ...SEARCH_RESULT.answer.matchAll(/\[([1-9][0-9]*)\]/g),
].map((match) => Number(match[1]));

/**
 * The page the run listed twice: its first listing and the later copy, each
 * counted from one as the sources are listed.
 *
 * Found the narrow way this run shows it, the same address with and without
 * `www.`, rather than by the reader's own rule, so a story checks the reader
 * against something it did not compute. It throws when a capture lists no
 * page that way, so a story that needs one says so instead of passing on
 * nothing.
 */
export function listedTwice(): { kept: number; copy: number } {
  const bare = (url: string) => url.replace('://www.', '://');
  for (const [index, source] of SEARCH_RESULT.sources.entries()) {
    const first = SEARCH_RESULT.sources.findIndex((other) => bare(other.url) === bare(source.url));
    if (first < index) return { kept: first + 1, copy: index + 1 };
  }
  throw new Error('The captured search lists no page twice, with and without www.');
}

/** The source the untitled variant takes the title off: the one with the longest address. */
const UNTITLED_INDEX = SEARCH_RESULT.sources.reduce(
  (longest, source, index, sources) =>
    source.url.length > (sources[longest]?.url.length ?? 0) ? index : longest,
  0,
);

/** That source's address, which the list shows in the title's place. */
export const UNTITLED_URL = SEARCH_RESULT.sources[UNTITLED_INDEX]?.url ?? '';

/** The real payload with the source at the longest address untitled. */
export const UNTITLED_SOURCE: SearchResult = {
  ...SEARCH_RESULT,
  sources: SEARCH_RESULT.sources.map((source, index) =>
    index === UNTITLED_INDEX ? { ...source, title: null } : source,
  ),
};

/** The real payload with no sources: its citations name nothing, and stay text. */
export const NO_SOURCES: SearchResult = { ...SEARCH_RESULT, sources: [] };

/** The highest citation the answer writes. */
export const LAST_CITATION = Math.max(...CITATIONS);

/**
 * The real payload with its list cut just short of the highest citation, so
 * that citation counts past the end of the list.
 */
export const CITATION_PAST_THE_END: SearchResult = {
  ...SEARCH_RESULT,
  sources: SEARCH_RESULT.sources.slice(0, LAST_CITATION - 1),
};
