/**
 * Real payloads from real runs of src/__stories__/_structures/composites.mthds - DO NOT EDIT.
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
export const RUN_PIPE_REFS = ['composites.launch_report'] as const;

export const PAYLOADS: Record<string, unknown> = {
  'composites.launch_report': {
    executive_summary: {
      text: '## Launch Executive Summary\n\nWe are launching **NoteFlow**, a streamlined note-taking app designed to help individuals and teams capture ideas, organize information, and retrieve important notes quickly. The app launches on **iOS, Android, and web** with core features including **rich-text notes, tagging, search, cloud sync, and offline access**.\n\nThe launch targets **students, professionals, and small teams** seeking a simple alternative to complex productivity suites. Our initial rollout will combine **app-store optimization, targeted digital campaigns, and early-user feedback** to drive adoption and prioritize product improvements.\n\n- Achieve **10,000 downloads** in the first 90 days  \n- Reach a **30% seven-day user retention rate**  \n- Collect actionable feedback from **at least 500 active early users**',
    },
    main_risks: [
      {
        risk: 'The sync engine may lose edits under poor networks',
        likelihood: 'high',
      },
      {
        risk: 'Competitors may undercut our price',
        likelihood: 'medium',
      },
      {
        risk: 'App store review may delay the launch',
        likelihood: 'low',
      },
      {
        risk: 'Onboarding may confuse new users',
        likelihood: 'high',
      },
    ],
    cover_picture: {
      url: 'pipelex-storage://org_f0d4abfa-6e43-442b-9f68-fe52fd5ef7bc/runs/run_c86cc2dd-da40-4b2e-b42d-66c26d33e5c0/generated/ecb099551fe4fee8.png',
      public_url: null,
      source_prompt:
        'A paper notebook and a pen on a wooden desk, flat illustration, soft morning light',
      source_negative_prompt: null,
      caption: null,
      mime_type: 'image/png',
      width: 1024,
      height: 1024,
      filename: null,
    },
  },
};
