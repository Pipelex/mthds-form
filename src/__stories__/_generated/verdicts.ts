/**
 * Generated from src/__stories__/_structures/verdicts.mthds - DO NOT EDIT.
 *
 * Pipes whose RESULT is a verdict: a yes or no, a rating on a scale of described levels, and one option of a declared set. Each carrier is a `PipeJudge` stating its own prompt and its question, so `make fixtures-runs` captures the verdict with the measures a judge writes beside it (a probability, a confidence, a distribution), which is what the result view's verdict arms read. A judge names the deck's judgment model, `@default-judgment`, so the descriptor pass needs a deck that knows it.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = [
  'verdicts.choice_verdict',
  'verdicts.rating_verdict',
  'verdicts.yes_no_verdict',
] as const;

export const CONTRACTS: PipeIOContracts = {
  'verdicts.choice_verdict': {
    inputs: {},
    output: {
      concept_ref: 'native.Choice',
      item_count: null,
      json_schema: {
        description: 'One option picked out of a declared set',
        properties: {
          choice: {
            description: 'The key of the selected option.',
            title: 'Choice',
            type: 'string',
          },
          confidence: {
            anyOf: [
              {
                maximum: 1,
                minimum: 0,
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              "The producer's confidence in the choice, from 0 to 1, when it reports one.",
            title: 'Confidence',
          },
          probabilities: {
            anyOf: [
              {
                additionalProperties: {
                  maximum: 1,
                  minimum: 0,
                  type: 'number',
                },
                type: 'object',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The probability of each option, keyed by option key, when the producer measures a distribution.',
            title: 'Probabilities',
          },
        },
        required: ['choice'],
        title: 'native.Choice',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'verdicts.rating_verdict': {
    inputs: {},
    output: {
      concept_ref: 'native.Rating',
      item_count: null,
      json_schema: {
        description: 'A position on an ordered scale of described levels',
        properties: {
          confidence: {
            anyOf: [
              {
                maximum: 1,
                minimum: 0,
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              "The producer's confidence in the level, from 0 to 1, when it reports one.",
            title: 'Confidence',
          },
          label: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description: 'The label of the selected level, when the scale declares labels.',
            title: 'Label',
          },
          level: {
            description: 'The index of the selected level, 0 being the first level declared.',
            minimum: 0,
            title: 'Level',
            type: 'integer',
          },
          position: {
            anyOf: [
              {
                minimum: 0,
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'A continuous position on the scale, from 0 to the index of the last level, when the producer measures one.',
            title: 'Position',
          },
          probabilities: {
            anyOf: [
              {
                additionalProperties: {
                  maximum: 1,
                  minimum: 0,
                  type: 'number',
                },
                type: 'object',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The probability of each level, keyed by level index written as text, when the producer measures a distribution.',
            title: 'Probabilities',
          },
        },
        required: ['level'],
        title: 'native.Rating',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
  'verdicts.yes_no_verdict': {
    inputs: {},
    output: {
      concept_ref: 'native.YesNo',
      item_count: null,
      json_schema: {
        description: 'The answer to a yes/no question',
        properties: {
          probability: {
            anyOf: [
              {
                maximum: 1,
                minimum: 0,
                type: 'number',
              },
              {
                type: 'null',
              },
            ],
            default: null,
            description:
              'The probability that the answer is yes, from 0 to 1, when the producer reports one.',
            title: 'Probability',
          },
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
  'verdicts.choice_verdict': {
    fields: [],
  },
  'verdicts.rating_verdict': {
    fields: [],
  },
  'verdicts.yes_no_verdict': {
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
  'verdicts.choice_verdict': {
    field: {
      concept_ref: 'native.Choice',
      description: 'One option picked out of a declared set',
      fields: [
        {
          description: 'The key of the selected option.',
          kind: 'text',
          name: 'choice',
          required: true,
        },
        {
          description: "The producer's confidence in the choice, from 0 to 1, when it reports one.",
          integer: false,
          kind: 'number',
          name: 'confidence',
          required: false,
        },
        {
          description:
            'The probability of each option, keyed by option key, when the producer measures a distribution.',
          kind: 'unknown',
          name: 'probabilities',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'verdicts.rating_verdict': {
    field: {
      concept_ref: 'native.Rating',
      description: 'A position on an ordered scale of described levels',
      fields: [
        {
          description: 'The index of the selected level, 0 being the first level declared.',
          integer: true,
          kind: 'number',
          name: 'level',
          required: true,
        },
        {
          description: 'The label of the selected level, when the scale declares labels.',
          kind: 'text',
          name: 'label',
          required: false,
        },
        {
          description: "The producer's confidence in the level, from 0 to 1, when it reports one.",
          integer: false,
          kind: 'number',
          name: 'confidence',
          required: false,
        },
        {
          description:
            'The probability of each level, keyed by level index written as text, when the producer measures a distribution.',
          kind: 'unknown',
          name: 'probabilities',
          required: false,
        },
        {
          description:
            'A continuous position on the scale, from 0 to the index of the last level, when the producer measures one.',
          integer: false,
          kind: 'number',
          name: 'position',
          required: false,
        },
      ],
      kind: 'object',
      name: 'output',
      required: true,
    },
  },
  'verdicts.yes_no_verdict': {
    field: {
      concept_ref: 'native.YesNo',
      description: 'The answer to a yes/no question',
      fields: [
        {
          description: 'Whether the answer is yes (true) or no (false).',
          kind: 'boolean',
          name: 'yes_no',
          required: true,
        },
        {
          description:
            'The probability that the answer is yes, from 0 to 1, when the producer reports one.',
          integer: false,
          kind: 'number',
          name: 'probability',
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
  'verdicts.choice_verdict':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'verdicts.rating_verdict':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
  'verdicts.yes_no_verdict':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  'Results that are a verdict rather than a record: a yes or no, a rating on a scale of described levels, and one option of a declared set, each as a judge returns it, measures included.';
