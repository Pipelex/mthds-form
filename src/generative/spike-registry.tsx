'use client';

import * as React from 'react';
import {
  type BaseComponentProps,
  useBoundProp,
  useRepeatScope,
  useStateStore,
  useStateValue,
} from '@json-render/react';
import { Calendar, Clock, ArrowRight, X, Plus } from 'lucide-react';
import { FieldRenderer } from '../react';
import { cn } from '../react/utils';
import { useFrameHost } from './frame-host';
import { domIdFor, useDescriptorScope } from './registry';
import { inputFieldAtPath } from './paths';

/**
 * SPIKE (L-261107-a6a35f): the renderers of `spike-definitions.ts`. Each reads
 * the theme contract's tokens only, so a host's style reaches it as it
 * reaches the kernel's controls.
 */

const PANEL =
  'rounded-[calc(var(--radius,0.5rem)*1.6)] border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05),0_10px_28px_-10px_rgb(0_0_0/0.16)]';
const LABEL = 'block text-sm font-medium text-foreground';
const CONTROL =
  'flex h-11 w-full items-center gap-2 rounded-[var(--radius,0.5rem)] border border-border bg-background px-3 text-[15px] text-foreground';

function useAbsolute(path: string): string {
  const repeat = useRepeatScope();
  if (path.startsWith('/')) return path;
  if (!repeat) return path;
  return path === '' ? repeat.basePath : `${repeat.basePath}/${path}`;
}

// ─── Composer ────────────────────────────────────────────────────────────────

interface ComposerProps {
  headline: string;
  lede?: string | null;
  runLabel: string;
  columns?: '1' | '2' | null;
  notes?: string[] | null;
}

function Composer({ props, children, emit }: BaseComponentProps<ComposerProps>) {
  const host = useFrameHost();
  const two = props.columns === '2';
  return (
    <div
      className={cn('mx-auto flex w-full flex-col gap-7', two ? 'max-w-[980px]' : 'max-w-[740px]')}
    >
      <div>
        <h1 className="text-[length:var(--h1,36px)] leading-[1.08] tracking-tight text-balance text-foreground">
          {props.headline}
        </h1>
        {props.lede ? (
          <p className="mt-3.5 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">
            {props.lede}
          </p>
        ) : null}
      </div>
      <div className={cn(PANEL, 'p-7 max-sm:p-5')}>
        <div className={cn('grid gap-8', two && 'md:grid-cols-2 md:gap-x-10')}>{children}</div>
        <div className="sticky bottom-0 z-[2] -mx-7 -mb-7 mt-7 flex items-center justify-between gap-4 rounded-b-[calc(var(--radius,0.5rem)*1.6)] border-t border-border bg-card px-7 pt-[18px] pb-7 max-sm:-mx-5 max-sm:-mb-5 max-sm:flex-col-reverse max-sm:items-stretch max-sm:px-5 max-sm:pb-5">
          {host.eta ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground max-sm:justify-center">
              <Clock className="size-4" aria-hidden="true" /> {host.eta}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => emit('press')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius,0.5rem)] bg-primary px-[22px] text-[15px] font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            {props.runLabel} <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {props.notes && props.notes.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-2.5 px-1 sm:grid-cols-2">
          {props.notes.map((note, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span aria-hidden="true" className="text-[var(--link,var(--primary))]">
                ✓
              </span>
              <span className="min-w-0">{note}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FieldGroup({ props, children }: BaseComponentProps<{ title?: string | null }>) {
  return (
    <section className="flex min-w-0 flex-col gap-5">
      {props.title ? (
        <h2 className="text-[17px] leading-snug font-semibold text-foreground">{props.title}</h2>
      ) : null}
      {children}
    </section>
  );
}

// ─── DateRange ───────────────────────────────────────────────────────────────

const DAY = 86_400_000;

function asDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function DateBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (next: string) => void;
}) {
  const date = asDate(value);
  return (
    <label className={cn(CONTROL, 'relative min-w-0 flex-1 cursor-pointer')}>
      <Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className={cn('truncate', !date && 'text-muted-foreground')}>
        {date ? shortDate(date) : 'Pick a date'}
      </span>
      <input
        type="date"
        aria-label={label}
        value={value?.slice(0, 10) ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}

interface DateRangeProps {
  label: string;
  from?: string | null;
  to?: string | null;
}

function DateRange({ props, bindings }: BaseComponentProps<DateRangeProps>) {
  const [from, setFrom] = useBoundProp<string>(props.from ?? undefined, bindings?.from);
  const [to, setTo] = useBoundProp<string>(props.to ?? undefined, bindings?.to);
  const a = asDate(from);
  const b = asDate(to);
  const nights = a && b ? Math.round((b.getTime() - a.getTime()) / DAY) : undefined;
  const weekday = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
  return (
    <div className="flex flex-col gap-2">
      <span className={LABEL}>{props.label}</span>
      <div className="flex items-center gap-2.5">
        <DateBox label={`${props.label}: from`} value={from} onChange={(v) => setFrom(v)} />
        <span className="text-sm text-muted-foreground">to</span>
        <DateBox label={`${props.label}: to`} value={to} onChange={(v) => setTo(v)} />
      </div>
      {a && b && nights !== undefined && nights >= 0 ? (
        <p className="text-[13px] text-muted-foreground">
          {weekday(a)} to {weekday(b)}, {nights} {nights === 1 ? 'night' : 'nights'}
        </p>
      ) : null}
    </div>
  );
}

// ─── Chips ───────────────────────────────────────────────────────────────────

interface ChipsProps {
  label: string;
  value?: string[] | null;
  placeholder?: string | null;
}

function Chips({ props, bindings }: BaseComponentProps<ChipsProps>) {
  const [value, setValue] = useBoundProp<string[]>(props.value ?? undefined, bindings?.value);
  const [draft, setDraft] = React.useState('');
  const items = Array.isArray(value) ? value : [];
  const id = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={LABEL}>
        {props.label}
      </label>
      <div className={cn(CONTROL, 'h-auto min-h-11 flex-wrap py-1.5')}>
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-muted pr-1.5 pl-2.5 text-sm text-foreground"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => setValue(items.filter((_, j) => j !== i))}
              className="grid size-5 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={props.placeholder ?? 'Add one'}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && draft.trim()) {
              event.preventDefault();
              setValue([...items, draft.trim()]);
              setDraft('');
            }
          }}
          className="h-7 min-w-[8ch] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

// ─── CompactList ─────────────────────────────────────────────────────────────

interface CompactListProps {
  label: string;
  items?: unknown[] | null;
  primary: string;
  secondary?: string[] | null;
  addLabel: string;
}

function initials(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}

function CompactList({ props, bindings }: BaseComponentProps<CompactListProps>) {
  const scope = useDescriptorScope();
  const path = bindings?.items ?? '';
  const listField = scope.inputs && path ? inputFieldAtPath(scope.inputs, path) : undefined;
  const itemField = listField?.kind === 'list' ? listField.item : undefined;
  const raw = useStateValue<unknown>(path);
  const items = Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
  const { set } = useStateStore();
  const [open, setOpen] = React.useState<number | null>(null);
  const read = (item: Record<string, unknown>, key: string) => {
    const v = item[key];
    return v === undefined || v === null || v === '' ? undefined : String(v);
  };
  return (
    <div className="flex flex-col gap-2">
      <span className={LABEL}>{props.label}</span>
      <div className="overflow-hidden rounded-[var(--radius,0.5rem)] border border-border bg-background">
        {items.map((item, i) => {
          const name = read(item, props.primary) ?? `Item ${i + 1}`;
          const sub = (props.secondary ?? [])
            .map((k) => read(item, k))
            .filter(Boolean)
            .join(' · ');
          return (
            <div key={i} className="border-b border-border last:border-b-0">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-[12px] font-semibold text-foreground">
                  {initials(name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-foreground">{name}</span>
                  {sub ? (
                    <span className="block truncate text-[13px] text-muted-foreground">{sub}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="min-h-9 px-1 text-sm font-medium text-[var(--link,var(--primary))]"
                >
                  {open === i ? 'Done' : 'Edit'}
                  <span className="sr-only"> {name}</span>
                </button>
              </div>
              {open === i && itemField ? (
                <div className="border-t border-border bg-muted/30 px-3 py-3">
                  <FieldRenderer
                    field={itemField}
                    value={item}
                    onChange={(next) => set(`${path}/${i}`, next)}
                    id={domIdFor(scope.idPrefix, `${path}/${i}`)}
                    env={scope.env}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => {
            set(path, [...items, {}]);
            setOpen(items.length);
          }}
          className="flex min-h-11 w-full items-center gap-2 px-4 text-sm font-medium text-[var(--link,var(--primary))]"
        >
          <Plus className="size-4" aria-hidden="true" /> {props.addLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Result: ResultHeader ────────────────────────────────────────────────────

interface ResultHeaderProps {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
}

function ResultHeader({ props }: BaseComponentProps<ResultHeaderProps>) {
  const host = useFrameHost();
  return (
    <div className="flex items-start justify-between gap-6 max-sm:flex-col">
      <div className="min-w-0">
        {props.eyebrow ? (
          <p className="mb-1.5 text-[13px] font-semibold text-[var(--link,var(--primary))]">
            {props.eyebrow}
          </p>
        ) : null}
        <h1 className="text-[length:var(--h2,28px)] leading-[1.12] tracking-tight text-balance text-foreground">
          {props.title}
        </h1>
        {props.subtitle ? (
          <p className="mt-2 text-[15px] text-muted-foreground">{props.subtitle}</p>
        ) : null}
      </div>
      {host.actions && host.actions.length > 0 ? (
        <div className="flex shrink-0 gap-2">
          {host.actions.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => host.onAction?.(label)}
              className={cn(
                'inline-flex min-h-9 items-center rounded-[var(--radius,0.5rem)] px-4 text-sm font-semibold',
                i === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── Result: ProportionBar ───────────────────────────────────────────────────

interface ProportionBarProps {
  label: string;
  total?: number | null;
  of?: number | null;
  unit?: string | null;
  items?: unknown[] | null;
  labelKey: string;
  valueKey: string;
}

const SEGMENT_MIX = [100, 70, 45, 85, 30, 60, 20];

function amount(value: number, unit: string | null | undefined): string {
  if (unit && /^[A-Z]{3}$/.test(unit)) {
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: unit,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      /* not a currency code */
    }
  }
  const n = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value);
  return unit ? `${n} ${unit}` : n;
}

function ProportionBar({ props }: BaseComponentProps<ProportionBarProps>) {
  const rows = (Array.isArray(props.items) ? props.items : []) as Array<Record<string, unknown>>;
  const parts = rows
    .map((row) => ({
      label: String(row[props.labelKey] ?? ''),
      value: Number(row[props.valueKey] ?? 0),
    }))
    .filter((p) => Number.isFinite(p.value) && p.value > 0);
  const sum = parts.reduce((s, p) => s + p.value, 0);
  const total = typeof props.total === 'number' ? props.total : sum;
  const scale = Math.max(sum, total, typeof props.of === 'number' ? props.of : 0) || 1;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className={cn(PANEL, 'flex flex-col gap-3.5 px-6 py-5')}>
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-[15px] text-muted-foreground">{props.label}</span>
        <strong className="text-2xl font-semibold tabular-nums text-foreground">
          {amount(total, props.unit)}
        </strong>
        {typeof props.of === 'number' ? (
          <span className="text-[15px] text-muted-foreground">
            of {amount(props.of, props.unit)}
          </span>
        ) : null}
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {parts.map((p, i) => (
          <span
            key={p.label}
            style={{
              width: `${(p.value / scale) * 100}%`,
              background: `color-mix(in oklab, var(--link, var(--primary)) ${SEGMENT_MIX[i % SEGMENT_MIX.length]}%, var(--muted))`,
            }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {parts.map((p, i) => (
          <li
            key={p.label}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span
              className="size-2 rounded-[2px]"
              style={{
                background: `color-mix(in oklab, var(--link, var(--primary)) ${SEGMENT_MIX[i % SEGMENT_MIX.length]}%, var(--muted))`,
              }}
              aria-hidden="true"
            />
            {cap(p.label)} {amount(p.value, props.unit)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Result: Swatches, Picture, Fact, Detail ─────────────────────────────────

function Swatches({ props }: BaseComponentProps<{ colors: string[] }>) {
  const colors = (props.colors ?? []).filter((c): c is string => typeof c === 'string' && c !== '');
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, i) => (
        <div key={`${color}-${i}`} className="flex flex-col gap-1">
          <span
            className="h-7 w-11 rounded-[3px] border border-border"
            style={{ background: color }}
          />
          <span className="font-mono text-[11px] text-muted-foreground">{color}</span>
        </div>
      ))}
    </div>
  );
}

const ASPECT: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
};

function Picture({
  props,
}: BaseComponentProps<{ path: string; alt?: string | null; aspect?: string | null }>) {
  const path = useAbsolute(props.path);
  const value = useStateValue<unknown>(path);
  const file = value as { url?: string; public_url?: string } | undefined;
  const src = file?.public_url ?? file?.url;
  const aspect = props.aspect && props.aspect !== 'auto' ? ASPECT[props.aspect] : undefined;
  if (!src) return null;
  return (
    <img
      src={src}
      alt={props.alt ?? ''}
      className={cn(
        'block w-full rounded-[var(--radius,0.5rem)] border border-border bg-muted object-cover',
        aspect,
      )}
    />
  );
}

function present(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function Fact({
  props,
}: BaseComponentProps<{ label: string; value?: unknown; detail?: string | null }>) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius,0.5rem)] border border-border bg-background px-4 py-3">
      <span className="text-[13px] text-muted-foreground">{props.label}</span>
      <span className="text-[16px] font-medium text-foreground tabular-nums">
        {present(props.value) ? String(props.value) : '—'}
      </span>
      {props.detail ? (
        <span className="text-[13px] text-muted-foreground">{props.detail}</span>
      ) : null}
    </div>
  );
}

function Detail({ props }: BaseComponentProps<{ label: string; value?: unknown }>) {
  if (!present(props.value)) return null;
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 border-b border-border py-2.5 text-[14px] last:border-b-0">
      <span className="text-muted-foreground">{props.label}</span>
      <span className="text-foreground">{String(props.value)}</span>
    </div>
  );
}

const DATE_STYLES: Record<string, Intl.DateTimeFormatOptions> = {
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
  short: { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' },
  weekday: { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' },
};

interface DateTextProps {
  value?: string | null;
  style?: 'long' | 'short' | 'weekday' | null;
  tone?: 'default' | 'muted' | 'accent' | null;
}

function DateText({ props }: BaseComponentProps<DateTextProps>) {
  const date = asDate(props.value);
  if (!date) return null;
  const tone =
    props.tone === 'accent'
      ? 'text-[13px] font-semibold text-[var(--link,var(--primary))]'
      : props.tone === 'muted'
        ? 'text-sm text-muted-foreground'
        : 'text-[15px] text-foreground';
  return (
    <span className={cn('block', tone)}>
      {date.toLocaleDateString('en-GB', DATE_STYLES[props.style ?? 'long'])}
    </span>
  );
}

interface TextListProps {
  items?: unknown;
  marker?: 'bullet' | 'number' | 'check' | null;
}

function TextList({ props }: BaseComponentProps<TextListProps>) {
  const items = Array.isArray(props.items)
    ? props.items.filter((x) => typeof x === 'string' && x.trim())
    : [];
  if (items.length === 0) return null;
  const marker = props.marker ?? 'bullet';
  return (
    <ol className="flex flex-col gap-2.5">
      {items.map((text, index) => (
        <li key={index} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
          <span
            aria-hidden="true"
            className={cn(
              'mt-[0.55em] shrink-0',
              marker === 'bullet' && 'size-1.5 rounded-full bg-[var(--link,var(--primary))]',
              marker === 'number' &&
                'mt-0 min-w-5 text-sm font-semibold tabular-nums text-[var(--link,var(--primary))]',
              marker === 'check' && 'mt-0 text-[var(--link,var(--primary))]',
            )}
          >
            {marker === 'number' ? `${index + 1}.` : marker === 'check' ? '✓' : null}
          </span>
          <span className="min-w-0">{String(text)}</span>
        </li>
      ))}
    </ol>
  );
}

export const spikeRenderers = {
  TextList: (ctx: BaseComponentProps<TextListProps>) => <TextList {...ctx} />,
  DateText: (ctx: BaseComponentProps<DateTextProps>) => <DateText {...ctx} />,
  Composer: (ctx: BaseComponentProps<ComposerProps>) => <Composer {...ctx} />,
  FieldGroup: (ctx: BaseComponentProps<{ title?: string | null }>) => <FieldGroup {...ctx} />,
  DateRange: (ctx: BaseComponentProps<DateRangeProps>) => <DateRange {...ctx} />,
  Chips: (ctx: BaseComponentProps<ChipsProps>) => <Chips {...ctx} />,
  CompactList: (ctx: BaseComponentProps<CompactListProps>) => <CompactList {...ctx} />,
  ResultHeader: (ctx: BaseComponentProps<ResultHeaderProps>) => <ResultHeader {...ctx} />,
  ProportionBar: (ctx: BaseComponentProps<ProportionBarProps>) => <ProportionBar {...ctx} />,
  Swatches: (ctx: BaseComponentProps<{ colors: string[] }>) => <Swatches {...ctx} />,
  Picture: (
    ctx: BaseComponentProps<{ path: string; alt?: string | null; aspect?: string | null }>,
  ) => <Picture {...ctx} />,
  Fact: (ctx: BaseComponentProps<{ label: string; value?: unknown; detail?: string | null }>) => (
    <Fact {...ctx} />
  ),
  Detail: (ctx: BaseComponentProps<{ label: string; value?: unknown }>) => <Detail {...ctx} />,
};
