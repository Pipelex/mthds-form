'use client';

import { focusOutlineClass } from './role-tokens';
import { useFieldStrings } from './field-strings';
import { cn } from './utils';

interface ExampleChipsProps {
  /** The method's examples for the field, as the values themselves. */
  examples: readonly unknown[];
  /** How a chip writes an example: a number in its unit, a text as it is. */
  label?: (example: string | number) => string;
  onPick: (example: string | number) => void;
  disabled?: boolean;
}

/**
 * The method's examples for a field (MTHDS `9.2.0` `examples`), each a chip
 * that fills the field with it. An example is a description, never a
 * constraint, so picking one is a starting point the person edits, and a
 * value unlike every example is as valid as one of them.
 *
 * Only a string or a number is an example; anything else the wire carries is
 * left out rather than stringified. A long example is cut short on its chip,
 * whose accessible name and tooltip carry it whole.
 */
export function ExampleChips({ examples, label, onPick, disabled }: ExampleChipsProps) {
  const s = useFieldStrings();
  const usable = examples.filter(
    (example): example is string | number =>
      typeof example === 'string' || (typeof example === 'number' && Number.isFinite(example)),
  );
  if (usable.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1.5" data-example-chips="">
      <span className="text-[12px] text-muted-foreground">{s.examplesLabel}</span>
      {usable.map((example, index) => {
        const text = label ? label(example) : String(example);
        return (
          <button
            key={`${index}:${String(example)}`}
            type="button"
            disabled={disabled}
            onClick={() => onPick(example)}
            title={text}
            aria-label={s.useExampleAria(text)}
            className={cn(
              'max-w-[16rem] truncate rounded-full border border-border bg-input px-2.5 py-0.5 text-[12px] text-foreground transition-colors',
              'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 max-sm:min-h-11',
              focusOutlineClass,
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
