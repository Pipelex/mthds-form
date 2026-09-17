/**
 * Generated from data/structures/files.mthds - DO NOT EDIT.
 *
 * Document and image slots. Each pipe isolates ONE comparison, so a story can name what varies.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'files.many_files',
  'files.native_vs_refined_document',
  'files.native_vs_refined_image',
  'files.one_document',
  'files.one_image',
  'files.required_vs_optional',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'files.many_files': {
    inputs: {
      attachments: {
        concept_ref: 'native.Document',
        item_count: null,
        json_schema: {
          items: {
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
            title: 'native.Document',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
      gallery: {
        concept_ref: 'native.Image',
        item_count: null,
        json_schema: {
          items: {
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
  'files.native_vs_refined_document': {
    inputs: {
      attachment: {
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
      contract: {
        concept_ref: 'files.SignedContract',
        item_count: null,
        json_schema: {
          description: 'A contract with signatures on it',
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
          title: 'files.SignedContract',
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
  'files.native_vs_refined_image': {
    inputs: {
      headshot: {
        concept_ref: 'files.Headshot',
        item_count: null,
        json_schema: {
          description: 'A portrait photograph',
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
          title: 'files.Headshot',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
      picture: {
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
  'files.one_document': {
    inputs: {
      attachment: {
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
  'files.one_image': {
    inputs: {
      picture: {
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
  'files.required_vs_optional': {
    inputs: {
      attachment: {
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
      cover_letter: {
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
        presence: 'optional',
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
  'files.many_files': {
    fields: [
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: false,
        item: {
          concept_ref: 'native.Document',
          description: 'A document',
          kind: 'document',
          required: true,
        },
        kind: 'list',
        name: 'attachments',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Image',
        description: 'An image',
        gating: false,
        item: {
          concept_ref: 'native.Image',
          description: 'An image',
          kind: 'image',
          required: true,
        },
        kind: 'list',
        name: 'gallery',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'files.native_vs_refined_document': {
    fields: [
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: true,
        kind: 'document',
        name: 'attachment',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'files.SignedContract',
        description: 'A contract with signatures on it',
        gating: true,
        kind: 'document',
        name: 'contract',
        presence: 'plain',
        refines: ['native.Document'],
        required: true,
      },
    ],
  },
  'files.native_vs_refined_image': {
    fields: [
      {
        concept_ref: 'native.Image',
        description: 'An image',
        gating: true,
        kind: 'image',
        name: 'picture',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'files.Headshot',
        description: 'A portrait photograph',
        gating: true,
        kind: 'image',
        name: 'headshot',
        presence: 'plain',
        refines: ['native.Image'],
        required: true,
      },
    ],
  },
  'files.one_document': {
    fields: [
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: true,
        kind: 'document',
        name: 'attachment',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'files.one_image': {
    fields: [
      {
        concept_ref: 'native.Image',
        description: 'An image',
        gating: true,
        kind: 'image',
        name: 'picture',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'files.required_vs_optional': {
    fields: [
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: true,
        kind: 'document',
        name: 'attachment',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: false,
        kind: 'document',
        name: 'cover_letter',
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
  'files.many_files': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'files.native_vs_refined_document': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'files.native_vs_refined_image': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'files.one_document': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'files.one_image': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'files.required_vs_optional': {
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
  'files.many_files': 'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'files.native_vs_refined_document':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'files.native_vs_refined_image':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'files.one_document':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'files.one_image': 'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'files.required_vs_optional':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  'The two file-bearing native concepts, plain and refined.';
