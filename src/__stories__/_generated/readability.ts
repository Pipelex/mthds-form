/**
 * Generated from data/structures/readability.mthds - DO NOT EDIT.
 *
 * A pipe whose RESULT is written for a reader rather than for a builder: an invoice checked against its purchase order, carrying coded choices in snake_case and in capitals, amounts above and below 1, a one-line text, and a Markdown memo held by a plain `text` field. It carries a 'run' block, so `make fixtures-runs` produces the real payload beside the descriptor.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = ['readability.invoice_check'] as const;

export const CONTRACTS: PipeIOContracts = {
  'readability.invoice_check': {
    inputs: {
      note: {
        concept_ref: 'native.Text',
        item_count: null,
        json_schema: {
          description: 'A text',
          properties: {
            text: {
              description: 'The text',
              title: 'Text',
              type: 'string',
            },
          },
          required: ['text'],
          title: 'native.Text',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'readability.InvoiceCheck',
      item_count: null,
      json_schema: {
        $defs: {
          readability__CheckedLine: {
            description: 'One invoice line, checked against the purchase order',
            properties: {
              item: {
                description: 'What was invoiced',
                title: 'Item',
                type: 'string',
              },
              note: {
                description:
                  'What the reviewer noticed on this line, as one Markdown sentence with its key figure in bold',
                title: 'Note',
                type: 'string',
              },
              quantity: {
                description: 'How many units were invoiced',
                title: 'Quantity',
                type: 'integer',
              },
              status: {
                description: 'How the line compares with the purchase order',
                enum: [
                  'matches_po',
                  'unit_price_differs_from_po',
                  'quantity_differs_from_po',
                  'not_on_po',
                ],
                title: 'Status',
                type: 'string',
              },
              unit_price: {
                description: 'The invoiced price of one unit',
                title: 'Unit Price',
                type: 'number',
              },
            },
            required: ['item', 'quantity', 'unit_price', 'status', 'note'],
            title: 'readability__CheckedLine',
            type: 'object',
          },
        },
        description: 'A supplier invoice checked against its purchase order',
        properties: {
          amount_due: {
            description: 'The total the invoice asks for',
            title: 'Amount Due',
            type: 'number',
          },
          lines: {
            description: "The invoice's lines, each checked",
            items: {
              $ref: '#/$defs/readability__CheckedLine',
            },
            title: 'Lines',
            type: 'array',
          },
          memo: {
            description:
              'A memo for the approver, in Markdown: a level-two heading, one short paragraph, and a table comparing invoiced and ordered prices',
            title: 'Memo',
            type: 'string',
          },
          price_variance: {
            description:
              'The largest unit-price variance against the purchase order, as a fraction',
            title: 'Price Variance',
            type: 'number',
          },
          risk: {
            description: 'How risky paying it as it stands would be',
            enum: ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'],
            title: 'Risk',
            type: 'string',
          },
          supplier: {
            description: "The supplier's name",
            title: 'Supplier',
            type: 'string',
          },
          verdict: {
            description: 'What to do with the invoice',
            enum: ['approve', 'hold_for_review', 'reject'],
            title: 'Verdict',
            type: 'string',
          },
        },
        required: ['supplier', 'verdict', 'risk', 'amount_due', 'price_variance', 'memo', 'lines'],
        title: 'readability.InvoiceCheck',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'readability.invoice_check': {
    fields: [
      {
        concept_ref: 'native.Text',
        description: 'A text',
        gating: true,
        kind: 'prose',
        name: 'note',
        presence: 'plain',
        required: true,
      },
    ],
  },
};

/**
 * The output half - a standard artifact, keyed by the same pipe_ref set as the
 * two above because all three builders iterate one pipe sequence. The payload
 * SCHEMA is not here: it rides `CONTRACTS[ref].output.json_schema`, where the
 * standard puts it, beside the input schemas.
 */
export const OUTPUT_FORM: OutputForm = {
  'readability.invoice_check': {
    field: {
      concept_ref: 'readability.InvoiceCheck',
      description: 'A supplier invoice checked against its purchase order',
      fields: [
        {
          description: "The supplier's name",
          kind: 'text',
          name: 'supplier',
          required: true,
        },
        {
          choices: ['approve', 'hold_for_review', 'reject'],
          description: 'What to do with the invoice',
          kind: 'enum',
          name: 'verdict',
          required: true,
        },
        {
          choices: ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'],
          description: 'How risky paying it as it stands would be',
          kind: 'enum',
          name: 'risk',
          required: true,
        },
        {
          description: 'The total the invoice asks for',
          integer: false,
          kind: 'number',
          name: 'amount_due',
          required: true,
        },
        {
          description: 'The largest unit-price variance against the purchase order, as a fraction',
          integer: false,
          kind: 'number',
          name: 'price_variance',
          required: true,
        },
        {
          description:
            'A memo for the approver, in Markdown: a level-two heading, one short paragraph, and a table comparing invoiced and ordered prices',
          kind: 'text',
          name: 'memo',
          required: true,
        },
        {
          concept_ref: 'readability.CheckedLine',
          description: "The invoice's lines, each checked",
          item: {
            concept_ref: 'readability.CheckedLine',
            description: 'One invoice line, checked against the purchase order',
            fields: [
              {
                description: 'What was invoiced',
                kind: 'text',
                name: 'item',
                required: true,
              },
              {
                description: 'How many units were invoiced',
                integer: true,
                kind: 'number',
                name: 'quantity',
                required: true,
              },
              {
                description: 'The invoiced price of one unit',
                integer: false,
                kind: 'number',
                name: 'unit_price',
                required: true,
              },
              {
                choices: [
                  'matches_po',
                  'unit_price_differs_from_po',
                  'quantity_differs_from_po',
                  'not_on_po',
                ],
                description: 'How the line compares with the purchase order',
                kind: 'enum',
                name: 'status',
                required: true,
              },
              {
                description:
                  'What the reviewer noticed on this line, as one Markdown sentence with its key figure in bold',
                kind: 'text',
                name: 'note',
                required: true,
              },
            ],
            kind: 'object',
            required: true,
          },
          kind: 'list',
          name: 'lines',
          required: true,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
};

/**
 * What the author wrote about each pipe - its `description` - and about the
 * bundle. No validate artifact carries either, and an authored method's brief
 * opens with the pipe's: it is what a host would have. On a structures case
 * every entry is the synthesized carrier's line, and the hero states its own.
 */
export const PIPE_DESCRIPTIONS: Record<string, string> = {
  'readability.invoice_check':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  "Concepts whose values are written for a reader rather than for a builder: coded choices, amounts, and free text a model writes in Markdown, so the result view's value rules are exercised on a real run.";
