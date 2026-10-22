'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '../utils';

/*
 * The vendored dialog, over `@radix-ui/react-dialog`, which is the behaviour:
 * the focus trap, Escape, the rest of the page hidden from assistive
 * technology and its scroll held.
 *
 * Focus going back on close is the one part that needs a hand. Radix returns it
 * to the dialog's own `Trigger` and to nothing else, and none of the surfaces
 * here is opened by one: a sheet opens from a row in a field, a question from
 * a row in a list. So a panel takes `returnFocus`, which names the element at
 * the moment it closes, since the element that opened it may be gone by then
 * (the row a choice replaced, the example a delete removed).
 *
 * Drawn in place rather than in a portal, as the file-name dialog is, so it
 * reads the theme and brand tokens of the scope the control sits in; its
 * overlay and panel are `fixed` over the viewport. The panel is centred by
 * `inset: 0` and `margin: auto` rather than by a transform, because a
 * transform would make it the containing block of every `fixed` element drawn
 * inside it, a menu's popper among them. Every button inside is
 * `type="button"`, because a form may sit inside a host's `<form>`.
 */

const Dialog = DialogPrimitive.Root;
const DialogClose = DialogPrimitive.Close;

/** Names where focus goes as a panel closes; nothing leaves it to Radix. */
export type ReturnFocus = () => HTMLElement | null | undefined;

/**
 * A panel's `onCloseAutoFocus`: the caller's own handler first, which may send
 * focus elsewhere by calling `preventDefault()`, then `returnFocus`'s element
 * when it is still in the document.
 */
export function closeAutoFocus(
  onCloseAutoFocus: ((event: Event) => void) | undefined,
  returnFocus: ReturnFocus | undefined,
): (event: Event) => void {
  return (event) => {
    onCloseAutoFocus?.(event);
    if (event.defaultPrevented || !returnFocus) return;
    const target = returnFocus();
    if (!target?.isConnected) return;
    event.preventDefault();
    target.focus();
  };
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/50', className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * The panel and its overlay. `layout="sheet"` is the picker's: a bottom sheet
 * at nearly the viewport's full height below 1280px, and a dialog at most
 * 560px wide from 1280px, one tree laid out by CSS alone. `layout="dialog"` is
 * a small centred dialog at every width.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    layout?: 'sheet' | 'dialog';
    /** Where focus goes when the panel closes. See `closeAutoFocus`. */
    returnFocus?: ReturnFocus;
  }
>(({ className, layout = 'dialog', returnFocus, onCloseAutoFocus, children, ...props }, ref) => (
  <>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col border-border bg-popover text-popover-foreground shadow-lg outline-hidden',
        layout === 'sheet'
          ? [
              'inset-x-0 top-6 bottom-0 rounded-t-xl border-t',
              'xl:inset-0 xl:m-auto xl:h-fit xl:max-h-[min(720px,calc(100dvh-4rem))] xl:w-[calc(100%-2rem)] xl:max-w-[560px] xl:rounded-xl xl:border',
            ]
          : 'inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-sm gap-3 rounded-lg border p-4',
        className,
      )}
      onCloseAutoFocus={closeAutoFocus(onCloseAutoFocus, returnFocus)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[16px] font-semibold text-foreground', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle };
