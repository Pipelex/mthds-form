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
import type { PipeInputContract } from '..';

// Realistic contract: a Text concept (TextContent {text}), a Document
// (DocumentContent {url}), and a custom structured concept.
const INPUTS: Record<string, PipeInputContract> = {
  brief: {
    concept_ref: 'native.Text',
    json_schema: { type: 'object', properties: { text: { type: 'string' } } },
  },
  invoice: {
    concept_ref: 'native.Document',
    json_schema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'pipelex storage url' } },
    },
  },
  applicant: {
    concept_ref: 'demo.Applicant',
    json_schema: {
      type: 'object',
      properties: { name: { type: 'string' }, age: { type: 'integer' } },
      required: ['name'],
    },
  },
};

const fields = buildRunFields(INPUTS);

describe('buildRunFields native mapping', () => {
  it('maps native.Text (TextContent object) to a text/prose field, not an object', () => {
    const brief = fields.find((f) => f.name === 'brief')!;
    expect(brief.kind === 'prose' || brief.kind === 'text').toBe(true);
  });

  it('maps native.Document (DocumentContent object) to a document field', () => {
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
  // Refining concepts arrive with the TextContent wrapper schema but a custom
  // concept_ref - so they map to an object field with a child `text` string.
  const POEM_INPUTS: Record<string, PipeInputContract> = {
    poem: {
      concept_ref: 'poem_html.Poem',
      json_schema: {
        type: 'object',
        properties: { text: { type: 'string', title: 'Text' } },
      },
    },
  };
  const poemFields = buildRunFields(POEM_INPUTS);

  it('stores the wrapper shape once - never double-wrapped { text: { text } }', () => {
    const stored = storeInputDataFromRunValues(
      { poem: { text: 'Whispers of the Morning Tide' } },
      poemFields,
      POEM_INPUTS,
    );
    expect(stored.poem).toEqual({
      concept: 'poem_html.Poem',
      content: { text: 'Whispers of the Morning Tide' },
    });
  });

  it('round-trips store → values → store byte-identically', () => {
    const stored = storeInputDataFromRunValues(
      { poem: { text: 'Whispers' } },
      poemFields,
      POEM_INPUTS,
    );
    const values = runValuesFromStore(stored, poemFields, POEM_INPUTS);
    expect(values.poem).toEqual({ text: 'Whispers' });
    expect(storeInputDataFromRunValues(values, poemFields, POEM_INPUTS)).toEqual(stored);
  });

  it('self-heals legacy double-wrapped store data on read', () => {
    // Data written by the buggy bridge: content.text is a nested wrapper.
    const legacy = {
      poem: { concept: 'poem_html.Poem', content: { text: { text: 'Whispers' } } },
    };
    const values = runValuesFromStore(legacy, poemFields, POEM_INPUTS);
    expect(values.poem).toEqual({ text: 'Whispers' });
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
  // stuff with `{ concept, content }` (the shape platform's working_memory.json
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
  it('returns [] for an undefined contract', () => {
    expect(fieldsForContract(undefined)).toEqual([]);
  });
});

// ─── What an "may be nothing" input looks like on the wire ───────────────────

describe('apiInputsFromRunValues over optional and plural inputs', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    supplier_quote: { concept_ref: 'native.Document', json_schema: { type: 'object' } },
    comments: {
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
      optional: true,
    },
    illustrations: {
      concept_ref: 'native.Image',
      json_schema: { type: 'array', items: { type: 'object' } },
    },
  };
  const FIELDS = buildRunFields(CONTRACT);

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
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
  };
  const FIELDS = buildRunFields(CONTRACT);
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
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
    focus: {
      concept_ref: 'demo.ExtractionFocus',
      optional: true,
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
  const FIELDS = buildRunFields(CONTRACT);

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
    // The required child must still be demanded of a section the user opened.
    const data = rjsfDataFromRunValues({ brief: 'hello', focus: { notes: 'terse' } }, FIELDS);
    expect(data['focus']).toEqual({ audience: undefined, notes: 'terse' });
  });

  it('omits it from the run payload, so the method sees a real absence', () => {
    const payload = apiInputsFromRunValues({ brief: 'hello' }, FIELDS, CONTRACT);
    expect(payload).not.toHaveProperty('focus');
  });
});
