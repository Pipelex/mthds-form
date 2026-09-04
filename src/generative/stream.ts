import type { Spec } from '@json-render/core';
import { compileSpecStream } from '@json-render/core';

/**
 * A spec as JSONL patches, and back.
 *
 * json-render's wire format is RFC 6902 patches, one per line, root first and
 * parents before children, so a renderer can paint a partial tree at every
 * line. A model emits that format; a projected or authored spec is a finished
 * object. This is the bridge: any of the three sources can be replayed through
 * `specToJsonl`, and what a model emitted is compiled through `specFromJsonl`
 * before it is validated.
 */

/**
 * The patch lines for a spec: `/root`, then every element reachable from the
 * root in breadth-first order (a parent always precedes its children), then
 * any element the root does not reach (kept, so a validator can report it),
 * then one patch per top-level `state` key.
 */
export function specToJsonl(spec: Spec): string {
  const lines: string[] = [];
  const push = (op: 'add', path: string, value: unknown) =>
    lines.push(JSON.stringify({ op, path, value }));

  push('add', '/root', spec.root);

  const emitted = new Set<string>();
  const queue = [spec.root];
  while (queue.length > 0) {
    const key = queue.shift()!;
    if (emitted.has(key)) continue;
    const element = spec.elements[key];
    if (!element) continue;
    emitted.add(key);
    push('add', `/elements/${escapePointer(key)}`, element);
    for (const child of element.children ?? []) queue.push(child);
    for (const slotChildren of Object.values(element.slots ?? {})) queue.push(...slotChildren);
  }
  for (const key of Object.keys(spec.elements)) {
    if (!emitted.has(key)) push('add', `/elements/${escapePointer(key)}`, spec.elements[key]);
  }
  for (const [key, value] of Object.entries(spec.state ?? {})) {
    push('add', `/state/${escapePointer(key)}`, value);
  }
  return `${lines.join('\n')}\n`;
}

/** The spec a JSONL stream compiles to. Blank lines and non-JSON lines are skipped by the compiler. */
export function specFromJsonl(jsonl: string): Spec {
  return compileSpecStream<Record<string, unknown>>(jsonl, {
    root: '',
    elements: {},
  }) as unknown as Spec;
}

/** The individual patch lines of a stream, for a replay that feeds them one at a time. */
export function jsonlLines(jsonl: string): string[] {
  return jsonl.split('\n').filter((line) => line.trim().length > 0);
}

function escapePointer(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}
