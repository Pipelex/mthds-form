// @vitest-environment jsdom
/**
 * The object control reads a child's name as a NAME, not as an index into a
 * prototype.
 *
 * Every key this package indexes a record by is chosen by the method author,
 * and the record here is a plain object a host built - so a child named
 * `constructor` or `toString` does not read as `undefined` from a bare
 * `data[name]`, it reads as the inherited function. The kernel closed that at
 * every one of its own sites (`ownProp`); this file is the control set's half,
 * and it is asserted by rendering because what goes wrong is a DOM fact: a
 * switch that says ON over an absent value, and a list that throws.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { BooleanRunField, ListRunField, ObjectRunField, TextRunField } from '../../core';
import { FramedFormContext, ObjectField } from '../object-field';
import { FieldRenderer } from '../field-renderer';

const flag = (name: string): BooleanRunField => ({
  kind: 'boolean',
  name,
  conceptRef: 'native.YesNo',
  required: true,
});
const note = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: false,
});
const listOf = (name: string): ListRunField => ({
  kind: 'list',
  name,
  conceptRef: 'native.Text[]',
  required: true,
  item: { kind: 'text', name: 'item', conceptRef: 'native.Text', required: true },
});

const structOf = (fields: ObjectRunField['fields']): ObjectRunField => ({
  kind: 'object',
  name: 'brief',
  conceptRef: 'demo.Brief',
  required: true,
  fields,
});

/** The control is controlled; a host holds the record. */
function Harness({
  field,
  initial = {},
}: {
  field: ObjectRunField;
  initial?: Record<string, unknown>;
}) {
  const [value, setValue] = useState<Record<string, unknown> | undefined>(initial);
  return <ObjectField field={field} value={value} onChange={setValue} id="brief" />;
}

describe('a child whose name collides with Object.prototype', () => {
  it('renders a boolean child as OFF when the record holds nothing for it', () => {
    // `checked={value ?? false}` - an inherited function is neither nullish nor
    // falsy, so the switch used to render ON over a value that is not there,
    // contradicting the readiness the same name reports.
    render(<Harness field={structOf([flag('constructor')])} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders a list child without throwing', () => {
    // `value ?? []` keeps the function; `Object.length` is 1, so the empty-state
    // branch is skipped and `items.map` is `undefined` - a TypeError that takes
    // the whole form down, not just this row.
    expect(() => render(<Harness field={structOf([listOf('constructor')])} />)).not.toThrow();

    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
  });

  it('still counts a prototype-named optional child as empty', () => {
    // The half that already worked, pinned so the read change is provably
    // read-only here: `isFilled` answers `false` for a function, so the
    // collapse count was right even while the value passed down was wrong.
    render(<Harness field={structOf([flag('shown'), note('toString')])} />);

    expect(screen.getByRole('button', { name: /1 optional/i })).toBeInTheDocument();
  });
});

/**
 * How a structure groups its fields, by where it stands. A structure that is a
 * form's own field draws one card; one inside another hangs its fields from a
 * rule rather than drawing a second card inside the first, which on a phone
 * took the width a field needed; and a list's row, which is a box already,
 * adds nothing around its structure's fields.
 */
describe('how a structure groups its fields', () => {
  const stay: ObjectRunField = {
    kind: 'object',
    name: 'stay',
    conceptRef: 'demo.Stay',
    required: true,
    fields: [{ kind: 'text', name: 'city', conceptRef: 'native.Text', required: true }],
  };
  const traveller: ObjectRunField = {
    kind: 'object',
    name: 'traveller',
    conceptRef: 'demo.Traveller',
    required: true,
    fields: [
      { kind: 'text', name: 'name', conceptRef: 'native.Text', required: true },
      { ...stay, name: 'home' },
    ],
  };
  const travellers: ListRunField = {
    kind: 'list',
    name: 'travellers',
    conceptRef: 'demo.Traveller[]',
    required: true,
    item: traveller,
  };
  const request = structOf([stay, travellers]);

  /** The grouping drawn around the fields of the structure a text input sits in. */
  function groupingAround(input: HTMLElement): string | null {
    return input.closest('[data-structure-group]')?.getAttribute('data-structure-group') ?? null;
  }

  it('boxes a form’s own structure and rules the one inside it', () => {
    const { container } = render(
      <Harness field={request} initial={{ stay: { city: 'Lisbon' }, travellers: [] }} />,
    );
    const groups = [...container.querySelectorAll('[data-structure-group]')].map((group) =>
      group.getAttribute('data-structure-group'),
    );
    // The request's own card, then the stay's rule inside it.
    expect(groups).toEqual(['box', 'rule']);
    expect(groupingAround(screen.getByDisplayValue('Lisbon'))).toBe('rule');
  });

  it("draws a framed form's own structure as a section, with no card in the host's panel", () => {
    // The host's panel is already the card; a second one inside it read as a
    // box in a box under every style.
    const { container } = render(
      <FramedFormContext value>
        <Harness
          field={request}
          initial={{ stay: { city: 'Lisbon' }, travellers: [{ name: 'Ada', home: {} }] }}
        />
      </FramedFormContext>,
    );
    const groups = [...container.querySelectorAll('[data-structure-group]')].map((group) =>
      group.getAttribute('data-structure-group'),
    );
    // The request's section, the stay's rule, the row's nothing, the home's rule.
    expect(groups).toEqual(['section', 'rule', 'none', 'rule']);
    const section = container.querySelector('[data-structure-group="section"]')!;
    expect(section.className).not.toMatch(/\bborder\b|\brounded/);
    // Still the group its heading names, and the one `MethodForm` sets its rule against.
    const brief = screen.getByRole('group', { name: 'brief' });
    expect(brief).toHaveAttribute('data-form-section');
    expect(within(brief).getByDisplayValue('Lisbon')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-form-section]')).toHaveLength(1);
  });

  it("draws nothing around a row's structure, and rules a structure inside the row", () => {
    render(
      <Harness
        field={request}
        initial={{
          stay: { city: 'Lisbon' },
          travellers: [{ name: 'Ada', home: { city: 'London' } }],
        }}
      />,
    );
    expect(groupingAround(screen.getByDisplayValue('Ada'))).toBe('none');
    expect(groupingAround(screen.getByDisplayValue('London'))).toBe('rule');
  });

  it('makes each named structure a group its name labels, and a row no group', () => {
    render(
      <Harness
        field={request}
        initial={{
          stay: { city: 'Lisbon' },
          travellers: [{ name: 'Ada', home: { city: 'London' } }],
        }}
      />,
    );
    // The form's own structure, then the stay inside it, each named by what
    // the reader sees over its fields.
    const brief = screen.getByRole('group', { name: 'brief' });
    const stay = within(brief).getByRole('group', { name: 'stay' });
    expect(within(stay).getByDisplayValue('Lisbon')).toBeInTheDocument();
    // A row's structure draws no name, so the row's fields belong to no group
    // of their own, while the home inside the row is one.
    const ada = screen.getByDisplayValue('Ada');
    expect(ada.closest('[role="group"]')).toBe(brief);
    const home = screen.getByRole('group', { name: 'home' });
    expect(within(home).getByDisplayValue('London')).toBeInTheDocument();
  });

  it("names each form's structure by its own heading when the same method is mounted twice", () => {
    const titled = (title: string): ObjectRunField => ({ ...structOf([stay]), title });
    render(
      <>
        <Harness field={titled('Trip brief')} initial={{ stay: { city: 'Lisbon' } }} />
        <Harness field={titled('Press brief')} initial={{ stay: { city: 'Porto' } }} />
      </>,
    );
    // Both structures sit at the same path, so an id built from the path alone
    // labels the second group with the first one's heading.
    const trip = screen.getByRole('group', { name: 'Trip brief' });
    const press = screen.getByRole('group', { name: 'Press brief' });
    expect(within(trip).getByDisplayValue('Lisbon')).toBeInTheDocument();
    expect(within(press).getByDisplayValue('Porto')).toBeInTheDocument();
  });

  it("counts a row's structure, so a structure in a form's own list is ruled and not boxed", () => {
    // The list is the form's own field, so nothing above it is a structure.
    // Were the row's structure not counted, the one inside it would read as a
    // form's own and draw a card inside the row's box.
    function ListHarness() {
      const [value, setValue] = useState<unknown>([{ name: 'Ada', home: { city: 'London' } }]);
      return <FieldRenderer field={travellers} value={value} onChange={setValue} id="travellers" />;
    }
    render(<ListHarness />);
    expect(groupingAround(screen.getByDisplayValue('Ada'))).toBe('none');
    expect(groupingAround(screen.getByDisplayValue('London'))).toBe('rule');
  });
});

/**
 * What a form's own structure shows when it fails the run gate. A card turns
 * its outline red; a framed form's section has no outline to turn, so it says
 * so at its heading and along its edge instead, and neither cue moves a box:
 * the edge stands out of the flow, in the host's panel's padding, and the
 * caption takes the heading's row.
 */
describe('a structure in error', () => {
  const shop: ObjectRunField = {
    kind: 'object',
    name: 'shop',
    conceptRef: 'demo.Shop',
    required: true,
    fields: [{ kind: 'text', name: 'name', conceptRef: 'native.Text', required: true }],
  };

  function renderShop({ framed, error }: { framed: boolean; error?: string }) {
    return render(
      <FramedFormContext value={framed}>
        <ObjectField field={shop} value={{}} onChange={() => {}} id="shop" error={error} />
      </FramedFormContext>,
    );
  }

  /** Every element's classes but the error's own two, in document order. */
  function boxes(container: HTMLElement): string[] {
    return [...container.querySelectorAll('*')]
      .filter((element) => !element.matches('[data-error-edge], [role="alert"]'))
      .map((element) => `${element.tagName}.${element.getAttribute('class') ?? ''}`);
  }

  it("turns a card's outline red, with the caption under it", () => {
    const { container } = renderShop({ framed: false, error: 'Required' });
    const card = container.querySelector('[data-structure-group="box"]')!;
    expect(card.className).toMatch(/\bborder-destructive\/50\b/);
    const caption = screen.getByRole('alert');
    expect(card.compareDocumentPosition(caption) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector('[data-error-edge]')).toBeNull();
  });

  it('marks a framed section along its edge, with no card drawn back', () => {
    const { container } = renderShop({ framed: true, error: 'Required' });
    const section = container.querySelector('[data-structure-group="section"]')!;
    expect(section.className).not.toMatch(/\bborder\b|\brounded|\bring\b/);
    const edge = container.querySelector('[data-error-edge]')!;
    expect(edge).not.toBeNull();
    expect(edge).toHaveAttribute('aria-hidden', 'true');
    // Out of the flow, so it moves nothing, and in the error colour.
    expect(edge.className).toMatch(/\babsolute\b/);
    expect(edge.className).toMatch(/\bbg-destructive\b/);
    // It runs beside the whole section, its heading included.
    const group = screen.getByRole('group', { name: 'shop' });
    expect(group.contains(edge)).toBe(true);
    expect(edge.parentElement!.contains(screen.getByText('shop'))).toBe(true);
    expect(edge.parentElement!.contains(screen.getByLabelText('name'))).toBe(true);
  });

  it("puts a framed section's caption at its heading, over its fields", () => {
    renderShop({ framed: true, error: 'Required' });
    const caption = screen.getByRole('alert');
    expect(caption).toHaveTextContent('Required');
    // In the heading's own row, so it is read where the section starts and
    // not under its last field, however tall the section is.
    expect(screen.getByText('shop').parentElement).toBe(caption.parentElement);
    const name = screen.getByLabelText('name');
    expect(caption.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // The group is still named by its heading alone.
    expect(screen.getByRole('group', { name: 'shop' })).toBeInTheDocument();
  });

  it('changes no box of a framed section when the error comes and goes', () => {
    const calm = renderShop({ framed: true });
    const before = boxes(calm.container);
    expect(calm.container.querySelector('[data-error-edge]')).toBeNull();
    calm.unmount();
    const failed = renderShop({ framed: true, error: 'Required' });
    expect(boxes(failed.container)).toEqual(before);
  });
});
