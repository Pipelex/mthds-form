/**
 * Shared control styling for the run form. One comfortable, theme-aware input
 * surface (the dedicated `--input` token, hairline border, a focus border in
 * the brand's ink - see `./brand-ink`)
 * so every field type reads as the same family - generous enough for touch
 * (≥44px tall) and never the cramped `text-xs` of the old playground panel.
 */
import { brandFocusClass } from './brand-ink';
import { cn } from './utils';

export const fieldControlClass = cn(
  'w-full rounded-md border border-border bg-input text-sm text-foreground',
  'placeholder:text-muted-foreground/70 transition-colors',
  'focus-visible:outline-hidden focus-visible:ring-1',
  brandFocusClass,
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
);
