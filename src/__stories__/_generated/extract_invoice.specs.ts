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
 * which seed and critic loop when there was one, and the hash of the prompt it was
 * produced against - the designer method and the catalog data, together; the corpus
 * test compares that hash with the current one, so a prompt change that invalidates a
 * spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['invoice_extraction.process_invoice'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: 'b92188b90c70',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/invoice_extraction.process_invoice.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Invoice extraction","tag":"process_invoice"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-invoice"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Read an invoice","lede":"Drop in an invoice and we\'ll pull the details out."},"children":[]}}\n{"op":"add","path":"/elements/section-invoice","value":{"type":"Section","props":{"number":"01","title":"The invoice"},"children":["document-field"]}}\n{"op":"add","path":"/elements/document-field","value":{"type":"MthdsField","props":{"path":"/inputs/document"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your document"},"children":["row-document","cta"]}}\n{"op":"add","path":"/elements/row-document","value":{"type":"SummaryRow","props":{"label":"Document","value":{"$state":"/inputs/document"},"placeholder":"No file yet"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Extract the details","hint":"Needs a document to start."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Invoice extraction","tag":"process_invoice"},"children":[]}}',
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
          children: ['hero', 'section-invoice'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Read an invoice',
            lede: "Drop in an invoice and we'll pull the details out.",
          },
          children: [],
        },
        'section-invoice': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The invoice',
          },
          children: ['document-field'],
        },
        'document-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Your document',
          },
          children: ['row-document', 'cta'],
        },
        'row-document': {
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
            label: 'Extract the details',
            hint: 'Needs a document to start.',
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
