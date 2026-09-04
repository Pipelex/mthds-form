import type { Spec } from '@json-render/core';
import type { RunField } from '../core';
import { absoluteHatchPath, inputFieldAtPath, resultFieldAtPath } from './paths';

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
 * These are the corpus test's path checks, exactly, lifted out of the test and
 * into the product: what proves a captured layout in this repo is what decides
 * whether a stored one is rendered in a host. What is NOT checked here is
 * whether the layout validates against the catalog - that is
 * `validateAgainstCatalog`, and a host runs both.
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
 * Every way this layout no longer fits, in the words a host can count by:
 * one line per element or path, empty when it fits.
 */
export function layoutProblems(descriptor: LayoutDescriptor, spec: Spec): string[] {
  const problems: string[] = [];

  for (const [key, element] of Object.entries(spec.elements)) {
    const written = (element.props as { path?: unknown } | undefined)?.path;
    const path = typeof written === 'string' ? absoluteHatchPath(spec, key, written) : undefined;
    if (element.type === 'MthdsField') {
      if (!path || !inputFieldAtPath(descriptor.inputs ?? [], path)) {
        problems.push(`${key}: MthdsField delegates ${String(written)}, which no input has`);
      }
    }
    if (element.type === 'MthdsResult') {
      if (!path || !descriptor.result || !resultFieldAtPath(descriptor.result, path)) {
        problems.push(`${key}: MthdsResult delegates ${String(written)}, which no result has`);
      }
    }
  }

  const bound = boundPaths(spec);
  if (descriptor.inputs) {
    for (const path of bound) {
      if (!inputFieldAtPath(descriptor.inputs, path)) {
        problems.push(`${path} is bound, and no input has it`);
      }
    }
  } else if (bound.length > 0) {
    problems.push(`a result page binds ${bound.join(', ')}; a result page writes nothing`);
  }

  return problems;
}

/** The predicate: `layoutProblems` is empty. */
export function layoutFits(descriptor: LayoutDescriptor, spec: Spec): boolean {
  return layoutProblems(descriptor, spec).length === 0;
}
