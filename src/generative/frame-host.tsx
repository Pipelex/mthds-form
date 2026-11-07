'use client';

import * as React from 'react';

/**
 * SPIKE (L-261107-a6a35f): what a host's compose-then-result frame tells the
 * frame components of a layout - the facts no descriptor carries.
 *
 * A layout written for the `composer` frame places the host's action row
 * through `Composer`, and one written for the `result` frame places the
 * host's actions through `ResultHeader`. What those rows SAY beyond the
 * layout's own words is the host's knowledge: how long a run usually takes,
 * what the result's actions are called and what they do. The layout names
 * where they go; the host fills them.
 */
export interface FrameHost {
  /** How long a run usually takes, from the app's past runs: "Takes about 30 seconds". */
  eta?: string;
  /** The result's actions, primary first: "Download PDF", "Share". */
  actions?: readonly string[];
  /** What an action does, by its label. */
  onAction?: (label: string) => void;
}

const FrameHostContext = React.createContext<FrameHost>({});

export function FrameHostProvider({
  host,
  children,
}: {
  host: FrameHost;
  children: React.ReactNode;
}) {
  return <FrameHostContext.Provider value={host}>{children}</FrameHostContext.Provider>;
}

export function useFrameHost(): FrameHost {
  return React.useContext(FrameHostContext);
}
