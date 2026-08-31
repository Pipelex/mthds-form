/**
 * The native-concept drift, RESOLVED - what the characterization used to pin.
 *
 * Before the derivation swap this file pinned three drifted taxonomies exactly
 * as extracted: a `native.Date` input rendered as prose, wrapped as `{text}`,
 * and deflated to `{concept, content: {text}}`; `native.Html` worked only by a
 * spelling accident. The swap deleted the render taxonomy - the KIND now comes
 * from the wire descriptor, which since MTHDS v0.9.0 states `native.Date` and
 * `native.Html` as `object` nodes over their real content models - so the
 * composite behaviours below are the RESOLVED ones, wire-visible change
 * included. docs/derivation-swap.md records the differences and why each one
 * is the standard's answer.
 *
 * What did NOT change: the wire format's deflate/inflate taxonomy (which
 * concepts use a simplified store form). `Date` and `Html` still travel
 * through the structured `{concept, content}` branch - correct all along; what
 * was wrong was the `{text}` the render path used to put inside it.
 */
import { describe, expect, it } from 'vitest';
import {
  buildRunFields,
  deflateInput,
  inflateInput,
  rjsfDataFromRunValues,
  storeInputDataFromRunValues,
} from '..';
import type { InputFormTopLevelField } from 'mthds/protocol';
import type { PipeInputContract } from '..';
import { descriptorOf, PLAIN_SINGLE, WIRE_PLAIN } from './contract-fixtures';

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
  return { ...PLAIN_SINGLE, concept_ref, json_schema };
}

/** The wire node the engine emits for a `native.Date` slot since v0.9.0. */
const DATE_NODE: InputFormTopLevelField = {
  ...WIRE_PLAIN,
  kind: 'object',
  name: 'when',
  concept_ref: 'native.Date',
  fields: [
    { kind: 'date', name: 'date', datetime: false, required: true },
    { kind: 'text', name: 'time', format: 'time', required: false },
  ],
};

describe('the render path follows the wire: Date and Html are their structures', () => {
  it('maps a native.Date input to an OBJECT node with date and time children', () => {
    // The drift this replaces: `native.Date` sat in the render taxonomy's TEXT
    // set and mapped to prose. The wire states the pinned definition's
    // structure, so the user gets a date picker inside a card - not a textarea.
    const [field] = buildRunFields(descriptorOf(DATE_NODE), {
      when: input('native.Date', DATE_CONTENT_SCHEMA),
    });
    expect(field!.kind).toBe('object');
    const date = field!.kind === 'object' ? field!.fields[0] : undefined;
    expect(date).toMatchObject({ kind: 'date', datetime: false });
  });

  it('maps a native.Html input to an OBJECT node over HtmlContent', () => {
    // This one RENDERED correctly before, but only because the deleted set
    // spelled the code `HTML` while the language spells it `Html`, so the
    // concept matched nothing and fell through to the object dispatch. The
    // wire now states the same answer on purpose.
    const [field] = buildRunFields(
      descriptorOf({
        ...WIRE_PLAIN,
        kind: 'object',
        name: 'markup',
        concept_ref: 'native.Html',
        fields: [
          { kind: 'prose', name: 'inner_html', required: true },
          { kind: 'text', name: 'css_class', required: false },
        ],
      }),
      {
        markup: input('native.Html', {
          type: 'object',
          properties: { inner_html: { type: 'string' }, css_class: { type: 'string' } },
          required: ['inner_html'],
        }),
      },
    );
    expect(field!.kind).toBe('object');
  });

  it('maps a native.Page input to a DOCUMENT field, as the wire states', () => {
    const [field] = buildRunFields(
      descriptorOf({
        ...WIRE_PLAIN,
        kind: 'document',
        name: 'page',
        concept_ref: 'native.Page',
        refines: ['native.Document'],
      }),
      { page: input('native.Page', { type: 'object', properties: { url: { type: 'string' } } }) },
    );
    // `accept` comes from `acceptLabelForKind`, whose table was measured against
    // the runtime rather than copied off an enum. Updating this expectation is
    // right where updating a WIRE expectation would not be: `accept` is a
    // renderer affordance the descriptor never states, so this pins a
    // presentation default, not the standard.
    expect(field).toMatchObject({ kind: 'document', accept: 'PDF, JPG, PNG' });
  });
});

describe('the wire-format taxonomy is unchanged: Date and Html use the structured branch', () => {
  it('deflates native.Text to a bare string (the contrast case)', () => {
    expect(deflateInput({ text: 'hello' }, 'native.Text')).toBe('hello');
  });

  it('deflates native.Date to a { concept, content } envelope - NOT a bare value', () => {
    // Correct before AND after: a structured concept wraps. What changed is
    // upstream - the content is now DateContent, not a `{text}` wrapper.
    expect(deflateInput({ date: '2026-07-06' }, 'native.Date')).toEqual({
      concept: 'native.Date',
      content: { date: '2026-07-06' },
    });
  });

  it('deflates native.Html to a { concept, content } envelope', () => {
    expect(deflateInput({ inner_html: '<p>hi</p>' }, 'native.Html')).toEqual({
      concept: 'native.Html',
      content: { inner_html: '<p>hi</p>' },
    });
  });

  it('inflates a native.Date string as a PASSTHROUGH - not a { text } wrapper', () => {
    // The structured branch only unwraps envelopes; a bare string stays bare,
    // where a native.Text string inflates to `{ text: ... }`.
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

describe('the composite wire shape for native.Date is DateContent, end to end', () => {
  const CONTRACT = { when: input('native.Date', DATE_CONTENT_SCHEMA) };
  const FIELDS = buildRunFields(descriptorOf(DATE_NODE), CONTRACT);

  it('bridges the structured value without inventing a { text } wrapper', () => {
    // The resolved drift: the object node's children travel as themselves. The
    // untouched optional `time` rides as the empty string a text control
    // leaves, exactly as any structure's blank optional child does - the
    // gate's prune drops it before ajv and before the run payload.
    expect(rjsfDataFromRunValues({ when: { date: '2026-07-06' } }, FIELDS)).toEqual({
      when: { date: '2026-07-06', time: '' },
    });
  });

  it('persists { concept, content: DateContent } - the recorded M1 discrepancy, closed', () => {
    // Was: `{ concept: "native.Date", content: { text: "2026-07-06" } }` - a
    // payload no schema declared, consistent only with itself. The store now
    // holds the shape `DateContent` states.
    const store = storeInputDataFromRunValues(
      { when: { date: '2026-07-06', time: '' } },
      FIELDS,
      CONTRACT,
    );
    expect(store).toEqual({
      when: { concept: 'native.Date', content: { date: '2026-07-06', time: '' } },
    });
  });

  it('keeps a child string property BARE - only concept-carrying fields wrap', () => {
    const fields = buildRunFields(
      descriptorOf({
        ...WIRE_PLAIN,
        kind: 'object',
        name: 'card',
        concept_ref: 'demo.Card',
        fields: [{ kind: 'text', name: 'label', required: true }],
      }),
      {
        card: input('demo.Card', {
          type: 'object',
          properties: { label: { type: 'string' } },
          required: ['label'],
        }),
      },
    );
    expect(rjsfDataFromRunValues({ card: { label: 'hi' } }, fields)).toEqual({
      card: { label: 'hi' },
    });
  });
});
