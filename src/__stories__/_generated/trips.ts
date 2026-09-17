/**
 * Generated from data/structures/trips.mthds - DO NOT EDIT.
 *
 * The trip planner's input side: one structure with every app-shaped control's natural home, plus an optional photo for the mood.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = ['trips.plan_trip'] as const;

export const CONTRACTS: PipeIOContracts = {
  'trips.plan_trip': {
    inputs: {
      inspiration: {
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
        presence: 'optional',
      },
      request: {
        concept_ref: 'trips.TripRequest',
        item_count: null,
        json_schema: {
          $defs: {
            trips__Stay: {
              description: 'Where and when the trip takes place',
              properties: {
                arriving_on: {
                  description: 'The day they arrive',
                  format: 'date',
                  title: 'Arriving On',
                  type: 'string',
                },
                city: {
                  description: 'The city',
                  title: 'City',
                  type: 'string',
                },
                country: {
                  description: 'The country',
                  enum: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
                  title: 'Country',
                  type: 'string',
                },
                leaving_on: {
                  description: 'The day they leave',
                  format: 'date',
                  title: 'Leaving On',
                  type: 'string',
                },
                must_see: {
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
                  description: 'Places they must not miss',
                  title: 'Must See',
                },
              },
              required: ['city', 'country', 'arriving_on', 'leaving_on'],
              title: 'trips__Stay',
              type: 'object',
            },
            trips__Traveller: {
              description: 'One person on the trip',
              properties: {
                age: {
                  anyOf: [
                    {
                      type: 'integer',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Their age',
                  title: 'Age',
                },
                dietary: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'null',
                    },
                  ],
                  default: null,
                  description: 'Dietary needs, if any',
                  title: 'Dietary',
                },
                name: {
                  description: 'Their name',
                  title: 'Name',
                  type: 'string',
                },
              },
              required: ['name'],
              title: 'trips__Traveller',
              type: 'object',
            },
          },
          description: 'Everything the planner needs to draft an itinerary',
          properties: {
            accessibility: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Mobility or accessibility needs the plan must respect',
              title: 'Accessibility',
            },
            budget: {
              description: 'The total budget for the whole trip',
              title: 'Budget',
              type: 'number',
            },
            currency: {
              description: 'The currency the budget is in',
              enum: ['EUR', 'USD', 'GBP', 'JPY'],
              title: 'Currency',
              type: 'string',
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
              description: 'Anything else the planner should know',
              title: 'Notes',
            },
            pace: {
              description: 'How full the days should be',
              enum: ['slow', 'balanced', 'packed'],
              title: 'Pace',
              type: 'string',
            },
            stay: {
              $ref: '#/$defs/trips__Stay',
              description: 'Where and when',
            },
            style: {
              description: 'What the trip is mostly about',
              enum: ['culture', 'food', 'nature', 'nightlife', 'family'],
              title: 'Style',
              type: 'string',
            },
            title: {
              description: 'A name for the trip',
              title: 'Title',
              type: 'string',
            },
            travellers: {
              description: 'Who is going',
              items: {
                $ref: '#/$defs/trips__Traveller',
              },
              title: 'Travellers',
              type: 'array',
            },
            with_children: {
              anyOf: [
                {
                  type: 'boolean',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Whether children are travelling',
              title: 'With Children',
            },
          },
          required: ['title', 'stay', 'travellers', 'budget', 'currency', 'pace', 'style'],
          title: 'trips.TripRequest',
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
};

export const INPUT_FORM: InputForm = {
  'trips.plan_trip': {
    fields: [
      {
        concept_ref: 'trips.TripRequest',
        description: 'Everything the planner needs to draft an itinerary',
        fields: [
          {
            description: 'A name for the trip',
            hints: {
              intent: 'label',
            },
            kind: 'text',
            name: 'title',
            required: true,
          },
          {
            concept_ref: 'trips.Stay',
            description: 'Where and when',
            fields: [
              {
                description: 'The city',
                hints: {
                  intent: 'label',
                },
                kind: 'text',
                name: 'city',
                required: true,
              },
              {
                choices: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
                description: 'The country',
                kind: 'enum',
                name: 'country',
                required: true,
              },
              {
                datetime: false,
                description: 'The day they arrive',
                kind: 'date',
                name: 'arriving_on',
                required: true,
              },
              {
                datetime: false,
                description: 'The day they leave',
                kind: 'date',
                name: 'leaving_on',
                required: true,
              },
              {
                description: 'Places they must not miss',
                item: {
                  kind: 'text',
                  required: true,
                },
                kind: 'list',
                name: 'must_see',
                required: false,
              },
            ],
            kind: 'object',
            name: 'stay',
            required: true,
          },
          {
            concept_ref: 'trips.Traveller',
            description: 'Who is going',
            item: {
              concept_ref: 'trips.Traveller',
              description: 'One person on the trip',
              fields: [
                {
                  description: 'Their name',
                  hints: {
                    intent: 'label',
                  },
                  kind: 'text',
                  name: 'name',
                  required: true,
                },
                {
                  description: 'Their age',
                  hints: {
                    intent: 'quantity',
                  },
                  integer: true,
                  kind: 'number',
                  name: 'age',
                  required: false,
                },
                {
                  description: 'Dietary needs, if any',
                  kind: 'text',
                  name: 'dietary',
                  required: false,
                },
              ],
              kind: 'object',
              required: true,
            },
            kind: 'list',
            name: 'travellers',
            required: true,
          },
          {
            description: 'The total budget for the whole trip',
            hints: {
              intent: 'quantity',
            },
            integer: false,
            kind: 'number',
            name: 'budget',
            required: true,
          },
          {
            choices: ['EUR', 'USD', 'GBP', 'JPY'],
            description: 'The currency the budget is in',
            kind: 'enum',
            name: 'currency',
            required: true,
          },
          {
            choices: ['slow', 'balanced', 'packed'],
            description: 'How full the days should be',
            kind: 'enum',
            name: 'pace',
            required: true,
          },
          {
            choices: ['culture', 'food', 'nature', 'nightlife', 'family'],
            description: 'What the trip is mostly about',
            kind: 'enum',
            name: 'style',
            required: true,
          },
          {
            description: 'Whether children are travelling',
            kind: 'boolean',
            name: 'with_children',
            required: false,
          },
          {
            description: 'Mobility or accessibility needs the plan must respect',
            kind: 'text',
            name: 'accessibility',
            required: false,
          },
          {
            description: 'Anything else the planner should know',
            hints: {
              intent: 'prose',
            },
            kind: 'prose',
            name: 'notes',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'request',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Image',
        description: 'An image',
        gating: false,
        kind: 'image',
        name: 'inspiration',
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
  'trips.plan_trip': {
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
  'trips.plan_trip': 'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  'A trip request - who is going, where and when, with what budget and in what spirit. The input side of an itinerary planner: the richest form in the corpus, and the one a person expects to look designed.';
