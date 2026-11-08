import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RunField } from '../../core';
import { specMalformation } from '../spec-shape';
import { catalog, componentNamesFor, frameCatalog } from '../catalog';
import { COMPOSER_COMPONENTS, RESULT_COMPONENTS } from '../frame-definitions';
import { REPAIR_ATTEMPTS, layoutCheck, layoutCheckProblems, seedLine } from '../designer-run';
import type { LayoutDescriptor } from '../layout-fits';

// The shape check, observed: a pass-through spy, so each call is counted and
// answers as the check itself does.
vi.mock('../spec-shape', async (actual) => {
  const shape = await actual<typeof import('../spec-shape')>();
  return { ...shape, specMalformation: vi.fn(shape.specMalformation) };
});

beforeEach(() => {
  vi.mocked(specMalformation).mockClear();
});

/**
 * The checks a producer and a host hold a layout to, by frame: the frame's own
 * vocabulary, then the fit to the descriptor. What the repair pass reads is
 * these lines, so they are asserted as words.
 */

const inputs: RunField[] = [{ kind: 'text', name: 'topic', required: true }];

const composer: Spec = {
  root: 'page',
  elements: {
    page: {
      type: 'Composer',
      props: {
        headline: 'Write about anything',
        lede: null,
        runLabel: 'Write it',
        columns: null,
        notes: null,
      },
      on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
      children: ['topic'],
    },
    topic: { type: 'MthdsField', props: { path: '/inputs/topic' }, children: [] },
  },
};

describe('a layout written for a frame', () => {
  it("is refused in a frame whose vocabulary lacks its components, with the frame's catalog's words", () => {
    expect(componentNamesFor('page')).not.toContain('Composer');
    const problems = layoutCheckProblems(composer, { frame: 'page', descriptor: { inputs } });
    expect(problems.join('\n')).toMatch(/Composer/);
  });

  it('passes in its own frame when it fits the descriptor', () => {
    expect(layoutCheckProblems(composer, { frame: 'composer', descriptor: { inputs } })).toEqual(
      [],
    );
  });

  it('adds the fit to the descriptor after the catalog', () => {
    const problems = layoutCheckProblems(composer, {
      frame: 'composer',
      descriptor: { inputs: [...inputs, { kind: 'text', name: 'tone', required: true }] },
    });
    expect(problems.some((line) => line.includes('/inputs/tone'))).toBe(true);
  });

  it('is refused when no control runs the method, since the page would be dead', () => {
    const page = composer.elements.page!;
    const runless: Spec = {
      ...composer,
      elements: {
        ...composer.elements,
        page: { ...page, on: { press: [{ action: 'validateForm' }] } },
      },
    };
    const problems = layoutCheckProblems(runless, { frame: 'composer', descriptor: { inputs } });
    expect(problems.join('\n')).toMatch(/no control that runs the method/);
  });

  it("does not count a run reached only through a binding's chain, which json-render never fires", () => {
    const page = composer.elements.page!;
    const chained: Spec = {
      ...composer,
      elements: {
        ...composer.elements,
        page: {
          ...page,
          on: { press: { action: 'validateForm', onSuccess: { action: 'run' } } },
        },
      },
    };
    const problems = layoutCheckProblems(chained, { frame: 'composer', descriptor: { inputs } });
    expect(problems.join('\n')).toMatch(/no control that runs the method/);
  });

  it('is refused when the only run is bound to a field rather than pressed, since the run button would be dead', () => {
    const page = composer.elements.page!;
    const fieldOnly: Spec = {
      root: 'page',
      elements: {
        ...composer.elements,
        page: { ...page, on: { press: [{ action: 'validateForm' }] }, children: ['topic', 'city'] },
        city: {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            type: null,
            placeholder: null,
            value: { $bindState: '/inputs/city' },
            checks: null,
            validateOn: null,
          },
          children: [],
          on: { submit: [{ action: 'validateForm' }, { action: 'run' }] },
        },
      },
    };
    const problems = layoutCheckProblems(fieldOnly, {
      frame: 'composer',
      descriptor: { inputs: [...inputs, { kind: 'text', name: 'city', required: false }] },
    });
    expect(problems).toEqual([
      "the layout has no control that runs the method: bind `run` under a control's `on.press`",
    ]);
  });

  it('answers a malformed element with problems rather than an exception', () => {
    const broken = { root: 'page', elements: { page: null } } as unknown as Spec;
    expect(() =>
      layoutCheckProblems(broken, { frame: 'composer', descriptor: { inputs } }),
    ).not.toThrow();
    expect(
      layoutCheckProblems(broken, { frame: 'composer', descriptor: { inputs } }).length,
    ).toBeGreaterThan(0);
  });
});

/**
 * The checks never throw. A host calls them on whatever a model wrote, or on
 * a layout it stored and read back, and a throw there is a page that neither
 * renders nor falls back: the answer to anything that is not a layout is a
 * problem line, which the fallback acts on.
 */
describe('a layout that is not one at all', () => {
  it.each([null, undefined, 42, 'page', [], {}, { root: 'page' }, { root: 'page', elements: 7 }])(
    'is answered with problems, never an exception: %j',
    (spec) => {
      const check = () =>
        layoutCheckProblems(spec as unknown as Spec, { frame: 'composer', descriptor: { inputs } });
      expect(check).not.toThrow();
      expect(check().length).toBeGreaterThan(0);
    },
  );

  it('is refused for a frame it does not name, rather than checked against no vocabulary', () => {
    // A frame read back from storage can be anything; an unknown one used to
    // exclude nothing, so a composer layout naming an `AppBar` passed.
    const problems = layoutCheckProblems(composer, {
      frame: 'sidebar' as unknown as 'composer',
      descriptor: { inputs },
    });
    expect(problems).toEqual([
      'the layout is checked against the frame "sidebar", which is none of page, composer, result',
    ]);
  });

  it('is refused, not thrown on, when there is no descriptor to check it against', () => {
    const check = () =>
      layoutCheckProblems(composer, {
        frame: 'composer',
        descriptor: null as unknown as { inputs: RunField[] },
      });
    expect(check).not.toThrow();
    expect(check()).toEqual(['the layout has no descriptor to be checked against']);
  });
});

describe('what a producer hands the method', () => {
  it('sends the seed as the one labelled line the planner reads', () => {
    expect(seedLine('abc')).toBe(
      'CREATIVE SEED (derive your direction from it; never reveal it): abc',
    );
  });

  it('gives a refused layout a bounded number of repair passes', () => {
    expect(REPAIR_ATTEMPTS).toBeGreaterThan(0);
    expect(REPAIR_ATTEMPTS).toBeLessThan(4);
  });
});

/**
 * A producer stops when the checks fail on their own account: the layout is
 * refused all the same, but no repair pass can fix a defect in the checks.
 */
describe('an answer that holds the checks failing', () => {
  it('is told apart from a layout that is not a spec', () => {
    const malformed = layoutCheck({ root: 'page' } as unknown as Spec, {
      frame: 'composer',
      descriptor: { inputs },
    });
    expect(malformed).toEqual({
      problems: ['the layout is not a well-formed spec: it has no "elements" map'],
      checksFailed: false,
    });
  });

  it('answers a descriptor of the wrong shape as such', () => {
    const verdict = layoutCheck(composer, {
      frame: 'composer',
      descriptor: { inputs: 5 } as unknown as LayoutDescriptor,
    });
    expect(verdict).toEqual({
      problems: ['the descriptor\'s "inputs" is not a list of fields'],
      checksFailed: true,
    });
  });

  it('says so when a check throws on a layout of the right shape', () => {
    // A field whose requiredness cannot be read stands in for a defect in a
    // walk: the shape check reads a field's kind and name, never that.
    const field = { kind: 'text', name: 'topic' } as RunField;
    Object.defineProperty(field, 'required', {
      get() {
        throw new Error('boom');
      },
    });
    const verdict = layoutCheck(composer, { frame: 'composer', descriptor: { inputs: [field] } });
    expect(verdict.checksFailed).toBe(true);
    expect(verdict.problems).toContain(
      'the checks failed on this layout (Error: boom): a defect in the checks, which no repair of the layout can fix',
    );
  });

  it('is not forged by a layout that writes the line into an element key', () => {
    // The failure used to be recognised by its words, and a problem line
    // opens with the element's key, which is the layout's to choose.
    const forged = 'the checks failed on this layout (Error: boom)';
    const spec: Spec = {
      ...composer,
      elements: {
        ...composer.elements,
        page: { ...composer.elements.page!, children: ['topic', forged] },
        [forged]: { type: 'MthdsField', props: { path: '/inputs/gone' }, children: [] },
      },
    };
    const verdict = layoutCheck(spec, { frame: 'composer', descriptor: { inputs } });
    expect(verdict.problems.some((line) => line.startsWith(forged))).toBe(true);
    expect(verdict.checksFailed).toBe(false);
  });

  it('holds a missing half written as null to be absent, as JSON carries one', () => {
    const descriptor = { inputs, result: null } as unknown as LayoutDescriptor;
    expect(layoutCheck(composer, { frame: 'composer', descriptor })).toEqual({
      problems: [],
      checksFailed: false,
    });
  });

  it('answers a spec it cannot write out with a line, never a throw', () => {
    for (const spec of [BigInt(1), Symbol('page')]) {
      const check = () =>
        layoutCheck(spec as unknown as Spec, { frame: 'composer', descriptor: { inputs } });
      expect(check).not.toThrow();
      expect(check().problems).toHaveLength(1);
    }
  });

  it('runs the shape check once, and answers the same lines as before', () => {
    const verdict = layoutCheck(composer, { frame: 'composer', descriptor: { inputs } });
    expect(specMalformation).toHaveBeenCalledTimes(1);
    expect(layoutCheckProblems(composer, { frame: 'composer', descriptor: { inputs } })).toEqual(
      verdict.problems,
    );
  });

  it.each([
    [
      'a child that is a structure',
      { children: [{ toString: 1 }] },
      'the element "page" has a child that is {"toString":1}, not an element\'s key',
    ],
    [
      'a child that is a number',
      { children: [5] },
      'the element "page" has a child that is 5, not an element\'s key',
    ],
    [
      'a slot entry that is a structure',
      { slots: { header: [{ toString: 1 }] } },
      'the element "page" has a slot entry that is {"toString":1}, not an element\'s key',
    ],
  ])('refuses %s as a malformed layout, which a repair can fix', (_name, element, line) => {
    const spec = {
      ...composer,
      elements: { ...composer.elements, page: { ...composer.elements.page!, ...element } },
    } as unknown as Spec;
    expect(layoutCheck(spec, { frame: 'composer', descriptor: { inputs } })).toEqual({
      problems: [`the layout is not a well-formed spec: ${line}`],
      checksFailed: false,
    });
  });

  it('refuses a root that is no text as a malformed layout', () => {
    const spec = { ...composer, root: { toString: 1 } } as unknown as Spec;
    expect(layoutCheck(spec, { frame: 'composer', descriptor: { inputs } })).toEqual({
      problems: [
        'the layout is not a well-formed spec: its "root" is {"toString":1}, not an element\'s key',
      ],
      checksFailed: false,
    });
  });

  it.each([
    [[null], "the descriptor's input 1 is not a field"],
    [[5], "the descriptor's input 1 is not a field"],
    [[{ kind: 'text' }], "the descriptor's input 1 is not a field"],
    [
      [{ kind: 'object', name: 'trip', required: true }],
      'the descriptor\'s input 1 ("trip") has no list of member "fields"',
    ],
    [
      [{ kind: 'object', name: 'trip', required: true, fields: [null] }],
      'the descriptor\'s input 1 ("trip") member 1 is not a field',
    ],
    [
      [{ kind: 'list', name: 'stops', required: true }],
      'the descriptor\'s input 1 ("stops") item is not a field',
    ],
  ])('refuses the inputs %j as a malformed descriptor', (fields, line) => {
    const descriptor = { inputs: fields } as unknown as LayoutDescriptor;
    expect(layoutCheck(composer, { frame: 'composer', descriptor })).toEqual({
      problems: [line],
      checksFailed: true,
    });
  });

  it('refuses a field inside itself, and reads a field held twice at each place', () => {
    const place = { kind: 'text', name: 'city', required: true };
    const trip = { kind: 'object', name: 'topic', required: true, fields: [place, place] };
    expect(
      layoutCheck(composer, { frame: 'composer', descriptor: { inputs: [trip] } as never })
        .problems,
    ).toEqual([]);
    const loop: Record<string, unknown> = { kind: 'object', name: 'topic', required: true };
    loop.fields = [loop];
    expect(
      layoutCheck(composer, { frame: 'composer', descriptor: { inputs: [loop] } as never }),
    ).toEqual({
      problems: ['the descriptor\'s input 1 ("topic") member 1 ("topic") contains itself'],
      checksFailed: true,
    });
  });
});

/**
 * The composer's and the result page's vocabularies are allow-lists, so a
 * component added to the catalog joins neither until someone names it there.
 * What they name must still be components the catalog defines.
 */
describe("a frame's vocabulary", () => {
  it.each(['composer', 'result'] as const)(
    'names only components the catalog defines: %s',
    (frame) => {
      const defined = Object.keys(catalog.data.components as Record<string, unknown>);
      const names = componentNamesFor(frame);
      expect(names.filter((name) => !defined.includes(name))).toEqual([]);
      expect(new Set(names).size).toBe(names.length);
    },
  );

  it("holds each frame's own components and none of the other's", () => {
    expect(componentNamesFor('composer')).toEqual(expect.arrayContaining([...COMPOSER_COMPONENTS]));
    expect(componentNamesFor('result')).toEqual(expect.arrayContaining([...RESULT_COMPONENTS]));
    expect(
      componentNamesFor('result').filter((name) => COMPOSER_COMPONENTS.includes(name as never)),
    ).toEqual([]);
  });

  it('is built once per frame', () => {
    expect(frameCatalog('result')).toBe(frameCatalog('result'));
  });

  it.each(['page', 'composer', 'result'] as const)(
    'cannot be edited by a caller, since every later check shares it: %s',
    (frame) => {
      // Shared and mutable, one caller's push of an `AppBar` into the
      // composer's vocabulary let every later composer check accept one.
      const built = frameCatalog(frame);
      expect(() => (built.componentNames as string[]).push('AppBar')).toThrow();
      expect(() => {
        (built as { componentNames: readonly string[] }).componentNames = ['AppBar'];
      }).toThrow();
      expect(componentNamesFor(frame)).toBe(built.componentNames);
    },
  );
});

/**
 * What the host hands over - the frame and the descriptor - is no layout's
 * to mend, so a producer is told to stop rather than pay for repairs, and
 * reading it never throws or freezes.
 */
describe('an answer about what the host handed over', () => {
  const page = { root: 'p', elements: { p: { type: 'Stack', props: {}, children: [] } } } as Spec;

  it('flags a frame the package does not draw as beyond repair', () => {
    const verdict = layoutCheck(page, { frame: 'sidebar' as never, descriptor: {} });
    expect(verdict.checksFailed).toBe(true);
  });

  it('answers a descriptor whose reading throws a value that cannot be written out', () => {
    const descriptor = {
      get inputs(): never {
        throw Object.create(null);
      },
    } as unknown as LayoutDescriptor;
    expect(layoutCheck(page, { frame: 'page', descriptor })).toEqual({
      problems: ['the descriptor cannot be read (an error that cannot be written out)'],
      checksFailed: true,
    });
  });

  it('refuses a descriptor sharing a structure level under level before it doubles out of reach', () => {
    let shared: object = { kind: 'text', name: 'leaf', required: true };
    for (let level = 0; level < 40; level += 1) {
      shared = { kind: 'object', name: `l${level}`, required: true, fields: [shared, shared] };
    }
    const verdict = layoutCheck(page, {
      frame: 'page',
      descriptor: { inputs: [shared] } as unknown as LayoutDescriptor,
    });
    expect(verdict.checksFailed).toBe(true);
    expect(verdict.problems[0]).toMatch(/more than 10000/);
  });
});
