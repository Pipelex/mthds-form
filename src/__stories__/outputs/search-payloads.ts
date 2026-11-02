/**
 * Payloads for `search.search_result`, a `native.SearchResult`, shared by
 * `Outputs/Search results` and the arm's tests.
 *
 * **Hand-built, and they have to be.** The descriptor is the corpus's own,
 * generated from `src/__stories__/_structures/search.mthds` like every other.
 * What these stories vary is what a search provider happened to return: the
 * same page listed twice, a page with no title, no pages at all, an answer
 * citing past the end of its list. No run can be asked for any of those, and
 * a story isolates one comparison, so each payload below is one base with one
 * thing changed. The corpus's carrier is a `PipeSearch` stating its own
 * prompt, so the paid pass (`make fixtures-runs ONLY=search`) captures a real
 * answer for it; these are the cases no capture can be asked for.
 *
 * The base is written in the shape the runtime's search worker writes: an
 * answer in Markdown whose citations count from one over the sources as
 * listed, and each source a `native.Document` carrying the page's `title`, its
 * `url`, a `public_url` restating it, a `snippet`, `mime_type: "text/html"` and
 * no `filename`. The addresses are on the domains reserved for examples, so no
 * story sends a reader to a real site.
 */

interface SearchSource {
  title: string | null;
  url: string;
  public_url: string | null;
  snippet: string | null;
  mime_type: string | null;
  filename: string | null;
}

interface SearchResult {
  answer: string;
  sources: SearchSource[];
}

function source(title: string | null, url: string, snippet: string): SearchSource {
  return { title, url, public_url: url, snippet, mime_type: 'text/html', filename: null };
}

const WINTER_CARE = source(
  'Caring for houseplants in winter',
  'https://www.example.com/houseplants/winter-care',
  'Most houseplants rest in winter: they need less water, more light and no draughts.',
);
const WATERING = source(
  'How to water indoor plants',
  'https://plants.example.org/guides/watering',
  'Water when the top of the soil is dry, and never leave a pot standing in water.',
);
const HUMIDITY = source(
  'Humidity for houseplants',
  'https://www.example.net/humidity',
  'A tray of wet pebbles raises the humidity around a plant without wetting its leaves.',
);
const RADIATORS = source(
  'Radiators and plants: what to know',
  'https://blog.example.com/radiators-and-plants',
  'The air above a radiator is hot and dry, which dries the soil and browns the leaves.',
);

/**
 * The base: an answer with headings, emphasis and a list, citing each of its
 * four sources, one of them in a run (`[2][3]`).
 */
export const SEARCH_RESULT: SearchResult = {
  answer: [
    '## Watering in winter',
    '',
    'Most houseplants need **less water** in winter, because they grow slowly in the short days [1]. Water when the top few centimetres of soil are dry, and empty the saucer afterwards so the roots never stand in water [2][3].',
    '',
    '## Light and warmth',
    '',
    '- Move plants closer to a bright window, but keep their leaves off the cold glass [1].',
    '- Keep them away from radiators, which dry the air and the soil [4].',
    '- Group plants together, or stand them on a tray of wet pebbles, to raise the humidity around them [3].',
  ].join('\n'),
  sources: [WINTER_CARE, WATERING, HUMIDITY, RADIATORS],
};

/**
 * The base with its first source listed again in third place, at an address
 * that differs only by its fragment and under a title of its own. The page is
 * listed once, and `[3]` names it.
 */
export const DUPLICATE_SOURCES: SearchResult = {
  ...SEARCH_RESULT,
  sources: [
    WINTER_CARE,
    WATERING,
    source(
      'Caring for houseplants in winter: humidity',
      `${WINTER_CARE.url}#humidity`,
      'Dry winter air is hard on tropical plants; raise the humidity around them.',
    ),
    RADIATORS,
  ],
};

/** A long address with no title, which the list shows in the title's place. */
export const UNTITLED_URL =
  'https://plants.example.org/guides/indoor/watering-houseplants-in-the-cold-months?utm_source=newsletter&utm_medium=email';

/** The base with its second source untitled, at a long address. */
export const UNTITLED_SOURCE: SearchResult = {
  ...SEARCH_RESULT,
  sources: [WINTER_CARE, source(null, UNTITLED_URL, WATERING.snippet ?? ''), HUMIDITY, RADIATORS],
};

/** The base with no sources: its citations name nothing, and stay text. */
export const NO_SOURCES: SearchResult = { ...SEARCH_RESULT, sources: [] };

/** The base with its last source missing: its `[4]` cites past the end of the list. */
export const CITATION_PAST_THE_END: SearchResult = {
  ...SEARCH_RESULT,
  sources: SEARCH_RESULT.sources.slice(0, 3),
};
