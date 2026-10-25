import type { ExampleSource, FormExample, SourceFile } from '../core';
import {
  apiInputsFromRunValues,
  buildRunFields,
  getPipeInputForm,
  getPipeIOContract,
} from '../core';
import type { FilePickerSource } from '../react';
import {
  CONTRACTS as STRUCTURED_CONTRACTS,
  INPUT_FORM as STRUCTURED_INPUT_FORM,
} from './_generated/structured';

/**
 * A host's own records behind the form's two source seams: a team's files and
 * a method's saved examples, and the sources that answer with them in each of
 * the states a story shows.
 *
 * They are not a fixture of the standard. No projection of a method produces
 * a host's file record or its list of examples, so there is nothing to
 * generate them from, and they are written once, here, in the shapes the seams
 * declare (`src/core/sources.ts`, and `./react`'s `FilePickerSource` for a
 * source whose rows carry the host's own fields), for every story that opens a
 * sheet: `Inputs/Team Files and Examples` and `Toolchain/Role Tokens`. What an
 * example holds is not written by hand: it is made the way a form makes it,
 * from the generated contract.
 */

/**
 * A host's own row: the kernel's `SourceFile`, with whether the person made
 * the file and the host's own key for its type, which its glyphs are chosen by.
 */
export type TeamFile = SourceFile & { mine: boolean; format: 'pdf' | 'image' };

/** A team's files, newest first, as a host keeps them. */
const TEAM_FILES: TeamFile[] = [
  {
    id: 'fl_7',
    url: 'pipelex-storage://team/assets/inv-2291.pdf',
    name: 'INV-2291.pdf',
    mediaType: 'application/pdf',
    format: 'pdf',
    size: 348_160,
    kind: 'uploaded',
    origin: 'Uploaded by you',
    createdAt: '2025-10-17T09:12:00Z',
    mine: true,
  },
  {
    id: 'fl_6',
    url: 'pipelex-storage://team/assets/contract-acme-draft.pdf',
    name: 'contract-acme-draft.pdf',
    mediaType: 'application/pdf',
    format: 'pdf',
    size: 1_258_291,
    kind: 'test',
    origin: 'Made by the build assistant',
    createdAt: '2025-10-16T15:40:00Z',
    mine: false,
  },
  {
    id: 'fl_5',
    url: 'pipelex-storage://team/assets/receipt-scan.png',
    name: 'receipt-scan.png',
    mediaType: 'image/png',
    format: 'image',
    size: 912_384,
    kind: 'uploaded',
    origin: 'Uploaded by Ana',
    createdAt: '2025-10-14T11:03:00Z',
    mine: false,
  },
  {
    id: 'fl_4',
    url: 'pipelex-storage://team/assets/summary-q3.pdf',
    name: 'summary-q3.pdf',
    mediaType: 'application/pdf',
    format: 'pdf',
    size: 88_064,
    kind: 'generated',
    origin: 'Made by Invoice check',
    createdAt: '2025-10-02T08:30:00Z',
    mine: true,
  },
  {
    id: 'fl_3',
    url: 'pipelex-storage://team/assets/inv-2288.pdf',
    name: 'INV-2288.pdf',
    mediaType: 'application/pdf',
    format: 'pdf',
    size: 301_056,
    kind: 'uploaded',
    origin: 'Uploaded by Ana',
    createdAt: '2025-09-24T16:21:00Z',
    mine: false,
  },
  {
    id: 'fl_2',
    url: 'pipelex-storage://team/assets/storefront.jpg',
    name: 'storefront.jpg',
    mediaType: 'image/jpeg',
    format: 'image',
    size: 2_411_725,
    kind: 'uploaded',
    origin: 'Uploaded by you',
    createdAt: '2025-08-30T10:00:00Z',
    mine: true,
  },
  {
    id: 'fl_1',
    url: 'pipelex-storage://team/assets/inv-2101.pdf',
    name: 'INV-2101.pdf',
    mediaType: 'application/pdf',
    format: 'pdf',
    size: 296_960,
    kind: 'uploaded',
    origin: 'Uploaded by Ana',
    createdAt: '2025-06-11T13:45:00Z',
    mine: false,
  },
];

/** A page holds four rows, so the team's files run to a second page. */
const PAGE_SIZE = 4;

/** What the file source answers: the team's files, nothing, a failure, or no answer yet. */
export type FilesAnswer = 'team' | 'none' | 'failure' | 'waiting';

/** The host's word for each of its types, as its own list of files says it. */
const TYPE_WORDS: Record<TeamFile['format'], string> = {
  pdf: 'PDF document',
  image: 'Picture',
};

/**
 * The team's files as a source answers with them. `words` is whose words say
 * a row's type: the kernel's (the format's label, "PDF") or the host's own
 * (`typeLabel`, "PDF document"). The glyph a host draws is a rendering, so a
 * story adds `renderGlyph` itself.
 */
export function fileSourceOf(
  answer: FilesAnswer,
  initialScope: 'mine' | 'everyone',
  words: 'kernel' | 'host' = 'kernel',
): FilePickerSource<TeamFile> {
  return {
    initialScope,
    list: async ({ search, scope, mediaTypes, cursor }) => {
      if (answer === 'waiting') return new Promise(() => undefined);
      if (answer === 'failure') throw new Error('The host could not list its files.');
      const needle = search.toLowerCase();
      const matching = (answer === 'team' ? TEAM_FILES : []).filter(
        (file) =>
          (scope === 'everyone' || file.mine) &&
          (mediaTypes.length === 0 || mediaTypes.includes(file.mediaType ?? '')) &&
          file.name.toLowerCase().includes(needle),
      );
      const start = cursor === undefined ? 0 : Number(cursor);
      const end = start + PAGE_SIZE;
      const page = matching.slice(start, end);
      return {
        files:
          words === 'host'
            ? page.map((file) => ({ ...file, typeLabel: TYPE_WORDS[file.format] }))
            : page,
        nextCursor: end < matching.length ? String(end) : null,
      };
    },
  };
}

/**
 * Two saved runs of the address form. A host stores an example as the inputs a
 * run was started with, so these are made the way a form makes them, by
 * `apiInputsFromRunValues` over the generated contract, from values a person
 * could have typed. Writing the run-input envelopes out by hand would be
 * writing a payload the standard owns.
 */
const EXAMPLES: FormExample[] = (() => {
  const contract = getPipeIOContract(STRUCTURED_CONTRACTS, 'structured', 'flat_object');
  const descriptor = getPipeInputForm(STRUCTURED_INPUT_FORM, 'structured', 'flat_object');
  if (!contract || !descriptor) throw new Error('No fixture entry for structured.flat_object.');
  const fields = buildRunFields(descriptor, contract.inputs);
  const example = (id: string, name: string, address: Record<string, string>): FormExample => ({
    id,
    name,
    inputs: apiInputsFromRunValues({ address }, fields, contract.inputs),
  });
  return [
    example('ex_1', 'Paris office', {
      street: '1 rue de la Paix',
      city: 'Paris',
      country: 'France',
    }),
    example('ex_2', 'Berlin office', {
      street: 'Unter den Linden 5',
      city: 'Berlin',
      country: 'Germany',
    }),
  ];
})();

/** What the example source answers: two examples, none, or a failure. */
export type ExamplesAnswer = 'two' | 'none' | 'failure';

export function exampleSourceOf(answer: ExamplesAnswer): ExampleSource {
  let examples = answer === 'two' ? [...EXAMPLES] : [];
  return {
    list: async () => {
      if (answer === 'failure') throw new Error('The host could not list its examples.');
      return { examples };
    },
    rename: async (example, name) => {
      examples = examples.map((item) => (item.id === example.id ? { ...item, name } : item));
      return { ...example, name };
    },
    delete: async (example) => {
      examples = examples.filter((item) => item.id !== example.id);
    },
  };
}
