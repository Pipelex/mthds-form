import * as React from 'react';
import type { Spec, StateModel, StateStore } from '@json-render/core';
import {
  JSONUIProvider,
  Renderer,
  defineRegistry,
  type BaseComponentProps,
  type Components,
  useBoundProp,
  useFieldValidation,
  useRepeatScope,
  useStateStore,
  useStateValue,
} from '@json-render/react';
import { shadcnComponents } from '@json-render/shadcn';
import type { RunField } from '../../core';
import { FieldRenderer, ResultField, type FieldEnv } from '../../react';
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../react/ui/select';
import { catalog, type METRIC_FORMATS } from './catalog';
import { inputFieldAtPath, resultFieldAtPath } from './paths';

/**
 * The registry: what each catalog entry RENDERS as.
 *
 * The shadcn subset binds the package's own implementations. The four custom
 * components are implemented here over this package's controls and vendored
 * primitives, and two of them are the escape hatches the design rests on:
 *
 *  - `MthdsField` renders ONE input through `FieldRenderer`, two-way at the
 *    path the spec names. It is the arm for the kinds the catalog cannot
 *    enter, and it is always available for a scalar the model would rather
 *    not style.
 *  - `MthdsResult` renders ONE result subtree through `ResultField`, reading
 *    state at the path the spec names.
 *
 * Both resolve the path against the DESCRIPTOR, through `DescriptorProvider`,
 * which is what keeps rule 1: the spec names a path and nothing more, and the
 * kernel is handed the `RunField` the host already holds. A spec never
 * restates what a field is.
 */

export interface DescriptorScope {
  /** The input page's top-level fields, for `/inputs/...` paths. */
  inputs?: readonly RunField[];
  /** The result page's descriptor, for `/result/...` paths. */
  result?: RunField;
  /** What the host injects into the controls: upload, disabled, resolver. */
  env?: FieldEnv;
  /** Prefix for the DOM ids `MthdsField` mints; two pages on one screen need two. */
  idPrefix?: string;
}

const DescriptorContext = React.createContext<DescriptorScope>({});

export function DescriptorProvider({
  scope,
  children,
}: {
  scope: DescriptorScope;
  children: React.ReactNode;
}) {
  return <DescriptorContext.Provider value={scope}>{children}</DescriptorContext.Provider>;
}

function Unresolved({ path, side }: { path: string; side: 'input' | 'result' }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/50 px-2.5 py-1.5 text-[12px] text-destructive"
    >
      {side === 'input' ? 'No input' : 'No result'} at <span className="font-mono">{path}</span>
    </p>
  );
}

function domIdFor(prefix: string | undefined, path: string): string {
  return `${prefix ?? 'gen'}${path.replace(/\//g, '-')}`;
}

/**
 * The path a hatch resolves: absolute as written, or, inside a repeat, the
 * item's field name joined onto the current item's base path. A relative path
 * outside any repeat resolves to nothing, and the hatch says so.
 */
function useAbsolutePath(path: string): string | undefined {
  const repeat = useRepeatScope();
  if (path.startsWith('/')) return path;
  return repeat ? `${repeat.basePath}/${path}` : undefined;
}

// ─── The escape hatches ──────────────────────────────────────────────────────

function MthdsField({ props }: BaseComponentProps<{ path: string }>) {
  const scope = React.useContext(DescriptorContext);
  const path = useAbsolutePath(props.path) ?? '';
  const field = scope.inputs && path ? inputFieldAtPath(scope.inputs, path) : undefined;
  const value = useStateValue<unknown>(path);
  const { set } = useStateStore();
  const onChange = React.useCallback((next: unknown) => set(path, next), [set, path]);
  if (!field) return <Unresolved path={props.path} side="input" />;
  return (
    <FieldRenderer
      field={field}
      value={value}
      onChange={onChange}
      id={domIdFor(scope.idPrefix, path)}
      env={scope.env}
    />
  );
}

function MthdsResult({ props }: BaseComponentProps<{ path: string; hideLabel?: boolean | null }>) {
  const scope = React.useContext(DescriptorContext);
  const path = useAbsolutePath(props.path) ?? '';
  const field = scope.result && path ? resultFieldAtPath(scope.result, path) : undefined;
  const value = useStateValue<unknown>(path);
  if (!field) return <Unresolved path={props.path} side="result" />;
  return <ResultField field={field} value={value} hideLabel={props.hideLabel ?? false} />;
}

// ─── A Select with an accessible name ────────────────────────────────────────

interface SelectProps {
  label: string;
  name: string;
  options: string[];
  placeholder?: string | null;
  value?: string | null;
  checks?: { type: string; message: string; args?: Record<string, unknown> }[] | null;
  validateOn?: 'change' | 'blur' | 'submit' | null;
}

function AccessibleSelect({ props, bindings, emit }: BaseComponentProps<SelectProps>) {
  const scope = React.useContext(DescriptorContext);
  const [boundValue, setBoundValue] = useBoundProp<string>(
    props.value ?? undefined,
    bindings?.value,
  );
  const [localValue, setLocalValue] = React.useState('');
  const isBound = Boolean(bindings?.value);
  const value = isBound ? (boundValue ?? '') : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const validateOn = props.validateOn ?? 'change';
  const hasValidation = Boolean(bindings?.value && props.checks?.length);
  const { errors, validate } = useFieldValidation(
    bindings?.value ?? '',
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );
  const id = `${scope.idPrefix ?? 'gen'}-select-${props.name}`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm leading-none font-medium">
        {props.label}
      </label>
      <SelectRoot
        value={value}
        onValueChange={(next) => {
          setValue(next);
          if (hasValidation && validateOn === 'change') validate();
          emit('change');
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={props.placeholder ?? 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {(props.options ?? []).map((option, index) => (
            <SelectItem key={`${index}-${option}`} value={option || `option-${index}`}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {errors.length > 0 ? <p className="text-sm text-destructive">{errors[0]}</p> : null}
    </div>
  );
}

// ─── The bound equivalents of what a model most wants to inline ──────────────

function valueAt(row: unknown, relativePath: string): unknown {
  let current: unknown = row;
  for (const segment of relativePath.split('/').filter((part) => part.length > 0)) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/** A cell shows a number as it is: grouped, with the places it has, never padded. */
const CELL_NUMBER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (typeof value === 'number') return CELL_NUMBER.format(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(formatCell).join(', ');
  return JSON.stringify(value);
}

interface DataTableProps {
  rows: unknown;
  columns: { path: string; label: string }[];
  caption?: string | null;
}

function DataTable({ props }: BaseComponentProps<DataTableProps>) {
  const rows = Array.isArray(props.rows) ? props.rows : [];
  const columns = props.columns ?? [];
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-full border-collapse text-[13px]">
        {props.caption ? (
          <caption className="px-2.5 py-1.5 text-start text-[12px] text-muted-foreground">
            {props.caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-b border-border bg-muted">
            {columns.map((column) => (
              <th
                key={column.path}
                scope="col"
                className="whitespace-nowrap px-2.5 py-1.5 text-start font-semibold text-foreground"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border/60 last:border-b-0">
              {columns.map((column) => (
                <td key={column.path} className="px-2.5 py-1.5 align-top text-foreground">
                  {formatCell(valueAt(row, column.path))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type MetricFormat = (typeof METRIC_FORMATS)[number];

function numberFormat(format: MetricFormat): Intl.NumberFormat {
  switch (format) {
    case 'integer':
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
    case 'decimal':
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'compact':
      return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
    case 'plain':
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 20, useGrouping: false });
    default:
      return format satisfies never;
  }
}

interface MetricProps {
  label: string;
  value: unknown;
  unit?: string | null;
  format?: MetricFormat | null;
}

function Metric({ props }: BaseComponentProps<MetricProps>) {
  const value = props.value;
  const text =
    typeof value === 'number'
      ? numberFormat(props.format ?? 'plain').format(value)
      : value === null || value === undefined || value === ''
        ? '—'
        : String(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {props.label}
      </span>
      <span className="text-2xl font-semibold tabular-nums text-foreground">
        {text}
        {props.unit ? (
          <span className="ml-1 text-sm font-normal text-muted-foreground">{props.unit}</span>
        ) : null}
      </span>
    </div>
  );
}

// ─── The registry ────────────────────────────────────────────────────────────

/**
 * The three shadcn definitions the catalog strips `className` from still
 * reach implementations that read it; they are handed `null`, which is what
 * the implementation treats as "no extra class".
 */
const components: Components<typeof catalog> = {
  Card: (ctx) => shadcnComponents.Card({ ...ctx, props: { ...ctx.props, className: null } }),
  // shadcn's Stack defaults `align` to `start`, so a table or a grid inside a
  // vertical stack hugs its content instead of taking the page's width - the
  // one layout a result page never wants. A vertical stack stretches unless
  // the spec says otherwise; a horizontal one keeps shadcn's default.
  Stack: (ctx) =>
    shadcnComponents.Stack({
      ...ctx,
      props: {
        ...ctx.props,
        align: ctx.props.align ?? (ctx.props.direction === 'horizontal' ? null : 'stretch'),
        className: null,
      },
    }),
  Grid: (ctx) => shadcnComponents.Grid({ ...ctx, props: { ...ctx.props, className: null } }),
  Separator: shadcnComponents.Separator,
  Collapsible: shadcnComponents.Collapsible,
  Heading: shadcnComponents.Heading,
  Text: shadcnComponents.Text,
  Badge: shadcnComponents.Badge,
  Alert: shadcnComponents.Alert,
  Progress: shadcnComponents.Progress,
  Input: shadcnComponents.Input,
  Textarea: shadcnComponents.Textarea,
  // shadcn's Select renders a Label beside a trigger with no accessible name,
  // which axe reports as a button without a name (`a11y` runs at error). Ours
  // is the package's own vendored select under a label that names the trigger.
  Select: (ctx) => <AccessibleSelect {...ctx} />,
  Switch: shadcnComponents.Switch,
  Button: shadcnComponents.Button,
  // Ours are React components (they use hooks), so each is MOUNTED rather than
  // called: a render function that called hooks itself would run them inside
  // the registry's wrapper and break the moment the wrapper re-ordered them.
  MthdsField: (ctx) => <MthdsField {...ctx} />,
  MthdsResult: (ctx) => <MthdsResult {...ctx} />,
  DataTable: (ctx) => <DataTable {...ctx} />,
  Metric: (ctx) => <Metric {...ctx} />,
};

/**
 * `run` is declared on the catalog so the prompt lists it; its handler is the
 * host's, supplied per page below. The registry-level action is a no-op that
 * exists because `defineRegistry` requires one for every declared action.
 */
export const { registry: generativeRegistry } = defineRegistry(catalog, {
  components,
  actions: { run: async () => {} },
});

// ─── The page ────────────────────────────────────────────────────────────────

export interface GenerativePageProps {
  /** The spec to render; `null` while a stream has produced nothing yet. */
  spec: Spec | null;
  /** The state the spec binds to. The host owns it; the page reads and writes it. */
  store: StateStore;
  /** The descriptor the escape hatches resolve paths against. */
  scope: DescriptorScope;
  /** What `run` does. Receives the state at the moment the button was pressed. */
  onRun?: (state: StateModel) => void;
  /** Whether a stream is still arriving. */
  loading?: boolean;
}

/**
 * One generative page: providers, registry and renderer wired together.
 *
 * The store is CONTROLLED - the story creates it, seeds it, and reads it back
 * for the receipt under the form - so what the page writes is exactly what the
 * kernel's readiness is computed from.
 */
export function GenerativePage({ spec, store, scope, onRun, loading }: GenerativePageProps) {
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
      <JSONUIProvider registry={generativeRegistry} store={store} handlers={handlers}>
        <Renderer spec={spec} registry={generativeRegistry} loading={loading} />
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
