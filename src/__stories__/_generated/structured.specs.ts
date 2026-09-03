/**
 * Specs the designer method produced for the heroes of data/structures/structured.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = ['structured.invoice_with_source'] as const;

export const SPECS: Record<string, SpecFixture> = {
  'structured.invoice_with_source': {
    pipeRef: 'structured.invoice_with_source',
    source: 'generated',
    model: 'claude-5-sonnet',
    promptHash: 'b452d10a8ff7',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["title","invoice-card","source-card","run-alert","run-button"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Invoice with Source","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/invoice-card","value":{"type":"Card","props":{"title":"Invoice","maxWidth":"lg"},"children":["invoice-basics","invoice-dates","invoice-address-section","invoice-lines-section","invoice-notes"]}}\n{"op":"add","path":"/elements/invoice-basics","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["basics-heading","basics-grid"]}}\n{"op":"add","path":"/elements/basics-heading","value":{"type":"Heading","props":{"text":"Details","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/basics-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["reference-input","total-input","status-select","paid-switch"]}}\n{"op":"add","path":"/elements/reference-input","value":{"type":"Input","props":{"label":"Reference","name":"reference","type":"text","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Reference is required"}]},"children":[]}}\n{"op":"add","path":"/elements/total-input","value":{"type":"Input","props":{"label":"Total","name":"total","type":"number","value":{"$bindState":"/inputs/invoice/total"},"checks":[{"type":"required","message":"Total is required"}]},"children":[]}}\n{"op":"add","path":"/elements/status-select","value":{"type":"Select","props":{"label":"Status","name":"status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"},"checks":[{"type":"required","message":"Status is required"}]},"children":[]}}\n{"op":"add","path":"/elements/paid-switch","value":{"type":"Switch","props":{"label":"Paid","name":"paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-dates","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md"},"children":["issued-on-field","settled-at-field"]}}\n{"op":"add","path":"/elements/issued-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/settled-at-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[]}}\n{"op":"add","path":"/elements/invoice-address-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["address-heading","address-grid"]}}\n{"op":"add","path":"/elements/address-heading","value":{"type":"Heading","props":{"text":"Billed To","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/address-grid","value":{"type":"Grid","props":{"columns":3,"gap":"md"},"children":["street-input","city-input","country-select"]}}\n{"op":"add","path":"/elements/street-input","value":{"type":"Input","props":{"label":"Street","name":"street","type":"text","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Street is required"}]},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"City is required"}]},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-lines-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["lines-heading","lines-field"]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Line Items","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-field","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/invoice-notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","placeholder":"Any additional notes","rows":3,"value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/source-card","value":{"type":"Card","props":{"title":"Source Document","maxWidth":"lg"},"children":["source-field"]}}\n{"op":"add","path":"/elements/source-field","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/run-alert","value":{"type":"Alert","props":{"title":"Ready to run?","message":"The run requires the invoice and the source document.","type":"info"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Run","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['title', 'invoice-card', 'source-card', 'run-alert', 'run-button'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Invoice with Source',
            level: 'h1',
          },
          children: [],
        },
        'invoice-card': {
          type: 'Card',
          props: {
            title: 'Invoice',
            maxWidth: 'lg',
          },
          children: [
            'invoice-basics',
            'invoice-dates',
            'invoice-address-section',
            'invoice-lines-section',
            'invoice-notes',
          ],
        },
        'invoice-basics': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['basics-heading', 'basics-grid'],
        },
        'basics-heading': {
          type: 'Heading',
          props: {
            text: 'Details',
            level: 'h2',
          },
          children: [],
        },
        'basics-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['reference-input', 'total-input', 'status-select', 'paid-switch'],
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
                message: 'Reference is required',
              },
            ],
          },
          children: [],
        },
        'total-input': {
          type: 'Input',
          props: {
            label: 'Total',
            name: 'total',
            type: 'number',
            value: {
              $bindState: '/inputs/invoice/total',
            },
            checks: [
              {
                type: 'required',
                message: 'Total is required',
              },
            ],
          },
          children: [],
        },
        'status-select': {
          type: 'Select',
          props: {
            label: 'Status',
            name: 'status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
            checks: [
              {
                type: 'required',
                message: 'Status is required',
              },
            ],
          },
          children: [],
        },
        'paid-switch': {
          type: 'Switch',
          props: {
            label: 'Paid',
            name: 'paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'invoice-dates': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
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
        'invoice-address-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['address-heading', 'address-grid'],
        },
        'address-heading': {
          type: 'Heading',
          props: {
            text: 'Billed To',
            level: 'h2',
          },
          children: [],
        },
        'address-grid': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'md',
          },
          children: ['street-input', 'city-input', 'country-select'],
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
            type: 'text',
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
        'country-select': {
          type: 'Select',
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
        'invoice-lines-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['lines-heading', 'lines-field'],
        },
        'lines-heading': {
          type: 'Heading',
          props: {
            text: 'Line Items',
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
        'invoice-notes': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            placeholder: 'Any additional notes',
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
            title: 'Source Document',
            maxWidth: 'lg',
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
        'run-alert': {
          type: 'Alert',
          props: {
            title: 'Ready to run?',
            message: 'The run requires the invoice and the source document.',
            type: 'info',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Run',
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
};
