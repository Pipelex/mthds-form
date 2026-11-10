'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AskDocumentPdf, DocumentPdfAnswer } from './result-env';

/**
 * How long one ask may take. An ask answers where the PDF stands and does not
 * wait for the PDF, so one still running after this is stuck rather than busy.
 */
export const DOCUMENT_PDF_ASK_TIMEOUT_MS = 30_000;

/**
 * How long the view keeps asking while a PDF is being prepared, from the first
 * ask. Longer than a conversion should ever take, so that reaching it means the
 * work is stuck; the reader is then offered to try again, rather than a spinner
 * that turns for as long as the tab stays open.
 */
export const DOCUMENT_PDF_PREPARING_LIMIT_MS = 180_000;

/** The wait before the first ask again: most small documents are done by then. */
const FIRST_WAIT_MS = 1_500;
/** How much longer each further wait is, so a long conversion is asked about less often. */
const WAIT_GROWTH = 1.5;
const LONGEST_WAIT_MS = 10_000;

const PREPARING: DocumentPdfAnswer = { state: 'preparing' };
const FAILED: DocumentPdfAnswer = { state: 'failed' };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value !== '';

/**
 * One question to the host, which never rejects, and the one place its answer
 * is read before the view sees it. A host's function may be typed loosely, or
 * be a bridge resolving `any`, and an answer that reaches the view unread would
 * throw inside the render that shows it.
 *
 * So an ask that throws, rejects, takes longer than
 * `DOCUMENT_PDF_ASK_TIMEOUT_MS` or answers something other than a state reads
 * as `failed`, and so does a `ready` whose `url` is not a non-empty string. A
 * `failed` whose `message` is not a non-empty string carries none, so the view
 * says its own words. A string URL is left to the view's URL and frame gates.
 */
async function askOnce(ask: AskDocumentPdf): Promise<DocumentPdfAnswer> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<DocumentPdfAnswer>((resolve) => {
    timer = setTimeout(() => resolve(FAILED), DOCUMENT_PDF_ASK_TIMEOUT_MS);
  });
  try {
    const answer = (await Promise.race([ask(), timeout])) as DocumentPdfAnswer | undefined;
    switch (answer?.state) {
      case 'ready':
        return isNonEmptyString(answer.url) ? answer : FAILED;
      case 'failed':
        return isNonEmptyString(answer.message) ? answer : FAILED;
      case 'preparing':
      case 'unavailable':
        return answer;
      default:
        return FAILED;
    }
  } catch {
    return FAILED;
  } finally {
    clearTimeout(timer);
  }
}

export interface DocumentPdf {
  /** Where the PDF stands. It reads `preparing` until the first answer arrives. */
  answer: DocumentPdfAnswer;
  /** Asks from the start after a failure, as a reader's "Try again" does. */
  retry: () => void;
}

/**
 * The state of one document's preview: asks the host when it mounts, and again
 * while the answer is `preparing`.
 *
 * The component holding it is mounted only while the preview is open, so
 * closing the preview is what stops the asking, and a document's preview is
 * keyed by the document, so an answer about the last document never lands on
 * the next one.
 *
 * The host's function is read fresh for each ask rather than being a dependency
 * of the loop: a host that writes it inline hands over a new one on every
 * render, and a host re-rendering while a run is polled would otherwise restart
 * the loop on every poll.
 */
export function useDocumentPdf(ask: AskDocumentPdf): DocumentPdf {
  const [answer, setAnswer] = useState<DocumentPdfAnswer>(PREPARING);
  const [attempt, setAttempt] = useState(0);
  const latestAsk = useRef(ask);

  useEffect(() => {
    latestAsk.current = ask;
  });

  useEffect(() => {
    let stale = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    const askAgain = async (wait: number) => {
      const asked = await askOnce(latestAsk.current);
      if (stale) return;
      if (asked.state !== 'preparing') {
        setAnswer(asked);
        return;
      }
      if (Date.now() + wait - started > DOCUMENT_PDF_PREPARING_LIMIT_MS) {
        setAnswer(FAILED);
        return;
      }
      timer = setTimeout(() => void askAgain(Math.min(wait * WAIT_GROWTH, LONGEST_WAIT_MS)), wait);
    };
    void askAgain(FIRST_WAIT_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAnswer(PREPARING);
    setAttempt((current) => current + 1);
  }, []);

  return { answer, retry };
}
