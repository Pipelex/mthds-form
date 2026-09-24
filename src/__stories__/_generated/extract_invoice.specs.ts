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
    promptHash: '2b2325fd1231',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/invoice_extraction.process_invoice.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"center"},"children":["hero","work"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Invoice extraction","headline":"Read an invoice","lede":"Drop in an invoice and we\'ll pull out the figures that matter."},"children":[]}}\n{"op":"add","path":"/elements/work","value":{"type":"Card","props":{},"children":["document","run"]}}\n{"op":"add","path":"/elements/document","value":{"type":"MthdsField","props":{"path":"/inputs/document"},"children":[]}}\n{"op":"add","path":"/elements/run","value":{"type":"Cta","props":{"label":"Extract the invoice","hint":"We\'ll need the document before we can start."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'center',
          },
          children: ['hero', 'work'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Invoice extraction',
            headline: 'Read an invoice',
            lede: "Drop in an invoice and we'll pull out the figures that matter.",
          },
          children: [],
        },
        work: {
          type: 'Card',
          props: {},
          children: ['document', 'run'],
        },
        document: {
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
            hint: "We'll need the document before we can start.",
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
        'A single-purpose intake for someone who has an invoice in hand and wants its figures pulled out - drop the file, run it, done.',
      title: 'Read an invoice',
      composition:
        "A single centred column, calm and narrow, on an otherwise open page. It opens with a Hero that names the job and says in one muted line what will happen: hand over an invoice, get the figures back. Below it, one quiet Card holds the whole of the work - the document drop, delegated - because there is exactly one thing to do here and it deserves the full width of the reader's attention. The run sits directly under the drop as a full-width Cta, with a short hint that the run waits for the document. Nothing is staged or folded; with one input there is nothing to hide and no journey to walk.",
      regions: [
        {
          title: null,
          purpose:
            'The opening: names the app and states plainly what the page does, so the reader knows in one glance this is where an invoice becomes data.',
          container: 'Hero',
          elements: [
            'Hero eyebrow: Invoice extraction',
            'Hero headline: Read an invoice',
            "Hero subline: Drop in an invoice and we'll pull out the figures that matter.",
          ],
        },
        {
          title: null,
          purpose:
            'The one thing to do: hand over the document. The file input is delegated, and the run sits directly beneath it so the whole act reads as a single gesture.',
          container: 'Card',
          elements: ['MthdsField /inputs/document', 'Cta on.press validateForm then run'],
        },
      ],
      call_to_action: "Extract the invoice — hint: We'll need the document before we can start.",
      defaults: null,
      delegated: [
        '/inputs/document — the brief marks it delegated; a file, rendered by MthdsField at its path.',
      ],
    },
  },
];
