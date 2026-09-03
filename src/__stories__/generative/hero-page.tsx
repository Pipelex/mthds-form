import * as React from 'react';
import { createStateStore, type Spec, type StateModel } from '@json-render/core';
import type { OutputForm, PipeIOContracts, Readiness, RunField } from '../../core';
import {
  buildResultField,
  computeReadiness,
  getPipeIOContract,
  getPipeOutputForm,
} from '../../core';
import { FieldPresentationProvider } from '../../react';
import type { Hero } from './heroes';
import { GenerativePage, useStoreSnapshot } from './registry';
import { payloadToState, seedInputs } from './state';

/**
 * The harness every generative story renders through - the generative twin of
 * `case-form.tsx` and `result-view.tsx`.
 *
 * It does what a host would: derive the descriptor from the committed wire
 * artifacts through the kernel's own lookups, load the state (a payload through
 * `payloadToState`, or the authored defaults through `seedInputs`), own the
 * store, and hand the page a spec. Which SOURCE the spec came from is not its
 * business; that is what makes the four stories of a hero comparable.
 */

export interface ResultHeroData {
  field: RunField;
  payload: unknown;
  state: unknown;
}

/** A result hero's descriptor and loaded state, off the case's generated modules. */
export function loadResultHero(
  hero: Hero,
  contracts: PipeIOContracts,
  outputForm: OutputForm,
  payloads: Record<string, unknown>,
): ResultHeroData {
  const contract = getPipeIOContract(contracts, hero.domain, hero.pipeCode);
  const descriptor = getPipeOutputForm(outputForm, hero.domain, hero.pipeCode);
  if (!contract || !descriptor) {
    throw new Error(`No fixture entry for ${hero.domain}.${hero.pipeCode}. Run \`make fixtures\`.`);
  }
  const field = buildResultField(descriptor, contract.output.json_schema);
  const payload = payloads[`${hero.domain}.${hero.pipeCode}`];
  return { field, payload, state: payloadToState(field, payload) };
}

export interface ResultHeroPageProps {
  data: ResultHeroData;
  spec: Spec;
  maxWidth?: number;
}

/** A result page: `/result` loaded from the payload, read-only. */
export function ResultHeroPage({ data, spec, maxWidth = 640 }: ResultHeroPageProps) {
  const store = React.useMemo(() => createStateStore({ result: data.state }), [data.state]);
  return (
    <div style={{ maxWidth }}>
      <FieldPresentationProvider presentation="app">
        <GenerativePage spec={spec} store={store} scope={{ result: data.field }} />
      </FieldPresentationProvider>
    </div>
  );
}

export interface InputHeroPageProps {
  fields: RunField[];
  spec: Spec;
  /** Two pages on one screen (the ThemePair decorator) need distinct DOM ids. */
  idPrefix?: string;
  maxWidth?: number;
  /** What `run` does; the receipt below the page shows the state either way. */
  onRun?: (state: StateModel) => void;
}

/**
 * An input page: `/inputs` seeded from the authored defaults, two-way, with the
 * receipt a host would never show but a checkpoint needs - the `/inputs` tree
 * as the run would receive it, and the readiness the kernel computes from it.
 */
export function InputHeroPage({
  fields,
  spec,
  idPrefix,
  maxWidth = 640,
  onRun,
}: InputHeroPageProps) {
  const store = React.useMemo(() => createStateStore({ inputs: seedInputs(fields) }), [fields]);
  return (
    <div style={{ maxWidth, display: 'grid', gap: 24 }}>
      <FieldPresentationProvider presentation="app">
        <GenerativePage
          spec={spec}
          store={store}
          scope={{ inputs: fields, idPrefix: idPrefix ?? 'gen' }}
          onRun={onRun}
        />
      </FieldPresentationProvider>
      <InputsReceipt store={store} fields={fields} />
    </div>
  );
}

/** The `/inputs` tree and its readiness, live. Inline styles: chrome, not a control. */
function InputsReceipt({
  store,
  fields,
}: {
  store: ReturnType<typeof createStateStore>;
  fields: RunField[];
}) {
  const snapshot = useStoreSnapshot(store);
  const inputs = (snapshot.inputs ?? {}) as Record<string, unknown>;
  const readiness: Readiness = computeReadiness(fields, inputs);
  return (
    <section
      aria-label="State receipt"
      style={{
        font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
        color: 'hsl(var(--muted-foreground))',
        borderTop: '1px solid hsl(var(--border))',
        paddingTop: 12,
      }}
    >
      <div data-testid="readiness">
        readiness: {readiness.ready}/{readiness.total}
        {readiness.missing.length > 0
          ? ` - waiting for ${readiness.missing.join(', ')}`
          : ' - ready'}
      </div>
      <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }} data-testid="inputs-receipt">
        {JSON.stringify(inputs, null, 2)}
      </pre>
    </section>
  );
}
