/**
 * Real payloads from real runs of data/structures/results.mthds - DO NOT EDIT.
 *
 * Regenerate with `make fixtures-runs`, which runs each pipe through the real
 * `pipelex run bundle` CLI and copies back the `main_stuff.json` it wrote. This
 * costs inference budget, which is why it is its own target.
 *
 * **A payload is the one fixture no projection can produce.** Everything else
 * in `_generated/` is derived from what a pipe DECLARES; this is derived from
 * what running it returned, and the difference is not academic. Two shapes here
 * are invisible from every descriptor and were both written wrong by hand
 * before a real run corrected them: a `date` inside a structure arrives in the
 * serializer's typed envelope (`{date, __class__, __module__}`) rather than as
 * an ISO string, and a plural result arrives as `{items: [...]}` rather than as
 * a bare array.
 *
 * The one edit the generator makes is to drop a machine-local `file://`
 * `public_url`: that names the home directory of whoever ran the sweep, and it
 * resolves nowhere else. See `redactLocalUrls` in the generator.
 */

/** Every pipe_ref that was run for this case, in sorted order. */
export const RUN_PIPE_REFS = [
  'results.flat_result',
  'results.image_result',
  'results.nested_result',
  'results.plain_text_result',
  'results.plural_result',
] as const;

export const PAYLOADS: Record<string, unknown> = {
  'results.plain_text_result': {
    text: "Here is a summary of the invoice details extracted from your note:\n\n---\n\n**Invoice Summary**\n\n| Field | Detail |\n|---|---|\n| **Invoice No.** | INV-2026-0042 |\n| **Client** | Acme Logistics |\n| **Issue Date** | 14 March 2026 |\n| **Status** | ⚠️ Unpaid |\n\n**Line Items**\n\n| Description | Qty | Unit Price | Line Total |\n|---|---|---|---|\n| Design retainer | 1 | €1,200.00 | €1,200.00 |\n| Additional revisions | 4 | €160.13 | €640.52 |\n| **Total** | | | **€1,840.52** |\n\n---\n\n**⚠️ Note on Total**\n\nThere appears to be a **minor discrepancy**: the line items sum to **€1,840.52**, but the note states a total of **€1,840.50**. You may want to verify which figure is correct before chasing payment, to avoid any dispute with the client.\n\n---\n\nIs there anything you'd like help with, such as drafting a payment reminder or investigating the discrepancy?",
  },
  'results.flat_result': {
    label: 'positive',
    confidence: 0.85,
    rationale:
      'The note is largely factual and administrative, but ends on a clearly positive note: "The client was delighted with the turnaround," which gives the overall writing a positive sentiment.',
  },
  'results.nested_result': {
    reference: 'INV-2026-0042',
    issued_on: {
      date: '2026-03-14',
      __class__: 'date',
      __module__: 'datetime',
    },
    total: 1840.5,
    paid: false,
    lines: [
      {
        label: 'design retainer',
        quantity: 1,
        unit_price: 1200,
      },
      {
        label: 'additional revisions',
        quantity: 4,
        unit_price: 160.13,
      },
    ],
  },
  'results.plural_result': {
    items: [
      {
        label: 'design retainer',
        quantity: 1,
        unit_price: 1200,
      },
      {
        label: 'additional revisions',
        quantity: 4,
        unit_price: 160.13,
      },
    ],
  },
  'results.image_result': {
    url: 'pipelex-storage://b450b699-a7ff-45f9-8be5-dc8d9c7b6e05/generated/e12a8fb4d5a77303.png',
    public_url: null,
    source_prompt:
      'A small weathered wooden sign staked in dark garden soil, hand-painted with the word RHUBARB, morning light',
    source_negative_prompt: null,
    caption: null,
    mime_type: 'image/png',
    width: null,
    height: null,
    filename: null,
  },
};
