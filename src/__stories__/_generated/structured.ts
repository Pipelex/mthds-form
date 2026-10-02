/**
 * Generated from src/__stories__/_structures/structured.mthds - DO NOT EDIT.
 *
 * A realistic domain object: mixed scalars, an enum, a nested concept, and a list of concepts.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'structured.flat_object',
  'structured.invoice_with_source',
  'structured.list_of_objects',
  'structured.many_invoices',
  'structured.one_invoice',
  'structured.shop_with_bank',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'structured.flat_object': {
    inputs: {
      address: {
        concept_ref: 'structured.Address',
        item_count: null,
        json_schema: {
          description: 'A postal address',
          properties: {
            city: {
              description: 'City',
              title: 'City',
              type: 'string',
            },
            country: {
              anyOf: [
                {
                  enum: ['France', 'Germany', 'Spain', 'United Kingdom'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Country',
              title: 'Country',
            },
            street: {
              description: 'Street and number',
              title: 'Street',
              type: 'string',
            },
          },
          required: ['street', 'city'],
          title: 'structured.Address',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
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
      optional: false,
    },
  },
  'structured.invoice_with_source': {
    inputs: {
      invoice: {
        concept_ref: 'structured.Invoice',
        item_count: null,
        json_schema: {
          $defs: {
            structured__Address: {
              description: 'A postal address',
              properties: {
                city: {
                  description: 'City',
                  title: 'City',
                  type: 'string',
                },
                country: {
                  anyOf: [
                    {
                      enum: ['France', 'Germany', 'Spain', 'United Kingdom'],
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Country',
                  title: 'Country',
                },
                street: {
                  description: 'Street and number',
                  title: 'Street',
                  type: 'string',
                },
              },
              required: ['street', 'city'],
              title: 'structured__Address',
              type: 'object',
            },
            structured__LineItem: {
              description: 'One billable line of an invoice',
              properties: {
                label: {
                  description: 'What was sold',
                  title: 'Label',
                  type: 'string',
                },
                quantity: {
                  description: 'How many units',
                  title: 'Quantity',
                  type: 'integer',
                },
                taxable: {
                  anyOf: [
                    {
                      type: 'boolean',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Whether VAT applies',
                  title: 'Taxable',
                },
                unit_price: {
                  description: 'Price of one unit',
                  title: 'Unit Price',
                  type: 'number',
                },
              },
              required: ['label', 'quantity', 'unit_price'],
              title: 'structured__LineItem',
              type: 'object',
            },
          },
          description: 'A commercial invoice',
          properties: {
            billed_to: {
              $ref: '#/$defs/structured__Address',
              description: 'Who it is billed to',
            },
            issued_on: {
              description: 'The date it was issued',
              format: 'date',
              title: 'Issued On',
              type: 'string',
            },
            lines: {
              description: 'The billable lines',
              items: {
                $ref: '#/$defs/structured__LineItem',
              },
              title: 'Lines',
              type: 'array',
            },
            notes: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Free-form notes',
              title: 'Notes',
            },
            paid: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Whether it has been settled',
              title: 'Paid',
            },
            reference: {
              description: 'The invoice reference',
              title: 'Reference',
              type: 'string',
            },
            settled_at: {
              anyOf: [
                {
                  format: 'date-time',
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'When payment cleared',
              title: 'Settled At',
            },
            status: {
              description: 'Where the invoice stands',
              enum: ['draft', 'sent', 'paid', 'void'],
              title: 'Status',
              type: 'string',
            },
            total: {
              description: 'Total amount due',
              title: 'Total',
              type: 'number',
            },
          },
          required: ['reference', 'issued_on', 'total', 'status', 'billed_to', 'lines'],
          title: 'structured.Invoice',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      source: {
        concept_ref: 'native.Document',
        item_count: null,
        json_schema: {
          description: 'A document',
          properties: {
            filename: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The original filename of the document',
              title: 'Filename',
            },
            mime_type: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The MIME type of the document',
              title: 'Mime Type',
            },
            public_url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The public HTTPS URL of the document',
              title: 'Public Url',
            },
            snippet: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'A text snippet or excerpt from the document',
              title: 'Snippet',
            },
            title: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The title of the document or source',
              title: 'Title',
            },
            url: {
              description: 'The document URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
              type: 'string',
            },
          },
          required: ['url'],
          title: 'native.Document',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
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
      optional: false,
    },
  },
  'structured.list_of_objects': {
    inputs: {
      lines: {
        concept_ref: 'structured.LineItem',
        item_count: null,
        json_schema: {
          items: {
            description: 'One billable line of an invoice',
            properties: {
              label: {
                description: 'What was sold',
                title: 'Label',
                type: 'string',
              },
              quantity: {
                description: 'How many units',
                title: 'Quantity',
                type: 'integer',
              },
              taxable: {
                anyOf: [
                  {
                    type: 'boolean',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Whether VAT applies',
                title: 'Taxable',
              },
              unit_price: {
                description: 'Price of one unit',
                title: 'Unit Price',
                type: 'number',
              },
            },
            required: ['label', 'quantity', 'unit_price'],
            title: 'structured.LineItem',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
    },
    output: {
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
      optional: false,
    },
  },
  'structured.many_invoices': {
    inputs: {
      invoices: {
        concept_ref: 'structured.Invoice',
        item_count: null,
        json_schema: {
          items: {
            $defs: {
              structured__Address: {
                description: 'A postal address',
                properties: {
                  city: {
                    description: 'City',
                    title: 'City',
                    type: 'string',
                  },
                  country: {
                    anyOf: [
                      {
                        enum: ['France', 'Germany', 'Spain', 'United Kingdom'],
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Country',
                    title: 'Country',
                  },
                  street: {
                    description: 'Street and number',
                    title: 'Street',
                    type: 'string',
                  },
                },
                required: ['street', 'city'],
                title: 'structured__Address',
                type: 'object',
              },
              structured__LineItem: {
                description: 'One billable line of an invoice',
                properties: {
                  label: {
                    description: 'What was sold',
                    title: 'Label',
                    type: 'string',
                  },
                  quantity: {
                    description: 'How many units',
                    title: 'Quantity',
                    type: 'integer',
                  },
                  taxable: {
                    anyOf: [
                      {
                        type: 'boolean',
                      },
                      {
                        type: 'null',
                      },
                    ],
                    default: null,
                    description: 'Whether VAT applies',
                    title: 'Taxable',
                  },
                  unit_price: {
                    description: 'Price of one unit',
                    title: 'Unit Price',
                    type: 'number',
                  },
                },
                required: ['label', 'quantity', 'unit_price'],
                title: 'structured__LineItem',
                type: 'object',
              },
            },
            description: 'A commercial invoice',
            properties: {
              billed_to: {
                $ref: '#/$defs/structured__Address',
                description: 'Who it is billed to',
              },
              issued_on: {
                description: 'The date it was issued',
                format: 'date',
                title: 'Issued On',
                type: 'string',
              },
              lines: {
                description: 'The billable lines',
                items: {
                  $ref: '#/$defs/structured__LineItem',
                },
                title: 'Lines',
                type: 'array',
              },
              notes: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Free-form notes',
                title: 'Notes',
              },
              paid: {
                anyOf: [
                  {
                    type: 'boolean',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Whether it has been settled',
                title: 'Paid',
              },
              reference: {
                description: 'The invoice reference',
                title: 'Reference',
                type: 'string',
              },
              settled_at: {
                anyOf: [
                  {
                    format: 'date-time',
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'When payment cleared',
                title: 'Settled At',
              },
              status: {
                description: 'Where the invoice stands',
                enum: ['draft', 'sent', 'paid', 'void'],
                title: 'Status',
                type: 'string',
              },
              total: {
                description: 'Total amount due',
                title: 'Total',
                type: 'number',
              },
            },
            required: ['reference', 'issued_on', 'total', 'status', 'billed_to', 'lines'],
            title: 'structured.Invoice',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
    },
    output: {
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
      optional: false,
    },
  },
  'structured.one_invoice': {
    inputs: {
      invoice: {
        concept_ref: 'structured.Invoice',
        item_count: null,
        json_schema: {
          $defs: {
            structured__Address: {
              description: 'A postal address',
              properties: {
                city: {
                  description: 'City',
                  title: 'City',
                  type: 'string',
                },
                country: {
                  anyOf: [
                    {
                      enum: ['France', 'Germany', 'Spain', 'United Kingdom'],
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Country',
                  title: 'Country',
                },
                street: {
                  description: 'Street and number',
                  title: 'Street',
                  type: 'string',
                },
              },
              required: ['street', 'city'],
              title: 'structured__Address',
              type: 'object',
            },
            structured__LineItem: {
              description: 'One billable line of an invoice',
              properties: {
                label: {
                  description: 'What was sold',
                  title: 'Label',
                  type: 'string',
                },
                quantity: {
                  description: 'How many units',
                  title: 'Quantity',
                  type: 'integer',
                },
                taxable: {
                  anyOf: [
                    {
                      type: 'boolean',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Whether VAT applies',
                  title: 'Taxable',
                },
                unit_price: {
                  description: 'Price of one unit',
                  title: 'Unit Price',
                  type: 'number',
                },
              },
              required: ['label', 'quantity', 'unit_price'],
              title: 'structured__LineItem',
              type: 'object',
            },
          },
          description: 'A commercial invoice',
          properties: {
            billed_to: {
              $ref: '#/$defs/structured__Address',
              description: 'Who it is billed to',
            },
            issued_on: {
              description: 'The date it was issued',
              format: 'date',
              title: 'Issued On',
              type: 'string',
            },
            lines: {
              description: 'The billable lines',
              items: {
                $ref: '#/$defs/structured__LineItem',
              },
              title: 'Lines',
              type: 'array',
            },
            notes: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Free-form notes',
              title: 'Notes',
            },
            paid: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Whether it has been settled',
              title: 'Paid',
            },
            reference: {
              description: 'The invoice reference',
              title: 'Reference',
              type: 'string',
            },
            settled_at: {
              anyOf: [
                {
                  format: 'date-time',
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'When payment cleared',
              title: 'Settled At',
            },
            status: {
              description: 'Where the invoice stands',
              enum: ['draft', 'sent', 'paid', 'void'],
              title: 'Status',
              type: 'string',
            },
            total: {
              description: 'Total amount due',
              title: 'Total',
              type: 'number',
            },
          },
          required: ['reference', 'issued_on', 'total', 'status', 'billed_to', 'lines'],
          title: 'structured.Invoice',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
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
      optional: false,
    },
  },
  'structured.shop_with_bank': {
    inputs: {
      refund_account: {
        concept_ref: 'structured.BankDetails',
        item_count: null,
        json_schema: {
          description: 'Where a payment is sent',
          properties: {
            bank: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: 'Banque Exemple',
              description: "The bank's name",
              title: 'Bank',
            },
            holder: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: 'Boutique Exemple SAS',
              description: 'Who holds the account',
              title: 'Holder',
            },
            iban: {
              description: 'The account number',
              title: 'Iban',
              type: 'string',
            },
          },
          required: ['iban'],
          title: 'structured.BankDetails',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'optional',
      },
      shop: {
        concept_ref: 'structured.Shop',
        item_count: null,
        json_schema: {
          $defs: {
            structured__BankDetails: {
              description: 'Where a payment is sent',
              properties: {
                bank: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: 'Banque Exemple',
                  description: "The bank's name",
                  title: 'Bank',
                },
                holder: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: 'Boutique Exemple SAS',
                  description: 'Who holds the account',
                  title: 'Holder',
                },
                iban: {
                  description: 'The account number',
                  title: 'Iban',
                  type: 'string',
                },
              },
              required: ['iban'],
              title: 'structured__BankDetails',
              type: 'object',
            },
          },
          description: 'A shop and, when it is paid directly, its bank details',
          properties: {
            bank_account: {
              anyOf: [
                {
                  $ref: '#/$defs/structured__BankDetails',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Where to pay the shop, when it is paid directly',
            },
            name: {
              description: "The shop's name",
              title: 'Name',
              type: 'string',
            },
          },
          required: ['name'],
          title: 'structured.Shop',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
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
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'structured.flat_object': {
    fields: [
      {
        concept_ref: 'structured.Address',
        description: 'A postal address',
        fields: [
          {
            description: 'Street and number',
            kind: 'text',
            name: 'street',
            required: true,
          },
          {
            description: 'City',
            kind: 'text',
            name: 'city',
            required: true,
          },
          {
            choices: ['France', 'Germany', 'Spain', 'United Kingdom'],
            description: 'Country',
            kind: 'enum',
            name: 'country',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'address',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'structured.invoice_with_source': {
    fields: [
      {
        concept_ref: 'structured.Invoice',
        description: 'A commercial invoice',
        fields: [
          {
            description: 'The invoice reference',
            kind: 'text',
            name: 'reference',
            required: true,
          },
          {
            datetime: false,
            description: 'The date it was issued',
            kind: 'date',
            name: 'issued_on',
            required: true,
          },
          {
            datetime: true,
            description: 'When payment cleared',
            kind: 'date',
            name: 'settled_at',
            required: false,
          },
          {
            description: 'Total amount due',
            integer: false,
            kind: 'number',
            name: 'total',
            required: true,
          },
          {
            description: 'Whether it has been settled',
            kind: 'boolean',
            name: 'paid',
            required: false,
          },
          {
            choices: ['draft', 'sent', 'paid', 'void'],
            description: 'Where the invoice stands',
            kind: 'enum',
            name: 'status',
            required: true,
          },
          {
            concept_ref: 'structured.Address',
            description: 'Who it is billed to',
            fields: [
              {
                description: 'Street and number',
                kind: 'text',
                name: 'street',
                required: true,
              },
              {
                description: 'City',
                kind: 'text',
                name: 'city',
                required: true,
              },
              {
                choices: ['France', 'Germany', 'Spain', 'United Kingdom'],
                description: 'Country',
                kind: 'enum',
                name: 'country',
                required: false,
              },
            ],
            kind: 'object',
            name: 'billed_to',
            required: true,
          },
          {
            concept_ref: 'structured.LineItem',
            description: 'The billable lines',
            item: {
              concept_ref: 'structured.LineItem',
              description: 'One billable line of an invoice',
              fields: [
                {
                  description: 'What was sold',
                  kind: 'text',
                  name: 'label',
                  required: true,
                },
                {
                  description: 'How many units',
                  integer: true,
                  kind: 'number',
                  name: 'quantity',
                  required: true,
                },
                {
                  description: 'Price of one unit',
                  integer: false,
                  kind: 'number',
                  name: 'unit_price',
                  required: true,
                },
                {
                  description: 'Whether VAT applies',
                  kind: 'boolean',
                  name: 'taxable',
                  required: false,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'lines',
            required: true,
          },
          {
            description: 'Free-form notes',
            kind: 'text',
            name: 'notes',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'invoice',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: true,
        kind: 'document',
        name: 'source',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'structured.list_of_objects': {
    fields: [
      {
        concept_ref: 'structured.LineItem',
        description: 'One billable line of an invoice',
        gating: false,
        item: {
          concept_ref: 'structured.LineItem',
          description: 'One billable line of an invoice',
          fields: [
            {
              description: 'What was sold',
              kind: 'text',
              name: 'label',
              required: true,
            },
            {
              description: 'How many units',
              integer: true,
              kind: 'number',
              name: 'quantity',
              required: true,
            },
            {
              description: 'Price of one unit',
              integer: false,
              kind: 'number',
              name: 'unit_price',
              required: true,
            },
            {
              description: 'Whether VAT applies',
              kind: 'boolean',
              name: 'taxable',
              required: false,
            },
          ],
          kind: 'object',
          required: true,
        },
        kind: 'list',
        name: 'lines',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'structured.many_invoices': {
    fields: [
      {
        concept_ref: 'structured.Invoice',
        description: 'A commercial invoice',
        gating: false,
        item: {
          concept_ref: 'structured.Invoice',
          description: 'A commercial invoice',
          fields: [
            {
              description: 'The invoice reference',
              kind: 'text',
              name: 'reference',
              required: true,
            },
            {
              datetime: false,
              description: 'The date it was issued',
              kind: 'date',
              name: 'issued_on',
              required: true,
            },
            {
              datetime: true,
              description: 'When payment cleared',
              kind: 'date',
              name: 'settled_at',
              required: false,
            },
            {
              description: 'Total amount due',
              integer: false,
              kind: 'number',
              name: 'total',
              required: true,
            },
            {
              description: 'Whether it has been settled',
              kind: 'boolean',
              name: 'paid',
              required: false,
            },
            {
              choices: ['draft', 'sent', 'paid', 'void'],
              description: 'Where the invoice stands',
              kind: 'enum',
              name: 'status',
              required: true,
            },
            {
              concept_ref: 'structured.Address',
              description: 'Who it is billed to',
              fields: [
                {
                  description: 'Street and number',
                  kind: 'text',
                  name: 'street',
                  required: true,
                },
                {
                  description: 'City',
                  kind: 'text',
                  name: 'city',
                  required: true,
                },
                {
                  choices: ['France', 'Germany', 'Spain', 'United Kingdom'],
                  description: 'Country',
                  kind: 'enum',
                  name: 'country',
                  required: false,
                },
              ],
              kind: 'object',
              name: 'billed_to',
              required: true,
            },
            {
              concept_ref: 'structured.LineItem',
              description: 'The billable lines',
              item: {
                concept_ref: 'structured.LineItem',
                description: 'One billable line of an invoice',
                fields: [
                  {
                    description: 'What was sold',
                    kind: 'text',
                    name: 'label',
                    required: true,
                  },
                  {
                    description: 'How many units',
                    integer: true,
                    kind: 'number',
                    name: 'quantity',
                    required: true,
                  },
                  {
                    description: 'Price of one unit',
                    integer: false,
                    kind: 'number',
                    name: 'unit_price',
                    required: true,
                  },
                  {
                    description: 'Whether VAT applies',
                    kind: 'boolean',
                    name: 'taxable',
                    required: false,
                  },
                ],
                kind: 'object',
                required: true,
              },
              kind: 'list',
              name: 'lines',
              required: true,
            },
            {
              description: 'Free-form notes',
              kind: 'text',
              name: 'notes',
              required: false,
            },
          ],
          kind: 'object',
          required: true,
        },
        kind: 'list',
        name: 'invoices',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'structured.one_invoice': {
    fields: [
      {
        concept_ref: 'structured.Invoice',
        description: 'A commercial invoice',
        fields: [
          {
            description: 'The invoice reference',
            kind: 'text',
            name: 'reference',
            required: true,
          },
          {
            datetime: false,
            description: 'The date it was issued',
            kind: 'date',
            name: 'issued_on',
            required: true,
          },
          {
            datetime: true,
            description: 'When payment cleared',
            kind: 'date',
            name: 'settled_at',
            required: false,
          },
          {
            description: 'Total amount due',
            integer: false,
            kind: 'number',
            name: 'total',
            required: true,
          },
          {
            description: 'Whether it has been settled',
            kind: 'boolean',
            name: 'paid',
            required: false,
          },
          {
            choices: ['draft', 'sent', 'paid', 'void'],
            description: 'Where the invoice stands',
            kind: 'enum',
            name: 'status',
            required: true,
          },
          {
            concept_ref: 'structured.Address',
            description: 'Who it is billed to',
            fields: [
              {
                description: 'Street and number',
                kind: 'text',
                name: 'street',
                required: true,
              },
              {
                description: 'City',
                kind: 'text',
                name: 'city',
                required: true,
              },
              {
                choices: ['France', 'Germany', 'Spain', 'United Kingdom'],
                description: 'Country',
                kind: 'enum',
                name: 'country',
                required: false,
              },
            ],
            kind: 'object',
            name: 'billed_to',
            required: true,
          },
          {
            concept_ref: 'structured.LineItem',
            description: 'The billable lines',
            item: {
              concept_ref: 'structured.LineItem',
              description: 'One billable line of an invoice',
              fields: [
                {
                  description: 'What was sold',
                  kind: 'text',
                  name: 'label',
                  required: true,
                },
                {
                  description: 'How many units',
                  integer: true,
                  kind: 'number',
                  name: 'quantity',
                  required: true,
                },
                {
                  description: 'Price of one unit',
                  integer: false,
                  kind: 'number',
                  name: 'unit_price',
                  required: true,
                },
                {
                  description: 'Whether VAT applies',
                  kind: 'boolean',
                  name: 'taxable',
                  required: false,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'lines',
            required: true,
          },
          {
            description: 'Free-form notes',
            kind: 'text',
            name: 'notes',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'invoice',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'structured.shop_with_bank': {
    fields: [
      {
        concept_ref: 'structured.Shop',
        description: 'A shop and, when it is paid directly, its bank details',
        fields: [
          {
            description: "The shop's name",
            kind: 'text',
            name: 'name',
            required: true,
          },
          {
            concept_ref: 'structured.BankDetails',
            description: 'Where to pay the shop, when it is paid directly',
            fields: [
              {
                default_value: 'Boutique Exemple SAS',
                description: 'Who holds the account',
                kind: 'text',
                name: 'holder',
                required: false,
              },
              {
                default_value: 'Banque Exemple',
                description: "The bank's name",
                kind: 'text',
                name: 'bank',
                required: false,
              },
              {
                description: 'The account number',
                kind: 'text',
                name: 'iban',
                required: true,
              },
            ],
            kind: 'object',
            name: 'bank_account',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'shop',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'structured.BankDetails',
        description: 'Where a payment is sent',
        fields: [
          {
            default_value: 'Boutique Exemple SAS',
            description: 'Who holds the account',
            kind: 'text',
            name: 'holder',
            required: false,
          },
          {
            default_value: 'Banque Exemple',
            description: "The bank's name",
            kind: 'text',
            name: 'bank',
            required: false,
          },
          {
            description: 'The account number',
            kind: 'text',
            name: 'iban',
            required: true,
          },
        ],
        gating: false,
        kind: 'object',
        name: 'refund_account',
        presence: 'optional',
        required: false,
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
  'structured.flat_object': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'structured.invoice_with_source': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'structured.list_of_objects': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'structured.many_invoices': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'structured.one_invoice': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'structured.shop_with_bank': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
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
  'structured.flat_object':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'structured.invoice_with_source':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'structured.list_of_objects':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'structured.many_invoices':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'structured.one_invoice':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'structured.shop_with_bank':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  'One concept whose structure declares many properties of mixed kinds.';
