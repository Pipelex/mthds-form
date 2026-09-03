import * as React from 'react';
import { createStateStore, type Spec, type StateModel } from '@json-render/core';
import type { Readiness, RunField } from '../../../core';
import { computeReadiness } from '../../../core';
import { FieldPresentationProvider } from '../../../react';
import { cn } from '../../../react/utils';
import { GenerativePage, useStoreSnapshot } from '../registry';
import { fixtureLabel } from '../spec-fixture';
import { seedInputs } from '../state';
import type { BrandFixture } from './brand-fixture';
import { BrandProvider } from './brand-context';
import { brandRegistry } from './brand-registry';

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
 * Under the page, the chrome a person would never see, folded away: the
 * `/inputs` tree exactly as the run would receive it with the readiness the
 * kernel computes from it, and the stylesheet the brand was painted from,
 * titled by what produced it.
 */

export interface BrandPageProps {
  brand: BrandFixture;
  fields: RunField[];
  spec: Spec;
  idPrefix?: string;
}

export function BrandPage({ brand, fields, spec, idPrefix }: BrandPageProps) {
  const store = React.useMemo(() => createStateStore({ inputs: seedInputs(fields) }), [fields]);
  const [lastRun, setLastRun] = React.useState<StateModel | null>(null);
  return (
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
          <GenerativePage
            spec={spec}
            store={store}
            scope={{ inputs: fields, idPrefix: idPrefix ?? brand.brand }}
            onRun={setLastRun}
            registry={brandRegistry}
          />
        </FieldPresentationProvider>
        <Receipt store={store} fields={fields} ran={lastRun !== null} />
        <Stylesheet brand={brand} />
      </BrandProvider>
    </div>
  );
}

const CHROME =
  'mx-auto w-full max-w-6xl px-6 pb-8 font-mono text-[11px] text-muted-foreground/70 sm:px-8';

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
    <details className={CHROME}>
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
