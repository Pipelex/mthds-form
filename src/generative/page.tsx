'use client';

import * as React from 'react';
import type { Spec, StateModel, StateStore } from '@json-render/core';
import { JSONUIProvider, Renderer } from '@json-render/react';
import { generativeRegistry } from './product-registry';
import { DescriptorProvider, type DescriptorScope } from './registry';

/** What a page renders through: this entry's registry unless a host brings its own. */
export type PageRegistry = React.ComponentProps<typeof Renderer>['registry'];

export interface GenerativePageProps {
  /** The layout to render; `null` while a stream has produced nothing yet. */
  spec: Spec | null;
  /** The state the layout binds to. The host owns it; the page reads and writes it. */
  store: StateStore;
  /** The descriptor the escape hatches resolve paths against. */
  scope: DescriptorScope;
  /** What `run` does. Receives the state at the moment the call to action was pressed. */
  onRun?: (state: StateModel) => void;
  /** Whether a stream is still arriving. */
  loading?: boolean;
  /** A registry over a catalog that extends this entry's, when a host has one. */
  registry?: PageRegistry;
}

/**
 * One generative page: providers, registry and renderer wired together.
 *
 * The store is CONTROLLED - the host creates it, seeds it (`seedInputs`) and
 * reads it back to start the run - so what the page writes is exactly what the
 * kernel's readiness is computed from, and generation is nowhere in the
 * request path: a layout is a data file, and this renders it.
 */
export function GenerativePage({
  spec,
  store,
  scope,
  onRun,
  loading,
  registry = generativeRegistry,
}: GenerativePageProps) {
  const handlers = React.useMemo(
    () => ({
      run: () => {
        onRun?.(store.getSnapshot());
      },
    }),
    [onRun, store],
  );
  return (
    <DescriptorProvider scope={scope}>
      <JSONUIProvider registry={registry} store={store} handlers={handlers}>
        <Renderer spec={spec} registry={registry} loading={loading} />
      </JSONUIProvider>
    </DescriptorProvider>
  );
}

/** The store's current state, re-rendering on every change. For a receipt beside a page. */
export function useStoreSnapshot(store: StateStore): StateModel {
  return React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot ?? store.getSnapshot,
  );
}
