/**
 * Specs captured for the heroes of data/methods/extract_invoice/bundle.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `data/generative/ui-designer.mthds` on the hosted API through `@pipelex/sdk` over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method on the hosted API, a coding agent in a
 * fresh context, or the session working in this repo, by hand), on which model, with
 * which seed and critic loop when there was one, and the hash of the catalog prompt it
 * was produced against; the corpus test compares that hash with the current prompt, so
 * a prompt change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['invoice_extraction.process_invoice'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '2863899d7971',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/invoice_extraction.process_invoice.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Invoice extraction","links":["Document"],"tag":"process_invoice"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-doc"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Read an invoice","headline":"Pull the numbers off your invoice","lede":"Drop in a document and we\'ll lift out what matters."},"children":[]}}\n{"op":"add","path":"/elements/section-doc","value":{"type":"Section","props":{"number":"01","title":"The document","lede":"A single invoice — PDF, image or scan."},"children":["doc-field"]}}\n{"op":"add","path":"/elements/doc-field","value":{"type":"MthdsField","props":{"path":"/inputs/document"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Ready to read"},"children":["summary-doc","cta"]}}\n{"op":"add","path":"/elements/summary-doc","value":{"type":"SummaryRow","props":{"label":"Document","value":{"$state":"/inputs/document"},"placeholder":"No file yet"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Extract the invoice","hint":"Add a document to begin."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Invoice extraction","tag":"process_invoice"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['appbar', 'workspace', 'footer'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'Invoice extraction',
            links: ['Document'],
            tag: 'process_invoice',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['hero', 'section-doc'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Read an invoice',
            headline: 'Pull the numbers off your invoice',
            lede: "Drop in a document and we'll lift out what matters.",
          },
          children: [],
        },
        'section-doc': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The document',
            lede: 'A single invoice — PDF, image or scan.',
          },
          children: ['doc-field'],
        },
        'doc-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Ready to read',
          },
          children: ['summary-doc', 'cta'],
        },
        'summary-doc': {
          type: 'SummaryRow',
          props: {
            label: 'Document',
            value: {
              $state: '/inputs/document',
            },
            placeholder: 'No file yet',
          },
          children: [],
        },
        cta: {
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
        footer: {
          type: 'Footer',
          props: {
            text: 'Invoice extraction',
            tag: 'process_invoice',
          },
          children: [],
        },
      },
    },
  },
];
