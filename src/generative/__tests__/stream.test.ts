import type { Spec } from '@json-render/core';
import { afterEach, describe, expect, it } from 'vitest';
import { jsonlLines, specFromJsonl, specToJsonl } from '../stream';

/**
 * The wire format a produced layout arrives in, and back.
 *
 * json-render's format is one JSON patch per line, and the ORDER is the
 * contract: the root first, then every element with its parent already
 * emitted, so a renderer can paint a partial tree at every line - which is
 * what makes a layout watchable while a model is still writing it. A stored
 * layout is these bytes exactly as the model emitted them, so this bridge is
 * what a host compiles before it validates.
 */

const spec: Spec = {
  root: 'page',
  elements: {
    page: { type: 'Stack', props: {}, children: ['head', 'body'] },
    body: { type: 'Card', props: {}, children: ['note'] },
    head: { type: 'Heading', props: { text: 'Trip' }, children: [] },
    note: { type: 'Text', props: { text: 'Where to' }, children: [] },
  },
  state: { inputs: { city: '' } },
};

function paths(jsonl: string): string[] {
  return jsonlLines(jsonl).map((line) => JSON.parse(line).path as string);
}

describe('a spec rendered as patch lines', () => {
  it('opens with the root', () => {
    const first = JSON.parse(jsonlLines(specToJsonl(spec))[0]!);
    expect(first).toEqual({ op: 'add', path: '/root', value: 'page' });
  });

  it('emits every parent before its children, breadth first', () => {
    const order = paths(specToJsonl(spec));
    const at = (key: string) => order.indexOf(`/elements/${key}`);
    expect(at('page')).toBeLessThan(at('head'));
    expect(at('page')).toBeLessThan(at('body'));
    expect(at('body')).toBeLessThan(at('note'));
  });

  it('emits the state after the elements, one line per top-level key', () => {
    const order = paths(specToJsonl(spec));
    expect(order.at(-1)).toBe('/state/inputs');
  });

  /** Kept rather than dropped, so a validator can report it as unreachable. */
  it('still emits an element the root does not reach', () => {
    const orphaned: Spec = {
      ...spec,
      elements: { ...spec.elements, stray: { type: 'Text', props: { text: '?' }, children: [] } },
    };
    expect(paths(specToJsonl(orphaned))).toContain('/elements/stray');
  });

  it('escapes a key that would otherwise read as a pointer', () => {
    const awkward: Spec = {
      root: 'a/b',
      elements: { 'a/b': { type: 'Stack', props: {}, children: [] } },
    };
    expect(paths(specToJsonl(awkward))).toContain('/elements/a~1b');
  });
});

describe('patch lines compiled back to a spec', () => {
  it('round-trips what it rendered', () => {
    expect(specFromJsonl(specToJsonl(spec))).toEqual(spec);
  });

  it('skips the blank lines a stream arrives with', () => {
    const padded = specToJsonl(spec).replace('\n', '\n\n');
    expect(specFromJsonl(padded)).toEqual(spec);
  });
});

/**
 * A stored layout is untrusted text, and compiling is where it first becomes
 * objects - before the prompt hash, before the validator, before `layoutFits`.
 * So the one class of harm a verdict cannot undo has to be stopped here.
 */
describe('a patch line that would reach a prototype', () => {
  // A failure here is a polluted realm for every test after it. Undo the one
  // key these lines write, so a red assertion stays one red assertion.
  afterEach(() => {
    delete (Object.prototype as unknown as Record<string, unknown>).zzPolluted;
  });

  const withPath = (path: string) =>
    [
      JSON.stringify({ op: 'add', path: '/root', value: 'page' }),
      JSON.stringify({ op: 'add', path, value: 'polluted' }),
    ].join('\n');

  it.each(['/__proto__/zzPolluted', '/constructor/prototype/zzPolluted', '/elements/~0~1/../x'])(
    'leaves Object.prototype alone: %s',
    (path) => {
      specFromJsonl(withPath(path));
      expect(({} as Record<string, unknown>).zzPolluted).toBeUndefined();
    },
  );

  it('still compiles the lines around it', () => {
    const spec = specFromJsonl(withPath('/__proto__/zzPolluted'));
    expect(spec.root).toBe('page');
  });

  /**
   * The second pointer. A `copy` from `/__proto__` to `/scratch` names no
   * forbidden segment in its `path`, and what it parks at `/scratch` is a
   * REFERENCE to `Object.prototype` - the applier does not clone - so the next
   * `add` at `/scratch/<key>` writes onto every object in the realm through
   * a path the `path`-only guard waved through.
   */
  it.each(['copy', 'move'])('leaves Object.prototype alone when a %s reads from one', (op) => {
    specFromJsonl(
      [
        JSON.stringify({ op: 'add', path: '/root', value: 'page' }),
        JSON.stringify({ op, from: '/__proto__', path: '/scratch' }),
        JSON.stringify({ op: 'add', path: '/scratch/zzPolluted', value: 'polluted' }),
      ].join('\n'),
    );
    expect(({} as Record<string, unknown>).zzPolluted).toBeUndefined();
  });
});

/**
 * A host compiles before it validates, so a throw here arrives before there is
 * a verdict to act on and the documented fallback never fires. Both shapes below
 * are reachable from produced text and both used to be fatal to the whole
 * layout, not just to their own line.
 */
describe('a patch line the compiler refuses', () => {
  const around = (bad: string) =>
    [
      JSON.stringify({ op: 'add', path: '/root', value: 'page' }),
      bad,
      JSON.stringify({ op: 'add', path: '/elements/page', value: { type: 'Text', props: {} } }),
    ].join('\n');

  it.each([
    [
      'a test op whose value does not match',
      JSON.stringify({ op: 'test', path: '/root', value: 'other' }),
    ],
    ['a path that is not a string', JSON.stringify({ op: 'add', path: 5, value: 'x' })],
  ])('skips it rather than throwing: %s', (_name, bad) => {
    expect(() => specFromJsonl(around(bad))).not.toThrow();
  });

  it('keeps every line around the one it skipped', () => {
    const spec = specFromJsonl(
      around(JSON.stringify({ op: 'test', path: '/root', value: 'other' })),
    );
    expect(spec.root).toBe('page');
    expect(spec.elements.page?.type).toBe('Text');
  });
});
