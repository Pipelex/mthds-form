/**
 * Real payloads from real runs of data/structures/results.mthds - DO NOT EDIT.
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
  'results.date_result',
  'results.deep_result',
  'results.every_kind_result',
  'results.flat_result',
  'results.html_result',
  'results.image_result',
  'results.long_list_result',
  'results.nested_result',
  'results.number_result',
  'results.page_result',
  'results.plain_text_result',
  'results.plural_result',
  'results.yes_no_result',
] as const;

export const PAYLOADS: Record<string, unknown> = {
  'results.plain_text_result': {
    text: 'Here is a summary of the invoice details extracted from your note:\n\n---\n\n**Invoice Summary**\n\n| Field | Detail |\n|---|---|\n| **Invoice #** | INV-2026-0042 |\n| **Client** | Acme Logistics |\n| **Issue Date** | 14 March 2026 |\n| **Status** | **Unpaid** |\n\n---\n\n**Line Items**\n\n| Description | Qty | Unit Price | Line Total |\n|---|---|---|---|\n| Design retainer | 1 | €1,200.00 | €1,200.00 |\n| Additional revisions | 4 | €160.13 | €640.52 |\n| **Total** | | | **€1,840.52** |\n\n---\n\n### ⚠️ Note on Total\n\nThere is a **minor discrepancy**: the line items sum to **€1,840.52**, but the note states a total of **€1,840.50** — a **€0.02 difference**. You may want to verify which figure is correct before chasing payment.\n\n---\n\n**Other Note:** The client was recorded as happy with the turnaround, which could be a useful point of reference in any follow-up communication.',
  },
  'results.number_result': {
    number: 1840.5,
  },
  'results.yes_no_result': {
    yes_no: false,
  },
  'results.date_result': {
    date: '2026-03-14',
    time: null,
  },
  'results.html_result': {
    inner_html:
      '<h2>Invoice INV-2026-0042</h2>\n<table>\n  <thead>\n    <tr>\n      <th>Description</th>\n      <th>Amount</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td><strong>Client:</strong> Acme Logistics</td>\n      <td></td>\n    </tr>\n    <tr>\n      <td><strong>Issue Date:</strong> 14 March 2026</td>\n      <td></td>\n    </tr>\n    <tr>\n      <td><strong>Status:</strong> Unpaid</td>\n      <td></td>\n    </tr>\n    <tr>\n      <td>Design retainer (1 unit × 1,200.00 EUR)</td>\n      <td>1,200.00 EUR</td>\n    </tr>\n    <tr>\n      <td>Additional revisions (4 units × 160.13 EUR)</td>\n      <td>640.52 EUR</td>\n    </tr>\n    <tr>\n      <td><strong>Total</strong></td>\n      <td><strong>1,840.50 EUR</strong></td>\n    </tr>\n  </tbody>\n</table>',
    css_class: null,
  },
  'results.flat_result': {
    label: 'positive',
    confidence: 0.85,
    rationale:
      'The note is largely administrative and factual, but closes on a clearly positive note: "The client was delighted with the turnaround," indicating strong client satisfaction.',
  },
  'results.nested_result': {
    reference: 'INV-2026-0042',
    issued_on: '2026-03-14',
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
  'results.plural_result': [
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
  'results.deep_result': {
    name: 'Meridian Optics',
    founded_on: {
      date: '2014-02-03',
      __class__: 'date',
      __module__: 'datetime',
    },
    is_public: false,
    summary: 'Builds measurement instruments for astronomy',
    divisions: [
      {
        name: 'EMEA',
        region: 'emea',
        budget: 12.4,
        teams: [
          {
            name: 'Lenses',
            mission: 'Grind and coat the primary optics',
            headcount: 3,
            members: [
              {
                name: 'Amara Diallo',
                role: 'engineer',
                started_on: {
                  date: '2019-01-12',
                  __class__: 'date',
                  __module__: 'datetime',
                },
                remote: true,
                focus_areas: ['coatings', 'tolerancing'],
              },
              {
                name: 'Tomas Berg',
                role: 'engineer',
                started_on: {
                  date: '2021-09-04',
                  __class__: 'date',
                  __module__: 'datetime',
                },
                remote: false,
                focus_areas: ['grinding'],
              },
              {
                name: 'Rea Kovac',
                role: 'manager',
                started_on: {
                  date: '2017-03-01',
                  __class__: 'date',
                  __module__: 'datetime',
                },
                remote: false,
                focus_areas: null,
              },
            ],
          },
          {
            name: 'Mounts',
            mission: 'Hold the optics still while the earth turns',
            headcount: 2,
            members: [
              {
                name: 'Nils Ostrom',
                role: 'designer',
                started_on: {
                  date: '2022-06-20',
                  __class__: 'date',
                  __module__: 'datetime',
                },
                remote: true,
                focus_areas: ['damping', 'materials'],
              },
              {
                name: 'Priya Raman',
                role: 'researcher',
                started_on: {
                  date: '2020-11-15',
                  __class__: 'date',
                  __module__: 'datetime',
                },
                remote: true,
                focus_areas: ['vibration modelling'],
              },
            ],
          },
        ],
      },
      {
        name: 'Americas',
        region: 'americas',
        budget: 8.1,
        teams: [
          {
            name: 'Calibration',
            mission: 'Prove the instrument reads true',
            headcount: 2,
            members: [
              {
                name: 'Sofia Marchetti',
                role: 'researcher',
                started_on: {
                  date: '2023-04-08',
                  __class__: 'date',
                  __module__: 'datetime',
                },
                remote: false,
                focus_areas: ['interferometry'],
              },
              {
                name: 'Dan Whitfield',
                role: 'engineer',
                started_on: {
                  date: '2018-05-02',
                  __class__: 'date',
                  __module__: 'datetime',
                },
                remote: true,
                focus_areas: ['test rigs', 'automation'],
              },
            ],
          },
        ],
      },
    ],
  },
  'results.long_list_result': [
    {
      label: 'Kickoff and scope freeze',
      week: 1,
      owner: 'Rea',
      status: 'done',
    },
    {
      label: 'Site survey',
      week: 2,
      owner: 'Tomas',
      status: 'done',
    },
    {
      label: 'Optical bench teardown',
      week: 3,
      owner: 'Amara',
      status: 'done',
    },
    {
      label: 'Mirror inspection',
      week: 4,
      owner: 'Amara',
      status: 'done',
    },
    {
      label: 'Coating order placed',
      week: 5,
      owner: 'Rea',
      status: 'in_progress',
    },
    {
      label: 'Mount redesign',
      week: 6,
      owner: 'Nils',
      status: 'in_progress',
    },
    {
      label: 'Damping prototype',
      week: 7,
      owner: 'Nils',
      status: 'blocked',
    },
    {
      label: 'Vibration model rerun',
      week: 8,
      owner: 'Priya',
      status: 'in_progress',
    },
    {
      label: 'Coating delivery',
      week: 9,
      owner: 'Rea',
      status: 'not_started',
    },
    {
      label: 'Recoating',
      week: 10,
      owner: 'Amara',
      status: 'not_started',
    },
    {
      label: 'Reassembly',
      week: 11,
      owner: 'Tomas',
      status: 'not_started',
    },
    {
      label: 'First light',
      week: 12,
      owner: 'Sofia',
      status: 'not_started',
    },
    {
      label: 'Interferometry pass',
      week: 13,
      owner: 'Sofia',
      status: 'not_started',
    },
    {
      label: 'Automation of the test rig',
      week: 14,
      owner: 'Dan',
      status: 'not_started',
    },
    {
      label: 'Handover and sign-off',
      week: 15,
      owner: 'Rea',
      status: 'not_started',
    },
  ],
  'results.every_kind_result': {
    title: 'Recalibrate the Spectrometer',
    abstract:
      'Recalibration of the spectrometer covering 7 optical elements. A measured drift ratio of 0.043 has been recorded. This is a medium priority maintenance job due on 21 April 2026, pending confirmation with the customer.',
    quantity: 7,
    ratio: 0.043,
    confirmed: false,
    due_on: '2026-04-21',
    priority: 'medium',
    tags: ['optics', 'calibration', 'spectrometer', 'maintenance'],
    aside: null,
    follow_up: null,
  },
  'results.image_result': {
    url: 'pipelex-storage://org_f0d4abfa-6e43-442b-9f68-fe52fd5ef7bc/runs/run_698b8129-1a25-4201-9860-0126f2cf5c9d/generated/6ee7262176451da3.png',
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
  'results.page_result': {
    items: [
      {
        text_and_images: {
          text: {
            text: '# The Solar System: An Overview\n\nPipelex team\nMay 13, 2025\n\nThe Solar System is a gravitationally bound system comprising the Sun and the objects that orbit it, including\neight planets, their moons, and various smaller bodies such as dwarf planets, asteroids, and comets.\n\n\n## 1 Structure\n\nThe Solar System consists of the Sun at its center, with\nplanets orbiting in nearly circular paths. These planets\nare divided into two categories: the inner, terrestrial\nplanets (Mercury, Venus, Earth, and Mars) and the\nouter, gas giants (Jupiter and Saturn) and ice giants\n(Uranus and Neptune).\n\nThe terrestrial planets are characterized by their\nrocky surfaces, relatively small sizes, and proximity to\nthe Sun. In contrast, the gas giants are much larger,\nprimarily composed of hydrogen and helium, and pos-\nsess numerous moons.\n\n\n## 2 Formation\n\nThe Solar System formed approximately 4.6 billion\nyears ago from the gravitational collapse of a giant\nmolecular cloud. Most of the mass collected in the\ncenter, forming the Sun, while the remaining material\nflattened into a protoplanetary disk, from which plan-\nets, moons, and other solar system objects formed.\n\nThis process of formation explains many character-\nistics we observe today, including the nearly circular,\ncoplanar orbits of the planets and their direction of\nrotation.\n\n\n## 3 Planetary Data\n\n\n<table>\n<caption>Table 1: Basic properties of the eight planets in our Solar System</caption>\n<tr>\n<th>Planet</th>\n<th>Diameter (km)</th>\n<th>Mass (kg)</th>\n<th>Distance from Sun (AU)</th>\n<th>Moons</th>\n</tr>\n<tr>\n<td>Mercury</td>\n<td>4,880</td>\n<td>3.3×1023</td>\n<td>0.39</td>\n<td>0</td>\n</tr>\n<tr>\n<td>Venus</td>\n<td>12,104</td>\n<td>4.87×1024</td>\n<td>0.72</td>\n<td>0</td>\n</tr>\n<tr>\n<td>Earth</td>\n<td>12,756</td>\n<td>5.97×1024</td>\n<td>1.00</td>\n<td>1</td>\n</tr>\n<tr>\n<td>Mars</td>\n<td>6,792</td>\n<td>6.42×1023</td>\n<td>1.52</td>\n<td>2</td>\n</tr>\n<tr>\n<td>Jupiter</td>\n<td>142,984</td>\n<td>1.90×1027</td>\n<td>5.20</td>\n<td>79</td>\n</tr>\n<tr>\n<td>Saturn</td>\n<td>120,536</td>\n<td>5.68×1026</td>\n<td>9.54</td>\n<td>82</td>\n</tr>\n<tr>\n<td>Uranus</td>\n<td>51,118</td>\n<td>8.68×1025</td>\n<td>19.19</td>\n<td>27</td>\n</tr>\n<tr>\n<td>Neptune</td>\n<td>49,528</td>\n<td>1.02×1026</td>\n<td>30.07</td>\n<td>14</td>\n</tr>\n</table>\n\n\n## 4 Exploration\n\nHuman exploration of the Solar System began with\nthe first artificial satellite, Sputnik 1, launched by the\nSoviet Union in 1957. Since then, numerous missions\nhave explored every planet, as well as many moons,\nasteroids, and comets.\n\nThe most distant human-made objects are the Voy-\nager probes, launched in 1977, which have now entered\ninterstellar space beyond the Solar System\'s boundary.\n\n\n## 5 Future Research\n\nCurrent areas of solar system research include the\nsearch for a theoretical ninth planet, studies of poten-\ntially habitable environments on moons like Europa\nand Enceladus, and continued mapping of asteroids\nthat may pose impact threats to Earth.\n\nFuture missions aim to return samples from Mars,\nexplore the ice giants which have received relatively lit-\ntle attention, and continue our quest to understand our\ncosmic neighborhood.\n\n<!-- PageNumber="1" -->\n',
          },
          images: [],
          raw_html: null,
        },
        page_view: {
          url: 'pipelex-storage://org_f0d4abfa-6e43-442b-9f68-fe52fd5ef7bc/runs/run_a6cf9737-c90a-4880-aa45-7e590bb3cb50/generated/d68de912fc82804b.png',
          public_url: null,
          source_prompt: null,
          source_negative_prompt: null,
          caption: null,
          mime_type: 'image/png',
          width: 596,
          height: 842,
          filename: null,
        },
      },
    ],
  },
};
