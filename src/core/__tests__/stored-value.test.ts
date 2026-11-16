/**
 * A text held in storage, through the kernel.
 *
 * `Text`, `Markdown`, `Html` and `JSON` hold their value inline or a reference
 * to it (`{url, size, mime_type, preview}`), and the schemas say so: the value
 * property is optional and four members stand beside it. That took away the one
 * property `TextContent` used to declare, which is what the kernel unwrapped a
 * text by, so every text input and output lost its wrapper at once. The
 * fixtures here are the engine's own projection of a bundle that declares each
 * of these natives (`./stored-natives-fixtures`), so the schemas are the ones a
 * host receives.
 */
import { describe, expect, it, vi } from 'vitest';
import type { InputFormField } from 'mthds/protocol';

import { buildResultField, buildRunFields } from '../derive';
import type { ListRunField, ObjectRunField, RunField } from '../descriptor';
import { gateRunInputs } from '../gate';
import { computeReadiness, fieldFilled } from '../readiness';
import {
  inlineStoredValue,
  loadStoredValues,
  readStoredReference,
  storedValueKeyOf,
} from '../stored-value';
import {
  apiInputsFromRunValues,
  loadedRunValue,
  rjsfDataFromRunValues,
  runValuesFromInputs,
  runValuesFromStore,
  storeInputDataFromRunValues,
} from '../values';
import { deflateInput, inflateInput } from '../wire-format';
import {
  STORED_NATIVES_CONTRACT,
  STORED_NATIVES_INPUT_FORM,
  STORED_NATIVES_OUTPUT_FIELD,
} from './stored-natives-fixtures';

const TEXT_REF = {
  url: 'pipelex-storage://runs/r1/generated/abc/value.txt',
  size: 48213,
  mime_type: 'text/plain',
  preview: 'Page 1. The parties agree',
};
const HTML_REF = {
  url: 'pipelex-storage://runs/r1/generated/def/value.html',
  size: 9000,
  mime_type: 'text/html',
  preview: '<h1>Report</h1>',
  css_class: 'report',
};
const JSON_REF = {
  url: 'pipelex-storage://runs/r1/generated/ghi/value.json',
  size: 5000,
  mime_type: 'application/json',
  preview: '{"a": 1',
};

const fields = () => buildRunFields(STORED_NATIVES_INPUT_FORM, STORED_NATIVES_CONTRACT.inputs);
const fieldNamed = (name: string): RunField => {
  const found = fields().find((field) => field.name === name);
  if (!found) throw new Error(`no field ${name}`);
  return found;
};

describe('a text is unwrapped by its concept', () => {
  it('gives a native text input and a concept refining one the `text` key', () => {
    // `markdown_in` is `native.Markdown`; `memo_in` refines `native.Text`.
    expect(fieldNamed('markdown_in')).toMatchObject({ kind: 'prose', contentKey: 'text' });
    expect(fieldNamed('memo_in')).toMatchObject({ kind: 'prose', contentKey: 'text' });
  });

  it('leaves an HTML page and a JSON value structures, with no key', () => {
    expect(fieldNamed('webpage_in')).toMatchObject({ kind: 'object' });
    expect(fieldNamed('webpage_in').contentKey).toBeUndefined();
    expect(fieldNamed('payload_in').contentKey).toBeUndefined();
  });

  it('gives a native text output the `text` key', () => {
    const field = buildResultField(
      { field: STORED_NATIVES_OUTPUT_FIELD },
      STORED_NATIVES_CONTRACT.output.json_schema,
    );
    expect(field).toMatchObject({ kind: 'prose', contentKey: 'text' });
  });

  it('gives each text of a plural output the `text` key', () => {
    const textModel = STORED_NATIVES_CONTRACT.output.json_schema;
    const field = buildResultField(
      {
        field: {
          kind: 'list',
          name: 'output',
          concept_ref: 'native.Text',
          required: true,
          item: { kind: 'prose', concept_ref: 'native.Text', required: true },
        } as unknown as InputFormField,
      },
      {
        type: 'object',
        $defs: { TextContent: textModel },
        properties: {
          items: { type: 'array', items: { $ref: '#/$defs/TextContent' } },
        },
        required: ['items'],
      },
    ) as ListRunField;
    expect(field.contentKey).toBe('items');
    expect(field.item).toMatchObject({ kind: 'prose', contentKey: 'text' });
  });

  it('gives no key to a member the schema states as a bare string, whatever its concept', () => {
    const field = buildResultField(
      {
        field: {
          kind: 'object',
          name: 'output',
          concept_ref: 'demo.Memo',
          required: true,
          fields: [{ kind: 'text', name: 'body', concept_ref: 'native.Text', required: true }],
        } as unknown as InputFormField,
      },
      { type: 'object', properties: { body: { type: 'string' } } },
    ) as ObjectRunField;
    expect(field.fields[0]?.contentKey).toBeUndefined();
  });
});

describe('storedValueKeyOf', () => {
  it('names the value property of each native and of a concept refining one', () => {
    expect(storedValueKeyOf({ conceptRef: 'native.Text' })).toBe('text');
    expect(storedValueKeyOf({ conceptRef: 'native.Markdown' })).toBe('text');
    expect(storedValueKeyOf({ conceptRef: 'native.Html' })).toBe('inner_html');
    expect(storedValueKeyOf({ conceptRef: 'native.JSON' })).toBe('json_obj');
    expect(storedValueKeyOf({ conceptRef: 'demo.Page', refines: ['native.Html'] })).toBe(
      'inner_html',
    );
  });

  it('answers nothing for another concept, and for a list of texts', () => {
    expect(storedValueKeyOf({ conceptRef: 'native.Number' })).toBeUndefined();
    expect(storedValueKeyOf({ conceptRef: 'native.Document' })).toBeUndefined();
    expect(storedValueKeyOf({ kind: 'list', conceptRef: 'native.Text' })).toBeUndefined();
  });
});

describe('readStoredReference', () => {
  const text = { kind: 'prose', conceptRef: 'native.Text' };

  it('reads the reference of a stored value', () => {
    expect(readStoredReference(text, TEXT_REF)).toEqual({
      url: TEXT_REF.url,
      size: 48213,
      mimeType: 'text/plain',
      preview: 'Page 1. The parties agree',
    });
  });

  it('reads an inline value as no reference', () => {
    expect(readStoredReference(text, { text: 'hello' })).toBeUndefined();
    expect(readStoredReference(text, 'hello')).toBeUndefined();
    // Both forms at once is not a form; the inline one is what a reader can show.
    expect(readStoredReference(text, { ...TEXT_REF, text: 'hello' })).toBeUndefined();
  });

  it('needs a url, and a concept whose value may be stored', () => {
    expect(readStoredReference(text, { ...TEXT_REF, url: '' })).toBeUndefined();
    expect(readStoredReference({ conceptRef: 'native.Document' }, TEXT_REF)).toBeUndefined();
  });

  it('keeps only the facts it can read', () => {
    expect(readStoredReference(text, { url: TEXT_REF.url, size: 'big' })).toEqual({
      url: TEXT_REF.url,
    });
  });
});

describe('inlineStoredValue', () => {
  it('puts a loaded text under the concept property, without the reference', () => {
    expect(inlineStoredValue({ conceptRef: 'native.Text' }, TEXT_REF, 'All of it')).toEqual({
      text: 'All of it',
    });
  });

  it('keeps an HTML page class', () => {
    expect(inlineStoredValue({ conceptRef: 'native.Html' }, HTML_REF, '<h1>Report</h1>')).toEqual({
      inner_html: '<h1>Report</h1>',
      css_class: 'report',
    });
  });

  it('parses a JSON value, which must be an object', () => {
    const json = { conceptRef: 'native.JSON' };
    expect(inlineStoredValue(json, JSON_REF, '{"a": 1}')).toEqual({ json_obj: { a: 1 } });
    expect(inlineStoredValue(json, JSON_REF, '[1, 2]')).toBeUndefined();
    expect(inlineStoredValue(json, JSON_REF, '{"a": ')).toBeUndefined();
  });
});

describe('loadStoredValues', () => {
  const memo: RunField = { kind: 'prose', name: 'memo', conceptRef: 'native.Text', required: true };

  it('loads every stored value a structure and a list hold, each url once', async () => {
    const field: ObjectRunField = {
      kind: 'object',
      name: 'output',
      conceptRef: 'demo.Dossier',
      required: true,
      fields: [
        memo,
        {
          kind: 'list',
          name: 'notes',
          conceptRef: 'native.Text',
          required: true,
          item: { ...memo, name: 'notes' },
        },
        { kind: 'text', name: 'title', required: true },
      ],
    };
    const load = vi.fn((url: string) => Promise.resolve(`text of ${url}`));
    const result = await loadStoredValues(
      field,
      { memo: TEXT_REF, notes: [TEXT_REF, { text: 'inline' }], title: 'Dossier' },
      load,
    );
    expect(result).toEqual({
      unloaded: 0,
      value: {
        memo: { text: `text of ${TEXT_REF.url}` },
        notes: [{ text: `text of ${TEXT_REF.url}` }, { text: 'inline' }],
        title: 'Dossier',
      },
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('opens a plural result envelope by its key', async () => {
    const field: ListRunField = {
      kind: 'list',
      name: 'output',
      conceptRef: 'native.Text',
      required: true,
      contentKey: 'items',
      item: memo,
    };
    const result = await loadStoredValues(field, { items: [TEXT_REF] }, () =>
      Promise.resolve('loaded'),
    );
    expect(result.value).toEqual({ items: [{ text: 'loaded' }] });
  });

  it('loads the members of a structure together, not one after another', async () => {
    const field: ObjectRunField = {
      kind: 'object',
      name: 'output',
      conceptRef: 'demo.Pair',
      required: true,
      fields: [memo, { ...memo, name: 'other' }],
    };
    const other = { ...TEXT_REF, url: 'pipelex-storage://runs/r1/generated/xyz/value.txt' };
    const answers: Array<(text: string) => void> = [];
    const load = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          answers.push(resolve);
        }),
    );
    const pending = loadStoredValues(field, { memo: TEXT_REF, other }, load);
    // Both asked before either answers.
    await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    answers.forEach((answer, index) => answer(`text ${index}`));
    const result = await pending;
    expect(result.unloaded).toBe(0);
    expect(result.value).toEqual({ memo: { text: 'text 0' }, other: { text: 'text 1' } });
  });

  it('keeps a reference it cannot load, and counts it', async () => {
    const result = await loadStoredValues(memo, TEXT_REF, () => Promise.reject(new Error('403')));
    expect(result).toEqual({ value: TEXT_REF, unloaded: 1 });
    const thrown = await loadStoredValues(memo, TEXT_REF, () => {
      throw new Error('no storage');
    });
    expect(thrown).toEqual({ value: TEXT_REF, unloaded: 1 });
  });
});

describe('a stored input', () => {
  const inputs = {
    markdown_in: { concept: 'native.Markdown', content: TEXT_REF },
    memo_in: { concept: 'input_semantics_scaffold.Memo', content: { text: 'Short memo' } },
    webpage_in: { concept: 'input_semantics_scaffold.Webpage', content: HTML_REF },
    payload_in: { concept: 'input_semantics_scaffold.Payload', content: JSON_REF },
  };

  it('stays its reference in the form, and goes back to the run as it came', () => {
    const values = runValuesFromInputs(inputs, fields());
    expect(values.markdown_in).toEqual(TEXT_REF);
    expect(values.memo_in).toBe('Short memo');
    expect(values.webpage_in).toEqual(HTML_REF);
    expect(values.payload_in).toEqual(JSON_REF);
    expect(apiInputsFromRunValues(values, fields(), STORED_NATIVES_CONTRACT.inputs)).toEqual({
      markdown_in: { concept: 'native.Markdown', content: TEXT_REF },
      memo_in: { concept: 'input_semantics_scaffold.Memo', content: { text: 'Short memo' } },
      webpage_in: { concept: 'input_semantics_scaffold.Webpage', content: HTML_REF },
      payload_in: { concept: 'input_semantics_scaffold.Payload', content: JSON_REF },
    });
  });

  it('wraps a typed text under the key its concept names', () => {
    const values = { ...runValuesFromInputs(inputs, fields()), memo_in: 'Typed' };
    expect(rjsfDataFromRunValues(values, fields()).memo_in).toEqual({ text: 'Typed' });
  });

  it('is filled, and passes the gate', () => {
    const values = runValuesFromInputs(inputs, fields());
    expect(fieldFilled(fieldNamed('webpage_in'), HTML_REF)).toBe(true);
    expect(computeReadiness(fields(), values).missing).toEqual([]);
    expect(gateRunInputs(STORED_NATIVES_CONTRACT, rjsfDataFromRunValues(values, fields()))).toEqual(
      expect.objectContaining({ ok: true }),
    );
  });

  it('survives the store round trip', () => {
    const values = runValuesFromInputs(inputs, fields());
    const stored = storeInputDataFromRunValues(values, fields(), STORED_NATIVES_CONTRACT.inputs);
    const back = runValuesFromStore(stored, fields(), STORED_NATIVES_CONTRACT.inputs);
    expect(back.markdown_in).toEqual(TEXT_REF);
    expect(back.webpage_in).toEqual(HTML_REF);
  });

  it('becomes the control value once its text is loaded', () => {
    expect(loadedRunValue(fieldNamed('markdown_in'), TEXT_REF, '# All of it')).toBe('# All of it');
    expect(loadedRunValue(fieldNamed('webpage_in'), HTML_REF, '<p>x</p>')).toEqual({
      inner_html: '<p>x</p>',
      css_class: 'report',
    });
    expect(loadedRunValue(fieldNamed('payload_in'), JSON_REF, '{"a": 1}')).toEqual({
      json_obj: JSON.stringify({ a: 1 }, null, 2),
    });
    expect(loadedRunValue(fieldNamed('payload_in'), JSON_REF, 'nope')).toBeUndefined();
    expect(loadedRunValue(fieldNamed('markdown_in'), { text: 'inline' }, 'x')).toBeUndefined();
  });
});

describe('the simplified wire form of a stored native.Text', () => {
  it('keeps the reference when inflating', () => {
    expect(inflateInput(TEXT_REF, 'native.Text')).toEqual(TEXT_REF);
    expect(inflateInput({ concept: 'native.Text', content: TEXT_REF }, 'native.Text')).toEqual(
      TEXT_REF,
    );
    expect(inflateInput([TEXT_REF, 'short'], 'native.Text[]')).toEqual([
      TEXT_REF,
      { text: 'short' },
    ]);
  });

  it('deflates to the explicit form, never to "[object Object]"', () => {
    expect(deflateInput(TEXT_REF, 'native.Text')).toEqual({
      concept: 'native.Text',
      content: TEXT_REF,
    });
    expect(deflateInput({ text: 'short' }, 'native.Text')).toBe('short');
  });
});

/**
 * A list holding a stored text goes as one `{ concept, content: [...] }`
 * envelope. The runtime reads a bare list of a text concept as one string per
 * item, and refuses a reference (or a per-item `{ concept, content }`) inside
 * it; the list-level envelope hands each item to the concept's content model,
 * which takes either form. The same holds for `Markdown`, `Html` and `JSON`
 * lists, whose items have no bare form at all.
 */
describe('the wire form of a list holding a stored text', () => {
  it('sends a text list holding a reference as one envelope', () => {
    expect(deflateInput([TEXT_REF, { text: 'short' }], 'native.Text[]')).toEqual({
      concept: 'native.Text',
      content: [TEXT_REF, { text: 'short' }],
    });
    expect(deflateInput(['short', TEXT_REF], 'Text[]')).toEqual({
      concept: 'Text',
      content: [{ text: 'short' }, TEXT_REF],
    });
  });

  it('keeps a text list of inline texts the bare string list it was', () => {
    expect(deflateInput([{ text: 'a' }, { text: 'b' }], 'native.Text[]')).toEqual(['a', 'b']);
    expect(deflateInput([], 'native.Text[]')).toEqual([]);
  });

  it('sends a Markdown, Html or JSON list as one envelope, stored or inline', () => {
    expect(deflateInput([TEXT_REF], 'native.Markdown[]')).toEqual({
      concept: 'native.Markdown',
      content: [TEXT_REF],
    });
    expect(deflateInput([{ text: '# a' }, TEXT_REF], 'Markdown[]')).toEqual({
      concept: 'Markdown',
      content: [{ text: '# a' }, TEXT_REF],
    });
    expect(deflateInput([{ inner_html: '<p>x</p>' }, HTML_REF], 'native.Html[]')).toEqual({
      concept: 'native.Html',
      content: [{ inner_html: '<p>x</p>' }, HTML_REF],
    });
    expect(deflateInput([{ json_obj: { a: 1 } }, JSON_REF], 'native.JSON[]')).toEqual({
      concept: 'native.JSON',
      content: [{ json_obj: { a: 1 } }, JSON_REF],
    });
    // An item already wrapped (a form seeded with a raw stored value) is
    // unwrapped, so the envelope holds content, never a nested envelope.
    expect(
      deflateInput([{ concept: 'native.Markdown', content: { text: 'x' } }], 'native.Markdown[]'),
    ).toEqual({ concept: 'native.Markdown', content: [{ text: 'x' }] });
  });

  it('sends an empty Markdown list bare, as every empty plural goes', () => {
    // The runtime's factory types an enveloped list by its first item, and
    // refuses an empty one; the bare `[]` keeps the declared concept.
    expect(deflateInput([], 'native.Markdown[]')).toEqual([]);
  });

  it('inflates the envelope back to the items it holds', () => {
    expect(
      inflateInput(
        { concept: 'native.Text', content: [TEXT_REF, { text: 'short' }] },
        'native.Text[]',
      ),
    ).toEqual([TEXT_REF, { text: 'short' }]);
    expect(
      inflateInput({ concept: 'native.Markdown', content: [TEXT_REF] }, 'native.Markdown[]'),
    ).toEqual([TEXT_REF]);
  });

  describe('through the store, for a declared `Text[]` input', () => {
    // A plural input of `native.Text`, whose item schema is the engine's own
    // `native.Text` content model (the fixture's output), as a `Text[]` slot
    // states it.
    const notesSchema = {
      concept_ref: 'native.Text',
      presence: 'plain',
      multiplicity: 'variable',
      item_count: null,
      json_schema: { type: 'array', items: STORED_NATIVES_CONTRACT.output.json_schema },
    } as const;
    const listInputs = {
      notes_in: notesSchema,
    } as unknown as typeof STORED_NATIVES_CONTRACT.inputs;
    const listFields = () =>
      buildRunFields(
        {
          fields: [
            {
              kind: 'list',
              name: 'notes_in',
              concept_ref: 'native.Text',
              required: true,
              presence: 'plain',
              gating: false,
              item: { kind: 'prose', concept_ref: 'native.Text', required: true },
            },
          ],
        } as unknown as typeof STORED_NATIVES_INPUT_FORM,
        listInputs,
      );

    it('stores the list as one envelope, and reads it back as it was', () => {
      const values = { notes_in: ['A short note', TEXT_REF] };
      const stored = storeInputDataFromRunValues(values, listFields(), listInputs);
      expect(stored.notes_in).toEqual({
        concept: 'native.Text',
        content: [{ text: 'A short note' }, TEXT_REF],
      });
      expect(runValuesFromStore(stored, listFields(), listInputs).notes_in).toEqual([
        'A short note',
        TEXT_REF,
      ]);
    });

    it('sends the run the same list-level envelope', () => {
      const values = { notes_in: ['A short note', TEXT_REF] };
      expect(apiInputsFromRunValues(values, listFields(), listInputs).notes_in).toEqual({
        concept: 'native.Text',
        content: [{ text: 'A short note' }, TEXT_REF],
      });
    });
  });
});
