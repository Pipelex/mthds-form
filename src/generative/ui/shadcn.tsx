'use client';

import * as React from 'react';
import { type BaseComponentProps, useBoundProp, useFieldValidation } from '@json-render/react';
import { fieldControlClass } from '../../react/field-styles';
import { cn } from '../../react/utils';
import { Switch as SwitchPrimitive } from '../../react/ui/switch';

/**
 * The renderers for the shadcn subset the catalog picks.
 *
 * They are the package's own, over the same theme tokens the kernel's controls
 * read, for the same reason the controls vendor their primitives: a consumer
 * of `./generative` installs this package and a handful of radix primitives,
 * never a component library. The DEFINITIONS these implement live in
 * `../shadcn-definitions.ts`, and `docs/dependency-budget.md` states the pair.
 *
 * A bound prop is read through `useBoundProp` and written back at the path the
 * spec named, so what the person types lands in the host's store and nowhere
 * else. An unbound one falls back to component state, which is what lets a
 * layout be rendered over an empty store while it is being read.
 */

type Check = { type: string; message: string; args?: Record<string, unknown> };
type ValidateOn = 'change' | 'blur' | 'submit';

interface BoundFieldProps {
  checks?: Check[] | null;
  validateOn?: ValidateOn | null;
}

/**
 * The one piece of binding every input repeats: the value the control shows,
 * the setter that writes it back, and the checks the spec attached to it.
 * `useFieldValidation` is given a binding only when there is both a path and a
 * check, so an unbound control never registers a validator the run would wait
 * on.
 */
function useBoundField<T>(
  literal: T | null | undefined,
  binding: string | undefined,
  empty: T,
  { checks, validateOn }: BoundFieldProps,
) {
  const [boundValue, setBoundValue] = useBoundProp<T>(literal ?? undefined, binding);
  const [localValue, setLocalValue] = React.useState<T>(literal ?? empty);
  const isBound = Boolean(binding);
  const hasValidation = Boolean(binding && checks?.length);
  const when = validateOn ?? 'change';
  const { errors, validate } = useFieldValidation(
    binding ?? '',
    hasValidation ? { checks: checks ?? [], validateOn: when } : undefined,
  );
  return {
    value: isBound ? (boundValue ?? empty) : localValue,
    setValue: (next: T) => {
      if (isBound) setBoundValue(next);
      else setLocalValue(next);
    },
    error: errors[0],
    validateOnChange: () => {
      if (hasValidation && when === 'change') validate();
    },
    validateOnBlur: () => {
      if (hasValidation && when === 'blur') validate();
    },
  };
}

const LABEL = 'block text-sm leading-none font-medium';

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

// ── Layout ──────────────────────────────────────────────────────────────────

export function Card({
  props,
  children,
}: BaseComponentProps<{ title?: string | null; description?: string | null }>) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
      {props.title || props.description ? (
        <div className="mb-4 space-y-1.5">
          {props.title ? (
            <h3 className="text-lg leading-none font-semibold">{props.title}</h3>
          ) : null}
          {props.description ? (
            <p className="text-sm text-muted-foreground">{props.description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

const GAP: Record<string, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const ALIGN: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const JUSTIFY: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export function Stack({
  props,
  children,
}: BaseComponentProps<{
  direction?: 'horizontal' | 'vertical' | null;
  gap?: keyof typeof GAP | null;
  align?: keyof typeof ALIGN | null;
  justify?: keyof typeof JUSTIFY | null;
}>) {
  const horizontal = props.direction === 'horizontal';
  return (
    <div
      className={cn(
        'flex',
        horizontal ? 'flex-row' : 'flex-col',
        GAP[props.gap ?? 'md'],
        props.align ? ALIGN[props.align] : horizontal ? 'items-start' : 'items-stretch',
        props.justify ? JUSTIFY[props.justify] : undefined,
      )}
    >
      {children}
    </div>
  );
}

/** Enumerated rather than interpolated: Tailwind compiles the class names it can see. */
const COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
  6: 'sm:grid-cols-2 lg:grid-cols-6',
};

export function Grid({
  props,
  children,
}: BaseComponentProps<{ columns?: number | null; gap?: keyof typeof GAP | null }>) {
  const columns = Math.min(Math.max(Math.round(props.columns ?? 2), 1), 6);
  return (
    <div className={cn('grid grid-cols-1', COLUMNS[columns], GAP[props.gap ?? 'md'])}>
      {children}
    </div>
  );
}

export function Separator({
  props,
}: BaseComponentProps<{ orientation?: 'horizontal' | 'vertical' | null }>) {
  const vertical = props.orientation === 'vertical';
  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn('shrink-0 bg-border', vertical ? 'h-full w-px' : 'h-px w-full')}
    />
  );
}

/**
 * `details`/`summary` rather than a disclosure primitive: the open state is the
 * element's own, which is what the catalog asks for (a page's UI state never
 * reaches `/state`), and a closed section still exists for find-in-page.
 */
export function Collapsible({
  props,
  children,
}: BaseComponentProps<{ title: string; defaultOpen?: boolean | null }>) {
  return (
    <details
      className="rounded-md border border-border"
      open={props.defaultOpen ?? false}
      data-slot="collapsible"
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium select-none">
        {props.title}
      </summary>
      <div className="border-t border-border px-4 py-3">{children}</div>
    </details>
  );
}

// ── Content ─────────────────────────────────────────────────────────────────

const HEADING: Record<string, string> = {
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
};

export function Heading({
  props,
}: BaseComponentProps<{ text: string; level?: 'h1' | 'h2' | 'h3' | 'h4' | null }>) {
  const level = props.level ?? 'h2';
  const Tag = level;
  return <Tag className={cn('text-foreground', HEADING[level])}>{props.text}</Tag>;
}

const TEXT: Record<string, string> = {
  body: 'text-sm text-foreground',
  caption: 'text-xs text-muted-foreground',
  muted: 'text-sm text-muted-foreground',
  lead: 'text-lg text-muted-foreground',
  code: 'font-mono text-[13px] text-foreground',
};

export function Text({
  props,
}: BaseComponentProps<{
  text: string;
  variant?: 'body' | 'caption' | 'muted' | 'lead' | 'code' | null;
}>) {
  return <p className={TEXT[props.variant ?? 'body']}>{props.text}</p>;
}

const AVATAR_SIZE: Record<string, string> = {
  sm: 'size-8 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
};

/** Initials only: the catalog's description tells a model never to set `src`. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({
  props,
}: BaseComponentProps<{ name: string; size?: 'sm' | 'md' | 'lg' | null }>) {
  const name = String(props.name ?? '');
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
        AVATAR_SIZE[props.size ?? 'md'],
      )}
      aria-label={name || undefined}
      role="img"
    >
      {initialsOf(name)}
    </span>
  );
}

const BADGE: Record<string, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-white',
  outline: 'border border-border text-foreground',
};

export function Badge({
  props,
}: BaseComponentProps<{
  text: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | null;
}>) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium',
        BADGE[props.variant ?? 'default'],
      )}
    >
      {props.text}
    </span>
  );
}

const ALERT: Record<string, string> = {
  info: 'border-border bg-muted text-foreground',
  success: 'border-border bg-muted text-foreground',
  warning: 'border-border bg-muted text-foreground',
  error: 'border-destructive/50 bg-destructive/10 text-foreground',
};

export function Alert({
  props,
}: BaseComponentProps<{
  title: string;
  message?: string | null;
  type?: 'info' | 'success' | 'warning' | 'error' | null;
}>) {
  const type = props.type ?? 'info';
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border px-4 py-3 text-sm', ALERT[type])}
    >
      <p className="font-medium">{props.title}</p>
      {props.message ? <p className="mt-1 text-muted-foreground">{props.message}</p> : null}
    </div>
  );
}

export function Progress({
  props,
}: BaseComponentProps<{ value: number; max?: number | null; label?: string | null }>) {
  const max = props.max ?? 100;
  const value = Math.min(Math.max(Number(props.value) || 0, 0), max);
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      {props.label ? <p className="text-sm text-muted-foreground">{props.label}</p> : null}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={props.label ?? undefined}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// ── Inputs ──────────────────────────────────────────────────────────────────

let sequence = 0;

/** A stable id per mounted control, for the label that names it. */
function useControlId(name: string): string {
  return React.useMemo(() => `jr-${name}-${(sequence += 1)}`, [name]);
}

export function Input({
  props,
  bindings,
  emit,
}: BaseComponentProps<
  {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'number' | null;
    placeholder?: string | null;
    value?: string | null;
  } & BoundFieldProps
>) {
  const id = useControlId(props.name);
  const field = useBoundField<string>(props.value, bindings?.value, '', props);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {props.label}
      </label>
      <input
        id={id}
        name={props.name}
        type={props.type ?? 'text'}
        className={cn(fieldControlClass, 'min-h-11 px-3 py-2')}
        placeholder={props.placeholder ?? undefined}
        value={field.value}
        aria-invalid={field.error ? true : undefined}
        onChange={(event) => {
          field.setValue(event.target.value);
          field.validateOnChange();
        }}
        onFocus={() => emit('focus')}
        onBlur={() => {
          field.validateOnBlur();
          emit('blur');
        }}
      />
      <FieldError message={field.error} />
    </div>
  );
}

export function Textarea({
  props,
  bindings,
}: BaseComponentProps<
  {
    label: string;
    name: string;
    placeholder?: string | null;
    rows?: number | null;
    value?: string | null;
  } & BoundFieldProps
>) {
  const id = useControlId(props.name);
  const field = useBoundField<string>(props.value, bindings?.value, '', props);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {props.label}
      </label>
      <textarea
        id={id}
        name={props.name}
        rows={props.rows ?? 4}
        className={cn(fieldControlClass, 'px-3 py-2')}
        placeholder={props.placeholder ?? undefined}
        value={field.value}
        aria-invalid={field.error ? true : undefined}
        onChange={(event) => {
          field.setValue(event.target.value);
          field.validateOnChange();
        }}
        onBlur={field.validateOnBlur}
      />
      <FieldError message={field.error} />
    </div>
  );
}

export function Radio({
  props,
  bindings,
  emit,
}: BaseComponentProps<
  { label: string; name: string; options: string[]; value?: string | null } & BoundFieldProps
>) {
  const id = useControlId(props.name);
  const field = useBoundField<string>(props.value, bindings?.value, '', props);
  return (
    <fieldset className="space-y-2" aria-invalid={field.error ? true : undefined}>
      <legend className={LABEL}>{props.label}</legend>
      <div className="space-y-2">
        {(props.options ?? []).map((option, index) => (
          <label key={`${index}-${option}`} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={id}
              value={option}
              checked={field.value === option}
              className="size-4 accent-primary"
              onChange={() => {
                field.setValue(option);
                field.validateOnChange();
                emit('change');
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <FieldError message={field.error} />
    </fieldset>
  );
}

export function Checkbox({
  props,
  bindings,
  emit,
}: BaseComponentProps<
  { label: string; name: string; checked?: boolean | null } & BoundFieldProps
>) {
  const id = useControlId(props.name);
  const field = useBoundField<boolean>(props.checked, bindings?.checked, false, props);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm">
        <input
          id={id}
          name={props.name}
          type="checkbox"
          className="size-4 accent-primary"
          checked={field.value}
          aria-invalid={field.error ? true : undefined}
          onChange={(event) => {
            field.setValue(event.target.checked);
            field.validateOnChange();
            emit('change');
          }}
        />
        <span>{props.label}</span>
      </label>
      <FieldError message={field.error} />
    </div>
  );
}

export function Switch({
  props,
  bindings,
  emit,
}: BaseComponentProps<
  { label: string; name: string; checked?: boolean | null } & BoundFieldProps
>) {
  const id = useControlId(props.name);
  const field = useBoundField<boolean>(props.checked, bindings?.checked, false, props);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <SwitchPrimitive
          id={id}
          name={props.name}
          checked={field.value}
          aria-invalid={field.error ? true : undefined}
          onCheckedChange={(next) => {
            field.setValue(next);
            field.validateOnChange();
            emit('change');
          }}
        />
        <label htmlFor={id} className="text-sm">
          {props.label}
        </label>
      </div>
      <FieldError message={field.error} />
    </div>
  );
}

// ── Actions ─────────────────────────────────────────────────────────────────

const BUTTON: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  danger: 'bg-destructive text-white hover:bg-destructive/90',
};

export function Button({
  props,
  emit,
}: BaseComponentProps<{
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | null;
  disabled?: boolean | null;
}>) {
  return (
    <button
      type="button"
      disabled={props.disabled ?? false}
      className={cn(
        'inline-flex min-h-11 w-fit items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        BUTTON[props.variant ?? 'primary'],
      )}
      onClick={() => emit('press')}
    >
      {props.label}
    </button>
  );
}
