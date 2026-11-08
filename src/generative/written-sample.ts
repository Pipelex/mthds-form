import type { RunField } from '../core';
import { isDelegatedResult } from './brief';
import { RESULT_ROOT, joinPath } from './paths';

/**
 * What a designer's written sample holds, read against the descriptor.
 *
 * When a result page is designed with no run to read, the method's second
 * entry (`layout_sample.design_from_written_sample`) has a model invent one
 * state of the result and designs from that. The text comes out of the run's
 * working memory under `written_sample`, and this is the check of it: what it
 * parses to, and everything it holds that the method's own description of its
 * result does not allow. Nothing here blocks a layout, which the two checks
 * judge on its own terms. A host reads the problems to decide whether the
 * sample is good enough to store beside the layout and to draw a page from.
 */

/** What a written sample parsed to and what is wrong with it; no problems means it may be used. */
export interface WrittenSample {
  /** The sample as parsed, whatever it holds; absent when the text is no JSON at all. */
  state: unknown;
  /** Every disagreement with the descriptor, one a line. */
  problems: string[];
}

/** A whole answer wrapped in a code fence, which a model writes even when it is told not to. */
const CODE_FENCE = /^```[\w-]*[ \t]*\r?\n([\s\S]*?)\r?\n?```$/;

/**
 * What a sample must leave out: what the page hands to the kernel, and every
 * file. A file is left out even where the result frame draws it itself,
 * because a link a model made up draws nothing or, worse, fetches something.
 */
function isLeftOut(field: RunField): boolean {
  return field.kind === 'document' || field.kind === 'image' || isDelegatedResult(field, 'result');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A day written as text, the way a real run's state holds one. */
const WRITTEN_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** What a kind is called in a problem, in the words a person would use. */
function kindInWords(field: RunField): string {
  switch (field.kind) {
    case 'text':
    case 'prose':
      return 'a text';
    case 'number':
      return field.integer ? 'a whole number' : 'a number';
    case 'boolean':
      return 'true or false';
    case 'enum':
      return `one of ${field.options.map((option) => JSON.stringify(option)).join(', ')}`;
    case 'date':
      return 'a day written as YYYY-MM-DD';
    case 'object':
      return 'a structure';
    case 'list':
      return 'a list';
    case 'document':
    case 'image':
    case 'unknown':
      return 'nothing';
    default:
      return field satisfies never;
  }
}

/** Whether a value that is present is of the kind the descriptor states. */
function holdsKind(field: RunField, value: unknown): boolean {
  switch (field.kind) {
    case 'text':
    case 'prose':
      return typeof value === 'string';
    case 'number':
      return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        (!field.integer || Number.isInteger(value))
      );
    case 'boolean':
      return typeof value === 'boolean';
    case 'enum':
      return typeof value === 'string' && field.options.includes(value);
    case 'date':
      return typeof value === 'string' && WRITTEN_DAY.test(value);
    case 'object':
      return isRecord(value);
    case 'list':
      return Array.isArray(value);
    case 'document':
    case 'image':
    case 'unknown':
      return false;
    default:
      return field satisfies never;
  }
}

/**
 * Walk the sample by the descriptor. The walk follows the descriptor, so its
 * depth is the method's and not the text's; a `null` is what JSON says for
 * nothing, which a run's own state holds for an optional member, and is read
 * as the member being absent.
 */
function check(field: RunField, value: unknown, path: string, problems: string[]): void {
  if (value === null || value === undefined) return;
  if (isLeftOut(field)) {
    problems.push(`${path} should be left out of a sample, and it holds something`);
    return;
  }
  if (!holdsKind(field, value)) {
    problems.push(`${path} should hold ${kindInWords(field)}`);
    return;
  }
  if (field.kind === 'object' && isRecord(value)) {
    const members = new Map(field.fields.map((member) => [member.name, member]));
    for (const [key, held] of Object.entries(value)) {
      const member = members.get(key);
      if (member) check(member, held, joinPath(path, key), problems);
      else problems.push(`${joinPath(path, key)} is not a member the method returns`);
    }
  }
  if (field.kind === 'list' && Array.isArray(value)) {
    value.forEach((item, index) =>
      check(field.item, item, joinPath(path, String(index)), problems),
    );
  }
}

/**
 * Parse a written sample, a code fence around it tolerated, and compare it
 * with the descriptor of the result: known members only, kinds that match, and
 * what a sample must leave out absent. It never throws, and it asks for no
 * member to be present: a sample that says less than the method can is still
 * one a page draws from.
 */
export function writtenSampleOf(field: RunField, text: string): WrittenSample {
  const trimmed = text.trim();
  const fenced = CODE_FENCE.exec(trimmed);
  let state: unknown;
  try {
    state = JSON.parse(fenced ? fenced[1]! : trimmed);
  } catch {
    return { state: undefined, problems: ['the written sample is not JSON'] };
  }
  const problems: string[] = [];
  check(field, state, RESULT_ROOT, problems);
  return { state, problems };
}
