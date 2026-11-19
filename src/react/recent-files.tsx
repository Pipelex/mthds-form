'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { FileText, ImageIcon } from 'lucide-react';
import type { SourceFile } from '../core';
// Value imports come from the specific module, never the `../core` barrel - the
// barrel reaches the gate and the gate reaches ajv. See docs/dependency-budget.md.
import { formatOfFilename, normalizeMimeType, type FileFormat } from '../core/file-formats';
import { useFieldStrings } from './field-strings';
import type { FilePickerSource } from './file-picker';
import { focusOutlineClass } from './role-tokens';
import { cn } from './utils';

/*
 * The few recent files an empty file field offers as one-click chips in its
 * drop zone, read from the host's `FileSource.recent` when it gives one. The
 * common case, the file the person used last, then needs no sheet at all.
 * See docs/sources.md, "Recent files in the drop zone".
 */

/** The most chips a drop zone shows. */
export const RECENT_FILES_LIMIT = 3;

/**
 * The host's recent files of `formats`, read once while `enabled` (the field
 * is empty and can take one), and again only when what is asked changes: the
 * formats, the scope, or whether the source reads them at all. The source
 * itself is read through a ref, because a host may build it inline, and a
 * new object on every render must not read the list again. A read that fails
 * or answers nothing leaves no chip, and says nothing: the picker is still
 * there.
 */
export function useRecentFiles(
  source: FilePickerSource | undefined,
  formats: readonly FileFormat[],
  enabled: boolean,
): readonly SourceFile[] {
  const [files, setFiles] = useState<readonly SourceFile[]>([]);
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const reads = enabled && typeof source?.recent === 'function';
  const scope = source?.initialScope ?? 'everyone';
  const mediaKey = formats.map((format) => format.mimeType).join('\n');

  useEffect(() => {
    if (!reads) return;
    const current = sourceRef.current;
    if (!current?.recent) return;
    const mediaTypes = mediaKey === '' ? [] : mediaKey.split('\n');
    // A field that takes no type gets no file: the answer could hold none.
    if (mediaTypes.length === 0) return;
    const controller = new AbortController();
    Promise.resolve()
      .then(() =>
        current.recent?.({
          scope,
          mediaTypes,
          limit: RECENT_FILES_LIMIT,
          signal: controller.signal,
        }),
      )
      .then(
        (answer) => {
          if (controller.signal.aborted) return;
          setFiles(Array.isArray(answer) ? answer.slice(0, RECENT_FILES_LIMIT) : []);
        },
        () => {
          if (!controller.signal.aborted) setFiles([]);
        },
      );
    return () => controller.abort();
  }, [reads, scope, mediaKey]);

  return reads ? files : [];
}

/** Whether a recent file is a picture, by the field's format it is, or by its name. */
function isPicture(file: SourceFile, formats: readonly FileFormat[]): boolean {
  const type = file.mediaType ? normalizeMimeType(file.mediaType) : '';
  const format =
    formats.find((candidate) => candidate.mimeType === type) ??
    formatOfFilename(formats, file.name);
  return format?.mimeType.startsWith('image/') ?? false;
}

export interface RecentFileChipsProps {
  files: readonly SourceFile[];
  formats: readonly FileFormat[];
  /** The field's label as the form shows it, which each chip's name carries. */
  label: string;
  disabled?: boolean;
  /** Writes the file into the field, exactly as a pick from the sheet does. */
  onPick: (file: SourceFile) => void;
}

/**
 * "Recent" and a chip per file: its outline and its name, cut short when it is
 * long. A chip is a button inside the drop zone, so a press on it stops there
 * rather than opening the device's file dialog behind it.
 */
export function RecentFileChips({ files, formats, label, disabled, onPick }: RecentFileChipsProps) {
  const s = useFieldStrings();
  if (files.length === 0) return null;
  return (
    <div
      role="group"
      aria-label={s.recentFiles}
      data-recent-files=""
      className="flex max-w-full flex-wrap items-center justify-center gap-1.5"
    >
      <span aria-hidden="true" className="text-[12px] text-muted-foreground">
        {s.recentFiles}
      </span>
      {files.map((file) => {
        const Glyph = isPicture(file, formats) ? ImageIcon : FileText;
        return (
          <button
            key={file.id}
            type="button"
            disabled={disabled}
            aria-label={s.recentFileAria(file.name, label)}
            title={file.name}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onPick(file);
            }}
            className={cn(
              'inline-flex h-8 max-w-56 min-w-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[13px] text-foreground transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 max-sm:min-h-11',
              focusOutlineClass,
            )}
          >
            <Glyph className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{file.name}</span>
          </button>
        );
      })}
    </div>
  );
}
