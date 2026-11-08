/**
 * Real payloads from real runs of data/methods/slide_directions/bundle.mthds - DO NOT EDIT.
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
export const RUN_PIPE_REFS = [
  'slide_directions.generate_design_proposals_from_rough_brief',
] as const;

/** The payloads read from a run rather than run by this pass: the run, and what it was. */
export const READ_FROM: Record<string, { run: string; note: string }> = {
  'slide_directions.generate_design_proposals_from_rough_brief': {
    run: 'run_417a280b-436a-4296-bad7-844825af0b69',
    note: 'The slide directions method on the hosted API, its image step then pinned to nano-banana-pro, for a Q4 2025 financial results keynote to executives',
  },
};

export const PAYLOADS: Record<string, unknown> = {
  'slide_directions.generate_design_proposals_from_rough_brief': {
    directions: [
      {
        theme: {
          name: 'Executive Ledger',
          colors: {
            primary: '#102A43',
            secondary: '#486581',
            accent: '#B7791F',
            background: '#F7F9FC',
            text_primary: '#102A43',
            text_secondary: '#52606D',
          },
          typography: {
            font_family: 'Helvetica',
            heading_style: 'Bold, sentence case, restrained hierarchy',
            body_style: 'Regular, highly legible, concise',
          },
          layout: {
            aspect_ratio: '16:9',
            margins: 'wide',
            alignment: 'left',
          },
          style: {
            overall:
              'Minimal executive financial reporting with disciplined whitespace and clear data hierarchy',
            icon_style: 'Fine-line outline icons',
            graphic_style: 'Clean flat charts, precise grids, and restrained callout highlights',
          },
          exclusions:
            'Avoid gradients, decorative illustrations, stock photography, dense dashboard layouts, playful colors, and 3D effects.',
        },
        mockup: {
          url: 'pipelex-storage://org_c5e4bcdd-37d5-4abc-b062-32facaf38931/runs/run_417a280b-436a-4296-bad7-844825af0b69/generated/e9e57a5e8b311782.jpg',
          public_url: null,
          source_prompt:
            "Render the title slide of a presentation, edge to edge. The presentation is about: Q4 2025 Financial Results\n\nDesign it in the following theme:\n\n# name: Executive Ledger\n\n# colors\n\n## primary: #102A43\n\n## secondary: #486581\n\n## accent: #B7791F\n\n## background: #F7F9FC\n\n## text_primary: #102A43\n\n## text_secondary: #52606D\n\n# typography\n\n## font_family: Helvetica\n\n## heading_style: Bold, sentence case, restrained hierarchy\n\n## body_style: Regular, highly legible, concise\n\n# layout\n\n## aspect_ratio: 16:9\n\n## margins: wide\n\n## alignment: left\n\n# style\n\n## overall: Minimal executive financial reporting with disciplined whitespace and clear data hierarchy\n\n## icon_style: Fine-line outline icons\n\n## graphic_style: Clean flat charts, precise grids, and restrained callout highlights\n\n# exclusions: Avoid gradients, decorative illustrations, stock photography, dense dashboard layouts, playful colors, and 3D effects.\n\n---\n\nOne slide only, filling the whole image: the deck's title large, taken from its topic word for word, a short subtitle, and the theme's palette, type and graphic style. No device frame, no mosaic, no border around the slide.",
          source_negative_prompt: null,
          caption: null,
          mime_type: 'image/jpeg',
          width: null,
          height: null,
          filename: null,
        },
      },
      {
        theme: {
          name: 'Boardroom Slate',
          colors: {
            primary: '#1F2933',
            secondary: '#627D98',
            accent: '#2F855A',
            background: '#FFFFFF',
            text_primary: '#1F2933',
            text_secondary: '#616E7C',
          },
          typography: {
            font_family: 'Georgia',
            heading_style: 'Bold serif headings with measured sentence case',
            body_style: 'Clean sans-serif companion text, regular weight, generous leading',
          },
          layout: {
            aspect_ratio: '16:9',
            margins: 'standard',
            alignment: 'left',
          },
          style: {
            overall:
              'Formal boardroom editorial style balancing authoritative narrative with financial evidence',
            icon_style: 'Minimal monochrome outline icons',
            graphic_style:
              'Editorial tables, understated bar and line charts, and subtle rule-based dividers',
          },
          exclusions:
            'Avoid gradients, saturated multicolor charts, novelty fonts, casual imagery, excessive animation, and ornamental graphics.',
        },
        mockup: {
          url: 'pipelex-storage://org_c5e4bcdd-37d5-4abc-b062-32facaf38931/runs/run_417a280b-436a-4296-bad7-844825af0b69/generated/0955adedea2a3132.jpg',
          public_url: null,
          source_prompt:
            "Render the title slide of a presentation, edge to edge. The presentation is about: Q4 2025 Financial Results\n\nDesign it in the following theme:\n\n# name: Boardroom Slate\n\n# colors\n\n## primary: #1F2933\n\n## secondary: #627D98\n\n## accent: #2F855A\n\n## background: #FFFFFF\n\n## text_primary: #1F2933\n\n## text_secondary: #616E7C\n\n# typography\n\n## font_family: Georgia\n\n## heading_style: Bold serif headings with measured sentence case\n\n## body_style: Clean sans-serif companion text, regular weight, generous leading\n\n# layout\n\n## aspect_ratio: 16:9\n\n## margins: standard\n\n## alignment: left\n\n# style\n\n## overall: Formal boardroom editorial style balancing authoritative narrative with financial evidence\n\n## icon_style: Minimal monochrome outline icons\n\n## graphic_style: Editorial tables, understated bar and line charts, and subtle rule-based dividers\n\n# exclusions: Avoid gradients, saturated multicolor charts, novelty fonts, casual imagery, excessive animation, and ornamental graphics.\n\n---\n\nOne slide only, filling the whole image: the deck's title large, taken from its topic word for word, a short subtitle, and the theme's palette, type and graphic style. No device frame, no mosaic, no border around the slide.",
          source_negative_prompt: null,
          caption: null,
          mime_type: 'image/jpeg',
          width: null,
          height: null,
          filename: null,
        },
      },
      {
        theme: {
          name: 'Midnight Metrics',
          colors: {
            primary: '#0B1F3A',
            secondary: '#334E68',
            accent: '#38A169',
            background: '#0B1F3A',
            text_primary: '#F5F7FA',
            text_secondary: '#B8C5D1',
          },
          typography: {
            font_family: 'Helvetica',
            heading_style: 'Bold, high-contrast sans-serif headings with tabular numerals',
            body_style: 'Regular sans-serif text with concise labels and clear numeric hierarchy',
          },
          layout: {
            aspect_ratio: '16:9',
            margins: 'wide',
            alignment: 'left',
          },
          style: {
            overall:
              'Premium dark-mode keynote aesthetic for concise executive performance storytelling',
            icon_style: 'Simple thin-line icons in light neutral tones',
            graphic_style:
              'High-contrast data visualizations, restrained green performance indicators, and spacious metric cards',
          },
          exclusions:
            'Avoid gradients, bright neon colors, heavy shadows, photographic backgrounds, cluttered tables, and decorative textures.',
        },
        mockup: {
          url: 'pipelex-storage://org_c5e4bcdd-37d5-4abc-b062-32facaf38931/runs/run_417a280b-436a-4296-bad7-844825af0b69/generated/7ab648bf89a21b4e.jpg',
          public_url: null,
          source_prompt:
            "Render the title slide of a presentation, edge to edge. The presentation is about: Q4 2025 Financial Results\n\nDesign it in the following theme:\n\n# name: Midnight Metrics\n\n# colors\n\n## primary: #0B1F3A\n\n## secondary: #334E68\n\n## accent: #38A169\n\n## background: #0B1F3A\n\n## text_primary: #F5F7FA\n\n## text_secondary: #B8C5D1\n\n# typography\n\n## font_family: Helvetica\n\n## heading_style: Bold, high-contrast sans-serif headings with tabular numerals\n\n## body_style: Regular sans-serif text with concise labels and clear numeric hierarchy\n\n# layout\n\n## aspect_ratio: 16:9\n\n## margins: wide\n\n## alignment: left\n\n# style\n\n## overall: Premium dark-mode keynote aesthetic for concise executive performance storytelling\n\n## icon_style: Simple thin-line icons in light neutral tones\n\n## graphic_style: High-contrast data visualizations, restrained green performance indicators, and spacious metric cards\n\n# exclusions: Avoid gradients, bright neon colors, heavy shadows, photographic backgrounds, cluttered tables, and decorative textures.\n\n---\n\nOne slide only, filling the whole image: the deck's title large, taken from its topic word for word, a short subtitle, and the theme's palette, type and graphic style. No device frame, no mosaic, no border around the slide.",
          source_negative_prompt: null,
          caption: null,
          mime_type: 'image/jpeg',
          width: null,
          height: null,
          filename: null,
        },
      },
    ],
  },
};
