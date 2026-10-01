'use client';

import type { ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useFieldStrings } from './field-strings';

interface DisclosureButtonProps {
  expanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** What the button says beside its Plus / Minus icon. */
  children: ReactNode;
}

/**
 * The package's one collapse control: a small muted text button with a Plus
 * icon while closed and a Minus icon while open, announcing its state through
 * `aria-expanded`. `OptionalToggle` is it over the "+ N optional" wording, and
 * an optional structure's presence toggle is it over the structure's label.
 */
export function DisclosureButton({
  expanded,
  onToggle,
  disabled,
  children,
}: DisclosureButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      disabled={disabled}
      className="flex w-fit items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {children}
    </button>
  );
}

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
 * structure is not one of the entries it hides: it carries its own disclosure.
 */
export function OptionalToggle({ count, expanded, onToggle, noun = 'field' }: OptionalToggleProps) {
  const s = useFieldStrings();
  return (
    <DisclosureButton expanded={expanded} onToggle={onToggle}>
      {expanded
        ? noun === 'field'
          ? s.hideOptionalFields
          : s.hideOptionalInputs
        : noun === 'field'
          ? s.optionalFieldsCount(count)
          : s.optionalInputsCount(count)}
    </DisclosureButton>
  );
}
