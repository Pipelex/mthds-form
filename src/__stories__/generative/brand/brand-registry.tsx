import * as React from 'react';
import {
  type BaseComponentProps,
  defineRegistry,
  useBoundProp,
  useFieldValidation,
} from '@json-render/react';
import { fieldControlClass } from '../../../react/field-styles';
import { cn } from '../../../react/utils';
import { generativeRenderers, useDescriptorScope } from '../registry';
import { brandCatalog } from './brand-catalog';
import { useBrand } from './brand-context';

/**
 * What the brand catalog's components RENDER as - the product page's chrome,
 * over the same tokens the kernel's controls read, and over NOTHING else: no
 * literal colour, no literal radius, no literal typeface. The rail's panel is
 * `bg-card` on `border-border`, a hairline is `border-border`, the call to
 * action's glow is the accent composed with `color-mix()`, the corners are
 * `--radius` and its multiples, the logo is the manifest's pair. That is what
 * lets one set of components render any brand the build produces - and what
 * makes anything the tokens cannot state absent from the page by
 * construction.
 *
 * The layer's renderers are reused as they are; two of shadcn's are replaced
 * (`Input`, `Textarea`) so that every text field on the page is drawn on the
 * kernel's own control surface (`fieldControlClass`) and reads as one family
 * with the dates, the lists and the upload the kernel renders itself.
 *
 * Nothing here ships, and nothing here reads a schema - a brand component
 * takes copy and bound values, and that is all.
 */

const CONTAINER = 'mx-auto w-full max-w-6xl px-6 sm:px-8';

/** The kernel's app-presentation label, so a brand field and a kernel field read alike. */
const LABEL = 'block text-[13.5px] leading-none font-medium text-foreground';

// ─── The page's chrome ───────────────────────────────────────────────────────

interface AppBarProps {
  app: string;
  links?: string[] | null;
  tag?: string | null;
}

function AppBar({ props }: BaseComponentProps<AppBarProps>) {
  const brand = useBrand();
  return (
    <header className="border-b border-border">
      <div className={cn(CONTAINER, 'flex h-16 items-center gap-5')}>
        <img src={brand.logo.onLight} alt={brand.name} className="h-7 w-auto dark:hidden" />
        <img src={brand.logo.onDark} alt={brand.name} className="hidden h-7 w-auto dark:block" />
        <span aria-hidden="true" className="h-5 w-px bg-border" />
        <span className="text-sm font-medium text-foreground/80">{props.app}</span>
        <div className="ml-auto flex items-center gap-6">
          {props.links && props.links.length > 0 ? (
            <nav aria-label="Site" className="hidden items-center gap-6 sm:flex">
              {props.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </a>
              ))}
            </nav>
          ) : null}
          {props.tag ? (
            <span className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
              {props.tag}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
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
        <p className="mb-4 text-[11px] font-medium tracking-[0.15em] text-primary uppercase">
          {props.eyebrow}
        </p>
      ) : null}
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-[44px] sm:leading-[1.15]">
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
      <div className={cn('min-w-0', railLeft && 'lg:order-2')}>{work}</div>
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
            <span className="font-mono text-[12px] text-primary">{props.number}</span>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{props.title}</h2>
        </div>
        {props.lede ? <p className="mt-1.5 text-sm text-muted-foreground">{props.lede}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Rail({ props, children }: BaseComponentProps<{ title: string }>) {
  return (
    <div className="rounded-[calc(var(--radius)*1.5)] border border-border bg-card p-7 text-card-foreground shadow-xl">
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

function present(value: unknown): value is string | number | boolean {
  return value !== undefined && value !== null && value !== '';
}

function SummaryRow({ props }: BaseComponentProps<SummaryRowProps>) {
  const text = [props.value, props.detail]
    .filter(present)
    .map(String)
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
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => emit('press')}
        className={cn(
          'inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground',
          'shadow-[0_0_28px_color-mix(in_oklab,var(--primary)_35%,transparent)] transition-all hover:bg-primary/90 hover:shadow-[0_0_44px_color-mix(in_oklab,var(--primary)_50%,transparent)]',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden',
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
          'flex items-center justify-between py-6 text-[12px] text-muted-foreground',
        )}
      >
        <span>{props.text}</span>
        {props.tag ? (
          <span className="font-mono text-[11px] tracking-wider text-muted-foreground/70 uppercase">
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
  const scope = useDescriptorScope();
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
  const { errors, validate } = useFieldValidation(
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
  return { idPrefix: scope.idPrefix ?? 'gen', value, errors, onChange, onBlur };
}

function BrandInput({
  props,
  bindings,
  emit,
}: BaseComponentProps<
  TextFieldProps & { type?: 'text' | 'email' | 'password' | 'number' | null }
>) {
  const field = useTextField(props, bindings);
  const id = `${field.idPrefix}-input-${props.name}`;
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
  const id = `${field.idPrefix}-textarea-${props.name}`;
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

export const { registry: brandRegistry } = defineRegistry(brandCatalog, {
  components: {
    ...generativeRenderers,
    Input: (ctx) => <BrandInput {...ctx} />,
    Textarea: (ctx) => <BrandTextarea {...ctx} />,
    AppBar: (ctx) => <AppBar {...ctx} />,
    Hero: (ctx) => <Hero {...ctx} />,
    Workspace: (ctx) => <Workspace {...ctx} />,
    Section: (ctx) => <Section {...ctx} />,
    Rail: (ctx) => <Rail {...ctx} />,
    SummaryRow: (ctx) => <SummaryRow {...ctx} />,
    Cta: (ctx) => <Cta {...ctx} />,
    Footer: (ctx) => <Footer {...ctx} />,
  },
  actions: { run: async () => {} },
});
