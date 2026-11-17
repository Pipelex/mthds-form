'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileRunField } from '../core';
import { PHOTO_FILE, photoFileName } from '../core/photo-file';
import { readPhoto, UndecodablePhotoError, type JpegImage } from './photo-reading';
import { loadJsPdf, pagesToPdf } from './photos-pdf';
import { isThenable } from './utils';

/**
 * The pages a runner photographs into one file input, held by its file
 * control until they are a stored file. See docs/camera.md.
 *
 * A document input holds any number of pages, numbered in the order they were
 * taken; an image input holds one photo, which a new one replaces. Each photo
 * is read into its page once (`readPhoto`), one at a time in the order taken,
 * and whenever the pages settle - no photo still being read - the control
 * makes the file (one PDF of the pages, or the image's own JPEG) and stores it
 * through `store`, the control's own upload path. So the value is always an
 * ordinary stored file, and nothing outside the control knows about photos.
 *
 * The pages are an editing aid over that file, never the truth: they are kept
 * only while the value is the file they made or that file is on its way. Any
 * other value, written by anyone, discards them and gives back their object
 * URLs, and a remount loses them (the stored file stays). An upload of the
 * made file that fails discards them too, leaving the value as it was.
 */

/** One page: its own id, its thumbnail's object URL, and its encoded JPEG. */
export interface PhotoPage {
  /** Stable for the page's life: a retake makes a new page with a new id in its place. */
  id: string;
  thumbnail: string;
  page: JpegImage;
}

/**
 * A photo being read into a page: its own id, and the id of the page it
 * retakes, or `null` for a new page (a document's next page, or an image
 * input's photo).
 */
export interface PhotoRead {
  id: string;
  replaces: string | null;
}

/**
 * Why a photo never became a page, which is also how the control words it:
 * the browser could not decode it (`undecodable`), or its read, or the making
 * of the file, failed on our side (`notKept`).
 */
export type PhotoRefusal = 'undecodable' | 'notKept';

interface PhotoState {
  pages: readonly PhotoPage[];
  reading: readonly PhotoRead[];
  refusal: PhotoRefusal | null;
  /** Which pages the file last handed to the host was made of (`pagesKey`). */
  madeKey: string | null;
}

const NO_PHOTOS: PhotoState = { pages: [], reading: [], refusal: null, madeKey: null };

/** The made file handed to the host last, and what its upload has said. */
interface Handed {
  /** Which pages it was made of (`pagesKey`). */
  key: string;
  token: number;
  /** Whether the host handed back its upload, and it has not answered yet. */
  awaiting: boolean;
  /**
   * Whether the value this hand-off wrote has been seen: for an upload that
   * gives no answer, the first value to land after it is its own.
   */
  adopted: boolean;
}

export interface PhotoPagesOptions {
  field: FileRunField;
  /** The input's label as the form shows it: the made file's name and its PDF's title. */
  label: string;
  /** The URL the field's value holds, if any. */
  valueUrl: string | undefined;
  /** The host's word that the field's upload failed, while it is on screen. */
  uploadFailure: string | null;
  /** Hands the made file to the host, as a dropped file is, and answers its upload. */
  store: (file: File) => unknown;
  /** Writes the field empty. */
  clear: () => void;
  /**
   * The host's `FieldEnv.onPreparingFile`, bound to the field's id: told
   * `true` from a photo taken, retaken or a page removed until the made file
   * is handed to `store`, or nothing is left to make. Absent, the field writes
   * itself empty the moment its pages change, so its value is never a stale
   * file while the next one is made.
   */
  onPreparing?: (preparing: boolean) => void;
}

export interface PhotoPages {
  pages: readonly PhotoPage[];
  reading: readonly PhotoRead[];
  /** A photo that never became a page, until the runner next acts on the input. */
  refusal: PhotoRefusal | null;
  /** Whether a page is held or a photo is being read. */
  held: boolean;
  /**
   * Whether the file of the pages as they are now has been handed to the
   * host: once its upload lands, the value is that file.
   */
  handedOver: boolean;
  /** A photo taken: a new page (`replaces` `null`), or the retake of the page `replaces`. */
  take: (photo: File, replaces: string | null) => void;
  remove: (pageId: string) => void;
  /** Drops every page and every photo being read, and gives back their object URLs. */
  discard: () => void;
  /** The runner acted on the input: the refusal on screen goes. */
  forgetRefusal: () => void;
}

/** Which pages a set is: a page added, retaken or removed makes another set. */
function pagesKey(pages: readonly PhotoPage[]): string {
  return pages.map((page) => page.id).join(' ');
}

/**
 * The pages once a read's `page` lands: a retake in the place of the page it
 * `replaces`, found by its id wherever it is now, or a new page at the end. An
 * image input holds one photo, which a new one replaces. `null` when the page
 * it retakes is gone.
 */
function withPage(
  pages: readonly PhotoPage[],
  kind: FileRunField['kind'],
  replaces: string | null,
  page: PhotoPage,
): PhotoPage[] | null {
  if (replaces === null) return kind === 'image' ? [page] : [...pages, page];
  if (!pages.some((held) => held.id === replaces)) return null;
  return pages.map((held) => (held.id === replaces ? page : held));
}

/** The URL an upload's answer names, or `undefined` when it names none. */
function storedUrlOf(stored: unknown): string | undefined {
  if (typeof stored === 'string') return stored === '' ? undefined : stored;
  if (stored === null || typeof stored !== 'object') return undefined;
  const url = (stored as { url?: unknown }).url;
  return typeof url === 'string' && url !== '' ? url : undefined;
}

/** The file the pages make: one PDF of them for a document, the photo's JPEG for an image. */
async function makeFile(
  pages: readonly PhotoPage[],
  kind: FileRunField['kind'],
  label: string,
): Promise<File> {
  const name = photoFileName(label, kind);
  const { type } = PHOTO_FILE[kind];
  if (kind === 'image') {
    const photo = pages[pages.length - 1];
    if (!photo) throw new Error('An image input holds no photo to store.');
    return new File([photo.page.blob], name, { type });
  }
  const pdf = await pagesToPdf(
    pages.map((page) => page.page),
    { title: label || undefined },
  );
  return new File([pdf], name, { type });
}

export function usePhotoPages(options: PhotoPagesOptions): PhotoPages {
  const [state, setState] = useState<PhotoState>(NO_PHOTOS);
  // The state as of now, for the reads and the uploads, which run between
  // renders: the rendered one lags a render behind.
  const held = useRef(state);
  const commit = useCallback((next: PhotoState) => {
    held.current = next;
    setState(next);
  }, []);
  // Read when a step runs, so the callbacks stay put across renders.
  const latest = useRef(options);
  latest.current = options;

  /** The photos being read, one after another. Each link catches its own failure. */
  const queue = useRef<Promise<void>>(Promise.resolve());
  const counter = useRef(0);
  /** The latest file handed to the host, or `null` while the value holds no file of these pages. */
  const handed = useRef<Handed | null>(null);
  /** The URLs the uploads of the made files answered they stored at. */
  const ownUrls = useRef(new Set<string>());
  /** The control wrote the value empty itself, and the change to come is its own. */
  const ownClear = useRef(false);
  /** Counts each settling, so a file made for pages since changed is not stored. */
  const making = useRef(0);
  /** What the host was last told about preparing. */
  const preparing = useRef(false);

  const setPreparing = useCallback((next: boolean) => {
    if (preparing.current === next) return;
    preparing.current = next;
    latest.current.onPreparing?.(next);
  }, []);

  /** The value is written empty by the control, and its next change read as its own. */
  const clearOwn = useCallback(() => {
    handed.current = null;
    if (latest.current.valueUrl === undefined) return;
    ownClear.current = true;
    latest.current.clear();
  }, []);

  const revoke = useCallback((pages: readonly PhotoPage[]) => {
    for (const page of pages) URL.revokeObjectURL(page.thumbnail);
  }, []);

  const discard = useCallback(() => {
    revoke(held.current.pages);
    if (held.current !== NO_PHOTOS) commit(NO_PHOTOS);
    handed.current = null;
    ownUrls.current.clear();
    making.current += 1;
    setPreparing(false);
  }, [commit, revoke, setPreparing]);

  // A remount loses the pages, so their object URLs go with the control, and a
  // host told the field was preparing is told it no longer is.
  useEffect(
    () => () => {
      revoke(held.current.pages);
      making.current += 1;
      if (preparing.current) latest.current.onPreparing?.(false);
    },
    [revoke],
  );

  /**
   * The pages are about to change. A host following the seam is told a file is
   * being made; one that does not has its value taken out now when it holds an
   * earlier set's file, so it never runs on a stale one.
   */
  const changing = useCallback(() => {
    setPreparing(true);
    if (!latest.current.onPreparing && handed.current !== null) clearOwn();
  }, [clearOwn, setPreparing]);

  /** One photo read into a page, when its read is still wanted once it is done. */
  const readOne = useCallback(
    async (marker: PhotoRead, photo: File): Promise<void> => {
      let read: Awaited<ReturnType<typeof readPhoto>> | null = null;
      let refusal: PhotoRefusal | null = null;
      try {
        read = await readPhoto(photo);
      } catch (error: unknown) {
        refusal = error instanceof UndecodablePhotoError ? 'undecodable' : 'notKept';
        if (refusal === 'notKept') {
          // eslint-disable-next-line no-console -- a failure of ours, reported where a host looks.
          console.error('[mthds-form] could not read a photo:', error);
        }
      }
      // Its own marker, as it is now: gone when its page was removed or the
      // pages discarded meanwhile, and naming the page it retakes as it is now.
      const current = held.current;
      const wanted = current.reading.find((candidate) => candidate.id === marker.id);
      if (!wanted) return;
      const reading = current.reading.filter((candidate) => candidate.id !== marker.id);
      if (!read) {
        commit({ ...current, reading, refusal });
        return;
      }
      counter.current += 1;
      const page: PhotoPage = {
        id: `page-${counter.current}`,
        thumbnail: URL.createObjectURL(read.thumbnail.blob),
        page: read.page,
      };
      const pages = withPage(current.pages, latest.current.field.kind, wanted.replaces, page);
      if (!pages) {
        URL.revokeObjectURL(page.thumbnail);
        commit({ ...current, reading });
        return;
      }
      revoke(current.pages.filter((gone) => !pages.includes(gone)));
      // A later retake of the page this one replaced lands on this one's photo.
      const retargeted =
        wanted.replaces === null
          ? reading
          : reading.map((candidate) =>
              candidate.replaces === wanted.replaces
                ? { ...candidate, replaces: page.id }
                : candidate,
            );
      commit({ ...current, pages, reading: retargeted });
    },
    [commit, revoke],
  );

  const take = useCallback(
    (photo: File, replaces: string | null) => {
      const current = held.current;
      if (replaces !== null && !current.pages.some((page) => page.id === replaces)) return;
      counter.current += 1;
      const marker: PhotoRead = { id: `read-${counter.current}`, replaces };
      commit({ ...current, reading: [...current.reading, marker], refusal: null });
      changing();
      // The first photo of a document: fetch `jspdf` now, so the file is made at once.
      if (latest.current.field.kind === 'document') void loadJsPdf().catch(() => undefined);
      queue.current = queue.current.then(() => readOne(marker, photo));
    },
    [changing, commit, readOne],
  );

  const remove = useCallback(
    (pageId: string) => {
      const current = held.current;
      const page = current.pages.find((candidate) => candidate.id === pageId);
      if (!page) return;
      revoke([page]);
      commit({
        ...current,
        pages: current.pages.filter((candidate) => candidate.id !== pageId),
        // A retake of this page still being read has nothing left to replace.
        reading: current.reading.filter((candidate) => candidate.replaces !== pageId),
        refusal: null,
      });
      changing();
    },
    [changing, commit, revoke],
  );

  const forgetRefusal = useCallback(() => {
    if (held.current.refusal !== null) commit({ ...held.current, refusal: null });
  }, [commit]);

  // The pages settled: no photo is still being read. Store the file they make,
  // unless it is the one already handed over; with no page left, the input
  // holds nothing.
  useEffect(() => {
    // Counted on every change, so a file still being made for the pages as
    // they were is not stored once a photo has been taken since.
    making.current += 1;
    const generation = making.current;
    if (state.reading.length > 0) return;
    if (state.pages.length === 0) {
      if (handed.current !== null) {
        clearOwn();
        ownUrls.current.clear();
      }
      setPreparing(false);
      return;
    }
    const key = pagesKey(state.pages);
    if (handed.current?.key === key) {
      setPreparing(false);
      return;
    }
    const { kind } = latest.current.field;
    makeFile(state.pages, kind, latest.current.label).then(
      (file) => {
        if (making.current !== generation) return;
        const upload = latest.current.store(file);
        const token = (handed.current?.token ?? 0) + 1;
        const awaiting = isThenable(upload);
        handed.current = { key, token, awaiting, adopted: false };
        commit({ ...held.current, madeKey: key });
        setPreparing(false);
        if (!awaiting) return;
        Promise.resolve(upload).then(
          (stored) => {
            if (handed.current?.token !== token) return;
            const url = storedUrlOf(stored);
            if (url !== undefined) ownUrls.current.add(url);
            // An answer naming its URL is how its value is known; one naming
            // none leaves the first value to land as its own.
            handed.current = {
              ...handed.current,
              awaiting: false,
              adopted: handed.current.adopted || url !== undefined,
            };
          },
          () => {
            // The upload stored nothing: the value is as it was, and the pages
            // are no file's any more. One superseded by a newer set is not this.
            if (handed.current?.token === token) discard();
          },
        );
      },
      (error: unknown) => {
        if (making.current !== generation) return;
        // eslint-disable-next-line no-console -- a failure of ours, reported where a host looks.
        console.error('[mthds-form] could not make the file of the photos:', error);
        // The value must not stand for pages it no longer is the file of.
        clearOwn();
        commit({ ...held.current, refusal: 'notKept' });
        setPreparing(false);
      },
    );
  }, [state.pages, state.reading, clearOwn, commit, discard, setPreparing]);

  // A value written by anyone else discards the pages: a cleared input, a
  // dropped or chosen file, an example, a reset. The value the uploads of the
  // made files answered with is the pages' own, and so is the first value to
  // land after a hand-off whose upload gives no answer, or has not yet.
  const { valueUrl, uploadFailure } = options;
  const lastUrl = useRef(valueUrl);
  useEffect(() => {
    const previous = lastUrl.current;
    lastUrl.current = valueUrl;
    if (previous === valueUrl) return;
    const wasOwnClear = ownClear.current;
    ownClear.current = false;
    if (held.current.pages.length === 0 && held.current.reading.length === 0) return;
    if (valueUrl === undefined) {
      if (!wasOwnClear) discard();
      return;
    }
    if (ownUrls.current.has(valueUrl)) return;
    const last = handed.current;
    if (last && (last.awaiting || !last.adopted)) {
      ownUrls.current.add(valueUrl);
      handed.current = { ...last, adopted: true };
      return;
    }
    discard();
  }, [valueUrl, discard]);

  // A host that hands back no upload says it failed through its message.
  useEffect(() => {
    if (uploadFailure !== null && handed.current !== null) discard();
  }, [uploadFailure, discard]);

  return {
    pages: state.pages,
    reading: state.reading,
    refusal: state.refusal,
    held: state.pages.length > 0 || state.reading.length > 0,
    handedOver:
      state.reading.length === 0 &&
      state.pages.length > 0 &&
      state.madeKey === pagesKey(state.pages),
    take,
    remove,
    discard,
    forgetRefusal,
  };
}
