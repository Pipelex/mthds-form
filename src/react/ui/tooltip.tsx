'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../utils';

/**
 * The shadcn/ui tooltip, vendored like the other primitives here.
 *
 * It replaces the browser's native `title`, which is not a design decision so
 * much as the absence of one: the native bubble takes about a second to appear,
 * cannot be styled, ignores the host's theme, is unreadable at small sizes on
 * some platforms, and never appears at all on touch. It is the right tool for a
 * hint nobody needs and the wrong one for a field's description.
 *
 * Radix underneath, which is the accessibility rather than the look: it wires
 * `aria-describedby` to the trigger, shows on focus as well as hover, dismisses
 * on Escape, and keeps the content hoverable — the three requirements of WCAG
 * 1.4.13, none of which a `title` meets and none of which is worth
 * reimplementing.
 */

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-w-xs rounded-md border border-border bg-popover px-2.5 py-1.5 text-[12px] leading-relaxed text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
