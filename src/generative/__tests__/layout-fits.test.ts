import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { DOCUMENT_FORMATS } from '../../core/file-formats';
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

  it('reads a bare interpolation outside any repeat off the root of the state, as the runtime does', () => {
    const problems = layoutProblems(
      { inputs: [text('city', false)] },
      reading({ label: 'Trip', value: { $template: 'A trip to ${inputs/town}' } }),
    );
    expect(problems).toEqual(['/inputs/town is read, and no input has it']);
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
/**
 * The defect that named this check: a SummaryRow bound to `/inputs/document`,
 * a structure of a url and a filename, rendered `[object Object]`. The path
 * existed, so nothing was stale; the spec validated; the renderer stringified
 * what it was handed. Only the descriptor knows the path is not a value.
 */
describe('a path shown as a value', () => {
  // Optional throughout, so the coverage half has nothing to say.
  const document: RunField = {
    kind: 'document',
    name: 'document',
    required: false,
    formats: DOCUMENT_FORMATS,
  };
  const request: RunField = {
    kind: 'object',
    name: 'request',
    required: false,
    fields: [
      text('city', true),
      { kind: 'number', name: 'budget', required: false, integer: false },
    ],
  };
  const tags: RunField = {
    kind: 'list',
    name: 'tags',
    required: false,
    item: text('tag', true),
  };
  const people: RunField = {
    kind: 'list',
    name: 'people',
    required: false,
    item: { kind: 'object', name: 'person', required: true, fields: [text('name', true)] },
  };
  const inputs = [document, request, tags, people];
  const page = (elements: Record<string, unknown>): Spec =>
    ({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: Object.keys(elements) },
        ...elements,
      },
    }) as unknown as Spec;

  it('is refused when a SummaryRow shows a file', () => {
    const problems = layoutProblems(
      { inputs },
      page({
        row: {
          type: 'SummaryRow',
          props: { label: 'File', value: { $state: '/inputs/document' } },
        },
      }),
    );
    expect(problems).toEqual([
      "row: value shows /inputs/document, which is a file and not a value; a prop that shows a value takes a scalar path, and a file is delegated to the kernel's own control",
    ]);
  });

  it('is refused when a Metric shows a structure, and accepted when it shows a member', () => {
    const whole = page({
      m: { type: 'Metric', props: { label: 'Request', value: { $state: '/inputs/request' } } },
    });
    expect(layoutProblems({ inputs }, whole)).toEqual([
      'm: value shows /inputs/request, which is a structure and not a value; a prop that shows a value takes a scalar path, and a structure is shown through its members',
    ]);
    const member = page({
      m: {
        type: 'Metric',
        props: { label: 'Budget', value: { $state: '/inputs/request/budget' } },
      },
    });
    expect(layoutProblems({ inputs }, member)).toEqual([]);
  });

  it('is refused when a template interpolates a list, which stringifies comma-joined', () => {
    const problems = layoutProblems(
      { inputs },
      page({
        t: { type: 'Text', props: { text: { $template: 'Tagged ${/inputs/tags}' } } },
      }),
    );
    expect(problems).toEqual([
      't: text shows /inputs/tags, which is a list and not a value; a prop that shows a value takes a scalar path, and a list is laid out as a repeat or a DataTable',
    ]);
  });

  it('is accepted in a prop that takes a list, when the path is one: the rows of a DataTable, the links of an AppBar', () => {
    const spec = page({
      table: {
        type: 'DataTable',
        props: { rows: { $state: '/inputs/tags' }, columns: [{ path: 'tag', label: 'Tag' }] },
      },
      bar: { type: 'AppBar', props: { app: 'Tags', links: { $state: '/inputs/tags' } } },
    });
    expect(layoutProblems({ inputs }, spec)).toEqual([]);
  });

  it('is refused in a prop that takes a list when the path is a file, a structure or a value', () => {
    const bar = (path: string): Spec =>
      page({ bar: { type: 'AppBar', props: { app: 'Tags', links: { $state: path } } } });
    expect(layoutProblems({ inputs }, bar('/inputs/document'))).toEqual([
      'bar: links takes a list, and /inputs/document is a file; a prop that takes a list reads a list path',
    ]);
    expect(layoutProblems({ inputs }, bar('/inputs/request'))).toEqual([
      'bar: links takes a list, and /inputs/request is a structure; a prop that takes a list reads a list path',
    ]);
    expect(layoutProblems({ inputs }, bar('/inputs/request/city'))).toEqual([
      'bar: links takes a list, and /inputs/request/city is a value; a prop that takes a list reads a list path',
    ]);
  });

  it('is refused in a prop that takes values when the list is one of structures, which a DataTable takes', () => {
    const spec = page({
      bar: { type: 'AppBar', props: { app: 'People', links: { $state: '/inputs/people' } } },
      table: {
        type: 'DataTable',
        props: { rows: { $state: '/inputs/people' }, columns: [{ path: 'name', label: 'Name' }] },
      },
    });
    expect(layoutProblems({ inputs }, spec)).toEqual([
      'bar: links takes a list of values, and /inputs/people is a list of structures; a list of structures is laid out as a repeat or a DataTable',
    ]);
  });

  it('walks a list prop written as an array literal entry by entry, each shown as a value', () => {
    const spec = page({
      bar: {
        type: 'AppBar',
        props: { app: 'Tags', links: [{ $state: '/inputs/document' }, 'Runs'] },
      },
    });
    expect(layoutProblems({ inputs }, spec)).toEqual([
      "bar: links shows /inputs/document, which is a file and not a value; a prop that shows a value takes a scalar path, and a file is delegated to the kernel's own control",
    ]);
  });

  it('is accepted in a condition, which only asks whether the value is set', () => {
    const spec = page({
      row: {
        type: 'SummaryRow',
        props: {
          label: 'File',
          value: {
            $cond: { $state: '/inputs/document' },
            $then: { $state: '/inputs/request/city' },
            $else: 'none yet',
          },
        },
        visible: { $state: '/inputs/document' },
      },
    });
    expect(layoutProblems({ inputs }, spec)).toEqual([]);
  });

  it('is refused for the item itself inside a repeat over structures, and accepted for a member', () => {
    const lines: RunField = {
      kind: 'list',
      name: 'lines',
      required: false,
      item: { kind: 'object', name: 'line', required: true, fields: [text('name', true)] },
    };
    const result: RunField = {
      kind: 'object',
      name: 'result',
      required: true,
      fields: [lines],
    };
    const shown = (item: string): Spec =>
      ({
        root: 'page',
        elements: {
          page: { type: 'Stack', props: {}, children: ['rows'] },
          rows: {
            type: 'Stack',
            props: {},
            repeat: { statePath: '/result/lines' },
            children: ['line'],
          },
          line: { type: 'Text', props: { text: { $item: item } } },
        },
      }) as unknown as Spec;
    expect(layoutProblems({ result }, shown(''))).toEqual([
      'line: text shows /result/lines/0, which is a structure and not a value; a prop that shows a value takes a scalar path, and a structure is shown through its members',
    ]);
    expect(layoutProblems({ result }, shown('name'))).toEqual([]);
  });

  it('resolves a bare interpolation through the repeat above it, as the runtime does', () => {
    const lines: RunField = {
      kind: 'list',
      name: 'lines',
      required: false,
      item: {
        kind: 'object',
        name: 'line',
        required: true,
        fields: [
          text('name', true),
          { kind: 'object', name: 'detail', required: false, fields: [text('note', true)] },
        ],
      },
    };
    const result: RunField = {
      kind: 'object',
      name: 'result',
      required: true,
      fields: [lines],
    };
    const shown = (template: string): Spec =>
      ({
        root: 'page',
        elements: {
          page: { type: 'Stack', props: {}, children: ['rows'] },
          rows: {
            type: 'Stack',
            props: {},
            repeat: { statePath: '/result/lines' },
            children: ['line'],
          },
          line: { type: 'Text', props: { text: { $template: template } } },
        },
      }) as unknown as Spec;
    expect(layoutProblems({ result }, shown('Detail: ${detail}'))).toEqual([
      'line: text shows /result/lines/0/detail, which is a structure and not a value; a prop that shows a value takes a scalar path, and a structure is shown through its members',
    ]);
    expect(layoutProblems({ result }, shown('Line: ${name}'))).toEqual([]);
    // An empty `${}` is the literal text the runtime renders it as.
    expect(layoutProblems({ result }, shown('Line: ${}'))).toEqual([]);
  });

  it('says nothing of a path the descriptor does not have: the staleness check names it', () => {
    const problems = layoutProblems(
      { inputs },
      page({
        row: { type: 'SummaryRow', props: { label: 'Gone', value: { $state: '/inputs/gone' } } },
      }),
    );
    expect(problems).toEqual(['/inputs/gone is read, and no input has it']);
  });
});

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
    ['an element naming no type', { root: 'a', elements: { a: { type: 7, props: {} } } }],
    [
      'a relative repeat naming no member',
      { root: 'a', elements: { a: { type: 'Stack', props: {}, repeat: { statePath: {} } } } },
    ],
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

  it('writes out a hatch path that is no text without calling its own toString', () => {
    const spec = {
      root: 'a',
      elements: { a: { type: 'MthdsField', props: { path: { toString: 1 } }, children: [] } },
    } as unknown as Spec;
    expect(layoutProblems(descriptor, spec)).toContain(
      'a: MthdsField delegates {"toString":1}, which no input has',
    );
  });

  it('refuses a result that is a list or carries no kind, rather than reading it as a field', () => {
    const spec = {
      root: 'a',
      elements: { a: { type: 'MthdsResult', props: { path: '/result' }, children: [] } },
    } as unknown as Spec;
    for (const result of [[], {}]) {
      expect(layoutProblems({ result } as never, spec)).toEqual([
        'the descriptor\'s "result" is not a field',
      ]);
    }
  });

  it('holds a half of the descriptor written as null to be absent', () => {
    const spec = {
      root: 'a',
      elements: { a: { type: 'MthdsField', props: { path: '/inputs/city' }, children: [] } },
    } as unknown as Spec;
    expect(layoutProblems({ ...descriptor, result: null } as never, spec)).toEqual([]);
    expect(layoutProblems({ inputs: null, result: text('total', true) } as never, spec)).toEqual([
      'a: MthdsField delegates /inputs/city, which no input has',
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
 * The two item-relative forms the prompt teaches for the inside of a repeat,
 * `{ "$item": "field" }` to read a member of the current item and
 * `{ "$bindItem": "field" }` to bind one. Neither is absolute, so a walk that
 * collected only `$state` and `$bindState` never saw them: a renamed member of
 * a repeated item rendered blank on a result page with both gates green, and
 * an `Input` bound into `/result` through `$bindItem` wrote into the tree the
 * run fills past a ban that read only `$bindState`. They resolve as a relative
 * hatch path does - through the repeat above them, at its first index.
 */
describe('a path named relative to the current item', () => {
  const lines: RunField = {
    kind: 'list',
    name: 'lines',
    required: true,
    item: { kind: 'object', name: 'line', required: true, fields: [text('label', true)] },
  };
  const result: RunField = { kind: 'object', name: 'invoice', required: true, fields: [lines] };

  const inRepeat = (statePath: string, type: string, props: Record<string, unknown>): Spec =>
    ({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['rows'] },
        rows: { type: 'Stack', props: {}, children: ['cell'], repeat: { statePath } },
        cell: { type, props, children: [] },
      },
    }) as unknown as Spec;

  it('is refused when it reads a member the item no longer has', () => {
    const spec = inRepeat('/result/lines', 'Text', { text: { $item: 'name' } });
    expect(layoutProblems({ result }, spec)).toEqual([
      '/result/lines/0/name is read, and no result has it',
    ]);
  });

  it('is refused when a template interpolates a member the item no longer has', () => {
    const spec = inRepeat('/result/lines', 'Text', { text: { $template: 'Line: ${name}' } });
    expect(layoutProblems({ result }, spec)).toEqual([
      '/result/lines/0/name is read, and no result has it',
    ]);
  });

  it('is refused when it binds a member the item no longer has', () => {
    const spec = inRepeat('/inputs/lines', 'Input', {
      label: 'Quantity',
      value: { $bindItem: 'qty' },
    });
    expect(layoutProblems({ inputs: [lines] }, spec)).toEqual([
      '/inputs/lines/0/qty is bound, and no input has it',
    ]);
  });

  it('may not bind into the result, which the run fills', () => {
    const spec = inRepeat('/result/lines', 'Input', {
      label: 'Label',
      value: { $bindItem: 'label' },
    });
    expect(layoutProblems({ result }, spec)).toEqual([
      '/result/lines/0/label is bound; a layout may not write into /result, which the run fills',
    ]);
  });

  it('is accepted when the item still has the member, read or bound', () => {
    expect(
      layoutProblems({ result }, inRepeat('/result/lines', 'Text', { text: { $item: 'label' } })),
    ).toEqual([]);
    expect(
      layoutProblems(
        { inputs: [lines] },
        inRepeat('/inputs/lines', 'Input', { label: 'Label', value: { $bindItem: 'label' } }),
      ),
    ).toEqual([]);
  });

  it('is found in a visible condition as in a prop', () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['rows'] },
        rows: {
          type: 'Stack',
          props: {},
          children: ['cell'],
          repeat: { statePath: '/result/lines' },
        },
        cell: {
          type: 'Text',
          props: { text: 'Paid' },
          children: [],
          visible: { $item: 'settled', eq: true },
        },
      },
    };
    expect(layoutProblems({ result }, spec)).toEqual([
      '/result/lines/0/settled is read, and no result has it',
    ]);
  });

  it('is refused outside any repeat, where it resolves to nothing at all', () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['cell'] },
        cell: { type: 'Text', props: { text: { $item: 'label' } }, children: [] },
      },
    };
    expect(layoutProblems({ result }, spec)).toEqual([
      'cell: reads the current item, and no repeat above it has one',
    ]);
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

describe('a Picture on a result page', () => {
  const result: RunField = {
    kind: 'object',
    name: 'deck',
    required: true,
    fields: [
      text('title', true),
      {
        kind: 'list',
        name: 'slides',
        required: true,
        item: {
          kind: 'object',
          name: 'slide',
          required: true,
          fields: [
            { kind: 'image', name: 'mockup', required: true, formats: [] },
            text('name', true),
          ],
        },
      },
    ],
  };
  const picture = (path: string, repeated: boolean): Spec => ({
    root: 'page',
    elements: {
      page: {
        type: 'Stack',
        props: {},
        children: ['pic'],
        ...(repeated ? { repeat: { statePath: '/result/slides', key: 'name' } } : {}),
      },
      pic: { type: 'Picture', props: { path, alt: 'x' }, children: [] },
    },
  });

  it('is accepted when it shows an image the result has, inside a repeat or by its absolute path', () => {
    expect(layoutProblems({ result }, picture('mockup', true))).toEqual([]);
    expect(layoutProblems({ result }, picture('/result/slides/0/mockup', false))).toEqual([]);
  });

  it('is refused when its path names nothing the result has', () => {
    expect(layoutProblems({ result }, picture('poster', true))).toContain(
      'pic: Picture shows "poster", which no result has',
    );
  });

  it('is refused when its path holds something other than an image', () => {
    expect(layoutProblems({ result }, picture('name', true))).toContain(
      'pic: Picture shows /result/slides/0/name, which holds a text, not an image',
    );
  });
});

describe('a repeat inside a Grid', () => {
  const RESULT: RunField = {
    kind: 'object',
    name: 'plan',
    required: true,
    fields: [
      {
        kind: 'list',
        name: 'days',
        required: true,
        item: { kind: 'object', name: 'day', required: true, fields: [text('title', true)] },
      },
    ],
  };
  const grid = (repeatOn: 'grid' | 'child'): Spec => ({
    root: 'days',
    elements: {
      days: {
        type: 'Grid',
        props: { columns: 2, gap: null },
        ...(repeatOn === 'grid' ? { repeat: { statePath: '/result/days' } } : {}),
        children: ['day'],
      },
      day: {
        type: 'Heading',
        props: { text: { $item: 'title' }, level: 'h3' },
        ...(repeatOn === 'child' ? { repeat: { statePath: '/result/days' } } : {}),
        children: [],
      },
    },
  });

  it('refuses a Grid whose only child carries the repeat, which puts every item in one cell', () => {
    expect(layoutProblems({ result: RESULT }, grid('child'))).toEqual([
      expect.stringContaining("days: Grid's only child day carries the repeat"),
    ]);
  });

  it('accepts the repeat on the Grid itself', () => {
    expect(layoutProblems({ result: RESULT }, grid('grid'))).toEqual([]);
  });

  it('accepts a Grid with a repeat of its own whose only child repeats over each item, a list in every cell', () => {
    const nested: RunField = {
      kind: 'object',
      name: 'plan',
      required: true,
      fields: [
        {
          kind: 'list',
          name: 'days',
          required: true,
          item: {
            kind: 'object',
            name: 'day',
            required: true,
            fields: [
              {
                kind: 'list',
                name: 'activities',
                required: true,
                item: text('activity', true),
              },
            ],
          },
        },
      ],
    };
    const spec: Spec = {
      root: 'days',
      elements: {
        days: {
          type: 'Grid',
          props: { columns: 2, gap: null },
          repeat: { statePath: '/result/days' },
          children: ['activities'],
        },
        activities: {
          type: 'Stack',
          props: { direction: 'vertical', gap: null, align: null, justify: null },
          repeat: { statePath: 'activities' },
          children: [],
        },
      },
    };
    expect(layoutProblems({ result: nested }, spec)).toEqual([]);
  });
});

describe("a share's parts", () => {
  const costs = (item: RunField): RunField => ({
    kind: 'object',
    name: 'plan',
    required: true,
    fields: [{ kind: 'list', name: 'costs', required: true, item }],
  });
  const LINE: RunField = {
    kind: 'object',
    name: 'line',
    required: true,
    fields: [
      text('category', true),
      { kind: 'number', name: 'amount', required: true, integer: false },
    ],
  };
  /** What every refusal of a part says a part is. */
  const HOW =
    ' each part is written as a structure with a "category" member and an "amount" member holding a number, or the whole list is read with { "$state" }';
  const bar = (labelKey: string, valueKey: string): Spec => ({
    root: 'bar',
    elements: {
      bar: {
        type: 'ProportionBar',
        props: {
          label: 'Costs',
          total: null,
          of: null,
          unit: null,
          items: { $state: '/result/costs' },
          labelKey,
          valueKey,
        },
        children: [],
      },
    },
  });

  it('accepts a list of structures whose label member exists and whose value member is a number', () => {
    expect(layoutProblems({ result: costs(LINE) }, bar('category', 'amount'))).toEqual([]);
  });

  it('refuses a misspelt key, a value that is not a number, and a list of scalars', () => {
    expect(layoutProblems({ result: costs(LINE) }, bar('category', 'amonut'))).toEqual([
      expect.stringContaining('valueKey "amonut" is no member of /result/costs'),
    ]);
    expect(layoutProblems({ result: costs(LINE) }, bar('amount', 'category'))).toEqual([
      expect.stringContaining('valueKey "category" holds a text, not a number'),
    ]);
    expect(layoutProblems({ result: costs(text('cost', true)) }, bar('a', 'b'))).toEqual([
      expect.stringContaining('ProportionBar reads /result/costs, a list of text values'),
    ]);
  });

  /**
   * Parts written out inline. The catalog takes `items` as a list of anything,
   * so a null, a word or an expression standing for a whole part passed both
   * checks, and the renderer, which reads each part by member name, threw on
   * the null and drew nothing for the rest.
   */
  const inline = (items: unknown[]): Spec => {
    const spec = bar('category', 'amount');
    spec.elements.bar!.props = { ...spec.elements.bar!.props, items };
    return spec;
  };

  it('accepts parts written out as structures naming both members, whatever their members read', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          { category: 'Food', amount: { $state: '/result/costs/0/amount' } },
          { category: 'Lodging', amount: 120 },
        ]),
      ),
    ).toEqual([]);
  });

  it('reads a part as an expression only by the keys json-render resolves, as the catalog check does', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([{ $label: 'x', category: 'Food', amount: 4 }]),
      ),
    ).toEqual([]);
  });

  it('refuses a part written out as a null, a scalar, an expression that reads no structure or a structure missing a member', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          null,
          'Lodging',
          { $template: '${/result/costs/0/category}' },
          { category: 'Food' },
          { category: 'Food', amount: 4 },
        ]),
      ),
    ).toEqual([
      `bar: ProportionBar's part 1 is null, not a structure;${HOW}`,
      `bar: ProportionBar's part 2 is "Lodging", not a structure;${HOW}`,
      `bar: ProportionBar's part 3 is an expression that reads no structure;${HOW}`,
      `bar: ProportionBar's part 4 has no "amount" member;${HOW}`,
    ]);
  });

  /**
   * A part read whole, `{ "$state": "/result/costs/0" }`, draws exactly as a
   * part written out does when the path holds a structure with both members,
   * so it is held to that and not refused for being an expression.
   */
  it('takes a part read from a structure that has both members, its amount a number', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([{ $state: '/result/costs/0' }, { $state: '/result/costs/1' }]),
      ),
    ).toEqual([]);
  });

  it('refuses a part read from a path that holds no such structure', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([{ $state: '/result/costs/0/category' }, { $state: '/result/costs' }]),
      ),
    ).toEqual([
      `bar: ProportionBar's part 1 reads /result/costs/0/category, which holds a text value;${HOW}`,
      `bar: ProportionBar's part 2 reads /result/costs, which holds a list;${HOW}`,
    ]);
  });

  /**
   * The renderer reads a part's amount as a number, or a text that writes
   * one out, and draws no share for anything else, silently; a written-out
   * part is held to that as a part read from the payload is held to a number
   * member.
   */
  it('takes an inline amount written as a text that writes a number out, as the renderer draws it', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          { category: 'Food', amount: '40' },
          { category: 'Lodging', amount: '12.5' },
        ]),
      ),
    ).toEqual([]);
  });

  it('refuses an inline amount that is not a number, or that reads a path holding no number', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          { category: 'Food', amount: 'abc' },
          { category: 'Food', amount: ' ' },
          { category: 'Food', amount: { $state: '/result/costs/0/category' } },
          { category: 'Food', amount: { $computed: 'total' } },
          { category: 'Food', amount: { $state: '/result/costs/0/amount' } },
          { category: 'Food', amount: { $state: '/ui/scratch' } },
        ]),
      ),
    ).toEqual([
      `bar: ProportionBar's part 1's "amount" is "abc", not a number;${HOW}`,
      `bar: ProportionBar's part 2's "amount" is " ", not a number;${HOW}`,
      `bar: ProportionBar's part 3's "amount" reads /result/costs/0/category, which holds a text value, not a number;${HOW}`,
      `bar: ProportionBar's part 4's "amount" is a $computed, which a page has no function to resolve, not a number;${HOW}`,
    ]);
  });

  /**
   * A template writes a text out, which the renderer draws as a share when it
   * writes a number: one that writes out a single path's value and nothing
   * else does exactly that when the path holds a number, so it is read as
   * that path; one with words beside its value cannot be known to.
   */
  it('reads a template amount that writes one value out as the path it reads', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          { category: 'Food', amount: { $template: '${/result/costs/0/amount}' } },
          { category: 'Food', amount: { $template: ' ${/result/costs/1/amount} ' } },
          { category: 'Food', amount: { $template: '${/ui/scratch}' } },
          { category: 'Food', amount: { $template: '40' } },
        ]),
      ),
    ).toEqual([]);
  });

  it('refuses a template amount that writes more than a number out, or reads no number', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          { category: 'Food', amount: { $template: '${/result/costs/0/amount} EUR' } },
          { category: 'Food', amount: { $template: '${/result/costs/0/category}' } },
          { category: 'Food', amount: { $template: 'forty' } },
        ]),
      ),
    ).toEqual([
      `bar: ProportionBar's part 1's "amount" is a template that writes text beside its value, not a number;${HOW}`,
      `bar: ProportionBar's part 2's "amount" reads /result/costs/0/category, which holds a text value, not a number;${HOW}`,
      `bar: ProportionBar's part 3's "amount" is a template that writes "forty" out, not a number;${HOW}`,
    ]);
  });

  /**
   * json-render resolves `$index` to a number and a `$cond` to either branch,
   * each resolved again, so each is read as what it resolves to.
   */
  it('reads a part or an amount through an index or either branch of a condition', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          { category: 'Food', amount: { $index: true } },
          {
            $cond: { $state: '/ui/open' },
            $then: { $state: '/result/costs/0' },
            $else: { category: 'None', amount: 0 },
          },
          {
            category: 'Food',
            amount: { $cond: true, $then: 4, $else: { $state: '/result/costs/1/amount' } },
          },
        ]),
      ),
    ).toEqual([]);
  });

  it('refuses a conditional part or amount when either branch draws no share', () => {
    expect(
      layoutProblems(
        { result: costs(LINE) },
        inline([
          { $cond: { $state: '/ui/open' }, $then: { $state: '/result/costs/0' }, $else: 'none' },
          {
            category: 'Food',
            amount: { $cond: true, $then: 4, $else: { $state: '/result/costs/0/category' } },
          },
        ]),
      ),
    ).toEqual([
      `bar: ProportionBar's part 1 is "none", not a structure;${HOW}`,
      `bar: ProportionBar's part 2's "amount" reads /result/costs/0/category, which holds a text value, not a number;${HOW}`,
    ]);
  });

  /** A binding resolves to the value at its path, as a read does. */
  it('reads a part or an amount bound with $bindState as the path it binds', () => {
    const spec = inline([
      { $bindState: '/inputs/costs/0' },
      { category: 'Food', amount: { $bindState: '/inputs/costs/0/category' } },
    ]);
    const list: RunField = { kind: 'list', name: 'costs', required: false, item: LINE };
    expect(layoutProblems({ inputs: [list] }, spec)).toContain(
      `bar: ProportionBar's part 2's "amount" reads /inputs/costs/0/category, which holds a text value, not a number;${HOW}`,
    );
    expect(layoutProblems({ inputs: [list] }, spec).join('\n')).not.toContain('part 1');
  });
});

/**
 * A repeat over a path the descriptor owns, which holds something other than a
 * list. json-render maps over what the path holds, so a text there throws in
 * the parent's render and the whole subtree is dropped, past both checks; a
 * structure renders nothing.
 */
describe('a repeat over a path that holds no list', () => {
  const result: RunField = {
    kind: 'object',
    name: 'invoice',
    required: true,
    fields: [
      text('title', true),
      { kind: 'object', name: 'customer', required: true, fields: [text('name', true)] },
      {
        kind: 'list',
        name: 'lines',
        required: true,
        item: { kind: 'object', name: 'line', required: true, fields: [text('label', true)] },
      },
    ],
  };
  const repeating = (statePath: string): Spec => ({
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['rows'] },
      rows: { type: 'Stack', props: {}, children: [], repeat: { statePath } },
    },
  });

  it('is refused on a result page, saying what the path holds', () => {
    expect(layoutProblems({ result }, repeating('/result/title'))).toEqual([
      'rows: repeats over /result/title, which holds a text value, not a list',
    ]);
    expect(layoutProblems({ result }, repeating('/result/customer'))).toEqual([
      'rows: repeats over /result/customer, which holds a structure, not a list',
    ]);
  });

  it('is refused on an input page', () => {
    expect(layoutProblems({ inputs: [text('topic', false)] }, repeating('/inputs/topic'))).toEqual([
      'rows: repeats over /inputs/topic, which holds a text value, not a list',
    ]);
  });

  it('names a choice with the article its kind takes', () => {
    const tone: RunField = {
      kind: 'enum',
      name: 'tone',
      required: false,
      options: ['dry', 'warm'],
    } as RunField;
    expect(layoutProblems({ inputs: [tone] }, repeating('/inputs/tone'))).toEqual([
      'rows: repeats over /inputs/tone, which holds an enum value, not a list',
    ]);
  });

  it('is accepted over the list itself', () => {
    expect(layoutProblems({ result }, repeating('/result/lines'))).toEqual([]);
  });
});

/**
 * A prop that takes a list, written as an expression that can never be one: a
 * `$template` writes a text, and a binding names a path whose kind is the
 * descriptor's to say. Either rendered an empty list, past both checks.
 */
describe('a list-taking prop written as an expression that is not a list read', () => {
  const steps = (value: unknown): Spec =>
    ({
      root: 's',
      elements: {
        s: {
          type: 'Steps',
          props: { steps: value, nextLabel: null, backLabel: null },
          children: [],
        },
      },
    }) as unknown as Spec;

  it('is refused as a template, which writes a text', () => {
    expect(layoutProblems({ inputs: [] }, steps({ $template: '${/ui/a}, ${/ui/b}' }))).toEqual([
      's: steps takes a list, and a $template writes a text; a prop that takes a list reads a list path',
    ]);
  });

  it('holds a binding to the kind of the path it names, as it holds a read', () => {
    expect(
      layoutProblems({ inputs: [text('topic', true)] }, steps({ $bindState: '/inputs/topic' })),
    ).toContain(
      's: steps takes a list, and /inputs/topic is a value; a prop that takes a list reads a list path',
    );
  });
});
