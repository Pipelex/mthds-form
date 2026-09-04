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

/** RFC 6901: `~` is `~0`, `/` is `~1`. Field names are identifiers, so this rarely fires. */
function escapeSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

function unescapeSegment(segment: string): string {
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

/** A stable element key for a path: `/inputs/invoice/billed_to` → `inputs-invoice-billed_to`. */
export function keyForPath(path: string, suffix?: string): string {
  const base = path.replace(/^\//, '').replace(/\//g, '-');
  return suffix ? `${base}-${suffix}` : base;
}

/**
 * The base path a relative hatch path resolves against, statically: the chain
 * of `repeat`s from the root down to `key`, each contributing its list path
 * and a first index. `undefined` outside any repeat. Mirrors what
 * `useRepeatScope` gives the hatch at render time, for a test that never
 * renders.
 */
export function repeatBasePathOf(spec: Spec, key: string): string | undefined {
  const parents = new Map<string, string>();
  for (const [parentKey, element] of Object.entries(spec.elements)) {
    for (const child of element.children ?? []) parents.set(child, parentKey);
  }
  const chain: string[] = [];
  for (let current: string | undefined = key; current; current = parents.get(current)) {
    chain.unshift(current);
  }
  let base: string | undefined;
  for (const elementKey of chain) {
    const repeat = spec.elements[elementKey]?.repeat;
    if (!repeat) continue;
    const statePath = repeat.statePath;
    if (typeof statePath === 'string') base = `${statePath}/0`;
    else if (base) base = `${base}/${statePath.$item}/0`;
    else return undefined;
  }
  return base;
}

/** A hatch's path as the layer resolves it: absolute as written, or relative to the repeat it sits in. */
export function absoluteHatchPath(spec: Spec, key: string, path: string): string | undefined {
  if (path.startsWith('/')) return path;
  const base = repeatBasePathOf(spec, key);
  return base ? `${base}/${path}` : undefined;
}
