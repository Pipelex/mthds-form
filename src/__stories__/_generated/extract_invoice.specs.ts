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
    promptHash: '15d195df65f3',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/invoice_extraction.process_invoice.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["hero","work"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Invoice extraction","headline":"Extract from an invoice","lede":"Drop in an invoice and we\'ll pull out the details."},"children":[]}}\n{"op":"add","path":"/elements/work","value":{"type":"Section","props":{"title":"The invoice"},"children":["document","run"]}}\n{"op":"add","path":"/elements/document","value":{"type":"MthdsField","props":{"path":"/inputs/document"},"children":[]}}\n{"op":"add","path":"/elements/run","value":{"type":"Cta","props":{"label":"Extract the details","hint":"We\'ll need the document before we can start."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['hero', 'work'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Invoice extraction',
            headline: 'Extract from an invoice',
            lede: "Drop in an invoice and we'll pull out the details.",
          },
          children: [],
        },
        work: {
          type: 'Section',
          props: {
            title: 'The invoice',
          },
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
            label: 'Extract the details',
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
        'A page for someone with an invoice in hand who wants its details pulled out — they drop the document and run it, nothing more.',
      title: 'Extract from an invoice',
      composition:
        "A single, centred, unhurried column — this page has one job, so it wastes nothing on chrome. A Hero opens it: an eyebrow with the app's name, one bold headline naming the job, one muted line under it. Below, a single Section carries the whole of the work: the delegated document control, given room to breathe as the only thing on the page that matters. The run sits at the foot of that same Section as a full-width Cta, with its one-line wait note as the Cta's hint. Nothing is boxed, nothing is folded, nothing competes: drop the file, run it.",
      regions: [
        {
          title: null,
          purpose:
            "Opens the page: names the app, states in one line what happens here, so the person knows they're in the right place before they do anything.",
          container: 'Hero',
          elements: [
            'Hero eyebrow: Invoice extraction',
            'Hero headline: Extract from an invoice',
            "Hero subline: Drop in an invoice and we'll pull out the details.",
          ],
        },
        {
          title: 'The invoice',
          purpose:
            'The whole of the work: the document to process and the control that runs it, together in one unboxed stage since there is nothing else to group it against.',
          container: 'Section',
          elements: [
            'MthdsField bound to /inputs/document',
            "Cta running validateForm then run — label 'Extract the details', hint 'We'll need the document before we can start.'",
          ],
        },
      ],
      call_to_action: "Extract the details — hint: We'll need the document before we can start.",
      defaults: null,
      delegated: [
        '/inputs/document — the brief marks the document file as delegated to MthdsField',
      ],
    },
  },
];
