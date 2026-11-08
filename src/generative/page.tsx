'use client';

import * as React from 'react';
import type { Spec, StateModel, StateStore } from '@json-render/core';
import {
  JSONUIProvider,
  Renderer,
  useOptionalValidation,
  type ValidationContextValue,
} from '@json-render/react';
import { BrandProvider } from './brand-context';
import {
  ElementBoundary,
  ReportingContext,
  reportingRegistry,
  type ElementErrorHandler,
  type ReportedRenderers,
} from './element-errors';
import type { BrandManifest } from '../brand/manifest';
import { generativeRegistry } from './product-registry';
import { DescriptorProvider, type DescriptorScope } from './registry';
import { isThenable } from '../react/utils';

/** What a page renders through: this entry's registry unless a host brings its own. */
export type PageRegistry = React.ComponentProps<typeof Renderer>['registry'];

export interface GenerativePageProps {
  /** The layout to render; `null` while a stream has produced nothing yet. */
  spec: Spec | null;
  /** The state the layout binds to. The host owns it; the page reads and writes it. */
  store: StateStore;
  /** The descriptor the escape hatches resolve paths against. */
  scope: DescriptorScope;
  /**
   * What `run` does. Receives the state at the moment the call to action was
   * pressed. Return the run's promise and a press while it is pending starts
   * nothing. Not called while a field's own checks (its `checks` prop) fail:
   * the press shows each failing field its message instead.
   */
  onRun?: (state: StateModel) => void | Promise<unknown>;
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
  /**
   * Called once for each element that throws while rendering, with the error
   * and the element's component type. json-render drops such an element from
   * the page and catches its throw in a boundary of its own, so a boundary
   * around the page never fires; this is how a host hears of it, and falls
   * back to its plain view if it wants the whole page to. The element renders
   * nothing in its place either way, and draws again once what it renders
   * from changes. Not called while `loading`: what still fails when the stream
   * ends is reported then. Without it, the error is logged as json-render logs
   * it, and the root's goes on to the host's own boundary around the page.
   */
  onElementError?: ElementErrorHandler;
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
  onElementError,
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
  // Every renderer is wrapped in a reporting boundary, once per type and
  // renderer, so no element remounts on a new callback, on a host that starts
  // or stops passing one, or on a registry object rebuilt with the same
  // renderers; without a callback the boundary throws the error on, and the
  // page renders exactly as json-render does. The callback is read through a
  // ref at the error, refreshed in an insertion effect, which runs before the
  // layout phase a boundary reports in, so an element that fails in the same
  // commit as a new callback reports to that one.
  const report = React.useRef(onElementError);
  React.useInsertionEffect(() => {
    report.current = onElementError;
  });
  const [made] = React.useState<ReportedRenderers>(() => new Map());
  const pageRegistry = React.useMemo(
    () => reportingRegistry(registry, report, made),
    [registry, made],
  );
  // json-render resolves an element's props before its renderer runs, so a
  // throw there is caught by the boundary of the element above - and the root
  // has none. Its own boundary is given another try with each new layout,
  // judged by its content once the page is not loading: a host that parses
  // its spec inline hands a new object at every render, and one whose report
  // sets its state would otherwise retry, throw and report until React gave
  // up. The content is read only while the root has failed, so a streamed
  // layout is not written out whole at every patch.
  const rootType = spec?.elements?.[spec.root]?.type ?? 'root';
  const reporting = onElementError !== undefined;
  // The page's own checks, as json-render's `validateForm` runs them, read at
  // the press that runs it (below).
  const validation = React.useRef<ValidationContextValue | null>(null);

  // One run at a time. The run button is held by the host's `env.disabled`,
  // which arrives on a later render: a host that sets it after an await (or
  // never) left a second press inside that wait free to start a second
  // billed run. The guard is held until what `onRun` returns settles - at
  // once for an `onRun` that returns nothing, where the host's own state
  // covers the run - and then one task longer: json-render applies the
  // binding's `onSuccess` or `onError` chain after the handler, in the same
  // task, so a guard released as `onRun` settled let a run chained under the
  // run that just failed start a second billed run. The catalog check refuses
  // such a chain; this holds a layout rendered past it to one run per press.
  const running = React.useRef(false);
  const [handlers] = React.useState(() => {
    const release = () => {
      setTimeout(() => {
        running.current = false;
      }, 0);
    };
    return {
      run: () => {
        if (running.current) return undefined;
        // A layout's fields may carry checks of their own, which `validateForm`
        // runs and records - and json-render runs the next binding whatever it
        // recorded, so `[validateForm, run]` ran a form its own checks had just
        // refused, and only the host's run gate stood between it and a billed
        // run. A run is started only when every field's checks pass, and
        // running them shows each failing field its message, as `validateForm`
        // does.
        const checks = validation.current;
        if (checks && !checks.validateAll()) return undefined;
        running.current = true;
        let pending: unknown;
        try {
          pending = latest.current.onRun?.(latest.current.store.getSnapshot());
        } catch (error) {
          release();
          throw error;
        }
        if (isThenable(pending)) {
          // Any thenable holds the guard, a promise from another realm
          // included, and json-render still receives what the host returned,
          // its rejection included.
          const settled = Promise.resolve(pending);
          settled.then(release, release);
          return settled;
        }
        release();
        return undefined;
      },
    };
  });
  const page = (
    <DescriptorProvider scope={stableScope}>
      <JSONUIProvider registry={pageRegistry} store={store} handlers={handlers}>
        <ReportingContext.Provider value={reporting}>
          <ValidationBridge into={validation} />
          <ElementBoundary
            type={rootType}
            report={report}
            reporting={reporting}
            loading={loading === true}
            resetOn={spec}
            root
          >
            <Renderer spec={spec} registry={pageRegistry} loading={loading} />
          </ElementBoundary>
        </ReportingContext.Provider>
      </JSONUIProvider>
    </DescriptorProvider>
  );
  return brand ? <BrandProvider manifest={brand}>{page}</BrandProvider> : page;
}

/**
 * Hands the page's validation - the checks its fields registered with
 * json-render, which `validateForm` runs - to the run handler, which is
 * created above the provider that holds it. Refreshed in an insertion effect,
 * before any press can reach the handler.
 */
function ValidationBridge({ into }: { into: React.RefObject<ValidationContextValue | null> }) {
  const validation = useOptionalValidation();
  React.useInsertionEffect(() => {
    into.current = validation;
  });
  return null;
}

/** The store's current state, re-rendering on every change. For a receipt beside a page. */
export function useStoreSnapshot(store: StateStore): StateModel {
  return React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot ?? store.getSnapshot,
  );
}
