/**
 * Generated from data/structures/results.mthds - DO NOT EDIT.
 *
 * Pipes whose OUTPUT is the interesting half, chosen to span the whole result surface rather than to repeat one shape: every native scalar, a wrapping content model and a multi-property one, a flat structure, one and four levels of nesting, a list long enough to scroll, and both file-bearing kinds. Each pipe carries a 'run' block (or states its own prompt), so `make fixtures-runs` produces the real payload beside the descriptor. The two carriers that are not PipeLLM are there because the language forbids one: a PipeLLM may not resolve to a concept that contains images, so the image case is a PipeImgGen and the page case a PipeExtract. One pipe carries no 'run' block and cannot: `nested_media_result` resolves to a concept containing images, which the language forbids a PipeLLM producing, and no other operator produces a structure. Its descriptor is generated like every other; the story that renders it supplies its own payload of served files, because a run's file URLs are storage references a browser cannot fetch.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'results.date_result',
  'results.deep_result',
  'results.every_kind_result',
  'results.flat_result',
  'results.html_result',
  'results.image_result',
  'results.long_list_result',
  'results.nested_media_result',
  'results.nested_result',
  'results.number_result',
  'results.page_result',
  'results.plain_text_result',
  'results.plural_result',
  'results.yes_no_result',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'results.date_result': {
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
      optional: false,
    },
  },
  'results.deep_result': {
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
      concept_ref: 'results.Company',
      item_count: null,
      json_schema: {
        $defs: {
          results__Division: {
            description: 'A division of a company',
            properties: {
              budget: {
                description: 'Its annual budget, in millions',
                title: 'Budget',
                type: 'number',
              },
              name: {
                description: "The division's name",
                title: 'Name',
                type: 'string',
              },
              region: {
                description: 'Where it operates',
                enum: ['emea', 'americas', 'apac'],
                title: 'Region',
                type: 'string',
              },
              teams: {
                description: 'The teams it holds',
                items: {
                  $ref: '#/$defs/results__Team',
                },
                title: 'Teams',
                type: 'array',
              },
            },
            required: ['name', 'region', 'budget', 'teams'],
            title: 'results__Division',
            type: 'object',
          },
          results__Team: {
            description: 'A team inside a division',
            properties: {
              headcount: {
                description: 'How many people it holds',
                title: 'Headcount',
                type: 'integer',
              },
              members: {
                description: 'The people on it',
                items: {
                  $ref: '#/$defs/results__TeamMember',
                },
                title: 'Members',
                type: 'array',
              },
              mission: {
                description: 'What the team is for',
                title: 'Mission',
                type: 'string',
              },
              name: {
                description: "The team's name",
                title: 'Name',
                type: 'string',
              },
            },
            required: ['name', 'mission', 'headcount', 'members'],
            title: 'results__Team',
            type: 'object',
          },
          results__TeamMember: {
            description: 'One person on a team',
            properties: {
              focus_areas: {
                anyOf: [
                  {
                    items: {
                      type: 'string',
                    },
                    type: 'array',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'What they spend their time on',
                title: 'Focus Areas',
              },
              name: {
                description: 'Their name',
                title: 'Name',
                type: 'string',
              },
              remote: {
                anyOf: [
                  {
                    type: 'boolean',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Whether they work remotely',
                title: 'Remote',
              },
              role: {
                description: 'What they do',
                enum: ['engineer', 'designer', 'researcher', 'manager'],
                title: 'Role',
                type: 'string',
              },
              started_on: {
                description: 'When they joined',
                format: 'date',
                title: 'Started On',
                type: 'string',
              },
            },
            required: ['name', 'role', 'started_on'],
            title: 'results__TeamMember',
            type: 'object',
          },
        },
        description: 'A company, described down to its people',
        properties: {
          divisions: {
            description: 'Its divisions',
            items: {
              $ref: '#/$defs/results__Division',
            },
            title: 'Divisions',
            type: 'array',
          },
          founded_on: {
            description: 'When it was founded',
            format: 'date',
            title: 'Founded On',
            type: 'string',
          },
          is_public: {
            description: 'Whether it is publicly traded',
            title: 'Is Public',
            type: 'boolean',
          },
          name: {
            description: "The company's name",
            title: 'Name',
            type: 'string',
          },
          summary: {
            description: 'What the company does',
            title: 'Summary',
            type: 'string',
          },
        },
        required: ['name', 'founded_on', 'is_public', 'summary', 'divisions'],
        title: 'results.Company',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.every_kind_result': {
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
      concept_ref: 'results.KitchenSink',
      item_count: null,
      json_schema: {
        description:
          'One structure carrying every scalar kind the standard defines, plus optionals a run may leave empty',
        properties: {
          abstract: {
            description: 'A paragraph of prose',
            title: 'Abstract',
            type: 'string',
          },
          aside: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'An optional note a run may leave empty',
            title: 'Aside',
          },
          confirmed: {
            description: 'A yes or no',
            title: 'Confirmed',
            type: 'boolean',
          },
          due_on: {
            description: 'A calendar date',
            format: 'date',
            title: 'Due On',
            type: 'string',
          },
          follow_up: {
            anyOf: [
              {
                format: 'date',
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'An optional date a run may leave empty',
            title: 'Follow Up',
          },
          priority: {
            description: 'One of a fixed set',
            enum: ['low', 'medium', 'high'],
            title: 'Priority',
            type: 'string',
          },
          quantity: {
            description: 'A whole number',
            title: 'Quantity',
            type: 'integer',
          },
          ratio: {
            description: 'A fractional number',
            title: 'Ratio',
            type: 'number',
          },
          tags: {
            description: 'A list of plain strings',
            items: {
              type: 'string',
            },
            title: 'Tags',
            type: 'array',
          },
          title: {
            description: 'A short label',
            title: 'Title',
            type: 'string',
          },
        },
        required: [
          'title',
          'abstract',
          'quantity',
          'ratio',
          'confirmed',
          'due_on',
          'priority',
          'tags',
        ],
        title: 'results.KitchenSink',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
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
      json_schema: {
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
        title: 'results.Sentiment',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.html_result': {
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
      concept_ref: 'native.Html',
      item_count: null,
      json_schema: {
        description: 'HTML content',
        properties: {
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
          inner_html: {
            description: 'The inner HTML of the content',
            title: 'Inner Html',
            type: 'string',
          },
        },
        required: ['inner_html'],
        title: 'native.Html',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.image_result': {
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
  'results.long_list_result': {
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
      concept_ref: 'results.Milestone',
      item_count: null,
      json_schema: {
        $defs: {
          results__Milestone: {
            description: 'One step of a project plan',
            properties: {
              label: {
                description: 'What happens',
                title: 'Label',
                type: 'string',
              },
              owner: {
                description: 'Who is accountable',
                title: 'Owner',
                type: 'string',
              },
              status: {
                description: 'Where it stands',
                enum: ['done', 'in_progress', 'blocked', 'not_started'],
                title: 'Status',
                type: 'string',
              },
              week: {
                description: 'Which week it falls in',
                title: 'Week',
                type: 'integer',
              },
            },
            required: ['label', 'week', 'owner', 'status'],
            title: 'results__Milestone',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/results__Milestone',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[results__Milestone]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'results.nested_media_result': {
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
      concept_ref: 'results.Report',
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
          HtmlContent: {
            description: 'HTML content',
            properties: {
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
              inner_html: {
                description: 'The inner HTML of the content',
                title: 'Inner Html',
                type: 'string',
              },
            },
            required: ['inner_html'],
            title: 'HtmlContent',
            type: 'object',
          },
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
          results__Figure: {
            description: 'One illustration with its caption',
            properties: {
              caption: {
                description: 'What the figure shows',
                title: 'Caption',
                type: 'string',
              },
              image: {
                $ref: '#/$defs/ImageContent',
                description: 'The picture itself',
              },
            },
            required: ['caption', 'image'],
            title: 'results__Figure',
            type: 'object',
          },
        },
        description: 'A report carrying markup, a source document and illustrated figures',
        properties: {
          figures: {
            description: 'The illustrations',
            items: {
              $ref: '#/$defs/results__Figure',
            },
            title: 'Figures',
            type: 'array',
          },
          source: {
            $ref: '#/$defs/DocumentContent',
            description: 'The document it was drawn from',
          },
          summary: {
            $ref: '#/$defs/HtmlContent',
            description: 'The summary, as markup',
          },
          title: {
            description: "The report's title",
            title: 'Title',
            type: 'string',
          },
        },
        required: ['title', 'summary', 'source', 'figures'],
        title: 'results.Report',
        type: 'object',
      },
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
      json_schema: {
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
        title: 'results.Invoice',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'results.number_result': {
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
      optional: false,
    },
  },
  'results.page_result': {
    inputs: {
      document: {
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
      concept_ref: 'native.Page',
      item_count: null,
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
          PageContent: {
            description:
              'The content of a page of a document, comprising text and linked images and an optional page view image',
            properties: {
              page_view: {
                anyOf: [
                  {
                    $ref: '#/$defs/ImageContent',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'The screenshot of the page',
              },
              text_and_images: {
                $ref: '#/$defs/TextAndImagesContent',
                description: 'The text and images content extracted from the page',
              },
            },
            required: ['text_and_images'],
            title: 'PageContent',
            type: 'object',
          },
          TextAndImagesContent: {
            properties: {
              images: {
                anyOf: [
                  {
                    items: {
                      $ref: '#/$defs/ImageContent',
                    },
                    type: 'array',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'A list of images that were extracted from the text',
                title: 'Images',
              },
              raw_html: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'The raw HTML of the fetched page, if requested',
                title: 'Raw Html',
              },
              text: {
                anyOf: [
                  {
                    $ref: '#/$defs/TextContent',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'A text content',
              },
            },
            title: 'TextAndImagesContent',
            type: 'object',
          },
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
              $ref: '#/$defs/PageContent',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[PageContent]',
        type: 'object',
      },
      multiplicity: 'variable',
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
      json_schema: {
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
      multiplicity: 'variable',
      optional: false,
    },
  },
  'results.yes_no_result': {
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
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'results.date_result': {
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
  'results.deep_result': {
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
  'results.every_kind_result': {
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
  'results.html_result': {
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
  'results.long_list_result': {
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
  'results.nested_media_result': {
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
  'results.number_result': {
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
  'results.page_result': {
    fields: [
      {
        concept_ref: 'native.Document',
        description: 'A document',
        gating: true,
        kind: 'document',
        name: 'document',
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
  'results.yes_no_result': {
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
  'results.date_result': {
    field: {
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
      name: 'output',
      required: true,
    },
  },
  'results.deep_result': {
    field: {
      concept_ref: 'results.Company',
      description: 'A company, described down to its people',
      fields: [
        {
          description: "The company's name",
          kind: 'text',
          name: 'name',
          required: true,
        },
        {
          datetime: false,
          description: 'When it was founded',
          kind: 'date',
          name: 'founded_on',
          required: true,
        },
        {
          description: 'Whether it is publicly traded',
          kind: 'boolean',
          name: 'is_public',
          required: true,
        },
        {
          description: 'What the company does',
          hints: {
            intent: 'prose',
          },
          kind: 'prose',
          name: 'summary',
          required: true,
        },
        {
          concept_ref: 'results.Division',
          description: 'Its divisions',
          item: {
            concept_ref: 'results.Division',
            description: 'A division of a company',
            fields: [
              {
                description: "The division's name",
                kind: 'text',
                name: 'name',
                required: true,
              },
              {
                choices: ['emea', 'americas', 'apac'],
                description: 'Where it operates',
                kind: 'enum',
                name: 'region',
                required: true,
              },
              {
                description: 'Its annual budget, in millions',
                integer: false,
                kind: 'number',
                name: 'budget',
                required: true,
              },
              {
                concept_ref: 'results.Team',
                description: 'The teams it holds',
                item: {
                  concept_ref: 'results.Team',
                  description: 'A team inside a division',
                  fields: [
                    {
                      description: "The team's name",
                      kind: 'text',
                      name: 'name',
                      required: true,
                    },
                    {
                      description: 'What the team is for',
                      hints: {
                        intent: 'prose',
                      },
                      kind: 'prose',
                      name: 'mission',
                      required: true,
                    },
                    {
                      description: 'How many people it holds',
                      integer: true,
                      kind: 'number',
                      name: 'headcount',
                      required: true,
                    },
                    {
                      concept_ref: 'results.TeamMember',
                      description: 'The people on it',
                      item: {
                        concept_ref: 'results.TeamMember',
                        description: 'One person on a team',
                        fields: [
                          {
                            description: 'Their name',
                            kind: 'text',
                            name: 'name',
                            required: true,
                          },
                          {
                            choices: ['engineer', 'designer', 'researcher', 'manager'],
                            description: 'What they do',
                            kind: 'enum',
                            name: 'role',
                            required: true,
                          },
                          {
                            datetime: false,
                            description: 'When they joined',
                            kind: 'date',
                            name: 'started_on',
                            required: true,
                          },
                          {
                            description: 'Whether they work remotely',
                            kind: 'boolean',
                            name: 'remote',
                            required: false,
                          },
                          {
                            description: 'What they spend their time on',
                            item: {
                              kind: 'text',
                              required: true,
                            },
                            kind: 'list',
                            name: 'focus_areas',
                            required: false,
                          },
                        ],
                        kind: 'object',
                        required: true,
                      },
                      kind: 'list',
                      name: 'members',
                      required: true,
                    },
                  ],
                  kind: 'object',
                  required: true,
                },
                kind: 'list',
                name: 'teams',
                required: true,
              },
            ],
            kind: 'object',
            required: true,
          },
          kind: 'list',
          name: 'divisions',
          required: true,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'results.every_kind_result': {
    field: {
      concept_ref: 'results.KitchenSink',
      description:
        'One structure carrying every scalar kind the standard defines, plus optionals a run may leave empty',
      fields: [
        {
          description: 'A short label',
          kind: 'text',
          name: 'title',
          required: true,
        },
        {
          description: 'A paragraph of prose',
          hints: {
            intent: 'prose',
          },
          kind: 'prose',
          name: 'abstract',
          required: true,
        },
        {
          description: 'A whole number',
          integer: true,
          kind: 'number',
          name: 'quantity',
          required: true,
        },
        {
          description: 'A fractional number',
          integer: false,
          kind: 'number',
          name: 'ratio',
          required: true,
        },
        {
          description: 'A yes or no',
          kind: 'boolean',
          name: 'confirmed',
          required: true,
        },
        {
          datetime: false,
          description: 'A calendar date',
          kind: 'date',
          name: 'due_on',
          required: true,
        },
        {
          choices: ['low', 'medium', 'high'],
          description: 'One of a fixed set',
          kind: 'enum',
          name: 'priority',
          required: true,
        },
        {
          description: 'A list of plain strings',
          item: {
            kind: 'text',
            required: true,
          },
          kind: 'list',
          name: 'tags',
          required: true,
        },
        {
          description: 'An optional note a run may leave empty',
          kind: 'text',
          name: 'aside',
          required: false,
        },
        {
          datetime: false,
          description: 'An optional date a run may leave empty',
          kind: 'date',
          name: 'follow_up',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
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
          hints: {
            intent: 'prose',
          },
          kind: 'prose',
          name: 'rationale',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'results.html_result': {
    field: {
      concept_ref: 'native.Html',
      description: 'HTML content',
      fields: [
        {
          description: 'The inner HTML of the content',
          kind: 'text',
          name: 'inner_html',
          required: true,
        },
        {
          description: 'The CSS class of the content',
          kind: 'text',
          name: 'css_class',
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
  'results.long_list_result': {
    field: {
      concept_ref: 'results.Milestone',
      description: 'One step of a project plan',
      item: {
        concept_ref: 'results.Milestone',
        description: 'One step of a project plan',
        fields: [
          {
            description: 'What happens',
            kind: 'text',
            name: 'label',
            required: true,
          },
          {
            description: 'Which week it falls in',
            integer: true,
            kind: 'number',
            name: 'week',
            required: true,
          },
          {
            description: 'Who is accountable',
            kind: 'text',
            name: 'owner',
            required: true,
          },
          {
            choices: ['done', 'in_progress', 'blocked', 'not_started'],
            description: 'Where it stands',
            kind: 'enum',
            name: 'status',
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
  'results.nested_media_result': {
    field: {
      concept_ref: 'results.Report',
      description: 'A report carrying markup, a source document and illustrated figures',
      fields: [
        {
          description: "The report's title",
          kind: 'text',
          name: 'title',
          required: true,
        },
        {
          concept_ref: 'native.Html',
          description: 'The summary, as markup',
          fields: [
            {
              description: 'The inner HTML of the content',
              kind: 'text',
              name: 'inner_html',
              required: true,
            },
            {
              description: 'The CSS class of the content',
              kind: 'text',
              name: 'css_class',
              required: false,
            },
          ],
          kind: 'object',
          name: 'summary',
          required: true,
        },
        {
          concept_ref: 'native.Document',
          description: 'The document it was drawn from',
          kind: 'document',
          name: 'source',
          required: true,
        },
        {
          concept_ref: 'results.Figure',
          description: 'The illustrations',
          item: {
            concept_ref: 'results.Figure',
            description: 'One illustration with its caption',
            fields: [
              {
                description: 'What the figure shows',
                kind: 'text',
                name: 'caption',
                required: true,
              },
              {
                concept_ref: 'native.Image',
                description: 'The picture itself',
                kind: 'image',
                name: 'image',
                required: true,
              },
            ],
            kind: 'object',
            required: true,
          },
          kind: 'list',
          name: 'figures',
          required: true,
        },
      ],
      kind: 'object',
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
  'results.number_result': {
    field: {
      concept_ref: 'native.Number',
      description: 'A number',
      integer: false,
      kind: 'number',
      name: 'output',
      required: true,
    },
  },
  'results.page_result': {
    field: {
      concept_ref: 'native.Page',
      description:
        'The content of a page of a document, comprising text and linked images and an optional page view image',
      item: {
        concept_ref: 'native.Page',
        description:
          'The content of a page of a document, comprising text and linked images and an optional page view image',
        fields: [
          {
            concept_ref: 'native.TextAndImages',
            description: 'The text and images content extracted from the page',
            fields: [
              {
                concept_ref: 'native.Text',
                description: 'A text content',
                kind: 'prose',
                name: 'text',
                required: false,
              },
              {
                concept_ref: 'native.Image',
                description: 'A list of images that were extracted from the text',
                item: {
                  concept_ref: 'native.Image',
                  description: 'An image',
                  kind: 'image',
                  required: true,
                },
                kind: 'list',
                name: 'images',
                required: false,
              },
              {
                description: 'The raw HTML of the fetched page, if requested',
                kind: 'text',
                name: 'raw_html',
                required: false,
              },
            ],
            kind: 'object',
            name: 'text_and_images',
            required: true,
          },
          {
            concept_ref: 'native.Image',
            description: 'The screenshot of the page',
            kind: 'image',
            name: 'page_view',
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
  'results.yes_no_result': {
    field: {
      concept_ref: 'native.YesNo',
      description: 'The answer to a yes/no question',
      kind: 'boolean',
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
  'results.date_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.deep_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.every_kind_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.flat_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.html_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.image_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.long_list_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.nested_media_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.nested_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.number_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.page_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.plain_text_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.plural_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'results.yes_no_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  'Concepts used as pipe OUTPUTS, so the fixtures can describe results as well as inputs — across every field kind, at depth, and at length.';
