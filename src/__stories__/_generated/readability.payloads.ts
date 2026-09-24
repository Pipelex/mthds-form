/**
 * Real payloads from real runs of data/structures/readability.mthds - DO NOT EDIT.
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
export const RUN_PIPE_REFS = ['readability.invoice_check'] as const;

export const PAYLOADS: Record<string, unknown> = {
  'readability.invoice_check': {
    supplier: 'Harbor Pumps Ltd',
    verdict: 'hold_for_review',
    risk: 'HIGH_RISK',
    amount_due: 2116.2,
    price_variance: 0.0042,
    memo: '## Invoice review: INV-7731\n\nHold for review because this is a new supplier and the centrifugal-pump unit price differs from PO-2291.\n\n| Item | Invoiced | Ordered |\n|---|---:|---:|\n| Centrifugal pumps | 612.40 EUR | 609.84 EUR |\n| Installation kit | 279.00 EUR | 279.00 EUR |',
    lines: [
      {
        item: 'centrifugal pumps',
        quantity: 3,
        unit_price: 612.4,
        status: 'unit_price_differs_from_po',
        note: 'The invoiced unit price is **612.40 EUR** versus 609.84 EUR ordered.',
      },
      {
        item: 'installation kit',
        quantity: 1,
        unit_price: 279,
        status: 'matches_po',
        note: 'The invoiced unit price matches the order at **279.00 EUR**.',
      },
    ],
  },
};
