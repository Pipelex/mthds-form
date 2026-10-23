/**
 * Shared control styling for the run form. One comfortable, theme-aware input
 * surface (the dedicated `--input` token, hairline border, a focus border in
 * the contract's `--ring`, as every focus the other controls draw is)
 * so every field type reads as the same family - generous enough for touch
 * (≥44px tall) and never the cramped `text-xs` of the old playground panel.
 *
 * A branding host sets `--ring` to its accent ink (`deriveBrandRoles`'s
 * `accentInk`), which reads at 4.5:1 against the page it was derived for, so
 * the border reads at 3:1 or more against that page. See docs/theming.md
 * § "Link, selected and focus".
 */
import { cn } from './utils';

export const fieldControlClass = cn(
  'w-full rounded-md border border-border bg-input text-sm text-foreground',
  'placeholder:text-muted-foreground/70 transition-colors',
  'focus-visible:outline-hidden focus-visible:ring-1',
  'focus-visible:border-ring focus-visible:ring-ring/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
);
