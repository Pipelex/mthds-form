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
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText(/pipelex-storage:\/\/abc\/report\.pdf/)).toBeTruthy();
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
    expect(screen.getByText(/pipelex-storage:\/\/x\/a\.png/)).toBeTruthy();
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

  it('labels items by index and does not repeat the parent label on every row', () => {
    render(<ResultField field={list('lines', text('entry'))} value={['a', 'b']} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    // `hideLabel` on the item: the item's own name must not appear per row.
    expect(screen.queryByText('Entry')).toBeNull();
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
