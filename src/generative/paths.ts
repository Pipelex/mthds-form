import type { Spec } from '@json-render/core';
import type { RunField } from '../core';

/**
 * The two state trees, and how a path into either maps back onto the
 * descriptor.
 *
 * An input page binds at `/inputs/<name>`, recursing into structures as the
 * descriptor does; a result page binds at `/result/<path>`. Both are JSON
 * Pointers (RFC 6901), because that is what json-render's state store reads.
 * Nothing here knows a value - a path is resolved against the DESCRIPTOR, which
 * is how the two escape hatches find the `RunField` to hand the kernel.
 */

export const INPUTS_ROOT = '/inputs';
export const RESULT_ROOT = '/result';

/** `/inputs` + `invoice` + `billed_to` → `/inputs/invoice/billed_to`. */
export function joinPath(root: string, ...segments: readonly string[]): string {
  return segments.reduce<string>((path, segment) => `${path}/${escapeSegment(segment)}`, root);
}

/**
 * RFC 6901: `~` is `~0`, `/` is `~1`. Field names are identifiers, so this
 * rarely fires. Exported for the stream module, which writes an element key
 * into a patch path: the escaping is spelled once, because the second spelling
 * was a copy and a copy drifts.
 */
export function escapeSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * The inverse, in the order the RFC requires - `~1` first, then `~0`, so `~01`
 * reads back as `~1` and not as `/`. The stream's prototype guard unescapes a
 * patch path through this same function before it compares segments, so the
 * order that guard relies on is decided here and nowhere else.
 */
export function unescapeSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

/** The segments of a pointer, root excluded: `/inputs/a/b` under `/inputs` → `['a', 'b']`. */
export function segmentsUnder(root: string, path: string): string[] | undefined {
  if (path === root) return [];
  if (!path.startsWith(`${root}/`)) return undefined;
  return path
    .slice(root.length + 1)
    .split('/')
    .map(unescapeSegment);
}

/**
 * The descriptor node a path names, or `undefined` when the path leaves the
 * tree. An object's children are found by name; a list's are found by index,
 * and every index resolves to the same item descriptor.
 */
export function fieldAtSegments(
  fields: readonly RunField[],
  segments: readonly string[],
): RunField | undefined {
  const [head, ...rest] = segments;
  if (head === undefined) return undefined;
  const field = fields.find((candidate) => candidate.name === head);
  if (!field) return undefined;
  return rest.length === 0 ? field : descend(field, rest);
}

function descend(field: RunField, segments: readonly string[]): RunField | undefined {
  const [head, ...rest] = segments;
  if (head === undefined) return field;
  if (field.kind === 'object') return fieldAtSegments(field.fields, segments);
  if (field.kind === 'list' && /^\d+$/.test(head)) return descend(field.item, rest);
  return undefined;
}

/** `/inputs/<...>` resolved against a form's top-level fields. */
export function inputFieldAtPath(fields: readonly RunField[], path: string): RunField | undefined {
  const segments = segmentsUnder(INPUTS_ROOT, path);
  return segments && segments.length > 0 ? fieldAtSegments(fields, segments) : undefined;
}

/** `/result/<...>` resolved against a result descriptor; `/result` itself is the root. */
export function resultFieldAtPath(field: RunField, path: string): RunField | undefined {
  const segments = segmentsUnder(RESULT_ROOT, path);
  if (!segments) return undefined;
  return segments.length === 0 ? field : descend(field, segments);
}

/**
 * The child-to-parent map of a spec's element tree.
 *
 * Built once and passed down rather than rebuilt per lookup: `layoutProblems`
 * resolves one relative hatch path per element that carries one, and each
 * resolution walks the chain of parents above it. Rebuilding the map inside
 * that walk made the whole pass quadratic in element count.
 */
export function parentMapOf(spec: Spec): Map<string, string> {
  const parents = new Map<string, string>();
  for (const [parentKey, element] of Object.entries(spec.elements)) {
    for (const child of element.children ?? []) parents.set(child, parentKey);
  }
  return parents;
}

/**
 * The base path a relative hatch path resolves against, statically: the chain
 * of `repeat`s from the root down to `key`, each contributing its list path
 * and a first index. `undefined` outside any repeat. Mirrors what
 * `useRepeatScope` gives the hatch at render time, for a test that never
 * renders.
 *
 * The walk up the parent chain STOPS on a key it has already seen. A layout is
 * model-produced, and an element that is its own ancestor - `children: ["self"]`
 * at its simplest - is a shape json-render's `validateSpec` accepts without a
 * word, so without the guard this loop never terminates. Since a host calls
 * this through `layoutFits` precisely to decide whether an untrusted layout is
 * safe to render, the gate hanging is worse than the layout it was asked about.
 */
export function repeatBasePathOf(
  spec: Spec,
  key: string,
  parents: Map<string, string> = parentMapOf(spec),
): string | undefined {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current: string | undefined = key;
  while (current !== undefined && !seen.has(current)) {
    seen.add(current);
    chain.unshift(current);
    current = parents.get(current);
  }
  let base: string | undefined;
  for (const elementKey of chain) {
    const repeat = spec.elements[elementKey]?.repeat;
    if (!repeat) continue;
    const statePath = repeat.statePath;
    if (typeof statePath === 'string') {
      base = `${statePath}/0`;
      continue;
    }
    // A relative `repeat` names the item's field, and only a string is one. A
    // layout is model-produced, so `statePath` can be null or an object here -
    // and reading `.$item` off either produced a throw or a path with
    // "[object Object]" in it, reported later as an ordinary staleness problem
    // that named the wrong cause.
    const item = (statePath as { $item?: unknown } | null)?.$item;
    if (base === undefined || typeof item !== 'string') return undefined;
    base = `${joinPath(base, item)}/0`;
  }
  return base;
}

/** A hatch's path as the layer resolves it: absolute as written, or relative to the repeat it sits in. */
export function absoluteHatchPath(
  spec: Spec,
  key: string,
  path: string,
  parents?: Map<string, string>,
): string | undefined {
  if (path.startsWith('/')) return path;
  const base = repeatBasePathOf(spec, key, parents);
  // Raw, not `joinPath`: a relative hatch path is written by the producer and
  // may name several segments (`billed_to/city`), so its `/` are separators
  // already and escaping them would name one segment that does not exist.
  return base ? `${base}/${path}` : undefined;
}

/**
 * The list a `repeat` lays out, as an absolute path: its `statePath` when that
 * is written absolute, or, for a relative `{ $item }` one, the item's field
 * under the repeat above it - the same chain `repeatBasePathOf` walks, stopped
 * one level short. `undefined` when there is nothing to be relative to, or
 * when `statePath` is neither form. It is the path a repeat READS, which is
 * how the fit gate asks whether the descriptor still has the list.
 */
export function repeatListPathOf(
  spec: Spec,
  key: string,
  parents: Map<string, string> = parentMapOf(spec),
): string | undefined {
  const statePath = spec.elements[key]?.repeat?.statePath;
  if (typeof statePath === 'string') return statePath;
  const item = (statePath as { $item?: unknown } | null | undefined)?.$item;
  const parent = parents.get(key);
  const outer = parent === undefined ? undefined : repeatBasePathOf(spec, parent, parents);
  return outer !== undefined && typeof item === 'string' ? joinPath(outer, item) : undefined;
}
