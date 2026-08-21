'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';
import type { ConceptCategory } from '../core';
import { ConceptPill } from './concept-pill';
import { useFieldStrings } from './field-strings';

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
  const Label = htmlFor ? 'label' : 'div';
  // A list item passes title="" - the row index already labels it, so we drop
  // the name and keep only the type pill to avoid a redundant header per row.
  const labelText = title !== undefined ? title : name;
  const showLabel = labelText.trim() !== '';
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
        {!required && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {s.optionalBadge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
