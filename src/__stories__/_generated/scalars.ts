/**
 * Generated from data/structures/scalars.mthds - DO NOT EDIT.
 *
 * The scalar kinds in isolation, one carrier pipe per axis.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, PipeIOContracts } from 'mthds/protocol';
import type { OutputForm } from '../../core/output-form';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'scalars.enum_kind',
  'scalars.multiplicity_axis',
  'scalars.number_kinds',
  'scalars.presence_axis',
  'scalars.text_kinds',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'scalars.enum_kind': {
    inputs: {
      priority: {
        concept_ref: 'scalars.Priority',
        item_count: null,
        json_schema: {
          description: 'How urgent the request is',
          properties: {
            level: {
              description: 'The urgency level',
              enum: ['low', 'normal', 'high', 'urgent'],
              title: 'Level',
              type: 'string',
            },
          },
          required: ['level'],
          title: 'scalars.Priority',
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
  'scalars.multiplicity_axis': {
    inputs: {
      exactly_three: {
        concept_ref: 'scalars.Headline',
        item_count: 3,
        json_schema: {
          items: {
            description: 'A single line of text',
            properties: {
              text: {
                description: 'The text',
                title: 'Text',
                type: 'string',
              },
            },
            required: ['text'],
            title: 'scalars.Headline',
            type: 'object',
          },
          maxItems: 3,
          minItems: 3,
          type: 'array',
        },
        multiplicity: 'fixed',
        presence: 'plain',
      },
      many: {
        concept_ref: 'scalars.Headline',
        item_count: null,
        json_schema: {
          items: {
            description: 'A single line of text',
            properties: {
              text: {
                description: 'The text',
                title: 'Text',
                type: 'string',
              },
            },
            required: ['text'],
            title: 'scalars.Headline',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      one: {
        concept_ref: 'scalars.Headline',
        item_count: null,
        json_schema: {
          description: 'A single line of text',
          properties: {
            text: {
              description: 'The text',
              title: 'Text',
              type: 'string',
            },
          },
          required: ['text'],
          title: 'scalars.Headline',
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
  'scalars.number_kinds': {
    inputs: {
      agreed: {
        concept_ref: 'native.YesNo',
        item_count: null,
        json_schema: {
          description: 'The answer to a yes/no question',
          properties: {
            yes_no: {
              description: 'Whether the answer is yes (true) or no (false).',
              title: 'Yes No',
              type: 'boolean',
            },
          },
          required: ['yes_no'],
          title: 'native.YesNo',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      amount: {
        concept_ref: 'native.Number',
        item_count: null,
        json_schema: {
          description: 'A number',
          properties: {
            number: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'number',
                },
              ],
              description: 'The number',
              title: 'Number',
            },
          },
          required: ['number'],
          title: 'native.Number',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      due: {
        concept_ref: 'native.Date',
        item_count: null,
        json_schema: {
          description:
            'A calendar date, optionally with a time of day — as precise as its source states.',
          properties: {
            date: {
              description: 'The calendar date, in ISO 8601 (e.g. 2026-07-07). Always required.',
              format: 'date',
              title: 'Date',
              type: 'string',
            },
            time: {
              anyOf: [
                {
                  format: 'time',
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The time of day, in ISO 8601 (e.g. 15:40:00, or 15:40:00+02:00 with a UTC offset). Include it only when the source states a time — never invent a time. Keep the UTC offset exactly when the source states one.',
              title: 'Time',
            },
          },
          required: ['date'],
          title: 'native.Date',
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
  'scalars.presence_axis': {
    inputs: {
      may_be_absent: {
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
        presence: 'optional',
      },
      required_forced: {
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
        presence: 'force',
      },
      required_plain: {
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
  'scalars.text_kinds': {
    inputs: {
      body: {
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
      headline: {
        concept_ref: 'scalars.Headline',
        item_count: null,
        json_schema: {
          description: 'A single line of text',
          properties: {
            text: {
              description: 'The text',
              title: 'Text',
              type: 'string',
            },
          },
          required: ['text'],
          title: 'scalars.Headline',
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
  'scalars.enum_kind': {
    fields: [
      {
        concept_ref: 'scalars.Priority',
        description: 'How urgent the request is',
        fields: [
          {
            choices: ['low', 'normal', 'high', 'urgent'],
            description: 'The urgency level',
            kind: 'enum',
            name: 'level',
            required: true,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'priority',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'scalars.multiplicity_axis': {
    fields: [
      {
        concept_ref: 'scalars.Headline',
        description: 'A single line of text',
        gating: true,
        kind: 'prose',
        name: 'one',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
      {
        concept_ref: 'scalars.Headline',
        description: 'A single line of text',
        gating: false,
        item: {
          concept_ref: 'scalars.Headline',
          description: 'A single line of text',
          kind: 'prose',
          refines: ['native.Text'],
          required: true,
        },
        kind: 'list',
        name: 'many',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
      {
        concept_ref: 'scalars.Headline',
        description: 'A single line of text',
        gating: true,
        item: {
          concept_ref: 'scalars.Headline',
          description: 'A single line of text',
          kind: 'prose',
          refines: ['native.Text'],
          required: true,
        },
        item_count: 3,
        kind: 'list',
        name: 'exactly_three',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
    ],
  },
  'scalars.number_kinds': {
    fields: [
      {
        concept_ref: 'native.Number',
        description: 'A number',
        gating: true,
        integer: false,
        kind: 'number',
        name: 'amount',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.YesNo',
        description: 'The answer to a yes/no question',
        gating: true,
        kind: 'boolean',
        name: 'agreed',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Date',
        description:
          'A calendar date, optionally with a time of day — as precise as its source states.',
        fields: [
          {
            datetime: false,
            description: 'The calendar date, in ISO 8601 (e.g. 2026-07-07). Always required.',
            kind: 'date',
            name: 'date',
            required: true,
          },
          {
            description:
              'The time of day, in ISO 8601 (e.g. 15:40:00, or 15:40:00+02:00 with a UTC offset). Include it only when the source states a time — never invent a time. Keep the UTC offset exactly when the source states one.',
            format: 'time',
            kind: 'text',
            name: 'time',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'due',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'scalars.presence_axis': {
    fields: [
      {
        concept_ref: 'native.Text',
        description: 'A text',
        gating: true,
        kind: 'prose',
        name: 'required_plain',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Text',
        description: 'A text',
        gating: true,
        kind: 'prose',
        name: 'required_forced',
        presence: 'force',
        required: true,
      },
      {
        concept_ref: 'native.Text',
        description: 'A text',
        gating: false,
        kind: 'prose',
        name: 'may_be_absent',
        presence: 'optional',
        required: false,
      },
    ],
  },
  'scalars.text_kinds': {
    fields: [
      {
        concept_ref: 'scalars.Headline',
        description: 'A single line of text',
        gating: true,
        kind: 'prose',
        name: 'headline',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
      {
        concept_ref: 'native.Text',
        description: 'A text',
        gating: true,
        kind: 'prose',
        name: 'body',
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
  'scalars.enum_kind': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'scalars.multiplicity_axis': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'scalars.number_kinds': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'scalars.presence_axis': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'scalars.text_kinds': {
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
  'scalars.enum_kind': {
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
  'scalars.multiplicity_axis': {
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
  'scalars.number_kinds': {
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
  'scalars.presence_axis': {
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
  'scalars.text_kinds': {
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
