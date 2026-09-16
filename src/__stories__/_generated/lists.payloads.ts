/**
 * Real payloads from real runs of data/structures/lists.mthds - DO NOT EDIT.
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
  'lists.chapters',
  'lists.dates',
  'lists.findings',
  'lists.gallery',
  'lists.numbers',
  'lists.readings',
  'lists.sources',
  'lists.steps',
  'lists.texts',
] as const;

export const PAYLOADS: Record<string, unknown> = {
  'lists.texts': {
    items: [
      {
        text: 'Mercury',
      },
      {
        text: 'Venus',
      },
      {
        text: 'Earth',
      },
      {
        text: 'Mars',
      },
      {
        text: 'Jupiter',
      },
      {
        text: 'Saturn',
      },
      {
        text: 'Uranus',
      },
      {
        text: 'Neptune',
      },
    ],
  },
  'lists.numbers': {
    items: [
      {
        number: 0.2408,
      },
      {
        number: 0.6152,
      },
      {
        number: 1,
      },
      {
        number: 1.8808,
      },
      {
        number: 11.862,
      },
      {
        number: 29.457,
      },
      {
        number: 84.011,
      },
      {
        number: 164.8,
      },
    ],
  },
  'lists.dates': {
    items: [
      {
        date: {
          date: '1957-10-04',
          __class__: 'date',
          __module__: 'datetime',
        },
        time: null,
      },
      {
        date: {
          date: '1969-07-16',
          __class__: 'date',
          __module__: 'datetime',
        },
        time: null,
      },
      {
        date: {
          date: '1977-09-05',
          __class__: 'date',
          __module__: 'datetime',
        },
        time: null,
      },
      {
        date: {
          date: '1990-04-24',
          __class__: 'date',
          __module__: 'datetime',
        },
        time: null,
      },
    ],
  },
  'lists.steps': [
    {
      label: 'Uncover the mirror',
      minute: 5,
      tool: 'dust cover',
    },
    {
      label: 'Check the drive oil',
      minute: 10,
      tool: 'dipstick',
    },
    {
      label: 'Align the finder',
      minute: 15,
      tool: 'alignment laser',
    },
    {
      label: 'Cool the camera',
      minute: 20,
      tool: 'chiller',
    },
    {
      label: 'Take a dark frame',
      minute: 8,
      tool: 'shutter cap',
    },
    {
      label: 'Log the seeing',
      minute: 3,
      tool: 'seeing monitor',
    },
  ],
  'lists.readings': [
    {
      reference: 'R-101',
      instrument: 'Spectrograph A',
      operator: 'Sofia',
      site: 'Ridge Site',
      status: 'accepted',
      band: 'visible',
      taken_on: '2026-03-14',
      wavelength: 550.2,
      intensity: 0.87,
      exposures: 3,
      calibrated: true,
      seeing: 1.2,
    },
    {
      reference: 'R-102',
      instrument: 'Spectrograph A',
      operator: 'Sofia',
      site: 'Ridge Site',
      status: 'accepted',
      band: 'infrared',
      taken_on: '2026-03-14',
      wavelength: 1250,
      intensity: 0.41,
      exposures: 5,
      calibrated: true,
      seeing: 1.4,
    },
    {
      reference: 'R-103',
      instrument: 'Spectrograph B',
      operator: 'Dan',
      site: 'Valley Site',
      status: 'suspect',
      band: 'ultraviolet',
      taken_on: '2026-03-15',
      wavelength: 310.7,
      intensity: 0.12,
      exposures: 2,
      calibrated: false,
      seeing: 2.9,
    },
    {
      reference: 'R-104',
      instrument: 'Spectrograph B',
      operator: 'Dan',
      site: 'Valley Site',
      status: 'accepted',
      band: 'visible',
      taken_on: '2026-03-15',
      wavelength: 486.1,
      intensity: 0.66,
      exposures: 4,
      calibrated: true,
      seeing: 1.9,
    },
    {
      reference: 'R-105',
      instrument: 'Spectrograph C',
      operator: 'Amara',
      site: 'Ridge Site',
      status: 'rejected',
      band: 'infrared',
      taken_on: '2026-03-16',
      wavelength: 1640,
      intensity: 0.05,
      exposures: 8,
      calibrated: false,
      seeing: 3.4,
    },
    {
      reference: 'R-106',
      instrument: 'Spectrograph C',
      operator: 'Amara',
      site: 'Ridge Site',
      status: 'accepted',
      band: 'visible',
      taken_on: '2026-03-16',
      wavelength: 656.3,
      intensity: 0.93,
      exposures: 3,
      calibrated: true,
      seeing: 1.1,
    },
  ],
  'lists.findings': [
    {
      title: 'Coating order has no confirmed delivery date',
      detail: 'The coating order has no confirmed delivery date, which puts weeks 9 to 11 at risk.',
      serious: true,
    },
    {
      title: 'Damping prototype not vibration-tested at real mount mass',
      detail:
        "The damping prototype has not been vibration-tested at the mount's real mass, so the model rerun may be measuring the wrong thing.",
      serious: true,
    },
    {
      title: 'Handover checklist not yet written',
      detail: 'The handover checklist is not written yet, which is fine this early.',
      serious: false,
    },
  ],
  'lists.chapters': [
    {
      title: 'Light',
      sections: [
        {
          heading: 'Waves and rays',
          page: 3,
          points: [
            'Light travels in straight lines',
            'It bends at a boundary',
            'Both models are useful',
          ],
        },
        {
          heading: 'Colour',
          page: 11,
          points: ['Colour is wavelength', 'The eye samples it with three receptors'],
        },
      ],
    },
    {
      title: 'Lenses',
      sections: [
        {
          heading: 'Refraction',
          page: 21,
          points: ['A curved surface focuses', 'Focal length follows curvature', 'Glass disperses'],
        },
        {
          heading: 'Aberration',
          page: 33,
          points: ['No single lens is perfect', 'Combinations cancel errors'],
        },
      ],
    },
  ],
  'lists.sources': {
    items: [
      {
        url: 'https://www.annualreviews.org/doi/pdf/10.1146/annurev.aa.31.090193.003053',
        public_url: 'https://www.annualreviews.org/doi/pdf/10.1146/annurev.aa.31.090193.003053',
        mime_type: 'application/pdf',
        filename: 'tyson_1993_adaptive_optics.pdf',
        title: 'Adaptive Optics System Testing and Calibration',
        snippet:
          'Adaptive optics systems correct for wavefront distortions introduced by atmospheric turbulence, enabling near-diffraction-limited imaging from ground-based telescopes.',
      },
      {
        url: 'https://iopscience.iop.org/article/10.1086/133630/pdf',
        public_url: 'https://iopscience.iop.org/article/10.1086/133630/pdf',
        mime_type: 'application/pdf',
        filename: 'hardy_1998_adaptive_optics_astronomy.pdf',
        title: 'Adaptive Optics for Astronomical Telescopes',
        snippet:
          'This paper reviews the principles and practice of adaptive optics as applied to large ground-based astronomical telescopes, including wavefront sensing and deformable mirror technology.',
      },
      {
        url: 'https://www.osapublishing.org/oe/fulltext.cfm?uri=oe-15-25-16338&id=148994',
        public_url: 'https://www.osapublishing.org/oe/fulltext.cfm?uri=oe-15-25-16338&id=148994',
        mime_type: 'application/pdf',
        filename: 'roorda_2007_adaptive_optics_retinal_imaging.pdf',
        title: 'Adaptive Optics Scanning Laser Ophthalmoscopy',
        snippet:
          'We demonstrate a high-resolution retinal imaging system combining adaptive optics with scanning laser ophthalmoscopy to resolve individual cone photoreceptors in the living human eye.',
      },
    ],
  },
  'lists.gallery': {
    items: [
      {
        url: 'pipelex-storage://org_f0d4abfa-6e43-442b-9f68-fe52fd5ef7bc/runs/run_e3801cca-2820-4d38-8c25-99b3095063b2/generated/0116d9cc480a9d10.png',
        public_url: null,
        source_prompt:
          'A small weathered wooden sign staked in dark garden soil, hand-painted with a vegetable name, morning light',
        source_negative_prompt: null,
        caption: null,
        mime_type: 'image/png',
        width: 1024,
        height: 1024,
        filename: null,
      },
      {
        url: 'pipelex-storage://org_f0d4abfa-6e43-442b-9f68-fe52fd5ef7bc/runs/run_e3801cca-2820-4d38-8c25-99b3095063b2/generated/eb2eb9e9fa5bf156.png',
        public_url: null,
        source_prompt:
          'A small weathered wooden sign staked in dark garden soil, hand-painted with a vegetable name, morning light',
        source_negative_prompt: null,
        caption: null,
        mime_type: 'image/png',
        width: 1024,
        height: 1024,
        filename: null,
      },
      {
        url: 'pipelex-storage://org_f0d4abfa-6e43-442b-9f68-fe52fd5ef7bc/runs/run_e3801cca-2820-4d38-8c25-99b3095063b2/generated/7695c09653fc86e2.png',
        public_url: null,
        source_prompt:
          'A small weathered wooden sign staked in dark garden soil, hand-painted with a vegetable name, morning light',
        source_negative_prompt: null,
        caption: null,
        mime_type: 'image/png',
        width: 1024,
        height: 1024,
        filename: null,
      },
    ],
  },
};
