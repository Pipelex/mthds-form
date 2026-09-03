import * as React from 'react';
import { createStateStore, type Spec, type StateModel } from '@json-render/core';
import type { Readiness, RunField } from '../../../core';
import { computeReadiness } from '../../../core';
import { FieldPresentationProvider } from '../../../react';
import { GenerativePage, useStoreSnapshot } from '../registry';
import { seedInputs } from '../state';
import { brandRegistry } from './brand-registry';

/**
 * The branded page's harness: the store seeded from the descriptor's defaults,
 * the brand registry - and, under the page, the one piece of chrome a person
 * would never see: the `/inputs` tree exactly as the run would receive it,
 * folded away, with the readiness the kernel computes from it. Full width.
 *
 * Nothing here paints. The orbs, the canvas gradient and the hand-written
 * brand stylesheet the first prototype carried are gone, because none of it
 * was data a token file can state; the page renders through the theme tokens
 * alone, which is what the brand build will set.
 */

export interface BrandPageProps {
  fields: RunField[];
  spec: Spec;
  idPrefix?: string;
}

export function BrandPage({ fields, spec, idPrefix = 'pipelex' }: BrandPageProps) {
  const store = React.useMemo(() => createStateStore({ inputs: seedInputs(fields) }), [fields]);
  const [lastRun, setLastRun] = React.useState<StateModel | null>(null);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div>
        <FieldPresentationProvider presentation="app">
          <GenerativePage
            spec={spec}
            store={store}
            scope={{ inputs: fields, idPrefix }}
            onRun={setLastRun}
            registry={brandRegistry}
          />
        </FieldPresentationProvider>
        <Receipt store={store} fields={fields} ran={lastRun !== null} />
      </div>
    </div>
  );
}

function Receipt({
  store,
  fields,
  ran,
}: {
  store: ReturnType<typeof createStateStore>;
  fields: RunField[];
  ran: boolean;
}) {
  const snapshot = useStoreSnapshot(store);
  const inputs = (snapshot.inputs ?? {}) as Record<string, unknown>;
  const readiness: Readiness = computeReadiness(fields, inputs);
  return (
    <details className="mx-auto w-full max-w-6xl px-6 pb-8 font-mono text-[11px] text-muted-foreground/70 sm:px-8">
      <summary className="cursor-pointer select-none">
        <span data-testid="readiness">
          readiness {readiness.ready}/{readiness.total}
          {readiness.missing.length > 0
            ? ` · waiting for ${readiness.missing.join(', ')}`
            : ' · ready'}
        </span>
        {ran ? <span data-testid="run-receipt"> · run pressed</span> : null}
        <span> · the /inputs tree the run receives</span>
      </summary>
      <pre className="mt-3 whitespace-pre-wrap" data-testid="inputs-receipt">
        {JSON.stringify(inputs, null, 2)}
      </pre>
    </details>
  );
}
