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

/**
 * The result side of the delegation rule, which the input side above states
 * twice and this one never did.
 */
describe('a result page that delegates', () => {
  const result: RunField = {
    kind: 'object',
    name: 'invoice',
    required: true,
    fields: [text('total', true)],
  };

  const delegating = (path: string): Spec => ({
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['hatch'] },
      hatch: { type: 'MthdsResult', props: { path }, children: [] },
    },
  });

  it('is accepted when the path is one the result has', () => {
    expect(layoutProblems({ result }, delegating('/result/total'))).toEqual([]);
  });

  it('is refused when the path is one no result has', () => {
    expect(layoutProblems({ result }, delegating('/result/gone'))).toEqual([
      'hatch: MthdsResult delegates /result/gone, which no result has',
    ]);
  });

  it('is refused when there is no result descriptor at all', () => {
    expect(layoutProblems({}, delegating('/result/total'))).toEqual([
      'hatch: MthdsResult delegates /result/total, which no result has',
    ]);
  });
});

/**
 * A path a layout READS is a path it mentions, and the prompt teaches four ways
 * to read one beyond the binding the coverage half counts.
 */
describe('a path the layout reads rather than binds', () => {
  const reading = (props: Record<string, unknown>): Spec =>
    ({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['row'] },
        row: { type: 'SummaryRow', props, children: [] },
      },
    }) as unknown as Spec;

  it('is refused when a $state read names an input that is gone', () => {
    const problems = layoutProblems(
      { inputs: [text('city', false)] },
      reading({ label: 'Town', value: { $state: '/inputs/town' } }),
    );
    expect(problems).toContain('/inputs/town is read, and no input has it');
  });

  it('is refused when a $template interpolates an input that is gone', () => {
    const problems = layoutProblems(
      { inputs: [text('city', false)] },
      reading({ label: 'Trip', value: { $template: 'A trip to ${/inputs/town}' } }),
    );
    expect(problems).toContain('/inputs/town is read, and no input has it');
  });

  it("leaves the layout's own scratch state alone", () => {
    expect(
      layoutProblems(
        { inputs: [text('city', false)] },
        reading({ label: 'Tab', value: { $state: '/activeTab' } }),
      ),
    ).toEqual([]);
  });

  it('says a stale path once, however many elements mention it', () => {
    const problems = layoutProblems(
      { inputs: [text('city', false)] },
      reading({
        label: 'Town',
        value: { $state: '/inputs/town' },
        detail: { $state: '/inputs/town' },
      }),
    );
    expect(problems).toEqual(['/inputs/town is read, and no input has it']);
  });

  /**
   * The case coverage alone cannot see. The binding is right there in the props,
   * so the required input counts as offered - but the element carrying it is
   * hidden by a condition that compares against a path the method no longer has,
   * which never holds, so the person never sees the field the run then demands.
   */
  it('is refused when a stale visible condition hides a required input', () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['section'] },
        section: {
          type: 'Stack',
          props: {},
          children: ['field'],
          visible: { $state: '/inputs/with_children', eq: true },
        },
        field: {
          type: 'Input',
          props: { label: 'City', value: { $bindState: '/inputs/city' } },
          children: [],
        },
      },
    };
    expect(layoutProblems({ inputs: [text('city', true)] }, spec)).toEqual([
      '/inputs/with_children is read, and no input has it',
    ]);
  });
});

/**
 * A layout is model-produced, so the gate is asked about shapes no producer
 * meant to emit. It has to answer rather than hang: `repeatBasePathOf` walks up
 * the parent chain, and an element that is its own ancestor made that walk
 * unbounded. `validateAgainstCatalog` refuses such a spec outright, but the two
 * predicates are exported separately and neither may assume the other ran.
 */
describe('a layout whose elements form a cycle', () => {
  it('terminates instead of hanging, and reports the hatch it could not place', () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['hatch'] },
        hatch: { type: 'MthdsField', props: { path: 'amount' }, children: ['page'] },
      },
    };
    expect(layoutProblems({ inputs: [text('city', false)] }, spec)).toEqual([
      'hatch: MthdsField delegates amount, which no input has',
    ]);
  });
});

/**
 * A JSON Pointer escapes `~` as `~0` and `/` as `~1`, and `joinPath` is the one
 * place that knows it. The coverage half used to call it for a top-level input
 * and then build every nested level by plain concatenation, so a structure whose
 * member name carried either character produced two different pointers for one
 * field - and the gate then reported an input the layout offers perfectly well
 * as offered nowhere, which costs the produced page silently: the host falls
 * back to the plain form with nothing to say why.
 */
describe('a field name carrying a character a pointer escapes', () => {
  const nested = (child: string): RunField => ({
    kind: 'object',
    name: 'request',
    required: true,
    fields: [text(child, true)],
  });

  it.each(['a/b', 'a~b'])('finds it covered when the layout binds it: %s', (child) => {
    const path = `/inputs/request/${child.replace(/~/g, '~0').replace(/\//g, '~1')}`;
    expect(layoutProblems({ inputs: [nested(child)] }, pageBinding(path))).toEqual([]);
  });

  it('still reports it missing when the layout binds nothing', () => {
    expect(layoutFits({ inputs: [nested('a/b')] }, pageBinding())).toBe(false);
  });
});

/**
 * The gate's own promise, the one `validateAgainstCatalog` keeps and this one
 * did not: it answers with problems, not exceptions. The two predicates are
 * exported separately and a host may run them in either order, so a layout
 * the validator would refuse can reach this gate first - and a throw here
 * arrives instead of the `no` the fallback waits for. The descriptor carries a
 * required input, so a shape the walk survives is still refused, by coverage,
 * and a shape it throws on is refused by the boundary.
 */
describe('a spec malformed in a way the walk itself throws on', () => {
  const descriptor = { inputs: [text('city', true)] };

  it.each([
    ['a null repeat', { root: 'a', elements: { a: { type: 'Text', props: {}, repeat: null } } }],
    [
      'children that are not a list',
      { root: 'a', elements: { a: { type: 'Text', props: {}, children: 5 } } },
    ],
    ['props that are not an object', { root: 'a', elements: { a: { type: 'Text', props: 5 } } }],
    ['a null element', { root: 'a', elements: { a: null } }],
    ['no elements map at all', { root: 'a' }],
  ])('answers no rather than throwing: %s', (_name, malformed) => {
    const spec = malformed as unknown as Spec;
    expect(() => layoutProblems(descriptor, spec)).not.toThrow();
    expect(layoutProblems(descriptor, spec).length).toBeGreaterThan(0);
    expect(layoutFits(descriptor, spec)).toBe(false);
  });

  it('names the shape it could not walk', () => {
    const spec = { root: 'a', elements: { a: null } } as unknown as Spec;
    expect(layoutProblems(descriptor, spec)).toEqual([
      expect.stringContaining('the layout is not a well-formed spec'),
    ]);
  });
});

/**
 * A repeat is a read: the list it lays out is a path the layout mentions, and
 * a method that renames that list leaves the repeat rendering nothing at all,
 * silently, with the coverage half none the wiser on a result page or over an
 * optional list.
 */
describe('a repeat, which reads the list it lays out', () => {
  const repeating = (statePath: string): Spec => ({
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['rows'] },
      rows: { type: 'Stack', props: {}, children: [], repeat: { statePath } },
    },
  });

  it('is refused on a result page when the list it repeats over is gone', () => {
    const result: RunField = {
      kind: 'object',
      name: 'invoice',
      required: true,
      fields: [text('total', true)],
    };
    expect(layoutProblems({ result }, repeating('/result/lines'))).toEqual([
      'rows: repeats over /result/lines, which no result has',
    ]);
  });

  it('is refused on an input page when the optional list it repeats over is gone', () => {
    const optional: RunField = {
      kind: 'list',
      name: 'lines',
      required: false,
      item: text('label', true),
    };
    expect(layoutProblems({ inputs: [optional] }, repeating('/inputs/rows'))).toEqual([
      'rows: repeats over /inputs/rows, which no input has',
    ]);
  });

  it('resolves a relative repeat through the one above it', () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['division'] },
        division: {
          type: 'Stack',
          props: {},
          repeat: { statePath: '/result/divisions' },
          children: ['team'],
        },
        team: { type: 'Stack', props: {}, repeat: { statePath: { $item: 'teams' } }, children: [] },
      },
    };
    const result: RunField = {
      kind: 'object',
      name: 'league',
      required: true,
      fields: [
        {
          kind: 'list',
          name: 'divisions',
          required: true,
          item: { kind: 'object', name: 'division', required: true, fields: [text('name', true)] },
        },
      ],
    };
    expect(layoutProblems({ result }, spec)).toEqual([
      'team: repeats over /result/divisions/0/teams, which no result has',
    ]);
  });

  it("leaves a repeat over the layout's own scratch state alone", () => {
    expect(layoutProblems({ inputs: [text('city', false)] }, repeating('/ui/rows'))).toEqual([]);
  });
});

/**
 * One rule for a bound path, on both pages, and it is the rule the read side
 * and the validator already apply: `/inputs` is the person's, `/result` is
 * the run's, and anything else is the layout's own scratch state. A `Switch`
 * bound to `/ui/showDetails` is the natural way to drive a `visible`
 * condition, and the write side used to refuse it on an input page with a
 * message naming an input nobody had asked for.
 */
describe('a path the layout binds', () => {
  const binding = (path: string): Spec => ({
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['toggle'] },
      toggle: {
        type: 'Switch',
        props: { label: 'Show details', name: 'details', checked: { $bindState: path } },
        children: [],
      },
    },
  });
  const inputPage = { inputs: [text('city', false)] };
  const resultPage = { result: text('summary', true) };

  it("may be the layout's own scratch state, on an input page", () => {
    expect(layoutProblems(inputPage, binding('/ui/showDetails'))).toEqual([]);
  });

  it("may be the layout's own scratch state, on a result page", () => {
    expect(layoutProblems(resultPage, binding('/ui/showDetails'))).toEqual([]);
  });

  it.each([
    ['an input page', inputPage],
    ['a result page', resultPage],
  ])('may not be under /result, which the run fills: %s', (_name, descriptor) => {
    expect(layoutProblems(descriptor, binding('/result/total'))).toEqual([
      '/result/total is bound; a layout may not write into /result, which the run fills',
    ]);
  });
});
