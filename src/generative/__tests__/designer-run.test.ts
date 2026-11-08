import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { componentNamesFor } from '../catalog';
import { REPAIR_ATTEMPTS, layoutCheckProblems, seedLine } from '../designer-run';

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
      'the layout names the frame "sidebar", which is none of page, composer, result',
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
