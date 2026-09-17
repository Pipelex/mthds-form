'use client';

import * as React from 'react';
import type { Spec, StateModel, StateStore } from '@json-render/core';
import { JSONUIProvider, Renderer } from '@json-render/react';
import { BrandProvider } from './brand-context';
import type { BrandManifest } from './manifest';
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
  /**
   * The brand the product chrome renders: the app bar's logo pair and name,
   * the web font. Required by this entry's own registry, whose `AppBar` reads
   * it - without one the bar throws, json-render's element boundary drops it
   * from the page, and the console names the cure. A host registry with no
   * brand components may omit it.
   */
  brand?: BrandManifest;
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
  brand,
}: GenerativePageProps) {
  // The scope reaches every control through context, so a fresh object on each
  // render re-renders every field on the page - and a host naturally writes it
  // as a literal beside the store it just read. Memoised on its members, so an
  // inline `scope={{ inputs: fields, env }}` costs a keystroke nothing. Rebuilt
  // from the members it names rather than returning `scope` itself, so no
  // member this list leaves out can be frozen at its first value: a required
  // member added to `DescriptorScope` is a type error here, and an optional one
  // is at least legible as absent from the literal.
  const { inputs, result, env, idPrefix } = scope;
  const stableScope = React.useMemo<DescriptorScope>(
    () => ({ inputs, result, env, idPrefix }),
    [inputs, result, env, idPrefix],
  );
  // json-render's `ActionProvider` reads `handlers` ONCE, into a `useState`,
  // and never looks at the prop again - so a handler object rebuilt on a new
  // `onRun` or `store` was rebuilt for nobody, and Run kept calling the
  // callback and reading the store from the first render. A host writes
  // `onRun` as an inline closure over its own state as naturally as it writes
  // the scope literal above, and every one of those closures after the first
  // went unused. So the handler is created once and reads the latest pair
  // through a ref, which is refreshed after each commit; the handler only ever
  // fires from a click, which is after the commit that installed the values.
  const latest = React.useRef({ onRun, store });
  React.useEffect(() => {
    latest.current = { onRun, store };
  });
  const [handlers] = React.useState(() => ({
    run: () => {
      latest.current.onRun?.(latest.current.store.getSnapshot());
    },
  }));
  const page = (
    <DescriptorProvider scope={stableScope}>
      <JSONUIProvider registry={registry} store={store} handlers={handlers}>
        <Renderer spec={spec} registry={registry} loading={loading} />
      </JSONUIProvider>
    </DescriptorProvider>
  );
  return brand ? <BrandProvider manifest={brand}>{page}</BrandProvider> : page;
}

/** The store's current state, re-rendering on every change. For a receipt beside a page. */
export function useStoreSnapshot(store: StateStore): StateModel {
  return React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot ?? store.getSnapshot,
  );
}
