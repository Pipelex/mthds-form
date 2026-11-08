'use client';

import * as React from 'react';
import type { Spec } from '@json-render/core';
import { ownProp } from '../core/own-property';
import { INPUTS_ROOT, joinPath, segmentsUnder } from './paths';

/** Where a layout places one input: its rank in the page's reading order, and the page's word for it. */
export interface PlacedInput {
  /** 0 for the first input the page places, reading from its root down. */
  order: number;
  /** The `label` of the element that places it, when the layout wrote one. */
  label?: string;
}

/**
 * The inputs a layout places, by path, in the order the page reads: each path
 * an element binds (`{ "$bindState": "/inputs/..." }`) or an `MthdsField`
 * delegates, with the `label` that element gives it. A layout orders and
 * words its controls itself - "Trip name", near the end, where the descriptor
 * says "Title", first - so a line that names inputs for the person names them
 * as the page does, in the order the page shows them, and falls back on the
 * descriptor only for what the page does not say.
 *
 * The page is read from its root, depth first, children before slots, so an
 * element no other element names places nothing, and each element is read
 * once, so a layout that names an element inside itself ends. The first
 * element to place a path decides its order, and the first to word it its
 * label. A path inside a repeat is a row's, named through its list, so a
 * relative binding is not read.
 */
export function placedInputs(spec: Spec | null | undefined): ReadonlyMap<string, PlacedInput> {
  const placed = new Map<string, PlacedInput>();
  const elements: unknown = spec?.elements;
  if (!isRecord(elements) || typeof spec?.root !== 'string') return placed;
  const seen = new Set<string>();
  const pending: string[] = [spec.root];
  while (pending.length > 0) {
    const key = pending.pop()!;
    if (seen.has(key)) continue;
    seen.add(key);
    const element = ownProp(elements, key);
    if (!isRecord(element)) continue;
    if (isRecord(element.props)) place(placed, element.type, element.props);
    // A stack: the first child is read next, and its descendants before its sibling.
    pending.push(...[...keysOf(element.children), ...slotKeys(element.slots)].reverse());
  }
  return placed;
}

function place(
  placed: Map<string, PlacedInput>,
  type: unknown,
  props: Record<string, unknown>,
): void {
  const label = typeof props.label === 'string' ? props.label.trim() : '';
  for (const path of inputPathsOf(type, props)) {
    const known = placed.get(path);
    if (!known) placed.set(path, { order: placed.size, ...(label ? { label } : {}) });
    else if (known.label === undefined && label) known.label = label;
  }
}

/** The `/inputs` paths one element places: what its props bind, and a hatch's own path. */
function inputPathsOf(type: unknown, props: Record<string, unknown>): string[] {
  const paths: string[] = [];
  if (type === 'MthdsField' && typeof props.path === 'string') paths.push(props.path);
  for (const value of Object.values(props)) {
    if (isRecord(value) && typeof value.$bindState === 'string') paths.push(value.$bindState);
  }
  return paths.flatMap((path) => {
    const segments = segmentsUnder(INPUTS_ROOT, path);
    return segments && segments.length > 0 ? [joinPath(INPUTS_ROOT, ...segments)] : [];
  });
}

function keysOf(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((key): key is string => typeof key === 'string') : [];
}

function slotKeys(slots: unknown): string[] {
  return isRecord(slots) ? Object.values(slots).flatMap(keysOf) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const PlacedInputsContext = React.createContext<ReadonlyMap<string, PlacedInput>>(new Map());

/** Hands the frame components the inputs the layout places (`placedInputs`). */
export function PlacedInputsProvider({
  spec,
  children,
}: {
  spec: Spec | null | undefined;
  children: React.ReactNode;
}) {
  const placed = React.useMemo(() => placedInputs(spec), [spec]);
  return <PlacedInputsContext.Provider value={placed}>{children}</PlacedInputsContext.Provider>;
}

/** The inputs the layout places, by path; empty outside a page. */
export function usePlacedInputs(): ReadonlyMap<string, PlacedInput> {
  return React.useContext(PlacedInputsContext);
}
