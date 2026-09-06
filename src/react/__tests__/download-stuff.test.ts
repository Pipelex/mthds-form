import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileRunField, ObjectRunField, TextRunField } from '../../core/descriptor';
import { downloadStuff } from '../download-stuff';

const image = (name: string): FileRunField => ({
  kind: 'image',
  name,
  conceptRef: 'native.Image',
  required: true,
});
const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const report = (fields: ObjectRunField['fields']): ObjectRunField => ({
  kind: 'object',
  name: 'report',
  conceptRef: 'demo.Report',
  required: true,
  fields,
});

let fetchSpy: ReturnType<typeof vi.fn>;
let openSpy: ReturnType<typeof vi.fn>;
let saved: string[];

beforeEach(() => {
  fetchSpy = vi.fn();
  openSpy = vi.fn();
  saved = [];
  vi.stubGlobal('fetch', fetchSpy);
  vi.stubGlobal('open', openSpy);
  // The save path goes through an anchor click; record the names rather than
  // letting jsdom navigate.
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:stub');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    saved.push(this.download);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('the download path judges a URL before it acts on one', () => {
  it('neither fetches nor opens a javascript: reference', async () => {
    // `window.open` is a NAVIGATION, and it was the sink with no gate in front
    // of it at all: an unfetchable URL fell through to it unexamined.
    await downloadStuff({
      field: report([image('chart'), text('summary')]),
      value: {
        chart: { url: 'pipelex-storage://x', public_url: 'javascript:alert(1)' },
        summary: 'all good',
      },
      baseName: 'report',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('still writes the JSON receipt, so the reference is not lost', async () => {
    await downloadStuff({
      field: report([image('chart'), text('summary')]),
      value: {
        chart: { url: 'pipelex-storage://x', public_url: 'javascript:alert(1)' },
        summary: 'all good',
      },
      baseName: 'report',
    });
    expect(saved).toEqual(['report.json']);
  });

  it('fetches the normalised string, not the raw member', async () => {
    fetchSpy.mockResolvedValue({ ok: true, blob: async () => new Blob(['x']) });
    await downloadStuff({
      field: report([image('chart'), text('summary')]),
      value: {
        chart: { url: 'pipelex-storage://x', public_url: ' https://cdn.example/a.png' },
        summary: 'all good',
      },
      baseName: 'report',
    });
    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example/a.png');
  });

  it('opens the normalised string when the fetch fails', async () => {
    fetchSpy.mockRejectedValue(new Error('cors'));
    await downloadStuff({
      field: report([image('chart'), text('summary')]),
      value: {
        chart: { url: 'pipelex-storage://x', public_url: 'https://cdn.example/a.png' },
        summary: 'all good',
      },
      baseName: 'report',
    });
    expect(openSpy).toHaveBeenCalledWith('https://cdn.example/a.png', '_blank', 'noopener');
  });

  it('prefers the resolver, and judges what it returns', async () => {
    await downloadStuff({
      field: report([image('chart'), text('summary')]),
      value: { chart: { url: 'pipelex-storage://x', public_url: 'https://cdn.example/a.png' } },
      baseName: 'report',
      // A resolver that answers with a scheme the gate refuses does not get to
      // send the reader anywhere; the payload's own URL is judged next.
      resolveUrl: () => 'file:///etc/passwd',
    });
    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example/a.png');
  });
});
