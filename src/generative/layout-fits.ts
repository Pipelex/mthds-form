import type { Spec } from '@json-render/core';
import type { RunField } from '../core';
import {
  INPUTS_ROOT,
  RESULT_ROOT,
  absoluteHatchPath,
  inputFieldAtPath,
  joinPath,
  parentMapOf,
  resultFieldAtPath,
} from './paths';

/**
 * Whether a stored layout still fits the descriptor it will be rendered over.
 *
 * A layout is produced once per method version and stored; a descriptor is
 * derived from the method every time it is read. Those two can part company -
 * a method's input is renamed, a structure loses a member - and when they do,
 * a delegated path resolves to nothing and a bound path writes into a corner of
 * the state the run never reads. Neither fails loudly on its own, so the host
 * asks this before it renders and falls back to the kernel's own form when the
 * answer is no.
 *
 * Two directions, and the second is the one a corpus cannot notice. The first
 * is staleness: every path the layout MENTIONS is a path the descriptor still
 * has, which is the corpus test's check lifted out of the test and into the
 * product. The second is coverage: every path the descriptor REQUIRES is one
 * the layout offers somewhere. A layout that simply omits an input is not
 * stale and validates perfectly - it renders a page with no field for a
 * required input, the run gate then refuses the run for that input, and the
 * person has nowhere to type it. A page you cannot complete is worse than the
 * plain form, which is what the fallback is for.
 *
 * What is NOT checked here is whether the layout validates against the catalog
 * - that is `validateAgainstCatalog`, and a host runs both.
 */

export interface LayoutDescriptor {
  /** The input page's top-level fields, for `/inputs/...` paths. */
  inputs?: readonly RunField[];
  /** The result page's descriptor, for `/result/...` paths. */
  result?: RunField;
}

/** Every `{ $bindState: path }` anywhere in an element's props. */
function boundPaths(spec: Spec): string[] {
  const found: string[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value !== 'object' || value === null) return;
    const record = value as Record<string, unknown>;
    if (typeof record.$bindState === 'string') found.push(record.$bindState);
    Object.values(record).forEach(walk);
  };
  for (const element of Object.values(spec.elements)) walk(element.props);
  return found;
}

/**
 * Every state path the layout READS, as opposed to writes.
 *
 * A binding is not the only way a layout names a path. The prompt teaches four
 * more: `{ "$state": "/path" }` for a read-only value, `$cond` for a condition
 * (whose own condition object is a `$state`, so the same walk finds it),
 * `{ "$template": "Total ${/result/amount}" }` for an interpolation, and a
 * top-level `visible` condition on the ELEMENT rather than in its props - which
 * is why `element.visible` is walked here beside `element.props`.
 *
 * Missing these was not cosmetic. A read that has gone stale renders a
 * placeholder where a value belongs; a stale `visible` condition compares
 * against nothing, never holds, and hides its element for good - so a section
 * carrying a required input silently never appears, while the coverage half
 * below still counts that input as offered because the binding is right there
 * in the props of an element nobody can see.
 */
function readPaths(spec: Spec): string[] {
  const found: string[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value !== 'object' || value === null) return;
    const record = value as Record<string, unknown>;
    if (typeof record.$state === 'string') found.push(record.$state);
    if (typeof record.$template === 'string') {
      for (const match of record.$template.matchAll(/\$\{([^}]*)\}/g)) {
        if (match[1] !== undefined) found.push(match[1]);
      }
    }
    Object.values(record).forEach(walk);
  };
  for (const element of Object.values(spec.elements)) {
    walk(element.props);
    walk(element.visible);
  }
  return found;
}

/**
 * The read paths this descriptor answers for, deduplicated.
 *
 * Only paths under the root in question: a layout may hold scratch state of its
 * own (a `$state` an element writes and reads back), and that is its business,
 * not the descriptor's. What the descriptor owns is `/inputs` on an input page
 * and `/result` on a result one, and a path under either that no longer
 * resolves is the staleness this predicate exists to catch. One line per path,
 * however many elements mention it.
 */
function staleReads(spec: Spec, root: string, resolves: (path: string) => boolean): string[] {
  const under = readPaths(spec).filter((path) => path === root || path.startsWith(`${root}/`));
  return [...new Set(under)].filter((path) => !resolves(path));
}

/** The list path of every `repeat` in the spec: how a layout lays a list out. */
function repeatPaths(spec: Spec): string[] {
  const found: string[] = [];
  for (const element of Object.values(spec.elements)) {
    const statePath = element.repeat?.statePath;
    if (typeof statePath === 'string') found.push(statePath);
  }
  return found;
}

/**
 * Where a person can enter this path: bound to a control, laid out as a
 * repeat, or delegated to the kernel's own control at this path or at any
 * ancestor of it - an `MthdsField` on a structure renders the whole subtree.
 */
function isOffered(path: string, offered: Offered): boolean {
  if (offered.bound.has(path) || offered.repeated.has(path)) return true;
  return offered.delegated.some((at) => path === at || path.startsWith(`${at}/`));
}

interface Offered {
  bound: Set<string>;
  repeated: Set<string>;
  delegated: string[];
}

/**
 * The required paths under `field` that the layout offers nowhere.
 *
 * A structure is covered by covering what it requires, so a layout may leave
 * out an optional member and still fit; a list is covered whole, by a repeat
 * or by delegation, because its items are the layout's business and not this
 * predicate's.
 */
function uncoveredUnder(field: RunField, path: string, offered: Offered): string[] {
  if (isOffered(path, offered)) return [];
  if (field.kind === 'object') {
    return field.fields
      .filter((child) => child.required)
      .flatMap((child) => uncoveredUnder(child, joinPath(path, child.name), offered));
  }
  return [path];
}

/**
 * Every way this layout no longer fits, in the words a host can count by:
 * one line per element or path, empty when it fits.
 */
export function layoutProblems(descriptor: LayoutDescriptor, spec: Spec): string[] {
  const problems: string[] = [];
  const delegated: string[] = [];
  const parents = parentMapOf(spec);

  for (const [key, element] of Object.entries(spec.elements)) {
    const written = (element.props as { path?: unknown } | undefined)?.path;
    const path =
      typeof written === 'string' ? absoluteHatchPath(spec, key, written, parents) : undefined;
    if (element.type === 'MthdsField') {
      if (!path || !inputFieldAtPath(descriptor.inputs ?? [], path)) {
        problems.push(`${key}: MthdsField delegates ${String(written)}, which no input has`);
      } else {
        delegated.push(path);
      }
    }
    if (element.type === 'MthdsResult') {
      if (!path || !descriptor.result || !resultFieldAtPath(descriptor.result, path)) {
        problems.push(`${key}: MthdsResult delegates ${String(written)}, which no result has`);
      }
    }
  }

  const bound = boundPaths(spec);
  if (!descriptor.inputs) {
    if (bound.length > 0) {
      problems.push(`a result page binds ${bound.join(', ')}; a result page writes nothing`);
    }
    const result = descriptor.result;
    for (const path of staleReads(spec, RESULT_ROOT, (read) =>
      result ? resultFieldAtPath(result, read) !== undefined : false,
    )) {
      problems.push(`${path} is read, and no result has it`);
    }
    return problems;
  }

  const inputs = descriptor.inputs;
  for (const path of bound) {
    if (!inputFieldAtPath(inputs, path)) {
      problems.push(`${path} is bound, and no input has it`);
    }
  }

  for (const path of staleReads(
    spec,
    INPUTS_ROOT,
    (read) => inputFieldAtPath(inputs, read) !== undefined,
  )) {
    problems.push(`${path} is read, and no input has it`);
  }

  const offered: Offered = {
    bound: new Set(bound),
    repeated: new Set(repeatPaths(spec)),
    delegated,
  };
  for (const field of inputs) {
    if (!field.required) continue;
    for (const path of uncoveredUnder(field, joinPath(INPUTS_ROOT, field.name), offered)) {
      problems.push(`${path} is required, and the layout offers nowhere to enter it`);
    }
  }

  return problems;
}

/** The predicate: `layoutProblems` is empty. */
export function layoutFits(descriptor: LayoutDescriptor, spec: Spec): boolean {
  return layoutProblems(descriptor, spec).length === 0;
}
