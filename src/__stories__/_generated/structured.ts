/**
 * Generated from data/structures/structured.mthds - DO NOT EDIT.
 *
 * A realistic domain object: mixed scalars, an enum, a nested concept, and a list of concepts.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, PipeIOContracts } from 'mthds/protocol';
import type { OutputForm } from '../../core/output-form';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'structured.flat_object',
  'structured.list_of_objects',
  'structured.many_invoices',
  'structured.one_invoice',
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
};

/**
 * The output half. NOT a standard artifact yet - see the note in
 * `scripts/dump-validate-views.py`. Derived by pipelex's own
 * `InputFormDeriver.derive_concept`, the method the input derivation already
 * calls for every nested concept field, so it is as generated as the rest.
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
};

/**
 * The output schemas, keyed the same way. The input side carries these on the
 * contract; the output side has nowhere to put them, so they ride separately
 * rather than being smuggled onto `PipeIOContracts` - whose type would
 * rightly reject the extra member.
 */
export const OUTPUT_SCHEMAS: Record<string, Record<string, unknown>> = {
  'structured.flat_object': {
    description: 'A text',
    properties: {
      text: {
        description: 'The text',
        title: 'Text',
        type: 'string',
      },
    },
    required: ['text'],
    title: 'TextContent',
    type: 'object',
  },
  'structured.list_of_objects': {
    description: 'A text',
    properties: {
      text: {
        description: 'The text',
        title: 'Text',
        type: 'string',
      },
    },
    required: ['text'],
    title: 'TextContent',
    type: 'object',
  },
  'structured.many_invoices': {
    description: 'A text',
    properties: {
      text: {
        description: 'The text',
        title: 'Text',
        type: 'string',
      },
    },
    required: ['text'],
    title: 'TextContent',
    type: 'object',
  },
  'structured.one_invoice': {
    description: 'A text',
    properties: {
      text: {
        description: 'The text',
        title: 'Text',
        type: 'string',
      },
    },
    required: ['text'],
    title: 'TextContent',
    type: 'object',
  },
};
