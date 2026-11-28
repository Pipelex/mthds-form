'use client';

import { codePointLength } from '../core/value-checks';
import { useFieldStrings } from './field-strings';
import { cn } from './utils';

/**
 * How many characters a text holds of the most its method allows
 * (`max_length`), counted in code points as the run gate counts them, so the
 * counter and the gate agree on an emoji. Past the limit it reads in the
 * error colour, and what a screen reader hears is how many are left or how
 * many too many, announced politely once the text is within a tenth of its
 * limit, where the number starts to matter.
 */
export function LengthCounter({
  value,
  max,
  id,
}: {
  value: string | undefined;
  max: number;
  id: string;
}) {
  const s = useFieldStrings();
  const count = value ? codePointLength(value) : 0;
  const over = count > max;
  const near = count >= max * 0.9;
  return (
    <div
      id={id}
      data-length-counter=""
      data-over={over ? '' : undefined}
      className={cn(
        'pt-1 text-end text-[12px] tabular-nums',
        over ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      <span aria-hidden="true">{s.lengthCounter(count, max)}</span>
      <span className="sr-only" aria-live={near ? 'polite' : 'off'}>
        {s.lengthCounterAria(count, max)}
      </span>
    </div>
  );
}
