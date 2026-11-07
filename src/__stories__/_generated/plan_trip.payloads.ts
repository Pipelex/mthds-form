/**
 * Real payloads from real runs of data/methods/plan_trip/bundle.mthds - DO NOT EDIT.
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
export const RUN_PIPE_REFS = ['trip_planner.plan_trip'] as const;

/** The payloads read from a run rather than run by this pass: the run, and what it was. */
export const READ_FROM: Record<string, { run: string; note: string }> = {
  'trip_planner.plan_trip': {
    run: 'run_61bf6687-c965-412e-9db4-be5ccb7522d9',
    note: "The trip planner on the hosted API, over this case's inputs.json (Lisbon in April, three travellers)",
  },
};

export const PAYLOADS: Record<string, unknown> = {
  'trip_planner.plan_trip': {
    title: 'Lisbon in April',
    overview:
      'A balanced, family-focused six-day Lisbon stay with tram rides, pastry stops and a full-day Sintra outing. The itinerary includes Belém Tower and LX Factory, with flexible meals that work for Maya’s vegetarian diet.',
    days: [
      {
        day: '2027-04-14',
        title: 'Arrival and Baixa introduction',
        morning: null,
        midday: null,
        afternoon:
          'Arrive and check in; keep the first outing easy with a 16:00 walk through Praça do Comércio and Rua Augusta.',
        evening:
          '18:30 ride Tram 28 for Ada, then have dinner in Baixa; choose a restaurant with vegetarian options for Maya.',
      },
      {
        day: '2027-04-15',
        title: 'Historic Lisbon by tram',
        morning:
          '09:30 take Tram 28 to Graça and walk to the Miradouro da Senhora do Monte for city views.',
        midday:
          '12:30 lunch in Alfama; order a vegetarian dish for Maya and simple Portuguese food for Tom and Ada.',
        afternoon:
          '14:00 explore Alfama at an unhurried pace, including Sé Cathedral and a pastry stop.',
        evening: '18:30 return to the hotel to rest; 20:00 family dinner near the accommodation.',
      },
      {
        day: '2027-04-16',
        title: 'Belém and LX Factory',
        morning:
          '09:30 travel to Belém; visit Belém Tower, then stop at Pastéis de Belém for pastries.',
        midday: '12:30 have lunch in Belém, selecting vegetarian-friendly dishes for Maya.',
        afternoon:
          '14:30 go to LX Factory; browse the shops, street art and bookshop, with time for a snack.',
        evening: '18:30 dinner at LX Factory or return to central Lisbon for a relaxed meal.',
      },
      {
        day: '2027-04-17',
        title: 'Day trip to Sintra',
        morning: '08:30 take the train from Rossio to Sintra; visit Pena Palace in the morning.',
        midday:
          '12:30 lunch in Sintra’s historic centre; choose a café or restaurant with vegetarian options.',
        afternoon:
          '14:00 explore the historic centre and try travesseiros pastries; take the train back to Lisbon by about 17:30.',
        evening: '19:30 easy dinner near the hotel and an early night.',
      },
      {
        day: '2027-04-18',
        title: 'Waterfront and flexible family time',
        morning:
          '10:00 visit the Oceanário de Lisboa in Parque das Nações, a child-friendly indoor activity.',
        midday: '12:30 lunch at Parque das Nações, with a vegetarian option for Maya.',
        afternoon:
          '14:00 stroll along the riverside promenade; leave time for Ada to revisit a preferred tram route or for family shopping in Chiado.',
        evening: '18:30 final Lisbon dinner in Chiado; include a last pastel de nata stop.',
      },
      {
        day: '2027-04-19',
        title: 'Departure day',
        morning:
          'Pack, check out and allow time for a nearby bakery breakfast before leaving for the airport.',
        midday: null,
        afternoon: null,
        evening: null,
      },
    ],
    costs: [
      {
        category: 'stay',
        amount: 1100,
      },
      {
        category: 'food',
        amount: 700,
      },
      {
        category: 'tickets',
        amount: 390,
      },
      {
        category: 'transport',
        amount: 260,
      },
      {
        category: 'buffer',
        amount: 350,
      },
    ],
    estimated_total: 2800,
    currency: 'EUR',
    practical_notes: [
      'The stay cost is an estimate for five nights; confirm the accommodation before booking.',
      'Use contactless payment or a rechargeable public-transport card for trams, metro and buses; Tram 28 can be crowded, so board early.',
      'Book timed entry for Pena Palace and Belém Tower in advance, and check opening hours closer to April 2027.',
      'Lisbon and Sintra have steep cobbled streets; use taxis or ride-hailing for uphill stretches if the family prefers.',
      'Ask restaurants about vegetarian dishes and ingredients for Maya; pastries may contain eggs and dairy.',
    ],
  },
};
