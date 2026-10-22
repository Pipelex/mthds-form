'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { cn } from '../utils';
import { closeAutoFocus, type ReturnFocus } from './dialog';

/*
 * The vendored alert dialog, over `@radix-ui/react-alert-dialog`: the question
 * asked before something is replaced or deleted. Its role is `alertdialog`, a
 * click outside never dismisses it, and focus opens on Cancel, so Enter never
 * confirms by accident. Drawn in place like `./dialog`, for the same reason,
 * and given `returnFocus` like it, since no question here has a `Trigger`.
 */

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    /** Where focus goes when the question closes. See `closeAutoFocus`. */
    returnFocus?: ReturnFocus;
  }
>(({ className, returnFocus, onCloseAutoFocus, ...props }, ref) => (
  <>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 m-auto grid h-fit w-[calc(100%-2rem)] max-w-sm gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-hidden',
        className,
      )}
      onCloseAutoFocus={closeAutoFocus(onCloseAutoFocus, returnFocus)}
      {...props}
    />
  </>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-[16px] font-semibold text-foreground', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] text-muted-foreground', className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogCancel = AlertDialogPrimitive.Cancel;
const AlertDialogAction = AlertDialogPrimitive.Action;

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
};
