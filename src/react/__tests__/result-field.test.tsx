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
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  BooleanRunField,
  DateRunField,
  FileRunField,
  ListRunField,
  NumberRunField,
  ObjectRunField,
  ProseRunField,
  RunField,
  TextRunField,
} from '../../core';
import { FieldPresentationProvider } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { ResultField } from '../result-field';

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
    // Three headers, not two: `label` is an UNBOUNDED text column, so the rows
    // get an expand toggle and the toggle gets its own (visually hidden) header.
    // See `fitsACellWhole`.
    expect(table!.querySelectorAll('thead th')).toHaveLength(3);
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
    render(
      <ResultField
        field={list('matches', object('item', [text('gaps')]))}
        value={[
          { gaps: 'The candidate is fundamentally misaligned with this role, and here is why.' },
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
