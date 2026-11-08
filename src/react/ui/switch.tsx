import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '../utils';

/**
 * The track is 44 by 24. Below `sm` it keeps that look and reaches the 44 by
 * 44 a finger is given through an invisible `::after`, 10px above and below
 * it: a row holding a switch leaves that much room, so the area never covers
 * the control beside it.
 *
 * An off track is `--muted-foreground`, the colour a field's description,
 * an unselected pill's label and a placeholder are already set in on the
 * field fill, so a palette in which those read gives the track its edge on
 * the row it sits in (3:1, WCAG 1.4.11); the contract holds the thumb, in
 * `--background`, to 4.5:1 on it. It was `--input`, the fill of the
 * boolean's own row, and an off switch read as a lone thumb on every host.
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground',
      "max-sm:relative max-sm:after:absolute max-sm:after:-inset-x-0.5 max-sm:after:-inset-y-3 max-sm:after:content-['']",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
