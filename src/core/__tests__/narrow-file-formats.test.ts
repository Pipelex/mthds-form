import { describe, expect, it } from 'vitest';
import {
  buildRunFields,
  formatsForKind,
  narrowFileFormats,
  type FileRunField,
  type ListRunField,
  type ObjectRunField,
  type PipeInputContract,
  type RunField,
} from '..';
import {
  descriptorOf,
  PLAIN_SINGLE,
  PLAIN_VARIABLE,
  WIRE_PLAIN,
  WIRE_VARIABLE,
} from './contract-fixtures';

/**
 * A host narrows what a form's file slots accept to what its own upload path
 * takes, with one list, once. What this has to hold: the list is intersected
 * with each slot's own formats, the walk reaches every slot however deep, a
 * slot left with nothing is a loud configuration error, and the tree the host
 * passed in is left as it was.
 */

const PDF = 'application/pdf';
const PNG = 'image/png';
const JPEG = 'image/jpeg';
const WEBP = 'image/webp';

const file = (name: string, kind: 'document' | 'image'): FileRunField => ({
  kind,
  name,
  conceptRef: kind === 'document' ? 'native.Document' : 'native.Image',
  required: true,
  formats: formatsForKind(kind),
});

const labels = (field: RunField | undefined): string[] => {
  if (field?.kind !== 'document' && field?.kind !== 'image') {
    throw new Error(`expected a file field, got ${field?.kind}`);
  }
  return field.formats.map((format) => format.label);
};

describe('one list, intersected with each slot', () => {
  it('leaves a document slot all three of PDF, PNG and JPEG, and an image slot PNG and JPEG', () => {
    const [contract, photo] = narrowFileFormats(
      [file('contract', 'document'), file('photo', 'image')],
      [PDF, PNG, JPEG],
    );
    expect(labels(contract)).toEqual(['PDF', 'JPG', 'PNG']);
    expect(labels(photo)).toEqual(['PNG', 'JPG']);
  });

  it('never widens a slot: a MIME type its kind cannot take is not added', () => {
    // WEBP is an image format and not a document one, so naming it leaves the
    // document slot exactly where the rest of the list puts it.
    const [contract] = narrowFileFormats([file('contract', 'document')], [PDF, WEBP]);
    expect(labels(contract)).toEqual(['PDF']);
  });

  it("keeps the slot's own order, whatever order the list is in", () => {
    const [photo] = narrowFileFormats([file('photo', 'image')], [WEBP, JPEG, PNG]);
    expect(labels(photo)).toEqual(['PNG', 'JPG', 'WEBP']);
  });

  it('reads a MIME type the way the check does: without parameters, in any case', () => {
    const [contract] = narrowFileFormats(
      [file('contract', 'document')],
      ['APPLICATION/PDF; version=1.7', ' image/png '],
    );
    expect(labels(contract)).toEqual(['PDF', 'PNG']);
  });

  it('is idempotent, so narrowing an already narrowed tree changes nothing', () => {
    const once = narrowFileFormats([file('photo', 'image')], [PNG, JPEG]);
    expect(labels(narrowFileFormats(once, [PNG, JPEG])[0])).toEqual(['PNG', 'JPG']);
  });

  it('leaves every field that is not a file slot as it was', () => {
    const note: RunField = { kind: 'text', name: 'note', required: false };
    const [narrowed] = narrowFileFormats([note], [PDF]);
    expect(narrowed).toBe(note);
  });
});

describe('the walk reaches every slot', () => {
  const application: ObjectRunField = {
    kind: 'object',
    name: 'application',
    required: true,
    fields: [
      file('resume', 'document'),
      {
        kind: 'object',
        name: 'identity',
        required: true,
        fields: [file('headshot', 'image')],
      },
    ],
  };
  const gallery: ListRunField = {
    kind: 'list',
    name: 'gallery',
    required: true,
    item: file('gallery', 'image'),
  };
  const cvs: ListRunField = {
    kind: 'list',
    name: 'cvs',
    required: true,
    item: {
      kind: 'object',
      name: 'cvs',
      required: true,
      fields: [file('resume', 'document')],
    },
  };

  it('inside records, at any depth', () => {
    const [narrowed] = narrowFileFormats([application], [PDF, PNG]) as [ObjectRunField];
    const [resume, identity] = narrowed.fields as [FileRunField, ObjectRunField];
    expect(labels(resume)).toEqual(['PDF', 'PNG']);
    expect(labels(identity.fields[0])).toEqual(['PNG']);
  });

  it('inside list items, including a record inside a list', () => {
    const [narrowedGallery, narrowedCvs] = narrowFileFormats([gallery, cvs], [PDF, JPEG]) as [
      ListRunField,
      ListRunField,
    ];
    expect(labels(narrowedGallery.item)).toEqual(['JPG']);
    expect(labels((narrowedCvs.item as ObjectRunField).fields[0])).toEqual(['PDF', 'JPG']);
  });

  it('over a tree the kernel derived from a wire descriptor', () => {
    // The host's real call site: `buildRunFields`, then this, with nothing
    // hand-built in between.
    const inputs: Record<string, PipeInputContract> = {
      contract: {
        ...PLAIN_SINGLE,
        concept_ref: 'native.Document',
        json_schema: { type: 'object' },
      },
      photos: {
        ...PLAIN_VARIABLE,
        concept_ref: 'native.Image',
        json_schema: { type: 'array', items: { type: 'object' } },
      },
    };
    const descriptor = descriptorOf(
      { ...WIRE_PLAIN, kind: 'document', name: 'contract', concept_ref: 'native.Document' },
      {
        ...WIRE_VARIABLE,
        kind: 'list',
        name: 'photos',
        concept_ref: 'native.Image',
        item: { kind: 'image', required: true, concept_ref: 'native.Image' },
      },
    );
    const [contract, photos] = narrowFileFormats(buildRunFields(descriptor, inputs), [
      PDF,
      PNG,
      JPEG,
    ]) as [FileRunField, ListRunField];
    expect(labels(contract)).toEqual(['PDF', 'JPG', 'PNG']);
    expect(labels(photos.item)).toEqual(['PNG', 'JPG']);
  });
});

describe('a slot left accepting nothing', () => {
  it('throws, naming the field and what it would have taken', () => {
    expect(() => narrowFileFormats([file('photo', 'image')], [PDF])).toThrow(
      /image field "photo" would accept no format.*PNG, JPG, WEBP.*application\/pdf/,
    );
  });

  it('names a nested slot by its path', () => {
    const cvs: ListRunField = {
      kind: 'list',
      name: 'cvs',
      required: true,
      item: {
        kind: 'object',
        name: 'cvs',
        required: true,
        fields: [file('portrait', 'image')],
      },
    };
    expect(() => narrowFileFormats([cvs], [PDF])).toThrow(/"cvs\[\]\.portrait"/);
  });

  it('throws for an empty list as soon as the tree holds a file slot', () => {
    expect(() => narrowFileFormats([file('contract', 'document')], [])).toThrow(
      /document field "contract".*no MIME type/,
    );
  });

  it('does not throw for an empty list over a tree with no file slot', () => {
    const note: RunField = { kind: 'text', name: 'note', required: false };
    expect(narrowFileFormats([note], [])).toEqual([note]);
  });
});

describe('the input tree is left untouched', () => {
  it('returns new file fields and leaves the originals, and the table, as they were', () => {
    const photo = file('photo', 'image');
    const record: ObjectRunField = {
      kind: 'object',
      name: 'record',
      required: true,
      fields: [file('scan', 'document')],
    };
    const tree: RunField[] = [photo, record];
    const before = structuredClone(tree);

    const narrowed = narrowFileFormats(tree, [PNG]);

    expect(tree).toEqual(before);
    expect(narrowed[0]).not.toBe(photo);
    expect(narrowed[1]).not.toBe(record);
    expect(labels(photo)).toEqual(['PNG', 'JPG', 'WEBP']);
    expect(formatsForKind('image').map((format) => format.label)).toEqual(['PNG', 'JPG', 'WEBP']);
    expect(formatsForKind('document').map((format) => format.label)).toEqual(['PDF', 'JPG', 'PNG']);
  });
});
