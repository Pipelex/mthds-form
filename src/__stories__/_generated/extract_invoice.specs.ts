/**
 * Specs captured for the heroes of data/methods/extract_invoice/bundle.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `methods/layout-design.mthds` on the hosted API through `@pipelex/sdk` over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method on the hosted API, a coding agent in a
 * fresh context, or the session working in this repo, by hand), on which model, with
 * which seed and critic loop when there was one, and the hash of the prompt it was
 * produced against - the designer method and the catalog data, together; the corpus
 * test compares that hash with the current one, so a prompt change that invalidates a
 * spec is a failing test rather than a stale page. An entry the method produced also
 * carries the planner's `plan`, read from the run's working memory: the intermediate
 * the builder was handed, which is where a page got its shape.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['invoice_extraction.process_invoice'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: 'a4e2e53582b1',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/invoice_extraction.process_invoice.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["hero","document-card","run"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Invoice extraction","headline":"Pull the details out of your invoice","lede":"Drop a document and we read the numbers off it."},"children":[]}}\n{"op":"add","path":"/elements/document-card","value":{"type":"Card","props":{},"children":["document-field"]}}\n{"op":"add","path":"/elements/document-field","value":{"type":"MthdsField","props":{"path":"/inputs/document"},"children":[]}}\n{"op":"add","path":"/elements/run","value":{"type":"Cta","props":{"label":"Extract the invoice","hint":"Add a document to begin."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: ['hero', 'document-card', 'run'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Invoice extraction',
            headline: 'Pull the details out of your invoice',
            lede: 'Drop a document and we read the numbers off it.',
          },
          children: [],
        },
        'document-card': {
          type: 'Card',
          props: {},
          children: ['document-field'],
        },
        'document-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
          },
          children: [],
        },
        run: {
          type: 'Cta',
          props: {
            label: 'Extract the invoice',
            hint: 'Add a document to begin.',
          },
          on: {
            press: [
              {
                action: 'validateForm',
              },
              {
                action: 'run',
              },
            ],
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'A page for someone who has an invoice in hand and wants the numbers pulled out of it — drop the document, run the extraction, done.',
      title: 'Extract an invoice',
      composition:
        'A single centered column, quiet and deliberate — this page does one thing, so it should feel like a clean drop zone, not a form. An opening Hero states the job in one bold line with a short muted line under it. Below it, a single Card holds the one thing that matters: the document drop, delegated to MthdsField, which renders its own label and description. The run sits directly beneath that card as a full-width Cta, with a one-line hint that names what the run is waiting for. Nothing else competes; the file is the whole page.',
      regions: [
        {
          title: null,
          purpose:
            'Opening: names the job in one bold line so the person knows exactly what happens here before they do anything.',
          container: 'Hero',
          elements: [
            "Hero, eyebrow 'Invoice extraction', headline 'Pull the details out of your invoice', muted line 'Drop a document and we read the numbers off it.'",
          ],
        },
        {
          title: null,
          purpose:
            'The one input: the document to process, delegated whole as the brief marks it, since it is a file.',
          container: 'Card',
          elements: ['MthdsField, path /inputs/document'],
        },
        {
          title: null,
          purpose: 'Runs the extraction and tells the person what the run is waiting for.',
          container: 'Cta',
          elements: [
            "Cta, label 'Extract the invoice', hint 'Add a document to begin.', on.press bound to validateForm then run",
          ],
        },
      ],
      call_to_action: 'Extract the invoice — hint: "Add a document to begin."',
      defaults: null,
      delegated: [
        '/inputs/document — a file, marked delegated by the brief; rendered with MthdsField and nothing else',
      ],
    },
  },
];
