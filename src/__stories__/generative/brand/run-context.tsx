import * as React from 'react';
import type { RunField } from '../../../core';
import type { RunPhase } from './method-run';

/**
 * The run, handed down to the brand components: the page keeps the phase and
 * the brand's `Workspace` paints what it says under the work column - a line
 * while it runs or when it cannot, the kernel's viewer when it is done. A
 * page with no run wired provides nothing, and the Workspace paints nothing
 * extra; a spec never names the result, since no spec was written for one.
 */

export interface MethodRun {
  phase: RunPhase;
  /** The result field the viewer renders the stuff through. */
  result: RunField;
  /** Stored references in the stuff, resolved to URLs a browser can show. */
  resolvedUrls: Readonly<Record<string, string>>;
}

const RunContext = React.createContext<MethodRun | null>(null);

export function RunProvider({ run, children }: { run: MethodRun; children: React.ReactNode }) {
  return <RunContext.Provider value={run}>{children}</RunContext.Provider>;
}

/** The run the nearest page provides, or `null` on a page that runs nothing. */
export function useMethodRun(): MethodRun | null {
  return React.useContext(RunContext);
}
