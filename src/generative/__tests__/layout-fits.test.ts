import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { layoutFits, layoutProblems } from '../layout-fits';

/**
 * The gate a host runs before it renders a stored layout, in both directions.
 *
 * These descriptors are written by hand, and that is right here in a way it
 * would not be for a story fixture: what is under test is a predicate over two
 * shapes, not the standard's taxonomy, and a fixture from the corpus would
 * bring a page's worth of irrelevant structure to assert one rule. The corpus
 * is what proves the predicate accepts every layout we actually captured.
 */

const text = (name: string, required: boolean): RunField => ({ kind: 'text', name, required });

/** A page with one element per bound path, plus whatever else is passed. */
function pageBinding(...paths: string[]): Spec {
  const elements: Spec['elements'] = {
    page: { type: 'Stack', props: {}, children: paths.map((_, index) => `f${index}`) },
  };
  paths.forEach((path, index) => {
    elements[`f${index}`] = {
      type: 'Input',
      props: { label: path, value: { $bindState: path } },
      children: [],
    };
  });
  return { root: 'page', elements };
}

describe('a layout that has gone stale', () => {
  it('is refused when it binds a path no input has', () => {
    const problems = layoutProblems({ inputs: [text('city', true)] }, pageBinding('/inputs/town'));
    expect(problems).toContain('/inputs/town is bound, and no input has it');
  });

  it('is refused when it delegates a path no input has', () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['hatch'] },
        hatch: { type: 'MthdsField', props: { path: '/inputs/gone' }, children: [] },
      },
    };
    expect(layoutProblems({ inputs: [text('city', true)] }, spec)).toEqual([
      'hatch: MthdsField delegates /inputs/gone, which no input has',
      '/inputs/city is required, and the layout offers nowhere to enter it',
    ]);
  });
});

describe('a layout that leaves an input out', () => {
  it('is refused when the input is required: there would be nowhere to type it', () => {
    const descriptor = { inputs: [text('city', true), text('budget', true)] };
    const problems = layoutProblems(descriptor, pageBinding('/inputs/city'));
    expect(problems).toEqual([
      '/inputs/budget is required, and the layout offers nowhere to enter it',
    ]);
    expect(layoutFits(descriptor, pageBinding('/inputs/city'))).toBe(false);
  });

  it('is accepted when the input is optional', () => {
    const descriptor = { inputs: [text('city', true), text('mood', false)] };
    expect(layoutFits(descriptor, pageBinding('/inputs/city'))).toBe(true);
  });

  it('is refused when the omission is a required member of a required structure', () => {
    const descriptor = {
      inputs: [
        {
          kind: 'object',
          name: 'invoice',
          required: true,
          fields: [text('reference', true), text('notes', false)],
        } satisfies RunField,
      ],
    };
    expect(layoutProblems(descriptor, pageBinding('/inputs/invoice/notes'))).toEqual([
      '/inputs/invoice/reference is required, and the layout offers nowhere to enter it',
    ]);
  });
});

describe('the three ways a layout offers an input', () => {
  const nested: RunField = {
    kind: 'object',
    name: 'invoice',
    required: true,
    fields: [text('reference', true), text('issuer', true)],
  };

  it('binds it to a control', () => {
    expect(
      layoutFits(
        { inputs: [nested] },
        pageBinding('/inputs/invoice/reference', '/inputs/invoice/issuer'),
      ),
    ).toBe(true);
  });

  it("delegates it, or an ancestor of it, to the kernel's own control", () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['hatch'] },
        hatch: { type: 'MthdsField', props: { path: '/inputs/invoice' }, children: [] },
      },
    };
    expect(layoutFits({ inputs: [nested] }, spec)).toBe(true);
  });

  it('lays a list out as a repeat', () => {
    const list: RunField = {
      kind: 'list',
      name: 'lines',
      required: true,
      item: text('label', true),
    };
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['rows'] },
        rows: { type: 'Stack', props: {}, children: [], repeat: { statePath: '/inputs/lines' } },
      },
    };
    expect(layoutFits({ inputs: [list] }, spec)).toBe(true);
  });
});

describe('a result page', () => {
  it('is asked for no coverage, and refused if it writes anything', () => {
    const result: RunField = {
      kind: 'object',
      name: 'invoice',
      required: true,
      fields: [text('total', true)],
    };
    expect(
      layoutFits(
        { result },
        { root: 'page', elements: { page: { type: 'Stack', props: {}, children: [] } } },
      ),
    ).toBe(true);
    expect(layoutProblems({ result }, pageBinding('/inputs/total'))).toEqual([
      'a result page binds /inputs/total; a result page writes nothing',
    ]);
  });
});
