/**
 * Generated from data/methods/plan_trip/bundle.mthds - DO NOT EDIT.
 *
 * Trip planner, an authored method. Copied verbatim from https://github.com/Pipelex/mthds-form/blob/dev/data/methods/plan_trip/bundle.mthds (MIT).
 *
 * Regenerate with `make fixtures`. The pipes below are the author's own,
 * projected from the bundle exactly as committed: nothing is synthesized.
 * See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = ['trip_planner.plan_trip'] as const;

export const CONTRACTS: PipeIOContracts = {
  'trip_planner.plan_trip': {
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
        concept_ref: 'trip_planner.TripRequest',
        item_count: null,
        json_schema: {
          $defs: {
            trip_planner__Stay: {
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
              title: 'trip_planner__Stay',
              type: 'object',
            },
            trip_planner__Traveller: {
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
              title: 'trip_planner__Traveller',
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
              $ref: '#/$defs/trip_planner__Stay',
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
                $ref: '#/$defs/trip_planner__Traveller',
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
          title: 'trip_planner.TripRequest',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'trip_planner.Itinerary',
      item_count: null,
      json_schema: {
        $defs: {
          trip_planner__CostLine: {
            description: 'One line of the estimated cost',
            properties: {
              amount: {
                description: "The estimated amount, in the trip's currency",
                title: 'Amount',
                type: 'number',
              },
              category: {
                description: 'What the money goes on',
                enum: ['stay', 'food', 'tickets', 'transport', 'buffer'],
                title: 'Category',
                type: 'string',
              },
            },
            required: ['category', 'amount'],
            title: 'trip_planner__CostLine',
            type: 'object',
          },
          trip_planner__DayPlan: {
            description: 'One day of the trip',
            properties: {
              afternoon: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'What to do in the afternoon',
                title: 'Afternoon',
              },
              day: {
                description: 'The day',
                format: 'date',
                title: 'Day',
                type: 'string',
              },
              evening: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'What to do in the evening',
                title: 'Evening',
              },
              midday: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Where and what to eat at midday',
                title: 'Midday',
              },
              morning: {
                anyOf: [
                  {
                    type: 'string',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'What to do in the morning',
                title: 'Morning',
              },
              title: {
                description: 'What the day is about, in a few words',
                title: 'Title',
                type: 'string',
              },
            },
            required: ['day', 'title'],
            title: 'trip_planner__DayPlan',
            type: 'object',
          },
        },
        description: 'A day-by-day plan for a trip, with its estimated cost',
        properties: {
          costs: {
            description: 'The estimated cost, by category',
            items: {
              $ref: '#/$defs/trip_planner__CostLine',
            },
            title: 'Costs',
            type: 'array',
          },
          currency: {
            description: 'The currency of every amount',
            title: 'Currency',
            type: 'string',
          },
          days: {
            description: 'The plan for each day, in order',
            items: {
              $ref: '#/$defs/trip_planner__DayPlan',
            },
            title: 'Days',
            type: 'array',
          },
          estimated_total: {
            description: 'The estimated total cost of the trip',
            title: 'Estimated Total',
            type: 'number',
          },
          overview: {
            description: 'The plan in two or three sentences',
            title: 'Overview',
            type: 'string',
          },
          practical_notes: {
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
            description: 'Notes for getting around and staying comfortable',
            title: 'Practical Notes',
          },
          title: {
            description: "The trip's name",
            title: 'Title',
            type: 'string',
          },
        },
        required: ['title', 'overview', 'days', 'costs', 'estimated_total', 'currency'],
        title: 'trip_planner.Itinerary',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'trip_planner.plan_trip': {
    fields: [
      {
        concept_ref: 'trip_planner.TripRequest',
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
            concept_ref: 'trip_planner.Stay',
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
            concept_ref: 'trip_planner.Traveller',
            description: 'Who is going',
            item: {
              concept_ref: 'trip_planner.Traveller',
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
  'trip_planner.plan_trip': {
    field: {
      concept_ref: 'trip_planner.Itinerary',
      description: 'A day-by-day plan for a trip, with its estimated cost',
      fields: [
        {
          description: "The trip's name",
          kind: 'text',
          name: 'title',
          required: true,
        },
        {
          description: 'The plan in two or three sentences',
          kind: 'text',
          name: 'overview',
          required: true,
        },
        {
          concept_ref: 'trip_planner.DayPlan',
          description: 'The plan for each day, in order',
          item: {
            concept_ref: 'trip_planner.DayPlan',
            description: 'One day of the trip',
            fields: [
              {
                datetime: false,
                description: 'The day',
                kind: 'date',
                name: 'day',
                required: true,
              },
              {
                description: 'What the day is about, in a few words',
                kind: 'text',
                name: 'title',
                required: true,
              },
              {
                description: 'What to do in the morning',
                kind: 'text',
                name: 'morning',
                required: false,
              },
              {
                description: 'Where and what to eat at midday',
                kind: 'text',
                name: 'midday',
                required: false,
              },
              {
                description: 'What to do in the afternoon',
                kind: 'text',
                name: 'afternoon',
                required: false,
              },
              {
                description: 'What to do in the evening',
                kind: 'text',
                name: 'evening',
                required: false,
              },
            ],
            kind: 'object',
            required: true,
          },
          kind: 'list',
          name: 'days',
          required: true,
        },
        {
          concept_ref: 'trip_planner.CostLine',
          description: 'The estimated cost, by category',
          item: {
            concept_ref: 'trip_planner.CostLine',
            description: 'One line of the estimated cost',
            fields: [
              {
                choices: ['stay', 'food', 'tickets', 'transport', 'buffer'],
                description: 'What the money goes on',
                kind: 'enum',
                name: 'category',
                required: true,
              },
              {
                description: "The estimated amount, in the trip's currency",
                integer: false,
                kind: 'number',
                name: 'amount',
                required: true,
              },
            ],
            kind: 'object',
            required: true,
          },
          kind: 'list',
          name: 'costs',
          required: true,
        },
        {
          description: 'The estimated total cost of the trip',
          integer: false,
          kind: 'number',
          name: 'estimated_total',
          required: true,
        },
        {
          description: 'The currency of every amount',
          kind: 'text',
          name: 'currency',
          required: true,
        },
        {
          description: 'Notes for getting around and staying comfortable',
          item: {
            kind: 'text',
            required: true,
          },
          kind: 'list',
          name: 'practical_notes',
          required: false,
        },
      ],
      kind: 'object',
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
  'trip_planner.plan_trip': 'Plan the trip day by day, within the budget',
};

export const DOMAIN_DESCRIPTION: string | null =
  'Plans a trip day by day from who is going, where and when, the budget and the spirit of it.';
