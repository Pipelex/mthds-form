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

/**
 * A secondary action that spans the column under a field: "Choose from your
 * team's files", and a list's "Add item" in `app`. A hairline outline on the
 * page's own ground, in the controls' text size, so the actions under a field
 * read as one family with the field rather than as a studio's dashed slot.
 * The caller adds the focus outline (`focusOutlineClass`).
 */
export const rowActionClass = cn(
  'flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border px-3 text-[14px] text-foreground transition-colors',
  'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9',
);

/**
 * The small print beside and under a field: the optional mark, a list's
 * count, a file field's formats. A studio sets it in mono, as it sets the
 * field's name, because there it is a fact about the method; an app sets it
 * in the page's own face, because there it is a sentence to a person.
 */
export function smallPrintClass(isApp: boolean): string {
  return isApp
    ? 'text-[12px] text-muted-foreground tabular-nums'
    : 'font-mono text-[10.5px] text-muted-foreground';
}
