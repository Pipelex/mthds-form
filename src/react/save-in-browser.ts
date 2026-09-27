import type { SaveFailure, SaveFile, SaveResult } from '../core/save-plan';

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

/** Inline content is text, and says which encoding it is in. */
function blobType(mimeType: string): string {
  return /^(text\/|application\/json)/.test(mimeType) && !/charset=/i.test(mimeType)
    ? `${mimeType};charset=utf-8`
    : mimeType;
}

/**
 * The default delivery: the planned files, saved by this browser tab.
 *
 * Inline content is written straight into a blob. A URL is fetched and its
 * bytes saved under the planned name. The fetch is same-origin for a host that
 * proxies its storage, and works cross-origin only where the server sends a
 * CORS header, so a file that cannot be read is REPORTED rather than recovered.
 *
 * There used to be a recovery: open the URL in a new tab when the fetch failed.
 * It could not run. The fetch is awaited, so by the time it failed the click
 * that started the download was spent, and a popup blocker suppresses a window
 * opened outside a click, silently, inside a `catch` that also swallowed the
 * reason. Reporting the file instead is what lets the control that asked tell
 * the reader, and the reader still has the file's own link in the rendered
 * view.
 *
 * This is also what a host gets from `ResultEnvProvider` when it supplies no
 * `saveFiles` of its own, and it is exported for a host that wants to fall back
 * to it, from a bridge that is not always there.
 */
export async function saveInBrowser(files: readonly SaveFile[]): Promise<SaveResult> {
  const failed: SaveFailure[] = [];
  for (const file of files) {
    try {
      if (file.text !== undefined) {
        saveBlob(new Blob([file.text], { type: blobType(file.mimeType) }), file.name);
        continue;
      }
      const response = await fetch(file.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      saveBlob(await response.blob(), file.name);
    } catch (error) {
      failed.push({ file, reason: error instanceof Error ? error.message : String(error) });
    }
  }
  return { failed };
}
