'use client';

import { Minus, Plus } from 'lucide-react';
import { useFieldStrings } from './field-strings';

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
 * and inside every structured concept, at any nesting depth.
 */
export function OptionalToggle({ count, expanded, onToggle, noun = 'field' }: OptionalToggleProps) {
  const s = useFieldStrings();
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-fit items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
    >
      {expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {expanded
        ? noun === 'field'
          ? s.hideOptionalFields
          : s.hideOptionalInputs
        : noun === 'field'
          ? s.optionalFieldsCount(count)
          : s.optionalInputsCount(count)}
    </button>
  );
}
