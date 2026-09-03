/**
 * Specs the designer method produced for the heroes of data/structures/results.mthds - DO NOT EDIT.
 *
 * Regenerate with `make fixtures-specs`, which runs `data/generative/ui-designer.mthds`
 * through the real `pipelex run bundle` CLI over each hero's brief and validates
 * what came back against the catalog. This costs inference budget, which is why it
 * is its own target.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records the model that produced it and the hash of the catalog prompt it was
 * produced against; the corpus test compares that hash with the current prompt, so a
 * catalog change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../generative/spec-fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['results.nested_result'] as const;

export const SPECS: Record<string, SpecFixture> = {
  'results.nested_result': {
    pipeRef: 'results.nested_result',
    source: 'generated',
    model: 'claude-5-sonnet',
    promptHash: '99033e4a2881',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.nested_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["header","summary-grid","lines-section"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"horizontal","justify":"between","align":"center"},"children":["title","paid-badge"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":{"$template":"Invoice ${/result/reference}"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/paid-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/paid","eq":true},"$then":"Paid","$else":"Unpaid"},"variant":{"$cond":{"$state":"/result/paid","eq":true},"$then":"default","$else":"destructive"}},"children":[]}}\n{"op":"add","path":"/elements/summary-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["total-metric","issued-on"]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total due","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/issued-on","value":{"type":"MthdsResult","props":{"path":"/result/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/lines-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["lines-heading","lines-table"]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Billable lines","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Description"},{"path":"quantity","label":"Qty"},{"path":"unit_price","label":"Unit price"}],"caption":"Line items"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['header', 'summary-grid', 'lines-section'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            justify: 'between',
            align: 'center',
          },
          children: ['title', 'paid-badge'],
        },
        title: {
          type: 'Heading',
          props: {
            text: {
              $template: 'Invoice ${/result/reference}',
            },
            level: 'h1',
          },
          children: [],
        },
        'paid-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'Paid',
              $else: 'Unpaid',
            },
            variant: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'default',
              $else: 'destructive',
            },
          },
          children: [],
        },
        'summary-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['total-metric', 'issued-on'],
        },
        'total-metric': {
          type: 'Metric',
          props: {
            label: 'Total due',
            value: {
              $state: '/result/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'issued-on': {
          type: 'MthdsResult',
          props: {
            path: '/result/issued_on',
          },
          children: [],
        },
        'lines-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['lines-heading', 'lines-table'],
        },
        'lines-heading': {
          type: 'Heading',
          props: {
            text: 'Billable lines',
            level: 'h2',
          },
          children: [],
        },
        'lines-table': {
          type: 'DataTable',
          props: {
            rows: {
              $state: '/result/lines',
            },
            columns: [
              {
                path: 'label',
                label: 'Description',
              },
              {
                path: 'quantity',
                label: 'Qty',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
              },
            ],
            caption: 'Line items',
          },
          children: [],
        },
      },
    },
  },
};
