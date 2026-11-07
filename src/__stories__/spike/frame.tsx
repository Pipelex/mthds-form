/**
 * SPIKE ONLY (L-261107-a6a35f, never merged): the compose-then-result frame of
 * design D7, as a host would draw it around the kernel or around a layout.
 *
 * The host draws the band (the team's logo and the app's name, no heading),
 * the action row's mechanics, the request bar and the result's actions. What
 * fills the composer and the result page is either the kernel's plain view in
 * its `app` presentation, or a layout rendered by the generative entry - the
 * question the spike measures.
 */
import * as React from 'react';
import { createStateStore } from '@json-render/core';
import type { RunField } from '../../core';
import {
  FieldPresentationProvider,
  MethodForm,
  ResultEnvProvider,
  StuffViewer,
  useMethodForm,
} from '../../react';
import {
  FrameHostProvider,
  GenerativePage,
  payloadToState,
  type PageRegistry,
} from '../../generative';
import type { Spec } from '@json-render/core';
import {
  METHODS,
  TEAMS,
  type MethodKey,
  type SpikeMethod,
  type StyleId,
  type TeamKey,
} from './methods';
import './frame.css';

/** The host's upload, as any real host has one: a picked file becomes a local link. */
async function upload(file: File) {
  return { url: URL.createObjectURL(file), filename: file.name };
}
const HOST_ENV = { onDropFile: (_id: string, file: File) => upload(file) };

export type Theme = 'light' | 'dark';
export type Moment = 'compose' | 'result';

export interface FrameProps {
  method: MethodKey;
  moment: Moment;
  theme: Theme;
  /** The style; the method's team's own when unset. */
  style?: StyleId;
  /** The team whose colours the app wears; the method's team when unset, none when `null`. */
  team?: TeamKey | null;
  /** A layout for this moment; the kernel's plain view when absent. */
  spec?: Spec | null;
  /** A registry over a catalog that extends the entry's. */
  registry?: PageRegistry;
}

function teamVars(team: TeamKey | null, theme: Theme): React.CSSProperties {
  if (!team) return {};
  const c = TEAMS[team][theme];
  const vars: Record<string, string> = {
    '--team-primary': c.primary,
    '--team-on-primary': c.onPrimary,
    '--link': c.link,
  };
  if (c.band && c.onBand) {
    vars['--band'] = c.band;
    vars['--on-band'] = c.onBand;
  }
  return vars as React.CSSProperties;
}

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
const CLOCK = 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
const HISTORY = 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l4 2';
const ARROW = 'M5 12h14M13 6l6 6-6 6';
const PENCIL = 'M4 20h4L19 9l-4-4L4 16v4z';

function Band({ method, team }: { method: SpikeMethod; team: TeamKey | null }) {
  return (
    <header className="spk-band">
      <div className="spk-band-l">
        <span className="spk-logo">{team ? TEAMS[team].name : 'Pipelex'}</span>
        <span className="spk-band-sep" aria-hidden="true" />
        <span className="spk-band-app">{method.host.appName}</span>
      </div>
      <span className="spk-band-btn">
        <Icon d={HISTORY} /> History
      </span>
    </header>
  );
}

/** The request's main values, as a generic host reads them off the descriptor: scalars in reading order, a list by its count. */
function requestChips(
  fields: readonly RunField[],
  values: Record<string, unknown>,
  max = 5,
): string[] {
  const chips: string[] = [];
  const walk = (field: RunField, value: unknown) => {
    if (chips.length >= max || value === undefined || value === null || value === '') return;
    switch (field.kind) {
      case 'object':
        for (const child of field.fields ?? [])
          walk(child, (value as Record<string, unknown>)[child.name]);
        return;
      case 'list':
        if (Array.isArray(value) && value.length > 0)
          chips.push(`${value.length} ${field.name.replace(/_/g, ' ')}`);
        return;
      case 'document':
      case 'image': {
        const file = value as { filename?: string };
        if (file.filename) chips.push(file.filename);
        return;
      }
      case 'boolean':
        return;
      case 'date':
        chips.push(
          new Date(String(value)).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        );
        return;
      case 'number':
        chips.push(Number(value).toLocaleString('en-GB'));
        return;
      default: {
        const text = String(value);
        if (text.length <= 40) chips.push(text);
      }
    }
  };
  for (const field of fields) walk(field, values[field.name]);
  // Two dates in a row are a span; a chip another one already contains says nothing.
  const DATE = /^\d{1,2} \w{3} \d{4}$/;
  const merged: string[] = [];
  for (const chip of chips) {
    const last = merged[merged.length - 1];
    if (last && DATE.test(last) && DATE.test(chip)) {
      const [d1, m1, y1] = last.split(' ');
      const [d2, m2, y2] = chip.split(' ');
      merged[merged.length - 1] =
        m1 === m2 && y1 === y2 ? `${d1}–${d2} ${m2} ${y2}` : `${last} – ${chip}`;
    } else merged.push(chip);
  }
  return merged.filter(
    (chip, i) =>
      !merged.some(
        (other, j) =>
          j !== i && other.length > chip.length && other.toLowerCase().includes(chip.toLowerCase()),
      ),
  );
}

function PlainComposer({ method }: { method: SpikeMethod }) {
  const form = useMethodForm({
    descriptor: method.descriptor,
    contract: method.contract,
    initialValues: method.inputs,
    uploadFile: upload,
  });
  return (
    <div className="spk-col">
      <div>
        <h1 className="spk-display">{method.name}</h1>
        {method.description ? <p className="spk-lead">{method.description}</p> : null}
      </div>
      <div className="spk-panel spk-comp">
        <MethodForm form={form} presentation="app" />
        <div className="spk-act">
          <span className="spk-eta">
            <Icon d={CLOCK} /> {method.host.eta}
          </span>
          <button type="button" className="spk-btn">
            Run <Icon d={ARROW} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LayoutComposer({
  method,
  spec,
  registry,
}: {
  method: SpikeMethod;
  spec: Spec;
  registry?: PageRegistry;
}) {
  const store = React.useMemo(
    () => createStateStore({ inputs: structuredClone(method.inputs) }),
    [method],
  );
  return (
    <FrameHostProvider host={{ eta: method.host.eta }}>
      <div className="spk-col wide" style={{ width: '100%', maxWidth: 1180 }}>
        <FieldPresentationProvider presentation="app">
          <GenerativePage
            spec={spec}
            store={store}
            scope={{ inputs: method.inputFields, env: HOST_ENV, idPrefix: `spk-${method.key}` }}
            registry={registry}
          />
        </FieldPresentationProvider>
      </div>
    </FrameHostProvider>
  );
}

function RequestBar({ method }: { method: SpikeMethod }) {
  const chips = requestChips(method.inputFields, method.inputs);
  return (
    <div className="spk-req">
      <div className="spk-req-i">
        <span className="spk-req-l">Your request</span>
        <div className="spk-chips">
          {chips.map((chip) => (
            <span key={chip} className="spk-chip">
              {chip}
            </span>
          ))}
        </div>
        <button type="button" className="spk-btn link">
          <Icon d={PENCIL} size={14} /> Edit
        </button>
        <button type="button" className="spk-btn ghost">
          {method.host.again}
        </button>
      </div>
    </div>
  );
}

function PlainResult({ method }: { method: SpikeMethod }) {
  return (
    <>
      <div className="spk-res-head">
        <div>
          <p className="spk-eyebrow">Your result</p>
          <h1 className="spk-res-title">{method.name}</h1>
        </div>
        <div className="spk-actions">
          {method.host.actions.map((label, i) => (
            <button
              key={label}
              type="button"
              className={i === 0 ? 'spk-btn' : 'spk-btn ghost'}
              style={i === 0 ? { minHeight: 36, fontSize: 14, padding: '0 16px' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ResultEnvProvider>
        <FieldPresentationProvider presentation="app">
          <StuffViewer field={method.resultField} value={method.payload} />
        </FieldPresentationProvider>
      </ResultEnvProvider>
    </>
  );
}

function LayoutResult({
  method,
  spec,
  registry,
}: {
  method: SpikeMethod;
  spec: Spec;
  registry?: PageRegistry;
}) {
  const store = React.useMemo(
    () =>
      createStateStore({
        result: payloadToState(method.resultField, method.payload) as Record<string, unknown>,
      }),
    [method],
  );
  return (
    <FrameHostProvider host={{ actions: method.host.actions }}>
      <ResultEnvProvider>
        <FieldPresentationProvider presentation="app">
          <GenerativePage
            spec={spec}
            store={store}
            scope={{ result: method.resultField, idPrefix: `spk-${method.key}-r` }}
            registry={registry}
          />
        </FieldPresentationProvider>
      </ResultEnvProvider>
    </FrameHostProvider>
  );
}

export function Frame({ method: key, moment, theme, style, team, spec, registry }: FrameProps) {
  const method = METHODS[key];
  const teamKey = team === undefined ? method.host.team : team;
  const banded = teamKey && TEAMS[teamKey][theme].band ? '1' : '0';
  return (
    <div
      className={theme === 'dark' ? 'spk-app dark' : 'spk-app'}
      data-st={style ?? method.host.style}
      data-banded={banded}
      style={teamVars(teamKey, theme)}
    >
      <Band method={method} team={teamKey} />
      {moment === 'compose' ? (
        <main className="spk-page">
          {spec ? (
            <LayoutComposer method={method} spec={spec} registry={registry} />
          ) : (
            <PlainComposer method={method} />
          )}
        </main>
      ) : (
        <>
          <RequestBar method={method} />
          <main className="spk-stage">
            {spec ? (
              <LayoutResult method={method} spec={spec} registry={registry} />
            ) : (
              <PlainResult method={method} />
            )}
          </main>
        </>
      )}
    </div>
  );
}
