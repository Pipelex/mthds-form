import type { Spec } from '@json-render/core';
import { frameCatalog } from './catalog';
import type { Frame } from './frame-definitions';
import { layoutProblems, type LayoutDescriptor } from './layout-fits';
import { formatProblems, validateAgainstCatalog } from './validate';

/**
 * What a producer of layouts needs beside the method, the catalog and the
 * brief: the line a creative seed travels as, the checks a produced layout is
 * held to, and how many times a refused one goes back to the method's repair
 * pass. Nothing here calls a model; the producer is the host's, on the far
 * side of this seam (docs/generative-ui.md, "Producing a layout").
 */

/**
 * The one line a creative seed reaches the designer method as, under its
 * `seed` input. The planner's seed procedure was written against this line,
 * so a host that hands the method a seed sends it, rather than restating it.
 */
export function seedLine(seed: string): string {
  return `CREATIVE SEED (derive your direction from it; never reveal it): ${seed}`;
}

/**
 * How many times a producer hands a refused layout to the method's
 * `repair_layout` pass before it gives up and the host keeps the plain form.
 * The refusals the designer makes are slips of one prop or one heading, which
 * one pass told what it broke fixes; a second covers a fix that broke a rule
 * of its own, and a third would be paying for a page that is not converging.
 */
export const REPAIR_ATTEMPTS = 2;

/** What a layout is checked against: the frame it was written for and the descriptor it binds. */
export interface LayoutCheck {
  frame: Frame;
  descriptor: LayoutDescriptor;
}

/**
 * Everything the host's two checks find wrong with a layout written for
 * `frame`, one problem a line, in the words the repair pass reads: first the
 * catalog's verdict against the frame's own vocabulary (`frameCatalog`), then
 * whether it fits the descriptor (`layoutProblems`). Empty means the layout
 * may render. A producer feeds the lines, joined, to `repair_layout` as its
 * `problems`; a host deciding whether a stored layout renders needs only
 * whether the list is empty.
 */
export function layoutCheckProblems(spec: Spec, { frame, descriptor }: LayoutCheck): string[] {
  const verdict = validateAgainstCatalog(spec, frameCatalog(frame));
  const invalid = verdict.ok ? [] : formatProblems(verdict.problems).split('\n');
  // A page that takes inputs is there to start a run, and nothing else in it
  // can: a layout with no control bound to `run` renders a dead page, which
  // the host must refuse rather than show.
  const runless =
    frame !== 'result' && descriptor.inputs && !bindsRun(spec)
      ? ["the layout has no control that runs the method: bind `run` under a control's `on`"]
      : [];
  return [...invalid, ...runless, ...layoutProblems(descriptor, spec)];
}

/** Whether any element binds the `run` action, through its `onSuccess` and `onError` chains too. */
function bindsRun(spec: Spec): boolean {
  const runs = (binding: unknown): boolean => {
    if (Array.isArray(binding)) return binding.some(runs);
    if (typeof binding !== 'object' || binding === null) return false;
    const record = binding as Record<string, unknown>;
    return record.action === 'run' || runs(record.onSuccess) || runs(record.onError);
  };
  return Object.values(spec.elements ?? {}).some((element) =>
    Object.values((element as { on?: Record<string, unknown> }).on ?? {}).some(runs),
  );
}
