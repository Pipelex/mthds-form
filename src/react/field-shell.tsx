'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';
import type { ConceptCategory } from '../core';
import { ConceptPill } from './concept-pill';
import { useFieldStrings } from './field-strings';
import { fieldLabel, useFieldPresentation } from './field-presentation';

interface FieldShellProps {
  name: string;
  title?: string;
  conceptRef?: string;
  category: ConceptCategory;
  description?: string;
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
  required,
  error,
  htmlFor,
  children,
  className,
}: FieldShellProps) {
  const s = useFieldStrings();
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
        {!required && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {s.optionalBadge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p>
      )}
      {/* A field in error is OUTLINED, not just annotated - inside an app the
          red caption alone is easy to miss on a tall form, and it is the only
          signal on controls whose `aria-invalid` sits on an element the user
          cannot see (the file dropzone's hidden input, most of all). Scoped to
          the app presentation so the studio's look is unchanged. */}
      {isApp && error ? (
        <div className="rounded-lg ring-1 ring-destructive/70 ring-offset-4 ring-offset-background">
          {children}
        </div>
      ) : (
        children
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
