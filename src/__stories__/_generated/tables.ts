/**
 * Generated from data/structures/tables.mthds - DO NOT EDIT.
 *
 * Record lists whose values press on the table's own rules rather than on the choice of a table. A link checker's report is a table whose name column holds web addresses: each one a single token, and some of them longer than any panel is wide, which is the value the name cell has to wrap without widening the table. Every pipe runs for real.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = ['tables.links'] as const;

export const CONTRACTS: PipeIOContracts = {
  'tables.links': {
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
      concept_ref: 'tables.Link',
      item_count: null,
      json_schema: {
        $defs: {
          tables__Link: {
            description:
              'One checked link — a record whose name is a full web address, one long token with no space to wrap at',
            properties: {
              checked_on: {
                description: 'When it was checked',
                format: 'date',
                title: 'Checked On',
                type: 'string',
              },
              response_ms: {
                description: 'How long the page took to answer, in milliseconds',
                title: 'Response Ms',
                type: 'integer',
              },
              status: {
                description: 'What the check found',
                enum: ['up', 'redirect', 'down'],
                title: 'Status',
                type: 'string',
              },
              url: {
                description:
                  "The page's full address, exactly as it would be pasted into a browser",
                title: 'Url',
                type: 'string',
              },
            },
            required: ['url', 'status', 'checked_on', 'response_ms'],
            title: 'tables__Link',
            type: 'object',
          },
        },
        properties: {
          items: {
            items: {
              $ref: '#/$defs/tables__Link',
            },
            title: 'Items',
            type: 'array',
          },
        },
        required: ['items'],
        title: 'ListContent[tables__Link]',
        type: 'object',
      },
      multiplicity: 'variable',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'tables.links': {
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
  'tables.links': {
    field: {
      concept_ref: 'tables.Link',
      description:
        'One checked link — a record whose name is a full web address, one long token with no space to wrap at',
      item: {
        concept_ref: 'tables.Link',
        description:
          'One checked link — a record whose name is a full web address, one long token with no space to wrap at',
        fields: [
          {
            description: "The page's full address, exactly as it would be pasted into a browser",
            kind: 'text',
            name: 'url',
            required: true,
          },
          {
            choices: ['up', 'redirect', 'down'],
            description: 'What the check found',
            kind: 'enum',
            name: 'status',
            required: true,
          },
          {
            datetime: false,
            description: 'When it was checked',
            kind: 'date',
            name: 'checked_on',
            required: true,
          },
          {
            description: 'How long the page took to answer, in milliseconds',
            integer: true,
            kind: 'number',
            name: 'response_ms',
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
};

/**
 * What the author wrote about each pipe - its `description` - and about the
 * bundle. No validate artifact carries either, and an authored method's brief
 * opens with the pipe's: it is what a host would have. On a structures case
 * every entry is the synthesized carrier's line, and the hero states its own.
 */
export const PIPE_DESCRIPTIONS: Record<string, string> = {
  'tables.links': 'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  'Concepts whose lists exercise the rules of a record TABLE rather than the choice of one — what a cell does with a value that does not fit it.';
