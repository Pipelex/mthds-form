'use client';

import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, X } from 'lucide-react';
import { useFieldStrings } from './field-strings';
import { InOverlayLayer } from './overlay-layer';
import { focusOutlineClass } from './role-tokens';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  type ReturnFocus,
} from './ui/dialog';
import { cn } from './utils';

/**
 * A result's picture, shown large: the one picture a lone image result holds,
 * or the pictures of a list, moved between in place. Internal to the result
 * view, which opens it from a picture and hands it what it shows.
 *
 * ## What it is made of
 *
 * The vendored dialog, so the behaviour a modal owes is Radix's and not this
 * file's: the focus trap, Escape, the rest of the page hidden from assistive
 * technology, the page's scroll held, and focus going back to the picture that
 * opened it (`returnFocus`, since Radix returns it only to a trigger of its
 * own). It is drawn in the result's overlay layer (`./overlay-layer`), at the
 * root of the result, so a picture in a table that stacks its rows opens it
 * over the viewport rather than inside the table's box.
 *
 * ## Moving between pictures
 *
 * The previous and next buttons, the left and right arrow keys, and on a
 * touch screen a horizontal swipe, read from pointer events with no gesture
 * library: a touch that travels further sideways than {@link SWIPE_DISTANCE}
 * and mostly sideways moves one picture. The picture area lets the browser
 * keep vertical panning and pinch zoom (`touch-action: pan-y pinch-zoom`), so
 * a swipe is the one gesture taken from it. The ends do not wrap: at the
 * first or last picture the button is marked unavailable rather than
 * disabled, so a keyboard user standing on it is not thrown out of the
 * dialog, and it does nothing.
 *
 * ## Fitting the screen
 *
 * The panel is the whole screen on a phone and the viewport less a margin
 * from `sm` up, and the picture is drawn `object-fit: contain` in the space
 * the header and the caption leave, so the whole of it shows at any width or
 * height, never cropped and never scrolled.
 */

/** How far a touch must travel sideways, in CSS pixels, to count as a swipe. */
const SWIPE_DISTANCE = 40;

export interface ViewerPicture {
  /** The whole picture's URL, as the URL gate returned it. Never a smaller copy. */
  src: string;
  /** What the picture is called: the title of the viewer while it shows it. */
  name: string;
  /** The picture's own caption, when the payload states one. */
  caption?: string;
  /** The controls the result view draws beside a file: copy its URL, save it. */
  actions?: ReactNode;
}

export interface ImageViewerProps {
  pictures: readonly ViewerPicture[];
  /** The picture shown, as an index into `pictures`. */
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Where focus goes when the viewer closes: the picture that opened it. */
  returnFocus: ReturnFocus;
}

export function ImageViewer({
  pictures,
  index,
  onIndexChange,
  onClose,
  returnFocus,
}: ImageViewerProps) {
  const s = useFieldStrings();
  const panel = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const count = pictures.length;
  // Held to the list a rerun may have shortened while the viewer was open.
  const at = Math.min(Math.max(index, 0), count - 1);
  const picture = pictures[at];
  if (!picture) return null;
  const several = count > 1;
  const go = (step: -1 | 1) => {
    const next = at + step;
    if (next >= 0 && next < count) onIndexChange(next);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // A second finger is a pinch, never a swipe.
    swipe.current =
      event.pointerType === 'touch' && event.isPrimary
        ? { id: event.pointerId, x: event.clientX, y: event.clientY }
        : null;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== event.pointerId) return;
    const across = event.clientX - start.x;
    const down = event.clientY - start.y;
    if (Math.abs(across) < SWIPE_DISTANCE || Math.abs(across) < Math.abs(down) * 1.5) return;
    go(across < 0 ? 1 : -1);
  };

  return (
    <InOverlayLayer>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent
          ref={panel}
          returnFocus={returnFocus}
          // The panel itself takes focus on opening rather than its first
          // button, so the arrow keys work at once and Enter cannot close the
          // viewer or start a download by accident.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            panel.current?.focus();
          }}
          // A download that asks for its file name opens its own dialog inside
          // this one; Escape there cancels that question and leaves the viewer
          // open.
          onEscapeKeyDown={(event) => {
            if (
              event.target instanceof Element &&
              event.target.closest('[data-file-name-backdrop]')
            ) {
              event.preventDefault();
            }
          }}
          onKeyDown={(event) => {
            if (
              event.defaultPrevented ||
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey
            ) {
              return;
            }
            if (isTextEntry(event.target)) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            event.stopPropagation();
            go(event.key === 'ArrowLeft' ? -1 : 1);
          }}
          {...(picture.caption ? {} : { 'aria-describedby': undefined })}
          className={cn(
            'm-0 h-dvh w-full max-w-none gap-0 rounded-none border-0 p-0',
            'sm:m-auto sm:h-[calc(100dvh-4rem)] sm:w-[calc(100%-4rem)] sm:max-w-6xl sm:rounded-xl sm:border',
          )}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-border py-1.5 pr-1.5 pl-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-[14px] font-medium">{picture.name}</DialogTitle>
              {several && (
                // A live region from the moment the viewer opens, so each move
                // is announced: one inserted with its text already in it is not.
                <p
                  aria-live="polite"
                  aria-atomic="true"
                  className="text-[12px] text-muted-foreground"
                >
                  {s.imagePosition(at + 1, count)}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={picture.src}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground max-sm:size-11 max-sm:justify-center max-sm:p-0',
                  focusOutlineClass,
                )}
              >
                <ExternalLink aria-hidden className="size-3.5" />
                <span className="max-sm:sr-only">{s.openOriginal}</span>
              </a>
              {picture.actions}
              <DialogClose
                aria-label={s.close}
                className={cn(
                  'flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground max-sm:size-11',
                  focusOutlineClass,
                )}
              >
                <X aria-hidden className="size-4" />
              </DialogClose>
            </div>
          </div>

          <div
            data-viewer-stage
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipe.current = null;
            }}
            className="relative min-h-0 flex-1 touch-pan-y touch-pinch-zoom"
          >
            {/* Keyed by the picture, so moving on shows the spinner again
                rather than the last picture's state. */}
            <ViewerImage
              key={picture.src}
              src={picture.src}
              alt={picture.caption ?? picture.name}
            />
            {several && (
              <>
                <StepButton
                  label={s.previousImage}
                  unavailable={at === 0}
                  onStep={() => go(-1)}
                  className="left-2"
                >
                  <ChevronLeft aria-hidden className="size-5" />
                </StepButton>
                <StepButton
                  label={s.nextImage}
                  unavailable={at === count - 1}
                  onStep={() => go(1)}
                  className="right-2"
                >
                  <ChevronRight aria-hidden className="size-5" />
                </StepButton>
              </>
            )}
          </div>

          {picture.caption && (
            <DialogDescription className="max-h-24 shrink-0 overflow-y-auto border-t border-border px-4 py-2 text-[13px]">
              {picture.caption}
            </DialogDescription>
          )}
        </DialogContent>
      </Dialog>
    </InOverlayLayer>
  );
}

/** The picture itself, with a spinner until it arrives. */
function ViewerImage({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading && (
        <span
          role="status"
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Loader2 aria-hidden className="size-5 animate-spin text-muted-foreground" />
        </span>
      )}
      <img
        src={src}
        alt={alt}
        // A result view has no business telling a third party where it was
        // opened from; see `LoadingImage` in `./result-field`.
        referrerPolicy="no-referrer"
        decoding="async"
        draggable={false}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        className={cn(
          'absolute inset-0 size-full object-contain p-2 sm:p-4',
          loading && 'opacity-0',
        )}
      />
    </>
  );
}

/**
 * Previous or next. Marked unavailable at an end rather than disabled: a
 * disabled button loses the focus it holds, and inside a modal that focus
 * would land nowhere.
 */
function StepButton({
  label,
  unavailable,
  onStep,
  className,
  children,
}: {
  label: string;
  unavailable: boolean;
  onStep: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={unavailable}
      onClick={() => {
        if (!unavailable) onStep();
      }}
      className={cn(
        'absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-popover/90 text-foreground shadow-sm hover:bg-muted aria-disabled:opacity-40 aria-disabled:hover:bg-popover/90',
        focusOutlineClass,
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Whether a key went to something a person types into, which keeps its arrows. */
function isTextEntry(target: EventTarget): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.closest('input, textarea, select') !== null;
}
