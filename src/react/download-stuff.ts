import { collectStuffFiles, type StuffFile } from '../core/stuff-files';
import type { RunField } from '../core/descriptor';

/** How a host turns a stored reference into something fetchable. */
export type ResolveForDownload = (url: string) => string | undefined;

/**
 * Save one blob under a name, through the anchor the browser understands.
 *
 * Object URLs are revoked on the next tick rather than immediately: Safari
 * starts the download asynchronously and a URL revoked in the same frame can be
 * gone before the fetch begins, which fails silently — no error, no file.
 */
function saveBlob(blob: Blob, filename: string): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 0);
}

/** The extension a URL states, or none — never guessed from the bytes. */
function extensionOf(url: string, filename: string | undefined): string {
  const named = filename?.match(/\.([A-Za-z0-9]{1,8})$/)?.[1];
  if (named) return named.toLowerCase();
  const path = url.split(/[?#]/)[0] ?? url;
  const match = path.match(/\.([A-Za-z0-9]{1,8})$/)?.[1];
  return match ? match.toLowerCase() : '';
}

/**
 * What a saved file is called.
 *
 * The file's own `filename` wins when it has one — it is the name the producer
 * chose and the reader recognises. Otherwise the descriptor path names it
 * (`report.attachments.2`), which is unlovely but unambiguous: two images from
 * one result must not both land as `image.png`, silently overwriting in the
 * download folder.
 */
function fileNameFor(file: StuffFile, base: string): string {
  if (file.filename) return file.filename;
  const extension = extensionOf(file.url, file.filename);
  const stem = `${base}-${file.path.replace(/\./g, '-')}`;
  return extension ? `${stem}.${extension}` : stem;
}

/**
 * Everything a stuff contains, saved.
 *
 * The rule the caller asked for, and the one that matches what a result IS: the
 * data goes down as JSON, and any image or document inside it goes down as
 * ITSELF. A JSON file holding a URL to a picture is not the picture, and a
 * reader who clicks download on a report with three attachments wants the three
 * attachments — the reference is what the payload had, not what they asked for.
 *
 * The JSON is written whenever the stuff is anything more than its files: a
 * result that IS one image has nothing left over once the image is saved, so
 * writing `{"url": …}` beside it would be a second file saying less than the
 * first. A result with fields around its files keeps both.
 *
 * A file that cannot be fetched is opened in a tab instead of failing. The
 * fetch is same-origin for a host that proxies its storage, but a remote URL
 * with no CORS header cannot be read into a blob at all, and handing the reader
 * the file in a tab is the difference between an awkward download and none.
 */
export async function downloadStuff({
  field,
  value,
  baseName,
  resolveUrl,
}: {
  field: RunField;
  value: unknown;
  /** Names the JSON file and prefixes any file that has no name of its own. */
  baseName: string;
  resolveUrl?: ResolveForDownload;
}): Promise<void> {
  const files = collectStuffFiles(field, value);

  // A stuff that is nothing but one file: save the file, and no JSON.
  const isBareFile = files.length === 1 && (field.kind === 'image' || field.kind === 'document');

  for (const file of files) {
    const href = resolveUrl?.(file.url) ?? file.publicUrl ?? file.url;
    const name = fileNameFor(file, baseName);
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error(String(response.status));
      saveBlob(await response.blob(), name);
    } catch {
      // Unreadable cross-origin, an expired link, an offline tab: open it so the
      // reader still gets the file. Swallowing the reason is deliberate — there
      // is one recovery and it does not depend on which of them happened.
      window.open(href, '_blank', 'noopener');
    }
  }

  if (isBareFile) return;
  saveBlob(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' }),
    `${baseName}.json`,
  );
}
