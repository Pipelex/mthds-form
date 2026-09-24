/**
 * Real payloads from real runs of data/structures/tables.mthds - DO NOT EDIT.
 *
 * Regenerate with `make fixtures-runs`, which runs each pipe on the hosted API
 * through `@pipelex/sdk` and copies back the `main_stuff` the run returned. This
 * costs inference budget, which is why it is its own target.
 *
 * **A payload is the one fixture no projection can produce.** Everything else
 * in `_generated/` is derived from what a pipe DECLARES; this is derived from
 * what running it returned, and the difference is not academic. Two shapes here
 * are invisible from every descriptor and were both written wrong by hand
 * before a real run corrected them. Which shape arrives depends on whether the
 * runner could HYDRATE the content - a native concept it can, a structure the
 * bundle defines the hosted worker cannot, and renders raw instead: hydrated, a
 * `date` inside a structure arrives in the serializer's typed envelope
 * (`{date, __class__, __module__}`) and a plural result in the `{items}`
 * envelope; raw, the date is a plain ISO string and the plural a bare array.
 * Only a run shows which, and the corpus holds both.
 *
 * The one edit the generator makes is to drop a storage reference's `public_url`:
 * that is the link one deployment answered on one day - presigned, expiring,
 * naming its bucket - and it resolves nowhere else. See `redactResolvedUrls` in
 * the generator.
 */

/** Every pipe_ref that was run for this case, in sorted order. */
export const RUN_PIPE_REFS = ['tables.links'] as const;

export const PAYLOADS: Record<string, unknown> = {
  'tables.links': [
    {
      url: 'https://en.wikipedia.org/wiki/Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu',
      status: 'up',
      checked_on: '2026-09-20',
      response_ms: 412,
    },
    {
      url: 'https://en.wikipedia.org/wiki/Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
      status: 'up',
      checked_on: '2026-09-20',
      response_ms: 388,
    },
    {
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap',
      status: 'redirect',
      checked_on: '2026-09-20',
      response_ms: 97,
    },
    {
      url: 'https://www.w3.org/TR/css-text-3/#overflow-wrap-property',
      status: 'up',
      checked_on: '2026-09-20',
      response_ms: 1204,
    },
    {
      url: 'https://example.org/archive/2019/observatory-retrofit-plan-final-v2.pdf',
      status: 'down',
      checked_on: '2026-09-20',
      response_ms: 30000,
    },
  ],
};
