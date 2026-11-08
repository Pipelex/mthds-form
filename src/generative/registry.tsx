'use client';

import * as React from 'react';
import {
  type BaseComponentProps,
  type Components,
  useBoundProp,
  useRepeatScope,
  useStateStore,
  useStateValue,
} from '@json-render/react';
import { RevealPanel, useCheckedField } from './checked-fields';
import {
  Accessibility,
  AlertCircle,
  Baby,
  Banknote,
  BarChart3,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Car,
  CheckCircle2,
  Clock,
  Coffee,
  Coins,
  Compass,
  FileText,
  Flag,
  Gift,
  Globe,
  Hash,
  Heart,
  Home,
  Hotel,
  Hourglass,
  Image,
  Info,
  Landmark,
  Layers,
  Leaf,
  Lightbulb,
  ListChecks,
  type LucideIcon,
  Mail,
  Map,
  MapPin,
  Moon,
  Mountain,
  Music,
  Package,
  Paperclip,
  Pencil,
  Percent,
  Phone,
  Plane,
  Receipt,
  Rocket,
  Route,
  Send,
  Shield,
  Ship,
  Sparkles,
  Star,
  Sun,
  Tag,
  Ticket,
  Train,
  TrendingUp,
  Truck,
  Upload,
  User,
  Users,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { RunField } from '../core';
import { FieldRenderer, ResultField, type FieldEnv } from '../react';
import { focusOutlineClass, linkTextClass, selectedFillStrongClass } from '../react/role-tokens';
import { fieldControlClass } from '../react/field-styles';
import { enumLabeler, useFieldPresentation } from '../react/field-presentation';
import { ResultRoot } from '../react/result-location';
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../react/ui/select';
import { ToggleGroup, ToggleGroupItem } from '../react/ui/toggle-group';
import { cn } from '../react/utils';
import { baseCatalog, type ICON_NAMES, type METRIC_FORMATS } from './components';
import { textOf, withDeclaredProps } from './declared-props';
import { formatDay, formatNumber } from './format';
import { shareAmount } from './share-amount';
import * as shadcn from './ui/shadcn';
import { inputFieldAtPath, RESULT_ROOT, resultFieldAtPath, segmentsUnder } from './paths';

/**
 * The registry: what each catalog entry RENDERS as.
 *
 * The shadcn subset binds the package's own implementations. The custom
 * components are implemented here over this package's controls and vendored
 * primitives - the vocabulary of an app (Split, Tabs, Steps, Icon, Segmented,
 * NumberInput), the bound equivalents of what a model most wants to inline
 * (DataTable, Metric), and the two escape hatches the design rests on:
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

/** The scope the nearest `DescriptorProvider` set - for a renderer defined outside this file. */
export function useDescriptorScope(): DescriptorScope {
  return React.useContext(DescriptorContext);
}

export function DescriptorProvider({
  scope,
  children,
}: {
  scope: DescriptorScope;
  children: React.ReactNode;
}) {
  return <DescriptorContext.Provider value={scope}>{children}</DescriptorContext.Provider>;
}

function Unresolved({ path, side }: { path: unknown; side: 'input' | 'result' }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/50 px-2.5 py-1.5 text-[12px] text-destructive"
    >
      {side === 'input' ? 'No input' : 'No result'} at{' '}
      <span className="font-mono">
        {typeof path === 'string' ? path : (JSON.stringify(path) ?? String(path))}
      </span>
    </p>
  );
}

/**
 * A pointer segment as one piece of a DOM id, and back.
 *
 * The id is built by joining the pointer's segments with `-`, so a segment that
 * contains a `-` of its own would make the join ambiguous: `/inputs/a-b` and
 * `/inputs/a/b` mint the same id, and the inverse below then hands a host the
 * wrong path to write an uploaded file to - plausible-looking, silent, and
 * wrong. This used to rest on a comment asserting that a field's name carries
 * no `-`; nothing here can enforce that, because a name reaches the descriptor
 * from a JSON Schema property. So the separator is escaped instead.
 *
 * `_` goes first, which is what makes the pass unambiguous: every `_` in the
 * output that is not one this function wrote has already been doubled, so the
 * single left-to-right decode below cannot mistake one for the other. Names
 * without `_`, `-` or `~` - which is every name in practice - pass through
 * untouched, so the ids this mints are the ids it always minted.
 */
function encodeSegment(segment: string): string {
  return segment.replace(/_/g, '_u').replace(/-/g, '_d').replace(/~/g, '_t');
}

function decodeSegment(segment: string): string {
  return segment.replace(/_([udt])/g, (_match, code: string) =>
    code === 'u' ? '_' : code === 'd' ? '-' : '~',
  );
}

/**
 * Exported for the round-trip test only, not from the entry's index: the pair
 * is only correct together, so a test that could see just one half of it would
 * be no guard at all.
 */
export function domIdFor(prefix: string | undefined, path: string): string {
  return `${prefix ?? 'gen'}${path.split('/').map(encodeSegment).join('-')}`;
}

/**
 * The inverse of `domIdFor`, for a host's upload seam: the kernel reports a
 * drop by the DOM id of the field it landed on, which for a nested one is the
 * hatch's id with the child's name or index joined by `.` (the kernel's own
 * composition, `FieldRenderer` through `ObjectField` and `ListField`), and
 * the host writes the file at the store path that id was minted from. Kept
 * beside `domIdFor` so the two cannot drift, and exact for any name by
 * construction rather than by assumption.
 */
export function pathFromDomId(prefix: string | undefined, id: string): string | undefined {
  const head = prefix ?? 'gen';
  if (!id.startsWith(head)) return undefined;
  const [own = '', ...children] = id.slice(head.length).split('.');
  if (!own.startsWith('-')) return undefined;
  const path = own.split('-').map(decodeSegment).join('/');
  return `${path}${children.map((child) => `/${child}`).join('')}`;
}

/**
 * The path a hatch or a `Picture` resolves: absolute as written, or, inside a
 * repeat, the item's field name joined onto the current item's base path. A
 * relative path outside any repeat resolves to nothing, and the element says
 * so. The one resolver every renderer that names a path literally reads
 * through, so two cannot read one path two ways. The empty path is the item
 * itself only where `emptyIsItem` says so, which is a `Picture`'s reading
 * alone, as the fit check reads it (`layout-fits.ts`): for a hatch it stays
 * the item's base and a trailing separator, which no field has, so the
 * renderer and the check refuse it together.
 */
export function useAbsolutePath(path: unknown, emptyIsItem = false): string | undefined {
  const repeat = useRepeatScope();
  // The checks hold such a `path` to a literal text; a layout rendered past
  // them may hand anything here, which resolves to nothing - never read as
  // some other path, as a number written out would be inside a repeat.
  if (typeof path !== 'string') return undefined;
  if (path.startsWith('/')) return path;
  if (!repeat) return undefined;
  // Raw, not `joinPath`: the same reason `absoluteHatchPath` gives - a relative
  // hatch path may name several segments, so its `/` are separators already.
  return path === '' && emptyIsItem ? repeat.basePath : `${repeat.basePath}/${path}`;
}

// ─── The escape hatches ──────────────────────────────────────────────────────

/** A label without a trailing "(optional)", which the kernel's own badge says. */
function withoutOptionalMark(label: string): string {
  return label.replace(/\s*\(optional\)\s*$/i, '') || label;
}

function MthdsField({
  props,
}: BaseComponentProps<{ path: string; label?: string | null; hint?: string | null }>) {
  const scope = React.useContext(DescriptorContext);
  const path = useAbsolutePath(props.path) ?? '';
  const found = scope.inputs && path ? inputFieldAtPath(scope.inputs, path) : undefined;
  // The page's own words for the label and the line under it, where it wrote them.
  const field = React.useMemo(
    () =>
      found && (props.label || props.hint)
        ? {
            ...found,
            // The control marks an optional field itself, so a label that
            // says "(optional)" too would say it twice.
            title: props.label ? withoutOptionalMark(props.label) : found.title,
            description: props.hint || found.description,
          }
        : found,
    [found, props.label, props.hint],
  );
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
  if (!field || !scope.result) return <Unresolved path={props.path} side="result" />;
  // The subtree's place in the whole result, so a file inside it saves under
  // the name the whole-result download gives it. Left to itself, `ResultField`
  // would root the location at its own node's name, and every entry of a
  // repeat would save as `image.png`.
  const place = [scope.result.name, ...(segmentsUnder(RESULT_ROOT, path) ?? [])];
  return (
    <ResultRoot baseName={scope.result.name} path={place}>
      <ResultField field={field} value={value} hideLabel={props.hideLabel ?? false} />
    </ResultRoot>
  );
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
  const { errors, validate, focusRef } = useCheckedField(
    bindings?.value ?? '',
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );
  const id = shadcn.useControlId(props.name);
  const errorId = `${id}-error`;
  const error = errors[0];
  const labelOf = enumLabeler(props.options ?? [], useFieldPresentation());
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm leading-none font-medium">
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
        {/* As tall as the layer's text input beside it, and the 44 pixels a
            finger needs. */}
        <SelectTrigger
          id={id}
          ref={focusRef}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-11 w-full"
        >
          <SelectValue placeholder={props.placeholder ?? 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {/* Written exactly as listed. The primitive throws on an empty value,
              and the fallback that used to stand in for one wrote a value the
              descriptor's enum never listed; the definition refuses an empty
              option now, upstream of every renderer. */}
          {(props.options ?? []).map((option, index) => (
            <SelectItem key={`${index}-${option}`} value={option}>
              {labelOf(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
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
function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(formatCell).join(', ');
  return JSON.stringify(value);
}

/**
 * A cell in a column the layout stated a format for. `date` writes the day
 * the value names (`formatDay`), never a stringified structure. `text` writes
 * a number in full and ungrouped, never in exponent notation, since a column the layout calls text holds a
 * year, a reference or a code, and "2,024" is damage there. `number` groups a
 * number, and a text that writes one out too, as a payload's decimal may
 * arrive. With no format, a number is grouped and the rest written as it is.
 */
function formatColumnCell(value: unknown, format: string | null | undefined): string {
  if (format === 'date') return formatDay(value, 'short') ?? formatCell(value);
  if (format === 'text' && typeof value === 'number') return formatNumber(value, 'plain');
  if (format === 'number') {
    const amount = shareAmount(value);
    if (Number.isFinite(amount)) return formatNumber(amount);
  }
  return formatCell(value);
}

interface DataTableProps {
  rows: unknown;
  columns: { path: string; label: string; format?: 'text' | 'date' | 'number' | null }[];
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
                  {formatColumnCell(valueAt(row, column.path), column.format)}
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

interface MetricProps {
  label: string;
  value: unknown;
  unit?: string | null;
  format?: MetricFormat | null;
}

function Metric({ props }: BaseComponentProps<MetricProps>) {
  const value = props.value;
  // Anything but a number as it writes out, so a structure, which writes out
  // as nothing, shows the dash an absent value shows.
  const text =
    typeof value === 'number' ? formatNumber(value, props.format ?? 'plain') : textOf(value) || '—';
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

// ─── The vocabulary of an app ────────────────────────────────────────────────

type SplitRatio = '1:1' | '1:2' | '2:1';

const SPLIT_COLUMNS: Record<SplitRatio, string> = {
  '1:1': 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
  '1:2': 'sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]',
  '2:1': 'sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
};

const SPLIT_GAP: Record<'md' | 'lg' | 'xl', string> = { md: 'gap-4', lg: 'gap-6', xl: 'gap-8' };

/** Two columns from two children, stacking under the `sm` breakpoint. */
function Split({
  props,
  children,
}: BaseComponentProps<{ ratio?: SplitRatio | null; gap?: 'md' | 'lg' | 'xl' | null }>) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 items-start',
        shadcn.pick(SPLIT_COLUMNS, props.ratio, '1:2'),
        shadcn.pick(SPLIT_GAP, props.gap, 'lg'),
      )}
    >
      {children}
    </div>
  );
}

interface TabsProps {
  tabs: { label: string; value: string }[];
}

/**
 * Tabs whose panels follow the active tab - the reason shadcn's is not in the
 * catalog. The nth child is the nth tab's panel; the active tab is local
 * state, so a spec never touches /state for it. An inactive panel stays
 * mounted and hidden, so the checks of the fields in it still hold the run:
 * unmounted, as Radix does by default, they left the page's record, and a
 * run pressed from another tab started past a field that refused it. A run
 * refused by a field in a hidden panel opens that panel's tab to show it.
 */
function Tabs({ props, children }: BaseComponentProps<TabsProps>) {
  const tabs = props.tabs ?? [];
  const panels = React.Children.toArray(children);
  // Each tab is told apart by its position, which is unique where a layout's
  // values need not be: two tabs written with one value would otherwise be
  // one tab to Radix, opening both panels, and one key to React. The open
  // tab is remembered by its value, and which of the tabs sharing it, so it
  // stays open when a patched layout inserts or removes a tab before it; one
  // the layout no longer has gives way to the first.
  const [chosen, setChosen] = React.useState<{ value: string; occurrence: number } | null>(null);
  const open = chosen ? openIndex(tabs, chosen) : 0;
  const value = String(open);
  const choose = (next: string) => {
    const index = Number(next);
    const tab = tabs[index];
    if (!tab) return;
    const occurrence = tabs.slice(0, index).filter((t) => t.value === tab.value).length;
    setChosen({ value: tab.value, occurrence });
  };
  return (
    <TabsPrimitive.Root value={value} onValueChange={choose} className="w-full">
      {/* Below `sm` each tab grows to the 44 by 44 pixels a finger needs,
          however short its label, and the list around it with it, wrapping
          onto a second row rather than pushing the page sideways. */}
      <TabsPrimitive.List className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground max-sm:h-auto max-sm:flex-wrap">
        {tabs.map((tab, index) => (
          <TabsPrimitive.Trigger
            key={index}
            value={String(index)}
            className="inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm max-sm:min-h-11 max-sm:min-w-11"
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((_tab, index) => (
        <TabsPrimitive.Content
          key={index}
          value={String(index)}
          forceMount
          hidden={index !== open}
          className="mt-4 focus-visible:outline-hidden"
        >
          <RevealPanel open={() => choose(String(index))}>{panels[index] ?? null}</RevealPanel>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

/** The position of the `occurrence`th tab carrying `value`, or the first tab's when none does. */
function openIndex(
  tabs: readonly { value: string }[],
  { value, occurrence }: { value: string; occurrence: number },
): number {
  let seen = 0;
  for (const [index, tab] of tabs.entries()) {
    if (tab.value !== value) continue;
    if (seen === occurrence) return index;
    seen += 1;
  }
  return 0;
}

// As tall as the layer's own `Button`, which is the 44 pixels a finger needs.
// Its focus is the kernel's one outline, whose offset is a gap the panel
// shows through rather than a ring offset painted in the page colour.
const BUTTON_BASE = cn(
  'inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  focusOutlineClass,
);
const PRIMARY_BUTTON = cn(BUTTON_BASE, 'bg-primary text-primary-foreground hover:bg-primary/90');
const SECONDARY_BUTTON = cn(
  BUTTON_BASE,
  'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
);

interface StepsProps {
  steps: string[];
  nextLabel?: string | null;
  backLabel?: string | null;
}

/**
 * A journey: a numbered indicator, one panel at a time, and its own Back and
 * Next. The nth child is the nth step's panel; the spec's one Button sits
 * inside the last one, which is why Next disappears there. The current step
 * is local state. A hidden panel stays mounted, so its inputs keep their
 * values in the store and their checks hold the run - a step hides from the
 * eye, never from the run - and a run refused by a field on another step goes
 * back to that step to show it.
 */
function Steps({ props, children }: BaseComponentProps<StepsProps>) {
  const steps = props.steps ?? [];
  const panels = React.Children.toArray(children);
  const [chosen, setIndex] = React.useState(0);
  const last = steps.length - 1;
  // A layout patched or swapped mid-way may have fewer steps than the one
  // reached: the last there is shows rather than none, and Back and Next
  // move from the step shown, not from the one reached.
  const index = Math.max(0, Math.min(chosen, last));
  return (
    <div className="flex flex-col gap-5">
      <ol className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {steps.map((label, position) => (
          <li
            key={`${position}-${label}`}
            aria-current={position === index ? 'step' : undefined}
            className={cn(
              'flex items-center gap-2 text-sm',
              position === index ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums',
                position < index
                  ? cn(selectedFillStrongClass, linkTextClass)
                  : position === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {position + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      {steps.map((_step, position) => (
        <div key={position} hidden={position !== index}>
          <RevealPanel open={() => setIndex(position)}>{panels[position] ?? null}</RevealPanel>
        </div>
      ))}
      {index > 0 || index < last ? (
        <div className="flex items-center justify-between gap-3">
          {index > 0 ? (
            <button
              type="button"
              data-testid="steps-back"
              onClick={() => setIndex(Math.max(0, index - 1))}
              className={SECONDARY_BUTTON}
            >
              {props.backLabel ?? 'Back'}
            </button>
          ) : (
            <span />
          )}
          {index < last ? (
            <button
              type="button"
              data-testid="steps-next"
              onClick={() => setIndex(Math.min(last, index + 1))}
              className={PRIMARY_BUTTON}
            >
              {props.nextLabel ?? 'Next'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type IconName = (typeof ICON_NAMES)[number];

/** The closed list the catalog names, each bound to its lucide component. */
const ICONS: Record<IconName, LucideIcon> = {
  Sparkles,
  Rocket,
  Compass,
  Map,
  MapPin,
  Route,
  Plane,
  Train,
  Car,
  Ship,
  Hotel,
  Home,
  Building2,
  Landmark,
  Globe,
  Mountain,
  Leaf,
  Sun,
  Moon,
  Calendar,
  Clock,
  Hourglass,
  Users,
  User,
  Baby,
  Accessibility,
  Heart,
  Star,
  Utensils,
  Coffee,
  Music,
  Camera,
  Image,
  Ticket,
  Gift,
  Wallet,
  Banknote,
  Coins,
  Receipt,
  Percent,
  Hash,
  TrendingUp,
  BarChart3,
  FileText,
  Upload,
  Paperclip,
  Mail,
  Phone,
  Tag,
  Layers,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  Flag,
  Bookmark,
  Briefcase,
  Package,
  Truck,
  Lightbulb,
  Zap,
  Pencil,
  Send,
};

/** Decorative: hidden from assistive technology, because it carries no text. */
function Icon({ props }: BaseComponentProps<{ name: IconName; size?: 'sm' | 'md' | 'lg' | null }>) {
  const Glyph = ICONS[props.name];
  if (!Glyph) return null;
  const size = props.size === 'lg' ? 'h-7 w-7' : props.size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return <Glyph aria-hidden="true" className={cn(size, 'shrink-0 text-muted-foreground')} />;
}

interface SegmentedProps {
  label: string;
  name: string;
  options: string[];
  value?: string | null;
}

/**
 * A choice as a row of pills, over the package's own toggle group. The group
 * is named by its visible label; each pill is a button whose text is its
 * option as the kernel words it (`enumLabeler`), while the value it writes
 * stays the option. Deselecting is ignored, as shadcn's toggle group does, so
 * the bound path never holds an empty string.
 */
function Segmented({ props, bindings, emit }: BaseComponentProps<SegmentedProps>) {
  const [boundValue, setBoundValue] = useBoundProp<string>(
    props.value ?? undefined,
    bindings?.value,
  );
  const [localValue, setLocalValue] = React.useState('');
  const isBound = Boolean(bindings?.value);
  const value = isBound ? (boundValue ?? '') : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const labelId = shadcn.useControlId(props.name);
  const labelOf = enumLabeler(props.options ?? [], useFieldPresentation());
  return (
    <div className="space-y-2">
      <span id={labelId} className="block text-sm leading-none font-medium">
        {props.label}
      </span>
      <ToggleGroup
        type="single"
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next: string) => {
          if (!next) return;
          setValue(next);
          emit('change');
        }}
        className="flex-wrap justify-start gap-1.5"
      >
        {(props.options ?? []).map((option, index) => (
          <ToggleGroupItem
            // A layout may name one option twice, so the option alone is no key.
            key={`${index}-${option}`}
            value={option}
            variant="outline"
            size="sm"
            // Below `sm`, the 44 pixels a finger needs, as the kernel's own
            // choice control grows there.
            className="rounded-full px-3.5 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground max-sm:h-11 max-sm:min-w-11"
          >
            {labelOf(option)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

interface NumberInputProps {
  label: string;
  name: string;
  value?: number | null;
  placeholder?: string | null;
  unit?: string | null;
  min?: number | null;
  max?: number | null;
  step?: number | null;
}

/**
 * A figure that writes a NUMBER to state - the gap Checkpoint 3 recorded
 * against shadcn's `Input type="number"`, which writes the DOM's string. An
 * emptied field writes `undefined`, which the kernel's readiness reads as
 * absent, exactly as its own number control does.
 */
function NumberInput({ props, bindings, emit }: BaseComponentProps<NumberInputProps>) {
  const [boundValue, setBoundValue] = useBoundProp<number | undefined>(
    props.value ?? undefined,
    bindings?.value,
  );
  const [localValue, setLocalValue] = React.useState<number | undefined>(undefined);
  const isBound = Boolean(bindings?.value);
  const value = isBound ? boundValue : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const id = shadcn.useControlId(props.name);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm leading-none font-medium">
        {props.label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={typeof value === 'number' ? value : ''}
          min={props.min ?? undefined}
          max={props.max ?? undefined}
          step={props.step ?? 'any'}
          placeholder={props.placeholder ?? undefined}
          onChange={(event) => {
            const raw = event.target.value;
            setValue(raw === '' ? undefined : Number(raw));
            emit('change');
          }}
          // As tall as the layer's text input and the kernel's number field,
          // which is the 44 pixels a finger needs.
          className={cn(
            fieldControlClass,
            'h-11 px-3 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
          )}
        />
        {props.unit ? <span className="text-sm text-muted-foreground">{props.unit}</span> : null}
      </div>
    </div>
  );
}

// ─── The registry ────────────────────────────────────────────────────────────

/**
 * Each renderer is MOUNTED rather than called: they are React components that
 * use hooks, and a render function calling hooks itself would run them inside
 * the registry's wrapper and break the moment the wrapper re-ordered them.
 */
const components: Components<typeof baseCatalog> = {
  Card: (ctx) => <shadcn.Card {...ctx} />,
  // A vertical Stack stretches its children unless the spec says otherwise:
  // hugging the content is the one layout a result page never wants, since a
  // table or a grid inside it would stop short of the page's width.
  Stack: (ctx) => <shadcn.Stack {...ctx} />,
  Grid: (ctx) => <shadcn.Grid {...ctx} />,
  Separator: (ctx) => <shadcn.Separator {...ctx} />,
  Collapsible: (ctx) => <shadcn.Collapsible {...ctx} />,
  Heading: (ctx) => <shadcn.Heading {...ctx} />,
  Text: (ctx) => <shadcn.Text {...ctx} />,
  Badge: (ctx) => <shadcn.Badge {...ctx} />,
  Alert: (ctx) => <shadcn.Alert {...ctx} />,
  Progress: (ctx) => <shadcn.Progress {...ctx} />,
  Avatar: (ctx) => <shadcn.Avatar {...ctx} />,
  Input: (ctx) => <shadcn.Input {...ctx} />,
  Textarea: (ctx) => <shadcn.Textarea {...ctx} />,
  // A plain label beside a trigger leaves the trigger with no accessible name,
  // which axe reports as a button without one (`a11y` runs at error). This one
  // is the package's own vendored select under a label that names the trigger.
  Select: (ctx) => <AccessibleSelect {...ctx} />,
  Radio: (ctx) => <shadcn.Radio {...ctx} />,
  Checkbox: (ctx) => <shadcn.Checkbox {...ctx} />,
  Switch: (ctx) => <shadcn.Switch {...ctx} />,
  Button: (ctx) => <shadcn.Button {...ctx} />,
  Split: (ctx) => <Split {...ctx} />,
  Tabs: (ctx) => <Tabs {...ctx} />,
  Steps: (ctx) => <Steps {...ctx} />,
  Icon: (ctx) => <Icon {...ctx} />,
  Segmented: (ctx) => <Segmented {...ctx} />,
  NumberInput: (ctx) => <NumberInput {...ctx} />,
  // Ours are React components (they use hooks), so each is MOUNTED rather than
  // called: a render function that called hooks itself would run them inside
  // the registry's wrapper and break the moment the wrapper re-ordered them.
  MthdsField: (ctx) => <MthdsField {...ctx} />,
  MthdsResult: (ctx) => <MthdsResult {...ctx} />,
  DataTable: (ctx) => <DataTable {...ctx} />,
  Metric: (ctx) => <Metric {...ctx} />,
};

/** The renderers, for the registry over the catalog that extends this vocabulary. */
/**
 * Each renderer is handed its props held to the base catalog's definitions
 * (`declared-props.ts`), so an expression that resolved to the wrong type -
 * scratch state holding a structure where a title belongs - draws nothing
 * rather than throwing past both checks.
 */
export const generativeRenderers = withDeclaredProps(
  baseCatalog.data.components as Record<string, { props?: unknown }>,
  components,
  // A hatch resolves its `path` as written, relative inside a repeat, so a
  // refused one reaches it as refused rather than written out as text.
  { MthdsField: ['path'], MthdsResult: ['path'] },
);
