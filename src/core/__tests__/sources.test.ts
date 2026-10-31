/**
 * The rules that write a host source's answer into a form: a chosen file
 * written as an upload writes it, a list's choices added without duplicates,
 * an example's inputs read back into the controls' shape, and the comparison
 * that says whether a form holds work of the person's own.
 */
import { describe, expect, it } from 'vitest';
import {
  addChosenFiles,
  apiInputsFromRunValues,
  buildRunFields,
  chosenFilesAdded,
  roomForChosenFiles,
  runValuesFromInputs,
  sameRunValues,
  sourceFileValue,
  type PipeInputContract,
  type SourceFile,
} from '..';
import {
  descriptorOf,
  OPTIONAL_SINGLE,
  PLAIN_SINGLE,
  PLAIN_VARIABLE,
  WIRE_OPTIONAL,
  WIRE_PLAIN,
  WIRE_VARIABLE,
} from './contract-fixtures';
// Internal to the package, so it is read from its module rather than the barrel.
import { placeDroppedFiles, roomForDroppedFiles } from '../sources';

const file = (id: string, url: string, name = `${id}.pdf`): SourceFile => ({ id, url, name });

describe('a chosen file', () => {
  it('is written as an upload writes its result: the address and the name', () => {
    expect(
      sourceFileValue(file('a', 'pipelex-storage://org/assets/a.pdf', 'INV-2291.pdf')),
    ).toEqual({ url: 'pipelex-storage://org/assets/a.pdf', filename: 'INV-2291.pdf' });
  });
});

describe('addChosenFiles', () => {
  it('adds the chosen files after what the list holds, one row each, in the order chosen', () => {
    const held = [{ url: 'u1', filename: 'one.pdf' }];
    expect(addChosenFiles(held, [file('b', 'u2'), file('c', 'u3')])).toEqual([
      { url: 'u1', filename: 'one.pdf' },
      { url: 'u2', filename: 'b.pdf' },
      { url: 'u3', filename: 'c.pdf' },
    ]);
  });

  it('does not add a file whose address the list already holds', () => {
    const held = [{ url: 'u1', filename: 'one.pdf' }];
    expect(addChosenFiles(held, [file('a', 'u1'), file('b', 'u2')])).toEqual([
      { url: 'u1', filename: 'one.pdf' },
      { url: 'u2', filename: 'b.pdf' },
    ]);
  });

  it('adds one address once when two rows of the source name it', () => {
    expect(addChosenFiles([], [file('a', 'u1'), file('b', 'u1')])).toEqual([
      { url: 'u1', filename: 'a.pdf' },
    ]);
  });

  it('fills the rows that hold no file first, in order, then adds the rest after', () => {
    const held: unknown[] = [undefined, { url: 'u1' }, null];
    const next = addChosenFiles(held, [file('a', 'u2'), file('b', 'u3'), file('c', 'u4')]);
    expect(next).toEqual([
      { url: 'u2', filename: 'a.pdf' },
      { url: 'u1' },
      { url: 'u3', filename: 'b.pdf' },
      { url: 'u4', filename: 'c.pdf' },
    ]);
  });

  it('leaves an empty row empty when every choice was already held, and never mutates the list', () => {
    const held: unknown[] = [undefined, { url: 'u1' }];
    const next = addChosenFiles(held, [file('a', 'u1')]);
    expect(next).toEqual([undefined, { url: 'u1' }]);
    expect(next).not.toBe(held);
    expect(held).toEqual([undefined, { url: 'u1' }]);
  });

  it('starts a list that holds nothing', () => {
    expect(addChosenFiles(undefined, [file('a', 'u1')])).toEqual([
      { url: 'u1', filename: 'a.pdf' },
    ]);
  });
});

describe('chosenFilesAdded', () => {
  it('counts the files a choice adds, as addChosenFiles writes them', () => {
    const held = [{ url: 'u1' }, undefined];
    const chosen = [file('a', 'u1'), file('b', 'u2'), file('c', 'u2'), file('d', 'u3')];
    // The held address and the second row naming u2 add nothing.
    expect(chosenFilesAdded(held, chosen)).toBe(2);
    const written = addChosenFiles(held, chosen).length - held.filter(Boolean).length;
    expect(chosenFilesAdded(held, chosen)).toBe(written);
  });

  it('counts every distinct address when the list holds nothing', () => {
    expect(chosenFilesAdded(undefined, [file('a', 'u1'), file('b', 'u2')])).toBe(2);
    expect(chosenFilesAdded([], [])).toBe(0);
  });
});

describe('roomForChosenFiles', () => {
  it('counts the room a bounded list has left by the files it holds, not by its rows', () => {
    expect(roomForChosenFiles([undefined, undefined], 2)).toBe(2);
    expect(roomForChosenFiles([{ url: 'u1' }, undefined], 2)).toBe(1);
    expect(roomForChosenFiles([{ url: 'u1' }, { url: 'u2' }], 2)).toBe(0);
  });

  it('has no bound when the list has none, and never goes below nothing', () => {
    expect(roomForChosenFiles([{ url: 'u1' }], undefined)).toBeUndefined();
    expect(roomForChosenFiles([{ url: 'u1' }, { url: 'u2' }, { url: 'u3' }], 2)).toBe(0);
  });
});

describe('placeDroppedFiles', () => {
  const FILE = { url: 'u1', filename: 'held.pdf' };

  it('appends one empty row per file to an empty list, in order', () => {
    expect(placeDroppedFiles(undefined, 3, undefined)).toEqual({
      items: [undefined, undefined, undefined],
      appended: 3,
      targets: [0, 1, 2],
      leftOut: 0,
    });
  });

  it('fills the rows that hold no file first, then appends after the last', () => {
    const held = [undefined, FILE, {}];
    const placement = placeDroppedFiles(held, 3, undefined);
    expect(placement.targets).toEqual([0, 2, 3]);
    expect(placement.appended).toBe(1);
    expect(placement.items).toEqual([undefined, FILE, {}, undefined]);
    expect(held).toEqual([undefined, FILE, {}]);
  });

  it('appends nothing when the free rows take the whole batch', () => {
    const held = [undefined, FILE, undefined];
    const placement = placeDroppedFiles(held, 2, undefined);
    expect(placement).toMatchObject({ appended: 0, targets: [0, 2], leftOut: 0 });
    expect(placement.items).toEqual(held);
    expect(placement.items).not.toBe(held);
  });

  it('skips a row the caller says is not free: one in flight, one whose upload failed', () => {
    const busy = new Set([0, 2]);
    const placement = placeDroppedFiles(
      [undefined, undefined, undefined],
      2,
      undefined,
      (index) => !busy.has(index),
    );
    expect(placement.targets).toEqual([1, 3]);
    expect(placement.items).toHaveLength(4);
  });

  it('never fills a row that holds a file, whatever the predicate says', () => {
    expect(placeDroppedFiles([FILE], 1, undefined, () => true).targets).toEqual([1]);
  });

  it('takes as many as a bounded list has room for, and leaves out the rest from the end', () => {
    const placement = placeDroppedFiles([FILE, undefined], 4, 3);
    expect(placement).toEqual({
      items: [FILE, undefined, undefined],
      appended: 1,
      targets: [1, 2],
      leftOut: 2,
    });
  });

  it('leaves the whole batch out of a full list', () => {
    expect(placeDroppedFiles([FILE, FILE], 2, 2)).toEqual({
      items: [FILE, FILE],
      appended: 0,
      targets: [],
      leftOut: 2,
    });
  });

  it('still fills a free row of a list that already holds more rows than its bound', () => {
    const placement = placeDroppedFiles([FILE, undefined, FILE], 2, 2);
    expect(placement).toMatchObject({ appended: 0, targets: [1], leftOut: 1 });
  });

  it('says how much room it has, by the same test, and none when the list is unbounded', () => {
    expect(roomForDroppedFiles([FILE, undefined], 3)).toBe(2);
    expect(roomForDroppedFiles([FILE, undefined], 3, (index) => index !== 1)).toBe(1);
    expect(roomForDroppedFiles([FILE, FILE], 2)).toBe(0);
    expect(roomForDroppedFiles([FILE, FILE, FILE], 2)).toBe(0);
    expect(roomForDroppedFiles([FILE], undefined)).toBeUndefined();
    expect(roomForDroppedFiles(undefined, 2)).toBe(2);
  });

  it('places nothing for an empty batch', () => {
    expect(placeDroppedFiles([undefined], 0, undefined)).toEqual({
      items: [undefined],
      appended: 0,
      targets: [],
      leftOut: 0,
    });
  });
});

// A text, a document, a structure, an optional text and a list of images: one
// of each shape an example's inputs carry back.
const CONTRACT: Record<string, PipeInputContract> = {
  brief: {
    ...PLAIN_SINGLE,
    concept_ref: 'native.Text',
    json_schema: { type: 'object', properties: { text: { type: 'string' } } },
  },
  invoice: {
    ...PLAIN_SINGLE,
    concept_ref: 'native.Document',
    json_schema: { type: 'object', properties: { url: { type: 'string' } } },
  },
  applicant: {
    ...PLAIN_SINGLE,
    concept_ref: 'demo.Applicant',
    json_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, age: { type: 'integer' } },
      required: ['name'],
    },
  },
  comments: {
    ...OPTIONAL_SINGLE,
    concept_ref: 'native.Text',
    json_schema: { type: 'object', properties: { text: { type: 'string' } } },
  },
  photos: {
    ...PLAIN_VARIABLE,
    concept_ref: 'native.Image',
    json_schema: { type: 'array', items: { type: 'object' } },
  },
};

const FIELDS = buildRunFields(
  descriptorOf(
    { ...WIRE_PLAIN, kind: 'prose', name: 'brief', concept_ref: 'native.Text' },
    { ...WIRE_PLAIN, kind: 'document', name: 'invoice', concept_ref: 'native.Document' },
    {
      ...WIRE_PLAIN,
      kind: 'object',
      name: 'applicant',
      concept_ref: 'demo.Applicant',
      fields: [
        { kind: 'text', name: 'name', required: true },
        { kind: 'number', name: 'age', integer: true, required: false },
      ],
    },
    { ...WIRE_OPTIONAL, kind: 'prose', name: 'comments', concept_ref: 'native.Text' },
    {
      ...WIRE_VARIABLE,
      kind: 'list',
      name: 'photos',
      concept_ref: 'native.Image',
      item: { kind: 'image', required: true, concept_ref: 'native.Image' },
    },
  ),
  CONTRACT,
);

describe('runValuesFromInputs', () => {
  it('reads the inputs a form sent back into the values it held', () => {
    const values = {
      brief: 'Check the totals',
      invoice: { url: 'pipelex-storage://org/assets/a.pdf', filename: 'INV-2291.pdf' },
      applicant: { name: 'Ada', age: 36 },
      comments: 'Urgent',
      photos: [{ url: 'pipelex-storage://org/assets/p.png', filename: 'p.png' }],
    };
    const inputs = apiInputsFromRunValues(values, FIELDS, CONTRACT);
    expect(runValuesFromInputs(inputs, FIELDS)).toEqual(values);
  });

  it('leaves empty what the inputs left out, and reads an empty plural input sent bare', () => {
    const inputs = apiInputsFromRunValues({ brief: 'Only this' }, FIELDS, CONTRACT);
    expect(inputs['photos']).toEqual([]);
    const values = runValuesFromInputs(inputs, FIELDS);
    expect(values['brief']).toBe('Only this');
    expect(values['comments']).toBeUndefined();
    expect(values['photos']).toEqual([]);
  });

  it('reads a structure sent bare, and keeps its own "content" property as a property', () => {
    const contract: Record<string, PipeInputContract> = {
      note: {
        ...PLAIN_SINGLE,
        concept_ref: 'demo.Note',
        json_schema: {
          type: 'object',
          properties: { title: { type: 'string' }, content: { type: 'string' } },
        },
      },
    };
    const fields = buildRunFields(
      descriptorOf({
        ...WIRE_PLAIN,
        kind: 'object',
        name: 'note',
        concept_ref: 'demo.Note',
        fields: [
          { kind: 'text', name: 'title', required: true },
          { kind: 'text', name: 'content', required: true },
        ],
      }),
      contract,
    );
    const note = { title: 'Minutes', content: 'Agreed on the budget' };
    expect(runValuesFromInputs({ note }, fields)).toEqual({ note });
    // The envelope a run sends is still read through.
    expect(runValuesFromInputs({ note: { concept: 'demo.Note', content: note } }, fields)).toEqual({
      note,
    });
  });

  it('ignores an input no field takes', () => {
    const values = runValuesFromInputs(
      { gone: { concept: 'native.Text', content: { text: 'x' } } },
      FIELDS,
    );
    expect(values).not.toHaveProperty('gone');
  });
});

describe('sameRunValues', () => {
  it('holds values that send the same run to be the same: a text typed and erased is blank', () => {
    expect(sameRunValues({ brief: '' }, {}, FIELDS)).toBe(true);
    expect(sameRunValues({ photos: [] }, {}, FIELDS)).toBe(true);
  });

  it('tells apart a value the person typed or attached', () => {
    expect(sameRunValues({ brief: 'x' }, {}, FIELDS)).toBe(false);
    expect(sameRunValues({ invoice: { url: 'u' } }, {}, FIELDS)).toBe(false);
    expect(sameRunValues({ invoice: { url: 'u' } }, { invoice: { url: 'v' } }, FIELDS)).toBe(false);
  });
});
