/**
 * Description-only concepts as the engine states them: the `input_form`,
 * `pipe_io_contracts` and `output_form` the runtime's projection corpus
 * generator captured from this bundle, copied verbatim so the schemas are the
 * ones a host receives:
 *
 *   domain      = "prose_topic"
 *   description = "Description-only concepts as a run's inputs"
 *   main_pipe   = "write_about"
 *
 *   [concept]
 *   Topic = "A subject to write about"
 *
 *   [concept.Angle]
 *   description = "A narrower subject, refining a topic"
 *   refines     = "Topic"
 *
 *   [concept.Headline]
 *   description = "A one-line title"
 *   hints       = { intent = "label" }
 *
 *   [pipe.write_about]
 *   type        = "PipeLLM"
 *   description = "Write a short paragraph about a topic"
 *   inputs      = { topic = "Topic", angle = "Angle", headline = "Headline" }
 *   output      = "Topic"
 *   prompt      = """
 *   Write one paragraph about $topic from $angle under $headline.
 *   """
 *
 * A description-only concept (`Topic`) and one refining it (`Angle`) reach the
 * wire as `prose` nodes naming no native ancestor, and one under a `label`
 * intent (`Headline`) as a `text` node. Each is backed by the text's content
 * model, so each schema declares `text` beside the stored reference's members,
 * all optional.
 *
 * Not a test file (vitest collects `*.test.ts` only).
 */

import type { InputFormField, PipeInputFormDescriptor } from 'mthds/protocol';
import type { PipeIOContract } from '../contracts';

export const DESCRIPTION_ONLY_CONTRACT = {
  inputs: {
    topic: {
      concept_ref: 'prose_topic.Topic',
      presence: 'plain',
      multiplicity: 'single',
      item_count: null,
      json_schema: {
        description: 'A subject to write about',
        properties: {
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
        },
        title: 'prose_topic.Topic',
        type: 'object',
      },
    },
    angle: {
      concept_ref: 'prose_topic.Angle',
      presence: 'plain',
      multiplicity: 'single',
      item_count: null,
      json_schema: {
        description: 'A narrower subject, refining a topic',
        properties: {
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
        },
        title: 'prose_topic.Angle',
        type: 'object',
      },
    },
    headline: {
      concept_ref: 'prose_topic.Headline',
      presence: 'plain',
      multiplicity: 'single',
      item_count: null,
      json_schema: {
        description: 'A one-line title',
        properties: {
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
        },
        title: 'prose_topic.Headline',
        type: 'object',
      },
    },
  },
  output: {
    concept_ref: 'prose_topic.Topic',
    multiplicity: 'single',
    item_count: null,
    optional: false,
    json_schema: {
      description: 'A subject to write about',
      properties: {
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
          description: 'The first few hundred characters of the stored text, always its true start',
          title: 'Preview',
        },
      },
      title: 'prose_topic.Topic',
      type: 'object',
    },
  },
} as unknown as PipeIOContract;

export const DESCRIPTION_ONLY_INPUT_FORM = {
  fields: [
    {
      kind: 'prose',
      name: 'topic',
      concept_ref: 'prose_topic.Topic',
      description: 'A subject to write about',
      required: true,
      presence: 'plain',
      gating: true,
    },
    {
      kind: 'prose',
      name: 'angle',
      concept_ref: 'prose_topic.Angle',
      refines: ['prose_topic.Topic'],
      description: 'A narrower subject, refining a topic',
      required: true,
      presence: 'plain',
      gating: true,
    },
    {
      kind: 'text',
      name: 'headline',
      concept_ref: 'prose_topic.Headline',
      description: 'A one-line title',
      required: true,
      presence: 'plain',
      gating: true,
      hints: {
        intent: 'label',
      },
    },
  ],
} as unknown as PipeInputFormDescriptor;

export const DESCRIPTION_ONLY_OUTPUT_FIELD = {
  kind: 'prose',
  name: 'output',
  concept_ref: 'prose_topic.Topic',
  description: 'A subject to write about',
  required: true,
} as unknown as InputFormField;
