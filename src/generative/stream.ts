import type { Spec } from '@json-render/core';
import { compileSpecStream } from '@json-render/core';
import { escapeSegment, unescapeSegment } from './paths';

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
    push('add', `/elements/${escapeSegment(key)}`, element);
    for (const child of element.children ?? []) queue.push(child);
    for (const slotChildren of Object.values(element.slots ?? {})) queue.push(...slotChildren);
  }
  for (const key of Object.keys(spec.elements)) {
    if (!emitted.has(key)) push('add', `/elements/${escapeSegment(key)}`, spec.elements[key]);
  }
  for (const [key, value] of Object.entries(spec.state ?? {})) {
    push('add', `/state/${escapeSegment(key)}`, value);
  }
  return `${lines.join('\n')}\n`;
}

/**
 * The segments a patch path may not contain.
 *
 * json-render's patch applier walks a pointer with `if (!(segment in current)
 * || typeof current[segment] !== 'object') current[segment] = {}` and then
 * steps into it. `'__proto__' in {}` is true and its value is an object, so a
 * line naming `/__proto__/<key>` walks onto `Object.prototype` and assigns
 * there - polluting every object in the realm.
 *
 * This is the only place that can stop it. Compiling happens BEFORE
 * `validateAgainstCatalog` and before `layoutFits`, so by the time either gate
 * has a spec to judge, the damage is done and no verdict and no fallback can
 * undo it. A produced layout is untrusted text, and this is where it first
 * becomes objects.
 */
const FORBIDDEN_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

/** Whether a patch line names a path that would walk onto a prototype. */
function reachesPrototype(line: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return false; // Not JSON: the compiler skips it, and so do we.
  }
  const path = (parsed as { path?: unknown } | null)?.path;
  if (typeof path !== 'string') return false;
  return path.split('/').some((segment) => FORBIDDEN_SEGMENTS.has(unescapeSegment(segment)));
}

/**
 * The spec a JSONL stream compiles to. Blank lines and non-JSON lines are
 * skipped by the compiler; a line whose path would reach a prototype is dropped
 * here, before the compiler sees it; and a line the compiler refuses is dropped
 * too, which is why the stream is applied one line at a time.
 *
 * A batch compile made a single bad line fatal to the whole layout. Two of them
 * are reachable from produced text: a `test` op whose value does not match
 * throws `Test operation failed`, and a non-string `path` throws
 * `path.startsWith is not a function`. A host follows the documented flow -
 * compile, then ask the two gates - so a throw here arrives before there is any
 * verdict to act on, and the fallback that exists for exactly this case never
 * fires. Skipping the line degrades instead: what survives is a partial spec,
 * which the gates then judge on its merits and reject if it is not renderable.
 */
export function specFromJsonl(jsonl: string): Spec {
  let spec: Record<string, unknown> = { root: '', elements: {} };
  for (const line of jsonl.split('\n')) {
    if (reachesPrototype(line)) continue;
    try {
      spec = compileSpecStream<Record<string, unknown>>(line, spec) as Record<string, unknown>;
    } catch {
      continue; // A patch that will not apply is skipped, as a non-JSON line is.
    }
  }
  return spec as unknown as Spec;
}

/** The individual patch lines of a stream, for a replay that feeds them one at a time. */
export function jsonlLines(jsonl: string): string[] {
  return jsonl.split('\n').filter((line) => line.trim().length > 0);
}
