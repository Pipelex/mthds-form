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
export const SPEC_PIPE_REFS = ['results.deep_result', 'results.nested_result'] as const;

export const SPECS: Record<string, SpecFixture> = {
  'results.deep_result': {
    pipeRef: 'results.deep_result',
    source: 'generated',
    model: 'claude-5-sonnet',
    promptHash: 'b452d10a8ff7',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.deep_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["title","overview-heading","overview-stack","divisions-heading","division-card"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":{"$state":"/result/name"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/overview-heading","value":{"type":"Heading","props":{"text":"Overview","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/overview-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["status-badge","founded-on","summary"]}}\n{"op":"add","path":"/elements/status-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/is_public","eq":true},"$then":"Public","$else":"Private"},"variant":{"$cond":{"$state":"/result/is_public","eq":true},"$then":"default","$else":"secondary"}},"children":[]}}\n{"op":"add","path":"/elements/founded-on","value":{"type":"MthdsResult","props":{"path":"/result/founded_on"},"children":[]}}\n{"op":"add","path":"/elements/summary","value":{"type":"MthdsResult","props":{"path":"/result/summary"},"children":[]}}\n{"op":"add","path":"/elements/divisions-heading","value":{"type":"Heading","props":{"text":"Divisions","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/division-card","value":{"type":"Card","props":{"maxWidth":"full"},"repeat":{"statePath":"/result/divisions","key":"name"},"children":["division-heading","division-meta","team-card"]}}\n{"op":"add","path":"/elements/division-heading","value":{"type":"Heading","props":{"text":{"$item":"name"},"level":"h3"},"children":[]}}\n{"op":"add","path":"/elements/division-meta","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["region-badge","budget-metric"]}}\n{"op":"add","path":"/elements/region-badge","value":{"type":"Badge","props":{"text":{"$item":"region"},"variant":"outline"},"children":[]}}\n{"op":"add","path":"/elements/budget-metric","value":{"type":"Metric","props":{"label":"Budget","value":{"$item":"budget"},"unit":"M","format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/team-card","value":{"type":"Card","props":{"maxWidth":"full"},"repeat":{"statePath":{"$item":"teams"},"key":"name"},"children":["team-heading","team-headcount","team-mission","team-members"]}}\n{"op":"add","path":"/elements/team-heading","value":{"type":"Heading","props":{"text":{"$item":"name"},"level":"h4"},"children":[]}}\n{"op":"add","path":"/elements/team-headcount","value":{"type":"Metric","props":{"label":"Headcount","value":{"$item":"headcount"},"format":"integer"},"children":[]}}\n{"op":"add","path":"/elements/team-mission","value":{"type":"MthdsResult","props":{"path":"mission"},"children":[]}}\n{"op":"add","path":"/elements/team-members","value":{"type":"MthdsResult","props":{"path":"members"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'title',
            'overview-heading',
            'overview-stack',
            'divisions-heading',
            'division-card',
          ],
        },
        title: {
          type: 'Heading',
          props: {
            text: {
              $state: '/result/name',
            },
            level: 'h1',
          },
          children: [],
        },
        'overview-heading': {
          type: 'Heading',
          props: {
            text: 'Overview',
            level: 'h2',
          },
          children: [],
        },
        'overview-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['status-badge', 'founded-on', 'summary'],
        },
        'status-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/is_public',
                eq: true,
              },
              $then: 'Public',
              $else: 'Private',
            },
            variant: {
              $cond: {
                $state: '/result/is_public',
                eq: true,
              },
              $then: 'default',
              $else: 'secondary',
            },
          },
          children: [],
        },
        'founded-on': {
          type: 'MthdsResult',
          props: {
            path: '/result/founded_on',
          },
          children: [],
        },
        summary: {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
          },
          children: [],
        },
        'divisions-heading': {
          type: 'Heading',
          props: {
            text: 'Divisions',
            level: 'h2',
          },
          children: [],
        },
        'division-card': {
          type: 'Card',
          props: {
            maxWidth: 'full',
          },
          repeat: {
            statePath: '/result/divisions',
            key: 'name',
          },
          children: ['division-heading', 'division-meta', 'team-card'],
        },
        'division-heading': {
          type: 'Heading',
          props: {
            text: {
              $item: 'name',
            },
            level: 'h3',
          },
          children: [],
        },
        'division-meta': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['region-badge', 'budget-metric'],
        },
        'region-badge': {
          type: 'Badge',
          props: {
            text: {
              $item: 'region',
            },
            variant: 'outline',
          },
          children: [],
        },
        'budget-metric': {
          type: 'Metric',
          props: {
            label: 'Budget',
            value: {
              $item: 'budget',
            },
            unit: 'M',
            format: 'decimal',
          },
          children: [],
        },
        'team-card': {
          type: 'Card',
          props: {
            maxWidth: 'full',
          },
          repeat: {
            statePath: {
              $item: 'teams',
            },
            key: 'name',
          },
          children: ['team-heading', 'team-headcount', 'team-mission', 'team-members'],
        },
        'team-heading': {
          type: 'Heading',
          props: {
            text: {
              $item: 'name',
            },
            level: 'h4',
          },
          children: [],
        },
        'team-headcount': {
          type: 'Metric',
          props: {
            label: 'Headcount',
            value: {
              $item: 'headcount',
            },
            format: 'integer',
          },
          children: [],
        },
        'team-mission': {
          type: 'MthdsResult',
          props: {
            path: 'mission',
          },
          children: [],
        },
        'team-members': {
          type: 'MthdsResult',
          props: {
            path: 'members',
          },
          children: [],
        },
      },
    },
  },
  'results.nested_result': {
    pipeRef: 'results.nested_result',
    source: 'generated',
    model: 'claude-5-sonnet',
    promptHash: 'b452d10a8ff7',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.nested_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["title","status-badge","summary-grid","lines-section"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":{"$template":"Invoice ${/result/reference}"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/status-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/paid","eq":true},"$then":"Paid","$else":"Unpaid"},"variant":{"$cond":{"$state":"/result/paid","eq":true},"$then":"default","$else":"destructive"}},"children":[]}}\n{"op":"add","path":"/elements/summary-grid","value":{"type":"Grid","props":{"columns":3,"gap":"lg"},"children":["issued-on-block","total-metric","paid-metric-placeholder"]}}\n{"op":"add","path":"/elements/issued-on-block","value":{"type":"MthdsResult","props":{"path":"/result/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total due","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/paid-metric-placeholder","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["paid-label","paid-text"]}}\n{"op":"add","path":"/elements/paid-label","value":{"type":"Text","props":{"text":"Status","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/paid-text","value":{"type":"Text","props":{"text":{"$cond":{"$state":"/result/paid","eq":true},"$then":"Settled","$else":"Outstanding"},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/lines-section","value":{"type":"Card","props":{"title":"Billable lines","maxWidth":"full"},"children":["lines-heading","lines-table"]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Billable lines","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Description"},{"path":"quantity","label":"Qty"},{"path":"unit_price","label":"Unit price"}],"caption":"Lines composing the total"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['title', 'status-badge', 'summary-grid', 'lines-section'],
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
        'status-badge': {
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
            columns: 3,
            gap: 'lg',
          },
          children: ['issued-on-block', 'total-metric', 'paid-metric-placeholder'],
        },
        'issued-on-block': {
          type: 'MthdsResult',
          props: {
            path: '/result/issued_on',
          },
          children: [],
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
        'paid-metric-placeholder': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['paid-label', 'paid-text'],
        },
        'paid-label': {
          type: 'Text',
          props: {
            text: 'Status',
            variant: 'caption',
          },
          children: [],
        },
        'paid-text': {
          type: 'Text',
          props: {
            text: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'Settled',
              $else: 'Outstanding',
            },
            variant: 'body',
          },
          children: [],
        },
        'lines-section': {
          type: 'Card',
          props: {
            title: 'Billable lines',
            maxWidth: 'full',
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
            caption: 'Lines composing the total',
          },
          children: [],
        },
      },
    },
  },
};
