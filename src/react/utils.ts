import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { hasOwnProp } from '../core/own-property';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Order-independent deep equality for JSON-shaped values (form data, inputs).
 * Objects compare by key set + value, arrays by index. Enough for comparing
 * two plain data snapshots; not a general structural-equality library (no
 * Map/Set/Date/cycle handling - none of which appear in the data it guards).
 */
export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => isDeepEqual(item, b[i]));
  }
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => hasOwnProp(bObj, k) && isDeepEqual(aObj[k], bObj[k]));
}

/** Whether a host's `onDropFile` handed back its upload, rather than nothing. */
export function isThenable(answer: unknown): answer is PromiseLike<unknown> {
  return (
    (typeof answer === 'object' || typeof answer === 'function') &&
    answer !== null &&
    typeof (answer as { then?: unknown }).then === 'function'
  );
}

/**
 * The URL an upload's answer names, or `undefined` when it names none: read
 * defensively, because a host's `onDropFile` is typed loosely enough to hand
 * back a promise of anything, and only a URL can be matched to the value.
 */
export function storedUrlOf(stored: unknown): string | undefined {
  if (typeof stored === 'string') return stored === '' ? undefined : stored;
  if (stored === null || typeof stored !== 'object') return undefined;
  const url = (stored as { url?: unknown }).url;
  return typeof url === 'string' && url !== '' ? url : undefined;
}
