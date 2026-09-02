/**
 * Generated from data/structures/lists.mthds - DO NOT EDIT.
 *
 * One case per ELEMENT shape a result list can hold, because the layout a list gets is decided from its element's descriptor and nothing else. Scalars, a short record, a twelve-column record, a record carrying prose, a record carrying records that carry lists, and both file kinds. Every pipe runs for real; the image case is a PipeImgGen because the language forbids a PipeLLM resolving to a concept that contains images. The gallery pins an image model explicitly: the deck's default backend refuses more than one image per call (`can't generate multiple images at once`), so a `Image[3]` output needs one that does not.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'lists.chapters',
  'lists.dates',
  'lists.findings',
  'lists.gallery',
  'lists.numbers',
  'lists.readings',
  'lists.sources',
  'lists.steps',
  'lists.texts',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'lists.chapters': {
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
      concept_ref: 'lists.Chapter',
      item_count: null,
      json_schema: {
        $defs: {
          lists__Chapter: {
            description: 'One chapter — a record carrying a list of records that carry lists',
            properties: {
              sections: {
                description: 'Its sections',
                items: {
                  $ref: '#/$defs/lists__Section',
                },
                title: 'Sections',
                type: 'array',
              },
              title: {
                description: "The chapter's title",
                title: 'Title',
                type: 'string',
              },
            },
            required: ['title', 'sections'],
            title: 'lists__Chapter',
            type: 'object',
          },
          lists__Section: {
            description: 'One section of a chapter — a record carrying a list of its own',
            properties: {
              heading: {
                description: "The section's heading",
                title: 'Heading',
                type: 'string',
              },
              page: {
                description: 'Which page it starts on',
                title: 'Page',
                type: 'integer',
              },
              points: {
                description: 'The points it makes',
                items: {
                  type: 'string',
                },
                title: 'Points',
                type: 'array',
              },
            },
            required: ['heading', 'page', 'points'],
            title: 'lists__Section',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/lists__Chapter',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[lists__Chapter]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'lists.dates': {
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
      concept_ref: 'native.Date',
      item_count: null,
      json_schema: {
        $defs: {
          DateContent: {
            description:
              'A calendar date, optionally with a time of day — as precise as its source states.\n\nThe optional ``time`` carries the UTC offset on its ``tzinfo`` when the source states one\n(fidelity, not normalization). Invalid states are unrepresentable by construction: no time\nwithout a date, no offset without a time.',
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
            title: 'DateContent',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/DateContent',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[DateContent]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'lists.findings': {
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
      concept_ref: 'lists.Finding',
      item_count: null,
      json_schema: {
        $defs: {
          lists__Finding: {
            description:
              'One review finding — a record carrying PROSE, which a table cell cannot hold',
            properties: {
              detail: {
                description: 'The finding in full',
                title: 'Detail',
                type: 'string',
              },
              serious: {
                description: 'Whether it blocks',
                title: 'Serious',
                type: 'boolean',
              },
              title: {
                description: 'What was found',
                title: 'Title',
                type: 'string',
              },
            },
            required: ['title', 'detail', 'serious'],
            title: 'lists__Finding',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/lists__Finding',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[lists__Finding]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'lists.gallery': {
    inputs: {},
    output: {
      concept_ref: 'native.Image',
      item_count: 3,
      json_schema: {
        $defs: {
          ImageContent: {
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
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/ImageContent',
            },
            maxItems: 3,
            minItems: 3,
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[ImageContent]',
        type: 'object',
      },
      multiplicity: 'fixed',
      optional: false,
    },
  },
  'lists.numbers': {
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
      concept_ref: 'native.Number',
      item_count: null,
      json_schema: {
        $defs: {
          NumberContent: {
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
            title: 'NumberContent',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/NumberContent',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[NumberContent]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'lists.readings': {
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
      concept_ref: 'lists.Reading',
      item_count: null,
      json_schema: {
        $defs: {
          lists__Reading: {
            description:
              'One instrument reading — a WIDE record, twelve columns, which no panel is wide enough for',
            properties: {
              band: {
                description: 'Which band it covers',
                enum: ['visible', 'infrared', 'ultraviolet'],
                title: 'Band',
                type: 'string',
              },
              calibrated: {
                description: 'Whether it was calibrated',
                title: 'Calibrated',
                type: 'boolean',
              },
              exposures: {
                description: 'How many exposures',
                title: 'Exposures',
                type: 'integer',
              },
              instrument: {
                description: 'Which instrument took it',
                title: 'Instrument',
                type: 'string',
              },
              intensity: {
                description: 'Measured intensity',
                title: 'Intensity',
                type: 'number',
              },
              operator: {
                description: 'Who took it',
                title: 'Operator',
                type: 'string',
              },
              reference: {
                description: "The reading's reference",
                title: 'Reference',
                type: 'string',
              },
              seeing: {
                description: 'Seeing, in arcseconds',
                title: 'Seeing',
                type: 'number',
              },
              site: {
                description: 'Where it was taken',
                title: 'Site',
                type: 'string',
              },
              status: {
                description: 'Where it stands',
                enum: ['accepted', 'suspect', 'rejected'],
                title: 'Status',
                type: 'string',
              },
              taken_on: {
                description: 'When it was taken',
                format: 'date',
                title: 'Taken On',
                type: 'string',
              },
              wavelength: {
                description: 'Wavelength in nanometres',
                title: 'Wavelength',
                type: 'number',
              },
            },
            required: [
              'reference',
              'instrument',
              'operator',
              'site',
              'status',
              'band',
              'taken_on',
              'wavelength',
              'intensity',
              'exposures',
              'calibrated',
              'seeing',
            ],
            title: 'lists__Reading',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/lists__Reading',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[lists__Reading]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'lists.sources': {
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
      concept_ref: 'native.Document',
      item_count: null,
      json_schema: {
        $defs: {
          DocumentContent: {
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
                description:
                  'The document URL: a storage URI, an HTTP(S) URL, or a base64 data URL',
                title: 'Url',
                type: 'string',
              },
            },
            required: ['url'],
            title: 'DocumentContent',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/DocumentContent',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[DocumentContent]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'lists.steps': {
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
      concept_ref: 'lists.Step',
      item_count: null,
      json_schema: {
        $defs: {
          lists__Step: {
            description: 'One step of a checklist — a short record, which is a table row',
            properties: {
              label: {
                description: 'What to do',
                title: 'Label',
                type: 'string',
              },
              minute: {
                description: 'How long it takes',
                title: 'Minute',
                type: 'integer',
              },
              tool: {
                description: 'What it needs',
                title: 'Tool',
                type: 'string',
              },
            },
            required: ['label', 'minute', 'tool'],
            title: 'lists__Step',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/lists__Step',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[lists__Step]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'lists.texts': {
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
      json_schema: {
        $defs: {
          TextContent: {
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
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/TextContent',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[TextContent]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'lists.chapters': {
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
  'lists.dates': {
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
  'lists.findings': {
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
  'lists.gallery': {
    fields: [],
  },
  'lists.numbers': {
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
  'lists.readings': {
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
  'lists.sources': {
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
  'lists.steps': {
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
  'lists.texts': {
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
  'lists.chapters': {
    field: {
      concept_ref: 'lists.Chapter',
      description: 'One chapter — a record carrying a list of records that carry lists',
      item: {
        concept_ref: 'lists.Chapter',
        description: 'One chapter — a record carrying a list of records that carry lists',
        fields: [
          {
            description: "The chapter's title",
            kind: 'text',
            name: 'title',
            required: true,
          },
          {
            concept_ref: 'lists.Section',
            description: 'Its sections',
            item: {
              concept_ref: 'lists.Section',
              description: 'One section of a chapter — a record carrying a list of its own',
              fields: [
                {
                  description: "The section's heading",
                  kind: 'text',
                  name: 'heading',
                  required: true,
                },
                {
                  description: 'Which page it starts on',
                  integer: true,
                  kind: 'number',
                  name: 'page',
                  required: true,
                },
                {
                  description: 'The points it makes',
                  item: {
                    kind: 'text',
                    required: true,
                  },
                  kind: 'list',
                  name: 'points',
                  required: true,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'sections',
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
  'lists.dates': {
    field: {
      concept_ref: 'native.Date',
      description:
        'A calendar date, optionally with a time of day — as precise as its source states.',
      item: {
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
        kind: 'object',
        required: true,
      },
      kind: 'list',
      name: 'output',
      required: true,
    },
  },
  'lists.findings': {
    field: {
      concept_ref: 'lists.Finding',
      description: 'One review finding — a record carrying PROSE, which a table cell cannot hold',
      item: {
        concept_ref: 'lists.Finding',
        description: 'One review finding — a record carrying PROSE, which a table cell cannot hold',
        fields: [
          {
            description: 'What was found',
            kind: 'text',
            name: 'title',
            required: true,
          },
          {
            description: 'The finding in full',
            hints: {
              intent: 'prose',
            },
            kind: 'prose',
            name: 'detail',
            required: true,
          },
          {
            description: 'Whether it blocks',
            kind: 'boolean',
            name: 'serious',
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
  'lists.gallery': {
    field: {
      concept_ref: 'native.Image',
      description: 'An image',
      item: {
        concept_ref: 'native.Image',
        description: 'An image',
        kind: 'image',
        required: true,
      },
      item_count: 3,
      kind: 'list',
      name: 'output',
      required: true,
    },
  },
  'lists.numbers': {
    field: {
      concept_ref: 'native.Number',
      description: 'A number',
      item: {
        concept_ref: 'native.Number',
        description: 'A number',
        integer: false,
        kind: 'number',
        required: true,
      },
      kind: 'list',
      name: 'output',
      required: true,
    },
  },
  'lists.readings': {
    field: {
      concept_ref: 'lists.Reading',
      description:
        'One instrument reading — a WIDE record, twelve columns, which no panel is wide enough for',
      item: {
        concept_ref: 'lists.Reading',
        description:
          'One instrument reading — a WIDE record, twelve columns, which no panel is wide enough for',
        fields: [
          {
            description: "The reading's reference",
            kind: 'text',
            name: 'reference',
            required: true,
          },
          {
            description: 'Which instrument took it',
            kind: 'text',
            name: 'instrument',
            required: true,
          },
          {
            description: 'Who took it',
            kind: 'text',
            name: 'operator',
            required: true,
          },
          {
            description: 'Where it was taken',
            kind: 'text',
            name: 'site',
            required: true,
          },
          {
            choices: ['accepted', 'suspect', 'rejected'],
            description: 'Where it stands',
            kind: 'enum',
            name: 'status',
            required: true,
          },
          {
            choices: ['visible', 'infrared', 'ultraviolet'],
            description: 'Which band it covers',
            kind: 'enum',
            name: 'band',
            required: true,
          },
          {
            datetime: false,
            description: 'When it was taken',
            kind: 'date',
            name: 'taken_on',
            required: true,
          },
          {
            description: 'Wavelength in nanometres',
            integer: false,
            kind: 'number',
            name: 'wavelength',
            required: true,
          },
          {
            description: 'Measured intensity',
            integer: false,
            kind: 'number',
            name: 'intensity',
            required: true,
          },
          {
            description: 'How many exposures',
            integer: true,
            kind: 'number',
            name: 'exposures',
            required: true,
          },
          {
            description: 'Whether it was calibrated',
            kind: 'boolean',
            name: 'calibrated',
            required: true,
          },
          {
            description: 'Seeing, in arcseconds',
            integer: false,
            kind: 'number',
            name: 'seeing',
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
  'lists.sources': {
    field: {
      concept_ref: 'native.Document',
      description: 'A document',
      item: {
        concept_ref: 'native.Document',
        description: 'A document',
        kind: 'document',
        required: true,
      },
      kind: 'list',
      name: 'output',
      required: true,
    },
  },
  'lists.steps': {
    field: {
      concept_ref: 'lists.Step',
      description: 'One step of a checklist — a short record, which is a table row',
      item: {
        concept_ref: 'lists.Step',
        description: 'One step of a checklist — a short record, which is a table row',
        fields: [
          {
            description: 'What to do',
            kind: 'text',
            name: 'label',
            required: true,
          },
          {
            description: 'How long it takes',
            integer: true,
            kind: 'number',
            name: 'minute',
            required: true,
          },
          {
            description: 'What it needs',
            kind: 'text',
            name: 'tool',
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
  'lists.texts': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      item: {
        concept_ref: 'native.Text',
        description: 'A text',
        kind: 'prose',
        required: true,
      },
      kind: 'list',
      name: 'output',
      required: true,
    },
  },
};
