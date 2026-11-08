/**
 * Real payloads from real runs of data/methods/extract_invoice/bundle.mthds - DO NOT EDIT.
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
 *
 * **Read, not run.** The payloads `READ_FROM` names were not bought by this
 * pass: each is the `main_stuff` of a run made elsewhere, read from that run's
 * saved results with the `--read-run` command of scripts/generate-fixtures.mjs
 * and taken in through the same edit. `READ_FROM` says which run, and what it
 * was. A sweep keeps them as they are: only `make fixtures-runs ONLY=<case>
 * PIPE=<code>` buys the pipe again, and drops its entry.
 */

/** Every pipe_ref that was run for this case, in sorted order. */
export const RUN_PIPE_REFS = ['invoice_extraction.process_invoice'] as const;

/** The payloads read from a run rather than run by this pass: the run, and what it was. */
export const READ_FROM: Record<string, { run: string; note: string }> = {
  'invoice_extraction.process_invoice': {
    run: 'run_d155cc7f-5a0f-4cc5-9f0f-68844762446e',
    note: "The library's invoice extractor (methods 08367d9) on the hosted API, over this case's restaurant_invoice.pdf",
  },
};

export const PAYLOADS: Record<string, unknown> = {
  'invoice_extraction.process_invoice': [
    {
      invoice_id: '914946',
      invoice_number: 'JFK5BFDH6707',
      issue_date: '2025-03-09',
      time: '16:28',
      amount_incl_tax: 9.96,
      amount_excl_tax: 8.88,
      vat_amount: 0.81,
      currency: 'USD',
      vat_rates: null,
      vendor: 'JFK 5B Food Hall',
      vendor_address: null,
      vendor_siret: null,
      vendor_vat_number: null,
      company_name: null,
      company_address: null,
      description: 'Takeout snack and soft drink with an employee benefits surcharge.',
      line_items: [
        {
          label: 'Chip Potato Kettle Salt & Vinegar',
          quantity: 1,
          unit_price: null,
          amount: 3.99,
        },
        {
          label: 'DIET PEPSI',
          quantity: 1,
          unit_price: null,
          amount: 4.89,
        },
        {
          label: 'EE Ben Surch',
          quantity: null,
          unit_price: null,
          amount: 0.27,
        },
      ],
      category: {
        category: 'receipt',
        explanation: 'Paid takeout purchase receipt showing card payment and a zero balance.',
      },
      text: 'Welcome to JFK 5B Food Hall\nORDER # JFK5BFDH6707\nLocation: JFK5BFDH\nDevice: JFK5BSCKSK3\nOrigin ID: Kiosk\nORDER ID: 914946\nPOS Order Id: 5171\nDATE: 03/09/2025\nTIME: 04:28 PM\nTAKE OUT\n1 Chip Potato Kettle Salt & Vinegar $3.99\n1 DIET PEPSI $4.89\nSUB-TOTAL $8.88\nSALES TAX $0.81\nEE Ben Surch $0.27\nTOTAL - PLUS TAX $9.96\nCustomer Name: VALUED CUSTOMER\nPaid - Card#: ************1818\nAMEX\n$9.96\nBalance $0.00\nPAY AT SELF CHECKOUT OR CASHIER !!!!',
    },
  ],
};
