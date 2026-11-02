/**
 * Generated from src/__stories__/_structures/search.mthds - DO NOT EDIT.
 *
 * A pipe whose RESULT is a search's answer with its sources, a `native.SearchResult`. The carrier is a `PipeSearch` stating its own prompt, so `make fixtures-runs` captures the answer the search provider wrote, with its inline citations, beside the web pages it cites, which is what the result view's search arm reads.
 *
 * Regenerate with `make fixtures`. The pipes below are synthesized carriers:
 * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.
 */
import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';

/** Every pipe_ref this case projects, in sorted order. */
export const PIPE_REFS = ['search.search_result'] as const;

export const CONTRACTS: PipeIOContracts = {
  'search.search_result': {
    inputs: {},
    output: {
      concept_ref: 'native.SearchResult',
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
        },
        description: 'A search result with answer and sources',
        properties: {
          answer: {
            description: 'The answer to the search query',
            title: 'Answer',
            type: 'string',
          },
          sources: {
            description: 'The source documents supporting the answer',
            items: {
              $ref: '#/$defs/DocumentContent',
            },
            title: 'Sources',
            type: 'array',
          },
        },
        required: ['answer'],
        title: 'native.SearchResult',
        type: 'object',
      },
      multiplicity: 'single',
      optional: false,
    },
  },
};

export const INPUT_FORM: InputForm = {
  'search.search_result': {
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
  'search.search_result': {
    field: {
      concept_ref: 'native.SearchResult',
      description: 'A search result with answer and sources',
      fields: [
        {
          description: 'The answer to the search query',
          kind: 'text',
          name: 'answer',
          required: true,
        },
        {
          concept_ref: 'native.Document',
          description: 'The source documents supporting the answer',
          item: {
            concept_ref: 'native.Document',
            description: 'A document',
            kind: 'document',
            required: true,
          },
          kind: 'list',
          name: 'sources',
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
  'search.search_result':
    'Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored.',
};

export const DOMAIN_DESCRIPTION: string | null =
  "A result that is a web search's answer with the sources it cites: the answer in Markdown, its inline citations, and the web pages the search returned beside it.";
