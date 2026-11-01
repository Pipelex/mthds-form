/**
 * Generated from src/__stories__/_structures/composites.mthds - DO NOT EDIT.
 *
 * A pipe whose RESULT is a `native.Composite` of three parts, the shape of a multi-part report: a Markdown executive summary, a list of four risk records, and a generated cover picture. The carrier is a `PipeParallel` naming three branch carriers, which `make fixtures-runs` runs through the parallel, never on their own; it captures what the hosted API returns for each member, which no descriptor states because a composite declares none.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'composites.cover_part',
  'composites.launch_report',
  'composites.risks_part',
  'composites.summary_part',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'composites.cover_part': {
    inputs: {},
    output: {
      concept_ref: 'native.Image',
      item_count: null,
      json_schema: {
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
        title: 'native.Image',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'composites.launch_report': {
    inputs: {},
    output: {
      concept_ref: 'native.Composite',
      item_count: null,
      json_schema: {
        additionalProperties: true,
        description: 'A named composition of contents',
        properties: {},
        title: 'native.Composite',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'composites.risks_part': {
    inputs: {},
    output: {
      concept_ref: 'composites.Risk',
      item_count: 4,
      json_schema: {
        $defs: {
          composites__Risk: {
            description: 'A risk to a product launch',
            properties: {
              likelihood: {
                description: 'How likely it is',
                enum: ['low', 'medium', 'high'],
                title: 'Likelihood',
                type: 'string',
              },
              risk: {
                description: 'The risk',
                title: 'Risk',
                type: 'string',
              },
            },
            required: ['risk', 'likelihood'],
            title: 'composites__Risk',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/composites__Risk',
            },
            maxItems: 4,
            minItems: 4,
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[composites__Risk]',
        type: 'object',
      },
      multiplicity: 'fixed',
      optional: false,
    },
  },
  'composites.summary_part': {
    inputs: {},
    output: {
      concept_ref: 'native.Markdown',
      item_count: null,
      json_schema: {
        description: 'A text written in Markdown',
        properties: {
          text: {
            description: 'The text, written in Markdown',
            title: 'Text',
            type: 'string',
          },
        },
        required: ['text'],
        title: 'native.Markdown',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'composites.cover_part': {
    fields: [],
  },
  'composites.launch_report': {
    fields: [],
  },
  'composites.risks_part': {
    fields: [],
  },
  'composites.summary_part': {
    fields: [],
  },
};

/**
 * The output half - a standard artifact, keyed by the same pipe_ref set as the
 * two above because all three builders iterate one pipe sequence. The payload
 * SCHEMA is not here: it rides `CONTRACTS[ref].output.json_schema`, where the
 * standard puts it, beside the input schemas.
 */
export const OUTPUT_FORM: OutputForm = {
  'composites.cover_part': {
    field: {
      concept_ref: 'native.Image',
      description: 'An image',
      kind: 'image',
      name: 'output',
      required: true,
    },
  },
  'composites.launch_report': {
    field: {
      concept_ref: 'native.Composite',
      description: 'A named composition of contents',
      kind: 'unknown',
      name: 'output',
      required: true,
    },
  },
  'composites.risks_part': {
    field: {
      concept_ref: 'composites.Risk',
      description: 'A risk to a product launch',
      item: {
        concept_ref: 'composites.Risk',
        description: 'A risk to a product launch',
        fields: [
          {
            description: 'The risk',
            kind: 'text',
            name: 'risk',
            required: true,
          },
          {
            choices: ['low', 'medium', 'high'],
            description: 'How likely it is',
            kind: 'enum',
            name: 'likelihood',
            required: true,
          },
        ],
        kind: 'object',
        required: true,
      },
      item_count: 4,
      kind: 'list',
      name: 'output',
      required: true,
    },
  },
  'composites.summary_part': {
    field: {
      concept_ref: 'native.Markdown',
      description: 'A text written in Markdown',
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
  'composites.cover_part':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'composites.launch_report':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'composites.risks_part':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'composites.summary_part':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  'A result made of several parts at once: a Markdown summary, a list of records and a generated picture, composed by a parallel run into one native.Composite.';
