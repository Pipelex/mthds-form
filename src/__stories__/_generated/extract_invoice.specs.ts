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
    promptHash: 'a4bced45bfd0',
    date: '2026-10-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["appbar","hero","input-card","run"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Invoice extraction","tag":"process_invoice"},"children":[]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Invoice extraction","headline":"Read an invoice","lede":"Drop in an invoice and we\'ll pull out the details."},"children":[]}}\n{"op":"add","path":"/elements/input-card","value":{"type":"Card","props":{},"children":["document-field"]}}\n{"op":"add","path":"/elements/document-field","value":{"type":"MthdsField","props":{"path":"/inputs/document"},"children":[]}}\n{"op":"add","path":"/elements/run","value":{"type":"Cta","props":{"label":"Extract the details","hint":"Add the invoice first; the run needs it."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['appbar', 'hero', 'input-card', 'run'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'Invoice extraction',
            tag: 'process_invoice',
          },
          children: [],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Invoice extraction',
            headline: 'Read an invoice',
            lede: "Drop in an invoice and we'll pull out the details.",
          },
          children: [],
        },
        'input-card': {
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
            label: 'Extract the details',
            hint: 'Add the invoice first; the run needs it.',
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
        'For someone with an invoice in hand who wants its details pulled out: drop the document in, run it, done — a single-task tool that gets out of the way.',
      title: 'Read an invoice',
      composition:
        "One quiet, centred column — this page does exactly one thing, so there is nothing to divide. An AppBar across the top carries the app's name and the method tag. Below it, a Hero states what happens here in one line. Under the Hero, a single Card holds the one input: the document, delegated to MthdsField. The run sits directly beneath that card as a full-width Cta, with its one-line hint about waiting for the document. No panels, no steps, no tabs — a single file to drop and a single button to press.",
      regions: [
        {
          title: null,
          purpose:
            "The page's banner: names the app and tags the method behind it, so the person knows where they are.",
          container: 'AppBar',
          elements: ['AppBar: app name "Invoice extraction", mono tag "process_invoice"'],
        },
        {
          title: null,
          purpose:
            "The opening line: says in a person's words what this page does, so there is no need for a paragraph explaining the form.",
          container: 'Hero',
          elements: [
            'Hero: eyebrow "Invoice extraction", headline "Read an invoice", muted line "Drop in an invoice and we\'ll pull out the details."',
          ],
        },
        {
          title: null,
          purpose:
            'The one input the run waits for: the invoice document, delegated whole so the file control renders its own label and dropzone.',
          container: 'Card',
          elements: ['MthdsField: path /inputs/document'],
        },
        {
          title: null,
          purpose:
            'The single control that runs the method, directly under the input, with a brief note that the run needs the document.',
          container: 'Cta',
          elements: [
            'Cta: label "Extract the details", hint "Add the invoice first; the run needs it.", on.press validateForm then run',
          ],
        },
      ],
      call_to_action: 'Extract the details — hint: Add the invoice first; the run needs it.',
      defaults: null,
      delegated: [
        '/inputs/document — the brief marks it delegated; a file, rendered by MthdsField at its path.',
      ],
    },
  },
];
