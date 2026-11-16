/**
 * The stored-value natives as the engine states them, copied verbatim from the
 * MTHDS projection corpus (case `input_semantics_scaffold.scaffold_stored_natives`
 * of `pipe_io_contracts.json`, `input_form.json` and `output_form.json`), which
 * the runtime generates from a real bundle. Copied rather than written so the
 * schemas are the ones a host actually receives: `Text`, `Markdown`, `Html` and
 * `JSON` each hold their value inline or a reference to it in storage
 * (`url`, `size`, `mime_type`, `preview`), so the value property is optional
 * and the schema declares five properties where it used to declare one.
 *
 * Not a test file (vitest collects `*.test.ts` only).
 */

import type { InputFormField, PipeInputFormDescriptor } from 'mthds/protocol';
import type { PipeIOContract } from '../contracts';

export const STORED_NATIVES_CONTRACT = {
  inputs: {
    markdown_in: {
      concept_ref: 'native.Markdown',
      presence: 'plain',
      multiplicity: 'single',
      item_count: null,
      json_schema: {
        description: 'A text written in Markdown',
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
            description: 'The text, written in Markdown',
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
        title: 'native.Markdown',
        type: 'object',
      },
    },
    webpage_in: {
      concept_ref: 'input_semantics_scaffold.Webpage',
      presence: 'plain',
      multiplicity: 'single',
      item_count: null,
      json_schema: {
        description: 'SCAFFOLD_desc_concept_Webpage: a page of HTML, refining the native',
        properties: {
          inner_html: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The inner HTML of the content',
            title: 'Inner Html',
          },
          css_class: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The CSS class of the content',
            title: 'Css Class',
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
              'The URL of the stored inner HTML: a storage URI, an HTTP(S) URL, or a base64 data URL',
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
            description: 'The length of the stored inner HTML, in bytes as stored',
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
            description: 'The MIME type of the stored inner HTML: text/html',
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
              'The first few hundred characters of the stored inner HTML, always its true start',
            title: 'Preview',
          },
        },
        title: 'input_semantics_scaffold.Webpage',
        type: 'object',
      },
    },
    payload_in: {
      concept_ref: 'input_semantics_scaffold.Payload',
      presence: 'plain',
      multiplicity: 'single',
      item_count: null,
      json_schema: {
        description: 'SCAFFOLD_desc_concept_Payload: a JSON payload, refining the native',
        properties: {
          json_obj: {
            anyOf: [
              {
                additionalProperties: true,
                type: 'object',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The JSON object',
            title: 'Json Obj',
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
              'The URL of the stored JSON object: a storage URI, an HTTP(S) URL, or a base64 data URL',
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
            description:
              "The length of the stored JSON object's serialized form, in bytes as stored",
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
            description: 'The MIME type of the stored JSON object: application/json',
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
              "The first few hundred characters of the stored JSON object's serialized form, always its true start",
            title: 'Preview',
          },
        },
        title: 'input_semantics_scaffold.Payload',
        type: 'object',
      },
    },
    memo_in: {
      concept_ref: 'input_semantics_scaffold.Memo',
      presence: 'plain',
      multiplicity: 'single',
      item_count: null,
      json_schema: {
        description: 'SCAFFOLD_desc_concept_Memo: a memo, refining the native text',
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
        title: 'input_semantics_scaffold.Memo',
        type: 'object',
      },
    },
  },
  output: {
    concept_ref: 'native.Text',
    multiplicity: 'single',
    item_count: null,
    optional: false,
    json_schema: {
      description: 'A text',
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
      title: 'native.Text',
      type: 'object',
    },
  },
} as unknown as PipeIOContract;

export const STORED_NATIVES_INPUT_FORM = {
  fields: [
    {
      kind: 'prose',
      name: 'markdown_in',
      concept_ref: 'native.Markdown',
      description: 'A text written in Markdown',
      required: true,
      presence: 'plain',
      gating: true,
    },
    {
      kind: 'object',
      name: 'webpage_in',
      concept_ref: 'input_semantics_scaffold.Webpage',
      refines: ['native.Html'],
      description: 'SCAFFOLD_desc_concept_Webpage: a page of HTML, refining the native',
      required: true,
      presence: 'plain',
      gating: true,
      fields: [
        {
          kind: 'text',
          name: 'inner_html',
          description: 'The inner HTML of the content',
          required: true,
        },
        {
          kind: 'text',
          name: 'css_class',
          description: 'The CSS class of the content',
          required: false,
        },
      ],
    },
    {
      kind: 'object',
      name: 'payload_in',
      concept_ref: 'input_semantics_scaffold.Payload',
      refines: ['native.JSON'],
      description: 'SCAFFOLD_desc_concept_Payload: a JSON payload, refining the native',
      required: true,
      presence: 'plain',
      gating: true,
      fields: [
        {
          kind: 'unknown',
          name: 'json_obj',
          description: 'The JSON object',
          required: true,
        },
      ],
    },
    {
      kind: 'prose',
      name: 'memo_in',
      concept_ref: 'input_semantics_scaffold.Memo',
      refines: ['native.Text'],
      description: 'SCAFFOLD_desc_concept_Memo: a memo, refining the native text',
      required: true,
      presence: 'plain',
      gating: true,
    },
  ],
} as unknown as PipeInputFormDescriptor;

export const STORED_NATIVES_OUTPUT_FIELD = {
  kind: 'prose',
  name: 'output',
  concept_ref: 'native.Text',
  description: 'A text',
  required: true,
} as unknown as InputFormField;
