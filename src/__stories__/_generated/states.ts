/**
 * Generated from data/structures/states.mthds - DO NOT EDIT.
 *
 * The state axis, factored out of the per-kind catalog: defaults, optionality, presence.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = ['states.defaults', 'states.presence'] as const;

export const CONTRACTS: PipeIOContracts = {
  'states.defaults': {
    inputs: {
      preferences: {
        concept_ref: 'states.Preferences',
        item_count: null,
        json_schema: {
          description: 'How a report should be produced',
          properties: {
            copies: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: 1,
              description: 'How many copies to produce',
              title: 'Copies',
            },
            footnote: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'An optional footnote',
              title: 'Footnote',
            },
            format: {
              anyOf: [
                {
                  enum: ['pdf', 'html', 'markdown'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: 'pdf',
              description: 'Output format',
              title: 'Format',
            },
            include_raw: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'null',
                },
              ],
              default: false,
              description: 'Attach the raw data too',
              title: 'Include Raw',
            },
            recipient: {
              description: 'Who the report goes to',
              title: 'Recipient',
              type: 'string',
            },
          },
          required: ['recipient'],
          title: 'states.Preferences',
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
  'states.presence': {
    inputs: {
      forced_slot: {
        concept_ref: 'states.Preferences',
        item_count: null,
        json_schema: {
          description: 'How a report should be produced',
          properties: {
            copies: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: 1,
              description: 'How many copies to produce',
              title: 'Copies',
            },
            footnote: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'An optional footnote',
              title: 'Footnote',
            },
            format: {
              anyOf: [
                {
                  enum: ['pdf', 'html', 'markdown'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: 'pdf',
              description: 'Output format',
              title: 'Format',
            },
            include_raw: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'null',
                },
              ],
              default: false,
              description: 'Attach the raw data too',
              title: 'Include Raw',
            },
            recipient: {
              description: 'Who the report goes to',
              title: 'Recipient',
              type: 'string',
            },
          },
          required: ['recipient'],
          title: 'states.Preferences',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'force',
      },
      optional_slot: {
        concept_ref: 'states.Preferences',
        item_count: null,
        json_schema: {
          description: 'How a report should be produced',
          properties: {
            copies: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: 1,
              description: 'How many copies to produce',
              title: 'Copies',
            },
            footnote: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'An optional footnote',
              title: 'Footnote',
            },
            format: {
              anyOf: [
                {
                  enum: ['pdf', 'html', 'markdown'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: 'pdf',
              description: 'Output format',
              title: 'Format',
            },
            include_raw: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'null',
                },
              ],
              default: false,
              description: 'Attach the raw data too',
              title: 'Include Raw',
            },
            recipient: {
              description: 'Who the report goes to',
              title: 'Recipient',
              type: 'string',
            },
          },
          required: ['recipient'],
          title: 'states.Preferences',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'optional',
      },
      plain_slot: {
        concept_ref: 'states.Preferences',
        item_count: null,
        json_schema: {
          description: 'How a report should be produced',
          properties: {
            copies: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: 1,
              description: 'How many copies to produce',
              title: 'Copies',
            },
            footnote: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'An optional footnote',
              title: 'Footnote',
            },
            format: {
              anyOf: [
                {
                  enum: ['pdf', 'html', 'markdown'],
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: 'pdf',
              description: 'Output format',
              title: 'Format',
            },
            include_raw: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'null',
                },
              ],
              default: false,
              description: 'Attach the raw data too',
              title: 'Include Raw',
            },
            recipient: {
              description: 'Who the report goes to',
              title: 'Recipient',
              type: 'string',
            },
          },
          required: ['recipient'],
          title: 'states.Preferences',
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
  'states.defaults': {
    fields: [
      {
        concept_ref: 'states.Preferences',
        description: 'How a report should be produced',
        fields: [
          {
            description: 'Who the report goes to',
            kind: 'text',
            name: 'recipient',
            required: true,
          },
          {
            choices: ['pdf', 'html', 'markdown'],
            default_value: 'pdf',
            description: 'Output format',
            kind: 'enum',
            name: 'format',
            required: false,
          },
          {
            default_value: 1,
            description: 'How many copies to produce',
            integer: true,
            kind: 'number',
            name: 'copies',
            required: false,
          },
          {
            default_value: false,
            description: 'Attach the raw data too',
            kind: 'boolean',
            name: 'include_raw',
            required: false,
          },
          {
            description: 'An optional footnote',
            kind: 'text',
            name: 'footnote',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'preferences',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'states.presence': {
    fields: [
      {
        concept_ref: 'states.Preferences',
        description: 'How a report should be produced',
        fields: [
          {
            description: 'Who the report goes to',
            kind: 'text',
            name: 'recipient',
            required: true,
          },
          {
            choices: ['pdf', 'html', 'markdown'],
            default_value: 'pdf',
            description: 'Output format',
            kind: 'enum',
            name: 'format',
            required: false,
          },
          {
            default_value: 1,
            description: 'How many copies to produce',
            integer: true,
            kind: 'number',
            name: 'copies',
            required: false,
          },
          {
            default_value: false,
            description: 'Attach the raw data too',
            kind: 'boolean',
            name: 'include_raw',
            required: false,
          },
          {
            description: 'An optional footnote',
            kind: 'text',
            name: 'footnote',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'plain_slot',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'states.Preferences',
        description: 'How a report should be produced',
        fields: [
          {
            description: 'Who the report goes to',
            kind: 'text',
            name: 'recipient',
            required: true,
          },
          {
            choices: ['pdf', 'html', 'markdown'],
            default_value: 'pdf',
            description: 'Output format',
            kind: 'enum',
            name: 'format',
            required: false,
          },
          {
            default_value: 1,
            description: 'How many copies to produce',
            integer: true,
            kind: 'number',
            name: 'copies',
            required: false,
          },
          {
            default_value: false,
            description: 'Attach the raw data too',
            kind: 'boolean',
            name: 'include_raw',
            required: false,
          },
          {
            description: 'An optional footnote',
            kind: 'text',
            name: 'footnote',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'forced_slot',
        presence: 'force',
        required: true,
      },
      {
        concept_ref: 'states.Preferences',
        description: 'How a report should be produced',
        fields: [
          {
            description: 'Who the report goes to',
            kind: 'text',
            name: 'recipient',
            required: true,
          },
          {
            choices: ['pdf', 'html', 'markdown'],
            default_value: 'pdf',
            description: 'Output format',
            kind: 'enum',
            name: 'format',
            required: false,
          },
          {
            default_value: 1,
            description: 'How many copies to produce',
            integer: true,
            kind: 'number',
            name: 'copies',
            required: false,
          },
          {
            default_value: false,
            description: 'Attach the raw data too',
            kind: 'boolean',
            name: 'include_raw',
            required: false,
          },
          {
            description: 'An optional footnote',
            kind: 'text',
            name: 'footnote',
            required: false,
          },
        ],
        gating: false,
        kind: 'object',
        name: 'optional_slot',
        presence: 'optional',
        required: false,
      },
    ],
  },
};
