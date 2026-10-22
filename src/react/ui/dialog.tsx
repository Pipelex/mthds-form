'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '../utils';

/*
 * The vendored dialog, over `@radix-ui/react-dialog`, which is the behaviour:
 * the focus trap, Escape, focus returned to what opened it, the rest of the
 * page hidden from assistive technology and its scroll held.
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
  }
>(({ className, layout = 'dialog', children, ...props }, ref) => (
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
