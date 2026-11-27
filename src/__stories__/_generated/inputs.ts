/**
 * Generated from src/__stories__/_structures/inputs.mthds - DO NOT EDIT.
 *
 * One carrier pipe per Input board of the Pipelex Studio canvas: text, long text, numbers, yes or no, choices, dates, documents, images, lists, a structure, nested structures, required and optional, and any value. The stories under Inputs/Kinds draw each kind in every state its board and its features page describe.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'inputs.app_inputs',
  'inputs.choice_inputs',
  'inputs.date_inputs',
  'inputs.document_inputs',
  'inputs.image_inputs',
  'inputs.list_inputs',
  'inputs.nested_inputs',
  'inputs.number_inputs',
  'inputs.presence_inputs',
  'inputs.structure_inputs',
  'inputs.text_inputs',
  'inputs.unknown_inputs',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'inputs.app_inputs': {
    inputs: {
      audience: {
        concept_ref: 'inputs.Audience',
        item_count: null,
        json_schema: {
          description: 'Sets the tone and what comes first.',
          properties: {
            written_for: {
              description: 'Who reads the listing first',
              enum: [
                'first_time_buyers',
                'families',
                'investors',
                'retirees',
                'students',
                'expatriates',
              ],
              title: 'Written For',
              type: 'string',
            },
          },
          required: ['written_for'],
          title: 'inputs.Audience',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      data_room: {
        concept_ref: 'inputs.DataRoomFile',
        item_count: null,
        json_schema: {
          items: {
            description: 'Accounts, statutes, contracts, anything relevant.',
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
                description:
                  'The document URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
                title: 'Url',
                type: 'string',
              },
            },
            required: ['url'],
            title: 'inputs.DataRoomFile',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      deep_check: {
        concept_ref: 'inputs.DeepCheck',
        item_count: null,
        json_schema: {
          description: 'Also searches court records and sanctions lists.',
          properties: {
            probability: {
              anyOf: [
                {
                  maximum: 1,
                  minimum: 0,
                  type: 'number',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The probability that the answer is yes, from 0 to 1, when the producer reports one.',
              title: 'Probability',
            },
            yes_no: {
              description: 'Whether the answer is yes (true) or no (false).',
              title: 'Yes No',
              type: 'boolean',
            },
          },
          required: ['yes_no'],
          title: 'inputs.DeepCheck',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      photos: {
        concept_ref: 'inputs.DamagePhoto',
        item_count: null,
        json_schema: {
          items: {
            description: 'As many as you have, from any angle.',
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
            title: 'inputs.DamagePhoto',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      property: {
        concept_ref: 'inputs.Property',
        item_count: null,
        json_schema: {
          $defs: {
            inputs__Address: {
              description: 'Where the property is.',
              properties: {
                city: {
                  description: 'The city',
                  title: 'City',
                  type: 'string',
                },
                postcode: {
                  description: 'The postcode',
                  title: 'Postcode',
                  type: 'string',
                },
                street: {
                  description: 'The street and number',
                  title: 'Street',
                  type: 'string',
                },
              },
              required: ['street', 'postcode', 'city'],
              title: 'inputs__Address',
              type: 'object',
            },
            inputs__Room: {
              description: 'One room of the property.',
              properties: {
                features: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'What stands out about it',
                  title: 'Features',
                },
                room: {
                  description: 'What the room is',
                  title: 'Room',
                  type: 'string',
                },
                surface: {
                  description: 'In square metres.',
                  title: 'Surface',
                  type: 'number',
                },
              },
              required: ['room', 'surface'],
              title: 'inputs__Room',
              type: 'object',
            },
          },
          description: 'What the visit taught you.',
          properties: {
            address: {
              $ref: '#/$defs/inputs__Address',
              description: 'Where the property is',
            },
            energy_rating: {
              description: 'The energy performance class',
              enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              title: 'Energy Rating',
              type: 'string',
            },
            lift: {
              description: 'There is a lift',
              title: 'Lift',
              type: 'boolean',
            },
            price: {
              description: 'The asking price',
              title: 'Price',
              type: 'integer',
            },
            rooms: {
              description: 'Every room, one by one',
              items: {
                $ref: '#/$defs/inputs__Room',
              },
              title: 'Rooms',
              type: 'array',
            },
            surface: {
              description: 'In square metres.',
              title: 'Surface',
              type: 'number',
            },
          },
          required: ['address', 'surface', 'price', 'energy_rating', 'lift', 'rooms'],
          title: 'inputs.Property',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      registration_number: {
        concept_ref: 'inputs.RegistrationNumber',
        item_count: null,
        json_schema: {
          description: 'Speeds up the register look-up.',
          properties: {
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
              description: 'The MIME type of the stored text: text/plain or text/markdown',
              title: 'Mime Type',
            },
            preview: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The first few hundred characters of the stored text, always its true start',
              title: 'Preview',
            },
            size: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The length of the stored text, in bytes as stored',
              title: 'Size',
            },
            text: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The text',
              title: 'Text',
            },
            url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
            },
          },
          title: 'inputs.RegistrationNumber',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'optional',
      },
      supplier: {
        concept_ref: 'inputs.LegalName',
        item_count: null,
        json_schema: {
          description: "The company's legal name.",
          properties: {
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
              description: 'The MIME type of the stored text: text/plain or text/markdown',
              title: 'Mime Type',
            },
            preview: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The first few hundred characters of the stored text, always its true start',
              title: 'Preview',
            },
            size: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The length of the stored text, in bytes as stored',
              title: 'Size',
            },
            text: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The text',
              title: 'Text',
            },
            url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
            },
          },
          title: 'inputs.LegalName',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.choice_inputs': {
    inputs: {
      audience: {
        concept_ref: 'inputs.Audience',
        item_count: null,
        json_schema: {
          description: 'Sets the tone and what comes first.',
          properties: {
            written_for: {
              description: 'Who reads the listing first',
              enum: [
                'first_time_buyers',
                'families',
                'investors',
                'retirees',
                'students',
                'expatriates',
              ],
              title: 'Written For',
              type: 'string',
            },
          },
          required: ['written_for'],
          title: 'inputs.Audience',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      report_language: {
        concept_ref: 'inputs.ReportLanguage',
        item_count: null,
        json_schema: {
          description: "The report's language.",
          properties: {
            language: {
              default: 'english',
              description: 'The language the report is written in',
              enum: ['english', 'french', 'german'],
              title: 'Language',
              type: 'string',
            },
          },
          title: 'inputs.ReportLanguage',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.date_inputs': {
    inputs: {
      appointment: {
        concept_ref: 'inputs.Appointment',
        item_count: null,
        json_schema: {
          description: 'When the visit takes place.',
          properties: {
            booked_at: {
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
              description: 'When the visit was booked',
              title: 'Booked At',
            },
            day: {
              description: 'The day of the visit',
              format: 'date',
              title: 'Day',
              type: 'string',
            },
            starts_at: {
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
              description: 'The time the visit starts',
              title: 'Starts At',
            },
          },
          required: ['day'],
          title: 'inputs.Appointment',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.document_inputs': {
    inputs: {
      data_room: {
        concept_ref: 'inputs.DataRoomFile',
        item_count: null,
        json_schema: {
          items: {
            description: 'Accounts, statutes, contracts, anything relevant.',
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
                description:
                  'The document URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
                title: 'Url',
                type: 'string',
              },
            },
            required: ['url'],
            title: 'inputs.DataRoomFile',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      nda: {
        concept_ref: 'inputs.Nda',
        item_count: null,
        json_schema: {
          description: 'As you received it, PDF or Word.',
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
          title: 'inputs.Nda',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.image_inputs': {
    inputs: {
      damage_photos: {
        concept_ref: 'inputs.DamagePhoto',
        item_count: null,
        json_schema: {
          items: {
            description: 'As many as you have, from any angle.',
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
            title: 'inputs.DamagePhoto',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      logo: {
        concept_ref: 'inputs.Logo',
        item_count: null,
        json_schema: {
          description: 'Shown at the top of the report.',
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
          title: 'inputs.Logo',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.list_inputs': {
    inputs: {
      bids: {
        concept_ref: 'inputs.Bid',
        item_count: 3,
        json_schema: {
          items: {
            description: 'Exactly three suppliers to compare.',
            properties: {
              price: {
                description: 'The price they quote',
                title: 'Price',
                type: 'number',
              },
              supplier: {
                description: "The supplier's name",
                title: 'Supplier',
                type: 'string',
              },
            },
            required: ['supplier', 'price'],
            title: 'inputs.Bid',
            type: 'object',
          },
          maxItems: 3,
          minItems: 3,
          type: 'array',
        },
        multiplicity: 'fixed',
        presence: 'plain',
      },
      clauses_to_find: {
        concept_ref: 'inputs.ClauseToFind',
        item_count: null,
        json_schema: {
          items: {
            description: 'Each clause type, and whether every contract must have it.',
            properties: {
              clause_type: {
                description: 'The kind of clause',
                title: 'Clause Type',
                type: 'string',
              },
              must_have: {
                description: 'Every contract must have it',
                title: 'Must Have',
                type: 'boolean',
              },
              what_to_look_for: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'What the clause says when it is there',
                title: 'What To Look For',
              },
            },
            required: ['clause_type', 'must_have'],
            title: 'inputs.ClauseToFind',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      keywords: {
        concept_ref: 'inputs.Keyword',
        item_count: null,
        json_schema: {
          items: {
            description: 'Words the summary must cover.',
            properties: {
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
                description: 'The MIME type of the stored text: text/plain or text/markdown',
                title: 'Mime Type',
              },
              preview: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  'The first few hundred characters of the stored text, always its true start',
                title: 'Preview',
              },
              size: {
                anyOf: [
                  {
                    type: 'integer',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'The length of the stored text, in bytes as stored',
                title: 'Size',
              },
              text: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'The text',
                title: 'Text',
              },
              url: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description:
                  'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
                title: 'Url',
              },
            },
            title: 'inputs.Keyword',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.nested_inputs': {
    inputs: {
      claim_record: {
        concept_ref: 'inputs.ClaimRecord',
        item_count: null,
        json_schema: {
          $defs: {
            inputs__DamagedItem: {
              description: 'One damaged part.',
              properties: {
                damage: {
                  description: 'What happened to it',
                  title: 'Damage',
                  type: 'string',
                },
                part: {
                  description: 'The damaged part',
                  title: 'Part',
                  type: 'string',
                },
                quoted: {
                  description: "The repairer's quote, in euros.",
                  title: 'Quoted',
                  type: 'number',
                },
              },
              required: ['part', 'damage', 'quoted'],
              title: 'inputs__DamagedItem',
              type: 'object',
            },
            inputs__Incident: {
              description: 'What happened, where and when.',
              properties: {
                date: {
                  description: 'The day it happened',
                  format: 'date',
                  title: 'Date',
                  type: 'string',
                },
                parties: {
                  description: 'Who was involved',
                  items: {
                    $ref: '#/$defs/inputs__Party',
                  },
                  title: 'Parties',
                  type: 'array',
                },
                place: {
                  description: 'Where it happened',
                  title: 'Place',
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
                  description: 'The time it happened',
                  title: 'Time',
                },
              },
              required: ['date', 'place', 'parties'],
              title: 'inputs__Incident',
              type: 'object',
            },
            inputs__Party: {
              description: 'Someone involved in the incident.',
              properties: {
                insurer: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Their insurer',
                  title: 'Insurer',
                },
                name: {
                  description: 'Their full name',
                  title: 'Name',
                  type: 'string',
                },
                plate: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: "Their vehicle's plate",
                  title: 'Plate',
                },
                role: {
                  description: 'Their part in the incident',
                  enum: ['policyholder', 'third_party', 'witness', 'passenger', 'pedestrian'],
                  title: 'Role',
                  type: 'string',
                },
              },
              required: ['name', 'role'],
              title: 'inputs__Party',
              type: 'object',
            },
            inputs__Policy: {
              description: 'The policy the claim is made under.',
              properties: {
                cover: {
                  description: 'What the policy covers',
                  enum: ['third_party', 'third_party_fire_theft', 'comprehensive'],
                  title: 'Cover',
                  type: 'string',
                },
                holder: {
                  description: 'Who holds the policy',
                  title: 'Holder',
                  type: 'string',
                },
                policy_number: {
                  description: "The policy's number",
                  title: 'Policy Number',
                  type: 'string',
                },
              },
              required: ['holder', 'policy_number', 'cover'],
              title: 'inputs__Policy',
              type: 'object',
            },
          },
          description: 'The claim as your claims system holds it.',
          properties: {
            adjuster_notes: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Notes for the adjuster',
              title: 'Adjuster Notes',
            },
            claim_number: {
              description: "The claim's number",
              title: 'Claim Number',
              type: 'string',
            },
            damaged_items: {
              description: 'Every damaged part',
              items: {
                $ref: '#/$defs/inputs__DamagedItem',
              },
              title: 'Damaged Items',
              type: 'array',
            },
            extra: {
              anyOf: [
                {
                  additionalProperties: {
                    type: 'string',
                  },
                  type: 'object',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Anything else the claims system holds',
              title: 'Extra',
            },
            incident: {
              $ref: '#/$defs/inputs__Incident',
              description: 'The incident',
            },
            police_report_filed: {
              description: 'A police report was filed',
              title: 'Police Report Filed',
              type: 'boolean',
            },
            policy: {
              $ref: '#/$defs/inputs__Policy',
              description: 'The policy',
            },
          },
          required: ['claim_number', 'policy', 'incident', 'damaged_items', 'police_report_filed'],
          title: 'inputs.ClaimRecord',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      property: {
        concept_ref: 'inputs.Property',
        item_count: null,
        json_schema: {
          $defs: {
            inputs__Address: {
              description: 'Where the property is.',
              properties: {
                city: {
                  description: 'The city',
                  title: 'City',
                  type: 'string',
                },
                postcode: {
                  description: 'The postcode',
                  title: 'Postcode',
                  type: 'string',
                },
                street: {
                  description: 'The street and number',
                  title: 'Street',
                  type: 'string',
                },
              },
              required: ['street', 'postcode', 'city'],
              title: 'inputs__Address',
              type: 'object',
            },
            inputs__Room: {
              description: 'One room of the property.',
              properties: {
                features: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'What stands out about it',
                  title: 'Features',
                },
                room: {
                  description: 'What the room is',
                  title: 'Room',
                  type: 'string',
                },
                surface: {
                  description: 'In square metres.',
                  title: 'Surface',
                  type: 'number',
                },
              },
              required: ['room', 'surface'],
              title: 'inputs__Room',
              type: 'object',
            },
          },
          description: 'What the visit taught you.',
          properties: {
            address: {
              $ref: '#/$defs/inputs__Address',
              description: 'Where the property is',
            },
            energy_rating: {
              description: 'The energy performance class',
              enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
              title: 'Energy Rating',
              type: 'string',
            },
            lift: {
              description: 'There is a lift',
              title: 'Lift',
              type: 'boolean',
            },
            price: {
              description: 'The asking price',
              title: 'Price',
              type: 'integer',
            },
            rooms: {
              description: 'Every room, one by one',
              items: {
                $ref: '#/$defs/inputs__Room',
              },
              title: 'Rooms',
              type: 'array',
            },
            surface: {
              description: 'In square metres.',
              title: 'Surface',
              type: 'number',
            },
          },
          required: ['address', 'surface', 'price', 'energy_rating', 'lift', 'rooms'],
          title: 'inputs.Property',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.number_inputs': {
    inputs: {
      deep_check: {
        concept_ref: 'inputs.DeepCheck',
        item_count: null,
        json_schema: {
          description: 'Also searches court records and sanctions lists.',
          properties: {
            probability: {
              anyOf: [
                {
                  maximum: 1,
                  minimum: 0,
                  type: 'number',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The probability that the answer is yes, from 0 to 1, when the producer reports one.',
              title: 'Probability',
            },
            yes_no: {
              description: 'Whether the answer is yes (true) or no (false).',
              title: 'Yes No',
              type: 'boolean',
            },
          },
          required: ['yes_no'],
          title: 'inputs.DeepCheck',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      tolerance: {
        concept_ref: 'inputs.Tolerance',
        item_count: null,
        json_schema: {
          description: 'Differences below it count as a match.',
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
          title: 'inputs.Tolerance',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.presence_inputs': {
    inputs: {
      registration_number: {
        concept_ref: 'inputs.RegistrationNumber',
        item_count: null,
        json_schema: {
          description: 'Speeds up the register look-up.',
          properties: {
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
              description: 'The MIME type of the stored text: text/plain or text/markdown',
              title: 'Mime Type',
            },
            preview: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The first few hundred characters of the stored text, always its true start',
              title: 'Preview',
            },
            size: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The length of the stored text, in bytes as stored',
              title: 'Size',
            },
            text: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The text',
              title: 'Text',
            },
            url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
            },
          },
          title: 'inputs.RegistrationNumber',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'optional',
      },
      report_language: {
        concept_ref: 'inputs.ReportLanguage',
        item_count: null,
        json_schema: {
          description: "The report's language.",
          properties: {
            language: {
              default: 'english',
              description: 'The language the report is written in',
              enum: ['english', 'french', 'german'],
              title: 'Language',
              type: 'string',
            },
          },
          title: 'inputs.ReportLanguage',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'optional',
      },
      supplier: {
        concept_ref: 'inputs.LegalName',
        item_count: null,
        json_schema: {
          description: "The company's legal name.",
          properties: {
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
              description: 'The MIME type of the stored text: text/plain or text/markdown',
              title: 'Mime Type',
            },
            preview: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The first few hundred characters of the stored text, always its true start',
              title: 'Preview',
            },
            size: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The length of the stored text, in bytes as stored',
              title: 'Size',
            },
            text: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The text',
              title: 'Text',
            },
            url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
            },
          },
          title: 'inputs.LegalName',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      terms: {
        concept_ref: 'inputs.Terms',
        item_count: null,
        json_schema: {
          description: 'The commercial terms of the quote.',
          properties: {
            discount: {
              anyOf: [
                {
                  type: 'number',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'A discount on the whole quote, in percent',
              title: 'Discount',
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
              description: 'Anything the client should know',
              title: 'Notes',
            },
            payment_terms: {
              default: '30 days',
              description: 'When the invoice is due',
              enum: ['30 days', '45 days', '60 days'],
              title: 'Payment Terms',
              type: 'string',
            },
          },
          title: 'inputs.Terms',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.structure_inputs': {
    inputs: {
      terms: {
        concept_ref: 'inputs.Terms',
        item_count: null,
        json_schema: {
          description: 'The commercial terms of the quote.',
          properties: {
            discount: {
              anyOf: [
                {
                  type: 'number',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'A discount on the whole quote, in percent',
              title: 'Discount',
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
              description: 'Anything the client should know',
              title: 'Notes',
            },
            payment_terms: {
              default: '30 days',
              description: 'When the invoice is due',
              enum: ['30 days', '45 days', '60 days'],
              title: 'Payment Terms',
              type: 'string',
            },
          },
          title: 'inputs.Terms',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.text_inputs': {
    inputs: {
      client_brief: {
        concept_ref: 'inputs.ClientBrief',
        item_count: null,
        json_schema: {
          description: 'What the client asked for, in their own words.',
          properties: {
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
              description: 'The MIME type of the stored text: text/plain or text/markdown',
              title: 'Mime Type',
            },
            preview: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The first few hundred characters of the stored text, always its true start',
              title: 'Preview',
            },
            size: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The length of the stored text, in bytes as stored',
              title: 'Size',
            },
            text: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The text',
              title: 'Text',
            },
            url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
            },
          },
          title: 'inputs.ClientBrief',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      registration_number: {
        concept_ref: 'inputs.RegistrationNumber',
        item_count: null,
        json_schema: {
          description: 'Speeds up the register look-up.',
          properties: {
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
              description: 'The MIME type of the stored text: text/plain or text/markdown',
              title: 'Mime Type',
            },
            preview: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The first few hundred characters of the stored text, always its true start',
              title: 'Preview',
            },
            size: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The length of the stored text, in bytes as stored',
              title: 'Size',
            },
            text: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The text',
              title: 'Text',
            },
            url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
            },
          },
          title: 'inputs.RegistrationNumber',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'optional',
      },
      supplier: {
        concept_ref: 'inputs.LegalName',
        item_count: null,
        json_schema: {
          description: "The company's legal name.",
          properties: {
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
              description: 'The MIME type of the stored text: text/plain or text/markdown',
              title: 'Mime Type',
            },
            preview: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The first few hundred characters of the stored text, always its true start',
              title: 'Preview',
            },
            size: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The length of the stored text, in bytes as stored',
              title: 'Size',
            },
            text: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'The text',
              title: 'Text',
            },
            url: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description:
                'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
              title: 'Url',
            },
          },
          title: 'inputs.LegalName',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'inputs.unknown_inputs': {
    inputs: {
      settings: {
        concept_ref: 'native.Dynamic',
        item_count: null,
        json_schema: {
          description: 'A dynamic concept',
          properties: {},
          title: 'native.Dynamic',
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
            description: 'The MIME type of the stored text: text/plain or text/markdown',
            title: 'Mime Type',
          },
          preview: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The first few hundred characters of the stored text, always its true start',
            title: 'Preview',
          },
          size: {
            anyOf: [
              {
                type: 'integer',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The length of the stored text, in bytes as stored',
            title: 'Size',
          },
          text: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The text',
            title: 'Text',
          },
          url: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The URL of the stored text: a storage URI, an HTTP(S) URL, or a base64 data URL',
            title: 'Url',
          },
        },
        title: 'native.Text',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'inputs.app_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Property',
        description: 'What the visit taught you.',
        fields: [
          {
            concept_ref: 'inputs.Address',
            description: 'Where the property is',
            fields: [
              {
                description: 'The street and number',
                kind: 'text',
                name: 'street',
                required: true,
              },
              {
                description: 'The postcode',
                kind: 'text',
                name: 'postcode',
                required: true,
              },
              {
                description: 'The city',
                kind: 'text',
                name: 'city',
                required: true,
              },
            ],
            kind: 'object',
            name: 'address',
            required: true,
          },
          {
            description: 'In square metres.',
            integer: false,
            kind: 'number',
            name: 'surface',
            required: true,
          },
          {
            description: 'The asking price',
            integer: true,
            kind: 'number',
            name: 'price',
            required: true,
          },
          {
            choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            description: 'The energy performance class',
            kind: 'enum',
            name: 'energy_rating',
            required: true,
          },
          {
            description: 'There is a lift',
            kind: 'boolean',
            name: 'lift',
            required: true,
          },
          {
            concept_ref: 'inputs.Room',
            description: 'Every room, one by one',
            item: {
              concept_ref: 'inputs.Room',
              description: 'One room of the property.',
              fields: [
                {
                  description: 'What the room is',
                  kind: 'text',
                  name: 'room',
                  required: true,
                },
                {
                  description: 'In square metres.',
                  integer: false,
                  kind: 'number',
                  name: 'surface',
                  required: true,
                },
                {
                  description: 'What stands out about it',
                  kind: 'text',
                  name: 'features',
                  required: false,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'rooms',
            required: true,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'property',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'inputs.DamagePhoto',
        description: 'As many as you have, from any angle.',
        gating: false,
        item: {
          concept_ref: 'inputs.DamagePhoto',
          description: 'As many as you have, from any angle.',
          kind: 'image',
          refines: ['native.Image'],
          required: true,
        },
        kind: 'list',
        name: 'photos',
        presence: 'plain',
        refines: ['native.Image'],
        required: true,
      },
      {
        concept_ref: 'inputs.Audience',
        description: 'Sets the tone and what comes first.',
        fields: [
          {
            choices: [
              'first_time_buyers',
              'families',
              'investors',
              'retirees',
              'students',
              'expatriates',
            ],
            description: 'Who reads the listing first',
            kind: 'enum',
            name: 'written_for',
            required: true,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'audience',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'inputs.DataRoomFile',
        description: 'Accounts, statutes, contracts, anything relevant.',
        gating: false,
        item: {
          concept_ref: 'inputs.DataRoomFile',
          description: 'Accounts, statutes, contracts, anything relevant.',
          kind: 'document',
          refines: ['native.Document'],
          required: true,
        },
        kind: 'list',
        name: 'data_room',
        presence: 'plain',
        refines: ['native.Document'],
        required: true,
      },
      {
        concept_ref: 'inputs.LegalName',
        description: "The company's legal name.",
        gating: true,
        hints: {
          intent: 'label',
        },
        kind: 'text',
        name: 'supplier',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
      {
        concept_ref: 'inputs.DeepCheck',
        description: 'Also searches court records and sanctions lists.',
        gating: true,
        kind: 'boolean',
        name: 'deep_check',
        presence: 'plain',
        refines: ['native.YesNo'],
        required: true,
      },
      {
        concept_ref: 'inputs.RegistrationNumber',
        description: 'Speeds up the register look-up.',
        gating: false,
        hints: {
          intent: 'label',
        },
        kind: 'text',
        name: 'registration_number',
        presence: 'optional',
        refines: ['native.Text'],
        required: false,
      },
    ],
  },
  'inputs.choice_inputs': {
    fields: [
      {
        concept_ref: 'inputs.ReportLanguage',
        description: "The report's language.",
        fields: [
          {
            choices: ['english', 'french', 'german'],
            default_value: 'english',
            description: 'The language the report is written in',
            kind: 'enum',
            name: 'language',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'report_language',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'inputs.Audience',
        description: 'Sets the tone and what comes first.',
        fields: [
          {
            choices: [
              'first_time_buyers',
              'families',
              'investors',
              'retirees',
              'students',
              'expatriates',
            ],
            description: 'Who reads the listing first',
            kind: 'enum',
            name: 'written_for',
            required: true,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'audience',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'inputs.date_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Appointment',
        description: 'When the visit takes place.',
        fields: [
          {
            datetime: false,
            description: 'The day of the visit',
            kind: 'date',
            name: 'day',
            required: true,
          },
          {
            datetime: true,
            description: 'When the visit was booked',
            kind: 'date',
            name: 'booked_at',
            required: false,
          },
          {
            description: 'The time the visit starts',
            format: 'time',
            kind: 'text',
            name: 'starts_at',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'appointment',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'inputs.document_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Nda',
        description: 'As you received it, PDF or Word.',
        gating: true,
        kind: 'document',
        name: 'nda',
        presence: 'plain',
        refines: ['native.Document'],
        required: true,
      },
      {
        concept_ref: 'inputs.DataRoomFile',
        description: 'Accounts, statutes, contracts, anything relevant.',
        gating: false,
        item: {
          concept_ref: 'inputs.DataRoomFile',
          description: 'Accounts, statutes, contracts, anything relevant.',
          kind: 'document',
          refines: ['native.Document'],
          required: true,
        },
        kind: 'list',
        name: 'data_room',
        presence: 'plain',
        refines: ['native.Document'],
        required: true,
      },
    ],
  },
  'inputs.image_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Logo',
        description: 'Shown at the top of the report.',
        gating: true,
        kind: 'image',
        name: 'logo',
        presence: 'plain',
        refines: ['native.Image'],
        required: true,
      },
      {
        concept_ref: 'inputs.DamagePhoto',
        description: 'As many as you have, from any angle.',
        gating: false,
        item: {
          concept_ref: 'inputs.DamagePhoto',
          description: 'As many as you have, from any angle.',
          kind: 'image',
          refines: ['native.Image'],
          required: true,
        },
        kind: 'list',
        name: 'damage_photos',
        presence: 'plain',
        refines: ['native.Image'],
        required: true,
      },
    ],
  },
  'inputs.list_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Keyword',
        description: 'Words the summary must cover.',
        gating: false,
        hints: {
          intent: 'label',
        },
        item: {
          concept_ref: 'inputs.Keyword',
          description: 'Words the summary must cover.',
          hints: {
            intent: 'label',
          },
          kind: 'text',
          refines: ['native.Text'],
          required: true,
        },
        kind: 'list',
        name: 'keywords',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
      {
        concept_ref: 'inputs.Bid',
        description: 'Exactly three suppliers to compare.',
        gating: true,
        item: {
          concept_ref: 'inputs.Bid',
          description: 'Exactly three suppliers to compare.',
          fields: [
            {
              description: "The supplier's name",
              kind: 'text',
              name: 'supplier',
              required: true,
            },
            {
              description: 'The price they quote',
              integer: false,
              kind: 'number',
              name: 'price',
              required: true,
            },
          ],
          kind: 'object',
          required: true,
        },
        item_count: 3,
        kind: 'list',
        name: 'bids',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'inputs.ClauseToFind',
        description: 'Each clause type, and whether every contract must have it.',
        gating: false,
        item: {
          concept_ref: 'inputs.ClauseToFind',
          description: 'Each clause type, and whether every contract must have it.',
          fields: [
            {
              description: 'The kind of clause',
              kind: 'text',
              name: 'clause_type',
              required: true,
            },
            {
              description: 'Every contract must have it',
              kind: 'boolean',
              name: 'must_have',
              required: true,
            },
            {
              description: 'What the clause says when it is there',
              kind: 'text',
              name: 'what_to_look_for',
              required: false,
            },
          ],
          kind: 'object',
          required: true,
        },
        kind: 'list',
        name: 'clauses_to_find',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'inputs.nested_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Property',
        description: 'What the visit taught you.',
        fields: [
          {
            concept_ref: 'inputs.Address',
            description: 'Where the property is',
            fields: [
              {
                description: 'The street and number',
                kind: 'text',
                name: 'street',
                required: true,
              },
              {
                description: 'The postcode',
                kind: 'text',
                name: 'postcode',
                required: true,
              },
              {
                description: 'The city',
                kind: 'text',
                name: 'city',
                required: true,
              },
            ],
            kind: 'object',
            name: 'address',
            required: true,
          },
          {
            description: 'In square metres.',
            integer: false,
            kind: 'number',
            name: 'surface',
            required: true,
          },
          {
            description: 'The asking price',
            integer: true,
            kind: 'number',
            name: 'price',
            required: true,
          },
          {
            choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            description: 'The energy performance class',
            kind: 'enum',
            name: 'energy_rating',
            required: true,
          },
          {
            description: 'There is a lift',
            kind: 'boolean',
            name: 'lift',
            required: true,
          },
          {
            concept_ref: 'inputs.Room',
            description: 'Every room, one by one',
            item: {
              concept_ref: 'inputs.Room',
              description: 'One room of the property.',
              fields: [
                {
                  description: 'What the room is',
                  kind: 'text',
                  name: 'room',
                  required: true,
                },
                {
                  description: 'In square metres.',
                  integer: false,
                  kind: 'number',
                  name: 'surface',
                  required: true,
                },
                {
                  description: 'What stands out about it',
                  kind: 'text',
                  name: 'features',
                  required: false,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'rooms',
            required: true,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'property',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'inputs.ClaimRecord',
        description: 'The claim as your claims system holds it.',
        fields: [
          {
            description: "The claim's number",
            kind: 'text',
            name: 'claim_number',
            required: true,
          },
          {
            concept_ref: 'inputs.Policy',
            description: 'The policy',
            fields: [
              {
                description: 'Who holds the policy',
                kind: 'text',
                name: 'holder',
                required: true,
              },
              {
                description: "The policy's number",
                kind: 'text',
                name: 'policy_number',
                required: true,
              },
              {
                choices: ['third_party', 'third_party_fire_theft', 'comprehensive'],
                description: 'What the policy covers',
                kind: 'enum',
                name: 'cover',
                required: true,
              },
            ],
            kind: 'object',
            name: 'policy',
            required: true,
          },
          {
            concept_ref: 'inputs.Incident',
            description: 'The incident',
            fields: [
              {
                datetime: false,
                description: 'The day it happened',
                kind: 'date',
                name: 'date',
                required: true,
              },
              {
                description: 'Where it happened',
                kind: 'text',
                name: 'place',
                required: true,
              },
              {
                concept_ref: 'inputs.Party',
                description: 'Who was involved',
                item: {
                  concept_ref: 'inputs.Party',
                  description: 'Someone involved in the incident.',
                  fields: [
                    {
                      description: 'Their full name',
                      kind: 'text',
                      name: 'name',
                      required: true,
                    },
                    {
                      choices: [
                        'policyholder',
                        'third_party',
                        'witness',
                        'passenger',
                        'pedestrian',
                      ],
                      description: 'Their part in the incident',
                      kind: 'enum',
                      name: 'role',
                      required: true,
                    },
                    {
                      description: 'Their insurer',
                      kind: 'text',
                      name: 'insurer',
                      required: false,
                    },
                    {
                      description: "Their vehicle's plate",
                      kind: 'text',
                      name: 'plate',
                      required: false,
                    },
                  ],
                  kind: 'object',
                  required: true,
                },
                kind: 'list',
                name: 'parties',
                required: true,
              },
              {
                description: 'The time it happened',
                format: 'time',
                kind: 'text',
                name: 'time',
                required: false,
              },
            ],
            kind: 'object',
            name: 'incident',
            required: true,
          },
          {
            concept_ref: 'inputs.DamagedItem',
            description: 'Every damaged part',
            item: {
              concept_ref: 'inputs.DamagedItem',
              description: 'One damaged part.',
              fields: [
                {
                  description: 'The damaged part',
                  kind: 'text',
                  name: 'part',
                  required: true,
                },
                {
                  description: 'What happened to it',
                  kind: 'text',
                  name: 'damage',
                  required: true,
                },
                {
                  description: "The repairer's quote, in euros.",
                  integer: false,
                  kind: 'number',
                  name: 'quoted',
                  required: true,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'damaged_items',
            required: true,
          },
          {
            description: 'A police report was filed',
            kind: 'boolean',
            name: 'police_report_filed',
            required: true,
          },
          {
            description: 'Notes for the adjuster',
            kind: 'text',
            name: 'adjuster_notes',
            required: false,
          },
          {
            description: 'Anything else the claims system holds',
            kind: 'unknown',
            name: 'extra',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'claim_record',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'inputs.number_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Tolerance',
        description: 'Differences below it count as a match.',
        gating: true,
        integer: false,
        kind: 'number',
        name: 'tolerance',
        presence: 'plain',
        refines: ['native.Number'],
        required: true,
      },
      {
        concept_ref: 'inputs.DeepCheck',
        description: 'Also searches court records and sanctions lists.',
        gating: true,
        kind: 'boolean',
        name: 'deep_check',
        presence: 'plain',
        refines: ['native.YesNo'],
        required: true,
      },
    ],
  },
  'inputs.presence_inputs': {
    fields: [
      {
        concept_ref: 'inputs.LegalName',
        description: "The company's legal name.",
        gating: true,
        hints: {
          intent: 'label',
        },
        kind: 'text',
        name: 'supplier',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
      {
        concept_ref: 'inputs.RegistrationNumber',
        description: 'Speeds up the register look-up.',
        gating: false,
        hints: {
          intent: 'label',
        },
        kind: 'text',
        name: 'registration_number',
        presence: 'optional',
        refines: ['native.Text'],
        required: false,
      },
      {
        concept_ref: 'inputs.ReportLanguage',
        description: "The report's language.",
        fields: [
          {
            choices: ['english', 'french', 'german'],
            default_value: 'english',
            description: 'The language the report is written in',
            kind: 'enum',
            name: 'language',
            required: false,
          },
        ],
        gating: false,
        kind: 'object',
        name: 'report_language',
        presence: 'optional',
        required: false,
      },
      {
        concept_ref: 'inputs.Terms',
        description: 'The commercial terms of the quote.',
        fields: [
          {
            choices: ['30 days', '45 days', '60 days'],
            default_value: '30 days',
            description: 'When the invoice is due',
            kind: 'enum',
            name: 'payment_terms',
            required: false,
          },
          {
            description: 'A discount on the whole quote, in percent',
            integer: false,
            kind: 'number',
            name: 'discount',
            required: false,
          },
          {
            description: 'Anything the client should know',
            kind: 'text',
            name: 'notes',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'terms',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'inputs.structure_inputs': {
    fields: [
      {
        concept_ref: 'inputs.Terms',
        description: 'The commercial terms of the quote.',
        fields: [
          {
            choices: ['30 days', '45 days', '60 days'],
            default_value: '30 days',
            description: 'When the invoice is due',
            kind: 'enum',
            name: 'payment_terms',
            required: false,
          },
          {
            description: 'A discount on the whole quote, in percent',
            integer: false,
            kind: 'number',
            name: 'discount',
            required: false,
          },
          {
            description: 'Anything the client should know',
            kind: 'text',
            name: 'notes',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'terms',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'inputs.text_inputs': {
    fields: [
      {
        concept_ref: 'inputs.LegalName',
        description: "The company's legal name.",
        gating: true,
        hints: {
          intent: 'label',
        },
        kind: 'text',
        name: 'supplier',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
      {
        concept_ref: 'inputs.RegistrationNumber',
        description: 'Speeds up the register look-up.',
        gating: false,
        hints: {
          intent: 'label',
        },
        kind: 'text',
        name: 'registration_number',
        presence: 'optional',
        refines: ['native.Text'],
        required: false,
      },
      {
        concept_ref: 'inputs.ClientBrief',
        description: 'What the client asked for, in their own words.',
        gating: true,
        kind: 'prose',
        name: 'client_brief',
        presence: 'plain',
        refines: ['native.Text'],
        required: true,
      },
    ],
  },
  'inputs.unknown_inputs': {
    fields: [
      {
        concept_ref: 'native.Dynamic',
        description: 'A dynamic concept',
        gating: true,
        kind: 'unknown',
        name: 'settings',
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
  'inputs.app_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.choice_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.date_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.document_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.image_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.list_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.nested_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.number_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.presence_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.structure_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.text_inputs': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'inputs.unknown_inputs': {
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
  'inputs.app_inputs': 'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.choice_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.date_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.document_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.image_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.list_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.nested_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.number_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.presence_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.structure_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.text_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'inputs.unknown_inputs':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  "Every input kind an app's form draws, in the shapes the Pipelex Studio canvas draws them: one concept per board of its Input components.";
