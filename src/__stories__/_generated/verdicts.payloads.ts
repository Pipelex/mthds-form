/**
 * Real payloads from real runs of src/__stories__/_structures/verdicts.mthds - DO NOT EDIT.
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
export const RUN_PIPE_REFS = [
  'verdicts.choice_verdict',
  'verdicts.rating_verdict',
  'verdicts.yes_no_verdict',
] as const;

export const PAYLOADS: Record<string, unknown> = {
  'verdicts.yes_no_verdict': {
    yes_no: true,
    probability: 1,
  },
  'verdicts.rating_verdict': {
    level: 1,
    label: 'Mixed',
    confidence: 0.96,
    probabilities: {
      '0': 0.01,
      '1': 0.97,
      '2': 0.02,
    },
    position: 1.01,
  },
  'verdicts.choice_verdict': {
    choice: 'billing',
    confidence: 1,
    probabilities: {
      billing: 1,
      sales: 0,
      technical_support: 0,
    },
  },
};
