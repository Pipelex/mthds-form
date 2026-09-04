/**
 * Generated from data/methods/summarize_people/bundle.mthds - DO NOT EDIT.
 *
 * People summaries, an authored method. Copied verbatim from https://github.com/Pipelex/pipelex-cookbook/blob/4265d86a5551b788ccf1c7be5b00393e12c82aef/examples/b_basics/csv/summarize_people/summarize_people.mthds (MIT).
 *
 * Regenerate with `make fixtures`. The pipes below are the author's own,
 * projected from the bundle exactly as committed: nothing is synthesized.
 * See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'summarize_people.compose_person_summary',
  'summarize_people.describe_person',
  'summarize_people.summarize_people',
  'summarize_people.summarize_person',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'summarize_people.compose_person_summary': {
    inputs: {
      description: {
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
      person: {
        concept_ref: 'summarize_people.Person',
        item_count: null,
        json_schema: {
          description: 'A person record read from a CSV row',
          properties: {
            birth_year: {
              description: 'Year of birth',
              title: 'Birth Year',
              type: 'integer',
            },
            country: {
              description: 'Country of origin',
              title: 'Country',
              type: 'string',
            },
            death_year: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Year of death, if deceased',
              title: 'Death Year',
            },
            job: {
              description: 'Occupation',
              title: 'Job',
              type: 'string',
            },
            name: {
              description: 'Full name',
              title: 'Name',
              type: 'string',
            },
          },
          required: ['name', 'job', 'country', 'birth_year'],
          title: 'summarize_people.Person',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'summarize_people.PersonSummary',
      item_count: null,
      json_schema: {
        description: 'A person row reduced to name + country plus a one-sentence persona summary',
        properties: {
          country: {
            description: 'Country of origin',
            title: 'Country',
            type: 'string',
          },
          name: {
            description: 'Full name',
            title: 'Name',
            type: 'string',
          },
          summary: {
            description: 'One-sentence persona summary',
            title: 'Summary',
            type: 'string',
          },
        },
        required: ['name', 'country', 'summary'],
        title: 'summarize_people.PersonSummary',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'summarize_people.describe_person': {
    inputs: {
      person: {
        concept_ref: 'summarize_people.Person',
        item_count: null,
        json_schema: {
          description: 'A person record read from a CSV row',
          properties: {
            birth_year: {
              description: 'Year of birth',
              title: 'Birth Year',
              type: 'integer',
            },
            country: {
              description: 'Country of origin',
              title: 'Country',
              type: 'string',
            },
            death_year: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Year of death, if deceased',
              title: 'Death Year',
            },
            job: {
              description: 'Occupation',
              title: 'Job',
              type: 'string',
            },
            name: {
              description: 'Full name',
              title: 'Name',
              type: 'string',
            },
          },
          required: ['name', 'job', 'country', 'birth_year'],
          title: 'summarize_people.Person',
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
  'summarize_people.summarize_people': {
    inputs: {
      people: {
        concept_ref: 'summarize_people.Person',
        item_count: null,
        json_schema: {
          items: {
            description: 'A person record read from a CSV row',
            properties: {
              birth_year: {
                description: 'Year of birth',
                title: 'Birth Year',
                type: 'integer',
              },
              country: {
                description: 'Country of origin',
                title: 'Country',
                type: 'string',
              },
              death_year: {
                anyOf: [
                  {
                    type: 'integer',
                  },
                  {
                    type: 'null',
                  },
                ],
                default: null,
                description: 'Year of death, if deceased',
                title: 'Death Year',
              },
              job: {
                description: 'Occupation',
                title: 'Job',
                type: 'string',
              },
              name: {
                description: 'Full name',
                title: 'Name',
                type: 'string',
              },
            },
            required: ['name', 'job', 'country', 'birth_year'],
            title: 'summarize_people.Person',
            type: 'object',
          },
          type: 'array',
        },
        multiplicity: 'variable',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'summarize_people.PersonSummary',
      item_count: null,
      json_schema: {
        $defs: {
          summarize_people__PersonSummary: {
            description:
              'A person row reduced to name + country plus a one-sentence persona summary',
            properties: {
              country: {
                description: 'Country of origin',
                title: 'Country',
                type: 'string',
              },
              name: {
                description: 'Full name',
                title: 'Name',
                type: 'string',
              },
              summary: {
                description: 'One-sentence persona summary',
                title: 'Summary',
                type: 'string',
              },
            },
            required: ['name', 'country', 'summary'],
            title: 'summarize_people__PersonSummary',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/summarize_people__PersonSummary',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[summarize_people__PersonSummary]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
  'summarize_people.summarize_person': {
    inputs: {
      person: {
        concept_ref: 'summarize_people.Person',
        item_count: null,
        json_schema: {
          description: 'A person record read from a CSV row',
          properties: {
            birth_year: {
              description: 'Year of birth',
              title: 'Birth Year',
              type: 'integer',
            },
            country: {
              description: 'Country of origin',
              title: 'Country',
              type: 'string',
            },
            death_year: {
              anyOf: [
                {
                  type: 'integer',
                },
                {
                  type: 'null',
                },
              ],
              default: null,
              description: 'Year of death, if deceased',
              title: 'Death Year',
            },
            job: {
              description: 'Occupation',
              title: 'Job',
              type: 'string',
            },
            name: {
              description: 'Full name',
              title: 'Name',
              type: 'string',
            },
          },
          required: ['name', 'job', 'country', 'birth_year'],
          title: 'summarize_people.Person',
          type: 'object',
        },
        multiplicity: 'single',
        presence: 'plain',
      },
    },
    output: {
      concept_ref: 'summarize_people.PersonSummary',
      item_count: null,
      json_schema: {
        description: 'A person row reduced to name + country plus a one-sentence persona summary',
        properties: {
          country: {
            description: 'Country of origin',
            title: 'Country',
            type: 'string',
          },
          name: {
            description: 'Full name',
            title: 'Name',
            type: 'string',
          },
          summary: {
            description: 'One-sentence persona summary',
            title: 'Summary',
            type: 'string',
          },
        },
        required: ['name', 'country', 'summary'],
        title: 'summarize_people.PersonSummary',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'summarize_people.compose_person_summary': {
    fields: [
      {
        concept_ref: 'summarize_people.Person',
        description: 'A person record read from a CSV row',
        fields: [
          {
            description: 'Full name',
            kind: 'text',
            name: 'name',
            required: true,
          },
          {
            description: 'Occupation',
            kind: 'text',
            name: 'job',
            required: true,
          },
          {
            description: 'Country of origin',
            kind: 'text',
            name: 'country',
            required: true,
          },
          {
            description: 'Year of birth',
            integer: true,
            kind: 'number',
            name: 'birth_year',
            required: true,
          },
          {
            description: 'Year of death, if deceased',
            integer: true,
            kind: 'number',
            name: 'death_year',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'person',
        presence: 'plain',
        required: true,
      },
      {
        concept_ref: 'native.Text',
        description: 'A text',
        gating: true,
        kind: 'prose',
        name: 'description',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'summarize_people.describe_person': {
    fields: [
      {
        concept_ref: 'summarize_people.Person',
        description: 'A person record read from a CSV row',
        fields: [
          {
            description: 'Full name',
            kind: 'text',
            name: 'name',
            required: true,
          },
          {
            description: 'Occupation',
            kind: 'text',
            name: 'job',
            required: true,
          },
          {
            description: 'Country of origin',
            kind: 'text',
            name: 'country',
            required: true,
          },
          {
            description: 'Year of birth',
            integer: true,
            kind: 'number',
            name: 'birth_year',
            required: true,
          },
          {
            description: 'Year of death, if deceased',
            integer: true,
            kind: 'number',
            name: 'death_year',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'person',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'summarize_people.summarize_people': {
    fields: [
      {
        concept_ref: 'summarize_people.Person',
        description: 'A person record read from a CSV row',
        gating: false,
        item: {
          concept_ref: 'summarize_people.Person',
          description: 'A person record read from a CSV row',
          fields: [
            {
              description: 'Full name',
              kind: 'text',
              name: 'name',
              required: true,
            },
            {
              description: 'Occupation',
              kind: 'text',
              name: 'job',
              required: true,
            },
            {
              description: 'Country of origin',
              kind: 'text',
              name: 'country',
              required: true,
            },
            {
              description: 'Year of birth',
              integer: true,
              kind: 'number',
              name: 'birth_year',
              required: true,
            },
            {
              description: 'Year of death, if deceased',
              integer: true,
              kind: 'number',
              name: 'death_year',
              required: false,
            },
          ],
          kind: 'object',
          required: true,
        },
        kind: 'list',
        name: 'people',
        presence: 'plain',
        required: true,
      },
    ],
  },
  'summarize_people.summarize_person': {
    fields: [
      {
        concept_ref: 'summarize_people.Person',
        description: 'A person record read from a CSV row',
        fields: [
          {
            description: 'Full name',
            kind: 'text',
            name: 'name',
            required: true,
          },
          {
            description: 'Occupation',
            kind: 'text',
            name: 'job',
            required: true,
          },
          {
            description: 'Country of origin',
            kind: 'text',
            name: 'country',
            required: true,
          },
          {
            description: 'Year of birth',
            integer: true,
            kind: 'number',
            name: 'birth_year',
            required: true,
          },
          {
            description: 'Year of death, if deceased',
            integer: true,
            kind: 'number',
            name: 'death_year',
            required: false,
          },
        ],
        gating: true,
        kind: 'object',
        name: 'person',
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
  'summarize_people.compose_person_summary': {
    field: {
      concept_ref: 'summarize_people.PersonSummary',
      description: 'A person row reduced to name + country plus a one-sentence persona summary',
      fields: [
        {
          description: 'Full name',
          kind: 'text',
          name: 'name',
          required: true,
        },
        {
          description: 'Country of origin',
          kind: 'text',
          name: 'country',
          required: true,
        },
        {
          description: 'One-sentence persona summary',
          kind: 'text',
          name: 'summary',
          required: true,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'summarize_people.describe_person': {
    field: {
      concept_ref: 'native.Text',
      description: 'A text',
      kind: 'prose',
      name: 'output',
      required: true,
    },
  },
  'summarize_people.summarize_people': {
    field: {
      concept_ref: 'summarize_people.PersonSummary',
      description: 'A person row reduced to name + country plus a one-sentence persona summary',
      item: {
        concept_ref: 'summarize_people.PersonSummary',
        description: 'A person row reduced to name + country plus a one-sentence persona summary',
        fields: [
          {
            description: 'Full name',
            kind: 'text',
            name: 'name',
            required: true,
          },
          {
            description: 'Country of origin',
            kind: 'text',
            name: 'country',
            required: true,
          },
          {
            description: 'One-sentence persona summary',
            kind: 'text',
            name: 'summary',
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
  'summarize_people.summarize_person': {
    field: {
      concept_ref: 'summarize_people.PersonSummary',
      description: 'A person row reduced to name + country plus a one-sentence persona summary',
      fields: [
        {
          description: 'Full name',
          kind: 'text',
          name: 'name',
          required: true,
        },
        {
          description: 'Country of origin',
          kind: 'text',
          name: 'country',
          required: true,
        },
        {
          description: 'One-sentence persona summary',
          kind: 'text',
          name: 'summary',
          required: true,
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
  'summarize_people.compose_person_summary':
    'Build the summary row from selected Person fields plus the generated description',
  'summarize_people.describe_person': 'Write a one-sentence persona summary for a person',
  'summarize_people.summarize_people': 'Summarize each person in the list',
  'summarize_people.summarize_person': 'Describe one person, then compose their summary row',
};

export const DOMAIN_DESCRIPTION: string | null =
  'Read people from a CSV, summarize each as a one-sentence persona, and write the result back to CSV';
