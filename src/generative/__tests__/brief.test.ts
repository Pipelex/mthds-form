import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { inputBrief, isDelegatedInput, resultBrief } from '../brief';
import { seedInputs } from '../state';

/**
 * The brief as data: which paths the kernel keeps, and how the descriptor's
 * tree is flattened for the method's template to lay out. The corpus proves
 * both on real methods; this states the rules on the smallest shape that
 * trips each one. A descriptor is written by hand here for the reason
 * `layout-fits.test.ts` gives: what is under test is a projection of a shape.
 */
describe('an input the catalog cannot enter', () => {
  const choice = (options: string[]): RunField => ({
    kind: 'enum',
    name: 'pace',
    required: true,
    options,
  });

  /**
   * The standard puts no floor on a choice, so an enum can carry `""`. The
   * catalog's own choices may not - the validator refuses an empty option,
   * because no renderer can offer one - so a model told to copy the choices
   * exactly would write a layout the validator then refuses. The brief marks
   * the input delegated instead, and the kernel's own control renders it.
   */
  it('includes a choice with an empty option, which no catalog input may list', () => {
    expect(isDelegatedInput(choice(['', 'slow']))).toBe(true);
    expect(isDelegatedInput(choice(['fast', 'slow']))).toBe(false);
  });
});

describe('the brief of an input page', () => {
  const fields: RunField[] = [
    {
      kind: 'object',
      name: 'request',
      title: 'The request',
      required: true,
      gating: true,
      conceptRef: 'trips.TripRequest',
      fields: [
        { kind: 'text', name: 'city', required: true, hints: { intent: 'label' } },
        {
          kind: 'number',
          name: 'budget',
          required: false,
          integer: false,
          min: 0,
          defaultValue: 100,
        },
        {
          kind: 'list',
          name: 'must_see',
          required: false,
          item: { kind: 'text', name: 'item', required: true },
        },
      ],
    },
    { kind: 'image', name: 'inspiration', required: false },
  ];
  const brief = inputBrief({ pipeRef: 'trips.plan_trip', name: 'Trip' }, fields);
  const entry = (path: string) => brief.paths.find((candidate) => candidate.path === path);

  it('flattens the tree in reading order, one level deeper per structure', () => {
    expect(brief.paths.map((candidate) => [candidate.path, candidate.depth])).toEqual([
      ['/inputs/request', 0],
      ['/inputs/request/city', 1],
      ['/inputs/request/budget', 1],
      ['/inputs/request/must_see', 1],
      ['/inputs/inspiration', 0],
    ]);
  });

  it('states what only code can: the kind in words, the presence, the constraints, the default', () => {
    expect(entry('/inputs/request')).toMatchObject({
      kind: 'structure trips.TripRequest',
      name: 'request',
      title: 'The request',
      required: true,
      gating: true,
      delegated: false,
    });
    expect(entry('/inputs/request/city')).toMatchObject({
      kind: 'text',
      required: true,
      notes: ['hints intent=label'],
    });
    expect(entry('/inputs/request/budget')).toMatchObject({
      kind: 'number',
      required: false,
      notes: ['min 0', 'default 100'],
      default: '100',
    });
    // A title equal to the name says nothing, so it is not carried.
    expect(entry('/inputs/request/city')?.title).toBeUndefined();
  });

  it('marks the file and the list delegated, and names the control that runs the method', () => {
    expect(entry('/inputs/request/must_see')).toMatchObject({
      kind: 'list of text',
      delegated: true,
    });
    expect(entry('/inputs/inspiration')).toMatchObject({ kind: 'image (a file)', delegated: true });
    expect(brief.side).toBe('input');
    expect(brief.name).toBe('Trip');
    expect(brief.run_control).toBe('Cta');
    expect(brief.sample_state).toBeUndefined();
  });
});

describe('the seeds an input page lists', () => {
  // A structure with a default of its own AND a member with one: the kernel
  // seeds the structure whole and never descends past a default, and the
  // brief has to say the same, or a model following it in order overwrites
  // part of the authored structure with the member's.
  const fields: RunField[] = [
    {
      kind: 'object',
      name: 'request',
      required: false,
      conceptRef: 'trips.TripRequest',
      defaultValue: { city: 'Paris', budget: 200 },
      fields: [
        { kind: 'text', name: 'city', required: false },
        { kind: 'number', name: 'budget', required: false, integer: false, defaultValue: 100 },
      ],
    },
    { kind: 'text', name: 'note', required: false, defaultValue: 'hello' },
  ];
  const brief = inputBrief({ pipeRef: 'trips.plan_trip' }, fields);
  const entry = (path: string) => brief.paths.find((candidate) => candidate.path === path);

  it("seeds the outermost default only, and keeps a member's own in its notes", () => {
    expect(entry('/inputs/request')?.default).toBe('{"city":"Paris","budget":200}');
    expect(entry('/inputs/request/budget')?.default).toBeUndefined();
    expect(entry('/inputs/request/budget')).toMatchObject({ notes: ['default 100'] });
    expect(entry('/inputs/note')?.default).toBe('"hello"');
  });

  it('lists seeds that, applied in order, are exactly what seedInputs seeds', () => {
    const applied: Record<string, unknown> = {};
    for (const candidate of brief.paths) {
      if (candidate.default === undefined || candidate.default === null) continue;
      const keys = candidate.path.replace('/inputs/', '').split('/');
      const leaf = keys.pop() ?? '';
      let target = applied;
      for (const key of keys) {
        target = (target[key] ??= {}) as Record<string, unknown>;
      }
      target[leaf] = JSON.parse(candidate.default);
    }
    expect(applied).toEqual(seedInputs(fields));
  });
});

describe('the brief of a result page', () => {
  const invoice: RunField = {
    kind: 'object',
    name: 'result',
    required: true,
    conceptRef: 'results.Invoice',
    description: 'A commercial invoice',
    fields: [
      { kind: 'date', name: 'issued_on', required: true, datetime: false },
      {
        kind: 'list',
        name: 'lines',
        required: true,
        item: {
          kind: 'object',
          name: 'item',
          required: true,
          conceptRef: 'results.LineItem',
          description: 'One billable line',
          fields: [
            { kind: 'text', name: 'label', required: true },
            {
              kind: 'list',
              name: 'tags',
              required: false,
              item: { kind: 'text', name: 'item', required: true, description: 'One tag' },
            },
            {
              kind: 'list',
              name: 'notes',
              required: false,
              item: {
                kind: 'object',
                name: 'item',
                required: true,
                conceptRef: 'results.Note',
                fields: [{ kind: 'prose', name: 'body', required: true }],
              },
            },
          ],
        },
      },
    ],
  };
  const brief = resultBrief({ pipeRef: 'results.nested_result' }, invoice, {
    issued_on: '2026-03-14',
  });
  const entry = (path: string) => brief.paths.find((candidate) => candidate.path === path);

  it('opens with the result itself, which names no member', () => {
    expect(brief.paths[0]).toEqual({
      depth: 0,
      path: '/result',
      kind: 'structure results.Invoice',
      description: 'A commercial invoice',
      delegated: false,
    });
    expect(brief.side).toBe('result');
    expect(brief.run_control).toBeUndefined();
    expect(brief.sample_state).toBe('{\n  "issued_on": "2026-03-14"\n}');
  });

  it('describes a list through its item, whose members follow relative to one item', () => {
    expect(entry('/result/lines')).toMatchObject({
      depth: 1,
      kind: 'list of structure results.LineItem',
      item_kind: 'structure results.LineItem',
      item_description: 'One billable line',
      item_laid_out: true,
    });
    expect(entry('label')).toMatchObject({ depth: 3, kind: 'text', relative: true });
    expect(entry('notes')).toMatchObject({
      depth: 3,
      relative: true,
      item_kind: 'structure results.Note',
      item_laid_out: true,
    });
    expect(entry('notes/<i>/body')).toMatchObject({
      depth: 5,
      kind: 'prose (markdown)',
      relative: true,
      delegated: true,
    });
  });

  it('says what each item is for a nested list too, whatever kind the item has', () => {
    // The walk at the top of the result labels every list's item; the
    // relative walk used to label only an item the page lays out, so the
    // same `list of text` read as bare one level down.
    expect(entry('tags')).toMatchObject({
      depth: 3,
      kind: 'list of text',
      relative: true,
      item_kind: 'text',
      item_description: 'One tag',
    });
    expect(entry('tags')?.item_laid_out).toBeUndefined();
  });

  it('states no presence on a result page, where nothing is filled in', () => {
    for (const candidate of brief.paths) {
      expect(candidate.required, candidate.path).toBeUndefined();
      expect(candidate.gating, candidate.path).toBeUndefined();
    }
    expect(entry('/result/issued_on')).toMatchObject({ kind: 'date', delegated: true });
  });
});
