/**
 * Specs captured for the heroes of data/structures/structured.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `data/generative/ui-designer.mthds` through the real `pipelex run bundle` CLI over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method through the CLI, a Claude Code subagent in
 * a fresh context, or the Claude Code session by hand), on which model, with which
 * seed and critic loop when there was one, and the hash of the catalog prompt it was
 * produced against; the corpus test compares that hash with the current prompt, so a
 * prompt change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../generative/spec-fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['structured.invoice_with_source'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'claude-code-subagent',
    model: 'claude-fable-5-1',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","body"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Record an invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Describe it and attach the original.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/body","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["invoice-section","billed-to-section","lines-section","notes-collapsible"]}}\n{"op":"add","path":"/elements/invoice-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["invoice-head","invoice-identity","invoice-figures","paid-switch","settled-at-field"]}}\n{"op":"add","path":"/elements/invoice-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["invoice-icon","invoice-heading"]}}\n{"op":"add","path":"/elements/invoice-icon","value":{"type":"Icon","props":{"name":"Receipt"},"children":[]}}\n{"op":"add","path":"/elements/invoice-heading","value":{"type":"Heading","props":{"text":"The invoice","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/invoice-identity","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["reference-input","issued-on-field"]}}\n{"op":"add","path":"/elements/reference-input","value":{"type":"Input","props":{"label":"Reference","name":"reference","placeholder":"As printed on the invoice","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Every invoice has a reference."}]},"children":[]}}\n{"op":"add","path":"/elements/issued-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/invoice-figures","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["total-input","status-segmented"]}}\n{"op":"add","path":"/elements/total-input","value":{"type":"NumberInput","props":{"label":"Total due","name":"total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/status-segmented","value":{"type":"Segmented","props":{"label":"Status","name":"status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Payment received","name":"paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/settled-at-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[],"visible":{"$state":"/inputs/invoice/paid","eq":true}}}\n{"op":"add","path":"/elements/billed-to-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["billed-to-head","billed-to-address","country-segmented"]}}\n{"op":"add","path":"/elements/billed-to-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["billed-to-icon","billed-to-heading"]}}\n{"op":"add","path":"/elements/billed-to-icon","value":{"type":"Icon","props":{"name":"Building2"},"children":[]}}\n{"op":"add","path":"/elements/billed-to-heading","value":{"type":"Heading","props":{"text":"Billed to","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/billed-to-address","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["street-input","city-input"]}}\n{"op":"add","path":"/elements/street-input","value":{"type":"Input","props":{"label":"Street","name":"street","placeholder":"Street and number","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"A street is needed."}]},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"A city is needed."}]},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/lines-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["lines-head","lines-field"]}}\n{"op":"add","path":"/elements/lines-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["lines-icon","lines-heading"]}}\n{"op":"add","path":"/elements/lines-icon","value":{"type":"Icon","props":{"name":"ListChecks"},"children":[]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"What was billed","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/notes-collapsible","value":{"type":"Collapsible","props":{"title":"Add a note","defaultOpen":false},"children":["notes-textarea"]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":3,"placeholder":"Anything worth remembering about this invoice","value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["source-head","source-field","rail-separator","run-note","run-button"]}}\n{"op":"add","path":"/elements/source-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["source-icon","source-heading"]}}\n{"op":"add","path":"/elements/source-icon","value":{"type":"Icon","props":{"name":"Paperclip"},"children":[]}}\n{"op":"add","path":"/elements/source-heading","value":{"type":"Heading","props":{"text":"The original","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/rail-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"Runs once the invoice and its document are in.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Record this invoice","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'body'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Record an invoice',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Describe it and attach the original.',
            variant: 'muted',
          },
          children: [],
        },
        body: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['invoice-section', 'billed-to-section', 'lines-section', 'notes-collapsible'],
        },
        'invoice-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'invoice-head',
            'invoice-identity',
            'invoice-figures',
            'paid-switch',
            'settled-at-field',
          ],
        },
        'invoice-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['invoice-icon', 'invoice-heading'],
        },
        'invoice-icon': {
          type: 'Icon',
          props: {
            name: 'Receipt',
          },
          children: [],
        },
        'invoice-heading': {
          type: 'Heading',
          props: {
            text: 'The invoice',
            level: 'h2',
          },
          children: [],
        },
        'invoice-identity': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['reference-input', 'issued-on-field'],
        },
        'reference-input': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'reference',
            placeholder: 'As printed on the invoice',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Every invoice has a reference.',
              },
            ],
          },
          children: [],
        },
        'issued-on-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        'invoice-figures': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['total-input', 'status-segmented'],
        },
        'total-input': {
          type: 'NumberInput',
          props: {
            label: 'Total due',
            name: 'total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'status-segmented': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Payment received',
            name: 'paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'settled-at-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
          visible: {
            $state: '/inputs/invoice/paid',
            eq: true,
          },
        },
        'billed-to-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['billed-to-head', 'billed-to-address', 'country-segmented'],
        },
        'billed-to-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['billed-to-icon', 'billed-to-heading'],
        },
        'billed-to-icon': {
          type: 'Icon',
          props: {
            name: 'Building2',
          },
          children: [],
        },
        'billed-to-heading': {
          type: 'Heading',
          props: {
            text: 'Billed to',
            level: 'h2',
          },
          children: [],
        },
        'billed-to-address': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['street-input', 'city-input'],
        },
        'street-input': {
          type: 'Input',
          props: {
            label: 'Street',
            name: 'street',
            placeholder: 'Street and number',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'A street is needed.',
              },
            ],
          },
          children: [],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'A city is needed.',
              },
            ],
          },
          children: [],
        },
        'country-segmented': {
          type: 'Segmented',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'lines-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['lines-head', 'lines-field'],
        },
        'lines-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['lines-icon', 'lines-heading'],
        },
        'lines-icon': {
          type: 'Icon',
          props: {
            name: 'ListChecks',
          },
          children: [],
        },
        'lines-heading': {
          type: 'Heading',
          props: {
            text: 'What was billed',
            level: 'h2',
          },
          children: [],
        },
        'lines-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'notes-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Add a note',
            defaultOpen: false,
          },
          children: ['notes-textarea'],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            rows: 3,
            placeholder: 'Anything worth remembering about this invoice',
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['source-head', 'source-field', 'rail-separator', 'run-note', 'run-button'],
        },
        'source-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['source-icon', 'source-heading'],
        },
        'source-icon': {
          type: 'Icon',
          props: {
            name: 'Paperclip',
          },
          children: [],
        },
        'source-heading': {
          type: 'Heading',
          props: {
            text: 'The original',
            level: 'h2',
          },
          children: [],
        },
        'source-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'rail-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'Runs once the invoice and its document are in.',
            variant: 'muted',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Record this invoice',
            variant: 'primary',
          },
          children: [],
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
        },
      },
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'claude-code-subagent',
    model: 'claude-fable-5-1',
    seed: '9NE6RHyGRb7bzMz1Id6KdFbkHoMyeJR3',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","body"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"File an invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Type what the paper says, then attach the paper.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/body","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["invoice-section","billing-section","lines-field","notes-more"]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["source-card","run-block"]}}\n{"op":"add","path":"/elements/invoice-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["invoice-heading","invoice-ids","issued-field","status-segmented","settlement"]}}\n{"op":"add","path":"/elements/invoice-heading","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["invoice-icon","invoice-title"]}}\n{"op":"add","path":"/elements/invoice-icon","value":{"type":"Icon","props":{"name":"Receipt","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/invoice-title","value":{"type":"Heading","props":{"text":"The invoice","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/invoice-ids","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["reference-input","total-input"]}}\n{"op":"add","path":"/elements/reference-input","value":{"type":"Input","props":{"label":"Reference","name":"reference","type":"text","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Every invoice carries a reference."}]},"children":[]}}\n{"op":"add","path":"/elements/total-input","value":{"type":"NumberInput","props":{"label":"Total due","name":"total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/issued-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/status-segmented","value":{"type":"Segmented","props":{"label":"Status","name":"status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/settlement","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["paid-switch","settled-field"]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Payment has cleared","name":"paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/settled-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[],"visible":{"$state":"/inputs/invoice/paid","eq":true}}}\n{"op":"add","path":"/elements/billing-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["billing-heading","street-input","city-input","country-segmented"]}}\n{"op":"add","path":"/elements/billing-heading","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["billing-icon","billing-title"]}}\n{"op":"add","path":"/elements/billing-icon","value":{"type":"Icon","props":{"name":"Building2","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/billing-title","value":{"type":"Heading","props":{"text":"Billed to","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/street-input","value":{"type":"Input","props":{"label":"Street","name":"street","type":"text","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"A street and number, please."}]},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/notes-more","value":{"type":"Collapsible","props":{"title":"Anything else?","defaultOpen":false},"children":["notes-textarea"]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":3,"value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/source-card","value":{"type":"Card","props":{"title":"The paper","description":"Attach the document this invoice was typed from."},"children":["source-field"]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/run-block","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["run-note","run-button"]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"Runs once the invoice and its document are in.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"File this invoice","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'body'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'File an invoice',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Type what the paper says, then attach the paper.',
            variant: 'muted',
          },
          children: [],
        },
        body: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['invoice-section', 'billing-section', 'lines-field', 'notes-more'],
        },
        rail: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['source-card', 'run-block'],
        },
        'invoice-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'invoice-heading',
            'invoice-ids',
            'issued-field',
            'status-segmented',
            'settlement',
          ],
        },
        'invoice-heading': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['invoice-icon', 'invoice-title'],
        },
        'invoice-icon': {
          type: 'Icon',
          props: {
            name: 'Receipt',
            size: 'md',
          },
          children: [],
        },
        'invoice-title': {
          type: 'Heading',
          props: {
            text: 'The invoice',
            level: 'h2',
          },
          children: [],
        },
        'invoice-ids': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['reference-input', 'total-input'],
        },
        'reference-input': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'reference',
            type: 'text',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Every invoice carries a reference.',
              },
            ],
          },
          children: [],
        },
        'total-input': {
          type: 'NumberInput',
          props: {
            label: 'Total due',
            name: 'total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'issued-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        'status-segmented': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        settlement: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['paid-switch', 'settled-field'],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Payment has cleared',
            name: 'paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'settled-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
          visible: {
            $state: '/inputs/invoice/paid',
            eq: true,
          },
        },
        'billing-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['billing-heading', 'street-input', 'city-input', 'country-segmented'],
        },
        'billing-heading': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['billing-icon', 'billing-title'],
        },
        'billing-icon': {
          type: 'Icon',
          props: {
            name: 'Building2',
            size: 'md',
          },
          children: [],
        },
        'billing-title': {
          type: 'Heading',
          props: {
            text: 'Billed to',
            level: 'h2',
          },
          children: [],
        },
        'street-input': {
          type: 'Input',
          props: {
            label: 'Street',
            name: 'street',
            type: 'text',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'A street and number, please.',
              },
            ],
          },
          children: [],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            type: 'text',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Which city?',
              },
            ],
          },
          children: [],
        },
        'country-segmented': {
          type: 'Segmented',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'lines-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'notes-more': {
          type: 'Collapsible',
          props: {
            title: 'Anything else?',
            defaultOpen: false,
          },
          children: ['notes-textarea'],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            rows: 3,
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        'source-card': {
          type: 'Card',
          props: {
            title: 'The paper',
            description: 'Attach the document this invoice was typed from.',
          },
          children: ['source-field'],
        },
        'source-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'run-block': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['run-note', 'run-button'],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'Runs once the invoice and its document are in.',
            variant: 'caption',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'File this invoice',
            variant: 'primary',
          },
          children: [],
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
        },
      },
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'claude-code-subagent',
    model: 'claude-opus-5',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","body"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Log an invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Type in what the invoice says, attach the original, and the two stay together.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/body","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["card-invoice","card-billed-to","card-lines","more"]}}\n{"op":"add","path":"/elements/card-invoice","value":{"type":"Card","props":{"title":"The invoice"},"children":["invoice-body"]}}\n{"op":"add","path":"/elements/invoice-body","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["invoice-grid","status-choice"]}}\n{"op":"add","path":"/elements/invoice-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["reference-input","issued-on"]}}\n{"op":"add","path":"/elements/reference-input","value":{"type":"Input","props":{"label":"Reference","name":"reference","placeholder":"INV-2043","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Add the reference printed on the invoice"}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/issued-on","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/status-choice","value":{"type":"Segmented","props":{"label":"Where it stands","name":"status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/card-billed-to","value":{"type":"Card","props":{"title":"Billed to"},"children":["billed-to-body"]}}\n{"op":"add","path":"/elements/billed-to-body","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["street-input","address-grid"]}}\n{"op":"add","path":"/elements/street-input","value":{"type":"Input","props":{"label":"Street and number","name":"street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"A street is needed"}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/address-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"A city is needed"}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Germany","Spain","United Kingdom"],"placeholder":"Pick a country","value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/card-lines","value":{"type":"Card","props":{"title":"What is on it"},"children":["lines-body"]}}\n{"op":"add","path":"/elements/lines-body","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["lines-field","total-input"]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/total-input","value":{"type":"NumberInput","props":{"label":"Total amount due","name":"total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/more","value":{"type":"Collapsible","props":{"title":"Payment and notes","defaultOpen":false},"children":["more-body"]}}\n{"op":"add","path":"/elements/more-body","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["paid-switch","settled-at","notes-textarea"]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Already paid","name":"paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/settled-at","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[],"visible":{"$state":"/inputs/invoice/paid","eq":true}}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":3,"placeholder":"Anything worth remembering about this one","value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["source-heading","source-field","rail-separator","total-metric","run-block"]}}\n{"op":"add","path":"/elements/source-heading","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["source-icon","source-title"]}}\n{"op":"add","path":"/elements/source-icon","value":{"type":"Icon","props":{"name":"Paperclip","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/source-title","value":{"type":"Heading","props":{"text":"The original","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/rail-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total due","value":{"$state":"/inputs/invoice/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/run-block","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["run-note","run-button"]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"Needs the invoice details and the attached document.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"File this invoice","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'body'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Log an invoice',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Type in what the invoice says, attach the original, and the two stay together.',
            variant: 'lead',
          },
          children: [],
        },
        body: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['card-invoice', 'card-billed-to', 'card-lines', 'more'],
        },
        'card-invoice': {
          type: 'Card',
          props: {
            title: 'The invoice',
          },
          children: ['invoice-body'],
        },
        'invoice-body': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['invoice-grid', 'status-choice'],
        },
        'invoice-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['reference-input', 'issued-on'],
        },
        'reference-input': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'reference',
            placeholder: 'INV-2043',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the reference printed on the invoice',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'issued-on': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        'status-choice': {
          type: 'Segmented',
          props: {
            label: 'Where it stands',
            name: 'status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'card-billed-to': {
          type: 'Card',
          props: {
            title: 'Billed to',
          },
          children: ['billed-to-body'],
        },
        'billed-to-body': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['street-input', 'address-grid'],
        },
        'street-input': {
          type: 'Input',
          props: {
            label: 'Street and number',
            name: 'street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'A street is needed',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'address-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['city-input', 'country-select'],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'A city is needed',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'country-select': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            placeholder: 'Pick a country',
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'card-lines': {
          type: 'Card',
          props: {
            title: 'What is on it',
          },
          children: ['lines-body'],
        },
        'lines-body': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['lines-field', 'total-input'],
        },
        'lines-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'total-input': {
          type: 'NumberInput',
          props: {
            label: 'Total amount due',
            name: 'total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        more: {
          type: 'Collapsible',
          props: {
            title: 'Payment and notes',
            defaultOpen: false,
          },
          children: ['more-body'],
        },
        'more-body': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['paid-switch', 'settled-at', 'notes-textarea'],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Already paid',
            name: 'paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'settled-at': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
          visible: {
            $state: '/inputs/invoice/paid',
            eq: true,
          },
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            rows: 3,
            placeholder: 'Anything worth remembering about this one',
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'source-heading',
            'source-field',
            'rail-separator',
            'total-metric',
            'run-block',
          ],
        },
        'source-heading': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['source-icon', 'source-title'],
        },
        'source-icon': {
          type: 'Icon',
          props: {
            name: 'Paperclip',
            size: 'md',
          },
          children: [],
        },
        'source-title': {
          type: 'Heading',
          props: {
            text: 'The original',
            level: 'h2',
          },
          children: [],
        },
        'source-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'rail-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'total-metric': {
          type: 'Metric',
          props: {
            label: 'Total due',
            value: {
              $state: '/inputs/invoice/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'run-block': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['run-note', 'run-button'],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'Needs the invoice details and the attached document.',
            variant: 'muted',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'File this invoice',
            variant: 'primary',
          },
          children: [],
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
        },
      },
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["header","essentials","lines-card","address-card","details"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Record an invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Describe the invoice and attach the document it came from.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/essentials","value":{"type":"Card","props":{"title":"The invoice"},"children":["essentials-stack"]}}\n{"op":"add","path":"/elements/essentials-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["reference","total","status-seg","dates-grid","paid-switch"]}}\n{"op":"add","path":"/elements/reference","value":{"type":"Input","props":{"label":"Reference","name":"reference","placeholder":"INV-2024-001","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"A reference is required"}]},"children":[]}}\n{"op":"add","path":"/elements/total","value":{"type":"NumberInput","props":{"label":"Total amount due","name":"total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/status-seg","value":{"type":"Segmented","props":{"label":"Status","name":"status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["issued","settled"]}}\n{"op":"add","path":"/elements/issued","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/settled","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Marked as settled","name":"paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/lines-card","value":{"type":"Card","props":{"title":"Lines"},"children":["lines-field"]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/address-card","value":{"type":"Card","props":{"title":"Billed to"},"children":["address-stack"]}}\n{"op":"add","path":"/elements/address-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["street","city-country"]}}\n{"op":"add","path":"/elements/street","value":{"type":"Input","props":{"label":"Street and number","name":"street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Street is required"}]},"children":[]}}\n{"op":"add","path":"/elements/city-country","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"City is required"}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Germany","Spain","United Kingdom"],"placeholder":"Select a country","value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/details","value":{"type":"Collapsible","props":{"title":"Notes"},"children":["notes"]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":4,"placeholder":"Anything worth remembering about this invoice","value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["source-card","run-card"]}}\n{"op":"add","path":"/elements/source-card","value":{"type":"Card","props":{"title":"The document","description":"Attach the file this invoice came from."},"children":["source-field"]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/run-card","value":{"type":"Card","props":{},"children":["run-stack"]}}\n{"op":"add","path":"/elements/run-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["run-note","run-button"]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"Needs the invoice and its document.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Save this invoice","variant":"primary"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['header', 'essentials', 'lines-card', 'address-card', 'details'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Record an invoice',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Describe the invoice and attach the document it came from.',
            variant: 'lead',
          },
          children: [],
        },
        essentials: {
          type: 'Card',
          props: {
            title: 'The invoice',
          },
          children: ['essentials-stack'],
        },
        'essentials-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['reference', 'total', 'status-seg', 'dates-grid', 'paid-switch'],
        },
        reference: {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'reference',
            placeholder: 'INV-2024-001',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'A reference is required',
              },
            ],
          },
          children: [],
        },
        total: {
          type: 'NumberInput',
          props: {
            label: 'Total amount due',
            name: 'total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'status-seg': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'dates-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['issued', 'settled'],
        },
        issued: {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        settled: {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Marked as settled',
            name: 'paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'lines-card': {
          type: 'Card',
          props: {
            title: 'Lines',
          },
          children: ['lines-field'],
        },
        'lines-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'address-card': {
          type: 'Card',
          props: {
            title: 'Billed to',
          },
          children: ['address-stack'],
        },
        'address-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['street', 'city-country'],
        },
        street: {
          type: 'Input',
          props: {
            label: 'Street and number',
            name: 'street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Street is required',
              },
            ],
          },
          children: [],
        },
        'city-country': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['city', 'country'],
        },
        city: {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'City is required',
              },
            ],
          },
          children: [],
        },
        country: {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            placeholder: 'Select a country',
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        details: {
          type: 'Collapsible',
          props: {
            title: 'Notes',
          },
          children: ['notes'],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            rows: 4,
            placeholder: 'Anything worth remembering about this invoice',
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['source-card', 'run-card'],
        },
        'source-card': {
          type: 'Card',
          props: {
            title: 'The document',
            description: 'Attach the file this invoice came from.',
          },
          children: ['source-field'],
        },
        'source-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'run-card': {
          type: 'Card',
          props: {},
          children: ['run-stack'],
        },
        'run-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['run-note', 'run-button'],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'Needs the invoice and its document.',
            variant: 'muted',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Save this invoice',
            variant: 'primary',
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
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    seed: 'CpKFEz5Skr1xgMY8QWBKossyH5tnefSu',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["header","essentials","parties","linesCard","extras"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Record an invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Describe the invoice and attach the document it came from.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/essentials","value":{"type":"Card","props":{"title":"The invoice"},"children":["essRow","refInput","totalInput","statusSeg","dates","paidSwitch"]}}\n{"op":"add","path":"/elements/essRow","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["essIcon","essHead"]}}\n{"op":"add","path":"/elements/essIcon","value":{"type":"Icon","props":{"name":"Receipt","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/essHead","value":{"type":"Heading","props":{"text":"Details","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/refInput","value":{"type":"Input","props":{"label":"Reference","name":"reference","placeholder":"INV-2024-001","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"A reference is required"}]},"children":[]}}\n{"op":"add","path":"/elements/totalInput","value":{"type":"NumberInput","props":{"label":"Total amount due","name":"total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/statusSeg","value":{"type":"Segmented","props":{"label":"Where it stands","name":"status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/dates","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["issuedField","settledField"]}}\n{"op":"add","path":"/elements/issuedField","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/settledField","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[]}}\n{"op":"add","path":"/elements/paidSwitch","value":{"type":"Switch","props":{"label":"Payment has cleared","name":"paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/parties","value":{"type":"Card","props":{"title":"Billed to"},"children":["street","cityCountry"]}}\n{"op":"add","path":"/elements/street","value":{"type":"Input","props":{"label":"Street and number","name":"street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"A street is required"}]},"children":[]}}\n{"op":"add","path":"/elements/cityCountry","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"A city is required"}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Germany","Spain","United Kingdom"],"placeholder":"Optional","value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/linesCard","value":{"type":"Card","props":{"title":"Lines"},"children":["linesField"]}}\n{"op":"add","path":"/elements/linesField","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/extras","value":{"type":"Collapsible","props":{"title":"Notes","defaultOpen":false},"children":["notes"]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":3,"placeholder":"Anything worth remembering","value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Card","props":{"title":"The source"},"children":["sourceIntro","sourceField","sep","runNote","runBtn"]}}\n{"op":"add","path":"/elements/sourceIntro","value":{"type":"Text","props":{"text":"Attach the document this invoice came from.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/sourceField","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/sep","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/runNote","value":{"type":"Text","props":{"text":"Needs the invoice details and a source document.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/runBtn","value":{"type":"Button","props":{"label":"Save invoice","variant":"primary"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['header', 'essentials', 'parties', 'linesCard', 'extras'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Record an invoice',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Describe the invoice and attach the document it came from.',
            variant: 'lead',
          },
          children: [],
        },
        essentials: {
          type: 'Card',
          props: {
            title: 'The invoice',
          },
          children: ['essRow', 'refInput', 'totalInput', 'statusSeg', 'dates', 'paidSwitch'],
        },
        essRow: {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['essIcon', 'essHead'],
        },
        essIcon: {
          type: 'Icon',
          props: {
            name: 'Receipt',
            size: 'md',
          },
          children: [],
        },
        essHead: {
          type: 'Heading',
          props: {
            text: 'Details',
            level: 'h2',
          },
          children: [],
        },
        refInput: {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'reference',
            placeholder: 'INV-2024-001',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'A reference is required',
              },
            ],
          },
          children: [],
        },
        totalInput: {
          type: 'NumberInput',
          props: {
            label: 'Total amount due',
            name: 'total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        statusSeg: {
          type: 'Segmented',
          props: {
            label: 'Where it stands',
            name: 'status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        dates: {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['issuedField', 'settledField'],
        },
        issuedField: {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        settledField: {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
        },
        paidSwitch: {
          type: 'Switch',
          props: {
            label: 'Payment has cleared',
            name: 'paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        parties: {
          type: 'Card',
          props: {
            title: 'Billed to',
          },
          children: ['street', 'cityCountry'],
        },
        street: {
          type: 'Input',
          props: {
            label: 'Street and number',
            name: 'street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'A street is required',
              },
            ],
          },
          children: [],
        },
        cityCountry: {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['city', 'country'],
        },
        city: {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'A city is required',
              },
            ],
          },
          children: [],
        },
        country: {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            placeholder: 'Optional',
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        linesCard: {
          type: 'Card',
          props: {
            title: 'Lines',
          },
          children: ['linesField'],
        },
        linesField: {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        extras: {
          type: 'Collapsible',
          props: {
            title: 'Notes',
            defaultOpen: false,
          },
          children: ['notes'],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            rows: 3,
            placeholder: 'Anything worth remembering',
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Card',
          props: {
            title: 'The source',
          },
          children: ['sourceIntro', 'sourceField', 'sep', 'runNote', 'runBtn'],
        },
        sourceIntro: {
          type: 'Text',
          props: {
            text: 'Attach the document this invoice came from.',
            variant: 'muted',
          },
          children: [],
        },
        sourceField: {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        sep: {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        runNote: {
          type: 'Text',
          props: {
            text: 'Needs the invoice details and a source document.',
            variant: 'caption',
          },
          children: [],
        },
        runBtn: {
          type: 'Button',
          props: {
            label: 'Save invoice',
            variant: 'primary',
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
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'claude-5-sonnet',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["header","steps"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Log this invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Capture the details, then attach the document it came from.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/steps","value":{"type":"Steps","props":{"steps":["Details","Billing","Lines & document"],"nextLabel":"Next","backLabel":"Back"},"children":["step-details","step-billing","step-lines"]}}\n{"op":"add","path":"/elements/step-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["reference-input","key-figures","status-segmented","dates-grid","paid-switch"]}}\n{"op":"add","path":"/elements/reference-input","value":{"type":"Input","props":{"label":"Reference","name":"reference","placeholder":"INV-0001","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Reference is required"}]},"children":[]}}\n{"op":"add","path":"/elements/key-figures","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["total-input"]}}\n{"op":"add","path":"/elements/total-input","value":{"type":"NumberInput","props":{"label":"Total due","name":"total","value":{"$bindState":"/inputs/invoice/total"},"min":0},"children":[]}}\n{"op":"add","path":"/elements/status-segmented","value":{"type":"Segmented","props":{"label":"Status","name":"status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["issued-on-field","settled-at-field"]}}\n{"op":"add","path":"/elements/issued-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/settled-at-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Payment has cleared","name":"paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/step-billing","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["billing-heading","street-input","city-input","country-segmented"]}}\n{"op":"add","path":"/elements/billing-heading","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["billing-icon","billing-heading-text"]}}\n{"op":"add","path":"/elements/billing-icon","value":{"type":"Icon","props":{"name":"MapPin","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/billing-heading-text","value":{"type":"Heading","props":{"text":"Billed to","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/street-input","value":{"type":"Input","props":{"label":"Street","name":"street","placeholder":"123 Rue de la Paix","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Street is required"}]},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Paris","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"City is required"}]},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/step-lines","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["lines-field","notes-textarea","source-field","run-alert","run-button"]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","placeholder":"Anything worth flagging","rows":3,"value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/run-alert","value":{"type":"Alert","props":{"title":"Needs the invoice and its source document","message":"Both are required before this can run.","type":"info"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Log this invoice","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['header', 'steps'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Log this invoice',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Capture the details, then attach the document it came from.',
            variant: 'muted',
          },
          children: [],
        },
        steps: {
          type: 'Steps',
          props: {
            steps: ['Details', 'Billing', 'Lines & document'],
            nextLabel: 'Next',
            backLabel: 'Back',
          },
          children: ['step-details', 'step-billing', 'step-lines'],
        },
        'step-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'reference-input',
            'key-figures',
            'status-segmented',
            'dates-grid',
            'paid-switch',
          ],
        },
        'reference-input': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'reference',
            placeholder: 'INV-0001',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Reference is required',
              },
            ],
          },
          children: [],
        },
        'key-figures': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['total-input'],
        },
        'total-input': {
          type: 'NumberInput',
          props: {
            label: 'Total due',
            name: 'total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
            min: 0,
          },
          children: [],
        },
        'status-segmented': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'dates-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['issued-on-field', 'settled-at-field'],
        },
        'issued-on-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        'settled-at-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Payment has cleared',
            name: 'paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'step-billing': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['billing-heading', 'street-input', 'city-input', 'country-segmented'],
        },
        'billing-heading': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['billing-icon', 'billing-heading-text'],
        },
        'billing-icon': {
          type: 'Icon',
          props: {
            name: 'MapPin',
            size: 'md',
          },
          children: [],
        },
        'billing-heading-text': {
          type: 'Heading',
          props: {
            text: 'Billed to',
            level: 'h2',
          },
          children: [],
        },
        'street-input': {
          type: 'Input',
          props: {
            label: 'Street',
            name: 'street',
            placeholder: '123 Rue de la Paix',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Street is required',
              },
            ],
          },
          children: [],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            placeholder: 'Paris',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'City is required',
              },
            ],
          },
          children: [],
        },
        'country-segmented': {
          type: 'Segmented',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'step-lines': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['lines-field', 'notes-textarea', 'source-field', 'run-alert', 'run-button'],
        },
        'lines-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            placeholder: 'Anything worth flagging',
            rows: 3,
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        'source-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'run-alert': {
          type: 'Alert',
          props: {
            title: 'Needs the invoice and its source document',
            message: 'Both are required before this can run.',
            type: 'info',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Log this invoice',
            variant: 'primary',
          },
          children: [],
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
        },
      },
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["header","invoice-steps"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Build the invoice package","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Capture the commercial details, then attach the document they came from.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/invoice-steps","value":{"type":"Steps","props":{"steps":["Invoice","Source","Send"],"nextLabel":"Next","backLabel":"Back"},"children":["invoice-panel","source-panel","launch-panel"]}}\n{"op":"add","path":"/elements/invoice-panel","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["invoice-work","invoice-side"]}}\n{"op":"add","path":"/elements/invoice-work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["invoice-card","billed-card","lines-card"]}}\n{"op":"add","path":"/elements/invoice-card","value":{"type":"Card","props":{},"children":["invoice-card-title","invoice-reference","invoice-core-grid"]}}\n{"op":"add","path":"/elements/invoice-card-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["invoice-icon","invoice-heading"]}}\n{"op":"add","path":"/elements/invoice-icon","value":{"type":"Icon","props":{"name":"Receipt","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/invoice-heading","value":{"type":"Heading","props":{"text":"Invoice","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/invoice-reference","value":{"type":"Input","props":{"label":"Reference","name":"invoice_reference","placeholder":"INV-2026-001","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Add the invoice reference."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/invoice-core-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["invoice-total","invoice-status"]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"NumberInput","props":{"label":"Amount due","name":"invoice_total","placeholder":"0.00","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-status","value":{"type":"Radio","props":{"label":"Status","name":"invoice_status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"},"checks":[{"type":"required","message":"Choose the invoice status."}],"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/billed-card","value":{"type":"Card","props":{},"children":["billed-title","billed-street","billed-grid"]}}\n{"op":"add","path":"/elements/billed-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["billed-icon","billed-heading"]}}\n{"op":"add","path":"/elements/billed-icon","value":{"type":"Icon","props":{"name":"Building2","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/billed-heading","value":{"type":"Heading","props":{"text":"Billed to","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/billed-street","value":{"type":"Input","props":{"label":"Street and number","name":"billed_to_street","placeholder":"24 Rue de Rivoli","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Add the billing street."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/billed-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["billed-city","billed-country"]}}\n{"op":"add","path":"/elements/billed-city","value":{"type":"Input","props":{"label":"City","name":"billed_to_city","placeholder":"Paris","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Add the billing city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/billed-country","value":{"type":"Select","props":{"label":"Country","name":"billed_to_country","placeholder":"Choose a country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"},"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/lines-card","value":{"type":"Card","props":{},"children":["lines-title","lines-field"]}}\n{"op":"add","path":"/elements/lines-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["lines-icon","lines-heading"]}}\n{"op":"add","path":"/elements/lines-icon","value":{"type":"Icon","props":{"name":"ListChecks","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Billable lines","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/invoice-side","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["date-payment-card","notes-collapse"]}}\n{"op":"add","path":"/elements/date-payment-card","value":{"type":"Card","props":{},"children":["dates-title","issued-field","paid-switch","settled-field"]}}\n{"op":"add","path":"/elements/dates-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["dates-icon","dates-heading"]}}\n{"op":"add","path":"/elements/dates-icon","value":{"type":"Icon","props":{"name":"Calendar","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/dates-heading","value":{"type":"Heading","props":{"text":"Dates and payment","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/issued-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Settled","name":"invoice_paid","checked":{"$bindState":"/inputs/invoice/paid"},"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/settled-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[],"visible":{"$state":"/inputs/invoice/paid","eq":true}}}\n{"op":"add","path":"/elements/notes-collapse","value":{"type":"Collapsible","props":{"title":"Notes","defaultOpen":false},"children":["notes-field"]}}\n{"op":"add","path":"/elements/notes-field","value":{"type":"Textarea","props":{"label":"Free-form notes","name":"invoice_notes","placeholder":"Anything the source document does not say cleanly.","rows":4,"value":{"$bindState":"/inputs/invoice/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/source-panel","value":{"type":"Split","props":{"ratio":"1:2","gap":"xl"},"children":["source-context","source-upload-card"]}}\n{"op":"add","path":"/elements/source-context","value":{"type":"Card","props":{},"children":["source-context-title","source-context-text"]}}\n{"op":"add","path":"/elements/source-context-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["source-context-icon","source-context-heading"]}}\n{"op":"add","path":"/elements/source-context-icon","value":{"type":"Icon","props":{"name":"Paperclip","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/source-context-heading","value":{"type":"Heading","props":{"text":"Original proof","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/source-context-text","value":{"type":"Text","props":{"text":"Attach the document the invoice details were taken from.","variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/source-upload-card","value":{"type":"Card","props":{},"children":["source-upload-title","source-field"]}}\n{"op":"add","path":"/elements/source-upload-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["source-upload-icon","source-upload-heading"]}}\n{"op":"add","path":"/elements/source-upload-icon","value":{"type":"Icon","props":{"name":"FileText","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/source-upload-heading","value":{"type":"Heading","props":{"text":"Source document","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/launch-panel","value":{"type":"Split","props":{"ratio":"1:1","gap":"xl"},"children":["launch-recap-card","launch-action-card"]}}\n{"op":"add","path":"/elements/launch-recap-card","value":{"type":"Card","props":{},"children":["recap-title","recap-reference","recap-total"]}}\n{"op":"add","path":"/elements/recap-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["recap-icon","recap-heading"]}}\n{"op":"add","path":"/elements/recap-icon","value":{"type":"Icon","props":{"name":"CheckCircle2","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/recap-heading","value":{"type":"Heading","props":{"text":"Ready to send","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/recap-reference","value":{"type":"Text","props":{"text":{"$template":"Invoice ${/inputs/invoice/reference}"},"variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/recap-total","value":{"type":"Metric","props":{"label":"Amount due","value":{"$state":"/inputs/invoice/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/launch-action-card","value":{"type":"Card","props":{},"children":["launch-title","launch-copy","launch-button"]}}\n{"op":"add","path":"/elements/launch-title","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["launch-icon","launch-heading"]}}\n{"op":"add","path":"/elements/launch-icon","value":{"type":"Icon","props":{"name":"Rocket","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/launch-heading","value":{"type":"Heading","props":{"text":"Create the package","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/launch-copy","value":{"type":"Text","props":{"text":"The run waits for the invoice and the source document.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/launch-button","value":{"type":"Button","props":{"label":"Build invoice package","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
          children: ['header', 'invoice-steps'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Build the invoice package',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Capture the commercial details, then attach the document they came from.',
            variant: 'lead',
          },
          children: [],
        },
        'invoice-steps': {
          type: 'Steps',
          props: {
            steps: ['Invoice', 'Source', 'Send'],
            nextLabel: 'Next',
            backLabel: 'Back',
          },
          children: ['invoice-panel', 'source-panel', 'launch-panel'],
        },
        'invoice-panel': {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['invoice-work', 'invoice-side'],
        },
        'invoice-work': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['invoice-card', 'billed-card', 'lines-card'],
        },
        'invoice-card': {
          type: 'Card',
          props: {},
          children: ['invoice-card-title', 'invoice-reference', 'invoice-core-grid'],
        },
        'invoice-card-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['invoice-icon', 'invoice-heading'],
        },
        'invoice-icon': {
          type: 'Icon',
          props: {
            name: 'Receipt',
            size: 'md',
          },
          children: [],
        },
        'invoice-heading': {
          type: 'Heading',
          props: {
            text: 'Invoice',
            level: 'h2',
          },
          children: [],
        },
        'invoice-reference': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'invoice_reference',
            placeholder: 'INV-2026-001',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the invoice reference.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'invoice-core-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['invoice-total', 'invoice-status'],
        },
        'invoice-total': {
          type: 'NumberInput',
          props: {
            label: 'Amount due',
            name: 'invoice_total',
            placeholder: '0.00',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'invoice-status': {
          type: 'Radio',
          props: {
            label: 'Status',
            name: 'invoice_status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
            checks: [
              {
                type: 'required',
                message: 'Choose the invoice status.',
              },
            ],
            validateOn: 'change',
          },
          children: [],
        },
        'billed-card': {
          type: 'Card',
          props: {},
          children: ['billed-title', 'billed-street', 'billed-grid'],
        },
        'billed-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['billed-icon', 'billed-heading'],
        },
        'billed-icon': {
          type: 'Icon',
          props: {
            name: 'Building2',
            size: 'md',
          },
          children: [],
        },
        'billed-heading': {
          type: 'Heading',
          props: {
            text: 'Billed to',
            level: 'h2',
          },
          children: [],
        },
        'billed-street': {
          type: 'Input',
          props: {
            label: 'Street and number',
            name: 'billed_to_street',
            placeholder: '24 Rue de Rivoli',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the billing street.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'billed-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['billed-city', 'billed-country'],
        },
        'billed-city': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'billed_to_city',
            placeholder: 'Paris',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the billing city.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'billed-country': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'billed_to_country',
            placeholder: 'Choose a country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
            validateOn: 'change',
          },
          children: [],
        },
        'lines-card': {
          type: 'Card',
          props: {},
          children: ['lines-title', 'lines-field'],
        },
        'lines-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['lines-icon', 'lines-heading'],
        },
        'lines-icon': {
          type: 'Icon',
          props: {
            name: 'ListChecks',
            size: 'md',
          },
          children: [],
        },
        'lines-heading': {
          type: 'Heading',
          props: {
            text: 'Billable lines',
            level: 'h2',
          },
          children: [],
        },
        'lines-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'invoice-side': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['date-payment-card', 'notes-collapse'],
        },
        'date-payment-card': {
          type: 'Card',
          props: {},
          children: ['dates-title', 'issued-field', 'paid-switch', 'settled-field'],
        },
        'dates-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['dates-icon', 'dates-heading'],
        },
        'dates-icon': {
          type: 'Icon',
          props: {
            name: 'Calendar',
            size: 'md',
          },
          children: [],
        },
        'dates-heading': {
          type: 'Heading',
          props: {
            text: 'Dates and payment',
            level: 'h2',
          },
          children: [],
        },
        'issued-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Settled',
            name: 'invoice_paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
            validateOn: 'change',
          },
          children: [],
        },
        'settled-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
          visible: {
            $state: '/inputs/invoice/paid',
            eq: true,
          },
        },
        'notes-collapse': {
          type: 'Collapsible',
          props: {
            title: 'Notes',
            defaultOpen: false,
          },
          children: ['notes-field'],
        },
        'notes-field': {
          type: 'Textarea',
          props: {
            label: 'Free-form notes',
            name: 'invoice_notes',
            placeholder: 'Anything the source document does not say cleanly.',
            rows: 4,
            value: {
              $bindState: '/inputs/invoice/notes',
            },
            validateOn: 'blur',
          },
          children: [],
        },
        'source-panel': {
          type: 'Split',
          props: {
            ratio: '1:2',
            gap: 'xl',
          },
          children: ['source-context', 'source-upload-card'],
        },
        'source-context': {
          type: 'Card',
          props: {},
          children: ['source-context-title', 'source-context-text'],
        },
        'source-context-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['source-context-icon', 'source-context-heading'],
        },
        'source-context-icon': {
          type: 'Icon',
          props: {
            name: 'Paperclip',
            size: 'md',
          },
          children: [],
        },
        'source-context-heading': {
          type: 'Heading',
          props: {
            text: 'Original proof',
            level: 'h2',
          },
          children: [],
        },
        'source-context-text': {
          type: 'Text',
          props: {
            text: 'Attach the document the invoice details were taken from.',
            variant: 'body',
          },
          children: [],
        },
        'source-upload-card': {
          type: 'Card',
          props: {},
          children: ['source-upload-title', 'source-field'],
        },
        'source-upload-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['source-upload-icon', 'source-upload-heading'],
        },
        'source-upload-icon': {
          type: 'Icon',
          props: {
            name: 'FileText',
            size: 'md',
          },
          children: [],
        },
        'source-upload-heading': {
          type: 'Heading',
          props: {
            text: 'Source document',
            level: 'h2',
          },
          children: [],
        },
        'source-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'launch-panel': {
          type: 'Split',
          props: {
            ratio: '1:1',
            gap: 'xl',
          },
          children: ['launch-recap-card', 'launch-action-card'],
        },
        'launch-recap-card': {
          type: 'Card',
          props: {},
          children: ['recap-title', 'recap-reference', 'recap-total'],
        },
        'recap-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['recap-icon', 'recap-heading'],
        },
        'recap-icon': {
          type: 'Icon',
          props: {
            name: 'CheckCircle2',
            size: 'md',
          },
          children: [],
        },
        'recap-heading': {
          type: 'Heading',
          props: {
            text: 'Ready to send',
            level: 'h2',
          },
          children: [],
        },
        'recap-reference': {
          type: 'Text',
          props: {
            text: {
              $template: 'Invoice ${/inputs/invoice/reference}',
            },
            variant: 'lead',
          },
          children: [],
        },
        'recap-total': {
          type: 'Metric',
          props: {
            label: 'Amount due',
            value: {
              $state: '/inputs/invoice/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'launch-action-card': {
          type: 'Card',
          props: {},
          children: ['launch-title', 'launch-copy', 'launch-button'],
        },
        'launch-title': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['launch-icon', 'launch-heading'],
        },
        'launch-icon': {
          type: 'Icon',
          props: {
            name: 'Rocket',
            size: 'md',
          },
          children: [],
        },
        'launch-heading': {
          type: 'Heading',
          props: {
            text: 'Create the package',
            level: 'h2',
          },
          children: [],
        },
        'launch-copy': {
          type: 'Text',
          props: {
            text: 'The run waits for the invoice and the source document.',
            variant: 'muted',
          },
          children: [],
        },
        'launch-button': {
          type: 'Button',
          props: {
            label: 'Build invoice package',
            variant: 'primary',
          },
          children: [],
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
        },
      },
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    seed: '8S7y8MfzcnOBiFCiGsDadT7aLyUuTeML',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["header","main-split"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["page-title","page-subtitle"]}}\n{"op":"add","path":"/elements/page-title","value":{"type":"Heading","props":{"text":"Capture the invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/page-subtitle","value":{"type":"Text","props":{"text":"Describe the bill, attach its source, and send one clean record forward.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/main-split","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["steps-shell","rail-stack"]}}\n{"op":"add","path":"/elements/steps-shell","value":{"type":"Card","props":{},"children":["invoice-steps"]}}\n{"op":"add","path":"/elements/invoice-steps","value":{"type":"Steps","props":{"steps":["Invoice","Bill to","Lines & source"],"nextLabel":"Continue","backLabel":"Back"},"children":["basics-panel","billing-panel","evidence-panel"]}}\n{"op":"add","path":"/elements/basics-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["basics-heading-row","reference-input","details-grid","settled-at-field"]}}\n{"op":"add","path":"/elements/basics-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["basics-icon","basics-heading"]}}\n{"op":"add","path":"/elements/basics-icon","value":{"type":"Icon","props":{"name":"Receipt","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/basics-heading","value":{"type":"Heading","props":{"text":"The bill at a glance","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/reference-input","value":{"type":"Input","props":{"label":"Reference","name":"invoice_reference","placeholder":"INV-2024-001","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Add the invoice reference"}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/details-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["status-choice","total-number","issued-date-field","paid-switch"]}}\n{"op":"add","path":"/elements/status-choice","value":{"type":"Segmented","props":{"label":"Status","name":"invoice_status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/total-number","value":{"type":"NumberInput","props":{"label":"Total due","name":"invoice_total","value":{"$bindState":"/inputs/invoice/total"},"placeholder":"0.00"},"children":[]}}\n{"op":"add","path":"/elements/issued-date-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Settled","name":"invoice_paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/settled-at-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[],"visible":{"$state":"/inputs/invoice/paid","eq":true}}}\n{"op":"add","path":"/elements/billing-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["billing-heading-row","street-input","place-grid"]}}\n{"op":"add","path":"/elements/billing-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["billing-icon","billing-heading"]}}\n{"op":"add","path":"/elements/billing-icon","value":{"type":"Icon","props":{"name":"Building2","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/billing-heading","value":{"type":"Heading","props":{"text":"Who receives it","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/street-input","value":{"type":"Input","props":{"label":"Street","name":"billed_to_street","placeholder":"Street and number","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Add the street and number"}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/place-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"billed_to_city","placeholder":"City","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Add the city"}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"billed_to_country","options":["France","Germany","Spain","United Kingdom"],"placeholder":"Choose a country","value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/evidence-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["evidence-heading-row","lines-field","notes-input","source-field","run-separator","run-copy","run-button"]}}\n{"op":"add","path":"/elements/evidence-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["evidence-icon","evidence-heading"]}}\n{"op":"add","path":"/elements/evidence-icon","value":{"type":"Icon","props":{"name":"Paperclip","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/evidence-heading","value":{"type":"Heading","props":{"text":"What proves the charge","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/notes-input","value":{"type":"Textarea","props":{"label":"Notes","name":"invoice_notes","placeholder":"Anything useful to carry with this invoice","rows":4,"value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/run-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/run-copy","value":{"type":"Text","props":{"text":"The run needs the invoice details and the source document.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Create the invoice record","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/rail-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["glance-card","source-card"]}}\n{"op":"add","path":"/elements/glance-card","value":{"type":"Card","props":{},"children":["glance-heading-row","amount-metric","rail-reference","status-row"]}}\n{"op":"add","path":"/elements/glance-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["glance-icon","glance-heading"]}}\n{"op":"add","path":"/elements/glance-icon","value":{"type":"Icon","props":{"name":"Wallet","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/glance-heading","value":{"type":"Heading","props":{"text":"At a glance","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/amount-metric","value":{"type":"Metric","props":{"label":"Amount due","value":{"$state":"/inputs/invoice/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/rail-reference","value":{"type":"Text","props":{"text":{"$template":"Reference ${/inputs/invoice/reference}"},"variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/status-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center","justify":"between"},"children":["status-label","status-badge"]}}\n{"op":"add","path":"/elements/status-label","value":{"type":"Text","props":{"text":"Status","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/status-badge","value":{"type":"Badge","props":{"text":{"$state":"/inputs/invoice/status"},"variant":"secondary"},"children":[]}}\n{"op":"add","path":"/elements/source-card","value":{"type":"Card","props":{},"children":["source-heading-row","source-copy"]}}\n{"op":"add","path":"/elements/source-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["source-icon","source-heading"]}}\n{"op":"add","path":"/elements/source-icon","value":{"type":"Icon","props":{"name":"Shield","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/source-heading","value":{"type":"Heading","props":{"text":"Keep the trail intact","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/source-copy","value":{"type":"Text","props":{"text":"Attach the original document in the final step so the record stays audit-ready.","variant":"body"},"children":[]}}',
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
          children: ['header', 'main-split'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['page-title', 'page-subtitle'],
        },
        'page-title': {
          type: 'Heading',
          props: {
            text: 'Capture the invoice',
            level: 'h1',
          },
          children: [],
        },
        'page-subtitle': {
          type: 'Text',
          props: {
            text: 'Describe the bill, attach its source, and send one clean record forward.',
            variant: 'lead',
          },
          children: [],
        },
        'main-split': {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['steps-shell', 'rail-stack'],
        },
        'steps-shell': {
          type: 'Card',
          props: {},
          children: ['invoice-steps'],
        },
        'invoice-steps': {
          type: 'Steps',
          props: {
            steps: ['Invoice', 'Bill to', 'Lines & source'],
            nextLabel: 'Continue',
            backLabel: 'Back',
          },
          children: ['basics-panel', 'billing-panel', 'evidence-panel'],
        },
        'basics-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['basics-heading-row', 'reference-input', 'details-grid', 'settled-at-field'],
        },
        'basics-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['basics-icon', 'basics-heading'],
        },
        'basics-icon': {
          type: 'Icon',
          props: {
            name: 'Receipt',
            size: 'md',
          },
          children: [],
        },
        'basics-heading': {
          type: 'Heading',
          props: {
            text: 'The bill at a glance',
            level: 'h2',
          },
          children: [],
        },
        'reference-input': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'invoice_reference',
            placeholder: 'INV-2024-001',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the invoice reference',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'details-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['status-choice', 'total-number', 'issued-date-field', 'paid-switch'],
        },
        'status-choice': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'invoice_status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'total-number': {
          type: 'NumberInput',
          props: {
            label: 'Total due',
            name: 'invoice_total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
            placeholder: '0.00',
          },
          children: [],
        },
        'issued-date-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Settled',
            name: 'invoice_paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'settled-at-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
          visible: {
            $state: '/inputs/invoice/paid',
            eq: true,
          },
        },
        'billing-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['billing-heading-row', 'street-input', 'place-grid'],
        },
        'billing-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['billing-icon', 'billing-heading'],
        },
        'billing-icon': {
          type: 'Icon',
          props: {
            name: 'Building2',
            size: 'md',
          },
          children: [],
        },
        'billing-heading': {
          type: 'Heading',
          props: {
            text: 'Who receives it',
            level: 'h2',
          },
          children: [],
        },
        'street-input': {
          type: 'Input',
          props: {
            label: 'Street',
            name: 'billed_to_street',
            placeholder: 'Street and number',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the street and number',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'place-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['city-input', 'country-select'],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'billed_to_city',
            placeholder: 'City',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the city',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'country-select': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'billed_to_country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            placeholder: 'Choose a country',
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'evidence-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'evidence-heading-row',
            'lines-field',
            'notes-input',
            'source-field',
            'run-separator',
            'run-copy',
            'run-button',
          ],
        },
        'evidence-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['evidence-icon', 'evidence-heading'],
        },
        'evidence-icon': {
          type: 'Icon',
          props: {
            name: 'Paperclip',
            size: 'md',
          },
          children: [],
        },
        'evidence-heading': {
          type: 'Heading',
          props: {
            text: 'What proves the charge',
            level: 'h2',
          },
          children: [],
        },
        'lines-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'notes-input': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'invoice_notes',
            placeholder: 'Anything useful to carry with this invoice',
            rows: 4,
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        'source-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'run-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'run-copy': {
          type: 'Text',
          props: {
            text: 'The run needs the invoice details and the source document.',
            variant: 'muted',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Create the invoice record',
            variant: 'primary',
          },
          children: [],
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
        },
        'rail-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['glance-card', 'source-card'],
        },
        'glance-card': {
          type: 'Card',
          props: {},
          children: ['glance-heading-row', 'amount-metric', 'rail-reference', 'status-row'],
        },
        'glance-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['glance-icon', 'glance-heading'],
        },
        'glance-icon': {
          type: 'Icon',
          props: {
            name: 'Wallet',
            size: 'md',
          },
          children: [],
        },
        'glance-heading': {
          type: 'Heading',
          props: {
            text: 'At a glance',
            level: 'h2',
          },
          children: [],
        },
        'amount-metric': {
          type: 'Metric',
          props: {
            label: 'Amount due',
            value: {
              $state: '/inputs/invoice/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'rail-reference': {
          type: 'Text',
          props: {
            text: {
              $template: 'Reference ${/inputs/invoice/reference}',
            },
            variant: 'muted',
          },
          children: [],
        },
        'status-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
            justify: 'between',
          },
          children: ['status-label', 'status-badge'],
        },
        'status-label': {
          type: 'Text',
          props: {
            text: 'Status',
            variant: 'muted',
          },
          children: [],
        },
        'status-badge': {
          type: 'Badge',
          props: {
            text: {
              $state: '/inputs/invoice/status',
            },
            variant: 'secondary',
          },
          children: [],
        },
        'source-card': {
          type: 'Card',
          props: {},
          children: ['source-heading-row', 'source-copy'],
        },
        'source-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['source-icon', 'source-heading'],
        },
        'source-icon': {
          type: 'Icon',
          props: {
            name: 'Shield',
            size: 'md',
          },
          children: [],
        },
        'source-heading': {
          type: 'Heading',
          props: {
            text: 'Keep the trail intact',
            level: 'h2',
          },
          children: [],
        },
        'source-copy': {
          type: 'Text',
          props: {
            text: 'Attach the original document in the final step so the record stays audit-ready.',
            variant: 'body',
          },
          children: [],
        },
      },
    },
  },
];
