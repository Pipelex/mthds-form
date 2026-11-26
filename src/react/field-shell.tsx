'use client';

import { use, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from './utils';
import type { ConceptCategory } from '../core';
import { ConceptPill } from './concept-pill';
import { useFieldStrings } from './field-strings';
import { fieldLabel, shownDescription, useFieldPresentation } from './field-presentation';
import { GeneratedInputContext, useStructureDepth } from './field-context';
import { borderStrongClass, linkTextClass, linkTintFillClass } from './role-tokens';

interface FieldShellProps {
  name: string;
  title?: string;
  conceptRef?: string;
  category: ConceptCategory;
  description?: string;
  /**
   * What the control says in the description's place when there is no
   * description to show: a number's range, the JSON escape hatch's syntax. It
   * also stands in for a description `app` leaves out for restating the label.
   */
  hint?: string;
  required: boolean;
  /** Validation message; renders in danger text under the control. */
  error?: string;
  /** Links the rendered name to the control for screen readers. */
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  /**
   * In `app`, inside a structure: the control takes the row's whole width
   * under its label rather than the right-hand column, as a long text and a
   * raw JSON value do.
   */
  stack?: boolean;
}

/**
 * A field in error, in `app`: a 1px outline in the solid error colour, 4px
 * clear of the field, at a panel's corner.
 */
const ERROR_OUTLINE = 'rounded-lg outline-solid outline-1 outline-offset-4 outline-destructive';

/**
 * The label / type / description / error chrome around a single input control.
 * Every field type composes this so the form reads as one consistent column -
 * the control itself is the only thing that varies.
 */
export function FieldShell({
  name,
  title,
  conceptRef,
  category,
  description,
  hint,
  required,
  error,
  htmlFor,
  children,
  className,
  stack,
}: FieldShellProps) {
  // Inside a method app the label is a question, not an identifier: sans,
  // humanised, and with no concept pill. Everywhere else it stays the exact
  // mono name a builder wrote. See `field-presentation.tsx`.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const depth = useStructureDepth();
  // A list item passes title="" - the row index already labels it, so we drop
  // the name and keep only the type pill to avoid a redundant header per row.
  const labelText = fieldLabel(title, name, presentation);
  const showLabel = labelText.trim() !== '';
  const shownText = shownDescription(description, labelText, [category], presentation) ?? hint;
  const outlined = isApp && !!error;
  const caption = error && (
    <p className="flex items-center gap-1 text-[11px] text-destructive" role="alert">
      {error}
    </p>
  );
  // The wrapper is ALWAYS rendered and only its ring comes and goes. It used to
  // be rendered only while the field was in error, so the element at this
  // position changed type whenever the error toggled, and React remounted the
  // control: a host that clears an error as the user types took the focus and
  // the keystroke after the first with it. The outline is the error colour
  // itself, which the brand contract holds at 3:1 on the page and on a card,
  // and an outline, whose offset is a gap the surface shows through.
  const control = (
    <div
      data-error-outline={outlined ? '' : undefined}
      className={cn(
        isApp ? 'flex min-w-0 flex-1 flex-col' : 'space-y-2',
        outlined && ERROR_OUTLINE,
      )}
    >
      {children}
    </div>
  );

  if (isApp && showLabel && depth > 0) {
    // A field of a structure is one row of it: its label and description on
    // the left, its control on the right, and the control under its label once
    // the structure is narrower than 520 pixels (the container `ObjectField`
    // declares).
    return (
      <div
        data-field-row=""
        className={cn(
          'grid grid-cols-1 items-center gap-x-4 gap-y-1.5 py-[7px]',
          !stack && '@min-[521px]:grid-cols-[minmax(0,1fr)_min(400px,54cqi)]',
          className,
        )}
      >
        <FieldRowLabel
          label={labelText}
          htmlFor={htmlFor}
          optional={!required}
          description={shownText}
        />
        <div className="min-w-0 space-y-1.5">
          {control}
          {caption}
        </div>
      </div>
    );
  }

  if (isApp) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {showLabel && (
          <FieldHeader
            label={labelText}
            htmlFor={htmlFor}
            optional={!required}
            description={shownText}
          />
        )}
        {!showLabel && shownText && <FieldDescription>{shownText}</FieldDescription>}
        {control}
        {caption}
      </div>
    );
  }

  const Label = htmlFor ? 'label' : 'div';
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {showLabel && (
          <Label
            {...(htmlFor ? { htmlFor } : {})}
            className="font-mono text-[13px] font-medium leading-none text-foreground"
          >
            {labelText}
          </Label>
        )}
        <ConceptPill conceptRef={conceptRef} category={category} />
        {!required && <OptionalMark />}
      </div>
      {shownText && <FieldDescription>{shownText}</FieldDescription>}
      {control}
      {caption}
    </div>
  );
}

interface FieldHeaderProps {
  label: string;
  /** The control the label names; absent, the label is a plain text node. */
  htmlFor?: string;
  /** The id the label carries, for a group `aria-labelledby` names. */
  labelId?: string;
  optional: boolean;
  description?: string;
  descriptionId?: string;
  /** A list's count, set in mono beside the label: "3 items", "2 of 3 items". */
  count?: string;
  /** What sits on the header's right: a structure's Form / Paste JSON switch. */
  aside?: ReactNode;
}

/**
 * An app input's header, as the Pipelex Studio input draws it: the label, then
 * a list's count, "Optional" when the input may be left empty and
 * "Generated" when a host's synthetic inputs filled it, then the description
 * on a muted line; a structure's or a list's Form / Paste JSON switch on the
 * right. No icon, no type chip, no Required mark.
 */
export function FieldHeader({
  label,
  htmlFor,
  labelId,
  optional,
  description,
  descriptionId,
  count,
  aside,
}: FieldHeaderProps) {
  const generated = use(GeneratedInputContext);
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div className="flex items-start gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Label
            {...(htmlFor ? { htmlFor } : {})}
            id={labelId}
            className="text-[14px] font-semibold leading-5 tracking-[-0.005em] text-foreground"
          >
            {label}
          </Label>
          {count && <ItemCount>{count}</ItemCount>}
          {optional && <OptionalPill />}
          {generated && <GeneratedPill />}
        </div>
        {description && (
          <p id={descriptionId} className="m-0 text-[13px] leading-[18px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}

/** A field row's label block inside a structure: 13px label, "Optional", a 12px description. */
function FieldRowLabel({
  label,
  htmlFor,
  optional,
  description,
}: {
  label: string;
  htmlFor?: string;
  optional: boolean;
  description?: string;
}) {
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div className="flex min-w-0 flex-col gap-px">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <Label
          {...(htmlFor ? { htmlFor } : {})}
          className="text-[13px] font-medium leading-[18px] text-foreground"
        >
          {label}
        </Label>
        {optional && <OptionalPill />}
      </div>
      {description && (
        <p className="m-0 text-[12px] leading-4 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/** A list's count beside its label in an app: mono, muted. */
export function ItemCount({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[12px] leading-4 text-muted-foreground">{children}</span>;
}

/** "Optional" in an app: a small pill on the stronger hairline. */
export function OptionalPill() {
  const s = useFieldStrings();
  return (
    <span
      className={cn(
        'rounded-full border px-[7px] text-[11.5px] leading-[16px] text-muted-foreground',
        borderStrongClass,
      )}
    >
      {s.optionalBadge}
    </span>
  );
}

/** "Generated", with a sparkle, in the accent on its tint. */
function GeneratedPill() {
  const s = useFieldStrings();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-[7px] text-[11.5px] leading-[18px]',
        linkTextClass,
        linkTintFillClass,
      )}
    >
      <Sparkles className="size-[11px]" aria-hidden="true" />
      {s.generatedMark}
    </span>
  );
}

/**
 * The mark at the end of an optional field's header row. A studio sets it as
 * a small-caps tag, beside the field's mono name; an app sets it as a word in
 * the page's face, "Optional", where a tag in capitals would read as a status.
 */
export function OptionalMark() {
  const s = useFieldStrings();
  const isApp = useFieldPresentation() === 'app';
  if (isApp) return <OptionalPill />;
  return (
    <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {s.optionalBadge}
    </span>
  );
}

/** The line under a field's label that says what the field is for. */
export function FieldDescription({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-[12px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
