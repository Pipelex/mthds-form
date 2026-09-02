import { describe, expect, it } from 'vitest';
import { collectStuffFiles } from '../stuff-files';
import type { RunField } from '../descriptor';

const image = (name: string): RunField => ({
  kind: 'image',
  name,
  conceptRef: 'native.Image',
  required: true,
});

const document_ = (name: string): RunField => ({
  kind: 'document',
  name,
  conceptRef: 'native.Document',
  required: true,
});

const text = (name: string): RunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});

describe('collectStuffFiles', () => {
  it('finds nothing in a stuff that declares no file', () => {
    const field: RunField = {
      kind: 'object',
      name: 'invoice',
      conceptRef: 'demo.Invoice',
      required: true,
      fields: [text('supplier'), text('currency')],
    };
    expect(collectStuffFiles(field, { supplier: 'Globex', currency: 'EUR' })).toEqual([]);
  });

  it('reads a bare image', () => {
    const files = collectStuffFiles(image('photo'), { url: 'https://example.test/a.png' });
    expect(files).toEqual([
      {
        url: 'https://example.test/a.png',
        publicUrl: undefined,
        filename: undefined,
        mimeType: undefined,
        path: 'photo',
        kind: 'image',
      },
    ]);
  });

  it('reads files nested in an object, in authored order', () => {
    const field: RunField = {
      kind: 'object',
      name: 'report',
      conceptRef: 'demo.Report',
      required: true,
      fields: [text('title'), image('cover'), document_('appendix')],
    };
    const files = collectStuffFiles(field, {
      title: 'Q2',
      cover: { url: 'pipelex-storage://x/cover.png' },
      appendix: { url: 'pipelex-storage://x/appendix.pdf' },
    });
    expect(files.map((file) => [file.path, file.kind])).toEqual([
      ['report.cover', 'image'],
      ['report.appendix', 'document'],
    ]);
  });

  it('indexes files inside a list', () => {
    const field: RunField = {
      kind: 'list',
      name: 'scans',
      conceptRef: 'native.Image[]',
      required: true,
      item: image('scan'),
    };
    const files = collectStuffFiles(field, [
      { url: 'https://example.test/1.png' },
      { url: 'https://example.test/2.png' },
    ]);
    expect(files.map((file) => file.path)).toEqual(['scans.0', 'scans.1']);
  });

  it('ignores a url on a field the method did NOT declare as a file', () => {
    // The point of walking the descriptor: `link` is text that happens to hold
    // a URL, and a payload walk would have saved it as a document.
    const field: RunField = {
      kind: 'object',
      name: 'entry',
      conceptRef: 'demo.Entry',
      required: true,
      fields: [text('link')],
    };
    expect(collectStuffFiles(field, { link: 'https://example.test/a.pdf' })).toEqual([]);
  });

  it('skips a declared file whose value carries no url', () => {
    const field: RunField = {
      kind: 'object',
      name: 'report',
      conceptRef: 'demo.Report',
      required: true,
      fields: [image('cover')],
    };
    expect(collectStuffFiles(field, { cover: null })).toEqual([]);
    expect(collectStuffFiles(field, {})).toEqual([]);
  });

  it('carries the public url and filename the value states', () => {
    const files = collectStuffFiles(image('photo'), {
      url: 'pipelex-storage://x/y.png',
      public_url: 'https://s3.test/y.png?sig=1',
      filename: 'headshot.png',
    });
    expect(files[0]).toMatchObject({
      url: 'pipelex-storage://x/y.png',
      publicUrl: 'https://s3.test/y.png?sig=1',
      filename: 'headshot.png',
    });
  });
});
