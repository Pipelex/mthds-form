/**
 * Specs captured for the heroes of src/__stories__/_structures/structured.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = ['structured.invoice_with_source'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/structured.invoice_with_source.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","workspace"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["hero"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Prepare an invoice"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["invoice-work","source-rail"]}}\n{"op":"add","path":"/elements/invoice-work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["invoice-details","billed-to","billable-lines","payment","optional-note"]}}\n{"op":"add","path":"/elements/invoice-details","value":{"type":"Section","props":{"title":"Invoice details"},"children":["invoice-details-grid","invoice-status"]}}\n{"op":"add","path":"/elements/invoice-details-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["invoice-reference","invoice-issued-on"]}}\n{"op":"add","path":"/elements/invoice-reference","value":{"type":"Input","props":{"label":"Reference *","name":"invoice.reference","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Enter an invoice reference."}]},"children":[]}}\n{"op":"add","path":"/elements/invoice-issued-on","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on","label":"Issued on"},"children":[]}}\n{"op":"add","path":"/elements/invoice-status","value":{"type":"Segmented","props":{"label":"Status *","name":"invoice.status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/billed-to","value":{"type":"Section","props":{"title":"Billed to"},"children":["address-grid","address-country"]}}\n{"op":"add","path":"/elements/address-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["address-street","address-city"]}}\n{"op":"add","path":"/elements/address-street","value":{"type":"Input","props":{"label":"Street and number *","name":"invoice.billed_to.street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Enter a street and number."}]},"children":[]}}\n{"op":"add","path":"/elements/address-city","value":{"type":"Input","props":{"label":"City *","name":"invoice.billed_to.city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Enter a city."}]},"children":[]}}\n{"op":"add","path":"/elements/address-country","value":{"type":"Segmented","props":{"label":"Country (optional)","name":"invoice.billed_to.country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"Section","props":{"title":"Billable lines"},"children":["line-items"]}}\n{"op":"add","path":"/elements/line-items","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines","label":"Line items"},"children":[]}}\n{"op":"add","path":"/elements/payment","value":{"type":"Section","props":{"title":"Payment"},"children":["payment-grid"]}}\n{"op":"add","path":"/elements/payment-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["invoice-total","payment-cleared","payment-cleared-at"]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"NumberInput","props":{"label":"Total amount due *","name":"invoice.total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/payment-cleared","value":{"type":"Checkbox","props":{"label":"Payment has cleared","name":"invoice.paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/payment-cleared-at","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at","label":"Cleared at (optional)"},"children":[]}}\n{"op":"add","path":"/elements/optional-note","value":{"type":"Collapsible","props":{"title":"Add a note (optional)","defaultOpen":false},"children":["invoice-notes"]}}\n{"op":"add","path":"/elements/invoice-notes","value":{"type":"Input","props":{"label":"Notes","name":"invoice.notes","value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/source-rail","value":{"type":"Rail","props":{"title":"Source document"},"children":["source-document","prepare-invoice"]}}\n{"op":"add","path":"/elements/source-document","value":{"type":"MthdsField","props":{"path":"/inputs/source","label":"Document"},"children":[]}}\n{"op":"add","path":"/elements/prepare-invoice","value":{"type":"Cta","props":{"label":"Prepare invoice","hint":"Invoice details and a source document are required."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'workspace'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['hero'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Prepare an invoice',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['invoice-work', 'source-rail'],
        },
        'invoice-work': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['invoice-details', 'billed-to', 'billable-lines', 'payment', 'optional-note'],
        },
        'invoice-details': {
          type: 'Section',
          props: {
            title: 'Invoice details',
          },
          children: ['invoice-details-grid', 'invoice-status'],
        },
        'invoice-details-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['invoice-reference', 'invoice-issued-on'],
        },
        'invoice-reference': {
          type: 'Input',
          props: {
            label: 'Reference *',
            name: 'invoice.reference',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter an invoice reference.',
              },
            ],
          },
          children: [],
        },
        'invoice-issued-on': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
            label: 'Issued on',
          },
          children: [],
        },
        'invoice-status': {
          type: 'Segmented',
          props: {
            label: 'Status *',
            name: 'invoice.status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'billed-to': {
          type: 'Section',
          props: {
            title: 'Billed to',
          },
          children: ['address-grid', 'address-country'],
        },
        'address-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['address-street', 'address-city'],
        },
        'address-street': {
          type: 'Input',
          props: {
            label: 'Street and number *',
            name: 'invoice.billed_to.street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter a street and number.',
              },
            ],
          },
          children: [],
        },
        'address-city': {
          type: 'Input',
          props: {
            label: 'City *',
            name: 'invoice.billed_to.city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter a city.',
              },
            ],
          },
          children: [],
        },
        'address-country': {
          type: 'Segmented',
          props: {
            label: 'Country (optional)',
            name: 'invoice.billed_to.country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'billable-lines': {
          type: 'Section',
          props: {
            title: 'Billable lines',
          },
          children: ['line-items'],
        },
        'line-items': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
            label: 'Line items',
          },
          children: [],
        },
        payment: {
          type: 'Section',
          props: {
            title: 'Payment',
          },
          children: ['payment-grid'],
        },
        'payment-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['invoice-total', 'payment-cleared', 'payment-cleared-at'],
        },
        'invoice-total': {
          type: 'NumberInput',
          props: {
            label: 'Total amount due *',
            name: 'invoice.total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'payment-cleared': {
          type: 'Checkbox',
          props: {
            label: 'Payment has cleared',
            name: 'invoice.paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'payment-cleared-at': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
            label: 'Cleared at (optional)',
          },
          children: [],
        },
        'optional-note': {
          type: 'Collapsible',
          props: {
            title: 'Add a note (optional)',
            defaultOpen: false,
          },
          children: ['invoice-notes'],
        },
        'invoice-notes': {
          type: 'Input',
          props: {
            label: 'Notes',
            name: 'invoice.notes',
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        'source-rail': {
          type: 'Rail',
          props: {
            title: 'Source document',
          },
          children: ['source-document', 'prepare-invoice'],
        },
        'source-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
            label: 'Document',
          },
          children: [],
        },
        'prepare-invoice': {
          type: 'Cta',
          props: {
            label: 'Prepare invoice',
            hint: 'Invoice details and a source document are required.',
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
    plan: {
      purpose:
        'Help someone turn a commercial invoice and its source document into a complete, structured invoice without losing sight of the original.',
      title: 'Prepare an invoice',
      composition:
        'Place a compact Hero above a Workspace with the invoice work on the left and a sticky source-document Rail on the right; stack the rail after the work on narrow screens. Use flat Sections, generous space between stages, and compact two-column Grids within them, collapsing grids to one column on narrow screens. Lead with the invoice reference and status, then the billing address and billable lines, followed by payment details; fold only optional notes away. The source Rail is the only boxed surface and holds the document control and the sole Cta beneath it. Keep labels concise, mark required inputs, use theme-native component styling, and introduce no currency or computed amounts.',
      regions: [
        {
          title: null,
          purpose: 'Name the task without adding instructions or a competing header.',
          container: 'Stack',
          elements: ['Hero — headline: "Prepare an invoice"; no subtitle or eyebrow.'],
        },
        {
          title: 'Invoice details',
          purpose:
            'Establish which invoice this is and where it stands before entering its contents.',
          container: 'Section',
          elements: [
            'Grid — two columns, holding Reference and Issued on; one column on narrow screens.',
            'Input — /inputs/invoice/reference; label: "Reference"; required validation.',
            'MthdsField — /inputs/invoice/issued_on; label: "Issued on".',
            'Segmented — /inputs/invoice/status; label: "Status"; options exactly: "draft", "sent", "paid", "void"; required validation; full width beneath the Grid.',
          ],
        },
        {
          title: 'Billed to',
          purpose: "Keep the recipient's address together, ahead of the billable lines.",
          container: 'Section',
          elements: [
            'Input — /inputs/invoice/billed_to/street; label: "Street and number"; required validation.',
            'Input — /inputs/invoice/billed_to/city; label: "City"; required validation.',
            'Segmented — /inputs/invoice/billed_to/country; label: "Country (optional)"; options exactly: "France", "Germany", "Spain", "United Kingdom"; full width.',
          ],
        },
        {
          title: 'Billable lines',
          purpose: "Give the invoice's itemized contents the full width of the work column.",
          container: 'Section',
          elements: ['MthdsField — /inputs/invoice/lines; label: "Line items".'],
        },
        {
          title: 'Payment',
          purpose:
            'Collect the stated total and settlement facts together without deriving payment status or currency.',
          container: 'Section',
          elements: [
            'NumberInput — /inputs/invoice/total; label: "Total amount due"; required validation; no unit, minimum, maximum, or step.',
            'Checkbox — /inputs/invoice/paid; label: "Payment has cleared"; optional; does not hide or alter any other input.',
            'MthdsField — /inputs/invoice/settled_at; label: "Cleared at (optional)"; always visible within this section.',
          ],
        },
        {
          title: 'Add a note (optional)',
          purpose: 'Keep a nonessential note available without crowding the main invoice work.',
          container: 'Collapsible',
          elements: [
            'Input — /inputs/invoice/notes; label: "Notes"; optional; Collapsible starts closed.',
          ],
        },
        {
          title: 'Source document',
          purpose:
            'Keep the original document and the single run control together beside the invoice work.',
          container: 'Rail',
          elements: [
            'MthdsField — /inputs/source; label: "Document".',
            'Cta — label: "Prepare invoice"; hint: "Invoice details and a source document are required."; on.press: validateForm then run.',
          ],
        },
      ],
      call_to_action: 'Prepare invoice — Invoice details and a source document are required.',
      defaults: [],
      delegated: [
        '/inputs/invoice/issued_on — date; explicitly delegated by the brief.',
        '/inputs/invoice/settled_at — date with time; explicitly delegated by the brief.',
        '/inputs/invoice/lines — structured line-item list; explicitly delegated by the brief.',
        '/inputs/source — source document file; explicitly delegated by the brief.',
      ],
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'NKONR0nHRFFCfh3dkHC2BVcPAZCJ7Hn4',
    frame: 'composer',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/structured.invoice_with_source.composer.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Describe your invoice","lede":"Invoice details, backed by the original document.","columns":"1","runLabel":"Describe my invoice"},"children":["invoice-grid","line-items-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/invoice-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["source-group","invoice-group","bill-to-group","payment-group"]}}\n{"op":"add","path":"/elements/source-group","value":{"type":"FieldGroup","props":{"title":"Source"},"children":["original-document"]}}\n{"op":"add","path":"/elements/original-document","value":{"type":"MthdsField","props":{"path":"/inputs/source","label":"Original document"},"children":[]}}\n{"op":"add","path":"/elements/invoice-group","value":{"type":"FieldGroup","props":{"title":"Invoice"},"children":["invoice-reference","invoice-issued-on","invoice-total","invoice-status"]}}\n{"op":"add","path":"/elements/invoice-reference","value":{"type":"Input","props":{"label":"Reference","name":"invoice-reference","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Enter the invoice reference."}]},"children":[]}}\n{"op":"add","path":"/elements/invoice-issued-on","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on","label":"Issued on"},"children":[]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"NumberInput","props":{"label":"Total due","name":"invoice-total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-status","value":{"type":"Segmented","props":{"label":"Status","name":"invoice-status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/bill-to-group","value":{"type":"FieldGroup","props":{"title":"Bill to"},"children":["billing-street","billing-city","billing-country"]}}\n{"op":"add","path":"/elements/billing-street","value":{"type":"Input","props":{"label":"Street and number","name":"billing-street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Enter the street and number."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-city","value":{"type":"Input","props":{"label":"City","name":"billing-city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Enter the city."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-country","value":{"type":"Select","props":{"label":"Country","name":"billing-country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/payment-group","value":{"type":"FieldGroup","props":{"title":"Payment"},"children":["payment-settled","payment-cleared-at"]}}\n{"op":"add","path":"/elements/payment-settled","value":{"type":"Checkbox","props":{"label":"Payment settled","name":"payment-settled","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/payment-cleared-at","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at","label":"Payment cleared at"},"children":[]}}\n{"op":"add","path":"/elements/line-items-group","value":{"type":"FieldGroup","props":{"title":"Line items"},"children":["billable-lines","invoice-notes"]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines","label":"Billable lines"},"children":[]}}\n{"op":"add","path":"/elements/invoice-notes","value":{"type":"Input","props":{"label":"Notes","name":"invoice-notes","value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Describe your invoice',
            lede: 'Invoice details, backed by the original document.',
            columns: '1',
            runLabel: 'Describe my invoice',
          },
          children: ['invoice-grid', 'line-items-group'],
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
        'invoice-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['source-group', 'invoice-group', 'bill-to-group', 'payment-group'],
        },
        'source-group': {
          type: 'FieldGroup',
          props: {
            title: 'Source',
          },
          children: ['original-document'],
        },
        'original-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
            label: 'Original document',
          },
          children: [],
        },
        'invoice-group': {
          type: 'FieldGroup',
          props: {
            title: 'Invoice',
          },
          children: ['invoice-reference', 'invoice-issued-on', 'invoice-total', 'invoice-status'],
        },
        'invoice-reference': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'invoice-reference',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the invoice reference.',
              },
            ],
          },
          children: [],
        },
        'invoice-issued-on': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
            label: 'Issued on',
          },
          children: [],
        },
        'invoice-total': {
          type: 'NumberInput',
          props: {
            label: 'Total due',
            name: 'invoice-total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'invoice-status': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'invoice-status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'bill-to-group': {
          type: 'FieldGroup',
          props: {
            title: 'Bill to',
          },
          children: ['billing-street', 'billing-city', 'billing-country'],
        },
        'billing-street': {
          type: 'Input',
          props: {
            label: 'Street and number',
            name: 'billing-street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the street and number.',
              },
            ],
          },
          children: [],
        },
        'billing-city': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'billing-city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the city.',
              },
            ],
          },
          children: [],
        },
        'billing-country': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'billing-country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'payment-group': {
          type: 'FieldGroup',
          props: {
            title: 'Payment',
          },
          children: ['payment-settled', 'payment-cleared-at'],
        },
        'payment-settled': {
          type: 'Checkbox',
          props: {
            label: 'Payment settled',
            name: 'payment-settled',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'payment-cleared-at': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
            label: 'Payment cleared at',
          },
          children: [],
        },
        'line-items-group': {
          type: 'FieldGroup',
          props: {
            title: 'Line items',
          },
          children: ['billable-lines', 'invoice-notes'],
        },
        'billable-lines': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
            label: 'Billable lines',
          },
          children: [],
        },
        'invoice-notes': {
          type: 'Input',
          props: {
            label: 'Notes',
            name: 'invoice-notes',
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone handling an invoice turn its details and source document into a text description.',
      title: 'Describe your invoice',
      composition:
        'Use one centred Composer with a short, heavy headline and the line “Invoice details, backed by the original document.” Keep its raised panel compact: Composer columns="1" contains a two-column Grid with Source then Invoice in the first row, and Bill to then Payment in the second row; below the Grid, place a full-width Line items FieldGroup. The Grid becomes one column on narrow screens, preserving that order. Use small h2 group titles, no nested cards, no collapsed inputs and no repeated values. The Composer\'s sticky host action row is the only run location, with on.press bound to validateForm then run; add no notes or surrounding chrome.',
      regions: [
        {
          title: null,
          purpose:
            "Carry the page headline, the single input surface and the host's persistent run action.",
          container: 'Composer',
          elements: [
            'Composer: title="Describe your invoice"; description="Invoice details, backed by the original document."; columns="1"; contains the two-column Grid followed by the Line items FieldGroup; runLabel="Describe my invoice"; on.press=validateForm then run.',
            'Grid: two columns, collapsing to one on narrow screens; holds Source, Invoice, Bill to and Payment FieldGroups in that order.',
          ],
        },
        {
          title: 'Source',
          purpose: "Put the original document first, alongside the invoice's identifying details.",
          container: 'FieldGroup',
          elements: [
            'MthdsField: /inputs/source; label="Original document"; required; delegated document control.',
          ],
        },
        {
          title: 'Invoice',
          purpose:
            'Keep identification, issue date, amount and current status together in the top-right group.',
          container: 'FieldGroup',
          elements: [
            'Input: $bindState /inputs/invoice/reference; label="Reference"; required.',
            'MthdsField: /inputs/invoice/issued_on; label="Issued on"; required; delegated date control.',
            'NumberInput: $bindState /inputs/invoice/total; label="Total due"; required; no unit, min, max or step.',
            'Segmented: $bindState /inputs/invoice/status; label="Status"; options exactly ["draft", "sent", "paid", "void"]; required.',
          ],
        },
        {
          title: 'Bill to',
          purpose: "Collect the recipient's address in the second row's left column.",
          container: 'FieldGroup',
          elements: [
            'Input: $bindState /inputs/invoice/billed_to/street; label="Street and number"; required.',
            'Input: $bindState /inputs/invoice/billed_to/city; label="City"; required.',
            'Select: $bindState /inputs/invoice/billed_to/country; label="Country"; options exactly ["France", "Germany", "Spain", "United Kingdom"]; optional; use a dropdown because these labels do not fit one line in the half-width group.',
          ],
        },
        {
          title: 'Payment',
          purpose:
            'Keep settlement details together opposite the address without hiding the optional timestamp.',
          container: 'FieldGroup',
          elements: [
            'Checkbox: $bindState /inputs/invoice/paid on checked; label="Payment settled"; optional; does not change visibility.',
            'MthdsField: /inputs/invoice/settled_at; label="Payment cleared at"; optional; delegated date-with-time control; always visible.',
          ],
        },
        {
          title: 'Line items',
          purpose:
            "Give the billable-line editor the panel's full width, with optional notes immediately beneath it.",
          container: 'FieldGroup',
          elements: [
            'MthdsField: /inputs/invoice/lines; label="Billable lines"; required; delegated list control.',
            'Input: $bindState /inputs/invoice/notes; label="Notes"; optional.',
          ],
        },
      ],
      call_to_action: 'Describe my invoice',
      defaults: null,
      delegated: [
        '/inputs/invoice/issued_on — brief delegates the date control.',
        '/inputs/invoice/settled_at — brief delegates the date-with-time control.',
        '/inputs/invoice/lines — brief delegates the structured line-item list.',
        '/inputs/source — brief delegates the document upload.',
      ],
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: '7CooldYrt14XxGoWcmhPTX4FkEwOUDT6',
    frame: 'composer',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/structured.invoice_with_source.composer.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Describe an invoice","lede":"Pair the invoice details with the original document.","runLabel":"Describe invoice","columns":"1"},"children":["invoice-workspace"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/invoice-workspace","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["source-document","invoice-address-grid","line-items-group"]}}\n{"op":"add","path":"/elements/source-document","value":{"type":"MthdsField","props":{"path":"/inputs/source","label":"Source document"},"children":[]}}\n{"op":"add","path":"/elements/invoice-address-grid","value":{"type":"Grid","props":{"columns":2,"gap":"xl"},"children":["invoice-details-group","billing-address-group"]}}\n{"op":"add","path":"/elements/invoice-details-group","value":{"type":"FieldGroup","props":{"title":"Invoice"},"children":["invoice-reference","invoice-issued-on","invoice-total","invoice-status","invoice-paid","invoice-settled-at"]}}\n{"op":"add","path":"/elements/invoice-reference","value":{"type":"Input","props":{"label":"Reference","name":"/inputs/invoice/reference","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Enter the invoice reference."}]},"children":[]}}\n{"op":"add","path":"/elements/invoice-issued-on","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on","label":"Issued on"},"children":[]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"NumberInput","props":{"label":"Total due","name":"/inputs/invoice/total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-status","value":{"type":"Segmented","props":{"label":"Status","name":"/inputs/invoice/status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-paid","value":{"type":"Checkbox","props":{"label":"Payment settled","name":"/inputs/invoice/paid","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-settled-at","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at","label":"Payment cleared at (optional)"},"children":[]}}\n{"op":"add","path":"/elements/billing-address-group","value":{"type":"FieldGroup","props":{"title":"Billed to"},"children":["billing-street","billing-city","billing-country"]}}\n{"op":"add","path":"/elements/billing-street","value":{"type":"Input","props":{"label":"Street and number","name":"/inputs/invoice/billed_to/street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Enter the street and number."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-city","value":{"type":"Input","props":{"label":"City","name":"/inputs/invoice/billed_to/city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Enter the city."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-country","value":{"type":"Segmented","props":{"label":"Country (optional)","name":"/inputs/invoice/billed_to/country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/line-items-group","value":{"type":"FieldGroup","props":{"title":"Line items"},"children":["billable-lines","invoice-notes"]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines","label":"Billable lines"},"children":[]}}\n{"op":"add","path":"/elements/invoice-notes","value":{"type":"Textarea","props":{"label":"Notes (optional)","name":"/inputs/invoice/notes","rows":3,"value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Describe an invoice',
            lede: 'Pair the invoice details with the original document.',
            runLabel: 'Describe invoice',
            columns: '1',
          },
          children: ['invoice-workspace'],
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
        'invoice-workspace': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['source-document', 'invoice-address-grid', 'line-items-group'],
        },
        'source-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
            label: 'Source document',
          },
          children: [],
        },
        'invoice-address-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'xl',
          },
          children: ['invoice-details-group', 'billing-address-group'],
        },
        'invoice-details-group': {
          type: 'FieldGroup',
          props: {
            title: 'Invoice',
          },
          children: [
            'invoice-reference',
            'invoice-issued-on',
            'invoice-total',
            'invoice-status',
            'invoice-paid',
            'invoice-settled-at',
          ],
        },
        'invoice-reference': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: '/inputs/invoice/reference',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the invoice reference.',
              },
            ],
          },
          children: [],
        },
        'invoice-issued-on': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
            label: 'Issued on',
          },
          children: [],
        },
        'invoice-total': {
          type: 'NumberInput',
          props: {
            label: 'Total due',
            name: '/inputs/invoice/total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'invoice-status': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: '/inputs/invoice/status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'invoice-paid': {
          type: 'Checkbox',
          props: {
            label: 'Payment settled',
            name: '/inputs/invoice/paid',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'invoice-settled-at': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
            label: 'Payment cleared at (optional)',
          },
          children: [],
        },
        'billing-address-group': {
          type: 'FieldGroup',
          props: {
            title: 'Billed to',
          },
          children: ['billing-street', 'billing-city', 'billing-country'],
        },
        'billing-street': {
          type: 'Input',
          props: {
            label: 'Street and number',
            name: '/inputs/invoice/billed_to/street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the street and number.',
              },
            ],
          },
          children: [],
        },
        'billing-city': {
          type: 'Input',
          props: {
            label: 'City',
            name: '/inputs/invoice/billed_to/city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the city.',
              },
            ],
          },
          children: [],
        },
        'billing-country': {
          type: 'Segmented',
          props: {
            label: 'Country (optional)',
            name: '/inputs/invoice/billed_to/country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'line-items-group': {
          type: 'FieldGroup',
          props: {
            title: 'Line items',
          },
          children: ['billable-lines', 'invoice-notes'],
        },
        'billable-lines': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
            label: 'Billable lines',
          },
          children: [],
        },
        'invoice-notes': {
          type: 'Textarea',
          props: {
            label: 'Notes (optional)',
            name: '/inputs/invoice/notes',
            rows: 3,
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone handling a commercial invoice describe its details alongside the original document in one calm workspace.',
      title: 'Describe an invoice',
      composition:
        'Use one centred Composer with a short h1 and the line “Pair the invoice details with the original document.” Its single raised panel opens with the source document, followed by a two-column Grid: invoice details on the left and the billing address on the right, aligned at the top and stacked in that order on narrow screens. A full-width line-items group finishes the panel with notes beneath the delegated editor. Keep generous space between groups, no additional boxes, no collapsed inputs, and no decorative elements. The Composer’s sticky host action row is the only place to run the method; add no notes or additional surrounding content.',
      regions: [
        {
          title: null,
          purpose: 'Carry the page headline, the single input panel and the host-owned action row.',
          container: 'Composer',
          elements: [
            'Composer: title “Describe an invoice”; subtitle “Pair the invoice details with the original document.”; columns “1”; no notes; runLabel “Describe invoice”; on.press: validateForm then run.',
            'Stack: holds the source control, the two-column Grid of Invoice and Billed to, and the full-width Line items FieldGroup, in that order.',
          ],
        },
        {
          title: null,
          purpose:
            'Put the required original document first, directly under the headline that promises to pair it with the details.',
          container: 'Stack',
          elements: [
            'MthdsField: /inputs/source; label “Source document”; required; retain the delegated document control.',
          ],
        },
        {
          title: 'Invoice',
          purpose:
            'Collect the invoice’s identity, amount and payment details together in the left column.',
          container: 'FieldGroup',
          elements: [
            'Input: /inputs/invoice/reference; label “Reference”; required.',
            'MthdsField: /inputs/invoice/issued_on; label “Issued on”; required.',
            'NumberInput: /inputs/invoice/total; label “Total due”; required; no unit, minimum, maximum or step.',
            'Segmented: /inputs/invoice/status; label “Status”; options exactly "draft", "sent", "paid", "void"; required.',
            'Checkbox: /inputs/invoice/paid; label “Payment settled”; optional; does not hide or reveal any input.',
            'MthdsField: /inputs/invoice/settled_at; label “Payment cleared at (optional)”; always visible.',
          ],
        },
        {
          title: 'Billed to',
          purpose:
            'Keep the recipient’s address together in the right column, separate from invoice and payment details.',
          container: 'FieldGroup',
          elements: [
            'Input: /inputs/invoice/billed_to/street; label “Street and number”; required.',
            'Input: /inputs/invoice/billed_to/city; label “City”; required.',
            'Segmented: /inputs/invoice/billed_to/country; label “Country (optional)”; options exactly "France", "Germany", "Spain", "United Kingdom"; fit across the right column.',
          ],
        },
        {
          title: 'Line items',
          purpose:
            'Give the billable-line editor the full panel width and leave optional context immediately beneath it before the run action.',
          container: 'FieldGroup',
          elements: [
            'MthdsField: /inputs/invoice/lines; label “Billable lines”; required; delegate the entire list and its item editing.',
            'Textarea: /inputs/invoice/notes; label “Notes (optional)”.',
          ],
        },
      ],
      call_to_action: 'Describe invoice',
      defaults: [],
      delegated: [
        '/inputs/invoice/issued_on — brief delegates the date control to MthdsField.',
        '/inputs/invoice/settled_at — brief delegates the date-with-time control to MthdsField.',
        '/inputs/invoice/lines — brief delegates the whole line-item list to MthdsField.',
        '/inputs/source — brief delegates the document attachment to MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'C3QpGOlnZKRjxlLujNKlqQHNq6q1A15t',
    frame: 'composer',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/structured.invoice_with_source.composer.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Put the invoice into words","lede":"Describe the invoice and attach its source document.","columns":"2","runLabel":"Describe the invoice","notes":["A text response."]},"children":["source-reference","billed-to","charges","payment"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/source-reference","value":{"type":"FieldGroup","props":{"title":"Source & reference"},"children":["source-document","invoice-reference","issued-on"]}}\n{"op":"add","path":"/elements/source-document","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/invoice-reference","value":{"type":"Input","props":{"label":"Invoice reference","name":"invoice-reference","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Enter the invoice reference."}]},"children":[]}}\n{"op":"add","path":"/elements/issued-on","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/billed-to","value":{"type":"FieldGroup","props":{"title":"Billed to"},"children":["billing-street","billing-city","billing-country"]}}\n{"op":"add","path":"/elements/billing-street","value":{"type":"Input","props":{"label":"Street and number","name":"billing-street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Enter the street and number."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-city","value":{"type":"Input","props":{"label":"City","name":"billing-city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Enter the city."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-country","value":{"type":"Segmented","props":{"label":"Country","name":"billing-country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/charges","value":{"type":"FieldGroup","props":{"title":"Charges"},"children":["total-amount","billable-lines","invoice-notes"]}}\n{"op":"add","path":"/elements/total-amount","value":{"type":"NumberInput","props":{"label":"Total amount due","name":"total-amount","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/invoice-notes","value":{"type":"Input","props":{"label":"Notes","name":"invoice-notes","value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}\n{"op":"add","path":"/elements/payment","value":{"type":"FieldGroup","props":{"title":"Payment"},"children":["invoice-status","payment-settled","payment-cleared"]}}\n{"op":"add","path":"/elements/invoice-status","value":{"type":"Segmented","props":{"label":"Status","name":"invoice-status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/payment-settled","value":{"type":"Checkbox","props":{"label":"Payment settled","name":"payment-settled","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/payment-cleared","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[]}}',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Put the invoice into words',
            lede: 'Describe the invoice and attach its source document.',
            columns: '2',
            runLabel: 'Describe the invoice',
            notes: ['A text response.'],
          },
          children: ['source-reference', 'billed-to', 'charges', 'payment'],
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
        'source-reference': {
          type: 'FieldGroup',
          props: {
            title: 'Source & reference',
          },
          children: ['source-document', 'invoice-reference', 'issued-on'],
        },
        'source-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'invoice-reference': {
          type: 'Input',
          props: {
            label: 'Invoice reference',
            name: 'invoice-reference',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the invoice reference.',
              },
            ],
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
        'billed-to': {
          type: 'FieldGroup',
          props: {
            title: 'Billed to',
          },
          children: ['billing-street', 'billing-city', 'billing-country'],
        },
        'billing-street': {
          type: 'Input',
          props: {
            label: 'Street and number',
            name: 'billing-street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the street and number.',
              },
            ],
          },
          children: [],
        },
        'billing-city': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'billing-city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the city.',
              },
            ],
          },
          children: [],
        },
        'billing-country': {
          type: 'Segmented',
          props: {
            label: 'Country',
            name: 'billing-country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        charges: {
          type: 'FieldGroup',
          props: {
            title: 'Charges',
          },
          children: ['total-amount', 'billable-lines', 'invoice-notes'],
        },
        'total-amount': {
          type: 'NumberInput',
          props: {
            label: 'Total amount due',
            name: 'total-amount',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'billable-lines': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'invoice-notes': {
          type: 'Input',
          props: {
            label: 'Notes',
            name: 'invoice-notes',
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
        payment: {
          type: 'FieldGroup',
          props: {
            title: 'Payment',
          },
          children: ['invoice-status', 'payment-settled', 'payment-cleared'],
        },
        'invoice-status': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'invoice-status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'payment-settled': {
          type: 'Checkbox',
          props: {
            label: 'Payment settled',
            name: 'payment-settled',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'payment-cleared': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone documenting a commercial invoice describe its details alongside the original document and receive a text response.',
      title: 'Put the invoice into words',
      composition:
        "Use one centred Composer with a short, prominent h1 and the muted line “Describe the invoice and attach its source document.” Its single raised panel has two columns: Source & reference beside Billed to, then Charges beside Payment, with generous space between the two rows of groups. On narrow screens, the groups stack in that reading order. All inputs remain visible; there are no tabs, folded sections, extra surfaces or input summaries. The Composer's persistent action row is the only place to run, with runLabel “Describe the invoice” and on.press bound to validateForm then run; leave timing to the host. Use only the components' theme styling.",
      regions: [
        {
          title: null,
          purpose:
            "Carry the page title, brief instruction, input panel and sole run action within the host's frame.",
          container: 'Composer',
          elements: [
            'Composer: title “Put the invoice into words”; description “Describe the invoice and attach its source document.”; columns “2”; contains the four FieldGroups in the order below; runLabel “Describe the invoice”; on.press: validateForm then run.',
            'Composer notes: “A text response.”',
          ],
        },
        {
          title: 'Source & reference',
          purpose: 'Start with the source document and the identifiers that locate the invoice.',
          container: 'FieldGroup',
          elements: [
            'MthdsField — /inputs/source; label “Source document”; required; delegated document control.',
            'Input — /inputs/invoice/reference; label “Invoice reference”; required validation.',
            'MthdsField — /inputs/invoice/issued_on; label “Issued on”; required; delegated date control.',
          ],
        },
        {
          title: 'Billed to',
          purpose:
            "Keep the recipient's address together alongside the invoice's identifying details.",
          container: 'FieldGroup',
          elements: [
            'Input — /inputs/invoice/billed_to/street; label “Street and number”; required validation.',
            'Input — /inputs/invoice/billed_to/city; label “City”; required validation.',
            'Segmented — /inputs/invoice/billed_to/country; label “Country”; options exactly “France”, “Germany”, “Spain”, “United Kingdom”; optional.',
          ],
        },
        {
          title: 'Charges',
          purpose:
            'Collect the amount and its billable lines together, followed by any additional notes.',
          container: 'FieldGroup',
          elements: [
            'NumberInput — /inputs/invoice/total; label “Total amount due”; required validation; no unit or numeric bounds.',
            'MthdsField — /inputs/invoice/lines; label “Billable lines”; required; delegated list control.',
            'Input — /inputs/invoice/notes; label “Notes”; optional.',
          ],
        },
        {
          title: 'Payment',
          purpose:
            'Keep invoice status, settlement and payment timing together without hiding optional details.',
          container: 'FieldGroup',
          elements: [
            'Segmented — /inputs/invoice/status; label “Status”; options exactly “draft”, “sent”, “paid”, “void”; required validation.',
            'Checkbox — /inputs/invoice/paid; label “Payment settled”; optional.',
            'MthdsField — /inputs/invoice/settled_at; label “Payment cleared on”; optional; delegated date-with-time control; always visible.',
          ],
        },
      ],
      call_to_action: 'Describe the invoice',
      defaults: [],
      delegated: [
        '/inputs/source — document; explicitly delegated to MthdsField.',
        '/inputs/invoice/issued_on — date; explicitly delegated to MthdsField.',
        '/inputs/invoice/settled_at — date with time; explicitly delegated to MthdsField.',
        '/inputs/invoice/lines — list of line-item structures; explicitly delegated to MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'structured.invoice_with_source',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'BhuAdoVbywdTT6HsajCoYvpkC0W51osH',
    frame: 'composer',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/structured.invoice_with_source.composer.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Describe an invoice","lede":"Enter the invoice details and attach the document it came from.","columns":"1","runLabel":"Describe my invoice","notes":["A text response based on your invoice and source document."]},"children":["essentials-grid","line-items-payment"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/essentials-grid","value":{"type":"Grid","props":{"columns":2,"gap":"xl"},"children":["invoice-details","source-recipient"]}}\n{"op":"add","path":"/elements/invoice-details","value":{"type":"FieldGroup","props":{"title":"Invoice"},"children":["invoice-reference","invoice-issued-on","invoice-total","invoice-status"]}}\n{"op":"add","path":"/elements/invoice-reference","value":{"type":"Input","props":{"label":"Reference","name":"invoice-reference","value":{"$bindState":"/inputs/invoice/reference"},"checks":[{"type":"required","message":"Enter the invoice reference."}]},"children":[]}}\n{"op":"add","path":"/elements/invoice-issued-on","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"NumberInput","props":{"label":"Total due","name":"invoice-total","value":{"$bindState":"/inputs/invoice/total"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-status","value":{"type":"Segmented","props":{"label":"Status","name":"invoice-status","options":["draft","sent","paid","void"],"value":{"$bindState":"/inputs/invoice/status"}},"children":[]}}\n{"op":"add","path":"/elements/source-recipient","value":{"type":"FieldGroup","props":{"title":"Source & recipient"},"children":["source-document","billing-street","billing-city","billing-country"]}}\n{"op":"add","path":"/elements/source-document","value":{"type":"MthdsField","props":{"path":"/inputs/source"},"children":[]}}\n{"op":"add","path":"/elements/billing-street","value":{"type":"Input","props":{"label":"Billing street and number","name":"billing-street","value":{"$bindState":"/inputs/invoice/billed_to/street"},"checks":[{"type":"required","message":"Enter the billing street and number."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-city","value":{"type":"Input","props":{"label":"City","name":"billing-city","value":{"$bindState":"/inputs/invoice/billed_to/city"},"checks":[{"type":"required","message":"Enter the billing city."}]},"children":[]}}\n{"op":"add","path":"/elements/billing-country","value":{"type":"Select","props":{"label":"Country","name":"billing-country","options":["France","Germany","Spain","United Kingdom"],"value":{"$bindState":"/inputs/invoice/billed_to/country"}},"children":[]}}\n{"op":"add","path":"/elements/line-items-payment","value":{"type":"FieldGroup","props":{"title":"Line items & payment"},"children":["invoice-lines","payment-grid","invoice-notes"]}}\n{"op":"add","path":"/elements/invoice-lines","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/lines"},"children":[]}}\n{"op":"add","path":"/elements/payment-grid","value":{"type":"Grid","props":{"columns":2,"gap":"xl"},"children":["payment-settled","payment-cleared-at"]}}\n{"op":"add","path":"/elements/payment-settled","value":{"type":"Checkbox","props":{"label":"Payment settled","name":"payment-settled","checked":{"$bindState":"/inputs/invoice/paid"}},"children":[]}}\n{"op":"add","path":"/elements/payment-cleared-at","value":{"type":"MthdsField","props":{"path":"/inputs/invoice/settled_at"},"children":[]}}\n{"op":"add","path":"/elements/invoice-notes","value":{"type":"Textarea","props":{"label":"Notes","name":"invoice-notes","rows":3,"value":{"$bindState":"/inputs/invoice/notes"}},"children":[]}}',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Describe an invoice',
            lede: 'Enter the invoice details and attach the document it came from.',
            columns: '1',
            runLabel: 'Describe my invoice',
            notes: ['A text response based on your invoice and source document.'],
          },
          children: ['essentials-grid', 'line-items-payment'],
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
        'essentials-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'xl',
          },
          children: ['invoice-details', 'source-recipient'],
        },
        'invoice-details': {
          type: 'FieldGroup',
          props: {
            title: 'Invoice',
          },
          children: ['invoice-reference', 'invoice-issued-on', 'invoice-total', 'invoice-status'],
        },
        'invoice-reference': {
          type: 'Input',
          props: {
            label: 'Reference',
            name: 'invoice-reference',
            value: {
              $bindState: '/inputs/invoice/reference',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the invoice reference.',
              },
            ],
          },
          children: [],
        },
        'invoice-issued-on': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/issued_on',
          },
          children: [],
        },
        'invoice-total': {
          type: 'NumberInput',
          props: {
            label: 'Total due',
            name: 'invoice-total',
            value: {
              $bindState: '/inputs/invoice/total',
            },
          },
          children: [],
        },
        'invoice-status': {
          type: 'Segmented',
          props: {
            label: 'Status',
            name: 'invoice-status',
            options: ['draft', 'sent', 'paid', 'void'],
            value: {
              $bindState: '/inputs/invoice/status',
            },
          },
          children: [],
        },
        'source-recipient': {
          type: 'FieldGroup',
          props: {
            title: 'Source & recipient',
          },
          children: ['source-document', 'billing-street', 'billing-city', 'billing-country'],
        },
        'source-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/source',
          },
          children: [],
        },
        'billing-street': {
          type: 'Input',
          props: {
            label: 'Billing street and number',
            name: 'billing-street',
            value: {
              $bindState: '/inputs/invoice/billed_to/street',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the billing street and number.',
              },
            ],
          },
          children: [],
        },
        'billing-city': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'billing-city',
            value: {
              $bindState: '/inputs/invoice/billed_to/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the billing city.',
              },
            ],
          },
          children: [],
        },
        'billing-country': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'billing-country',
            options: ['France', 'Germany', 'Spain', 'United Kingdom'],
            value: {
              $bindState: '/inputs/invoice/billed_to/country',
            },
          },
          children: [],
        },
        'line-items-payment': {
          type: 'FieldGroup',
          props: {
            title: 'Line items & payment',
          },
          children: ['invoice-lines', 'payment-grid', 'invoice-notes'],
        },
        'invoice-lines': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/lines',
          },
          children: [],
        },
        'payment-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'xl',
          },
          children: ['payment-settled', 'payment-cleared-at'],
        },
        'payment-settled': {
          type: 'Checkbox',
          props: {
            label: 'Payment settled',
            name: 'payment-settled',
            checked: {
              $bindState: '/inputs/invoice/paid',
            },
          },
          children: [],
        },
        'payment-cleared-at': {
          type: 'MthdsField',
          props: {
            path: '/inputs/invoice/settled_at',
          },
          children: [],
        },
        'invoice-notes': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'invoice-notes',
            rows: 3,
            value: {
              $bindState: '/inputs/invoice/notes',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone handling a commercial invoice describe its details and attach its source document to receive a text response.',
      title: 'Describe an invoice',
      composition:
        'Use one centred Composer with a short, warm h1 and generous space between three input groups. Set Composer columns to 1: its first child is a two-column Grid holding “Invoice” on the left and “Source & recipient” on the right; its second child is the full-width “Line items & payment” FieldGroup. Stack the Grid columns on narrow screens, left before right. Keep every input visible rather than using tabs or collapsibles, and use only the Composer’s raised surface. The Composer’s persistent action row contains the sole run control, with on.press calling validateForm then run; leave timing and run requirements to the host.',
      regions: [
        {
          title: null,
          purpose:
            'Introduce the job and provide the single enclosing input panel and host action row.',
          container: 'Composer',
          elements: [
            'Composer: title “Describe an invoice”; subtitle “Enter the invoice details and attach the document it came from.”; columns 1; runLabel “Describe my invoice”; on.press validateForm then run.',
            'Grid: two columns, holding the “Invoice” and “Source & recipient” FieldGroups in that order; one column on narrow screens.',
            'FieldGroup: “Line items & payment”, below the Grid at full width.',
            'Composer notes: “A text response based on your invoice and source document.”',
          ],
        },
        {
          title: 'Invoice',
          purpose:
            'Put the identifying details and amount first, with status alongside the essentials.',
          container: 'FieldGroup',
          elements: [
            'Input: $bindState /inputs/invoice/reference; label “Reference”; required validation.',
            'MthdsField: path /inputs/invoice/issued_on; label “Issued on”; delegated date control.',
            'NumberInput: $bindState /inputs/invoice/total; label “Total due”; required validation; no unit or numeric bounds.',
            'Segmented: $bindState /inputs/invoice/status; label “Status”; options exactly "draft", "sent", "paid", "void"; required validation.',
          ],
        },
        {
          title: 'Source & recipient',
          purpose:
            'Keep the promised source document near the top, followed by the billing address in the same column.',
          container: 'FieldGroup',
          elements: [
            'MthdsField: path /inputs/source; label “Source document”; delegated required document control.',
            'Input: $bindState /inputs/invoice/billed_to/street; label “Billing street and number”; required validation.',
            'Input: $bindState /inputs/invoice/billed_to/city; label “City”; required validation.',
            'Select: $bindState /inputs/invoice/billed_to/country; label “Country”; options exactly "France", "Germany", "Spain", "United Kingdom"; optional.',
          ],
        },
        {
          title: 'Line items & payment',
          purpose:
            'Give the editable billable lines the full panel width, then collect settlement details and optional notes without another surface.',
          container: 'FieldGroup',
          elements: [
            'MthdsField: path /inputs/invoice/lines; label “Line items”; delegated required list control.',
            'Grid: two columns holding the paid Checkbox followed by the settled-at MthdsField; stack in that order on narrow screens.',
            'Checkbox: $bindState /inputs/invoice/paid on checked; label “Payment settled”; optional; does not hide or reveal another input.',
            'MthdsField: path /inputs/invoice/settled_at; label “Payment cleared at”; delegated optional date-with-time control; always visible.',
            'Textarea: $bindState /inputs/invoice/notes; label “Notes”; optional; full width.',
          ],
        },
      ],
      call_to_action: 'Describe my invoice',
      defaults: null,
      delegated: [
        '/inputs/invoice/issued_on — MthdsField; date explicitly delegated by the brief.',
        '/inputs/invoice/settled_at — MthdsField; date with time explicitly delegated by the brief.',
        '/inputs/invoice/lines — MthdsField; structured line-item list explicitly delegated by the brief.',
        '/inputs/source — MthdsField; document file explicitly delegated by the brief.',
      ],
    },
  },
];
