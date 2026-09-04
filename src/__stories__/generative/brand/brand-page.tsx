import * as React from 'react';
import { createStateStore, type Spec, type StateModel } from '@json-render/core';
import type { Readiness, RunField } from '../../../core';
import { computeReadiness } from '../../../core';
import { type FieldEnv, FieldPresentationProvider } from '../../../react';
import { cn } from '../../../react/utils';
import { GenerativePage, pathFromDomId, useStoreSnapshot } from '../registry';
import { fixtureLabel } from '../spec-fixture';
import { seedInputs } from '../state';
import type { BrandFixture } from './brand-fixture';
import { BrandProvider } from './brand-context';
import { brandRegistry } from './brand-registry';
import {
  type MethodRunTarget,
  RUN_DISABLED_REASON,
  RUN_ENABLED,
  type RunPhase,
  resolveStoredUrl,
  resolveStuffUrls,
  runMethod,
  uploadInputFile,
} from './method-run';
import { type MethodRun, RunProvider } from './run-context';

/**
 * A brand page: the app the spec lays out, painted from ONE brand's tokens.
 *
 * The root carries the brand's scope class, which is the only place the
 * brand enters: the stylesheet the build wrote sets the theme contract's
 * custom properties on that class (and their dark values under `.dark`), and
 * everything below - the brand components, the kernel's own controls - reads
 * the tokens it always reads. `font-sans` on the root makes Tailwind emit
 * `--font-sans`, which is what lets the scoped token override the typeface.
 *
 * A layout written against the layer's own catalog carries no chrome of its
 * own - no bar, no footer, and no container either, because the base catalog
 * has no notion of a page's width. `contained` gives such a layout the width
 * the brand components give themselves, so what the tokens do to it can be
 * read against the brand's pages rather than against the harness.
 *
 * Under the page, the chrome a person would never see, folded away: the
 * `/inputs` tree exactly as the run would receive it with the readiness the
 * kernel computes from it, where the run stands, and the stylesheet the brand
 * was painted from, titled by what produced it.
 *
 * Given a run target, the page RUNS. The call to action starts the method on
 * the `/inputs` tree through the hosted API and follows it to its end; the
 * phase goes to the receipt and, through `RunProvider`, to the brand's
 * `Workspace`, which paints the result under the work column. A dropped file
 * goes up through the kernel's own seam - `FieldEnv.onDropFile` reports the
 * DOM id, the page turns it back into the store path the id was minted from,
 * uploads, and writes the stored reference at that path - and a stored
 * reference in an input previews through the same resolver. All of it waits
 * on `RUN_ENABLED`: a static build, the test run and a served Storybook with
 * no key get the page as it always was, and pressing run says why.
 */

export interface BrandPageProps {
  brand: BrandFixture;
  fields: RunField[];
  spec: Spec;
  idPrefix?: string;
  /** Wrap the page in the brand's container - for a layout that brings none. */
  contained?: boolean;
  /** What the call to action runs; absent on a page that only lays out. */
  run?: MethodRunTarget;
}

export function BrandPage({ brand, fields, spec, idPrefix, contained, run }: BrandPageProps) {
  const prefix = idPrefix ?? brand.brand;
  const store = React.useMemo(() => createStateStore({ inputs: seedInputs(fields) }), [fields]);
  const [lastRun, setLastRun] = React.useState<StateModel | null>(null);
  const [phase, setPhase] = React.useState<RunPhase>({ kind: 'idle' });
  const [resolvedUrls, setResolvedUrls] = React.useState<Record<string, string>>({});
  const [uploadingIds, setUploadingIds] = React.useState<ReadonlySet<string>>(() => new Set());

  const onRun = React.useCallback(
    (snapshot: StateModel) => {
      setLastRun(snapshot);
      if (!run) return;
      if (!RUN_ENABLED) {
        setPhase({ kind: 'disabled', reason: RUN_DISABLED_REASON });
        return;
      }
      setResolvedUrls({});
      const inputs = (snapshot.inputs ?? {}) as Record<string, unknown>;
      void runMethod(run, inputs, fields, (next) => {
        setPhase(next);
        if (next.kind === 'done') {
          void resolveStuffUrls(run.result, next.stuff).then(setResolvedUrls, () => undefined);
        }
      });
    },
    [run, fields],
  );

  const running = phase.kind === 'running';
  const env = React.useMemo<FieldEnv | undefined>(() => {
    if (!run || !RUN_ENABLED) return undefined;
    return {
      disabled: running,
      uploadingIds,
      onDropFile: (id, file) => {
        const path = pathFromDomId(prefix, id);
        if (!path) return;
        setUploadingIds((ids) => new Set(ids).add(id));
        uploadInputFile(file)
          .then((value) => store.set(path, value))
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            setPhase({ kind: 'failed', message: `the upload failed: ${message}` });
          })
          .finally(() =>
            setUploadingIds((ids) => {
              const next = new Set(ids);
              next.delete(id);
              return next;
            }),
          );
      },
      resolveUrl: resolveStoredUrl,
    };
  }, [run, running, uploadingIds, prefix, store]);

  const methodRun = React.useMemo<MethodRun | null>(
    () => (run ? { phase, result: run.result, resolvedUrls } : null),
    [run, phase, resolvedUrls],
  );

  const page = (
    <div
      className={cn(
        brand.scope,
        'min-h-screen bg-background font-sans text-foreground antialiased',
      )}
      data-testid="brand-page"
      data-brand={brand.brand}
      data-producer={brand.producerId}
    >
      <BrandProvider manifest={brand.manifest}>
        <FieldPresentationProvider presentation="app">
          <div className={contained ? cn(CONTAINER, 'py-10 sm:py-12') : undefined}>
            <GenerativePage
              spec={spec}
              store={store}
              scope={{ inputs: fields, idPrefix: prefix, env }}
              onRun={onRun}
              registry={brandRegistry}
            />
          </div>
        </FieldPresentationProvider>
        <Receipt store={store} fields={fields} ran={lastRun !== null} phase={phase} />
        <Stylesheet brand={brand} />
      </BrandProvider>
    </div>
  );
  return methodRun ? <RunProvider run={methodRun}>{page}</RunProvider> : page;
}

/** The width the brand components give themselves. */
const CONTAINER = 'mx-auto w-full max-w-6xl px-6 sm:px-8';

const CHROME = cn(CONTAINER, 'pb-8 font-mono text-[11px] text-muted-foreground/70');

/** The receipt's run line: where the run stands, after the call to action was pressed. */
function runLine(phase: RunPhase): string {
  switch (phase.kind) {
    case 'idle':
      return '';
    case 'disabled':
      return ` · ${phase.reason}`;
    case 'running':
      return ` · running ${phase.runId} · ${phase.polls} polls · ${(phase.elapsedMs / 1000).toFixed(0)}s`;
    case 'done':
      return ` · done ${phase.runId} in ${(phase.elapsedMs / 1000).toFixed(0)}s`;
    case 'failed':
      return ` · failed${phase.runId ? ` ${phase.runId}` : ''}: ${phase.message}`;
    default:
      return phase satisfies never;
  }
}

function Receipt({
  store,
  fields,
  ran,
  phase,
}: {
  store: ReturnType<typeof createStateStore>;
  fields: RunField[];
  ran: boolean;
  phase: RunPhase;
}) {
  const snapshot = useStoreSnapshot(store);
  const inputs = (snapshot.inputs ?? {}) as Record<string, unknown>;
  const readiness: Readiness = computeReadiness(fields, inputs);
  return (
    <details className={CHROME}>
      <summary className="cursor-pointer select-none">
        <span data-testid="readiness">
          readiness {readiness.ready}/{readiness.total}
          {readiness.missing.length > 0
            ? ` · waiting for ${readiness.missing.join(', ')}`
            : ' · ready'}
        </span>
        {ran ? <span data-testid="run-receipt"> · run pressed{runLine(phase)}</span> : null}
        <span> · the /inputs tree the run receives</span>
      </summary>
      <pre className="mt-3 whitespace-pre-wrap" data-testid="inputs-receipt">
        {JSON.stringify(inputs, null, 2)}
      </pre>
    </details>
  );
}

function Stylesheet({ brand }: { brand: BrandFixture }) {
  return (
    <details className={CHROME}>
      <summary className="cursor-pointer select-none">
        brand {brand.brand} · {fixtureLabel(brand)} · {brand.date} · contract {brand.contractHash}
        {brand.rounds !== undefined
          ? ` · ${brand.rounds} repair round${brand.rounds === 1 ? '' : 's'}`
          : ''}
        <span> · the stylesheet the build wrote from tokens.json</span>
      </summary>
      {brand.warnings.length > 0 ? (
        <p className="mt-3">lint: {brand.warnings.join(' · ')}</p>
      ) : null}
      <pre className="mt-3 whitespace-pre-wrap" data-testid="brand-stylesheet">
        {brand.css}
      </pre>
    </details>
  );
}
