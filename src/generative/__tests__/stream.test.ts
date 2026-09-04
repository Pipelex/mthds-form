import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
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
