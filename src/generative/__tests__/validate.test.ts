import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
import { formatProblems, validateAgainstCatalog } from '../validate';

/**
 * The check a host runs on a layout before it renders it, beside `layoutFits`.
 *
 * A model writes the layout, so every rule here exists because a run broke it:
 * a component the catalog does not have, a prop it does not take, a literal of
 * the wrong type, a `Tabs` whose panels do not match its tabs, a heading order
 * that reads as a skipped section. The specs are written by hand because each
 * is the smallest shape that trips one rule - the corpus is what proves the
 * validator accepts the layouts we actually captured.
 */

describe('the validator', () => {
  it('rejects an unknown component, an unknown prop and a bad literal', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: { direction: 'sideways' }, children: ['a', 'b'] },
        a: { type: 'Carousel', props: {}, children: [] },
        b: { type: 'Heading', props: { text: 'x', size: 'xl' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('unknown component type "Carousel"');
    expect(text).toContain('Heading has no prop "size"');
    expect(text).toContain('Stack.direction');
  });

  it('wants one child per tab or step, two per split, and no Button as a panel', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Split', props: { ratio: '1:2' }, children: ['tabs', 'steps', 'x'] },
        tabs: {
          type: 'Tabs',
          props: {
            tabs: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
          children: ['a'],
        },
        steps: { type: 'Steps', props: { steps: ['One', 'Two'] }, children: ['a', 'run'] },
        a: { type: 'Stack', props: {}, children: [] },
        x: { type: 'Stack', props: {}, children: [] },
        run: { type: 'Button', props: { label: 'Run' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('Tabs declares 2 panels but has 1 child');
    expect(text).toContain('Steps has a Button as a direct child');
    expect(text).toContain('Split takes exactly 2 children (left, right)');
  });

  it('refuses a heading that skips a level, in render order', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['title', 'section', 'sub'] },
        title: { type: 'Heading', props: { text: 'Trip', level: 'h1' }, children: [] },
        section: { type: 'Heading', props: { text: 'Where', level: 'h3' }, children: [] },
        sub: { type: 'Heading', props: { text: 'Fine', level: 'h4' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('[section] Heading jumps to h3 after h1');
    expect(text).not.toContain('[sub]');
  });

  it('refuses an icon the catalog does not name', () => {
    const verdict = validateAgainstCatalog({
      root: 'i',
      elements: { i: { type: 'Icon', props: { name: 'Unicorn' }, children: [] } },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('Icon.name');
  });

  it('accepts a bound prop where a literal would be the wrong type', () => {
    const verdict = validateAgainstCatalog({
      root: 'h',
      elements: {
        h: { type: 'Heading', props: { text: { $state: '/result/name' } }, children: [] },
      },
    });
    expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
  });

  it('refuses an element that omits a prop the component requires', () => {
    const verdict = validateAgainstCatalog({
      root: 'h',
      elements: { h: { type: 'Heading', props: {}, children: [] } },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('Heading is missing required prop "text"');
  });

  /**
   * An element the root never reaches is a branch the model wrote and forgot to
   * attach. `stream.ts` keeps it in the JSONL on purpose so this can say so.
   */
  it('refuses an element the root does not reach', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: { direction: 'vertical' }, children: [] },
        stranded: { type: 'Heading', props: { text: 'Nobody sees me' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('not reachable');
  });

  /**
   * The renderer walks children to paint the page, so a cycle is a stack
   * overflow in the host rather than an odd-looking page. json-render's own
   * `validateSpec` accepts one without a word.
   */
  it('refuses an element that is its own descendant', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: { page: { type: 'Stack', props: { direction: 'vertical' }, children: ['page'] } },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('is its own descendant');
  });
});

/**
 * The `on` field, which the prop checks above never reach.
 *
 * A layout says as much through its event bindings as through its props, and
 * both directions of getting them wrong are silent: an action nothing handles
 * renders a button that does nothing, and a state write into a tree the host
 * owns puts a value in the run payload that the person never entered.
 */
describe('the actions a layout binds', () => {
  // Cast, because half of these are shapes the type forbids and the runtime
  // still receives: a stored layout is JSON a model wrote, not a value this
  // package constructed.
  const withPress = (press: unknown): Spec =>
    ({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: { direction: 'vertical' }, children: ['cta'] },
        cta: { type: 'Cta', props: { label: 'Plan my trip' }, children: [], on: { press } },
      },
    }) as unknown as Spec;

  it('accepts the pair an input page ends on', () => {
    const verdict = validateAgainstCatalog(
      withPress([{ action: 'validateForm' }, { action: 'run' }]),
    );
    expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
  });

  it('refuses an action no catalog and no runtime has', () => {
    const verdict = validateAgainstCatalog(withPress([{ action: 'runMethod' }]));
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('unknown action "runMethod"');
  });

  it('refuses a write into the inputs the person fills', () => {
    const verdict = validateAgainstCatalog(
      withPress([
        { action: 'setState', params: { statePath: '/inputs/request/currency', value: 'EUR' } },
        { action: 'run' },
      ]),
    );
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('a layout may not write into /inputs');
  });

  it('refuses a write into the result the run fills', () => {
    const verdict = validateAgainstCatalog(
      withPress({ action: 'pushState', params: { statePath: '/result/lines', value: {} } }),
    );
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('a layout may not write into /result');
  });

  it("leaves the layout's own scratch state alone", () => {
    const verdict = validateAgainstCatalog(
      withPress([{ action: 'setState', params: { statePath: '/activeTab', value: 'stay' } }]),
    );
    expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
  });

  /**
   * The ban covers every destination an action writes, not the one parameter
   * named `statePath` on the three obvious writers. `validateForm` writes its
   * verdict at its own `statePath`; `pushState` clears a second path after it
   * appends; and the runtime supplies a missing leading slash rather than
   * refusing the path, so `inputs/city` is `/inputs/city` by the time it is
   * written. Each of these reached `/inputs` past a check that read only
   * `setState`'s, `pushState`'s and `removeState`'s `statePath`.
   */
  it('refuses a validateForm whose verdict would land in the inputs', () => {
    const verdict = validateAgainstCatalog(
      withPress([{ action: 'validateForm', params: { statePath: '/inputs/city' } }]),
    );
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain(
      'calls validateForm on "/inputs/city": a layout may not write into /inputs',
    );
  });

  it('refuses a pushState that clears an input on the way', () => {
    const verdict = validateAgainstCatalog(
      withPress([
        {
          action: 'pushState',
          params: { statePath: '/draft/tags', value: 'x', clearStatePath: '/inputs/city' },
        },
      ]),
    );
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain(
      'calls pushState with clearStatePath "/inputs/city": a layout may not write into /inputs',
    );
  });

  it('judges a destination with the leading slash the runtime will give it', () => {
    const verdict = validateAgainstCatalog(
      withPress([{ action: 'setState', params: { statePath: 'inputs/city', value: 'Lyon' } }]),
    );
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('a layout may not write into /inputs');
  });

  it('refuses a destination that is computed rather than named', () => {
    const verdict = validateAgainstCatalog(
      withPress([{ action: 'setState', params: { statePath: { $state: '/target' }, value: 1 } }]),
    );
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('not a literal string');
  });

  it('lets validateForm write its verdict where the runtime puts it by default', () => {
    const verdict = validateAgainstCatalog(
      withPress([
        { action: 'validateForm', params: { statePath: '/formValidation' } },
        { action: 'run' },
      ]),
    );
    expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
  });
});

/**
 * The other door to a dead button. A `Cta` emits `press` and nothing else, so
 * `on.click` bound to a perfectly good `run` never fires - and the action check
 * alone, which reads the name and not the event, accepted the page. The
 * events a component emits are what its definition declares, so the check is
 * the same for every catalog.
 */
describe('the event a layout binds', () => {
  const bound = (type: string, event: string, props: Record<string, unknown>): Spec =>
    ({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: { direction: 'vertical' }, children: ['el'] },
        el: { type, props, children: [], on: { [event]: [{ action: 'run' }] } },
      },
    }) as unknown as Spec;

  it('must be one the component emits', () => {
    const verdict = validateAgainstCatalog(bound('Cta', 'click', { label: 'Plan my trip' }));
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain(
      '[el] on.click: Cta never emits "click" (it emits: press)',
    );
  });

  it('is refused on a component that emits nothing', () => {
    const verdict = validateAgainstCatalog(bound('Stack', 'press', {}));
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('[el] on.press: Stack emits no events');
  });

  it('is accepted when the component declares it', () => {
    const verdict = validateAgainstCatalog(bound('Cta', 'press', { label: 'Plan my trip' }));
    expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
  });
});

/**
 * An expression on a prop whose values are a fixed set.
 *
 * `{ "$template": "script" }` carries no interpolation, so json-render resolves
 * it to the literal string `script` - and the expression arm skipped the prop's
 * own schema entirely, so the string never met the union that declared it. A
 * renderer that trusted the declared union turned that into a DOM tag name, and
 * a server-rendered host emitted `<script>` from a layout both gates accepted.
 */
describe('an expression where a name belongs', () => {
  const heading = (level: unknown): Spec =>
    ({
      root: 'h',
      elements: { h: { type: 'Heading', props: { text: 'Plan the trip', level }, children: [] } },
    }) as unknown as Spec;

  it('refuses a $template standing in for a heading level', () => {
    const verdict = validateAgainstCatalog(heading({ $template: 'script' }));
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('must be written as a literal');
  });

  it('refuses a $state standing in for a heading level', () => {
    expect(validateAgainstCatalog(heading({ $state: '/result/tag' })).ok).toBe(false);
  });

  it('still accepts the literal names, and an expression where a value belongs', () => {
    expect(validateAgainstCatalog(heading('h3')).ok).toBe(true);
    const bound = validateAgainstCatalog({
      root: 'h',
      elements: {
        h: { type: 'Heading', props: { text: { $state: '/result/name' } }, children: [] },
      },
    });
    expect(bound.ok, formatProblems(bound.problems)).toBe(true);
  });
});

/**
 * The gate's own promise, which docs/generative-ui.md states in as many words:
 * it answers with problems, not exceptions. A host calls it to decide whether
 * rendering is safe, so a throw is the one answer it cannot use - it arrives
 * instead of the `no` that would have triggered the fallback.
 */
describe('a spec malformed in a way json-render itself throws on', () => {
  it.each([
    ['a null repeat', { root: 'a', elements: { a: { type: 'Text', props: {}, repeat: null } } }],
    [
      'children that are not a list',
      { root: 'a', elements: { a: { type: 'Text', props: {}, children: 5 } } },
    ],
    ['props that are not an object', { root: 'a', elements: { a: { type: 'Text', props: 5 } } }],
    ['a null element', { root: 'a', elements: { a: null } }],
    ['no elements map at all', { root: 'a' }],
  ])('answers no rather than throwing: %s', (_name, spec) => {
    const verdict = validateAgainstCatalog(spec as unknown as Spec);
    expect(verdict.ok).toBe(false);
    expect(verdict.problems.length).toBeGreaterThan(0);
  });
});

/**
 * Every walk in the gate recurses, so a deep enough chain overflowed the stack
 * inside the check that exists to keep a layout from reaching the renderer. The
 * cap is what makes the verdict the layout's own rather than the engine's: the
 * same bytes answer the same way under node and in a browser.
 */
describe('a layout nested deeper than the entry renders', () => {
  const chain = (length: number): Spec => {
    const elements: Record<string, unknown> = {};
    for (let index = 0; index < length; index += 1) {
      elements[`e${index}`] = {
        type: 'Text',
        props: { text: 'x' },
        children: index + 1 < length ? [`e${index + 1}`] : [],
      };
    }
    return { root: 'e0', elements } as unknown as Spec;
  };

  it('refuses it, and says so in the layout’s own terms', () => {
    const verdict = validateAgainstCatalog(chain(9000));
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('deep');
  });

  it('does not throw where it used to overflow', () => {
    expect(() => validateAgainstCatalog(chain(9000))).not.toThrow();
  });

  it('leaves a chain of an ordinary depth alone', () => {
    expect(validateAgainstCatalog(chain(40)).ok).toBe(true);
  });
});

/**
 * The containers that take a fixed number of children, and drop the rest in
 * silence. `Workspace` destructures two and the product rules say two, and
 * nothing said so where a layout is judged: a third child rendered nowhere.
 */
describe('a container with a fixed number of children', () => {
  const panel = { type: 'Stack', props: {}, children: [] };

  it('refuses a Workspace with a third child, as it refuses a Split', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Workspace', props: {}, children: ['work', 'rail', 'more'] },
        work: panel,
        rail: panel,
        more: panel,
      },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain(
      'Workspace takes exactly 2 children (work, rail); this one has 3',
    );
  });
});

/**
 * A choice with nothing in it is not one a person can make: a blank dropdown
 * row, a blank pill. The renderer under `Select` cannot even hold one - its
 * primitive throws on an empty value - so the fallback it carried wrote a
 * value the descriptor's enum never listed, and the run gate then refused the
 * run naming a value the person never saw. The refusal moves upstream, to the
 * definition every renderer reads.
 */
describe('a choice with an empty option', () => {
  it.each(['Select', 'Radio', 'Segmented'])('is refused on a %s', (type) => {
    const verdict = validateAgainstCatalog({
      root: 'choice',
      elements: {
        choice: {
          type,
          props: { label: 'Pace', name: 'pace', options: ['', 'slow'] },
          children: [],
        },
      },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain(`${type}.options`);
  });
});
