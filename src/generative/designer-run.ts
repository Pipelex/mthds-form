import type { Spec } from '@json-render/core';
import { frameCatalog } from './catalog';
import { FRAMES, type Frame } from './frame-definitions';
import { descriptorMalformation, fitCheck, type LayoutDescriptor } from './layout-fits';
import { checksFailedLine, malformedLine, specMalformation } from './spec-shape';
import { catalogCheck, formatProblems } from './validate';

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
 * The checks' answer on a layout: every problem they found, one a line, and
 * whether they themselves failed on it.
 */
export interface LayoutVerdict {
  /** Every problem, one a line, in the words the repair pass reads; empty means the layout may render. */
  problems: string[];
  /**
   * Whether no repair of the layout can help: a check threw on a layout of
   * the right shape, a defect in the checks, or the descriptor the layout is
   * checked against is misshapen, a defect in what the host handed over. Each
   * is stated among the problems in a line of its own. The layout is refused
   * all the same - the host keeps the plain form - but a producer stops here
   * instead of handing the lines to the repair pass, which can change the
   * layout and neither the checks nor the descriptor.
   */
  checksFailed: boolean;
}

/**
 * Everything the host's two checks find wrong with a layout written for
 * `frame`, and whether the checks themselves failed on it: first the
 * catalog's verdict against the frame's own vocabulary (`frameCatalog`), then
 * whether it fits the descriptor (`layoutProblems`). Empty problems mean the
 * layout may render. A producer feeds the lines, joined, to `repair_layout`
 * as its `problems`, unless `checksFailed` says no repair can help; a host
 * deciding whether a stored layout renders needs only whether the list is
 * empty, which `layoutCheckProblems` answers alone.
 *
 * It never throws. Its subject is whatever a model wrote, or a layout and a
 * frame a host stored and read back, and a throw is the one answer a host
 * cannot act on: it arrives instead of the problem that would have sent the
 * page to its fallback. So a frame this package does not draw, a missing or
 * misshapen descriptor, and anything not shaped like a spec are each a
 * problem line, and a throw left in a walk below on a layout of the right
 * shape is the checks' own failure: a line saying so, and `checksFailed`.
 * The shape is checked once, before either check walks the layout.
 */
export function layoutCheck(spec: Spec, { frame, descriptor }: LayoutCheck): LayoutVerdict {
  const refused = (line: string): LayoutVerdict => ({ problems: [line], checksFailed: false });
  if (!(FRAMES as readonly unknown[]).includes(frame)) {
    return refused(
      `the layout names the frame ${JSON.stringify(frame)}, which is none of ${FRAMES.join(', ')}`,
    );
  }
  // The descriptor is the host's, not the layout's: no repair can mend it.
  const misshapen = descriptorMalformation(descriptor);
  if (misshapen !== undefined) return { problems: [misshapen], checksFailed: true };
  const malformed = specMalformation(spec);
  if (malformed !== undefined) return refused(malformedLine(malformed));
  try {
    const catalogs = catalogCheck(spec, frameCatalog(frame));
    const invalid = catalogs.verdict.ok
      ? []
      : formatProblems(catalogs.verdict.problems).split('\n');
    // A page that takes inputs is there to start a run, and nothing else in it
    // can: a layout with no button bound to `run` renders a dead page, which
    // the host must refuse rather than show.
    const runless =
      frame !== 'result' && descriptor.inputs && !pressRuns(spec)
        ? [
            "the layout has no control that runs the method: bind `run` under a control's `on.press`",
          ]
        : [];
    const fit = fitCheck(descriptor, spec);
    return {
      problems: [...invalid, ...runless, ...fit.problems],
      checksFailed: catalogs.checksFailed || fit.checksFailed,
    };
  } catch (error) {
    return { problems: [checksFailedLine(error)], checksFailed: true };
  }
}

/**
 * Everything the host's two checks find wrong with a layout written for
 * `frame`, one problem a line: `layoutCheck`'s problems alone, for a host
 * that needs only whether a stored layout renders. Never throws.
 */
export function layoutCheckProblems(spec: Spec, check: LayoutCheck): string[] {
  return layoutCheck(spec, check).problems;
}

/**
 * Whether any element binds the `run` action directly under `on.press`, as
 * the binding itself or as one entry of a list of them, which json-render runs
 * in order: a page needs a button that runs it. A run under a field's
 * `submit` is a deliberate gesture the catalog check accepts, but Enter in a
 * field is no control a person can see, so it does not count here; nor does a
 * run reached through an `onSuccess` or `onError` chain, which the catalog
 * check refuses. In the composer frame the one control that emits `press` is
 * the `Composer`'s run button, so this asks for that button to run. The walk
 * is total over whatever a model wrote, since a malformed element is the
 * catalog check's to report, never a reason for this one to throw.
 */
function pressRuns(spec: Spec): boolean {
  const isRun = (binding: unknown): boolean =>
    typeof binding === 'object' &&
    binding !== null &&
    (binding as Record<string, unknown>).action === 'run';
  if (typeof spec !== 'object' || spec === null) return false;
  const elements: unknown = spec.elements;
  if (typeof elements !== 'object' || elements === null) return false;
  return Object.values(elements).some((element) => {
    if (typeof element !== 'object' || element === null) return false;
    const on: unknown = (element as Record<string, unknown>).on;
    if (typeof on !== 'object' || on === null) return false;
    const press: unknown = (on as Record<string, unknown>).press;
    return Array.isArray(press) ? press.some(isRun) : isRun(press);
  });
}
