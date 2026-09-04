'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Eye, EyeOff, FileText, ImageOff, Link2, Loader2, Upload, X } from 'lucide-react';
import { cn } from './utils';
import type { FileRunField } from '../core';
// Value imports come from the specific module, never the `../core` barrel - the
// barrel reaches the gate and the gate reaches ajv. See docs/dependency-budget.md.
import { acceptMapForKind, isAcceptedFile } from '../core/file-formats';
import { isViewableUrl } from '../core/native-content';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { fieldControlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';

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
const DATA_URL_MIME_RE = /^data:([^;,]+)/i;

/**
 * True when the browser can render this URL as-is - `isViewableUrl`, under the
 * name this file has always called it.
 *
 * The predicate itself moved to core when the result side needed the same
 * answer: an input control deciding whether to fetch a preview and a result view
 * deciding whether to paint an `<img>` are the same question, and answering it
 * twice is how the two drift. `data:` is the arm that used to be missing here,
 * and its absence cost a preview rather than a fetch: any URL that is not `http`
 * was treated as a stored URI needing `resolveUrl`, so a host with no resolver
 * got a spinner that never stopped over a value the browser could have rendered
 * immediately.
 */
const isDirectlyViewable = isViewableUrl;

/** The MIME type a `data:` URL declares, which is the only type it carries. */
function dataUrlMime(url: string): string | undefined {
  return DATA_URL_MIME_RE.exec(url)?.[1]?.toLowerCase();
}

/**
 * A preview of the file this control's own dropzone just took, held until the
 * host writes the uploaded value back.
 *
 * The object URL is the only way to show a file the moment it is dropped: the
 * value the host writes is a `pipelex-storage://` URI the browser cannot
 * render. What it must NOT do is outlive the value it belongs to, and that is
 * what `boundUrl` is for - it used to win over `value` unconditionally and was
 * cleared only by this control's own clear button, so a host writing a
 * different file at the same path got a chip naming B over a preview showing A.
 */
interface LocalPreview {
  objectUrl: string;
  type: string;
  /**
   * The `value.url` this preview is the preview OF, or `undefined` while the
   * upload it came from has not landed yet. The control cannot know the URL at
   * drop time - the host assigns it - so the first value that appears after the
   * upload stops being in flight is adopted as this preview's own, and any
   * later change to a different one retires it.
   */
  boundUrl?: string;
}

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
  const domId = useFieldDomId(id);
  const [showUrl, setShowUrl] = useState(false);
  // The preview is collapsed by default - opened on demand via a "Preview" button.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [localPreview, setLocalPreview] = useState<LocalPreview | null>(null);
  // Resolved lazily, only when the user opens the preview, so a closed field
  // never fetches a presigned URL. Keyed by the URI it was resolved FROM, the
  // way `LocalPreview` is bound to the value it is the preview OF - a cached
  // source with no record of its provenance is painted under whatever name the
  // value carries next.
  const [resolved, setResolved] = useState<{ uri: string; src: string } | null>(null);
  const localUrlRef = useRef<string | null>(null);

  const setLocal = useCallback((next: LocalPreview | null) => {
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = next?.objectUrl ?? null;
    setLocalPreview(next);
  }, []);
  useEffect(() => () => setLocal(null), [setLocal]);

  /**
   * A file the slot does not accept, held locally until the next pick.
   *
   * Local rather than raised to the host, and that is the distinction to keep:
   * the host's `error` prop carries the GATE's verdict about a value, while this
   * is the control refusing to produce a value at all. Nothing is uploaded, so
   * there is nothing for a host to be told about yet.
   */
  const [rejected, setRejected] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!isAcceptedFile(field.kind, file)) {
        // Refuse BEFORE the object URL and before `onDropFile`: a host's
        // uploader is a network call and often a billed one, and a file the
        // runtime cannot decode has no business reaching it.
        setRejected(file.name);
        return;
      }
      setRejected(null);
      setLocal({ objectUrl: URL.createObjectURL(file), type: file.type });
      onDropFile(file);
    },
    [field.kind, setLocal, onDropFile],
  );

  const busy = disabled || uploading;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    multiple: false,
    disabled: busy,
    // Filters the OS picker so a wrong file is hard to choose in the first
    // place. It is NOT the enforcement: a drag-and-drop bypasses the picker
    // entirely, and a browser reporting an empty `File.type` slips through
    // react-dropzone's own matcher. `handleFile` is where the answer is
    // decided; this is the affordance in front of it.
    accept: acceptMapForKind(field.kind),
    // The tab stop belongs on the INPUT, not on this div - see the root element
    // below. Without this, react-dropzone puts `tabIndex: 0` and its own key
    // handlers on a `role="presentation"` div, and the element a keyboard or
    // voice-control user lands on is a generic with no role and no name.
    noKeyboard: true,
    onDrop: (files) => {
      const file = files[0];
      if (file) handleFile(file);
    },
    // react-dropzone rejects a file its own matcher refuses without ever calling
    // `onDrop`, so without this a wrong drop is silently swallowed - the control
    // simply does nothing, which reads as a broken dropzone rather than a
    // refused file.
    onDropRejected: (rejections) => {
      const name = rejections[0]?.file.name;
      if (name) setRejected(name);
    },
  });

  const clear = useCallback(() => {
    setLocal(null);
    setResolved(null);
    setPreviewOpen(false);
    setRejected(null);
    onChange(undefined);
  }, [setLocal, onChange]);

  // Whether the local preview still describes the value on screen. Computed in
  // render rather than left to the effect below, so the frame in which the host
  // writes a different file does not show the old one.
  const localIsCurrent =
    !!localPreview && (localPreview.boundUrl === undefined || localPreview.boundUrl === value?.url);

  useEffect(() => {
    if (!localPreview) return;
    if (localPreview.boundUrl === undefined) {
      // Still waiting for the host's write. `uploading` is the honest signal
      // that it has not happened yet; a host that does not report it falls back
      // to "the first URL to appear", which for the ordinary case - an empty
      // field the user drops into - is the same moment.
      if (uploading || !value?.url) return;
      setLocalPreview({ ...localPreview, boundUrl: value.url });
      return;
    }
    if (value?.url !== localPreview.boundUrl) setLocal(null);
  }, [localPreview, value?.url, uploading, setLocal]);

  const hasFile = !!value?.url;
  const localType = localIsCurrent ? localPreview?.type : undefined;
  // Sniffed SEPARATELY, because they used to be concatenated into one string
  // and tested with `/\.pdf(\?|$)/i` - so a filename's extension was always
  // followed by a space and could never match. Only a URL that carried its own
  // extension was ever previewable; a `data:` URL or an opaque storage id with
  // a perfectly good filename beside it was not offered a preview at all.
  const filename = value?.filename ?? '';
  const url = value?.url ?? '';
  const urlMime = dataUrlMime(url);

  const isImage =
    category === 'image' ||
    localType?.startsWith('image/') === true ||
    urlMime?.startsWith('image/') === true ||
    IMAGE_EXT_RE.test(filename) ||
    IMAGE_EXT_RE.test(url);
  const isPdf =
    localType === 'application/pdf' ||
    urlMime === 'application/pdf' ||
    PDF_EXT_RE.test(filename) ||
    PDF_EXT_RE.test(url);
  const canPreview = isImage || isPdf;

  const storageUri = value?.url && !isDirectlyViewable(value.url) ? value.url : null;
  useEffect(() => {
    if (!previewOpen || !storageUri || localIsCurrent || !resolveUrl) return;
    let cancelled = false;
    void resolveUrl(storageUri)
      .then((src) => {
        // A resolver that ANSWERS with nothing is the same outcome as one that
        // rejects, and it has to be recorded as one. Skipping `setResolved` on
        // an empty answer left the previous resolution standing, and it was not
        // even stale by URI - reopening the SAME file after its signed URL
        // expired kept painting the dead URL under a resolver that had just
        // said it had none.
        if (!cancelled) setResolved(src ? { uri: storageUri, src } : null);
      })
      .catch(() => {
        // A resolution that failed must leave the spinner, not the file before
        // it - and must not escape as an unhandled rejection into the host's
        // app. `resolveUrl` is a network call; rejecting is ordinary.
        if (!cancelled) setResolved(null);
      });
    return () => {
      cancelled = true;
    };
  }, [previewOpen, storageUri, localIsCurrent, resolveUrl]);

  // A browser-viewable source: the local object URL, a directly-viewable URL, or
  // a resolved presigned URL for a stored file. The resolution counts only while
  // it still belongs to the value on screen, which is what makes staleness
  // impossible rather than merely brief: clearing it from an effect would still
  // paint one frame of the old file, exactly as `localIsCurrent` above is
  // computed in render for the same reason.
  const resolvedSrc = resolved && resolved.uri === storageUri ? resolved.src : undefined;
  const previewSrc =
    (localIsCurrent ? localPreview?.objectUrl : undefined) ??
    (isDirectlyViewable(value?.url) ? value.url : resolvedSrc);

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category={category}
      description={field.description}
      required={field.required}
      error={error}
      // Names the file input, the way every other control in the set names its
      // own. Without it `FieldShell` renders the title as a `<div>` bound to
      // nothing and the input's accessible name computes to the empty string.
      htmlFor={domId}
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
        // `role="presentation"` and no tab stop: this div is the drop TARGET and
        // the visual affordance, and the control inside it is a real
        // `<input type="file">`, which already has the right role and now has a
        // name. Giving the div a `role="button"` of its own would put a second
        // named control in the accessibility tree for one value. The focus ring
        // is `focus-within` because the element that takes focus is clip-hidden.
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center',
            'cursor-pointer select-none transition-colors',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
            isDragActive
              ? 'border-primary/60 bg-primary/5'
              : 'border-border bg-input hover:border-border hover:bg-muted',
            busy && 'cursor-not-allowed opacity-60',
          )}
        >
          <input
            {...getInputProps({ tabIndex: 0 })}
            id={domId}
            disabled={busy}
            aria-invalid={!!error}
          />
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

      {/* The refusal. `role="alert"` because it appears in response to something
          the user just did and is the only feedback that the action had no
          effect - a screen-reader user who drops a .zip otherwise gets silence.
          It names the file so the message is about the thing they picked, not a
          generic complaint. */}
      {rejected && !busy && (
        <p role="alert" className="text-[12px] text-destructive">
          <span className="font-mono">{rejected}</span> —{' '}
          {s.unsupportedFileType(field.accept ?? '')}
        </p>
      )}

      {/* URL escape hatch - collapsed by default to keep the happy path clean.
          It reads `busy`, not `disabled`: an upload is a door into this value
          like any other, and leaving these two live while the dropzone was shut
          let a user paste a URL over a file that was still arriving - or, on the
          host side, abandon a started and billed run client-side. The seam
          promises the control is disabled while its id is uploading, and that
          has to mean every way in. */}
      {!showUrl ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setShowUrl(true)}
          className="flex w-fit items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <Link2 className="h-3 w-3" />
          {s.pasteUrlInstead}
        </button>
      ) : (
        <input
          type="text"
          autoFocus
          value={value?.url ?? ''}
          disabled={busy}
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
