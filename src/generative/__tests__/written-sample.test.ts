import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { resultBrief } from '../brief';
import { writtenSampleOf } from '../written-sample';

const common = { required: true, gating: false } as const;

const text = (name: string): RunField => ({ ...common, kind: 'text', name });

const invoice: RunField = {
  ...common,
  kind: 'object',
  name: 'invoice',
  fields: [
    text('reference'),
    { ...common, kind: 'number', name: 'total', integer: false },
    { ...common, kind: 'number', name: 'lines_count', integer: true },
    { ...common, kind: 'boolean', name: 'paid' },
    { ...common, kind: 'enum', name: 'status', options: ['open', 'closed'] },
    { ...common, kind: 'date', name: 'issued', datetime: false },
    { ...common, kind: 'date', name: 'stamped', datetime: true },
    { ...common, kind: 'prose', name: 'notes' },
    { ...common, kind: 'image', name: 'logo', formats: [] },
    { ...common, kind: 'document', name: 'original', formats: [] },
    {
      ...common,
      kind: 'list',
      name: 'lines',
      item: {
        ...common,
        kind: 'object',
        name: 'item',
        fields: [text('label'), { ...common, kind: 'number', name: 'amount', integer: false }],
      },
    },
  ],
} as RunField;

const clean = {
  reference: 'INV-2041',
  total: 1240.5,
  lines_count: 2,
  paid: false,
  status: 'open',
  issued: '2026-03-14',
  lines: [
    { label: 'Workshop', amount: 1000 },
    { label: 'Travel', amount: 240.5 },
  ],
};

describe('writtenSampleOf', () => {
  it('returns a sample that agrees with the descriptor with no problems', () => {
    expect(writtenSampleOf(invoice, JSON.stringify(clean))).toEqual({
      state: clean,
      problems: [],
    });
  });

  it('tolerates a code fence around the answer', () => {
    for (const text_ of [
      '```json\n{"reference":"A"}\n```',
      '```\n{"reference":"A"}\n```',
      '  ```json\r\n{"reference":"A"}\r\n```\n',
    ]) {
      expect(writtenSampleOf(invoice, text_)).toEqual({
        state: { reference: 'A' },
        problems: [],
      });
    }
  });

  it('says that text which is not JSON is not JSON, with no state', () => {
    expect(writtenSampleOf(invoice, 'Here is your sample: {')).toEqual({
      state: undefined,
      problems: ['the written sample is not JSON'],
    });
  });

  it('refuses a member the method does not return, at any depth', () => {
    const { problems } = writtenSampleOf(
      invoice,
      JSON.stringify({ ...clean, currency: 'EUR', lines: [{ label: 'A', amount: 1, vat: 2 }] }),
    );
    expect(problems).toEqual([
      '/result/lines/0/vat is not a member the method returns',
      '/result/currency is not a member the method returns',
    ]);
  });

  it('refuses a value of the wrong kind, naming what the path should hold', () => {
    const { problems } = writtenSampleOf(
      invoice,
      JSON.stringify({
        reference: 7,
        total: '1240',
        lines_count: 1.5,
        paid: 'no',
        status: 'pending',
        issued: 'the fourteenth of March',
        lines: { label: 'A' },
      }),
    );
    expect(problems).toEqual([
      '/result/reference should hold a text',
      '/result/total should hold a number',
      '/result/lines_count should hold a whole number',
      '/result/paid should hold true or false',
      '/result/status should hold one of "open", "closed"',
      '/result/issued should hold a day written as YYYY-MM-DD',
      '/result/lines should hold a list',
    ]);
  });

  it('refuses a day the calendar does not have', () => {
    for (const day of ['2026-02-30', '2026-13-01']) {
      expect(writtenSampleOf(invoice, JSON.stringify({ issued: day })).problems).toEqual([
        '/result/issued should hold a day written as YYYY-MM-DD',
      ]);
    }
    expect(writtenSampleOf(invoice, '{"issued":"2024-02-29"}').problems).toEqual([]);
  });

  describe('the limits the method states', () => {
    const bounded: RunField = {
      ...common,
      kind: 'object',
      name: 'bounded',
      fields: [
        { ...common, kind: 'number', name: 'score', integer: true, min: 0, max: 100 },
        { ...common, kind: 'text', name: 'code', minLength: 2, maxLength: 3 },
        {
          ...common,
          kind: 'list',
          name: 'tags',
          item: text('item'),
          itemCount: 2,
          maxItemCount: 3,
        },
      ],
    } as RunField;
    const problemsOf = (sample: object) =>
      writtenSampleOf(bounded, JSON.stringify(sample)).problems;

    it('accepts a value on either limit', () => {
      expect(problemsOf({ score: 0, code: 'ab', tags: ['a', 'b'] })).toEqual([]);
      expect(problemsOf({ score: 100, code: 'abc', tags: ['a', 'b', 'c'] })).toEqual([]);
    });

    it('refuses a value below the least, naming the limit', () => {
      expect(problemsOf({ score: -1, code: 'a', tags: ['a'] })).toEqual([
        '/result/score should hold at least 0',
        '/result/code should hold at least 2 characters',
        '/result/tags should hold at least 2 items',
      ]);
    });

    it('refuses a value above the most, naming the limit', () => {
      expect(problemsOf({ score: 101, code: 'abcd', tags: ['a', 'b', 'c', 'd'] })).toEqual([
        '/result/score should hold at most 100',
        '/result/code should hold at most 3 characters',
        '/result/tags should hold at most 3 items',
      ]);
    });

    it('counts the characters a person reads rather than UTF-16 units', () => {
      expect(problemsOf({ code: '😀😀😀' })).toEqual([]);
    });

    it('still walks the items of a list whose count is wrong', () => {
      expect(problemsOf({ tags: [1] })).toEqual([
        '/result/tags should hold at least 2 items',
        '/result/tags/0 should hold a text',
      ]);
    });

    it('asks for no count on a list of what a sample leaves out', () => {
      const files: RunField = {
        ...common,
        kind: 'list',
        name: 'result',
        item: { ...common, kind: 'image', name: 'item', formats: [] },
        itemCount: 2,
      } as RunField;
      expect(writtenSampleOf(files, '[]').problems).toEqual([]);
    });
  });

  it('wants a file, an image, prose and a date with a time left out, even where the result frame draws one', () => {
    const { problems } = writtenSampleOf(
      invoice,
      JSON.stringify({
        ...clean,
        logo: { url: 'https://example.com/logo.png' },
        original: { url: 'https://example.com/a.pdf' },
        notes: 'Paid in full.',
        stamped: '2026-03-14T10:00:00Z',
      }),
    );
    expect(problems).toEqual([
      '/result/logo should be left out of a sample, and it holds something',
      '/result/original should be left out of a sample, and it holds something',
      '/result/notes should be left out of a sample, and it holds something',
      '/result/stamped should be left out of a sample, and it holds something',
    ]);
  });

  it('reads a null as the member being absent, and asks for no member to be present', () => {
    expect(writtenSampleOf(invoice, '{"reference":null,"logo":null}').problems).toEqual([]);
    expect(writtenSampleOf(invoice, '{}').problems).toEqual([]);
  });

  it('reads the root as the result itself, when it is no structure', () => {
    const list: RunField = { ...common, kind: 'list', name: 'result', item: text('item') };
    expect(writtenSampleOf(list, '["a","b"]').problems).toEqual([]);
    expect(writtenSampleOf(list, '["a",3]').problems).toEqual(['/result/1 should hold a text']);
  });

  it('flags every item of a list of files and accepts the list left empty', () => {
    const images: RunField = {
      ...common,
      kind: 'list',
      name: 'result',
      item: { ...common, kind: 'image', name: 'item', formats: [] },
    } as RunField;
    expect(writtenSampleOf(images, '[{"url":"https://x"}]').problems).toEqual([
      '/result/0 should be left out of a sample, and it holds something',
    ]);
    expect(writtenSampleOf(images, '[]').problems).toEqual([]);
  });

  it('turns a __proto__ key into a problem and leaves the prototype alone', () => {
    const before = ({} as Record<string, unknown>).polluted;
    const { problems } = writtenSampleOf(invoice, '{"__proto__":{"polluted":true}}');
    expect(problems).toEqual(['/result/__proto__ is not a member the method returns']);
    expect(({} as Record<string, unknown>).polluted).toBe(before);
  });
});

describe('resultBrief with no run to read', () => {
  it('carries no sample_state at all when the state is undefined', () => {
    const brief = resultBrief({ pipeRef: 'demo.run' }, invoice, undefined, { frame: 'result' });
    expect('sample_state' in brief).toBe(false);
  });

  it('still writes the state of a run as JSON', () => {
    const brief = resultBrief({ pipeRef: 'demo.run' }, invoice, { reference: 'A' });
    expect(brief.sample_state).toBe(JSON.stringify({ reference: 'A' }, null, 2));
  });

  it('writes a null state, which is what a run may really hold', () => {
    const brief = resultBrief({ pipeRef: 'demo.run' }, invoice, null);
    expect(brief.sample_state).toBe('null');
  });
});
