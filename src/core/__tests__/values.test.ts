import { describe, expect, it } from 'vitest';
import {
  buildRunFields,
  apiInputsFromRunValues,
  fieldsForContract,
  inputDataFromWorkingMemory,
  outputsFromPipeOutput,
  rjsfDataFromRunValues,
  runValuesFromStore,
  setValueAtPath,
  storeInputDataFromRunValues,
} from '..';
import type { InputFormTopLevelField } from 'mthds/protocol';
import type { PipeInputContract } from '..';
import {
  descriptorOf,
  OPTIONAL_SINGLE,
  PLAIN_SINGLE,
  PLAIN_VARIABLE,
  SINGLE_OUTPUT,
  WIRE_OPTIONAL,
  WIRE_PLAIN,
  WIRE_VARIABLE,
} from './contract-fixtures';

// Realistic contract: a Text concept (TextContent {text}), a Document
// (DocumentContent {url}), and a custom structured concept. Beside it, the wire
// descriptor the engine emits for the same pipe - hand-authored, as everywhere
// in these suites.
const INPUTS: Record<string, PipeInputContract> = {
  brief: {
    ...PLAIN_SINGLE,
    concept_ref: 'native.Text',
    json_schema: { type: 'object', properties: { text: { type: 'string' } } },
  },
  invoice: {
    ...PLAIN_SINGLE,
    concept_ref: 'native.Document',
    json_schema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'pipelex storage url' } },
    },
  },
  applicant: {
    ...PLAIN_SINGLE,
    concept_ref: 'demo.Applicant',
    json_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, age: { type: 'integer' } },
      required: ['name'],
    },
  },
};

const BRIEF_NODE: InputFormTopLevelField = {
  ...WIRE_PLAIN,
  kind: 'prose',
  name: 'brief',
  concept_ref: 'native.Text',
};

const INPUTS_DESCRIPTOR = descriptorOf(
  BRIEF_NODE,
  { ...WIRE_PLAIN, kind: 'document', name: 'invoice', concept_ref: 'native.Document' },
  {
    ...WIRE_PLAIN,
    kind: 'object',
    name: 'applicant',
    concept_ref: 'demo.Applicant',
    fields: [
      { kind: 'text', name: 'name', required: true },
      { kind: 'number', name: 'age', integer: true, required: false },
    ],
  },
);

const fields = buildRunFields(INPUTS_DESCRIPTOR, INPUTS);

describe('buildRunFields wire mapping', () => {
  it('maps a native.Text slot to the prose field the wire states', () => {
    expect(fields.find((f) => f.name === 'brief')!.kind).toBe('prose');
  });

  it('maps a native.Document slot to a document field', () => {
    expect(fields.find((f) => f.name === 'invoice')!.kind).toBe('document');
  });

  it('maps a custom concept to an object field with children', () => {
    const applicant = fields.find((f) => f.name === 'applicant')!;
    expect(applicant.kind).toBe('object');
  });
});

describe('store ↔ run values round-trip', () => {
  it('reads simplified store inputData into friendly field values', () => {
    const values = runValuesFromStore(
      { brief: 'hello', invoice: 'file.pdf', applicant: { name: 'Ada', age: 30 } },
      fields,
      INPUTS,
    );
    expect(values.brief).toBe('hello'); // text → plain string
    expect(values.invoice).toMatchObject({ url: 'file.pdf' }); // document → { url }
    expect(values.applicant).toMatchObject({ name: 'Ada', age: 30 });
  });

  it('writes friendly values back to simplified store format', () => {
    const stored = storeInputDataFromRunValues(
      { brief: 'hello', invoice: { url: 'file.pdf' }, applicant: { name: 'Ada', age: 30 } },
      fields,
      INPUTS,
    );
    expect(stored.brief).toBe('hello');
    expect(stored.invoice).toBe('file.pdf'); // deflated to url string
    // Child string properties of a custom concept stay plain strings - they
    // must NOT get the `{ text }` concept wrapper.
    expect(stored.applicant).toEqual({
      concept: 'demo.Applicant',
      content: { name: 'Ada', age: 30 },
    });
  });

  it('builds the { concept, content } run payload in full form shape', () => {
    const api = apiInputsFromRunValues(
      { brief: 'hello', invoice: { url: 'file.pdf' }, applicant: { name: 'Ada', age: 30 } },
      fields,
      INPUTS,
    );
    expect(api.brief).toEqual({ concept: 'native.Text', content: { text: 'hello' } });
    expect(api.invoice).toEqual({ concept: 'native.Document', content: { url: 'file.pdf' } });
    expect(api.applicant).toEqual({
      concept: 'demo.Applicant',
      content: { name: 'Ada', age: 30 },
    });
  });
});

describe('custom concept refining native.Text (wrapper schema, e.g. poem_html.Poem)', () => {
  // The wire states a refining concept as PROSE - the engine knows it IS a
  // text - and the co-walk finds the TextContent wrapper's single `text`
  // property, so the field carries `contentKey` and the runner value is the
  // bare string. (Before the derivation swap this mapped to an object card
  // with a `text` child; the STORED shape below is unchanged.)
  const POEM_INPUTS: Record<string, PipeInputContract> = {
    poem: {
      ...PLAIN_SINGLE,
      concept_ref: 'poem_html.Poem',
      json_schema: {
        type: 'object',
        properties: { text: { type: 'string', title: 'Text' } },
      },
    },
  };
  const poemFields = buildRunFields(
    descriptorOf({
      ...WIRE_PLAIN,
      kind: 'prose',
      name: 'poem',
      concept_ref: 'poem_html.Poem',
      refines: ['native.Text'],
    }),
    POEM_INPUTS,
  );

  it('stores the wrapper shape once - never double-wrapped { text: { text } }', () => {
    const stored = storeInputDataFromRunValues(
      { poem: 'Whispers of the Morning Tide' },
      poemFields,
      POEM_INPUTS,
    );
    expect(stored.poem).toEqual({
      concept: 'poem_html.Poem',
      content: { text: 'Whispers of the Morning Tide' },
    });
  });

  it('round-trips store → values → store byte-identically', () => {
    const stored = storeInputDataFromRunValues({ poem: 'Whispers' }, poemFields, POEM_INPUTS);
    const values = runValuesFromStore(stored, poemFields, POEM_INPUTS);
    expect(values.poem).toBe('Whispers');
    expect(storeInputDataFromRunValues(values, poemFields, POEM_INPUTS)).toEqual(stored);
  });

  it('self-heals legacy double-wrapped store data on read', () => {
    // Data written by the buggy bridge: content.text is a nested wrapper.
    const legacy = {
      poem: { concept: 'poem_html.Poem', content: { text: { text: 'Whispers' } } },
    };
    const values = runValuesFromStore(legacy, poemFields, POEM_INPUTS);
    expect(values.poem).toBe('Whispers');
  });
});

describe('outputsFromPipeOutput', () => {
  it('splits last entry as main and excludes inputs', () => {
    const pipeOutput = {
      working_memory: {
        root: {
          invoice: { concept: 'native.Document', content: { url: 'file.pdf' } },
          raw_text: { concept: 'native.Text', content: 'INVOICE #1' },
          summary: { concept: { concept_code: 'demo.Summary' }, content: 'All good' },
        },
      },
    };
    const result = outputsFromPipeOutput(pipeOutput, ['invoice'])!;
    expect(result.main.key).toBe('summary');
    expect(result.main.conceptRef).toBe('demo.Summary');
    expect(result.main.value).toBe('All good');
    expect(result.intermediates.map((e) => e.key)).toEqual(['raw_text']);
  });

  it('uses the main_stuff alias for the main output, not the last entry', () => {
    const pipeOutput = {
      working_memory: {
        aliases: { main_stuff: 'screening_report' },
        root: {
          screening_report: { concept: 'native.Html', content: { html: '<h1/>' } },
          debug_log: { concept: 'native.Text', content: 'trace' },
        },
      },
    };
    const result = outputsFromPipeOutput(pipeOutput, [])!;
    expect(result.main.key).toBe('screening_report'); // the real name, though not last
    expect(result.main.conceptRef).toBe('native.Html');
    expect(result.intermediates.map((e) => e.key)).toEqual(['debug_log']);
  });

  it('returns null when there is no working-memory root', () => {
    expect(outputsFromPipeOutput(null, [])).toBeNull();
    expect(outputsFromPipeOutput({ foo: 1 }, [])).toBeNull();
  });
});

describe('inputDataFromWorkingMemory', () => {
  // A run's working memory: inputs + outputs, keyed by variable name, each a
  // stuff with `{ concept, content }` (the shape a host's working-memory JSON
  // relays).
  const workingMemory = {
    root: {
      brief: { concept: 'native.Text', content: { text: 'hello' } },
      invoice: { concept: 'native.Document', content: { url: 'file.pdf' } },
      applicant: { concept: 'demo.Applicant', content: { name: 'Ada', age: 30 } },
      // A produced output - NOT an input, must be ignored.
      report: { concept: 'demo.Report', content: { verdict: 'ok' } },
    },
    aliases: { main_stuff: 'report' },
  };

  it('recovers the run inputs into simplified store inputData (outputs excluded)', () => {
    const restored = inputDataFromWorkingMemory(workingMemory, INPUTS)!;
    expect(restored.brief).toBe('hello'); // text → plain string
    expect(restored.invoice).toBe('file.pdf'); // document → url string
    expect(restored.applicant).toMatchObject({
      concept: 'demo.Applicant',
      content: { name: 'Ada', age: 30 },
    });
    expect(restored).not.toHaveProperty('report');
  });

  it('round-trips: recovered inputs read back into the same form values', () => {
    const restored = inputDataFromWorkingMemory(workingMemory, INPUTS)!;
    const values = runValuesFromStore(restored, fields, INPUTS);
    expect(values.brief).toBe('hello');
    expect(values.invoice).toMatchObject({ url: 'file.pdf' });
    expect(values.applicant).toMatchObject({ name: 'Ada', age: 30 });
  });

  it('returns null with no root or no matching inputs', () => {
    expect(inputDataFromWorkingMemory(null, INPUTS)).toBeNull();
    expect(inputDataFromWorkingMemory({ root: { report: { content: {} } } }, INPUTS)).toBeNull();
  });
});

describe('setValueAtPath', () => {
  it('sets a nested value immutably', () => {
    const root = { a: { b: [{}, {}] } };
    const next = setValueAtPath(root, ['a', 'b', '1', 'url'], 'x');
    expect((next.a as any).b[1].url).toBe('x');
    expect(root).toEqual({ a: { b: [{}, {}] } }); // unchanged
  });
});

describe('fieldsForContract', () => {
  it('returns [] unless BOTH the contract and the descriptor are present', () => {
    // The two artifacts arrive from one response but are still two fields; a
    // host that has only one of them so far renders an empty form, not a crash.
    const contract = { inputs: INPUTS, output: { concept_ref: 'native.Text', ...SINGLE_OUTPUT } };
    expect(fieldsForContract(undefined, undefined)).toEqual([]);
    expect(fieldsForContract(contract, undefined)).toEqual([]);
    expect(fieldsForContract(undefined, INPUTS_DESCRIPTOR)).toEqual([]);
  });

  it('maps the pair once both are there', () => {
    const contract = { inputs: INPUTS, output: { concept_ref: 'native.Text', ...SINGLE_OUTPUT } };
    const mapped = fieldsForContract(contract, INPUTS_DESCRIPTOR);
    expect(mapped.map((f) => f.name)).toEqual(['brief', 'invoice', 'applicant']);
  });
});

// ─── What an "may be nothing" input looks like on the wire ───────────────────

describe('apiInputsFromRunValues over optional and plural inputs', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    supplier_quote: {
      ...PLAIN_SINGLE,
      concept_ref: 'native.Document',
      json_schema: { type: 'object' },
    },
    comments: {
      ...OPTIONAL_SINGLE,
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
    illustrations: {
      ...PLAIN_VARIABLE,
      concept_ref: 'native.Image',
      json_schema: { type: 'array', items: { type: 'object' } },
    },
  };
  const FIELDS = buildRunFields(
    descriptorOf(
      { ...WIRE_PLAIN, kind: 'document', name: 'supplier_quote', concept_ref: 'native.Document' },
      { ...WIRE_OPTIONAL, kind: 'prose', name: 'comments', concept_ref: 'native.Text' },
      {
        ...WIRE_VARIABLE,
        kind: 'list',
        name: 'illustrations',
        concept_ref: 'native.Image',
        item: { kind: 'image', required: true, concept_ref: 'native.Image' },
      },
    ),
    CONTRACT,
  );

  it('omits a blank optional (`?`) input so the method sees a real absence', () => {
    const payload = apiInputsFromRunValues({ supplier_quote: { url: 'q.pdf' } }, FIELDS, CONTRACT);
    expect(payload).not.toHaveProperty('comments');
  });

  it('sends an EMPTY plural input bare, without the {concept, content} envelope', () => {
    // The runtime still requires the KEY (a plural slot is never absent), but the
    // envelope is its "explicit form" - it bypasses the top-down shaper for the
    // bottom-up factory, which types a list from its first item and so rejects an
    // empty one ("Cannot create Stuff from empty list in content"). The bare form
    // keeps the shaper, which reads the DECLARED concept and builds it correctly.
    const payload = apiInputsFromRunValues({ supplier_quote: { url: 'q.pdf' } }, FIELDS, CONTRACT);
    expect(payload['illustrations']).toEqual([]);
  });

  it('still envelopes a POPULATED plural input', () => {
    const payload = apiInputsFromRunValues(
      { supplier_quote: { url: 'q.pdf' }, illustrations: ['a photo'] },
      FIELDS,
      CONTRACT,
    );
    expect(payload['illustrations']).toMatchObject({ concept: 'native.Image' });
  });

  it('sends an optional input once the user actually types in it', () => {
    const payload = apiInputsFromRunValues(
      { supplier_quote: { url: 'q.pdf' }, comments: 'on offre la gravure' },
      FIELDS,
      CONTRACT,
    );
    expect(payload['comments']).toEqual({
      concept: 'native.Text',
      content: { text: 'on offre la gravure' },
    });
  });

  it('omits an optional input holding only whitespace-free emptiness', () => {
    const payload = apiInputsFromRunValues(
      { supplier_quote: { url: 'q.pdf' }, comments: '' },
      FIELDS,
      CONTRACT,
    );
    expect(payload).not.toHaveProperty('comments');
  });

  it('never omits a required input, however empty', () => {
    // Absence there is a real error the run must report, not something to hide.
    const payload = apiInputsFromRunValues({}, FIELDS, CONTRACT);
    expect(payload).toHaveProperty('supplier_quote');
  });
});

// ─── A text field must never render "[object Object]" ────────────────────────

describe('runValuesFromStore over corrupted text values', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    customer_name: {
      ...PLAIN_SINGLE,
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
  };
  const FIELDS = buildRunFields(
    descriptorOf({
      ...WIRE_PLAIN,
      kind: 'prose',
      name: 'customer_name',
      concept_ref: 'native.Text',
    }),
    CONTRACT,
  );
  const read = (stored: unknown) =>
    runValuesFromStore({ customer_name: stored }, FIELDS, CONTRACT)['customer_name'];

  it('reads a plain simplified string', () => {
    expect(read('Bardot')).toBe('Bardot');
  });

  it('reads the full `{ text }` shape', () => {
    expect(read({ text: 'Bardot' })).toBe('Bardot');
  });

  it('recovers the value from an un-deflated `{ concept, content }` envelope', () => {
    expect(read({ text: { concept: 'native.Text', content: 'Bardot' } })).toBe('Bardot');
  });

  it('recovers the value from a double-wrapped `{ text: { text } }`', () => {
    expect(read({ text: { text: 'Bardot' } })).toBe('Bardot');
  });

  it('renders an empty field - never "[object Object]" - for an unrecognised object', () => {
    // The old fallback ran String() over this, which put the literal
    // "[object Object]" in the textarea, looking like real typed content.
    // (inflate normalizes an unrecognised object to `{ text: '' }` first, so
    // this lands as the empty string rather than undefined - either way the
    // field renders empty, which is the whole point.)
    const value = read({ nonsense: { deeply: 'nested' } });
    expect(value).toBe('');
    expect(value).not.toBe('[object Object]');
  });

  it('does not loop forever on a self-referencing envelope', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic['text'] = cyclic;
    expect(read(cyclic)).toBeUndefined();
  });

  it('keeps a genuine primitive in a text slot', () => {
    expect(read({ text: 42 })).toBe('42');
  });

  it('leaves an empty value empty', () => {
    expect(read(undefined)).toBe('');
    expect(read('')).toBe('');
  });
});

// ─── An untouched structure is ABSENT, not an invented shell ─────────────────

describe('rjsfDataFromRunValues over a structured input nobody opened', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    brief: {
      ...PLAIN_SINGLE,
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
    focus: {
      ...OPTIONAL_SINGLE,
      concept_ref: 'demo.ExtractionFocus',
      json_schema: {
        type: 'object',
        properties: {
          audience: { type: 'string', enum: ['engineer', 'executive'] },
          notes: { anyOf: [{ type: 'string' }, { type: 'null' }], default: null },
        },
        required: ['audience'],
      },
    },
  };
  const FIELDS = buildRunFields(
    descriptorOf(BRIEF_NODE, {
      ...WIRE_OPTIONAL,
      kind: 'object',
      name: 'focus',
      concept_ref: 'demo.ExtractionFocus',
      fields: [
        { kind: 'enum', name: 'audience', choices: ['engineer', 'executive'], required: true },
        { kind: 'text', name: 'notes', required: false },
      ],
    }),
    CONTRACT,
  );

  it('emits nothing for it, rather than a shell of empty children', () => {
    // `{ notes: "" }` was an object that existed only because the bridge built
    // it, and the gate then judged it against the concept's full schema.
    expect(rjsfDataFromRunValues({ brief: 'hello' }, FIELDS)['focus']).toBeUndefined();
  });

  it('emits nothing for a value holding only empty children either', () => {
    // What the form state looks like after a section is opened and closed.
    const data = rjsfDataFromRunValues(
      { brief: 'hello', focus: { audience: undefined, notes: '' } },
      FIELDS,
    );
    expect(data['focus']).toBeUndefined();
  });

  it('keeps the whole structure - empty children and all - once anything is filled', () => {
    // The required child must still be demanded of a section the user filled in.
    const data = rjsfDataFromRunValues({ brief: 'hello', focus: { notes: 'terse' } }, FIELDS);
    expect(data['focus']).toEqual({ audience: undefined, notes: 'terse' });
  });

  it('omits it from the run payload, so the method sees a real absence', () => {
    const payload = apiInputsFromRunValues({ brief: 'hello' }, FIELDS, CONTRACT);
    expect(payload).not.toHaveProperty('focus');
  });
});

// ─── An item in a LIST is never absent - adding it IS the touch ──────────────

describe('rjsfDataFromRunValues over a freshly added empty list item', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    brief: {
      ...PLAIN_SINGLE,
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
    findings: {
      ...PLAIN_VARIABLE,
      concept_ref: 'demo.Finding[]',
      json_schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: { label: { type: 'string' }, note: { type: 'string' } },
        },
      },
    },
  };
  const FIELDS = buildRunFields(
    descriptorOf(BRIEF_NODE, {
      ...WIRE_VARIABLE,
      kind: 'list',
      name: 'findings',
      concept_ref: 'demo.Finding',
      item: {
        kind: 'object',
        required: true,
        concept_ref: 'demo.Finding',
        fields: [
          { kind: 'text', name: 'label', required: false },
          { kind: 'text', name: 'note', required: false },
        ],
      },
    }),
    CONTRACT,
  );

  it('keeps the item as a shell rather than collapsing it to an absence', () => {
    // `ListField`'s "Add" seeds an object item with `{}` (`emptyValue`). A
    // structure nobody put anything into is absent when it sits in a SINGULAR
    // slot - but an item exists only because the user added it, so adding IS
    // the touch. Collapsing it left `[undefined]` in the array, which ajv
    // rejects as `must be object`.
    const data = rjsfDataFromRunValues({ brief: 'hello', findings: [{}] }, FIELDS);

    expect(data['findings']).toEqual([{ label: '', note: '' }]);
  });

  it('still omits an untouched optional STRUCTURED input - the invariant holds', () => {
    // The singular slot and the list item answer differently on purpose; this
    // pins that the list repair did not undo the absence rule.
    const withOptional: Record<string, PipeInputContract> = {
      brief: CONTRACT['brief'] as PipeInputContract,
      focus: {
        ...OPTIONAL_SINGLE,
        concept_ref: 'demo.ExtractionFocus',
        json_schema: {
          type: 'object',
          properties: { audience: { type: 'string' }, notes: { type: 'string' } },
          required: ['audience'],
        },
      },
    };
    const data = rjsfDataFromRunValues(
      { brief: 'hello' },
      buildRunFields(
        descriptorOf(BRIEF_NODE, {
          ...WIRE_OPTIONAL,
          kind: 'object',
          name: 'focus',
          concept_ref: 'demo.ExtractionFocus',
          fields: [
            { kind: 'text', name: 'audience', required: true },
            { kind: 'text', name: 'notes', required: false },
          ],
        }),
        withOptional,
      ),
    );

    expect(data['focus']).toBeUndefined();
  });
});
