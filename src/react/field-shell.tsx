'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';
import type { ConceptCategory } from '../core';
import { ConceptPill } from './concept-pill';
import { useFieldStrings } from './field-strings';
import { fieldLabel, shownDescription, useFieldPresentation } from './field-presentation';
import { smallPrintClass } from './field-styles';

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
}

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
}: FieldShellProps) {
  // Inside a method app the label is a question, not an identifier: sans,
  // humanised, and with no concept pill. Everywhere else it stays the exact
  // mono name a builder wrote. See `field-presentation.tsx`.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const Label = htmlFor ? 'label' : 'div';
  // A list item passes title="" - the row index already labels it, so we drop
  // the name and keep only the type pill to avoid a redundant header per row.
  const labelText = fieldLabel(title, name, presentation);
  const showLabel = labelText.trim() !== '';
  const shownText = shownDescription(description, labelText, [category], presentation) ?? hint;
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {showLabel && (
          <Label
            {...(htmlFor ? { htmlFor } : {})}
            className={cn(
              'text-[13px] font-medium leading-none text-foreground',
              isApp ? 'text-[13.5px]' : 'font-mono',
            )}
          >
            {labelText}
          </Label>
        )}
        {!isApp && <ConceptPill conceptRef={conceptRef} category={category} />}
        {!required && <OptionalMark />}
      </div>
      {shownText && <FieldDescription>{shownText}</FieldDescription>}
      {/* A field in error is OUTLINED, not just annotated - inside an app the
          red caption alone is easy to miss on a tall form, and it is the only
          signal on controls whose `aria-invalid` sits on an element the user
          cannot see (the file dropzone's hidden input, most of all). Scoped to
          the app presentation so the studio's look is unchanged.
          The wrapper is ALWAYS rendered and only its ring comes and goes. It
          used to be rendered only while the field was in error, so the element
          at this position changed type whenever the error toggled, and React
          remounted the control: a host that clears an error as the user types
          took the focus and the keystroke after the first with it. */}
      <div
        className={cn(
          'space-y-2',
          isApp &&
            error &&
            'rounded-lg ring-1 ring-destructive/70 ring-offset-4 ring-offset-background',
        )}
      >
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
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
  return (
    <span
      className={cn(
        'ml-auto',
        isApp
          ? smallPrintClass(true)
          : 'font-mono text-[10px] uppercase tracking-wider text-muted-foreground',
      )}
    >
      {s.optionalBadge}
    </span>
  );
}

/** The line under a field's label that says what the field is for. */
export function FieldDescription({ children }: { children: ReactNode }) {
  return <p className="text-[12px] leading-relaxed text-muted-foreground">{children}</p>;
}
