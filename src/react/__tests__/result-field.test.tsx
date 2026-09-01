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
import { describe, expect, it, vi } from 'vitest';
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
  TextRunField,
} from '../../core';
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
    expect(table!.querySelectorAll('thead th')).toHaveLength(2);
    expect(table!.querySelectorAll('tbody tr')).toHaveLength(2);
    // The header carries the label ONCE, not once per row.
    expect(screen.getAllByText('Label')).toHaveLength(1);
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
    expect(screen.getByRole('columnheader', { name: 'Mission' })).toBeTruthy();
  });

  it('keeps a record carrying a STRUCTURE a table, counting what the cell cannot hold', () => {
    const row = object('item', [text('name'), list('members', object('member', [text('who')]))]);
    render(
      <ResultField
        field={list('teams', row)}
        value={[{ name: 'Lenses', members: [{ who: 'Amara' }, { who: 'Tomas' }] }]}
      />,
    );
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy();
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
    // Before: the cell holds the prose truncated, so it is in the DOM once.
    expect(screen.getAllByText('Grind and coat the primary optics')).toHaveLength(1);
    await userEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    // After: the detail row renders the record in full, beside the cell.
    expect(screen.getAllByText('Grind and coat the primary optics')).toHaveLength(2);
  });

  it('offers no toggle when every column is shown whole', () => {
    // A table of short scalars has nothing more to reveal, and a column of
    // chevrons that open onto the same values is chrome pretending to be a
    // feature.
    render(
      <ResultField
        field={list('steps', object('item', [text('label'), number('week')]))}
        value={[{ label: 'kickoff', week: 1 }]}
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('puts the column description on the header, where hovering finds it', () => {
    const described: TextRunField = { ...text('label'), description: 'What happens' };
    const { container } = render(
      <ResultField
        field={list('milestones', object('item', [described]))}
        value={[{ label: 'a' }]}
      />,
    );
    expect(container.querySelector('thead th')?.getAttribute('title')).toBe('What happens');
    expect(screen.queryByText('What happens')).toBeNull();
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
