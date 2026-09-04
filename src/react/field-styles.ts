/**
 * Shared control styling for the run form. One comfortable, theme-aware input
 * surface (the dedicated `--input` token, hairline border, accent focus ring)
 * so every field type reads as the same family - generous enough for touch
 * (≥44px tall) and never the cramped `text-xs` of the old playground panel.
 */
import { cn } from './utils';

export const fieldControlClass = cn(
  'w-full rounded-md border border-border bg-input text-sm text-foreground',
  'placeholder:text-muted-foreground/70 transition-colors',
  'focus-visible:outline-hidden focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
);
