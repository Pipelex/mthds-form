/**
 * The DOM id is DERIVED from the field path, not equal to it.
 *
 * `FieldRenderer`'s `id` is a value path - it is what an upload is written back
 * at, and what `uploadingIds` is keyed by (`upload-seam.md`). It was also written
 * verbatim as the control's `id` and its `<label for>` target, where it must be
 * document-unique instead. Two forms declaring an input of the same name
 * therefore emitted duplicate ids, and per HTML a `<label for>` binds the first
 * element in tree order: the second form's label went dead and its control fell
 * down the accessible-name chain to its placeholder.
 *
 * Both halves are asserted here, because fixing one by breaking the other is the
 * easy mistake: the DOM ids must differ, AND the busy set must still match on the
 * path. Rendered rather than unit-tested, because every claim is a DOM fact.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FileRunField, ObjectRunField, TextRunField } from '../../core';
import { FieldRenderer } from '../field-renderer';
import { FieldDomIdProvider } from '../field-dom-id';

const noop = () => {};

const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});

const doc: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  accept: 'PDF',
};

const brief: ObjectRunField = {
  kind: 'object',
  name: 'brief',
  conceptRef: 'demo.Brief',
  required: true,
  fields: [text('title')],
};

describe('two forms sharing an input name', () => {
  it('gives each control a distinct DOM id, with no host change', () => {
    render(
      <>
        <FieldRenderer field={text('text')} value={undefined} onChange={noop} id="text" />
        <FieldRenderer field={text('text')} value={undefined} onChange={noop} id="text" />
      </>,
    );
    const ids = screen.getAllByRole('textbox').map((el) => el.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('keeps BOTH labels live - the regression, stated as the accessible name', () => {
    // The assertion that fails on the old code. With duplicate ids both labels
    // resolve to the first input, so the second computes its name from the
    // placeholder and only ONE element carries the name "text".
    render(
      <>
        <FieldRenderer field={text('text')} value={undefined} onChange={noop} id="text" />
        <FieldRenderer field={text('text')} value={undefined} onChange={noop} id="text" />
      </>,
    );
    const named = screen.getAllByRole('textbox', { name: 'text' });
    expect(new Set(named).size).toBe(2);
  });
});

describe('the path keeps its own job', () => {
  it('still keys the busy set, while the DOM id no longer is the path', () => {
    // The two roles, separated: `uploadingIds` holds the PATH and still shuts the
    // control, but the id written to the document is not that string.
    render(
      <FieldRenderer
        field={doc}
        value={undefined}
        onChange={noop}
        id="cv"
        env={{ uploadingIds: new Set(['cv']) }}
      />,
    );
    const input = screen.getByLabelText('cv') as HTMLInputElement;
    expect(input.id).not.toBe('cv');
    expect(input.disabled).toBe(true);
  });

  it('namespaces the composed child path rather than flattening it', () => {
    render(
      <FieldDomIdProvider prefix="run">
        <FieldRenderer field={brief} value={undefined} onChange={noop} id="brief" />
      </FieldDomIdProvider>,
    );
    expect(screen.getByRole('textbox').id).toBe('run-brief.title');
  });
});

describe('the provider is for predictability, not for uniqueness', () => {
  it('writes the prefix a host asked for', () => {
    render(
      <FieldDomIdProvider prefix="run">
        <FieldRenderer field={text('text')} value={undefined} onChange={noop} id="text" />
      </FieldDomIdProvider>,
    );
    expect(screen.getByRole('textbox').id).toBe('run-text');
  });

  it('writes the path unprefixed for `prefix=""`, the escape hatch', () => {
    // Restores the old ids exactly - and the old collision with them, which is
    // why it is opt-in and safe for one form only.
    render(
      <FieldDomIdProvider prefix="">
        <FieldRenderer field={text('text')} value={undefined} onChange={noop} id="text" />
      </FieldDomIdProvider>,
    );
    expect(screen.getByRole('textbox').id).toBe('text');
  });
});
