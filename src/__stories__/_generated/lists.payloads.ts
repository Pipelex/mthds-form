/**
 * Real payloads from real runs of data/structures/lists.mthds - DO NOT EDIT.
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
        number: 0.241,
      },
      {
        number: 0.615,
      },
      {
        number: 1,
      },
      {
        number: 1.881,
      },
      {
        number: 11.86,
      },
      {
        number: 29.46,
      },
      {
        number: 84.01,
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
  'lists.steps': {
    items: [
      {
        label: 'Uncover the mirror',
        minute: 5,
        tool: 'Dust cover',
      },
      {
        label: 'Check the drive oil',
        minute: 10,
        tool: 'Dipstick',
      },
      {
        label: 'Align the finder',
        minute: 15,
        tool: 'Alignment laser',
      },
      {
        label: 'Cool the camera',
        minute: 20,
        tool: 'Chiller',
      },
      {
        label: 'Take a dark frame',
        minute: 8,
        tool: 'Shutter cap',
      },
      {
        label: 'Log the seeing',
        minute: 3,
        tool: 'Seeing monitor',
      },
    ],
  },
  'lists.readings': {
    items: [
      {
        reference: 'R-101',
        instrument: 'Spectrograph A',
        operator: 'Sofia',
        site: 'Ridge Site',
        status: 'accepted',
        band: 'visible',
        taken_on: {
          date: '2026-03-14',
          __class__: 'date',
          __module__: 'datetime',
        },
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
        taken_on: {
          date: '2026-03-14',
          __class__: 'date',
          __module__: 'datetime',
        },
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
        taken_on: {
          date: '2026-03-15',
          __class__: 'date',
          __module__: 'datetime',
        },
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
        taken_on: {
          date: '2026-03-15',
          __class__: 'date',
          __module__: 'datetime',
        },
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
        taken_on: {
          date: '2026-03-16',
          __class__: 'date',
          __module__: 'datetime',
        },
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
        taken_on: {
          date: '2026-03-16',
          __class__: 'date',
          __module__: 'datetime',
        },
        wavelength: 656.3,
        intensity: 0.93,
        exposures: 3,
        calibrated: true,
        seeing: 1.1,
      },
    ],
  },
  'lists.findings': {
    items: [
      {
        title: 'Coating order has no confirmed delivery date',
        detail:
          'The coating order has no confirmed delivery date, which puts weeks 9 to 11 at risk.',
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
  },
  'lists.chapters': {
    items: [
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
            points: [
              'A curved surface focuses',
              'Focal length follows curvature',
              'Glass disperses',
            ],
          },
          {
            heading: 'Aberration',
            page: 33,
            points: ['No single lens is perfect', 'Combinations cancel errors'],
          },
        ],
      },
    ],
  },
  'lists.sources': {
    items: [
      {
        url: 'https://www.spiedigitallibrary.org/journals/journal-of-astronomical-telescopes-instruments-and-systems/papers/adaptive-optics-review-2005.pdf',
        public_url:
          'https://www.spiedigitallibrary.org/journals/journal-of-astronomical-telescopes-instruments-and-systems/papers/adaptive-optics-review-2005.pdf',
        mime_type: 'application/pdf',
        filename: 'adaptive_optics_review_2005.pdf',
        title: 'Adaptive Optics for Astronomical Telescopes',
        snippet:
          'We review the principles and current state of adaptive optics systems used in large ground-based astronomical telescopes to correct for atmospheric turbulence.',
      },
      {
        url: 'https://iopscience.iop.org/article/10.1086/apj/adaptive-optics-wavefront-correction.pdf',
        public_url:
          'https://iopscience.iop.org/article/10.1086/apj/adaptive-optics-wavefront-correction.pdf',
        mime_type: 'application/pdf',
        filename: 'wavefront_correction_adaptive_optics.pdf',
        title: 'Wavefront Correction in Adaptive Optics Systems Using Deformable Mirrors',
        snippet:
          'This paper presents advances in real-time wavefront correction algorithms employing deformable mirrors to achieve near-diffraction-limited imaging.',
      },
      {
        url: 'https://www.nature.com/articles/nature-adaptive-optics-retinal-imaging.pdf',
        public_url: 'https://www.nature.com/articles/nature-adaptive-optics-retinal-imaging.pdf',
        mime_type: 'application/pdf',
        filename: 'adaptive_optics_retinal_imaging.pdf',
        title: 'High-Resolution Retinal Imaging Using Adaptive Optics',
        snippet:
          'Adaptive optics integrated into scanning laser ophthalmoscopes enables cellular-level resolution imaging of the living human retina.',
      },
    ],
  },
  'lists.gallery': {
    items: [
      {
        url: 'pipelex-storage://45a8b060-735a-4b69-ae29-6b45525bad37/generated/b4e6ee3edf45bd06.png',
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
        url: 'pipelex-storage://45a8b060-735a-4b69-ae29-6b45525bad37/generated/3c7ad317e2993217.png',
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
        url: 'pipelex-storage://45a8b060-735a-4b69-ae29-6b45525bad37/generated/8ec46786ddb6e281.png',
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
