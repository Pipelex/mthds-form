'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileRunField } from '../core';
import { PHOTO_FILE, photoFileName } from '../core/photo-file';
import { readPhoto, UndecodablePhotoError, type JpegImage } from './photo-reading';
import { loadJsPdf, pagesToPdf } from './photos-pdf';
import { isThenable, storedUrlOf } from './utils';

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
  /** Its own, from a counter that only grows: no later hand-off shares it. */
  token: number;
  /** Which pages it was made of (`pagesKey`). */
  key: string;
  /**
   * Whether the value is, or is about to be, this file. The control wrote the
   * field empty over it when its pages changed for a host without the seam,
   * and the pages it was made of must then be stored again even unchanged.
   */
  standing: boolean;
  /**
   * What its upload answered: nothing yet, the URL it stored at, or nothing
   * to match (a host that hands back no upload, or one that names no URL).
   */
  answer: 'pending' | 'url' | 'none';
  /**
   * For an answer naming no URL: whether a value has been taken as its own,
   * which is the first one to land after it that nothing else claims.
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
   * The host's `FieldEnv.onPreparingFile`, bound to the field's id: called
   * when a photo is taken, retaken or a page removed, and the function it
   * returns is called once the made file is handed to `store`, nothing is
   * left to make, or the field unmounts. Absent, the field writes itself
   * empty the moment its pages change, so its value is never a stale file
   * while the next one is made.
   */
  onPreparing?: () => () => void;
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
  // Read when a step runs, so the callbacks stay put across renders.
  const latest = useRef(options);
  latest.current = options;

  /**
   * Whether the control is still mounted. A read, a made file or an upload's
   * answer arriving after it unmounted changes nothing and tells the host
   * nothing: what it would act on is gone, and its id may be another
   * control's by then.
   */
  const alive = useRef(true);
  const commit = useCallback((next: PhotoState) => {
    if (!alive.current) return;
    held.current = next;
    setState(next);
  }, []);

  /** The photos being read, one after another. Each link catches its own failure. */
  const queue = useRef<Promise<void>>(Promise.resolve());
  const counter = useRef(0);
  /** The latest file handed to the host, or `null` while none of these pages' is. */
  const handed = useRef<Handed | null>(null);
  /** Counts the hand-offs, so each has a token no other ever shares. */
  const handOffs = useRef(0);
  /** The hand-offs whose upload has not answered yet, by token. */
  const awaiting = useRef(new Set<number>());
  /** The URLs the uploads of the made files stored at, each with the pages it was made of. */
  const ownUrls = useRef(new Map<string, string>());
  /** Counts each discard: an answer to an upload of pages since discarded is no one's. */
  const epoch = useRef(0);
  /** The control wrote the value empty itself, and the change to come is its own. */
  const ownClear = useRef(false);
  /** Counts each settling, so a file made for pages since changed is not stored. */
  const making = useRef(0);
  /** The host's release of the report that a file is being made, while it is. */
  const preparing = useRef<{ release: (() => void) | undefined } | null>(null);

  const setPreparing = useCallback((next: boolean) => {
    if (!alive.current || (preparing.current !== null) === next) return;
    if (next) {
      preparing.current = { release: latest.current.onPreparing?.() };
      return;
    }
    const { release } = preparing.current ?? {};
    preparing.current = null;
    release?.();
  }, []);

  /** Writes the value empty, and reads the change to come as the control's own. */
  const writeEmpty = useCallback(() => {
    if (latest.current.valueUrl === undefined) return;
    ownClear.current = true;
    latest.current.clear();
  }, []);

  /**
   * The value is no longer the latest made file's: written empty, and the
   * pages it was made of stored again even unchanged. Its upload is still
   * followed, so the value it writes when it lands is known as the pages'.
   */
  const withdraw = useCallback(() => {
    const last = handed.current;
    if (last) handed.current = { ...last, standing: false };
    writeEmpty();
  }, [writeEmpty]);

  const revoke = useCallback((pages: readonly PhotoPage[]) => {
    for (const page of pages) URL.revokeObjectURL(page.thumbnail);
  }, []);

  const discard = useCallback(() => {
    revoke(held.current.pages);
    if (held.current !== NO_PHOTOS) commit(NO_PHOTOS);
    handed.current = null;
    awaiting.current.clear();
    ownUrls.current.clear();
    epoch.current += 1;
    making.current += 1;
    setPreparing(false);
  }, [commit, revoke, setPreparing]);

  // A remount loses the pages, so their object URLs go with the control, the
  // host's report that a file is being made is let go, and nothing still on
  // its way acts on anything any more: a read still running, the photos
  // queued behind it, a file being made and every upload's answer.
  useEffect(() => {
    alive.current = true;
    return () => {
      const { release } = preparing.current ?? {};
      preparing.current = null;
      alive.current = false;
      making.current += 1;
      revoke(held.current.pages);
      release?.();
    };
  }, [revoke]);

  /**
   * The pages are about to change. A host following the seam is told a file is
   * being made; one that does not has its value taken out now when it holds,
   * or is about to hold, an earlier set's file, so it never runs on a stale one.
   */
  const changing = useCallback(() => {
    setPreparing(true);
    if (!latest.current.onPreparing && handed.current?.standing) withdraw();
  }, [setPreparing, withdraw]);

  /**
   * Whether a file of the pages as they are now is still to come: a photo is
   * being read, the latest file handed over is of other pages, or its upload
   * has not answered.
   */
  const newerToCome = useCallback((): boolean => {
    const current = held.current;
    const last = handed.current;
    if (current.reading.length > 0 || last === null) return true;
    return last.key !== pagesKey(current.pages) || awaiting.current.has(last.token);
  }, []);

  /**
   * Whose the value is, judged against what the uploads have answered. The
   * value an upload answered with is the pages' own; a host without the seam
   * has a stale one, of earlier pages, written empty while a newer is on its
   * way. Any other value is someone else's and discards the pages, once no
   * upload still to answer might name it; the first value to land after a
   * hand-off whose upload names no URL is taken as its own.
   */
  const judge = useCallback(() => {
    if (!alive.current) return;
    const current = held.current;
    if (current.pages.length === 0 && current.reading.length === 0) return;
    const url = latest.current.valueUrl;
    if (url === undefined) return;
    const madeOf = ownUrls.current.get(url);
    if (madeOf !== undefined) {
      const stale = madeOf !== pagesKey(current.pages);
      if (stale && !latest.current.onPreparing && newerToCome()) writeEmpty();
      return;
    }
    if (awaiting.current.size > 0) return;
    const last = handed.current;
    if (last && last.answer === 'none' && !last.adopted) {
      ownUrls.current.set(url, last.key);
      handed.current = { ...last, adopted: true };
      return;
    }
    discard();
  }, [discard, newerToCome, writeEmpty]);

  /** One photo read into a page, when its read is still wanted once it is done. */
  const readOne = useCallback(
    async (marker: PhotoRead, photo: File): Promise<void> => {
      // Unmounted, or discarded meanwhile: the photo is not read at all.
      if (!alive.current) return;
      if (!held.current.reading.some((candidate) => candidate.id === marker.id)) return;
      let read: Awaited<ReturnType<typeof readPhoto>> | null = null;
      let refusal: PhotoRefusal | null = null;
      try {
        read = await readPhoto(photo);
      } catch (error: unknown) {
        refusal = error instanceof UndecodablePhotoError ? 'undecodable' : 'notKept';
        if (refusal === 'notKept' && alive.current) {
          // eslint-disable-next-line no-console -- a failure of ours, reported where a host looks.
          console.error('[mthds-form] could not read a photo:', error);
        }
      }
      if (!alive.current) return;
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

  /**
   * Hands the made file to the host and follows its upload. A host whose
   * `onDropFile` throws has failed the upload as one whose upload rejects has:
   * the pages go, and the person is told the photos were not kept, since such
   * a host has no upload whose failure it could report on the field.
   */
  const handOver = useCallback(
    (file: File, key: string) => {
      let upload: unknown;
      try {
        upload = latest.current.store(file);
      } catch (error: unknown) {
        // eslint-disable-next-line no-console -- a host's failure, reported where it looks.
        console.error('[mthds-form] could not store the file of the photos:', error);
        discard();
        commit({ ...held.current, refusal: 'notKept' });
        return;
      }
      const token = ++handOffs.current;
      const thenable = isThenable(upload);
      handed.current = {
        token,
        key,
        standing: true,
        answer: thenable ? 'pending' : 'none',
        adopted: false,
      };
      commit({ ...held.current, madeKey: key });
      setPreparing(false);
      if (!thenable) return;
      awaiting.current.add(token);
      const since = epoch.current;
      const answered = (url: string | undefined) => {
        awaiting.current.delete(token);
        if (!alive.current || epoch.current !== since) return;
        if (url !== undefined) ownUrls.current.set(url, key);
        const last = handed.current;
        if (last?.token === token) {
          handed.current = { ...last, answer: url === undefined ? 'none' : 'url' };
        }
        judge();
      };
      Promise.resolve(upload).then(
        (stored) => answered(storedUrlOf(stored)),
        () => {
          // The upload stored nothing: the value is as it was, and the pages
          // are no file's any more. One superseded by a newer set is not this.
          if (alive.current && epoch.current === since && handed.current?.token === token) {
            discard();
            return;
          }
          awaiting.current.delete(token);
          if (alive.current && epoch.current === since) judge();
        },
      );
    },
    [commit, discard, judge, setPreparing],
  );

  // The pages settled: no photo is still being read. Store the file they make,
  // unless it is the one already handed over and still standing; with no page
  // left, the input holds nothing.
  useEffect(() => {
    // Counted on every change, so a file still being made for the pages as
    // they were is not stored once a photo has been taken since.
    making.current += 1;
    const generation = making.current;
    if (state.reading.length > 0) return;
    if (state.pages.length === 0) {
      if (handed.current !== null) {
        writeEmpty();
        handed.current = null;
        ownUrls.current.clear();
      }
      setPreparing(false);
      return;
    }
    const key = pagesKey(state.pages);
    if (handed.current?.key === key && handed.current.standing) {
      setPreparing(false);
      return;
    }
    const { kind } = latest.current.field;
    makeFile(state.pages, kind, latest.current.label).then(
      (file) => {
        if (alive.current && making.current === generation) handOver(file, key);
      },
      (error: unknown) => {
        if (!alive.current || making.current !== generation) return;
        // eslint-disable-next-line no-console -- a failure of ours, reported where a host looks.
        console.error('[mthds-form] could not make the file of the photos:', error);
        // The value must not stand for pages it no longer is the file of.
        withdraw();
        commit({ ...held.current, refusal: 'notKept' });
        setPreparing(false);
      },
    );
  }, [state.pages, state.reading, commit, handOver, setPreparing, withdraw, writeEmpty]);

  // A value written by anyone else discards the pages: a cleared input, a
  // dropped or chosen file, an example, a reset. What is anyone else's is
  // decided by `judge`, against the URLs the uploads answered with.
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
    judge();
  }, [valueUrl, discard, judge]);

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
