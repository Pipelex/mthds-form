'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Eye, EyeOff, FileText, ImageOff, Link2, Loader2, Upload, X } from 'lucide-react';
import { cn } from './utils';
import type { FileRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { fieldControlClass } from './field-styles';

/** The serializable value of a file field. URL is what the runner sends. */
export interface FileValue {
  url?: string;
  filename?: string;
}

interface FileFieldProps {
  field: FileRunField;
  value: FileValue | undefined;
  /** Called when a file is dropped/picked - the parent uploads and sets value. */
  onDropFile: (file: File) => void;
  /** Manual URL paste / clear flows through here too. */
  onChange: (value: FileValue | undefined) => void;
  id: string;
  /** Parent-driven async state. */
  uploading?: boolean;
  /** Resolve a `pipelex-storage://` URI to a viewable URL (stored-file preview). */
  resolveUrl?: (uri: string) => Promise<string | null>;
  error?: string;
  disabled?: boolean;
}

const IMAGE_EXT_RE = /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)(\?|$)/i;
const PDF_EXT_RE = /\.pdf(\?|$)/i;

/** Document variant: a file shown as a PDF preview (or chip for other docs). */
export function DocumentField(props: FileFieldProps) {
  return <FileField {...props} category="document" />;
}

/** Image variant: a file shown as a real image preview. */
export function ImageField(props: FileFieldProps) {
  return <FileField {...props} category="image" />;
}

function FileField({
  field,
  value,
  onDropFile,
  onChange,
  id,
  uploading,
  resolveUrl,
  error,
  disabled,
  category,
}: FileFieldProps & { category: 'document' | 'image' }) {
  const s = useFieldStrings();
  const [showUrl, setShowUrl] = useState(false);
  // The preview is collapsed by default - opened on demand via a "Preview" button.
  const [previewOpen, setPreviewOpen] = useState(false);
  // A browser-viewable URL for the just-dropped file (the stored value is a
  // `pipelex-storage://` URI that the browser can't render), so the user sees a
  // real preview the moment they add a file. Revoked when replaced/unmounted.
  const [localPreview, setLocalPreview] = useState<{ url: string; type: string } | null>(null);
  const localUrlRef = useRef<string | null>(null);

  const setLocal = useCallback((next: { url: string; type: string } | null) => {
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = next?.url ?? null;
    setLocalPreview(next);
  }, []);
  useEffect(() => () => setLocal(null), [setLocal]);

  const handleFile = useCallback(
    (file: File) => {
      setLocal({ url: URL.createObjectURL(file), type: file.type });
      onDropFile(file);
    },
    [setLocal, onDropFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    multiple: false,
    disabled: disabled || uploading,
    onDrop: (files) => {
      const file = files[0];
      if (file) handleFile(file);
    },
  });

  const clear = useCallback(() => {
    setLocal(null);
    setResolvedSrc(null);
    setPreviewOpen(false);
    onChange(undefined);
  }, [setLocal, onChange]);

  const hasFile = !!value?.url;
  const ref = `${value?.filename ?? ''} ${value?.url ?? ''}`;

  const isImage =
    category === 'image' || localPreview?.type.startsWith('image/') || IMAGE_EXT_RE.test(ref);
  const isPdf = localPreview?.type === 'application/pdf' || PDF_EXT_RE.test(ref);
  const canPreview = isImage || isPdf;

  // Resolve a stored `pipelex-storage://` URI to a presigned URL - lazily, only
  // when the user opens the preview, so a closed field never fetches one.
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const storageUri = value?.url && !value.url.startsWith('http') ? value.url : null;
  useEffect(() => {
    if (!previewOpen || !storageUri || localPreview || !resolveUrl) return;
    let cancelled = false;
    void resolveUrl(storageUri).then((url) => {
      if (!cancelled) setResolvedSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [previewOpen, storageUri, localPreview, resolveUrl]);

  // A browser-viewable source: the local object URL, an http(s) URL, or a
  // resolved presigned URL for a stored file.
  const previewSrc =
    localPreview?.url ?? (value?.url?.startsWith('http') ? value.url : (resolvedSrc ?? undefined));

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category={category}
      description={field.description}
      required={field.required}
      error={error}
    >
      {hasFile && !uploading ? (
        <div className="space-y-2">
          <FileChip
            value={value}
            disabled={disabled}
            onClear={clear}
            canPreview={canPreview}
            previewOpen={previewOpen}
            onTogglePreview={() => setPreviewOpen((v) => !v)}
          />
          {previewOpen &&
            (previewSrc && isImage ? (
              <ImagePreview src={previewSrc} filename={value?.filename} />
            ) : previewSrc && isPdf ? (
              <PdfPreview src={previewSrc} />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-md border border-border bg-muted">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ))}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center',
            'cursor-pointer select-none transition-colors',
            isDragActive
              ? 'border-primary/60 bg-primary/5'
              : 'border-border bg-input hover:border-border hover:bg-muted',
            (disabled || uploading) && 'cursor-not-allowed opacity-60',
          )}
        >
          <input {...getInputProps()} id={id} aria-invalid={!!error} />
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-[12px] text-muted-foreground">{s.uploading}</p>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              <div className="space-y-0.5">
                <p className="text-[13px] text-foreground">
                  {isDragActive ? s.dropToUpload : s.dropOrBrowse}
                </p>
                {field.accept && (
                  <p className="font-mono text-[10.5px] text-muted-foreground">{field.accept}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* URL escape hatch - collapsed by default to keep the happy path clean. */}
      {!showUrl ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowUrl(true)}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <Link2 className="h-3 w-3" />
          {s.pasteUrlInstead}
        </button>
      ) : (
        <input
          type="text"
          autoFocus
          value={value?.url ?? ''}
          disabled={disabled}
          placeholder={s.urlPlaceholder}
          onChange={(e) => {
            setLocal(null);
            onChange(e.target.value ? { url: e.target.value } : undefined);
          }}
          className={cn(fieldControlClass, 'h-9 px-3 font-mono text-[12px]')}
        />
      )}
    </FieldShell>
  );
}

function ImagePreview({ src, filename }: { src: string; filename?: string }) {
  const s = useFieldStrings();
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex h-28 items-center justify-center rounded-md border border-border bg-muted">
        <ImageOff className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="flex max-h-[640px] justify-center overflow-auto rounded-md border border-border bg-muted">
      <img
        src={src}
        alt={filename ?? s.preview}
        className="h-auto w-full max-w-full object-contain"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

function PdfPreview({ src }: { src: string }) {
  const s = useFieldStrings();
  // A tall viewport so the whole document is readable; the browser's native PDF
  // viewer scrolls/paginates within it. `#view=FitH` fits the page width.
  return (
    <object
      data={`${src}#view=FitH`}
      type="application/pdf"
      className="h-[78vh] min-h-[520px] w-full rounded-md border border-border bg-muted"
    >
      <div className="flex h-28 flex-col items-center justify-center gap-1.5 text-center">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">{s.previewUnavailablePdf}</p>
      </div>
    </object>
  );
}

function FileChip({
  value,
  disabled,
  onClear,
  canPreview,
  previewOpen,
  onTogglePreview,
}: {
  value: FileValue | undefined;
  disabled?: boolean;
  onClear: () => void;
  canPreview?: boolean;
  previewOpen?: boolean;
  onTogglePreview?: () => void;
}) {
  const s = useFieldStrings();
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-input px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">
          {value?.filename ?? s.uploadedFile}
        </p>
        <p className="truncate font-mono text-[10.5px] text-muted-foreground">{value?.url}</p>
      </div>
      {canPreview && (
        <button
          type="button"
          onClick={onTogglePreview}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-border px-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {previewOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {s.preview}
        </button>
      )}
      <ClearButton disabled={disabled} onClick={onClear} />
    </div>
  );
}

function ClearButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  const s = useFieldStrings();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={s.removeFileAria}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
