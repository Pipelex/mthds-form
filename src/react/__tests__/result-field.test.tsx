// @vitest-environment jsdom
/**
 * The result renderer, asserted by rendering.
 *
 * This file exists because the thing that went wrong was invisible to every
 * other kind of test: a `document` result reached a `String(value)` fall-through
 * and rendered the literal text `[object Object]`. No exception, no console
 * warning, no failing type — just a wrong pixel. Only rendering catches that,
 * which is why these run in jsdom rather than beside the pure-core suites.
 *
 * The fixtures here are hand-built `RunField`s, deliberately, and that is not
 * the fixture rule being broken: the STORY corpus is generated because a
 * hand-written descriptor gets the standard's taxonomy subtly wrong and nothing
 * would notice. These are unit inputs chosen to hit one branch each - an empty
 * list, a boolean `false`, a document with no `url` - several of which no real
 * corpus contains, which is exactly why they belong here and not there. The
 * generated corpus is asserted in its own stories.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  BooleanRunField,
  DateRunField,
  EnumRunField,
  FileRunField,
  ListRunField,
  NumberRunField,
  ObjectRunField,
  ProseRunField,
  RunField,
  TextRunField,
} from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { FieldPresentationProvider } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { ResultField } from '../result-field';
import { ResultEnvProvider } from '../result-env';

const text = (name: string, contentKey?: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
  ...(contentKey ? { contentKey } : {}),
});
const prose = (name: string, contentKey?: string): ProseRunField => ({
  kind: 'prose',
  name,
  conceptRef: 'native.Text',
  required: true,
  ...(contentKey ? { contentKey } : {}),
});
const number = (name: string): NumberRunField => ({
  kind: 'number',
  name,
  conceptRef: 'native.Number',
  required: true,
  integer: false,
});
const flag = (name: string): BooleanRunField => ({
  kind: 'boolean',
  name,
  conceptRef: 'native.YesNo',
  required: false,
});
const day = (name: string): DateRunField => ({
  kind: 'date',
  name,
  conceptRef: 'native.Date',
  required: true,
  datetime: false,
});
const file = (name: string, kind: 'document' | 'image'): FileRunField => ({
  kind,
  name,
  conceptRef: kind === 'document' ? 'native.Document' : 'native.Image',
  required: true,
  formats: formatsForKind(kind),
});
const object = (name: string, fields: ObjectRunField['fields']): ObjectRunField => ({
  kind: 'object',
  name,
  conceptRef: 'demo.Thing',
  required: true,
  fields,
});
const list = (name: string, item: ListRunField['item'], contentKey?: string): ListRunField => ({
  kind: 'list',
  name,
  conceptRef: 'demo.Thing',
  required: true,
  item,
  ...(contentKey ? { contentKey } : {}),
});

describe('unwrapping', () => {
  it('unwraps a scalar by the content key the descriptor names', () => {
    render(<ResultField field={prose('output', 'text')} value={{ text: 'hello there' }} />);
    expect(screen.getByText('hello there')).toBeTruthy();
  });

  it('leaves a value alone when the field names no content key', () => {
    render(<ResultField field={text('output')} value="bare" />);
    expect(screen.getByText('bare')).toBeTruthy();
  });

  it('does NOT unwrap a single-property record when no content key was stated', () => {
    // The deleted heuristic: with a schema now required, a lone property is a
    // structure with one field as often as it is a wrapper, and only the
    // descriptor can tell them apart. Rendering it whole is the honest answer.
    render(<ResultField field={text('output')} value={{ only: 'one' }} />);
    expect(screen.queryByText('one')).toBeNull();
  });

  it('leaves the value alone when the named content key is absent from it', () => {
    render(<ResultField field={prose('output', 'text')} value={{ other: 'x' }} />);
    expect(screen.queryByText('x')).toBeNull();
  });
});

describe('scalars', () => {
  it('renders an absent value as the absence string, not as "undefined"', () => {
    render(<ResultField field={text('output')} value={undefined} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });

  it('renders an empty string as an absence', () => {
    render(<ResultField field={text('output')} value="" />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });

  it('renders the number zero, which is a value and not an absence', () => {
    render(<ResultField field={number('output')} value={0} />);
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.queryByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeNull();
  });

  it('renders boolean false as No rather than as an absence', () => {
    render(<ResultField field={flag('paid')} value={false} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.no)).toBeTruthy();
  });

  it('renders boolean true as Yes', () => {
    render(<ResultField field={flag('paid')} value={true} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.yes)).toBeTruthy();
  });
});

describe('dates', () => {
  it('reads the serializer typed envelope a nested date field arrives in', () => {
    render(
      <ResultField
        field={day('issued_on')}
        value={{ date: '2026-03-14', __class__: 'date', __module__: 'datetime' }}
      />,
    );
    expect(screen.getByText('2026-03-14')).toBeTruthy();
    expect(screen.queryByText(/__class__/)).toBeNull();
  });

  it('reads a plain ISO string', () => {
    render(<ResultField field={day('issued_on')} value="2026-03-14" />);
    expect(screen.getByText('2026-03-14')).toBeTruthy();
  });

  it("reads native.Date's own {date, time} content model", () => {
    render(<ResultField field={day('at')} value={{ date: '2026-03-14', time: '15:40:00' }} />);
    expect(screen.getByText('2026-03-14 15:40:00')).toBeTruthy();
  });

  it('renders a shape carrying no date as an absence, never as [object Object]', () => {
    render(<ResultField field={day('at')} value={{ nothing: true }} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
    expect(screen.queryByText(/\[object Object\]/)).toBeNull();
  });
});

describe('files', () => {
  it('renders a document content model, and NEVER stringifies it', () => {
    render(
      <ResultField
        field={file('output', 'document')}
        value={{
          url: 'pipelex-storage://abc/report.pdf',
          mime_type: 'application/pdf',
          title: 'Q3 report',
          snippet: 'Revenue grew.',
        }}
      />,
    );
    expect(screen.getByText('Q3 report')).toBeTruthy();
    // NAMED, not printed whole: ninety characters of UUID wrapped across the
    // panel says one thing, and the thing it says is "this is a file". The whole
    // reference stays on the title, which is the part worth copying.
    expect(screen.getByText('report.pdf')).toBeTruthy();
    expect(screen.getByTitle(/pipelex-storage:\/\/abc\/report\.pdf/)).toBeTruthy();
    expect(screen.getByText('Revenue grew.')).toBeTruthy();
    // The regression this whole file exists for.
    expect(screen.queryByText(/\[object Object\]/)).toBeNull();
  });

  it('links a document a browser can actually follow', () => {
    render(
      <ResultField
        field={file('output', 'document')}
        value={{ url: 'https://example.com/a.pdf', filename: 'a.pdf' }}
      />,
    );
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('does not link a storage reference, which resolves nowhere without a host', () => {
    render(
      <ResultField field={file('output', 'document')} value={{ url: 'pipelex-storage://x' }} />,
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('paints an image whose URL is viewable', () => {
    render(
      <ResultField
        field={file('output', 'image')}
        value={{
          url: 'pipelex-storage://x',
          public_url: 'https://cdn.example/a.png',
          caption: 'A sign',
        }}
      />,
    );
    expect(screen.getByRole('img')).toBeTruthy();
    expect(screen.getByText('A sign')).toBeTruthy();
  });

  it('shows an unviewable image as its reference rather than a broken <img>', () => {
    render(
      <ResultField
        field={file('output', 'image')}
        value={{ url: 'pipelex-storage://x/a.png', public_url: null, mime_type: 'image/png' }}
      />,
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('a.png')).toBeTruthy();
    expect(screen.getByTitle(/pipelex-storage:\/\/x\/a\.png/)).toBeTruthy();
  });

  it('renders a file value with no url as an absence', () => {
    render(<ResultField field={file('output', 'image')} value={{ caption: 'orphan' }} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });
});

describe('the URL policy', () => {
  it('refuses a data: document dressed as a PDF - no preview, no frame, no link', () => {
    // The reported hole, whole: previewability was decided from the payload's
    // OWN declared type, so a document could name itself `report.pdf` and be
    // framed at a `data:text/html` URL - which is a document at the embedding
    // page's origin, with the host's cookies.
    const { container } = render(
      <ResultField
        field={file('output', 'document')}
        value={{
          url: 'data:text/html,<script>alert(1)</script>',
          filename: 'report.pdf',
          mime_type: 'application/pdf',
        }}
      />,
    );
    expect(screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.preview })).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    // Named rather than linked, which is the honest floor for a reference no
    // sink here will act on.
    expect(screen.queryByRole('link')).toBeNull();
    // Twice: the document's name above, the reference below it.
    expect(screen.getAllByText('report.pdf').length).toBeGreaterThan(0);
  });

  it('names a data: document by its format and size, never by a slice of its base64', () => {
    // A `data:` URL has no path, so its "last segment" was whatever base64
    // followed the final `/`.
    const { container } = render(
      <ResultField
        field={file('output', 'document')}
        value={{ url: 'data:application/pdf;base64,JVBE/Ri0x' }}
      />,
    );
    expect(screen.getAllByText('PDF · 6 bytes').length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain('Ri0x');
  });

  it('refuses a data: URL whose type is outside the allow-list', () => {
    render(
      <ResultField
        field={file('output', 'image')}
        value={{ url: 'data:image/svg+xml,<svg onload="alert(1)"/>', filename: 'chart.svg' }}
      />,
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('still paints an inline raster image, which is on the allow-list', () => {
    render(
      <ResultField
        field={file('output', 'image')}
        value={{ url: 'data:image/png;base64,iVBORw0KGgo=', caption: 'inline' }}
      />,
    );
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('frames an https PDF, with no referrer', async () => {
    const { container } = render(
      <ResultField
        field={file('output', 'document')}
        value={{ url: 'https://cdn.example/a.pdf', mime_type: 'application/pdf' }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.preview }));
    const frame = container.querySelector('iframe');
    expect(frame).toBeTruthy();
    expect(frame?.getAttribute('referrerpolicy')).toBe('no-referrer');
    // Deliberately NOT sandboxed: the attribute sets the sandboxed-plugins flag
    // unconditionally and no token unsets it, so a sandbox here deletes the PDF
    // preview in Chrome rather than hardening it. The scheme gate above is what
    // makes the frame safe. See DocumentPreview's comment.
    expect(frame?.hasAttribute('sandbox')).toBe(false);
  });

  it('paints the member it VALIDATED, not a different one', () => {
    // A leading space is stripped by the URL parser and was not stripped by the
    // old prefix match, so a host that validated `public_url` by parsing saw the
    // kernel skip it and fall through to `url`, which nothing had validated.
    render(
      <ResultField
        field={file('output', 'image')}
        value={{
          url: 'https://attacker.example/tracked.png',
          public_url: ' https://cdn.example/a.png',
        }}
      />,
    );
    expect(screen.getByRole('img').getAttribute('src')).toBe('https://cdn.example/a.png');
  });

  it('carries the host prose-image policy down to a prose field', () => {
    // The seam a host actually uses: one statement on the provider, and every
    // prose value under it follows. `ResultField` needs no prop of its own.
    const { container } = render(
      <ResultEnvProvider proseImages="load">
        <ResultField field={prose('summary')} value="![a chart](https://cdn.example/a.png)" />
      </ResultEnvProvider>,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://cdn.example/a.png');
  });

  it('links rather than loads a prose image when the host said nothing', () => {
    const { container } = render(
      <ResultField field={prose('summary')} value="![a chart](https://attacker.example/x.png)" />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')?.textContent).toBe('a chart');
  });

  it('gives every image it paints a no-referrer policy', () => {
    render(
      <ResultField
        field={file('output', 'image')}
        value={{ url: 'https://cdn.example/a.png', caption: 'A sign' }}
      />,
    );
    expect(screen.getByRole('img').getAttribute('referrerpolicy')).toBe('no-referrer');
  });
});

describe('a frame takes a same-origin path only from the resolver', () => {
  const pdfPath = { url: '/api/assets/report.pdf', mime_type: 'application/pdf' };

  it('refuses to frame a path the PAYLOAD named', () => {
    // A root-relative path is the embedding page's own origin, so a document
    // framed at one runs on the host's origin - which is what the whole `data:`
    // ban is about. It is the resolver case the arm exists for, and a payload
    // must not be able to name it: `{url: "/api/assets/x.svg"}` was a DOM on the
    // host's origin, and the type gate below admits `image/`, SVG included.
    const { container } = render(
      <ResultField field={file('output', 'document')} value={pdfPath} />,
    );
    expect(screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.preview })).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('frames the same path when the host RESOLVER produced it', async () => {
    // A host resolving onto its own origin is choosing its own origin, which is
    // exactly what the seam is for.
    const { container } = render(
      <ResultEnvProvider resolveUrl={() => '/api/assets/report.pdf'}>
        <ResultField
          field={file('output', 'document')}
          value={{ url: 'pipelex-storage://org/report.pdf', mime_type: 'application/pdf' }}
        />
      </ResultEnvProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.preview }));
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe('/api/assets/report.pdf');
  });

  it('still frames an https document the payload named', () => {
    render(
      <ResultField
        field={file('output', 'document')}
        value={{ url: 'https://cdn.example/a.pdf', mime_type: 'application/pdf' }}
      />,
    );
    expect(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.preview })).toBeTruthy();
  });

  it('never frames a blob: URL, which the paint gate does accept', () => {
    // `blob:` is viewable and deliberately not frameable - a payload cannot mint
    // one, so admitting it to the frame would widen the sink for nothing.
    const { container } = render(
      <ResultField
        field={file('output', 'document')}
        value={{ url: 'blob:https://app.example/8f0e', mime_type: 'application/pdf' }}
      />,
    );
    expect(screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.preview })).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });
});

describe('lists', () => {
  it('unwraps a plural payload by its content key and counts the items', () => {
    render(
      <ResultField
        field={list('output', text('item'), 'items')}
        value={{ items: ['alpha', 'beta'] }}
      />,
    );
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.itemsCount(2))).toBeTruthy();
    expect(screen.getByText('alpha')).toBeTruthy();
    expect(screen.getByText('beta')).toBeTruthy();
  });

  it('renders a nested bare array, which is how a list property arrives', () => {
    render(<ResultField field={list('lines', text('item'))} value={['one']} />);
    expect(screen.getByText('one')).toBeTruthy();
  });

  it('renders an empty list as the empty message, not as an error', () => {
    render(<ResultField field={list('output', text('item'), 'items')} value={{ items: [] }} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.noItemsYet)).toBeTruthy();
  });

  it('renders an absent list as empty rather than throwing', () => {
    render(<ResultField field={list('lines', text('item'))} value={undefined} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.noItemsYet)).toBeTruthy();
  });

  it('renders a list of SCALARS inline, with no per-item card or index', () => {
    // Two bordered cards with index numbers around two words is a screenful of
    // chrome for no information: the entries of a scalar list ARE the values.
    const { container } = render(
      <ResultField field={list('lines', text('entry'))} value={['a', 'b']} />,
    );
    expect(screen.getByText('a')).toBeTruthy();
    expect(screen.getByText('b')).toBeTruthy();
    expect(screen.queryByText('1')).toBeNull();
    // The item's own name is never a per-row label.
    expect(screen.queryByText('Entry')).toBeNull();
    expect(container.querySelector('table')).toBeNull();
  });

  it('renders a list of uniform records as a TABLE, with the labels as headers', () => {
    // Every entry has the same keys, so the labels are column headers. Repeating
    // them down the page is what made a fifteen-entry result read as fifteen
    // forms.
    const row = object('item', [text('label'), number('week')]);
    const { container } = render(
      <ResultField
        field={list('milestones', row)}
        value={[
          { label: 'kickoff', week: 1 },
          { label: 'survey', week: 2 },
        ]}
      />,
    );
    const table = container.querySelector('table');
    expect(table).toBeTruthy();
    // Two headers and no toggle: `label` is unbounded text, but it is the
    // record's NAME, which wraps whole in its cell, and `week` is a number - so
    // an open row would show nothing the row does not. See `fitsACellWhole`.
    expect(table!.querySelectorAll('thead th')).toHaveLength(2);
    expect(table!.querySelectorAll('tbody tr')).toHaveLength(2);
    // The header carries the label ONCE, not once per row.
    expect(screen.getAllByText('label')).toHaveLength(1);
    expect(screen.getByText('kickoff')).toBeTruthy();
    expect(screen.getByText('survey')).toBeTruthy();
  });

  it('keeps a record carrying PROSE a table, showing its first line', () => {
    // Falling back to a card per entry was the wrong trade: a table is how you
    // READ a list of records, and giving that up over the widest column loses it
    // for every other column too. The cell shows the first line; the row expands
    // for the rest.
    const row = object('item', [text('name'), prose('mission')]);
    const { container } = render(
      <ResultField
        field={list('teams', row)}
        value={[{ name: 'Lenses', mission: 'Grind optics' }]}
      />,
    );
    expect(container.querySelector('table')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'mission' })).toBeTruthy();
  });

  it('keeps a record carrying a STRUCTURE a table, counting what the cell cannot hold', () => {
    const row = object('item', [text('name'), list('members', object('member', [text('who')]))]);
    render(
      <ResultField
        field={list('teams', row)}
        value={[{ name: 'Lenses', members: [{ who: 'Amara' }, { who: 'Tomas' }] }]}
      />,
    );
    expect(screen.getByRole('columnheader', { name: 'name' })).toBeTruthy();
    // The cell states the fact; the expansion carries the content.
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.itemsCount(2))).toBeTruthy();
  });

  it('names a nested record in its cell by its first text field, never by its JSON', () => {
    // The Candidates table of a CV screening: the Evaluation column's cells read
    // `{ "candidate_name": "Amara Okafor", "criterion_s…`, and the rejection
    // email's `{ "subje…`.
    const evaluation = object('evaluation', [number('overall_score'), text('candidate_name')]);
    const email = object('rejection_email', [text('subject'), prose('body')]);
    const { container } = render(
      <ResultField
        field={list('candidates', object('item', [evaluation, email]))}
        value={[
          {
            evaluation: { overall_score: 81, candidate_name: 'Amara Okafor' },
            rejection_email: null,
          },
          {
            evaluation: { overall_score: 42, candidate_name: 'Lucas Bernard' },
            rejection_email: { subject: 'Your application', body: 'Thank you for applying.' },
          },
        ]}
      />,
    );
    const cells = [...container.querySelectorAll('tbody td')].map((cell) => cell.textContent);
    expect(cells).toContain('Amara Okafor');
    expect(cells).toContain('Your application');
    expect(container.querySelector('tbody')?.textContent).not.toContain('{');
    // The absent email is that record's absence, not a blank.
    expect(screen.getAllByText(DEFAULT_FIELD_STRINGS.resultAbsent).length).toBeGreaterThan(0);
  });

  it('names a record by its prose when it has no text field, and counts one with neither', () => {
    const noted = object('note', [number('rank'), prose('remark')]);
    const scored = object('score', [number('value'), flag('passed')]);
    const { container } = render(
      <ResultField
        field={list('rows', object('item', [noted, scored]))}
        value={[{ note: { rank: 1, remark: 'Strong fit' }, score: { value: 9, passed: true } }]}
      />,
    );
    const cells = [...container.querySelectorAll('tbody td')].map((cell) => cell.textContent);
    expect(cells).toContain('Strong fit');
    expect(cells).toContain(DEFAULT_FIELD_STRINGS.fieldsCount(2));
  });

  it('reads a native.Date record in a cell as the date it is', () => {
    const when: ObjectRunField = {
      ...object('when', [text('date'), text('time')]),
      conceptRef: 'native.Date',
    };
    const { container } = render(
      <ResultField
        field={list('rows', object('item', [text('label'), when]))}
        value={[{ label: 'Kickoff', when: { date: '2026-09-25', time: '09:00' } }]}
      />,
    );
    const cells = [...container.querySelectorAll('tbody td')].map((cell) => cell.textContent);
    expect(cells.some((cell) => cell?.includes('2026-09-25'))).toBe(true);
    expect(container.querySelector('tbody')?.textContent).not.toContain('{');
  });

  it('never names a native.Html record by its markup source', () => {
    const page: ObjectRunField = {
      ...object('page', [text('inner_html'), text('css_class')]),
      conceptRef: 'native.Html',
    };
    const { container } = render(
      <ResultField
        field={list('rows', object('item', [text('label'), page]))}
        value={[{ label: 'Cover', page: { inner_html: '<h1>Cover</h1>', css_class: 'x' } }]}
      />,
    );
    expect(container.querySelector('tbody')?.textContent).not.toContain('<h1>');
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.fieldsCount(2))).toBeTruthy();
  });

  it('expands a row to the whole record, and only when there is more to show', async () => {
    const row = object('item', [text('name'), prose('mission')]);
    render(
      <ResultField
        field={list('teams', row)}
        value={[{ name: 'Lenses', mission: 'Grind and coat the primary optics' }]}
      />,
    );
    const toggle = screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    // Closed: the cell holds the prose, truncated by CSS, so it is in the DOM
    // once.
    expect(screen.getAllByText('Grind and coat the primary optics')).toHaveLength(1);
    await userEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    // Open: the row BECOMES the record - it does not keep its clipped cells and
    // grow a second row underneath. Still exactly once in the DOM, because
    // showing every value twice (clipped above, whole below) is what this
    // replaced. The other field of the record proves the full rendering is the
    // one now on screen.
    expect(screen.getAllByText('Grind and coat the primary optics')).toHaveLength(1);
    // Twice now: the column header, and the label inside the opened record.
    expect(screen.getAllByText('mission')).toHaveLength(2);
  });

  it('offers no toggle when every column is BOUNDED', () => {
    // A table of values that cannot overflow a cell has nothing more to reveal,
    // and a column of chevrons opening onto the same values is chrome
    // pretending to be a feature. Bounded means the descriptor SAYS so: a
    // number and a `max_length` text, not a bare `text`.
    const short: TextRunField = { ...text('label'), maxLength: 24 };
    render(
      <ResultField
        field={list('steps', object('item', [short, number('week')]))}
        value={[{ label: 'kickoff', week: 1 }]}
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('offers a toggle when a text column states no length bound', () => {
    // The bug this rule exists for. `text` is the standard's "short
    // single-line string", so it was treated as always-fitting - but short is
    // not a property the kind carries, and a model fills an unbounded slot with
    // three sentences. A table of nothing but `text` columns then truncated
    // every cell with no way to read the rest, which is the one outcome a
    // result view must not produce.
    // `gaps` is not the record's name - `candidate` is, and a name wraps whole -
    // so it is a cell that truncates.
    render(
      <ResultField
        field={list('matches', object('item', [text('candidate'), text('gaps')]))}
        value={[
          {
            candidate: 'Amara Okafor',
            gaps: 'The candidate is fundamentally misaligned with this role, and here is why.',
          },
        ]}
      />,
    );
    const toggle = screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('reads the bound through a list, since chips of long text overflow too', () => {
    const long: TextRunField = text('tags');
    render(
      <ResultField
        field={list('rows', object('item', [{ ...list('tags', long) }]))}
        value={[{ tags: ['one', 'two'] }]}
      />,
    );
    expect(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeTruthy();
  });

  it('puts the column description on the header, where hovering finds it', async () => {
    const described: TextRunField = { ...text('label'), description: 'What happens' };
    render(
      <ResultField
        field={list('milestones', object('item', [described]))}
        value={[{ label: 'a' }]}
      />,
    );
    // Nothing at rest - not under each row, and not as a dotted underline on the
    // header. It arrives when the pointer does.
    expect(screen.queryByText('What happens')).toBeNull();
    // Asserted through FOCUS rather than hover, and that is the assertion worth
    // having: a fact reachable only by pointing is a fact a keyboard user does
    // not have. Radix opens on focus with no delay, so it is also the
    // deterministic half.
    screen.getByText('label').focus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('What happens');
  });
});

describe('a record wider than the table budget', () => {
  // Local rather than beside the builders at the top: these are the only tests
  // that need an enum, and a bounded text is a one-field override.
  const choice = (name: string): EnumRunField => ({
    kind: 'enum',
    name,
    conceptRef: 'native.Text',
    required: true,
    options: ['open', 'closed'],
  });
  const bounded = (name: string): TextRunField => ({ ...text(name), maxLength: 12 });

  // Authored order, with the tier each field ranks in. The name is the FIRST
  // text field, wherever it sits; ties within a tier go to authored order.
  const discrepancy = object('item', [
    list('sources', object('source', [text('ref')])), // 4: a list of records
    choice('kind'), // 2: fits a cell whole
    number('line'), // 2
    text('item'), // 1: the record's name
    text('remark'), // 3: unbounded text
    number('invoiced'), // 2
    number('reference'), // 2
    flag('approved'), // 2, but the fifth of its tier: past the default budget
    prose('note'), // 4
    list('tags', text('tag')), // 3: a list of scalars
  ]);
  const rows = [
    {
      sources: [{ ref: 'PO-1' }],
      kind: 'open',
      line: 3,
      item: 'Hex bolt M8 x 40 mm, zinc plated',
      remark: 'Short by ten boxes',
      invoiced: 2116.2,
      reference: 1900,
      approved: false,
      note: 'Held for review',
      tags: ['urgent'],
    },
  ];

  const headers = (container: HTMLElement) =>
    [...container.querySelectorAll('thead th')].map((header) => header.textContent);
  /** The value cell of the first row under the header named `column`. */
  const cellUnder = (container: HTMLElement, column: string) => {
    const index = headers(container).indexOf(column);
    const row = container.querySelector('tbody tr') as HTMLTableRowElement;
    return row.cells[index]?.firstElementChild as HTMLElement;
  };
  const renderWith = (element: RunField, value: unknown, tableColumns?: number) =>
    render(
      tableColumns === undefined ? (
        <ResultField field={list('discrepancies', element)} value={value} />
      ) : (
        <ResultEnvProvider tableColumns={tableColumns}>
          <ResultField field={list('discrepancies', element)} value={value} />
        </ResultEnvProvider>
      ),
    );

  it('shows the top of the ranking, in the order the author wrote the fields', () => {
    const { container } = renderWith(discrepancy, rows);
    // Five of ten: the name, then the first four fields that fit a cell whole.
    // The ranking SELECTS; `item` is ranked first and still sits third.
    expect(headers(container)).toEqual([
      DEFAULT_FIELD_STRINGS.rowDetailsColumn,
      'kind',
      'line',
      'item',
      'invoiced',
      'reference',
    ]);
    // What the budget left out is not on the collapsed row at all.
    expect(screen.queryByText('Short by ten boxes')).toBeNull();
    expect(screen.queryByText('Held for review')).toBeNull();
  });

  it('opens a row onto the whole record, the hidden fields included', async () => {
    const { container } = renderWith(discrepancy, rows);
    await userEvent.click(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    );
    const detail = container.querySelector('td[colspan]') as HTMLElement;
    expect(detail.getAttribute('colspan')).toBe('5');
    for (const hidden of ['sources', 'remark', 'approved', 'note', 'tags']) {
      expect(detail.textContent).toContain(hidden);
    }
    expect(detail.textContent).toContain('Short by ten boxes');
    expect(detail.textContent).toContain('Held for review');
    expect(detail.textContent).toContain('urgent');
    expect(detail.textContent).toContain('PO-1');
  });

  it('ranks other text above prose and nesting, and keeps authored order within a tier', () => {
    // Seven: every field that fits whole, then `remark`, the first of the
    // third tier in authored order - ahead of `tags`, which is authored later.
    const seven = renderWith(discrepancy, rows, 7);
    expect(headers(seven.container).slice(1)).toEqual([
      'kind',
      'line',
      'item',
      'remark',
      'invoiced',
      'reference',
      'approved',
    ]);
    seven.unmount();
    // Nine: the third tier is exhausted, so the fourth begins with `sources`,
    // the first of it in authored order - and is shown where it was written.
    const nine = renderWith(discrepancy, rows, 9);
    expect(headers(nine.container).slice(1)).toEqual([
      'sources',
      'kind',
      'line',
      'item',
      'remark',
      'invoiced',
      'reference',
      'approved',
      'tags',
    ]);
  });

  it('lets a host show every column, or only the name', () => {
    const every = renderWith(discrepancy, rows, Infinity);
    expect(headers(every.container).slice(1)).toEqual(discrepancy.fields.map((f) => f.name));
    every.unmount();
    // Below one reads as one, and the one is the record's name.
    const none = renderWith(discrepancy, rows, 0);
    expect(headers(none.container)).toEqual([DEFAULT_FIELD_STRINGS.rowDetailsColumn, 'item']);
  });

  it('gives the name column a floor and lets it wrap, where every other cell is one line', () => {
    // The name is the column a reader identifies a row by, and cutting it at
    // the cell cap is the fault this rule was built for. It wraps instead,
    // and the floor keeps a narrow panel from squeezing it into a ribbon -
    // which auto table layout would do first, since it is the one column that
    // can give width back. It wraps anywhere, not only between words, or a
    // name that is one long token still widens the table to that token. jsdom
    // has no layout, so this pins the classes; the story `Outputs/Lists`
    // asserts the floor holds in a browser, and `Outputs/Tables` that a name
    // with no space in it leaves the table inside its panel.
    const { container } = renderWith(discrepancy, rows);
    const name = cellUnder(container, 'item');
    expect(name.className).toContain('min-w-[16ch]');
    expect(name.className).toContain('wrap-anywhere');
    expect(name.className).not.toContain('wrap-break-word');
    expect(name.className).toContain('[&>span]:whitespace-normal');
    expect(name.className).not.toContain('truncate');
    expect(name.className).not.toContain('max-w-[44ch]');
    for (const other of ['kind', 'line', 'invoiced', 'reference']) {
      expect(cellUnder(container, other).className).toContain('truncate');
    }
  });

  it('floors no column when the record has no text field to name it', () => {
    const numbers = object('item', ['a', 'b', 'c', 'd', 'e', 'f'].map(number));
    const { container } = renderWith(numbers, [{ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }]);
    expect(headers(container).slice(1)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(container.querySelector('tbody .min-w-\\[16ch\\]')).toBeNull();
  });

  it('offers the toggle for a hidden column even when every shown column fits whole', () => {
    // Six bounded fields: nothing shown can be cut, but one field is only in
    // the detail, so the row must open. Five of the same stay chevron-free.
    const six = object('item', [bounded('code'), ...['a', 'b', 'c', 'd', 'e'].map(number)]);
    const value = [{ code: 'R-1', a: 1, b: 2, c: 3, d: 4, e: 5 }];
    const wide = renderWith(six, value);
    expect(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeTruthy();
    wide.unmount();
    renderWith(object('item', six.fields.slice(0, 5)), value);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('hides and moves nothing within the budget, and still lets the name wrap', () => {
    // Five fields, the default budget: nothing is hidden, so every field is a
    // column in authored order. The name rule is not a budget rule - a long
    // name cut at the cap is as wrong in a narrow table as in a wide one - so
    // the name wraps above its floor here too. Every OTHER cell keeps exactly
    // the classes a cell had before there was a budget, and the budget changes
    // nothing at all: an unlimited one renders the same markup.
    const five = object('item', [
      number('line'),
      text('item'),
      text('remark'),
      choice('kind'),
      flag('approved'),
    ]);
    const value = [
      { line: 1, item: 'Hex bolt', remark: 'Short', kind: 'open', approved: true },
      { line: 2, item: 'Washer', remark: 'Fine', kind: 'closed', approved: false },
    ];
    const budgeted = renderWith(five, value);
    expect(headers(budgeted.container).slice(1)).toEqual([
      'line',
      'item',
      'remark',
      'kind',
      'approved',
    ]);
    const name = cellUnder(budgeted.container, 'item');
    expect(name.className).toContain('min-w-[16ch]');
    expect(name.className).toContain('[&>span]:whitespace-normal');
    expect(name.className).not.toContain('truncate');
    for (const other of ['line', 'remark', 'kind', 'approved']) {
      expect(cellUnder(budgeted.container, other).className).toBe('max-w-[44ch] truncate');
    }
    const markup = budgeted.container.innerHTML;
    budgeted.unmount();
    expect(renderWith(five, value, Infinity).container.innerHTML).toBe(markup);
  });

  /** A `native.Date` member: an `object` node over `{date, time}`, keyed by concept. */
  const nativeDate = (name: string): ObjectRunField => ({
    ...object(name, [day('date'), text('time')]),
    conceptRef: 'native.Date',
  });

  it('ranks a native.Date member with the values that fit a cell whole', () => {
    // Its node is an `object`, but a cell reads it as one compact date - so it
    // ranks with the dates, not with the nested records at the bottom.
    const record = object('item', [
      text('item'),
      text('a'),
      text('b'),
      text('c'),
      text('d'),
      text('e'),
      nativeDate('due'),
    ]);
    const { container } = renderWith(record, [
      { item: 'Hex bolt', due: { date: '2026-09-25', time: null } },
    ]);
    expect(headers(container).slice(1)).toEqual(['item', 'a', 'b', 'c', 'due']);
    expect(cellUnder(container, 'due').textContent).toContain('2026-09-25');
  });

  it('offers no toggle when the only field that could be long is the name', () => {
    // The name wraps whole in its cell, so an open row would show the same
    // values again. A second unbounded field is what earns the chevron.
    renderWith(object('item', [text('item'), number('qty'), nativeDate('due')]), [
      { item: 'Hex bolt', qty: 3, due: { date: '2026-09-25', time: null } },
    ]);
    expect(screen.queryByRole('button')).toBeNull();
    cleanup();
    renderWith(object('item', [text('item'), text('remark')]), [
      { item: 'Hex bolt', remark: 'Short by ten boxes' },
    ]);
    expect(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeTruthy();
  });

  it('offers a toggle for a list whose cell can only count its entries', () => {
    // Each date is short, but a list of them is not chips: the cell says how
    // many there are, and the dates are only in the row's detail.
    renderWith(object('item', [text('item'), list('milestones', nativeDate('item'))]), [
      { item: 'Retrofit', milestones: [{ date: '2026-09-25', time: null }] },
    ]);
    expect(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    ).toBeTruthy();
  });

  it('closes an open row when a larger budget leaves it nothing to show', async () => {
    // Six fields, the name plus five numbers: at a budget of five one number is
    // hidden, so the row opens. Raised past six, nothing is hidden and every
    // shown column fits, so there is no toggle - and the row must not stay open
    // with no way to close it.
    const record = object('item', [text('item'), ...['a', 'b', 'c', 'd', 'e'].map(number)]);
    const value = [{ item: 'Hex bolt', a: 1, b: 2, c: 3, d: 4, e: 5 }];
    const field = list('rows', record);
    const { container, rerender } = render(
      <ResultEnvProvider tableColumns={5}>
        <ResultField field={field} value={value} />
      </ResultEnvProvider>,
    );
    await userEvent.click(
      screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
    );
    expect(container.querySelector('td[colspan]')).not.toBeNull();
    rerender(
      <ResultEnvProvider tableColumns={10}>
        <ResultField field={field} value={value} />
      </ResultEnvProvider>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('td[colspan]')).toBeNull();
    expect(headers(container)).toEqual(['item', 'a', 'b', 'c', 'd', 'e']);
  });
});

describe('lists of files', () => {
  it('renders a list of images as a gallery, not a card each', () => {
    // A card per picture is a screenful each, when the picture is the whole
    // content. A grid shows them the way a person looks at images.
    const { container } = render(
      <ResultField
        field={list('shots', file('item', 'image'))}
        value={[
          { url: 'https://cdn.example/a.png' },
          { url: 'https://cdn.example/b.png' },
          { url: 'https://cdn.example/c.png' },
        ]}
      />,
    );
    expect(container.querySelectorAll('img')).toHaveLength(3);
    // No per-item index: a picture identifies itself.
    expect(screen.queryByText('1')).toBeNull();
  });

  it('drops the grid entirely when NOTHING in it can be painted', () => {
    // A gallery of empty squares is not a gallery. Three large blanks say less
    // than three lines do, so the layout follows what is actually showable
    // rather than what the kind promises. This is what a host with no storage
    // resolver sees, so it has to be a design and not a fallback.
    const { container } = render(
      <ResultField
        field={list('shots', file('item', 'image'))}
        value={[
          { url: 'pipelex-storage://x/a.png', mime_type: 'image/png' },
          { url: 'pipelex-storage://x/b.png', mime_type: 'image/png' },
        ]}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('a.png')).toBeTruthy();
    expect(screen.getByText('b.png')).toBeTruthy();
    expect(screen.getByTitle(/pipelex-storage:\/\/x\/a\.png/)).toBeTruthy();
  });

  it('keeps the grid when at least one image can be painted', () => {
    const { container } = render(
      <ResultField
        field={list('shots', file('item', 'image'))}
        value={[{ url: 'https://cdn.example/a.png' }, { url: 'pipelex-storage://x/b.png' }]}
      />,
    );
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(screen.getByText('b.png')).toBeTruthy();
  });

  it('renders a list of documents as rows, not cards', () => {
    // A document's whole content is a name and a link; a bordered box with an
    // index around two fields spends the chrome of a structure on them.
    render(
      <ResultField
        field={list('sources', file('item', 'document'))}
        value={[
          { url: 'https://example.com/a.pdf', title: 'Adaptive optics' },
          { url: 'https://example.com/b.pdf', title: 'Wavefront sensing' },
        ]}
      />,
    );
    expect(screen.getByText('Adaptive optics')).toBeTruthy();
    expect(screen.getByText('Wavefront sensing')).toBeTruthy();
    expect(screen.queryByText('1')).toBeNull();
  });
});

describe('objects', () => {
  it('reads a child by NAME, not through the prototype chain', () => {
    // `ownProp`: a structure field called `constructor` must read as absent, not
    // as the inherited function - which `String(value)` would have printed.
    render(<ResultField field={object('thing', [text('constructor')])} value={{}} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });

  it('renders nested children of every kind together', () => {
    render(
      <ResultField
        field={object('invoice', [text('reference'), day('issued_on'), flag('paid')])}
        value={{ reference: 'INV-1', issued_on: '2026-03-14', paid: false }}
      />,
    );
    expect(screen.getByText('INV-1')).toBeTruthy();
    expect(screen.getByText('2026-03-14')).toBeTruthy();
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.no)).toBeTruthy();
  });

  it('renders every child as absent when the value is not a record', () => {
    render(<ResultField field={object('thing', [text('a')])} value="not an object" />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });
});

describe('markup', () => {
  const htmlField = (over: Partial<ObjectRunField> = {}): ObjectRunField => ({
    kind: 'object',
    name: 'output',
    conceptRef: 'native.Html',
    required: true,
    fields: [
      { kind: 'text', name: 'inner_html', conceptRef: 'native.Text', required: true },
      { kind: 'text', name: 'css_class', conceptRef: 'native.Text', required: false },
    ],
    ...over,
  });

  it('renders a native.Html value as markup, in a frame', () => {
    // The arm keyed by CONCEPT rather than by kind: the standard's kind
    // vocabulary has no `html`, so this node's kind is `object` and the switch
    // would otherwise print the source at a reader.
    const { container } = render(
      <ResultField field={htmlField()} value={{ inner_html: '<h2>Invoice</h2>' }} />,
    );
    expect(container.querySelector('iframe')).toBeTruthy();
    // NOT rendered as the two text members it structurally is.
    expect(screen.queryByText('<h2>Invoice</h2>')).toBeNull();
  });

  it('never writes the markup into the host document', () => {
    // THE security assertion. The markup is model output; an element of it in
    // the parent tree means it reached the host's origin, which is the thing the
    // frame exists to prevent.
    const { container } = render(
      <ResultField
        field={htmlField()}
        value={{ inner_html: '<h2 id="escaped">x</h2><script>window.pwned = 1</script>' }}
      />,
    );
    expect(container.querySelector('#escaped')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
  });

  it('sandboxes the frame without allow-scripts', () => {
    // `allow-same-origin` alone is the safe pairing - it is what lets the parent
    // measure the content - and granting scripts beside it would undo the whole
    // arrangement.
    const { container } = render(
      <ResultField field={htmlField()} value={{ inner_html: '<p>hi</p>' }} />,
    );
    const sandbox = container.querySelector('iframe')?.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-same-origin');
    expect(sandbox).not.toContain('allow-scripts');
  });

  it('renders a concept REFINING native.Html as markup too', () => {
    // A method may declare `legal.ClauseMarkup` refining `native.Html`, and a
    // reader of that result wants the markup rendered just the same. `refines` is
    // on the wire for exactly this question.
    const { container } = render(
      <ResultField
        field={htmlField({ conceptRef: 'legal.ClauseMarkup', refines: ['native.Html'] })}
        value={{ inner_html: '<p>clause</p>' }}
      />,
    );
    expect(container.querySelector('iframe')).toBeTruthy();
  });

  it('renders an absence when the value carries no markup', () => {
    render(<ResultField field={htmlField()} value={{ css_class: 'invoice' }} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });
});

describe('scalar lists', () => {
  const listOf = (item: TextRunField | ProseRunField) => list('values', item);

  it('renders a list of short scalars as chips', () => {
    const { container } = render(<ResultField field={listOf(text('tag'))} value={['a', 'b']} />);
    expect(container.querySelector('table')).toBeNull();
    expect(screen.getByText('a')).toBeTruthy();
  });

  it('renders a list of PROSE as plain lines, not chips and not cards', () => {
    // `prose` is the standard's way of saying "this may be long", and
    // `native.Text` always derives to it - so this is what a list of plain
    // strings actually is. A chip containing a paragraph is a box with a
    // paragraph in it; a card around the word `Mercury` is worse.
    render(<ResultField field={listOf(prose('planet'))} value={['Mercury', 'Venus']} />);
    expect(screen.getByText('Mercury')).toBeTruthy();
    expect(screen.getByText('Venus')).toBeTruthy();
    // No index labels: the entries of a scalar list are the values.
    expect(screen.queryByText('1')).toBeNull();
    expect(screen.queryByText('2')).toBeNull();
  });
});

describe('the unwrap reaches every layout', () => {
  // REGRESSION. Unwrapping is a property of the FIELD, not of the layout, so a
  // layout that renders a value without it prints `[object Object]` — which is
  // exactly what a list of `native.Text` did the moment chips and lines stopped
  // going through the recursive path. A `native.Text[]`'s entries are
  // `TextContent` records; a chip, a line and a table cell each hold one.
  const wrapped = (name: string) => ({ ...text(name), contentKey: 'text' });
  const wrappedProse = (name: string) => ({ ...prose(name), contentKey: 'text' });

  it('unwraps inside chips', () => {
    render(<ResultField field={list('tags', wrapped('tag'))} value={[{ text: 'optics' }]} />);
    expect(screen.getByText('optics')).toBeTruthy();
    expect(screen.queryByText(/\[object Object\]/)).toBeNull();
  });

  it('unwraps inside plain lines', () => {
    render(
      <ResultField field={list('planets', wrappedProse('planet'))} value={[{ text: 'Mercury' }]} />,
    );
    expect(screen.getByText('Mercury')).toBeTruthy();
    expect(screen.queryByText(/\[object Object\]/)).toBeNull();
  });

  it('unwraps inside a table cell', () => {
    render(
      <ResultField
        field={list('rows', object('row', [wrapped('label'), number('week')]))}
        value={[{ label: { text: 'kickoff' }, week: 1 }]}
      />,
    );
    expect(screen.getByText('kickoff')).toBeTruthy();
    expect(screen.queryByText(/\[object Object\]/)).toBeNull();
  });
});

describe('a file always exposes its URL', () => {
  // A picture is a PREVIEW of a file, not a replacement for it: once the image
  // painted, the URL vanished entirely and the result was something you could
  // look at and could not use. Three ways out, and all three are wanted — open
  // it, read it, paste it.
  const image = file('output', 'image');

  it('links a painted image to the file it previews', () => {
    render(<ResultField field={image} value={{ url: 'https://cdn.example/a.png' }} />);
    const link = screen.getAllByRole('link')[0]!;
    expect(link.getAttribute('href')).toBe('https://cdn.example/a.png');
  });

  it('shows the reference beside a painted image', () => {
    render(
      <ResultField
        field={image}
        value={{ url: 'https://cdn.example/photos/a.png', mime_type: 'image/png' }}
      />,
    );
    expect(screen.getByText('a.png')).toBeTruthy();
  });

  it('offers a copy control carrying the WHOLE url, not the short label', async () => {
    // The two requirements pull opposite ways: ninety characters printed in full
    // wraps across the panel and says nothing, and a name alone cannot be pasted
    // into a terminal. The label is the name; the button is the URL.
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const url = 'pipelex-storage://9c1f-4a2e-8b31/generated/8ec46786ddb6e281.png';
    render(<ResultField field={image} value={{ url }} />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyUrl }));
    expect(writeText).toHaveBeenCalledWith(url);
    vi.unstubAllGlobals();
  });

  it('hides the copy control where the clipboard API is absent', () => {
    // Outside a secure context `navigator.clipboard` is undefined, and a button
    // that does nothing is worse than no button. The link and the title still
    // carry the reference there.
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    render(<ResultField field={image} value={{ url: 'https://cdn.example/a.png' }} />);
    expect(screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.copyUrl })).toBeNull();
    vi.unstubAllGlobals();
  });

  it('keeps a document reference copyable too', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(
      <ResultField
        field={file('output', 'document')}
        value={{ url: 'https://example.com/a.pdf', title: 'A paper' }}
      />,
    );
    expect(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyUrl })).toBeTruthy();
    vi.unstubAllGlobals();
  });
});

describe('labels follow the presentation, exactly as the input side does', () => {
  // A result and the form that produced it show the SAME fields, so they must
  // read the same way. This was wrong once: the result renderer humanised
  // unconditionally, so `issued_on` was a mono `issued_on` on the form and a
  // sans-serif "Issued on" on the result - two spellings of one identifier, in
  // a mode whose whole purpose is to show what the author actually wrote.
  const invoice: ObjectRunField = {
    kind: 'object',
    name: 'output',
    conceptRef: 'results.Invoice',
    required: true,
    fields: [text('issued_on')],
  };

  it('studio shows the authored identifier verbatim, with its concept pill', () => {
    render(<ResultField field={invoice} value={{ issued_on: '2026-03-14' }} />);
    expect(screen.getByText('issued_on')).toBeTruthy();
    expect(screen.queryByText('Issued on')).toBeNull();
    expect(screen.getByText('results.Invoice')).toBeTruthy();
  });

  it('app humanises it and drops the pill', () => {
    render(
      <FieldPresentationProvider presentation="app">
        <ResultField field={invoice} value={{ issued_on: '2026-03-14' }} />
      </FieldPresentationProvider>,
    );
    expect(screen.getByText('Issued on')).toBeTruthy();
    expect(screen.queryByText('issued_on')).toBeNull();
    // The concept is the method's vocabulary, not the reader's.
    expect(screen.queryByText('results.Invoice')).toBeNull();
  });

  it('carries the rule into table headers, which are labels too', () => {
    const list: ListRunField = {
      kind: 'list',
      name: 'lines',
      conceptRef: 'results.LineItem',
      required: true,
      item: {
        kind: 'object',
        name: 'line',
        conceptRef: 'results.LineItem',
        required: true,
        fields: [text('unit_price')],
      },
    };
    const { rerender } = render(<ResultField field={list} value={[{ unit_price: '10' }]} />);
    expect(screen.getByRole('columnheader', { name: 'unit_price' })).toBeTruthy();
    rerender(
      <FieldPresentationProvider presentation="app">
        <ResultField field={list} value={[{ unit_price: '10' }]} />
      </FieldPresentationProvider>,
    );
    expect(screen.getByRole('columnheader', { name: 'Unit price' })).toBeTruthy();
  });
});

describe('a text value can always be copied', () => {
  // A result view is where a person goes to take something away. Without a copy
  // control the alternative is selecting a rendered heading, list and table by
  // dragging, which picks up the layout and loses the markdown - so what the
  // button writes is the SOURCE the run produced, not the typeset rendering.
  const writeText = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  it('copies the markdown source, not the rendered text', async () => {
    const source = '# Heading\n\nA **bold** claim.';
    render(<ResultField field={prose('report')} value={source} />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyText }));
    expect(writeText).toHaveBeenCalledWith(source);
  });

  it('offers one on a plain text value too, markdown or not', async () => {
    render(<ResultField field={text('reference')} value="INV-2026-0042" />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyText }));
    expect(writeText).toHaveBeenCalledWith('INV-2026-0042');
  });

  it('survives hideLabel, which is the top-level case the panel uses', () => {
    // The header moves up to `StuffViewer` and the button does not follow it. A
    // text result with no way to copy it would be exactly the one worth copying.
    render(<ResultField field={prose('report')} value="Something to take away." hideLabel />);
    expect(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyText })).toBeTruthy();
  });

  it('offers none where there is nothing to copy', () => {
    // A button that reports success and hands over an empty string is worse
    // than one that was never offered.
    render(<ResultField field={prose('report')} value={undefined} />);
    expect(screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.copyText })).toBeNull();
  });

  it('offers none on a value that is not text', () => {
    render(<ResultField field={number('total')} value={42} />);
    expect(screen.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.copyText })).toBeNull();
  });
});

describe('native.Composite', () => {
  // The one arm in this file that reads the value, and the one place where
  // that is the only option: a composite declares no members, so its node is
  // `kind: "unknown"` and its payload schema is an open object. Both are true.
  // What the descriptor cannot say, the CONCEPT does — a composite is a named
  // composition of contents — so the members are read as the contents they are
  // by definition, rather than printed as forty lines of escaped JSON.
  const composite: RunField = {
    kind: 'unknown',
    name: 'output',
    conceptRef: 'native.Composite',
    required: true,
  };

  it('names each member and typesets a text content as markdown', () => {
    render(
      <ResultField
        field={composite}
        value={{
          batch_result: { text: '## Findings\n\nRevenue is **up**.' },
          search_summary: { text: 'Nothing else to report.' },
        }}
      />,
    );
    expect(screen.getByText('batch_result')).toBeTruthy();
    expect(screen.getByText('search_summary')).toBeTruthy();
    // Typeset, not printed: a heading is an element and the asterisks are gone.
    expect(screen.getByRole('heading', { name: 'Findings' })).toBeTruthy();
    expect(screen.getByText('up').tagName).toBe('STRONG');
    expect(screen.queryByText(/## Findings/)).toBeNull();
  });

  it('unwraps a ListContent member into one line per entry', () => {
    const { container } = render(
      <ResultField
        field={composite}
        value={{ pages: { items: [{ text: 'one' }, { text: 'two' }] } }}
      />,
    );
    expect(screen.getByText('pages')).toBeTruthy();
    expect(container.textContent).toContain('one');
    expect(container.textContent).toContain('two');
    // Not the envelope: `items` is the wrapper's name and never a member's.
    expect(screen.queryByText('items')).toBeNull();
  });

  it('names a file member rather than printing its record', () => {
    render(
      <ResultField
        field={composite}
        value={{ brief: { url: 'https://example.com/a.pdf', filename: 'brief.pdf' } }}
      />,
    );
    expect(screen.getByText('brief')).toBeTruthy();
    expect(screen.getAllByText('brief.pdf').length).toBeGreaterThan(0);
  });

  it('falls back to raw for a member whose model it does not know', () => {
    // The honest floor: shown, not dropped, and not guessed at.
    const { container } = render(
      <ResultField field={composite} value={{ odd: { alpha: 1, beta: 2 } }} />,
    );
    expect(screen.getByText('odd')).toBeTruthy();
    expect(container.textContent).toContain('alpha');
    expect(container.textContent).not.toContain('[object Object]');
  });

  it('says absent for an empty composite', () => {
    render(<ResultField field={composite} value={{}} />);
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsentDescription)).toBeTruthy();
  });
});
