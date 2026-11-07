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
    model: 'gpt-6.1-sol',
    repairs: 1,
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"center","justify":"center"},"children":["introduction","document-action"]}}\n{"op":"add","path":"/elements/introduction","value":{"type":"Stack","props":{"direction":"vertical","gap":"md","align":"stretch"},"children":["hero"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Extract invoice information","eyebrow":"Invoice extraction"},"children":[]}}\n{"op":"add","path":"/elements/document-action","value":{"type":"Stack","props":{"direction":"vertical","gap":"md","align":"stretch"},"children":["invoice-document","extract-cta"]}}\n{"op":"add","path":"/elements/invoice-document","value":{"type":"MthdsField","props":{"path":"/inputs/document","label":"Invoice document"},"children":[]}}\n{"op":"add","path":"/elements/extract-cta","value":{"type":"Cta","props":{"label":"Extract invoice information","hint":"Add an invoice document to continue."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'center',
            justify: 'center',
          },
          children: ['introduction', 'document-action'],
        },
        introduction: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
            align: 'stretch',
          },
          children: ['hero'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Extract invoice information',
            eyebrow: 'Invoice extraction',
          },
          children: [],
        },
        'document-action': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
            align: 'stretch',
          },
          children: ['invoice-document', 'extract-cta'],
        },
        'invoice-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
            label: 'Invoice document',
          },
          children: [],
        },
        'extract-cta': {
          type: 'Cta',
          props: {
            label: 'Extract invoice information',
            hint: 'Add an invoice document to continue.',
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
        'Help someone with an invoice provide its document and extract the relevant information without extra setup.',
      title: 'Extract invoice information',
      composition:
        'Use a single compact column, centered with generous space around it and stacked naturally on narrow screens. Open with a Hero, then place the document control on an unboxed surface with the full-width Cta directly below; no side panel, summary, navigation, or secondary headings. Keep the headline prominent and the required-document hint beside the action; use component theme defaults for light and dark appearances.',
      regions: [
        {
          title: null,
          purpose: "Introduce the job with a clear headline and the host's app name.",
          container: 'Stack',
          elements: [
            'Hero: headline "Extract invoice information" (the only h1); eyebrow "Invoice extraction"; no subtitle.',
          ],
        },
        {
          title: null,
          purpose:
            'Collect the one required invoice document and run extraction immediately below it.',
          container: 'Stack',
          elements: [
            'MthdsField: path /inputs/document, two-way bound; label "Invoice document"; required and gates the run; retain the delegated document control.',
            'Cta: label "Extract invoice information"; hint "Add an invoice document to continue."; on.press bound to validateForm then run.',
          ],
        },
      ],
      call_to_action: 'Extract invoice information — Add an invoice document to continue.',
      defaults: null,
      delegated: [
        '/inputs/document — required file; explicitly delegated to MthdsField by the brief.',
      ],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'XU1UAYi9qLoC7i2HL9i3K96yOh3Y5ZFo',
    frame: 'composer',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.composer.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Get your invoice details","lede":"Extract structured information from an invoice.","runLabel":"Extract invoice details","columns":"1","notes":["Invoice references, dates and vendor details","Totals, taxes and currency","Itemised purchases and expense category","Extracted document text"]},"children":["document-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/document-group","value":{"type":"FieldGroup","props":{},"children":["invoice-document"]}}\n{"op":"add","path":"/elements/invoice-document","value":{"type":"MthdsField","props":{"path":"/inputs/document","label":"Invoice document"},"children":[]}}\n',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Get your invoice details',
            lede: 'Extract structured information from an invoice.',
            runLabel: 'Extract invoice details',
            columns: '1',
            notes: [
              'Invoice references, dates and vendor details',
              'Totals, taxes and currency',
              'Itemised purchases and expense category',
              'Extracted document text',
            ],
          },
          children: ['document-group'],
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
        'document-group': {
          type: 'FieldGroup',
          props: {},
          children: ['invoice-document'],
        },
        'invoice-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
            label: 'Invoice document',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone holding an invoice extract its details into structured information with one document and one action.',
      title: 'Get your invoice details',
      composition:
        "Use one centred Composer with a short, light headline and generous space before its single-column raised panel. The panel contains one untitled FieldGroup for the document, with no redundant section heading or extra instructions. Keep the Composer's sole action row visible at the panel foot; beneath the panel, show four short outcome notes in two columns. Do not add anything outside the composer or reproduce the host's app name, timing or run requirements.",
      regions: [
        {
          title: null,
          purpose:
            'Present the extraction task, collect the invoice document and run the method, followed by a concise account of what comes back.',
          container: 'Composer',
          elements: [
            'Composer: headline "Get your invoice details" as the only h1; muted line "Extract structured information from an invoice."; columns "1"; contains the FieldGroup and its own action row.',
            'FieldGroup: untitled; contains only the document control.',
            'MthdsField: /inputs/document; label "Invoice document"; retain the delegated file control and its validation.',
            'Composer action row: runLabel "Extract invoice details"; on.press calls validateForm then run; host supplies timing and run readiness.',
            'Composer notes, in order: "Invoice references, dates and vendor details"; "Totals, taxes and currency"; "Itemised purchases and expense category"; "Extracted document text".',
          ],
        },
      ],
      call_to_action: 'Extract invoice details',
      defaults: [],
      delegated: ['/inputs/document — required file; the brief delegates it to MthdsField.'],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'ooaTmANXCtErnD6GKiM4Bzx0NsxasJZ8',
    frame: 'composer',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.composer.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Extract your invoice details","lede":"Use the original invoice document.","runLabel":"Extract invoice details","columns":"1","notes":["Invoice references and dates","Totals, taxes and priced lines","Seller, buyer and extracted text"]},"children":["invoice-document"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/invoice-document","value":{"type":"MthdsField","props":{"path":"/inputs/document","label":"Invoice document"},"children":[]}}',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Extract your invoice details',
            lede: 'Use the original invoice document.',
            runLabel: 'Extract invoice details',
            columns: '1',
            notes: [
              'Invoice references and dates',
              'Totals, taxes and priced lines',
              'Seller, buyer and extracted text',
            ],
          },
          children: ['invoice-document'],
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
        'invoice-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
            label: 'Invoice document',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone handling an invoice extract its details and priced lines from the document without manually transcribing them.',
      title: 'Extract your invoice details',
      composition:
        "Use one Composer in the host's centred column, with a short, prominent headline and the muted line “Use the original invoice document.” Keep its raised panel compact and single-column, with generous space around the sole document control; no extra section heading is needed. The Composer's persistent action row holds the only run control. Below the panel, three short Composer notes describe the output in the component's two-column arrangement; add no other panels or surrounding chrome.",
      regions: [
        {
          title: null,
          purpose:
            'Keep the invoice document and the extraction action together, with a brief indication of what the run returns.',
          container: 'Composer',
          elements: [
            "Composer: title “Extract your invoice details”; muted line “Use the original invoice document.”; columns “1”; runLabel “Extract invoice details”; on.press validates with validateForm, then calls run; holds the document control and the host's persistent action row.",
            'MthdsField: /inputs/document; label “Invoice document”; retain the delegated file control and its required validation.',
            'Composer notes, in order: “Invoice references and dates”; “Totals, taxes and priced lines”; “Seller, buyer and extracted text”.',
          ],
        },
      ],
      call_to_action: 'Extract invoice details',
      defaults: null,
      delegated: ['/inputs/document — required file input; the brief mandates MthdsField.'],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'efxKnJJKuoTrJwVnVGvXpJ598ewUNkoP',
    frame: 'composer',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.composer.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Get your invoice details","lede":"Extract structured information from an invoice document.","runLabel":"Extract invoice details","columns":"1","notes":["Invoice references, dates and supplier details.","Totals, taxes and itemised purchases."]},"children":["invoice-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/invoice-group","value":{"type":"FieldGroup","props":{"title":"Invoice"},"children":["invoice-document"]}}\n{"op":"add","path":"/elements/invoice-document","value":{"type":"MthdsField","props":{"path":"/inputs/document","label":"Document","hint":""},"children":[]}}',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Get your invoice details',
            lede: 'Extract structured information from an invoice document.',
            runLabel: 'Extract invoice details',
            columns: '1',
            notes: [
              'Invoice references, dates and supplier details.',
              'Totals, taxes and itemised purchases.',
            ],
          },
          children: ['invoice-group'],
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
        'invoice-group': {
          type: 'FieldGroup',
          props: {
            title: 'Invoice',
          },
          children: ['invoice-document'],
        },
        'invoice-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
            label: 'Document',
            hint: '',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone with an invoice document extract its details into structured information.',
      title: 'Get your invoice details',
      composition:
        'Use one centred Composer with a short, prominent headline and the muted line “Extract structured information from an invoice document.” Keep generous space around the headline and a single-column raised panel containing one quiet input group. The document control is the first and only input; nothing is folded away. The Composer’s persistent action row runs the method, and two short notes below the panel describe what comes back. Build no surrounding chrome or additional surfaces.',
      regions: [
        {
          title: null,
          purpose:
            'Present the invoice document control and the sole extraction action, with a compact account of the returned information.',
          container: 'Composer',
          elements: [
            'Composer: title “Get your invoice details”; description “Extract structured information from an invoice document.”; columns “1”; runLabel “Extract invoice details”; on.press invokes validateForm then run; contains FieldGroup.',
            'FieldGroup: title “Invoice”; contains MthdsField.',
            'MthdsField: path /inputs/document; two-way binding; label “Document”; hint empty; retain the required file control and its validation.',
            'Composer notes: “Invoice references, dates and supplier details.”; “Totals, taxes and itemised purchases.”',
          ],
        },
      ],
      call_to_action: 'Extract invoice details',
      defaults: [],
      delegated: ['/inputs/document — required file input, explicitly delegated to MthdsField.'],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'oIjXPahzx1ucIzKmpATutqbJy215BgEa',
    frame: 'composer',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.composer.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-composer"}\n{"op":"add","path":"/elements/invoice-composer","value":{"type":"Composer","props":{"headline":"Extract invoice details","lede":"Capture the purchase, totals and tax from an invoice.","columns":"1","runLabel":"Extract invoice details","notes":["Vendor and purchasing company details","Itemised purchases and extracted document text"]},"children":["document-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/document-group","value":{"type":"FieldGroup","props":{},"children":["invoice-document"]}}\n{"op":"add","path":"/elements/invoice-document","value":{"type":"MthdsField","props":{"path":"/inputs/document","label":"Invoice document","hint":""},"children":[]}}',
    spec: {
      root: 'invoice-composer',
      elements: {
        'invoice-composer': {
          type: 'Composer',
          props: {
            headline: 'Extract invoice details',
            lede: 'Capture the purchase, totals and tax from an invoice.',
            columns: '1',
            runLabel: 'Extract invoice details',
            notes: [
              'Vendor and purchasing company details',
              'Itemised purchases and extracted document text',
            ],
          },
          children: ['document-group'],
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
        'document-group': {
          type: 'FieldGroup',
          props: {},
          children: ['invoice-document'],
        },
        'invoice-document': {
          type: 'MthdsField',
          props: {
            path: '/inputs/document',
            label: 'Invoice document',
            hint: '',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone handling an invoice extract its purchase details without manually transcribing the document.',
      title: 'Extract invoice details',
      composition:
        "Use one compact, centred Composer within the host's frame, with a prominent, tightly set headline and a single muted line. Its raised panel has one full-width document control in an untitled FieldGroup; do not split a single input into columns or add nested cards. Keep the host's action row at the panel's foot and visible while scrolling. Place two short outcome notes below the panel, in the Composer's two-column notes layout; add no surrounding navigation or footer.",
      regions: [
        {
          title: null,
          purpose:
            'Present the extraction job, collect the invoice, and run it from one focused composer.',
          container: 'Composer',
          elements: [
            'Composer: headline "Extract invoice details"; muted line "Capture the purchase, totals and tax from an invoice."; columns "1"; runLabel "Extract invoice details"; on.press invokes validateForm then run.',
            'FieldGroup: untitled; holds the single MthdsField.',
            'MthdsField: path /inputs/document; label "Invoice document"; hint ""; required file input, delegated whole.',
            'Composer notes: "Vendor and purchasing company details"; "Itemised purchases and extracted document text".',
          ],
        },
      ],
      call_to_action: 'Extract invoice details',
      defaults: [],
      delegated: [
        '/inputs/document — required file input explicitly delegated to MthdsField by the brief.',
      ],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'NBPALrq458r8QFLUhY511mEZ8vh2ZRkn',
    frame: 'result',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.result.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["review-header","invoices"]}}\n{"op":"add","path":"/elements/review-header","value":{"type":"ResultHeader","props":{"title":"Review the extracted invoices"},"children":[]}}\n{"op":"add","path":"/elements/invoices","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"repeat":{"statePath":"/result","key":"invoice_id"},"children":["invoice-separator","invoice-record"]}}\n{"op":"add","path":"/elements/invoice-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/invoice-record","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["invoice-vendor","invoice-meta","invoice-description","invoice-amounts","invoice-purchases","invoice-evidence"]}}\n{"op":"add","path":"/elements/invoice-vendor","value":{"type":"Heading","props":{"text":{"$cond":{"$item":"vendor"},"$then":{"$item":"vendor"},"$else":"Invoice"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/invoice-meta","value":{"type":"Stack","props":{"direction":"horizontal","gap":"lg","align":"center"},"children":["invoice-date","invoice-time","invoice-number"]}}\n{"op":"add","path":"/elements/invoice-date","value":{"type":"DateText","props":{"value":{"$item":"issue_date"},"style":"long","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/invoice-time","value":{"type":"Detail","props":{"label":"Time","value":{"$item":"time"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-number","value":{"type":"Detail","props":{"label":"Invoice number","value":{"$item":"invoice_number"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-description","value":{"type":"Text","props":{"text":{"$item":"description"},"variant":"body"},"visible":{"$item":"description"},"children":[]}}\n{"op":"add","path":"/elements/invoice-amounts","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["invoice-currency","amount-band"]}}\n{"op":"add","path":"/elements/invoice-currency","value":{"type":"Text","props":{"text":{"$item":"currency"},"variant":"muted"},"visible":{"$item":"currency"},"children":[]}}\n{"op":"add","path":"/elements/amount-band","value":{"type":"Grid","props":{"columns":3,"gap":"lg"},"children":["total-charged","before-tax","tax"]}}\n{"op":"add","path":"/elements/total-charged","value":{"type":"Fact","props":{"label":"Total charged","value":{"$template":"${amount_incl_tax}"}},"children":[]}}\n{"op":"add","path":"/elements/before-tax","value":{"type":"Fact","props":{"label":"Before tax","value":{"$template":"${amount_excl_tax}"}},"children":[]}}\n{"op":"add","path":"/elements/tax","value":{"type":"Fact","props":{"label":"Tax","value":{"$template":"${vat_amount}"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-purchases","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["purchases-label","purchase-lines"]}}\n{"op":"add","path":"/elements/purchases-label","value":{"type":"Text","props":{"text":"Purchases","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/purchase-lines","value":{"type":"MthdsResult","props":{"path":"line_items","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/invoice-evidence","value":{"type":"Collapsible","props":{"title":"Details & source","defaultOpen":false},"children":["evidence-content"]}}\n{"op":"add","path":"/elements/evidence-content","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["seller-address","seller-siret","seller-vat-registration","buyer-name","buyer-address","document-type","classification-reason","vat-rates","source-text"]}}\n{"op":"add","path":"/elements/seller-address","value":{"type":"Detail","props":{"label":"Seller address","value":{"$item":"vendor_address"}},"children":[]}}\n{"op":"add","path":"/elements/seller-siret","value":{"type":"Detail","props":{"label":"SIRET","value":{"$item":"vendor_siret"}},"children":[]}}\n{"op":"add","path":"/elements/seller-vat-registration","value":{"type":"Detail","props":{"label":"VAT registration","value":{"$item":"vendor_vat_number"}},"children":[]}}\n{"op":"add","path":"/elements/buyer-name","value":{"type":"Detail","props":{"label":"Buyer","value":{"$item":"company_name"}},"children":[]}}\n{"op":"add","path":"/elements/buyer-address","value":{"type":"Detail","props":{"label":"Buyer address","value":{"$item":"company_address"}},"children":[]}}\n{"op":"add","path":"/elements/document-type","value":{"type":"Detail","props":{"label":"Document type","value":{"$item":"category/category"}},"children":[]}}\n{"op":"add","path":"/elements/classification-reason","value":{"type":"Detail","props":{"label":"Classification reason","value":{"$item":"category/explanation"}},"children":[]}}\n{"op":"add","path":"/elements/vat-rates","value":{"type":"MthdsResult","props":{"path":"vat_rates"},"children":[]}}\n{"op":"add","path":"/elements/source-text","value":{"type":"MthdsResult","props":{"path":"text"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['review-header', 'invoices'],
        },
        'review-header': {
          type: 'ResultHeader',
          props: {
            title: 'Review the extracted invoices',
          },
          children: [],
        },
        invoices: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          repeat: {
            statePath: '/result',
            key: 'invoice_id',
          },
          children: ['invoice-separator', 'invoice-record'],
        },
        'invoice-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'invoice-record': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'invoice-vendor',
            'invoice-meta',
            'invoice-description',
            'invoice-amounts',
            'invoice-purchases',
            'invoice-evidence',
          ],
        },
        'invoice-vendor': {
          type: 'Heading',
          props: {
            text: {
              $cond: {
                $item: 'vendor',
              },
              $then: {
                $item: 'vendor',
              },
              $else: 'Invoice',
            },
            level: 'h2',
          },
          children: [],
        },
        'invoice-meta': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'lg',
            align: 'center',
          },
          children: ['invoice-date', 'invoice-time', 'invoice-number'],
        },
        'invoice-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'issue_date',
            },
            style: 'long',
            tone: 'muted',
          },
          children: [],
        },
        'invoice-time': {
          type: 'Detail',
          props: {
            label: 'Time',
            value: {
              $item: 'time',
            },
          },
          children: [],
        },
        'invoice-number': {
          type: 'Detail',
          props: {
            label: 'Invoice number',
            value: {
              $item: 'invoice_number',
            },
          },
          children: [],
        },
        'invoice-description': {
          type: 'Text',
          props: {
            text: {
              $item: 'description',
            },
            variant: 'body',
          },
          visible: {
            $item: 'description',
          },
          children: [],
        },
        'invoice-amounts': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['invoice-currency', 'amount-band'],
        },
        'invoice-currency': {
          type: 'Text',
          props: {
            text: {
              $item: 'currency',
            },
            variant: 'muted',
          },
          visible: {
            $item: 'currency',
          },
          children: [],
        },
        'amount-band': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'lg',
          },
          children: ['total-charged', 'before-tax', 'tax'],
        },
        'total-charged': {
          type: 'Fact',
          props: {
            label: 'Total charged',
            value: {
              $template: '${amount_incl_tax}',
            },
          },
          children: [],
        },
        'before-tax': {
          type: 'Fact',
          props: {
            label: 'Before tax',
            value: {
              $template: '${amount_excl_tax}',
            },
          },
          children: [],
        },
        tax: {
          type: 'Fact',
          props: {
            label: 'Tax',
            value: {
              $template: '${vat_amount}',
            },
          },
          children: [],
        },
        'invoice-purchases': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['purchases-label', 'purchase-lines'],
        },
        'purchases-label': {
          type: 'Text',
          props: {
            text: 'Purchases',
            variant: 'caption',
          },
          children: [],
        },
        'purchase-lines': {
          type: 'MthdsResult',
          props: {
            path: 'line_items',
            hideLabel: true,
          },
          children: [],
        },
        'invoice-evidence': {
          type: 'Collapsible',
          props: {
            title: 'Details & source',
            defaultOpen: false,
          },
          children: ['evidence-content'],
        },
        'evidence-content': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'seller-address',
            'seller-siret',
            'seller-vat-registration',
            'buyer-name',
            'buyer-address',
            'document-type',
            'classification-reason',
            'vat-rates',
            'source-text',
          ],
        },
        'seller-address': {
          type: 'Detail',
          props: {
            label: 'Seller address',
            value: {
              $item: 'vendor_address',
            },
          },
          children: [],
        },
        'seller-siret': {
          type: 'Detail',
          props: {
            label: 'SIRET',
            value: {
              $item: 'vendor_siret',
            },
          },
          children: [],
        },
        'seller-vat-registration': {
          type: 'Detail',
          props: {
            label: 'VAT registration',
            value: {
              $item: 'vendor_vat_number',
            },
          },
          children: [],
        },
        'buyer-name': {
          type: 'Detail',
          props: {
            label: 'Buyer',
            value: {
              $item: 'company_name',
            },
          },
          children: [],
        },
        'buyer-address': {
          type: 'Detail',
          props: {
            label: 'Buyer address',
            value: {
              $item: 'company_address',
            },
          },
          children: [],
        },
        'document-type': {
          type: 'Detail',
          props: {
            label: 'Document type',
            value: {
              $item: 'category/category',
            },
          },
          children: [],
        },
        'classification-reason': {
          type: 'Detail',
          props: {
            label: 'Classification reason',
            value: {
              $item: 'category/explanation',
            },
          },
          children: [],
        },
        'vat-rates': {
          type: 'MthdsResult',
          props: {
            path: 'vat_rates',
          },
          children: [],
        },
        'source-text': {
          type: 'MthdsResult',
          props: {
            path: 'text',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone checking an extracted invoice verify the charged total and purchases first, then inspect the supporting details without wading through the source text.',
      title: 'Review the extracted invoices',
      composition:
        "Open with a quiet ResultHeader and the host's result actions, then repeat a full-width, unboxed invoice block for each item in /result, preserving its order. Each block starts with the vendor, date and invoice number, followed by a generous three-column band of amounts with the charged total first and most prominent; a single currency label applies to that band. Put the purchases immediately below, and fold registration details, classification reasoning and source text into one closed Collapsible per invoice. Separate invoice blocks with hairlines, stack the amount band on narrow screens, and use no side rail, decorative icons, additional actions or state patches.",
      regions: [
        {
          title: null,
          purpose:
            'Name the review task once and provide the placement for the host-owned result actions.',
          container: 'Stack',
          elements: [
            'ResultHeader — title "Review the extracted invoices" as the page\'s only h1; no eyebrow or subtitle; host-owned result actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            'Present each extracted invoice as a readable record, keeping the charge and purchases visible while secondary evidence remains available on demand.',
          container: 'Stack',
          elements: [
            'Stack — repeat over /result read with $state; one invoice block per item in source order; all relative paths below refer to that item.',
            'Heading — vendor read with $item, h2; use "Invoice" only when vendor is empty.',
            'Stack — horizontal, wrapping; holds DateText, transaction time and invoice number.',
            'DateText — issue_date read with $item; format long; muted tone.',
            'Detail — time read with $item; label "Time"; hide when empty.',
            'Detail — invoice_number read with $item; label "Invoice number"; hide when empty.',
            'Text — description read with $item; hide when empty.',
            'Text — currency read with $item; muted, directly above the amount band; hide when empty and do not infer a currency.',
            'Grid — three columns, stacking on narrow screens; holds the total, net amount and tax, in that order; the currency directly above applies to all three.',
            'Fact — amount_incl_tax read through a $template referencing the item\'s amount_incl_tax; label "Total charged"; first and visually largest amount; no invented unit.',
            'Fact — amount_excl_tax read through a $template referencing the item\'s amount_excl_tax; label "Before tax"; no invented unit.',
            'Fact — vat_amount read through a $template referencing the item\'s vat_amount; label "Tax"; no invented unit.',
            'Stack — purchases block with Text "Purchases" as a short group label and MthdsResult beneath it.',
            'MthdsResult — path line_items relative to the repeated invoice; hideLabel true; delegate the priced-line structure whole.',
            'Collapsible — trigger "Details & source"; initially closed; contains the following details and delegated evidence in order.',
            'Detail — vendor_address read with $item; label "Seller address".',
            'Detail — vendor_siret read with $item; label "SIRET".',
            'Detail — vendor_vat_number read with $item; label "VAT registration".',
            'Detail — company_name read with $item; label "Buyer".',
            'Detail — company_address read with $item; label "Buyer address".',
            'Detail — category/category read with $item; label "Document type"; display the recorded choice "bill" or "receipt" without an editing control.',
            'Detail — category/explanation read with $item; label "Classification reason".',
            'MthdsResult — path vat_rates relative to the repeated invoice; label "VAT rates"; delegate the numeric list whole.',
            'MthdsResult — path text relative to the repeated invoice; label "Source text"; delegate the extracted source text whole.',
            'Separator — between repeated invoice blocks only; omit after the last block.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        'line_items — relative to each item in /result; delegate the nested priced-line list to MthdsResult.',
        'vat_rates — relative to each item in /result; delegate the numeric rate list to MthdsResult.',
        'text — relative to each item in /result; delegate the raw extracted source text to MthdsResult.',
      ],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'KRyNGwWbQQp6PMZ4vtBGv8ofIWe1zyET',
    frame: 'result',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.result.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["review-header","invoices"]}}\n{"op":"add","path":"/elements/review-header","value":{"type":"ResultHeader","props":{"eyebrow":"Extraction complete","title":"Review the invoices"},"children":[]}}\n{"op":"add","path":"/elements/invoices","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"repeat":{"statePath":"/result","key":"invoice_id"},"children":["invoice"]}}\n{"op":"add","path":"/elements/invoice","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["invoice-summary","purchase-lines","supporting-hairline","supporting-details","original-text"]}}\n{"op":"add","path":"/elements/invoice-summary","value":{"type":"Stack","props":{"direction":"vertical","gap":"md","align":"stretch"},"children":["vendor-heading","invoice-total","purchase-description"]}}\n{"op":"add","path":"/elements/vendor-heading","value":{"type":"Heading","props":{"text":{"$item":"vendor"},"level":"h2"},"visible":{"$item":"vendor"},"children":[]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"Fact","props":{"label":"Total including tax","value":{"$cond":{"$item":"currency"},"$then":{"$template":"${amount_incl_tax} ${currency}"},"$else":{"$template":"${amount_incl_tax}"}}},"children":[]}}\n{"op":"add","path":"/elements/purchase-description","value":{"type":"Text","props":{"text":{"$item":"description"},"variant":"body"},"visible":{"$item":"description"},"children":[]}}\n{"op":"add","path":"/elements/purchase-lines","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["purchase-lines-label","purchase-lines-result"]}}\n{"op":"add","path":"/elements/purchase-lines-label","value":{"type":"Text","props":{"text":"Purchase lines","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/purchase-lines-result","value":{"type":"MthdsResult","props":{"path":"line_items","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/supporting-hairline","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/supporting-details","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["document-details","trading-parties"]}}\n{"op":"add","path":"/elements/document-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["issue-date","transaction-time","invoice-number","before-tax","tax-amount","tax-rates","document-type","classification-reason"]}}\n{"op":"add","path":"/elements/issue-date","value":{"type":"DateText","props":{"value":{"$item":"issue_date"},"style":"long","tone":"muted"},"visible":{"$item":"issue_date"},"children":[]}}\n{"op":"add","path":"/elements/transaction-time","value":{"type":"Detail","props":{"label":"Time","value":{"$item":"time"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-number","value":{"type":"Detail","props":{"label":"Invoice number","value":{"$item":"invoice_number"}},"children":[]}}\n{"op":"add","path":"/elements/before-tax","value":{"type":"Detail","props":{"label":"Before tax","value":{"$item":"amount_excl_tax"}},"children":[]}}\n{"op":"add","path":"/elements/tax-amount","value":{"type":"Detail","props":{"label":"Tax","value":{"$item":"vat_amount"}},"children":[]}}\n{"op":"add","path":"/elements/tax-rates","value":{"type":"MthdsResult","props":{"path":"vat_rates"},"visible":{"$item":"vat_rates"},"children":[]}}\n{"op":"add","path":"/elements/document-type","value":{"type":"Detail","props":{"label":"Document type","value":{"$item":"category/category"}},"children":[]}}\n{"op":"add","path":"/elements/classification-reason","value":{"type":"Detail","props":{"label":"Classification reason","value":{"$item":"category/explanation"}},"children":[]}}\n{"op":"add","path":"/elements/trading-parties","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"visible":{"$or":[{"$item":"vendor_address"},{"$item":"vendor_siret"},{"$item":"vendor_vat_number"},{"$item":"company_name"},{"$item":"company_address"}]},"children":["seller-address","seller-siret","seller-vat-number","buyer-name","buyer-address"]}}\n{"op":"add","path":"/elements/seller-address","value":{"type":"Detail","props":{"label":"Seller address","value":{"$item":"vendor_address"}},"children":[]}}\n{"op":"add","path":"/elements/seller-siret","value":{"type":"Detail","props":{"label":"Seller SIRET","value":{"$item":"vendor_siret"}},"children":[]}}\n{"op":"add","path":"/elements/seller-vat-number","value":{"type":"Detail","props":{"label":"Seller VAT number","value":{"$item":"vendor_vat_number"}},"children":[]}}\n{"op":"add","path":"/elements/buyer-name","value":{"type":"Detail","props":{"label":"Buyer","value":{"$item":"company_name"}},"children":[]}}\n{"op":"add","path":"/elements/buyer-address","value":{"type":"Detail","props":{"label":"Buyer address","value":{"$item":"company_address"}},"children":[]}}\n{"op":"add","path":"/elements/original-text","value":{"type":"Collapsible","props":{"title":"Original text","defaultOpen":false},"visible":{"$item":"text"},"children":["source-text"]}}\n{"op":"add","path":"/elements/source-text","value":{"type":"Text","props":{"text":{"$item":"text"},"variant":"code"},"children":[]}}',
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
          children: ['review-header', 'invoices'],
        },
        'review-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Extraction complete',
            title: 'Review the invoices',
          },
          children: [],
        },
        invoices: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          repeat: {
            statePath: '/result',
            key: 'invoice_id',
          },
          children: ['invoice'],
        },
        invoice: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: [
            'invoice-summary',
            'purchase-lines',
            'supporting-hairline',
            'supporting-details',
            'original-text',
          ],
        },
        'invoice-summary': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
            align: 'stretch',
          },
          children: ['vendor-heading', 'invoice-total', 'purchase-description'],
        },
        'vendor-heading': {
          type: 'Heading',
          props: {
            text: {
              $item: 'vendor',
            },
            level: 'h2',
          },
          visible: {
            $item: 'vendor',
          },
          children: [],
        },
        'invoice-total': {
          type: 'Fact',
          props: {
            label: 'Total including tax',
            value: {
              $cond: {
                $item: 'currency',
              },
              $then: {
                $template: '${amount_incl_tax} ${currency}',
              },
              $else: {
                $template: '${amount_incl_tax}',
              },
            },
          },
          children: [],
        },
        'purchase-description': {
          type: 'Text',
          props: {
            text: {
              $item: 'description',
            },
            variant: 'body',
          },
          visible: {
            $item: 'description',
          },
          children: [],
        },
        'purchase-lines': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['purchase-lines-label', 'purchase-lines-result'],
        },
        'purchase-lines-label': {
          type: 'Text',
          props: {
            text: 'Purchase lines',
            variant: 'caption',
          },
          children: [],
        },
        'purchase-lines-result': {
          type: 'MthdsResult',
          props: {
            path: 'line_items',
            hideLabel: true,
          },
          children: [],
        },
        'supporting-hairline': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'supporting-details': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['document-details', 'trading-parties'],
        },
        'document-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: [
            'issue-date',
            'transaction-time',
            'invoice-number',
            'before-tax',
            'tax-amount',
            'tax-rates',
            'document-type',
            'classification-reason',
          ],
        },
        'issue-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'issue_date',
            },
            style: 'long',
            tone: 'muted',
          },
          visible: {
            $item: 'issue_date',
          },
          children: [],
        },
        'transaction-time': {
          type: 'Detail',
          props: {
            label: 'Time',
            value: {
              $item: 'time',
            },
          },
          children: [],
        },
        'invoice-number': {
          type: 'Detail',
          props: {
            label: 'Invoice number',
            value: {
              $item: 'invoice_number',
            },
          },
          children: [],
        },
        'before-tax': {
          type: 'Detail',
          props: {
            label: 'Before tax',
            value: {
              $item: 'amount_excl_tax',
            },
          },
          children: [],
        },
        'tax-amount': {
          type: 'Detail',
          props: {
            label: 'Tax',
            value: {
              $item: 'vat_amount',
            },
          },
          children: [],
        },
        'tax-rates': {
          type: 'MthdsResult',
          props: {
            path: 'vat_rates',
          },
          visible: {
            $item: 'vat_rates',
          },
          children: [],
        },
        'document-type': {
          type: 'Detail',
          props: {
            label: 'Document type',
            value: {
              $item: 'category/category',
            },
          },
          children: [],
        },
        'classification-reason': {
          type: 'Detail',
          props: {
            label: 'Classification reason',
            value: {
              $item: 'category/explanation',
            },
          },
          children: [],
        },
        'trading-parties': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          visible: {
            $or: [
              {
                $item: 'vendor_address',
              },
              {
                $item: 'vendor_siret',
              },
              {
                $item: 'vendor_vat_number',
              },
              {
                $item: 'company_name',
              },
              {
                $item: 'company_address',
              },
            ],
          },
          children: [
            'seller-address',
            'seller-siret',
            'seller-vat-number',
            'buyer-name',
            'buyer-address',
          ],
        },
        'seller-address': {
          type: 'Detail',
          props: {
            label: 'Seller address',
            value: {
              $item: 'vendor_address',
            },
          },
          children: [],
        },
        'seller-siret': {
          type: 'Detail',
          props: {
            label: 'Seller SIRET',
            value: {
              $item: 'vendor_siret',
            },
          },
          children: [],
        },
        'seller-vat-number': {
          type: 'Detail',
          props: {
            label: 'Seller VAT number',
            value: {
              $item: 'vendor_vat_number',
            },
          },
          children: [],
        },
        'buyer-name': {
          type: 'Detail',
          props: {
            label: 'Buyer',
            value: {
              $item: 'company_name',
            },
          },
          children: [],
        },
        'buyer-address': {
          type: 'Detail',
          props: {
            label: 'Buyer address',
            value: {
              $item: 'company_address',
            },
          },
          children: [],
        },
        'original-text': {
          type: 'Collapsible',
          props: {
            title: 'Original text',
            defaultOpen: false,
          },
          visible: {
            $item: 'text',
          },
          children: ['source-text'],
        },
        'source-text': {
          type: 'Text',
          props: {
            text: {
              $item: 'text',
            },
            variant: 'code',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person checking extracted invoices verify each payable amount, its purchase lines and its supporting details without losing the original evidence.',
      title: 'Review the invoices',
      composition:
        "Open with one ResultHeader, then repeat a generously spaced, full-width Stack for each invoice in /result, preserving its order; all regions after the header belong inside that repeat. Each invoice opens with the vendor as an h2 and a prominent total tile, followed by the purchase description and lines. Below a hairline, a two-column Grid groups document details and trading parties; source text stays folded at the end. Use wide breathing room between invoices and compact spacing within details, with no enclosing cards, side rail or repeated request. Relative bindings resolve against the current invoice; the total's template reads its amount and currency together, and all remaining amounts use that same currency without repeating the currency value.",
      regions: [
        {
          title: null,
          purpose: "Name the review task and provide the host's placement for result actions.",
          container: 'Stack',
          elements: [
            'ResultHeader — static title "Review the invoices" as the only h1; eyebrow "Extraction complete"; no subtitle; retain the host\'s result actions.',
          ],
        },
        {
          title: null,
          purpose:
            'Make the seller and the amount to check the first things read for each invoice.',
          container: 'Stack',
          elements: [
            'Heading — h2, reads vendor with $item in the /result repeat; hide when empty.',
            'Fact — label "Total including tax"; value uses $template to join amount_incl_tax, formatted to two decimal places, and currency from the current invoice; omit the currency suffix when empty.',
            'Text — reads description with $item; hide when empty.',
          ],
        },
        {
          title: 'Purchase lines',
          purpose:
            'Keep the priced lines directly beneath the total so the reader can inspect what was charged.',
          container: 'Stack',
          elements: [
            'Text — static section label "Purchase lines", not another heading.',
            'MthdsResult — path line_items relative to the current invoice; hideLabel true; delegate the entire priced-line list.',
          ],
        },
        {
          title: null,
          purpose:
            'Separate supporting facts from the purchase, pairing accounting details with the parties involved.',
          container: 'Grid',
          elements: [
            'Separator — a full-width hairline before the supporting details.',
            'Grid — two equal columns, stacking on narrow screens; first child is the document-details Stack and second child is the parties Stack.',
            'Stack — document details, holding DateText, Detail lines and the tax-rate renderer in the order below.',
            'DateText — value issue_date with $item; format long; muted tone; hide when empty.',
            'Detail — label "Time"; value time with $item.',
            'Detail — label "Invoice number"; value invoice_number with $item.',
            'Detail — label "Before tax"; value amount_excl_tax with $item; two decimal places; hide when empty.',
            'Detail — label "Tax"; value vat_amount with $item; two decimal places; hide when empty.',
            'MthdsResult — path vat_rates relative to the current invoice; label "Tax rates"; delegate the number list and retain its percentage meaning; hide when empty.',
            'Detail — label "Document type"; value category/category with $item; choices carried by the result are "bill" | "receipt".',
            'Detail — label "Classification reason"; value category/explanation with $item.',
            'Stack — parties, holding the following Detail lines; suppress the column when all its values are empty.',
            'Detail — label "Seller address"; value vendor_address with $item.',
            'Detail — label "Seller SIRET"; value vendor_siret with $item.',
            'Detail — label "Seller VAT number"; value vendor_vat_number with $item.',
            'Detail — label "Buyer"; value company_name with $item.',
            'Detail — label "Buyer address"; value company_address with $item.',
          ],
        },
        {
          title: 'Original text',
          purpose:
            'Make the extracted source available for checking without letting receipt boilerplate dominate the review.',
          container: 'Collapsible',
          elements: [
            'Collapsible — trigger "Original text"; initially closed; holds the source Text; omit when text is empty.',
            'Text — reads text with $item; preserve line breaks.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        'line_items — MthdsResult within each /result item; delegate the priced-line list whole to retain its nested structure and optional quantities and prices.',
        'vat_rates — MthdsResult within each /result item; delegate the numeric list whole.',
      ],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'NOMPMTALKXviz5e7E2D2bQMQETFQC3FZ',
    frame: 'result',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.result.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["header","invoices"]}}\n{"op":"add","path":"/elements/header","value":{"type":"ResultHeader","props":{"eyebrow":"Extraction result","title":"Review extracted invoices"},"children":[]}}\n{"op":"add","path":"/elements/invoices","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["invoice-record"],"repeat":{"statePath":"/result","key":"invoice_id"}}}\n{"op":"add","path":"/elements/invoice-record","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["invoice-overview","purchase-lines","details-disclosure","invoice-separator"]}}\n{"op":"add","path":"/elements/invoice-overview","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["invoice-lead","transaction-facts","purchase-description","net-tax"]}}\n{"op":"add","path":"/elements/invoice-lead","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"start","justify":"between"},"children":["vendor-heading","payable-total"]}}\n{"op":"add","path":"/elements/vendor-heading","value":{"type":"Heading","props":{"text":{"$cond":{"$item":"vendor"},"$then":{"$item":"vendor"},"$else":"Invoice"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/payable-total","value":{"type":"Text","props":{"text":{"$cond":{"$item":"currency"},"$then":{"$template":"Total ${amount_incl_tax} ${currency}"},"$else":{"$template":"Total ${amount_incl_tax}"}},"variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/transaction-facts","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center"},"children":["issue-date","transaction-time","invoice-number","invoice-category"]}}\n{"op":"add","path":"/elements/issue-date","value":{"type":"DateText","props":{"value":{"$item":"issue_date"},"style":"short","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/transaction-time","value":{"type":"Detail","props":{"label":"Time","value":{"$item":"time"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-number","value":{"type":"Detail","props":{"label":"Invoice number","value":{"$item":"invoice_number"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-category","value":{"type":"Badge","props":{"text":{"$item":"category/category"},"variant":"secondary"},"children":[]}}\n{"op":"add","path":"/elements/purchase-description","value":{"type":"Text","props":{"text":{"$item":"description"},"variant":"body"},"visible":{"$item":"description"},"children":[]}}\n{"op":"add","path":"/elements/net-tax","value":{"type":"Grid","props":{"columns":2,"gap":"sm"},"children":["net-amount","tax-amount"]}}\n{"op":"add","path":"/elements/net-amount","value":{"type":"Detail","props":{"label":"Net","value":{"$cond":{"$item":"currency"},"$then":{"$template":"${amount_excl_tax} ${currency}"},"$else":{"$template":"${amount_excl_tax}"}}},"visible":[{"$item":"amount_excl_tax","neq":null},{"$item":"amount_excl_tax","neq":""}],"children":[]}}\n{"op":"add","path":"/elements/tax-amount","value":{"type":"Detail","props":{"label":"Tax","value":{"$cond":{"$item":"currency"},"$then":{"$template":"${vat_amount} ${currency}"},"$else":{"$template":"${vat_amount}"}}},"visible":[{"$item":"vat_amount","neq":null},{"$item":"vat_amount","neq":""}],"children":[]}}\n{"op":"add","path":"/elements/purchase-lines","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["line-items"]}}\n{"op":"add","path":"/elements/line-items","value":{"type":"MthdsResult","props":{"path":"line_items"},"children":[]}}\n{"op":"add","path":"/elements/details-disclosure","value":{"type":"Collapsible","props":{"title":"Details and source","defaultOpen":false},"children":["supporting-details"]}}\n{"op":"add","path":"/elements/supporting-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["seller-address","seller-siret","seller-vat-number","buyer-name","buyer-address","vat-rates","classification-reason","source-separator","source-text"]}}\n{"op":"add","path":"/elements/seller-address","value":{"type":"Detail","props":{"label":"Seller address","value":{"$item":"vendor_address"}},"children":[]}}\n{"op":"add","path":"/elements/seller-siret","value":{"type":"Detail","props":{"label":"SIRET","value":{"$item":"vendor_siret"}},"children":[]}}\n{"op":"add","path":"/elements/seller-vat-number","value":{"type":"Detail","props":{"label":"VAT number","value":{"$item":"vendor_vat_number"}},"children":[]}}\n{"op":"add","path":"/elements/buyer-name","value":{"type":"Detail","props":{"label":"Buyer","value":{"$item":"company_name"}},"children":[]}}\n{"op":"add","path":"/elements/buyer-address","value":{"type":"Detail","props":{"label":"Buyer address","value":{"$item":"company_address"}},"children":[]}}\n{"op":"add","path":"/elements/vat-rates","value":{"type":"MthdsResult","props":{"path":"vat_rates"},"visible":{"$item":"vat_rates"},"children":[]}}\n{"op":"add","path":"/elements/classification-reason","value":{"type":"Detail","props":{"label":"Classification reason","value":{"$item":"category/explanation"}},"children":[]}}\n{"op":"add","path":"/elements/source-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/source-text","value":{"type":"MthdsResult","props":{"path":"text"},"children":[]}}\n{"op":"add","path":"/elements/invoice-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['header', 'invoices'],
        },
        header: {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Extraction result',
            title: 'Review extracted invoices',
          },
          children: [],
        },
        invoices: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['invoice-record'],
          repeat: {
            statePath: '/result',
            key: 'invoice_id',
          },
        },
        'invoice-record': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'invoice-overview',
            'purchase-lines',
            'details-disclosure',
            'invoice-separator',
          ],
        },
        'invoice-overview': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['invoice-lead', 'transaction-facts', 'purchase-description', 'net-tax'],
        },
        'invoice-lead': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'start',
            justify: 'between',
          },
          children: ['vendor-heading', 'payable-total'],
        },
        'vendor-heading': {
          type: 'Heading',
          props: {
            text: {
              $cond: {
                $item: 'vendor',
              },
              $then: {
                $item: 'vendor',
              },
              $else: 'Invoice',
            },
            level: 'h2',
          },
          children: [],
        },
        'payable-total': {
          type: 'Text',
          props: {
            text: {
              $cond: {
                $item: 'currency',
              },
              $then: {
                $template: 'Total ${amount_incl_tax} ${currency}',
              },
              $else: {
                $template: 'Total ${amount_incl_tax}',
              },
            },
            variant: 'lead',
          },
          children: [],
        },
        'transaction-facts': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
          },
          children: ['issue-date', 'transaction-time', 'invoice-number', 'invoice-category'],
        },
        'issue-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'issue_date',
            },
            style: 'short',
            tone: 'muted',
          },
          children: [],
        },
        'transaction-time': {
          type: 'Detail',
          props: {
            label: 'Time',
            value: {
              $item: 'time',
            },
          },
          children: [],
        },
        'invoice-number': {
          type: 'Detail',
          props: {
            label: 'Invoice number',
            value: {
              $item: 'invoice_number',
            },
          },
          children: [],
        },
        'invoice-category': {
          type: 'Badge',
          props: {
            text: {
              $item: 'category/category',
            },
            variant: 'secondary',
          },
          children: [],
        },
        'purchase-description': {
          type: 'Text',
          props: {
            text: {
              $item: 'description',
            },
            variant: 'body',
          },
          visible: {
            $item: 'description',
          },
          children: [],
        },
        'net-tax': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'sm',
          },
          children: ['net-amount', 'tax-amount'],
        },
        'net-amount': {
          type: 'Detail',
          props: {
            label: 'Net',
            value: {
              $cond: {
                $item: 'currency',
              },
              $then: {
                $template: '${amount_excl_tax} ${currency}',
              },
              $else: {
                $template: '${amount_excl_tax}',
              },
            },
          },
          visible: [
            {
              $item: 'amount_excl_tax',
              neq: null,
            },
            {
              $item: 'amount_excl_tax',
              neq: '',
            },
          ],
          children: [],
        },
        'tax-amount': {
          type: 'Detail',
          props: {
            label: 'Tax',
            value: {
              $cond: {
                $item: 'currency',
              },
              $then: {
                $template: '${vat_amount} ${currency}',
              },
              $else: {
                $template: '${vat_amount}',
              },
            },
          },
          visible: [
            {
              $item: 'vat_amount',
              neq: null,
            },
            {
              $item: 'vat_amount',
              neq: '',
            },
          ],
          children: [],
        },
        'purchase-lines': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['line-items'],
        },
        'line-items': {
          type: 'MthdsResult',
          props: {
            path: 'line_items',
          },
          children: [],
        },
        'details-disclosure': {
          type: 'Collapsible',
          props: {
            title: 'Details and source',
            defaultOpen: false,
          },
          children: ['supporting-details'],
        },
        'supporting-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: [
            'seller-address',
            'seller-siret',
            'seller-vat-number',
            'buyer-name',
            'buyer-address',
            'vat-rates',
            'classification-reason',
            'source-separator',
            'source-text',
          ],
        },
        'seller-address': {
          type: 'Detail',
          props: {
            label: 'Seller address',
            value: {
              $item: 'vendor_address',
            },
          },
          children: [],
        },
        'seller-siret': {
          type: 'Detail',
          props: {
            label: 'SIRET',
            value: {
              $item: 'vendor_siret',
            },
          },
          children: [],
        },
        'seller-vat-number': {
          type: 'Detail',
          props: {
            label: 'VAT number',
            value: {
              $item: 'vendor_vat_number',
            },
          },
          children: [],
        },
        'buyer-name': {
          type: 'Detail',
          props: {
            label: 'Buyer',
            value: {
              $item: 'company_name',
            },
          },
          children: [],
        },
        'buyer-address': {
          type: 'Detail',
          props: {
            label: 'Buyer address',
            value: {
              $item: 'company_address',
            },
          },
          children: [],
        },
        'vat-rates': {
          type: 'MthdsResult',
          props: {
            path: 'vat_rates',
          },
          visible: {
            $item: 'vat_rates',
          },
          children: [],
        },
        'classification-reason': {
          type: 'Detail',
          props: {
            label: 'Classification reason',
            value: {
              $item: 'category/explanation',
            },
          },
          children: [],
        },
        'source-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'source-text': {
          type: 'MthdsResult',
          props: {
            path: 'text',
          },
          children: [],
        },
        'invoice-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone checking an extracted invoice verify the payable amount, inspect the purchase lines, and consult the source only when something needs checking.',
      title: 'Review extracted invoices',
      composition:
        "Use a compact, full-width result with one ResultHeader, followed by a vertical Stack repeating over /result in its original order. Each invoice is a flat, tightly grouped record: vendor and the large payable amount share a horizontal Stack, followed by the transaction facts, purchase lines, and a closed details disclosure. Separate invoices with a Separator, not enclosing cards; stack horizontal groups on narrow screens. The page header is the only h1, vendor headings are h2, and the host's result actions appear only in ResultHeader. Read the root list with $state at /result and the listed relative members with $item inside its repeat; do not create indexed state paths. Omit invoice_id, which is an internal identifier, and do not calculate totals, reconcile differences, or invent missing values.",
      regions: [
        {
          title: null,
          purpose:
            "Name the review task and provide the host's existing result-action placement without repeating the request.",
          container: 'Stack',
          elements: [
            'ResultHeader — title "Review extracted invoices"; eyebrow "Extraction result"; no subtitle; host-owned result actions.',
          ],
        },
        {
          title: null,
          purpose:
            'Lead each invoice with who charged it and the amount to pay, then give the short context needed to recognize the transaction.',
          container: 'Stack',
          elements: [
            "Stack — repeat over /result using $state; holds this invoice's overview, purchase lines, and details disclosure, in that order; Separator between repeated records.",
            'Stack — horizontal, vendor Heading on the left and payable Text on the right; stack on narrow screens.',
            'Heading — $item vendor; h2; use "Invoice" as the heading when vendor is empty.',
            'Text — $template reading $item amount_incl_tax and currency; label "Total"; largest figure in the record, amount formatted to two decimal places, followed by currency only when present.',
            'Stack — compact horizontal transaction facts; wraps on narrow screens.',
            'DateText — $item issue_date; format short.',
            'Detail — $item time; label "Time"; hide when empty.',
            'Detail — $item invoice_number; label "Invoice number"; hide when empty.',
            'Badge — $item category/category; display the extracted value as written.',
            'Text — $item description; hide when empty.',
            'Grid — two columns holding net and tax details; one column on narrow screens.',
            'Detail — $template reading $item amount_excl_tax and currency; label "Net"; amount formatted to two decimal places, followed by currency only when present; hide when amount is empty.',
            'Detail — $template reading $item vat_amount and currency; label "Tax"; amount formatted to two decimal places, followed by currency only when present; hide when amount is empty.',
          ],
        },
        {
          title: null,
          purpose:
            'Keep the priced purchase lines immediately beneath the amounts so the extraction can be checked without opening a disclosure.',
          container: 'Stack',
          elements: [
            'MthdsResult — path line_items, relative to each invoice in the /result repeat; retain its own label; render the complete ordered purchase-line subtree.',
          ],
        },
        {
          title: 'Details and source',
          purpose:
            'Keep registration details, buyer information, tax rates, classification reasoning, and the raw extraction available without competing with the purchase review.',
          container: 'Collapsible',
          elements: [
            'Collapsible — trigger "Details and source"; initially closed; one per invoice in the /result repeat; holds a flat Stack of the following elements.',
            'Detail — $item vendor_address; label "Seller address"; hide when empty.',
            'Detail — $item vendor_siret; label "SIRET"; hide when empty.',
            'Detail — $item vendor_vat_number; label "VAT number"; hide when empty.',
            'Detail — $item company_name; label "Buyer"; hide when empty.',
            'Detail — $item company_address; label "Buyer address"; hide when empty.',
            'MthdsResult — path vat_rates, relative to each invoice; retain its own label; hide when empty.',
            'Detail — $item category/explanation; label "Classification reason"; hide when empty.',
            'Separator — separates supporting details from the source text.',
            'MthdsResult — path text, relative to each invoice; retain its own label; preserve the raw extracted text and line breaks.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        'line_items — relative to each invoice in /result; delegate the complete ordered purchase-line structure to MthdsResult.',
        'vat_rates — relative to each invoice in /result; delegate the numeric tax-rate list to MthdsResult.',
        'text — relative to each invoice in /result; delegate raw extracted source text to MthdsResult inside the closed disclosure.',
      ],
    },
  },
  {
    pipeRef: 'invoice_extraction.process_invoice',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'kipcRxWmjPsSFZV157zVKQuJWA5WwkHX',
    frame: 'result',
    style: 'soft',
    repairs: 1,
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/invoice_extraction.process_invoice.result.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header-region","invoices"]}}\n{"op":"add","path":"/elements/header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["result-header"]}}\n{"op":"add","path":"/elements/result-header","value":{"type":"ResultHeader","props":{"eyebrow":"Extraction complete","title":"Review extracted invoices"},"children":[]}}\n{"op":"add","path":"/elements/invoices","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"repeat":{"statePath":"/result","key":"invoice_id"},"children":["invoice-block"]}}\n{"op":"add","path":"/elements/invoice-block","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["invoice-summary","purchases","invoice-details","extracted-source","invoice-separator"]}}\n{"op":"add","path":"/elements/invoice-summary","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["vendor","total-charged","transaction-date-time","purchase-summary"]}}\n{"op":"add","path":"/elements/vendor","value":{"type":"Heading","props":{"text":{"$item":"vendor"},"level":"h2"},"visible":{"$item":"vendor"},"children":[]}}\n{"op":"add","path":"/elements/total-charged","value":{"type":"Fact","props":{"label":"Total charged","value":{"$cond":{"$item":"currency"},"$then":{"$template":"${amount_incl_tax} ${currency}"},"$else":{"$template":"${amount_incl_tax}"}}},"children":[]}}\n{"op":"add","path":"/elements/transaction-date-time","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center"},"children":["issue-date","transaction-time"]}}\n{"op":"add","path":"/elements/issue-date","value":{"type":"DateText","props":{"value":{"$item":"issue_date"},"style":"long","tone":"muted"},"visible":{"$item":"issue_date"},"children":[]}}\n{"op":"add","path":"/elements/transaction-time","value":{"type":"Text","props":{"text":{"$item":"time"},"variant":"muted"},"visible":{"$item":"time"},"children":[]}}\n{"op":"add","path":"/elements/purchase-summary","value":{"type":"Text","props":{"text":{"$item":"description"},"variant":"body"},"visible":{"$item":"description"},"children":[]}}\n{"op":"add","path":"/elements/purchases","value":{"type":"Section","props":{"title":"Purchases"},"children":["purchase-lines"]}}\n{"op":"add","path":"/elements/purchase-lines","value":{"type":"MthdsResult","props":{"path":"line_items","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/invoice-details","value":{"type":"Section","props":{"title":"Invoice details"},"children":["details-grid"]}}\n{"op":"add","path":"/elements/details-grid","value":{"type":"Grid","props":{"columns":2,"gap":"xl"},"children":["accounting-details","party-details"]}}\n{"op":"add","path":"/elements/accounting-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["before-tax","tax-amount","tax-rates","invoice-number","document-type","classification-explanation"]}}\n{"op":"add","path":"/elements/before-tax","value":{"type":"Detail","props":{"label":"Before tax","value":{"$cond":{"$item":"currency"},"$then":{"$template":"${amount_excl_tax} ${currency}"},"$else":{"$template":"${amount_excl_tax}"}}},"visible":[{"$item":"amount_excl_tax","neq":null},{"$item":"amount_excl_tax","neq":""}],"children":[]}}\n{"op":"add","path":"/elements/tax-amount","value":{"type":"Detail","props":{"label":"Tax","value":{"$cond":{"$item":"currency"},"$then":{"$template":"${vat_amount} ${currency}"},"$else":{"$template":"${vat_amount}"}}},"visible":[{"$item":"vat_amount","neq":null},{"$item":"vat_amount","neq":""}],"children":[]}}\n{"op":"add","path":"/elements/tax-rates","value":{"type":"MthdsResult","props":{"path":"vat_rates"},"visible":{"$item":"vat_rates"},"children":[]}}\n{"op":"add","path":"/elements/invoice-number","value":{"type":"Detail","props":{"label":"Invoice number","value":{"$item":"invoice_number"}},"children":[]}}\n{"op":"add","path":"/elements/document-type","value":{"type":"Detail","props":{"label":"Document type","value":{"$item":"category/category"}},"children":[]}}\n{"op":"add","path":"/elements/classification-explanation","value":{"type":"Detail","props":{"label":"Why this type","value":{"$item":"category/explanation"}},"children":[]}}\n{"op":"add","path":"/elements/party-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["seller-address","seller-siret","seller-vat-number","buyer","buyer-address"]}}\n{"op":"add","path":"/elements/seller-address","value":{"type":"Detail","props":{"label":"Seller address","value":{"$item":"vendor_address"}},"children":[]}}\n{"op":"add","path":"/elements/seller-siret","value":{"type":"Detail","props":{"label":"SIRET","value":{"$item":"vendor_siret"}},"children":[]}}\n{"op":"add","path":"/elements/seller-vat-number","value":{"type":"Detail","props":{"label":"Seller VAT number","value":{"$item":"vendor_vat_number"}},"children":[]}}\n{"op":"add","path":"/elements/buyer","value":{"type":"Detail","props":{"label":"Buyer","value":{"$item":"company_name"}},"children":[]}}\n{"op":"add","path":"/elements/buyer-address","value":{"type":"Detail","props":{"label":"Buyer address","value":{"$item":"company_address"}},"children":[]}}\n{"op":"add","path":"/elements/extracted-source","value":{"type":"Collapsible","props":{"title":"Extracted source text","defaultOpen":false},"visible":{"$item":"text"},"children":["source-text"]}}\n{"op":"add","path":"/elements/source-text","value":{"type":"Text","props":{"text":{"$item":"text"},"variant":"code"},"children":[]}}\n{"op":"add","path":"/elements/invoice-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header-region', 'invoices'],
        },
        'header-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['result-header'],
        },
        'result-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Extraction complete',
            title: 'Review extracted invoices',
          },
          children: [],
        },
        invoices: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          repeat: {
            statePath: '/result',
            key: 'invoice_id',
          },
          children: ['invoice-block'],
        },
        'invoice-block': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: [
            'invoice-summary',
            'purchases',
            'invoice-details',
            'extracted-source',
            'invoice-separator',
          ],
        },
        'invoice-summary': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['vendor', 'total-charged', 'transaction-date-time', 'purchase-summary'],
        },
        vendor: {
          type: 'Heading',
          props: {
            text: {
              $item: 'vendor',
            },
            level: 'h2',
          },
          visible: {
            $item: 'vendor',
          },
          children: [],
        },
        'total-charged': {
          type: 'Fact',
          props: {
            label: 'Total charged',
            value: {
              $cond: {
                $item: 'currency',
              },
              $then: {
                $template: '${amount_incl_tax} ${currency}',
              },
              $else: {
                $template: '${amount_incl_tax}',
              },
            },
          },
          children: [],
        },
        'transaction-date-time': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
          },
          children: ['issue-date', 'transaction-time'],
        },
        'issue-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'issue_date',
            },
            style: 'long',
            tone: 'muted',
          },
          visible: {
            $item: 'issue_date',
          },
          children: [],
        },
        'transaction-time': {
          type: 'Text',
          props: {
            text: {
              $item: 'time',
            },
            variant: 'muted',
          },
          visible: {
            $item: 'time',
          },
          children: [],
        },
        'purchase-summary': {
          type: 'Text',
          props: {
            text: {
              $item: 'description',
            },
            variant: 'body',
          },
          visible: {
            $item: 'description',
          },
          children: [],
        },
        purchases: {
          type: 'Section',
          props: {
            title: 'Purchases',
          },
          children: ['purchase-lines'],
        },
        'purchase-lines': {
          type: 'MthdsResult',
          props: {
            path: 'line_items',
            hideLabel: true,
          },
          children: [],
        },
        'invoice-details': {
          type: 'Section',
          props: {
            title: 'Invoice details',
          },
          children: ['details-grid'],
        },
        'details-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'xl',
          },
          children: ['accounting-details', 'party-details'],
        },
        'accounting-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: [
            'before-tax',
            'tax-amount',
            'tax-rates',
            'invoice-number',
            'document-type',
            'classification-explanation',
          ],
        },
        'before-tax': {
          type: 'Detail',
          props: {
            label: 'Before tax',
            value: {
              $cond: {
                $item: 'currency',
              },
              $then: {
                $template: '${amount_excl_tax} ${currency}',
              },
              $else: {
                $template: '${amount_excl_tax}',
              },
            },
          },
          visible: [
            {
              $item: 'amount_excl_tax',
              neq: null,
            },
            {
              $item: 'amount_excl_tax',
              neq: '',
            },
          ],
          children: [],
        },
        'tax-amount': {
          type: 'Detail',
          props: {
            label: 'Tax',
            value: {
              $cond: {
                $item: 'currency',
              },
              $then: {
                $template: '${vat_amount} ${currency}',
              },
              $else: {
                $template: '${vat_amount}',
              },
            },
          },
          visible: [
            {
              $item: 'vat_amount',
              neq: null,
            },
            {
              $item: 'vat_amount',
              neq: '',
            },
          ],
          children: [],
        },
        'tax-rates': {
          type: 'MthdsResult',
          props: {
            path: 'vat_rates',
          },
          visible: {
            $item: 'vat_rates',
          },
          children: [],
        },
        'invoice-number': {
          type: 'Detail',
          props: {
            label: 'Invoice number',
            value: {
              $item: 'invoice_number',
            },
          },
          children: [],
        },
        'document-type': {
          type: 'Detail',
          props: {
            label: 'Document type',
            value: {
              $item: 'category/category',
            },
          },
          children: [],
        },
        'classification-explanation': {
          type: 'Detail',
          props: {
            label: 'Why this type',
            value: {
              $item: 'category/explanation',
            },
          },
          children: [],
        },
        'party-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: [
            'seller-address',
            'seller-siret',
            'seller-vat-number',
            'buyer',
            'buyer-address',
          ],
        },
        'seller-address': {
          type: 'Detail',
          props: {
            label: 'Seller address',
            value: {
              $item: 'vendor_address',
            },
          },
          children: [],
        },
        'seller-siret': {
          type: 'Detail',
          props: {
            label: 'SIRET',
            value: {
              $item: 'vendor_siret',
            },
          },
          children: [],
        },
        'seller-vat-number': {
          type: 'Detail',
          props: {
            label: 'Seller VAT number',
            value: {
              $item: 'vendor_vat_number',
            },
          },
          children: [],
        },
        buyer: {
          type: 'Detail',
          props: {
            label: 'Buyer',
            value: {
              $item: 'company_name',
            },
          },
          children: [],
        },
        'buyer-address': {
          type: 'Detail',
          props: {
            label: 'Buyer address',
            value: {
              $item: 'company_address',
            },
          },
          children: [],
        },
        'extracted-source': {
          type: 'Collapsible',
          props: {
            title: 'Extracted source text',
            defaultOpen: false,
          },
          visible: {
            $item: 'text',
          },
          children: ['source-text'],
        },
        'source-text': {
          type: 'Text',
          props: {
            text: {
              $item: 'text',
            },
            variant: 'code',
          },
          children: [],
        },
        'invoice-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person checking an invoice extraction confirm the charged total, inspect the purchases, and trace uncertain details back to the source.',
      title: 'Review extracted invoices',
      composition:
        'Open with a quiet ResultHeader, then repeat a generously spaced, flat invoice block for each item in /result, preserving source order. Each block starts with the vendor as an h2 and a prominent total, followed by the date and purchase summary; below, a full-width purchases section precedes a compact two-column details grid. Keep the extracted source text folded away at the end of each block. On narrow screens the details columns stack; separate invoice blocks with a Separator rather than enclosing them in cards. All item-relative reads resolve within the repeat over $state /result, without inventing indexed state paths. There is one page h1, no request recap, no additional run control, and no host chrome.',
      regions: [
        {
          title: null,
          purpose: "Name the review task and provide the host's placement for result actions.",
          container: 'Stack',
          elements: [
            'ResultHeader — title "Review extracted invoices"; eyebrow "Extraction complete"; no subtitle; host-owned result actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            'Identify each invoice and put the charged amount first, without manufacturing an aggregate across currencies.',
          container: 'Stack',
          elements: [
            'Stack — repeat over /result read with $state; contains this region and all following invoice regions once per item, in source order.',
            'Heading — h2, reads vendor relative to the current /result item; omit when empty.',
            'Fact — label "Total charged"; value uses $template with amount_incl_tax and currency from the current item, separated by a space; amount displayed to two decimal places; omit the currency suffix when empty.',
            'Stack — horizontal on wide screens, wrapping on narrow screens; holds the date and transaction time.',
            'DateText — reads issue_date relative to the current item; format "long", tone "muted"; omit when empty.',
            'Text — reads time relative to the current item; muted; omit when empty.',
            'Text — reads description relative to the current item; omit when empty.',
          ],
        },
        {
          title: 'Purchases',
          purpose:
            'Keep the printed purchases, fees, and discounts together and in their original order.',
          container: 'Section',
          elements: [
            'MthdsResult — path line_items relative to the current /result item; hideLabel true; delegate the complete priced-line structure rather than constructing a table with unsupported item-relative rows.',
          ],
        },
        {
          title: 'Invoice details',
          purpose:
            'Place the accounting breakdown beside the parties, leaving optional identifiers unobtrusive and absent values hidden.',
          container: 'Section',
          elements: [
            'Grid — two columns on wide screens, one on narrow screens; holds two flat Stacks.',
            'Stack — first column contains net amount, tax, tax rates, invoice number, and classification.',
            'Detail — label "Before tax"; value uses $template with amount_excl_tax and currency relative to the current item; amount displayed to two decimal places; omit when amount_excl_tax is empty and omit the currency suffix when empty.',
            'Detail — label "Tax"; value uses $template with vat_amount and currency relative to the current item; amount displayed to two decimal places; omit when vat_amount is empty and omit the currency suffix when empty.',
            'MthdsResult — path vat_rates relative to the current item; label "Tax rates"; omit when null or empty; delegate the numeric list.',
            'Detail — label "Invoice number"; reads invoice_number relative to the current item.',
            'Detail — label "Document type"; reads category/category relative to the current item; possible values "bill" | "receipt"; read-only, not a choice control.',
            'Detail — label "Why this type"; reads category/explanation relative to the current item.',
            'Stack — second column contains seller address and registrations, then buyer details.',
            'Detail — label "Seller address"; reads vendor_address relative to the current item.',
            'Detail — label "SIRET"; reads vendor_siret relative to the current item.',
            'Detail — label "Seller VAT number"; reads vendor_vat_number relative to the current item.',
            'Detail — label "Buyer"; reads company_name relative to the current item.',
            'Detail — label "Buyer address"; reads company_address relative to the current item.',
          ],
        },
        {
          title: 'Extracted source text',
          purpose:
            'Let the reviewer inspect the extraction evidence without letting a long receipt dominate the page.',
          container: 'Collapsible',
          elements: [
            'Collapsible — trigger "Extracted source text"; initially closed; omit the entire section when text is empty.',
            'Text — reads text relative to the current /result item; preserve line breaks and wrap long lines.',
            'Separator — between repeated invoice blocks only, never after the final block.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        'line_items — within each /result item, delegate the complete priced-line list to MthdsResult for its read-only structured rendering.',
        'vat_rates — within each /result item, delegate the numeric rate list to MthdsResult.',
      ],
    },
  },
];
