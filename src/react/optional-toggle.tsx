'use client';

import { ChevronRight, Minus, Plus } from 'lucide-react';
import { useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { focusOutlineClass } from './role-tokens';
import { cn } from './utils';

interface OptionalToggleProps {
  /** How many empty optional entries are currently hidden. */
  count: number;
  expanded: boolean;
  onToggle: () => void;
  /** "field" inside a concept, "input" at the top level. */
  noun?: 'field' | 'input';
}

/**
 * The disclosure for empty optional entries. Optional inputs stay hidden until
 * the user asks for them - required (and already-filled) entries always show, so
 * the form opens at its simplest and grows only on demand. Used at the top level
 * and inside every structured concept, at any nesting depth. An optional
 * structure folds behind it too, and opens and closes with it: see
 * `openOptionalStructures` / `closeOptionalStructures` in the core.
 */
export function OptionalToggle({ count, expanded, onToggle, noun = 'field' }: OptionalToggleProps) {
  const s = useFieldStrings();
  const isApp = useFieldPresentation() === 'app';
  const text = expanded
    ? noun === 'field'
      ? s.hideOptionalFields
      : s.hideOptionalInputs
    : noun === 'field'
      ? s.optionalFieldsCount(count)
      : s.optionalInputsCount(count);
  if (isApp) {
    // A quiet disclosure with a chevron that turns down when it is open.
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          'mt-1 inline-flex h-7 w-fit items-center gap-1.5 rounded-md px-2 text-[12.5px] font-medium leading-4 text-muted-foreground transition-colors hover:bg-input hover:text-foreground max-md:min-h-11',
          focusOutlineClass,
        )}
      >
        <ChevronRight
          className={cn('size-[13px] transition-transform', expanded && 'rotate-90')}
          aria-hidden="true"
        />
        {text}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={cn(
        'flex w-fit items-center gap-1.5 rounded-sm text-[11px] text-muted-foreground transition-colors hover:text-foreground max-sm:min-h-11',
        focusOutlineClass,
        'focus-visible:outline-offset-2',
      )}
    >
      {expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {text}
    </button>
  );
}
