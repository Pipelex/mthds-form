/**
 * CHARACTERIZATION - the three drifted native-concept taxonomies, pinned BEFORE
 * they were consolidated. Module names below are the pre-consolidation
 * originals; docs/derivation-swap.md explains why the drift is preserved rather
 * than fixed.
 *
 * Three modules hardcode their own list of native concepts, and they disagree:
 *   - `field-model.ts` folds `Date`/`HTML` into TEXT and `Page` into DOCUMENT;
 *   - `input-format.ts` EXCLUDES `Date` and `HTML` from its text set, so both
 *     deflate/inflate through the CUSTOM-concept wrapper branch;
 *   - `run-values.ts` includes `Date` and `HTML` in its `{ text }` wrapper set.
 *
 * The composite is wire-visible: a `native.Date` input renders as prose
 * (field-model), wraps as `{ text }` (run-values), and then deflates to a
 * `{ concept, content }` envelope instead of a bare string (input-format).
 * K1 preserves each behavior exactly; fixing the drift (e.g. making `Date`
 * deflate like `Text`) is recorded as an M1 item, not done here.
 */
import { describe, expect, it } from 'vitest';
import {
  buildRunFields,
  deflateInput,
  inflateInput,
  rjsfDataFromRunValues,
  storeInputDataFromRunValues,
} from '..';
import type { PipeInputContract } from '..';

const DATE_CONTENT_SCHEMA = {
  title: 'DateContent',
  type: 'object',
  properties: {
    date: { type: 'string', format: 'date' },
    time: { anyOf: [{ type: 'string', format: 'time' }, { type: 'null' }] },
  },
  required: ['date'],
};

function input(concept_ref: string, json_schema: Record<string, unknown>): PipeInputContract {
  return { concept_ref, json_schema };
}

describe('field-model taxonomy: Date and HTML fold into TEXT, Page into DOCUMENT', () => {
  it('maps a top-level native.Date input to PROSE - not a date picker', () => {
    // `native.Date` sits in field-model's TEXT_CONCEPTS, and the text branch
    // wins before the schema shape is consulted - so the DateContent object
    // renders as a free-text prose field at depth 0.
    const [field] = buildRunFields({ when: input('native.Date', DATE_CONTENT_SCHEMA) });
    expect(field!.kind).toBe('prose');
  });

  it('maps a top-level native.HTML input to PROSE', () => {
    const [field] = buildRunFields({
      markup: input('native.HTML', {
        type: 'object',
        properties: { text: { type: 'string' } },
        required: ['text'],
      }),
    });
    expect(field!.kind).toBe('prose');
  });

  it('maps a native.Page input to a DOCUMENT field with the document accept hint', () => {
    const [field] = buildRunFields({
      page: input('native.Page', { type: 'object', properties: { url: { type: 'string' } } }),
    });
    expect(field).toMatchObject({ kind: 'document', accept: 'PDF, DOCX, TXT' });
  });
});

describe('input-format taxonomy: Date and HTML deflate through the CUSTOM branch', () => {
  it('deflates native.Text to a bare string (the contrast case)', () => {
    expect(deflateInput({ text: 'hello' }, 'native.Text')).toBe('hello');
  });

  it('deflates native.Date to a { concept, content } envelope - NOT a bare value', () => {
    // `Date` is absent from input-format's TEXT_CONCEPTS, so the custom-concept
    // wrapper branch runs. This is the wire shape persisted today.
    expect(deflateInput({ date: '2026-07-06' }, 'native.Date')).toEqual({
      concept: 'native.Date',
      content: { date: '2026-07-06' },
    });
  });

  it('deflates native.HTML to a { concept, content } envelope', () => {
    expect(deflateInput({ text: '<p>hi</p>' }, 'native.HTML')).toEqual({
      concept: 'native.HTML',
      content: { text: '<p>hi</p>' },
    });
  });

  it('inflates a native.Date string as a PASSTHROUGH - not a { text } wrapper', () => {
    // The custom branch only unwraps envelopes; a bare string stays bare, where
    // a native.Text string would inflate to `{ text: ... }`.
    expect(inflateInput('2026-07-06', 'native.Date')).toBe('2026-07-06');
    expect(inflateInput('hello', 'native.Text')).toEqual({ text: 'hello' });
  });

  it('inflates a wrapped native.Date envelope to its content', () => {
    expect(
      inflateInput({ concept: 'native.Date', content: { date: '2026-07-06' } }, 'native.Date'),
    ).toEqual({ date: '2026-07-06' });
  });

  it('deflates native.Page like a document - bare URL out of the full shape', () => {
    expect(deflateInput({ url: 'page.html', title: 'p' }, 'native.Page')).toBe('page.html');
  });
});

describe('run-values taxonomy: Date and HTML wrap as { text }', () => {
  it('wraps a prose value for a native.Date field in the pydantic text wrapper', () => {
    // run-values' TEXT_WRAPPER_CONCEPTS INCLUDES Date - so the prose field the
    // mapper produced for native.Date wraps its string as `{ text }`.
    const fields = buildRunFields({ when: input('native.Date', DATE_CONTENT_SCHEMA) });
    expect(rjsfDataFromRunValues({ when: '2026-07-06' }, fields)).toEqual({
      when: { text: '2026-07-06' },
    });
  });

  it('composite wire shape for native.Date today: { concept, content: { text } }', () => {
    // The full chain (mapper → text wrap → custom-branch deflate). Recorded as
    // the M1 discrepancy: a Date deflates to an envelope holding a TEXT wrapper,
    // not to DateContent and not to a bare string.
    const fields = buildRunFields({ when: input('native.Date', DATE_CONTENT_SCHEMA) });
    const store = storeInputDataFromRunValues({ when: '2026-07-06' }, fields, {
      when: input('native.Date', DATE_CONTENT_SCHEMA),
    });
    expect(store).toEqual({ when: { concept: 'native.Date', content: { text: '2026-07-06' } } });
  });

  it('keeps a child string property BARE - only concept-carrying fields wrap', () => {
    const fields = buildRunFields({
      card: input('demo.Card', {
        type: 'object',
        properties: { label: { type: 'string' } },
        required: ['label'],
      }),
    });
    expect(rjsfDataFromRunValues({ card: { label: 'hi' } }, fields)).toEqual({
      card: { label: 'hi' },
    });
  });
});
