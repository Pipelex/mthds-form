'use client';

import * as React from 'react';
import { type BaseComponentProps, defineRegistry, useBoundProp } from '@json-render/react';
import { useCheckedField } from './checked-fields';
import { focusOutlineClass, linkTextClass } from '../react/role-tokens';
import {
  actionShadowClass,
  headingClass,
  panelRaisedShadowClass,
  panelSurfaceClass,
} from '../react/style-tokens';
import { fieldControlClass } from '../react/field-styles';
import { cn } from '../react/utils';
import { BrandBar, CONTAINER } from './brand-bar';
import { catalog } from './catalog';
import { textOf, withDeclaredProps } from './declared-props';
import { frameRenderers } from './frame-registry';
import { generativeRenderers, useDescriptorScope } from './registry';
import { useResultSlot } from './result-slot';
import { useControlId } from './ui/shadcn';

/**
 * What the brand catalog's components RENDER as - the product page's chrome,
 * over the same tokens the kernel's controls read, and over NOTHING else: no
 * literal colour, no literal radius, no literal typeface. The rail's panel is
 * the page's style panel (`--panel-*`), falling back to `bg-card` on
 * `border-border` and a large shadow; a title reads the style's heading face,
 * weight and tracking; a hairline is `border-border`; the call to action wears
 * the style's `--action-shadow`, falling back to a glow of the button colour
 * (`--primary`) composed with `color-mix()` (see `react/style-tokens`); the corners are
 * `--radius` and its multiples, a tag is `font-mono`, the logo is the
 * manifest's pair. The running text names no face at all: it inherits the
 * page's, which a brand's compiled stylesheet sets on its scope from
 * `--font-sans` (docs/brand.md). That is what lets one set of components
 * render any brand the `./brand` entry compiles - and what makes anything the
 * tokens cannot state absent from the page by construction.
 *
 * The layer's renderers are reused as they are; two of shadcn's are replaced
 * (`Input`, `Textarea`) so that every text field on the page is drawn on the
 * kernel's own control surface (`fieldControlClass`) and reads as one family
 * with the dates, the lists and the upload the kernel renders itself.
 *
 * Nothing here reads a schema - a brand component takes copy and bound values,
 * and that is all.
 */

/** The kernel's app-presentation label, so a brand field and a kernel field read alike. */
const LABEL = 'block text-[13.5px] leading-none font-medium text-foreground';

// ─── The page's chrome ───────────────────────────────────────────────────────

interface AppBarProps {
  app: string;
  links?: string[] | null;
  tag?: string | null;
}

function AppBar({ props }: BaseComponentProps<AppBarProps>) {
  return <BrandBar app={props.app} links={props.links} tag={props.tag} />;
}

interface HeroProps {
  headline: string;
  lede?: string | null;
  eyebrow?: string | null;
}

function Hero({ props }: BaseComponentProps<HeroProps>) {
  return (
    <section className="pt-12 pb-10 sm:pt-14 sm:pb-12">
      {props.eyebrow ? (
        <p
          className={cn('mb-4 text-[11px] font-medium tracking-[0.15em] uppercase', linkTextClass)}
        >
          {props.eyebrow}
        </p>
      ) : null}
      <h1
        className={cn(
          'max-w-2xl text-4xl text-foreground sm:text-[44px] sm:leading-[1.15]',
          headingClass(700, true),
        )}
      >
        {props.headline}
      </h1>
      {props.lede ? (
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          {props.lede}
        </p>
      ) : null}
    </section>
  );
}

function Workspace({ props, children }: BaseComponentProps<{ rail?: 'right' | 'left' | null }>) {
  const [work, rail] = React.Children.toArray(children);
  const railLeft = props.rail === 'left';
  return (
    <div
      className={cn(
        CONTAINER,
        'grid grid-cols-1 gap-10 pb-16 lg:gap-14',
        railLeft ? 'lg:grid-cols-[360px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_360px]',
      )}
    >
      <div className={cn('min-w-0', railLeft && 'lg:order-2')}>
        {work}
        <ResultPanel />
      </div>
      <aside
        className={cn(
          'lg:sticky lg:top-6 lg:self-start lg:pt-12 sm:lg:pt-14',
          railLeft && 'lg:order-1',
        )}
      >
        {rail}
      </aside>
    </div>
  );
}

/**
 * What the host paints under the work column, in the page's own grammar and
 * in the container it gives everything else. No spec names it - no layout was
 * written for a result - so the page leaves the slot and places what it is
 * given; an input page before its first run is given nothing and shows none of
 * this.
 */
function ResultPanel() {
  const slot = useResultSlot();
  if (!slot?.content) return null;
  return (
    <section className="border-t border-border py-9" data-testid="result-panel" aria-live="polite">
      <h2 className={cn('mb-6 text-xl text-foreground', headingClass(600, true))}>
        {slot.title ?? 'Result'}
      </h2>
      {slot.content}
    </section>
  );
}

interface SectionProps {
  number?: string | null;
  title: string;
  lede?: string | null;
}

function Section({ props, children }: BaseComponentProps<SectionProps>) {
  return (
    <section className="border-t border-border py-9 first:border-t-0 first:pt-0">
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          {props.number ? (
            <span className={cn('font-mono text-[12px]', linkTextClass)}>{props.number}</span>
          ) : null}
          <h2 className={cn('text-xl text-foreground', headingClass(600, true))}>{props.title}</h2>
        </div>
        {props.lede ? <p className="mt-1.5 text-sm text-muted-foreground">{props.lede}</p> : null}
      </div>
      {/* The rules put a concern's inputs flat inside the Section, so the
          Section spaces them: the gap the hand-written spec's Stack gave its. */}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Rail({ props, children }: BaseComponentProps<{ title: string }>) {
  return (
    // An arbitrary value reads the token directly, so it does NOT go through
    // the `@theme inline` mapping and does not inherit its fallback - it has to
    // carry its own, or a host that defines no tokens loses the declaration
    // outright. See src/styles/tailwind-entry.css.
    <div
      data-style-panel=""
      className={cn(
        'rounded-[calc(var(--radius,0.5rem)*1.5)] p-7 text-card-foreground',
        panelSurfaceClass,
        panelRaisedShadowClass,
      )}
    >
      <h2 className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
        {props.title}
      </h2>
      <div className="mt-4 flex flex-col">{children}</div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value?: unknown;
  detail?: unknown;
  separator?: string | null;
  placeholder?: string | null;
}

function SummaryRow({ props }: BaseComponentProps<SummaryRowProps>) {
  // Each half as it writes out, so one that is a structure, which writes out
  // as nothing, leaves no separator dangling.
  const text = [props.value, props.detail]
    .map(textOf)
    .filter((half) => half !== '')
    .join(props.separator ?? ' ');
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-3 first:pt-0 last:border-b-0">
      <span className="shrink-0 text-[13px] text-muted-foreground">{props.label}</span>
      {text ? (
        <span className="text-right text-[13px] font-medium text-foreground">{text}</span>
      ) : (
        <span className="text-[13px] text-muted-foreground/50">{props.placeholder ?? '—'}</span>
      )}
    </div>
  );
}

function Cta({ props, emit }: BaseComponentProps<{ label: string; hint?: string | null }>) {
  // The host's `env.disabled` holds the run while one is going, as it holds
  // the plain form's submit: a second press would be a second billed run.
  const busy = useDescriptorScope().env?.disabled ?? false;
  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={busy}
        onClick={() => emit('press')}
        className={cn(
          'inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90',
          // The page's call-to-action shadow, or the glow in the button colour
          // it had. Focus is an outline, which no shadow a style sets can
          // replace or hide.
          actionShadowClass,
          focusOutlineClass,
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary',
        )}
      >
        {props.label}
      </button>
      {props.hint ? (
        <p className="mt-3 text-center text-[12px] leading-relaxed text-muted-foreground">
          {props.hint}
        </p>
      ) : null}
    </div>
  );
}

function Footer({ props }: BaseComponentProps<{ text: string; tag?: string | null }>) {
  return (
    <footer className="border-t border-border">
      <div
        className={cn(
          CONTAINER,
          // Wraps, and the tag may break anywhere: a pipe's code is one long
          // word, and at phone width an unbreakable one widened the document
          // past the viewport.
          'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-[12px] text-muted-foreground',
        )}
      >
        <span>{props.text}</span>
        {props.tag ? (
          <span className="min-w-0 font-mono text-[11px] tracking-wider break-all text-muted-foreground/70 uppercase">
            {props.tag}
          </span>
        ) : null}
      </div>
    </footer>
  );
}

// ─── Text fields on the kernel's own surface ─────────────────────────────────

interface Check {
  type: string;
  message: string;
  args?: Record<string, unknown>;
}

interface TextFieldProps {
  label: string;
  name: string;
  placeholder?: string | null;
  value?: string | null;
  checks?: Check[] | null;
  validateOn?: 'change' | 'blur' | 'submit' | null;
}

function useTextField(
  props: TextFieldProps,
  bindings: BaseComponentProps<TextFieldProps>['bindings'],
) {
  const [boundValue, setBoundValue] = useBoundProp<string>(
    props.value ?? undefined,
    bindings?.value,
  );
  const [localValue, setLocalValue] = React.useState('');
  const isBound = Boolean(bindings?.value);
  const value = isBound ? (boundValue ?? '') : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const validateOn = props.validateOn ?? 'blur';
  const hasValidation = Boolean(bindings?.value && props.checks?.length);
  const { errors, validate } = useCheckedField(
    bindings?.value ?? '',
    hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
  );
  const onChange = (next: string) => {
    setValue(next);
    if (hasValidation && validateOn === 'change') validate();
  };
  const onBlur = () => {
    if (hasValidation && validateOn === 'blur') validate();
  };
  return { value, errors, onChange, onBlur };
}

function BrandInput({
  props,
  bindings,
  emit,
}: BaseComponentProps<
  TextFieldProps & { type?: 'text' | 'email' | 'password' | 'number' | null }
>) {
  const field = useTextField(props, bindings);
  const id = useControlId(props.name);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {props.label}
      </label>
      <input
        id={id}
        name={props.name}
        type={props.type ?? 'text'}
        value={field.value}
        placeholder={props.placeholder ?? ''}
        aria-invalid={field.errors.length > 0 || undefined}
        onChange={(event) => field.onChange(event.target.value)}
        onBlur={() => {
          field.onBlur();
          emit('blur');
        }}
        onFocus={() => emit('focus')}
        onKeyDown={(event) => {
          if (event.key === 'Enter') emit('submit');
        }}
        className={cn(fieldControlClass, 'h-11 px-3.5')}
      />
      {field.errors[0] ? (
        <p role="alert" className="text-[11px] text-destructive">
          {field.errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function BrandTextarea({
  props,
  bindings,
}: BaseComponentProps<TextFieldProps & { rows?: number | null }>) {
  const field = useTextField(props, bindings);
  const id = useControlId(props.name);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={LABEL}>
        {props.label}
      </label>
      <textarea
        id={id}
        name={props.name}
        rows={props.rows ?? 3}
        value={field.value}
        placeholder={props.placeholder ?? ''}
        aria-invalid={field.errors.length > 0 || undefined}
        onChange={(event) => field.onChange(event.target.value)}
        onBlur={field.onBlur}
        className={cn(fieldControlClass, 'px-3.5 py-2.5 leading-relaxed')}
      />
      {field.errors[0] ? (
        <p role="alert" className="text-[11px] text-destructive">
          {field.errors[0]}
        </p>
      ) : null}
    </div>
  );
}

// ─── The registry ────────────────────────────────────────────────────────────

/** What `defineRegistry` takes for this catalog. */
type RegistryOptions = Parameters<typeof defineRegistry<typeof catalog>>[1];

/**
 * The registry over the product catalog: components only. `run` is supplied
 * by `GenerativePage`, which hands it to `JSONUIProvider` as a handler closing
 * over the host's `onRun`, or by a host's own provider; json-render's type
 * asks for an `actions` entry because the catalog declares one, but only the
 * `handlers` factory this destructure discards would ever read it, so the
 * entry is stated absent rather than filled with a no-op a reader would take
 * for the handler.
 *
 * Its `AppBar` reads the brand, so the page it renders in needs one:
 * `GenerativePage`'s `brand` prop, or a `BrandProvider` above the tree.
 */
export const { registry: generativeRegistry } = defineRegistry(catalog, {
  components: {
    ...generativeRenderers,
    // Held to their definitions as the base and frame renderers are
    // (`declared-props.ts`).
    ...withDeclaredProps(catalog.data.components as Record<string, { props?: unknown }>, {
      Input: (ctx: Parameters<typeof BrandInput>[0]) => <BrandInput {...ctx} />,
      Textarea: (ctx: Parameters<typeof BrandTextarea>[0]) => <BrandTextarea {...ctx} />,
      AppBar: (ctx: Parameters<typeof AppBar>[0]) => <AppBar {...ctx} />,
      Hero: (ctx: Parameters<typeof Hero>[0]) => <Hero {...ctx} />,
      Workspace: (ctx: Parameters<typeof Workspace>[0]) => <Workspace {...ctx} />,
      Section: (ctx: Parameters<typeof Section>[0]) => <Section {...ctx} />,
      Rail: (ctx: Parameters<typeof Rail>[0]) => <Rail {...ctx} />,
      SummaryRow: (ctx: Parameters<typeof SummaryRow>[0]) => <SummaryRow {...ctx} />,
      Cta: (ctx: Parameters<typeof Cta>[0]) => <Cta {...ctx} />,
      Footer: (ctx: Parameters<typeof Footer>[0]) => <Footer {...ctx} />,
    }),
    ...frameRenderers,
  },
} as RegistryOptions);
