/**
 * Generated from data/structures/results.mthds - DO NOT EDIT.
 *
 * Pipes whose OUTPUT is the interesting half: a scalar, a flat structure, a nested one, a plural result, and a generated image. Each carries a 'run' block (or states its own prompt), so `make fixtures-runs` can produce the real payload beside the descriptor. A Page[] output is deliberately absent - a PipeLLM carrier may not resolve to a concept that contains images, which is also why the image case swaps the carrier for a PipeImgGen.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, PipeIOContracts } from 'mthds/protocol';
import type { OutputForm } from '../../core/output-form';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'results.flat_result',
  'results.image_result',
  'results.nested_result',
  'results.plain_text_result',
  'results.plural_result',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'results.flat_result': {
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
      concept_ref: 'results.Sentiment',
      item_count: null,
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.image_result': {
    inputs: {},
    output: {
      concept_ref: 'native.Image',
      item_count: null,
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.nested_result': {
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
      concept_ref: 'results.Invoice',
      item_count: null,
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.plain_text_result': {
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
      concept_ref: 'native.Text',
      item_count: null,
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.plural_result': {
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
      concept_ref: 'results.LineItem',
      item_count: null,
      multiplicity: 'variable',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'results.flat_result': {
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
  'results.image_result': {
    fields: [],
  },
  'results.nested_result': {
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
  'results.plain_text_result': {
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
  'results.plural_result': {
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
 * The output half. NOT a standard artifact yet - see the note in
 * `scripts/dump-validate-views.py`. Derived by pipelex's own
 * `InputFormDeriver.derive_concept`, the method the input derivation already
 * calls for every nested concept field, so it is as generated as the rest.
 */
export const OUTPUT_FORM: OutputForm = {
  'results.flat_result': {
    field: {
      concept_ref: 'results.Sentiment',
      description: 'How positive a piece of writing is',
      fields: [
        {
          choices: ['positive', 'neutral', 'negative'],
          description: 'The overall verdict',
          kind: 'enum',
          name: 'label',
          required: true,
        },
        {
          description: 'How sure the model is, from 0 to 1',
          integer: false,
          kind: 'number',
          name: 'confidence',
          required: true,
        },
        {
          description: 'Why it landed there',
          kind: 'text',
          name: 'rationale',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'results.image_result': {
    field: {
      concept_ref: 'native.Image',
      description: 'An image',
      kind: 'image',
      name: 'output',
      required: true,
    },
  },
  'results.nested_result': {
    field: {
      concept_ref: 'results.Invoice',
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
          concept_ref: 'results.LineItem',
          description: 'The billable lines',
          item: {
            concept_ref: 'results.LineItem',
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
  'results.plain_text_result': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'results.plural_result': {
    field: {
      concept_ref: 'results.LineItem',
      description: 'One billable line of an invoice',
      item: {
        concept_ref: 'results.LineItem',
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
        ],
        kind: 'object',
        required: true,
      },
      kind: 'list',
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
  'results.flat_result': {
    description: 'How positive a piece of writing is',
    properties: {
      confidence: {
        description: 'How sure the model is, from 0 to 1',
        title: 'Confidence',
        type: 'number',
      },
      label: {
        description: 'The overall verdict',
        enum: ['positive', 'neutral', 'negative'],
        title: 'Label',
        type: 'string',
      },
      rationale: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
        default: null,
        description: 'Why it landed there',
        title: 'Rationale',
      },
    },
    required: ['label', 'confidence'],
    title: 'results__Sentiment',
    type: 'object',
  },
  'results.image_result': {
    description: 'An image',
    properties: {
      caption: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
        default: null,
        description: 'The caption of the image',
        title: 'Caption',
      },
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
        description: 'The original filename of the image',
        title: 'Filename',
      },
      height: {
        anyOf: [
          {
            exclusiveMinimum: 0,
            type: 'integer',
          },
          {
            type: 'null',
          },
        ],
        default: null,
        description: 'The height of the image, in pixels',
        title: 'Height',
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
        description: 'The MIME type of the image',
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
        description: 'The public URL of the image',
        title: 'Public Url',
      },
      source_negative_prompt: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
        default: null,
        description: 'The source negative prompt of the image',
        title: 'Source Negative Prompt',
      },
      source_prompt: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
        default: null,
        description: 'The source prompt of the image',
        title: 'Source Prompt',
      },
      url: {
        description: 'The image URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
        title: 'Url',
        type: 'string',
      },
      width: {
        anyOf: [
          {
            exclusiveMinimum: 0,
            type: 'integer',
          },
          {
            type: 'null',
          },
        ],
        default: null,
        description: 'The width of the image, in pixels',
        title: 'Width',
      },
    },
    required: ['url'],
    title: 'ImageContent',
    type: 'object',
  },
  'results.nested_result': {
    $defs: {
      results__LineItem: {
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
          unit_price: {
            description: 'Price of one unit',
            title: 'Unit Price',
            type: 'number',
          },
        },
        required: ['label', 'quantity', 'unit_price'],
        title: 'results__LineItem',
        type: 'object',
      },
    },
    description: 'A commercial invoice',
    properties: {
      issued_on: {
        description: 'The date it was issued',
        format: 'date',
        title: 'Issued On',
        type: 'string',
      },
      lines: {
        description: 'The billable lines',
        items: {
          $ref: '#/$defs/results__LineItem',
        },
        title: 'Lines',
        type: 'array',
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
      total: {
        description: 'Total amount due',
        title: 'Total',
        type: 'number',
      },
    },
    required: ['reference', 'issued_on', 'total', 'lines'],
    title: 'results__Invoice',
    type: 'object',
  },
  'results.plain_text_result': {
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
  'results.plural_result': {
    $defs: {
      results__LineItem: {
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
          unit_price: {
            description: 'Price of one unit',
            title: 'Unit Price',
            type: 'number',
          },
        },
        required: ['label', 'quantity', 'unit_price'],
        title: 'results__LineItem',
        type: 'object',
      },
    },
    properties: {
      items: {
        items: {
          $ref: '#/$defs/results__LineItem',
        },
        title: 'Items',
        type: 'array',
      },
    },
    required: ['items'],
    title: 'ListContent[results__LineItem]',
    type: 'object',
  },
};
