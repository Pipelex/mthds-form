'use client';

import { AlertCircle, X } from 'lucide-react';
import { useFieldStrings } from './field-strings';
import { focusOutlineClass, linkTextClass } from './role-tokens';
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from './ui/tooltip';
import { cn } from './utils';

/** A file refused for being over the upload limit: its name and its size in bytes. */
export interface OversizedFile {
  name: string;
  size: number;
}

/**
 * Whether a file is over the upload limit a host states (`maxFileBytes`), in
 * which case it is refused in the browser before anything is sent.
 */
export function isOverLimit(file: { size: number }, maxFileBytes: number | undefined): boolean {
  return maxFileBytes !== undefined && file.size > maxFileBytes;
}

/**
 * The one line for files over the upload limit, the same wherever a file is
 * dropped: "<name> is 73.4 MB, over your plan's 50 MB limit. Upgrade plan",
 * or for several at once "3 files are over your plan's 50 MB limit, the
 * largest 120.0 MB. Upgrade plan", where "3 files" opens a tooltip listing
 * each refused file with its size. The size always has one decimal and the
 * limit is whole, so a file just over the limit never reads as at it.
 * Upgrade plan is the host's link (`upgradeHref`), and absent when the host
 * gives none. The cross dismisses the line; a new pick replaces it. It is
 * announced as an alert when it appears. See docs/upload-seam.md, "A file
 * over the upload limit".
 */
export function FileTooLarge({
  files,
  limit,
  upgradeHref,
  onDismiss,
}: {
  files: readonly OversizedFile[];
  limit: number;
  upgradeHref?: string;
  onDismiss: () => void;
}) {
  const s = useFieldStrings();
  const first = files[0];
  if (!first) return null;
  const largest = files.reduce((a, b) => (b.size > a.size ? b : a), first);
  const limitText = s.uploadLimit(limit);
  return (
    <div
      role="alert"
      data-file-too-large=""
      className="flex min-h-8 w-full items-center gap-2 py-1 pl-1 text-left text-[13px] leading-[18px] text-muted-foreground"
    >
      <AlertCircle className="size-[15px] shrink-0 text-destructive" aria-hidden="true" />
      <p className="m-0 min-w-0 flex-1 [overflow-wrap:anywhere]">
        {files.length === 1 ? (
          <>
            <b className="font-medium text-foreground">{first.name}</b>
            {s.fileTooLarge(s.fileSizeExact(first.size), limitText)}
          </>
        ) : (
          <>
            <TooltipProvider delayDuration={100}>
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <b
                    // A tab stop, so the list opens on keyboard focus too.
                    tabIndex={0}
                    className={cn(
                      'cursor-default font-medium text-foreground underline decoration-dotted decoration-muted-foreground underline-offset-[3px]',
                      focusOutlineClass,
                    )}
                  >
                    {s.filesTooLargeCount(files.length)}
                  </b>
                </TooltipTrigger>
                <TooltipContent side="top" className="whitespace-pre-line">
                  {files.map((file) => `${file.name}  ·  ${s.fileSizeExact(file.size)}`).join('\n')}
                </TooltipContent>
              </TooltipRoot>
            </TooltipProvider>
            {s.filesTooLarge(limitText, s.fileSizeExact(largest.size))}
          </>
        )}{' '}
        {upgradeHref && (
          <a
            href={upgradeHref}
            className={cn(
              'whitespace-nowrap font-medium no-underline hover:underline hover:underline-offset-[3px]',
              linkTextClass,
              focusOutlineClass,
            )}
          >
            {s.upgradePlan}
          </a>
        )}
      </p>
      <button
        type="button"
        aria-label={s.dismiss}
        onClick={onDismiss}
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-70 transition hover:bg-muted hover:text-foreground hover:opacity-100 max-md:size-11',
          focusOutlineClass,
        )}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
