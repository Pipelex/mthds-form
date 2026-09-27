import { describe, expect, it } from 'vitest';
import type { FileRunField, ObjectRunField, RunField, TextRunField } from '../descriptor';
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../file-formats';
import { planFileSave, planStuffSave } from '../save-plan';
import { collectStuffFiles } from '../stuff-files';

const image = (name: string): FileRunField => ({
  kind: 'image',
  name,
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
});
const document_ = (name: string): FileRunField => ({
  kind: 'document',
  name,
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
});
const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const page = (name: string): RunField => ({
  kind: 'object',
  name,
  conceptRef: 'native.Html',
  required: true,
  fields: [text('inner_html'), text('css_class')],
});
const report = (fields: ObjectRunField['fields']): ObjectRunField => ({
  kind: 'object',
  name: 'report',
  conceptRef: 'demo.Report',
  required: true,
  fields,
});

describe('planStuffSave: what a whole result saves as', () => {
  it('plans each file as itself and the data as JSON, the JSON last', () => {
    const value = {
      chart: { url: 'https://cdn.example/chart.png' },
      source: {
        url: 'https://cdn.example/q3.pdf',
        filename: 'q3.pdf',
        mime_type: 'application/pdf',
      },
      summary: 'all good',
    };
    const plan = planStuffSave(
      report([image('chart'), document_('source'), text('summary')]),
      value,
      {
        baseName: 'quarter',
      },
    );
    expect(plan.unavailable).toEqual([]);
    expect(plan.files).toEqual([
      {
        kind: 'image',
        path: 'report.chart',
        name: 'quarter-report-chart.png',
        mimeType: 'image/png',
        url: 'https://cdn.example/chart.png',
      },
      {
        kind: 'document',
        path: 'report.source',
        name: 'q3.pdf',
        mimeType: 'application/pdf',
        url: 'https://cdn.example/q3.pdf',
      },
      {
        kind: 'data',
        path: 'report',
        name: 'quarter.json',
        mimeType: 'application/json',
        text: JSON.stringify(value, null, 2),
      },
    ]);
  });

  it('plans an HTML page as its markup, inline', () => {
    const plan = planStuffSave(
      report([page('summary'), text('title')]),
      { summary: { inner_html: '<h1>Hi</h1>', css_class: null }, title: 'T' },
      { baseName: 'r' },
    );
    expect(plan.files[0]).toEqual({
      kind: 'markup',
      path: 'report.summary',
      name: 'r-report-summary.html',
      mimeType: 'text/html',
      text: '<h1>Hi</h1>',
    });
  });

  it('plans a result that IS one file as that file alone, with no JSON beside it', () => {
    const plan = planStuffSave(
      image('output'),
      { url: 'https://cdn.example/a.png' },
      { baseName: 'output' },
    );
    expect(plan.files.map((file) => file.name)).toEqual(['output-output.png']);
  });

  it('plans a page that is the whole result as the page alone', () => {
    const plan = planStuffSave(page('output'), { inner_html: '<p>x</p>' }, { baseName: 'memo' });
    expect(plan.files.map((file) => file.name)).toEqual(['memo-output.html']);
  });

  it('never plans JSON that throws on a BigInt', () => {
    const plan = planStuffSave(text('output'), { big: 10n }, { baseName: 'b' });
    expect(plan.files[0]?.text).toContain('"10"');
  });
});

describe('the planner judges a URL before it plans one', () => {
  it('plans no javascript: reference, and names it as unavailable', () => {
    const plan = planStuffSave(
      report([image('chart'), text('summary')]),
      { chart: { url: 'pipelex-storage://x', public_url: 'javascript:alert(1)' }, summary: 'ok' },
      { baseName: 'report' },
    );
    expect(plan.files.map((file) => file.kind)).toEqual(['data']);
    expect(plan.unavailable).toEqual([
      { name: 'report-report-chart', kind: 'image', path: 'report.chart' },
    ]);
  });

  it('plans the normalised string, not the raw member', () => {
    const [file] = planStuffSave(
      report([image('chart'), text('summary')]),
      { chart: { url: 'pipelex-storage://x', public_url: ' https://cdn.example/a.png' } },
      { baseName: 'report' },
    ).files;
    expect(file?.url).toBe('https://cdn.example/a.png');
  });

  it('asks the resolver first, and judges what it returns', () => {
    const value = {
      chart: { url: 'pipelex-storage://x', public_url: 'https://cdn.example/a.png' },
    };
    const field = report([image('chart')]);
    // A resolver that answers with a scheme the gate refuses does not get to
    // send the reader anywhere; the payload's own URL is judged next.
    expect(
      planStuffSave(field, value, { baseName: 'r', resolveUrl: () => 'file:///etc/passwd' })
        .files[0]?.url,
    ).toBe('https://cdn.example/a.png');
    expect(
      planStuffSave(field, value, { baseName: 'r', resolveUrl: () => '/api/assets/x' }).files[0]
        ?.url,
    ).toBe('/api/assets/x');
  });

  it('keeps the JSON copy when the one file a result amounts to cannot be saved', () => {
    // The bare-file rule drops the JSON because the file IS the download, which
    // only holds when the file can be handed over. Otherwise the JSON is the one
    // thing left, and it still carries the reference.
    const plan = planStuffSave(
      image('output'),
      { url: 'pipelex-storage://x' },
      { baseName: 'output' },
    );
    expect(plan.files.map((file) => file.name)).toEqual(['output.json']);
    expect(plan.unavailable.map((file) => file.path)).toEqual(['output']);
  });
});

describe('a data: file is named by the type the gate admitted', () => {
  const html = btoa('<script>alert(1)</script>');

  it("replaces a filename's extension that disagrees with the admitted type", () => {
    const [file] = planStuffSave(
      image('output'),
      { url: `data:image/png;base64,${html}`, filename: 'image.html' },
      { baseName: 'output' },
    ).files;
    expect(file).toMatchObject({ name: 'image.png', mimeType: 'image/png' });
  });

  it('ignores the tail of the payload when there is no filename', () => {
    const [file] = planStuffSave(
      image('generated_image'),
      { url: 'data:image/png,%3Cscript%3Ealert(1)%3C/script%3E.html' },
      { baseName: 'generated_image' },
    ).files;
    expect(file).toMatchObject({
      name: 'generated_image-generated_image.png',
      mimeType: 'image/png',
    });
  });

  it('keeps a filename whose extension the admitted type allows', () => {
    const [file] = planStuffSave(
      image('output'),
      { url: 'data:image/jpeg;base64,AAAA', filename: 'photo.jpeg' },
      { baseName: 'output' },
    ).files;
    expect(file?.name).toBe('photo.jpeg');
  });
});

describe('a planned name is a name, never a path', () => {
  it("keeps only the last segment of a payload's filename", () => {
    const [file] = planStuffSave(
      document_('output'),
      { url: 'https://cdn.example/x.pdf', filename: '../../.ssh\\authorized_keys' },
      { baseName: 'output' },
    ).files;
    expect(file?.name).toBe('authorized_keys');
  });

  it('falls back to the place in the result when the filename is only a path', () => {
    const [file] = planStuffSave(
      document_('output'),
      { url: 'https://cdn.example/x.pdf', filename: '../' },
      { baseName: 'output' },
    ).files;
    expect(file?.name).toBe('output-output.pdf');
  });
});

describe('planFileSave: one file, as its own button saves it', () => {
  it('plans the file exactly as the whole-result plan does', () => {
    const field = report([image('chart'), text('summary')]);
    const value = { chart: { url: 'https://cdn.example/chart.png' }, summary: 'x' };
    const [file] = collectStuffFiles(field, value);
    expect(planFileSave(file!, { baseName: 'r' })).toEqual(
      planStuffSave(field, value, { baseName: 'r' }).files[0],
    );
  });

  it('plans nothing for a file no URL the gate admits was found for', () => {
    const [file] = collectStuffFiles(image('output'), { url: 'pipelex-storage://x' });
    expect(planFileSave(file!, { baseName: 'r' })).toBeUndefined();
  });
});
