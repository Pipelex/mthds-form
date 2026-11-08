'use client';

import { type BaseComponentProps, useRepeatScope, useStateValue } from '@json-render/react';
import { ArrowRight, Clock } from 'lucide-react';
import { readImageContent, viewableUrl } from '../core/native-content';
import { useResolveUrl } from '../react';
import { focusOutlineClass, linkTextClass } from '../react/role-tokens';
import {
  actionShadowClass,
  headingClass,
  panelFlatShadowClass,
  panelSurfaceClass,
} from '../react/style-tokens';
import { cn } from '../react/utils';
import { textOf, withDeclaredProps } from './declared-props';
import { frameComponents } from './frame-definitions';
import { useFrameHost } from './frame-host';
import { useDescriptorScope } from './registry';

/**
 * The renderers of the two frames' vocabularies (`frame-definitions.ts`): the
 * composer of a host's compose-then-result app and its result page.
 *
 * Each reads the theme contract's tokens and the style tokens only, as the
 * product chrome does (`product-registry.tsx`): a title reads the style's
 * heading face, weight and tracking, a raised surface is the style's panel and
 * marks itself `data-style-panel`, the composer's run button wears the
 * style's call-to-action shadow. So a team's style reaches a designed page as
 * it reaches the kernel's controls, and a host that sets no style token sees
 * the look these components had before they read one.
 *
 * What the host knows and no descriptor says - how long a run takes, the
 * result's actions - comes in through `FrameHostProvider`; a picture the run
 * produced goes through the host's resolver and the kernel's URL gate, as
 * every file the result view shows does.
 */

const RADIUS = 'rounded-[calc(var(--radius,0.5rem)*1.5)]';

function useAbsolute(path: string): string {
  const repeat = useRepeatScope();
  if (path.startsWith('/')) return path;
  if (!repeat) return path;
  return path === '' ? repeat.basePath : `${repeat.basePath}/${path}`;
}

/** A date path's value as a date at noon UTC, so no time zone moves its day; `undefined` for anything else. */
function asDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
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
  // The host's `env.disabled` holds the run while one is going, as it holds
  // the plain form's submit: a second press would be a second billed run.
  const busy = useDescriptorScope().env?.disabled ?? false;
  const two = props.columns === '2';
  return (
    <div
      className={cn('mx-auto flex w-full flex-col gap-7', two ? 'max-w-[980px]' : 'max-w-[740px]')}
    >
      <div>
        <h1
          className={cn(
            'text-[32px] leading-[1.1] text-balance text-foreground sm:text-[38px] sm:leading-[1.08]',
            headingClass(700, true),
          )}
        >
          {props.headline}
        </h1>
        {props.lede ? (
          <p className="mt-3.5 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">
            {props.lede}
          </p>
        ) : null}
      </div>
      {/* The composer's panel is the host's panel, so with no style it is the
          host's hairline with no shadow, as `quiet` asks, and a style's
          shadow floats it. */}
      <div
        data-style-panel=""
        className={cn(RADIUS, panelSurfaceClass, panelFlatShadowClass, 'p-7 max-sm:p-5')}
      >
        {/* Two columns flow the groups down one column and on into the next,
            balanced, rather than a grid's rows: a row as tall as its tallest
            group left a hole beside every long list. A group may continue into
            the next column between its fields, but never inside a field (a
            list is one, so its last row never opens the next column alone)
            and never right after a title.
            The space between groups is a top margin, which a column break
            truncates. */}
        <div
          className={cn(
            'grid gap-8',
            two &&
              'md:block md:columns-2 md:gap-x-10 md:[&>*+*]:mt-8 md:[&>*>h2]:break-after-avoid md:[&>*>*:not(h2)]:break-inside-avoid',
          )}
        >
          {children}
        </div>
        <div className="sticky bottom-0 z-[2] -mx-7 -mb-7 mt-7 flex items-center justify-between gap-4 rounded-b-[calc(var(--radius,0.5rem)*1.5)] border-t border-border [background-color:var(--panel-fill,var(--card,hsl(0_0%_100%)))] px-7 pt-[18px] pb-7 max-sm:-mx-5 max-sm:-mb-5 max-sm:flex-col-reverse max-sm:items-stretch max-sm:px-5 max-sm:pb-5">
          {host.eta ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground max-sm:justify-center">
              <Clock className="size-4" aria-hidden="true" /> {host.eta}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => emit('press')}
            className={cn(
              'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius,0.5rem)] bg-primary px-[22px] text-[15px] font-semibold text-primary-foreground transition-all hover:bg-primary/90',
              actionShadowClass,
              focusOutlineClass,
              'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary',
            )}
          >
            {props.runLabel} <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {props.notes && props.notes.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-2.5 px-1 sm:grid-cols-2">
          {props.notes.map((note, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span aria-hidden="true" className={linkTextClass}>
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
        <h2 className={cn('text-[17px] leading-snug text-foreground', headingClass(600))}>
          {props.title}
        </h2>
      ) : null}
      {children}
    </section>
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
          <p className={cn('mb-1.5 text-[13px] font-semibold', linkTextClass)}>{props.eyebrow}</p>
        ) : null}
        <h1
          className={cn(
            'text-[28px] leading-[1.12] text-balance text-foreground sm:text-[32px]',
            headingClass(700, true),
          )}
        >
          {props.title}
        </h1>
        {props.subtitle ? (
          <p className="mt-2 text-[15px] text-muted-foreground">{props.subtitle}</p>
        ) : null}
      </div>
      {host.actions && host.actions.length > 0 && host.onAction ? (
        <div className="flex shrink-0 gap-2">
          {host.actions.map((label, i) => (
            <button
              key={`${i}-${label}`}
              type="button"
              onClick={() => host.onAction?.(label)}
              className={cn(
                'inline-flex min-h-11 items-center rounded-[var(--radius,0.5rem)] px-4 text-sm font-semibold sm:min-h-9',
                focusOutlineClass,
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

/**
 * A segment's share of the accent, mixed into the muted fill: an even ramp
 * from the full accent down to a quarter of it, in the order the parts come,
 * so two segments are never a near shade of each other the way a fixed
 * cycle's neighbours (85 after 100, 60 after 70) were.
 */
function segmentMix(index: number, count: number): number {
  return count <= 1 ? 100 : Math.round(100 - (index * 75) / (count - 1));
}

function segmentColor(index: number, count: number): string {
  return `color-mix(in oklab, var(--link, var(--primary, hsl(240 5.9% 10%))) ${segmentMix(index, count)}%, var(--muted, hsl(240 4.8% 95.9%)))`;
}

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
  // A part is a structure with a label member and a number member; an entry
  // that is not one - a null, a word, an expression that resolved to nothing -
  // is no part of the share, and is skipped rather than read into.
  const rows = (Array.isArray(props.items) ? props.items : []).filter(
    (row): row is Record<string, unknown> =>
      typeof row === 'object' && row !== null && !Array.isArray(row),
  );
  const parts = rows
    .map((row) => ({
      label: textOf(row[props.labelKey]),
      value: Number(row[props.valueKey] ?? 0),
    }))
    .filter((p) => Number.isFinite(p.value) && p.value > 0);
  const sum = parts.reduce((s, p) => s + p.value, 0);
  const total = typeof props.total === 'number' ? props.total : sum;
  const scale = Math.max(sum, total, typeof props.of === 'number' ? props.of : 0) || 1;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div
      data-style-panel=""
      className={cn(
        RADIUS,
        panelSurfaceClass,
        panelFlatShadowClass,
        'flex flex-col gap-3.5 px-6 py-5',
      )}
    >
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
            key={`${i}-${p.label}`}
            style={{
              width: `${(p.value / scale) * 100}%`,
              background: segmentColor(i, parts.length),
            }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {parts.map((p, i) => (
          <li
            key={`${i}-${p.label}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span
              className="size-2 rounded-[2px]"
              style={{
                background: segmentColor(i, parts.length),
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

/**
 * A colour value a swatch may paint: a hex code, a colour function, or a
 * keyword. Anything else is result text a model wrote, and painting it would
 * let `url(…)` or `image-set(…)` fetch on paint, the channel the prose
 * renderer closes for images; such an entry draws no swatch.
 */
const COLOR_VALUE =
  /^(?:#[0-9a-f]{3,8}|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([\w\s.,%/+-]*\)|[a-z]+)$/i;

function Swatches({ props }: BaseComponentProps<{ colors: string[] }>) {
  const colors = (props.colors ?? []).filter(
    (c): c is string => typeof c === 'string' && COLOR_VALUE.test(c.trim()),
  );
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, i) => (
        <div key={`${color}-${i}`} className="flex flex-col gap-1">
          <span
            className="h-7 w-11 rounded-[3px] border border-border"
            style={{ backgroundColor: color.trim() }}
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
  // The checks hold `path` to a literal; a layout rendered past them may still
  // hand an expression's value here, which shows no picture.
  const path = useAbsolute(typeof props.path === 'string' ? props.path : '');
  const value = useStateValue<unknown>(path);
  const resolve = useResolveUrl();
  // In the result view's order, each through the kernel's gate: the host's
  // resolver on the stored reference, then the file's own public URL, then the
  // reference itself, so a picture shows wherever the result view shows it.
  const content = readImageContent(value);
  const src = content
    ? (viewableUrl(resolve?.(content.url)) ??
      viewableUrl(content.publicUrl) ??
      viewableUrl(content.url))
    : undefined;
  const aspect = props.aspect && props.aspect !== 'auto' ? ASPECT[props.aspect] : undefined;
  if (!src) return null;
  return (
    <img
      src={src}
      alt={props.alt ?? content?.caption ?? ''}
      // A result's URL is the result's to choose, so the host page's address
      // is never sent to it, as with every other picture the package draws.
      referrerPolicy="no-referrer"
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
        {present(props.value) ? textOf(props.value) : '—'}
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
    // A rule between the rows of a list of details, never under one set in a
    // row: there it read as an underline on every detail but the last.
    <div className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-3 border-b border-border py-2.5 text-[14px] last:border-b-0 [.flex-row>&]:border-b-0 [.flex-row>&]:grid-cols-[auto_minmax(0,1fr)]">
      <span className="text-muted-foreground">{props.label}</span>
      <span className="text-foreground">{textOf(props.value)}</span>
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
      ? cn('text-[13px] font-semibold', linkTextClass)
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
  // Only numbered items are ordered; bullets and checks are a plain list.
  const List = marker === 'number' ? 'ol' : 'ul';
  return (
    <List className="flex flex-col gap-2.5">
      {items.map((text, index) => (
        <li key={index} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
          <span
            aria-hidden="true"
            className={cn(
              'mt-[0.55em] shrink-0',
              marker === 'bullet' &&
                'size-1.5 rounded-full bg-[color:var(--link,var(--primary,hsl(240_5.9%_10%)))]',
              marker === 'number' &&
                cn('mt-0 min-w-5 text-sm font-semibold tabular-nums', linkTextClass),
              marker === 'check' && cn('mt-0', linkTextClass),
            )}
          >
            {marker === 'number' ? `${index + 1}.` : marker === 'check' ? '✓' : null}
          </span>
          <span className="min-w-0">{String(text)}</span>
        </li>
      ))}
    </List>
  );
}

/**
 * Each renderer is handed its props held to the frame's definitions
 * (`declared-props.ts`), as the base catalog's are.
 */
export const frameRenderers = withDeclaredProps(frameComponents, {
  TextList: (ctx: BaseComponentProps<TextListProps>) => <TextList {...ctx} />,
  DateText: (ctx: BaseComponentProps<DateTextProps>) => <DateText {...ctx} />,
  Composer: (ctx: BaseComponentProps<ComposerProps>) => <Composer {...ctx} />,
  FieldGroup: (ctx: BaseComponentProps<{ title?: string | null }>) => <FieldGroup {...ctx} />,
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
});
