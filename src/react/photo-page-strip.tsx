'use client';

import { Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useFieldStrings } from './field-strings';
import type { PhotoPage, PhotoRead } from './photo-pages';
import { focusOutlineClass } from './role-tokens';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './utils';

/**
 * One page's tile, about a sheet's shape: 64 by 88 pixels, so three pages and
 * "Add page" share one row from a 320px screen up. The field's own fill in a
 * hairline outline, at the controls' radius.
 */
const TILE = 'relative h-22 w-16 shrink-0 overflow-hidden rounded-md';

export interface PhotoPageStripProps {
  /** A document's pages, numbered with "Add page" after them, or an image input's photo. */
  kind: 'document' | 'image';
  pages: readonly PhotoPage[];
  /**
   * The photos being read: a retake spins over the page it replaces, and a new
   * page, an image input's first photo included, is a tile of its own after
   * the pages.
   */
  reading: readonly PhotoRead[];
  /** Read-only, as the host holds the form while a run is in flight. */
  disabled?: boolean;
  /**
   * Whether a page may be removed when it is the only one. Not while its file
   * is arriving: the upload would land after the removal and write it back.
   */
  canRemoveLast?: boolean;
  /** Open the camera for one more page. */
  onAddPage: () => void;
  /** Open the camera to replace the page `pageId`, in place. */
  onRetake: (pageId: string) => void;
  onRemove: (pageId: string) => void;
}

function ReadingMark({ label }: { label: string }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-background/70">
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * The page review of a photographed input: numbered thumbnails in the order
 * they were taken, wrapping onto more rows rather than scrolling sideways, and
 * "Add page" after them for a document. Tapping a page offers Retake, which
 * replaces it in place, and Remove. There is no reordering: Retake fixes a bad
 * page without moving it. Pages are named to the parent by their id, never
 * their place, which a Remove changes. See docs/camera.md.
 */
export function PhotoPageStrip({
  kind,
  pages,
  reading,
  disabled = false,
  canRemoveLast = true,
  onAddPage,
  onRetake,
  onRemove,
}: PhotoPageStripProps) {
  const s = useFieldStrings();
  const isDocument = kind === 'document';
  const newPages = reading.filter((read) => read.replaces === null);
  const removeShut = pages.length === 1 && !canRemoveLast;
  return (
    <ol className="flex flex-wrap gap-2">
      {pages.map((page, index) => {
        const name = isDocument ? s.photoPage(index + 1) : s.photoImage;
        const retaking = reading.some((read) => read.replaces === page.id);
        return (
          <li key={page.id}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={name}
                  disabled={disabled || retaking}
                  className={cn(
                    TILE,
                    'block border border-border bg-input p-0 transition-colors enabled:hover:border-foreground/40 disabled:cursor-not-allowed',
                    focusOutlineClass,
                  )}
                >
                  <img
                    src={page.thumbnail}
                    alt=""
                    className="pointer-events-none h-full w-full object-cover"
                  />
                  {isDocument && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[11px] font-semibold tabular-nums text-foreground"
                    >
                      {index + 1}
                    </span>
                  )}
                  {retaking && <ReadingMark label={s.readingPhoto} />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-48">
                <DropdownMenuItem onSelect={() => onRetake(page.id)}>
                  <RotateCcw className="size-4 text-muted-foreground" aria-hidden="true" />
                  {s.retakePhoto}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={removeShut} onSelect={() => onRemove(page.id)}>
                  <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                  {s.removePhoto}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        );
      })}
      {newPages.map((read) => (
        <li key={read.id} className={cn(TILE, 'border border-border bg-input')}>
          <ReadingMark label={s.readingPhoto} />
        </li>
      ))}
      {isDocument && (
        <li>
          <button
            type="button"
            disabled={disabled || reading.length > 0}
            onClick={onAddPage}
            className={cn(
              TILE,
              'flex flex-col items-center justify-center gap-1 border border-dashed border-muted-foreground/60 px-1 text-center text-[11px] font-medium text-muted-foreground transition-colors enabled:hover:bg-muted enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
              focusOutlineClass,
            )}
          >
            <Plus className="size-4" aria-hidden="true" />
            {s.addPage}
          </button>
        </li>
      )}
    </ol>
  );
}
