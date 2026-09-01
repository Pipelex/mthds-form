// @vitest-environment jsdom
/**
 * The result panel — two views, and the rules that keep them two.
 *
 * The JSON view is not a feature of some results: it is the receipt for all of
 * them, so it is a property of the panel every host mounts rather than something
 * a story opts into. What it must never become is a menu of equal options —
 * Rendered is the result, JSON is what came back, and a third human rendering
 * beside them is the thing this design exists to refuse.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ObjectRunField, TextRunField } from '../../core';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { ResultPanel } from '../result-panel';

const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const invoice: ObjectRunField = {
  kind: 'object',
  name: 'output',
  conceptRef: 'demo.Invoice',
  required: true,
  description: 'A commercial invoice',
  fields: [text('reference')],
};

describe('the result panel', () => {
  it('opens on the rendered view', () => {
    render(<ResultPanel field={invoice} value={{ reference: 'INV-1' }} />);
    expect(
      screen
        .getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewRendered })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(screen.getByText('INV-1')).toBeTruthy();
  });

  it('shows the payload verbatim on the JSON view', async () => {
    const { container } = render(
      <ResultPanel field={invoice} value={{ reference: 'INV-1', paid: false }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    // Asserted on the rendered TEXT, not on a single node: the view splits the
    // JSON into spans so the structure can recede and the data come forward, and
    // a matcher that needed one node would be asserting the colouring rather
    // than the content.
    const rendered = container.querySelector('pre')!.textContent!;
    expect(rendered).toContain('"reference": "INV-1"');
    expect(rendered).toContain('"paid": false');
  });

  it('keeps the JSON exactly what a copy would give, after colouring', () => {
    // The colouring is presentation: chunking it into spans must not add,
    // reorder or drop a character, or the view stops being a receipt.
    const value = { a: 1, b: [true, null, 'x"y'], c: { d: -1.5e3 } };
    const { container } = render(<ResultPanel field={invoice} value={value} defaultView="json" />);
    expect(container.querySelector('pre')!.textContent).toBe(JSON.stringify(value, null, 2));
  });

  it('keeps ONE header, across both views', async () => {
    // The panel draws it and tells the field tree to skip its own: two headers
    // that agree today drift tomorrow. It also must not move when the view
    // changes — switching should not relocate the thing you are reading.
    //
    // Found by the TITLE, because the description hides on hover here as it does
    // everywhere else: a sentence beside the value a reader came for is one line
    // of chrome at the top and ten inside a structure of ten.
    render(<ResultPanel field={invoice} value={{ reference: 'INV-1' }} />);
    expect(screen.getAllByText('output')).toHaveLength(1);
    // Nothing at rest: the description is tooltip content, not a line of chrome
    // above the value the reader came for.
    expect(screen.queryByText('A commercial invoice')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    expect(screen.getAllByText('output')).toHaveLength(1);
  });

  it('shows the description on hover, and on focus', async () => {
    // Focus matters as much as hover: a fact reachable only by pointing is a
    // fact a keyboard user does not have.
    render(<ResultPanel field={invoice} value={{ reference: 'INV-1' }} />);
    screen.getByText('output').parentElement!.focus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('A commercial invoice');
  });

  it('offers exactly two views', () => {
    // The guard on the design: a third human rendering of the same payload —
    // engine-produced HTML or plain text — carries no descriptor, cannot match a
    // host's design system, and cannot be improved without shipping the engine.
    render(<ResultPanel field={invoice} value={{}} />);
    const group = screen.getByRole('group', { name: DEFAULT_FIELD_STRINGS.resultViewGroup });
    expect(group.querySelectorAll('button')).toHaveLength(2);
  });

  it('copies the whole payload from the JSON view', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<ResultPanel field={invoice} value={{ reference: 'INV-1' }} />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyJson }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"reference"'));
    vi.unstubAllGlobals();
  });

  it('renders an absent result as an absence on BOTH views', async () => {
    render(<ResultPanel field={invoice} value={undefined} />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });

  it('opens on JSON when a host asks it to', () => {
    render(<ResultPanel field={invoice} value={{ reference: 'INV-1' }} defaultView="json" />);
    expect(screen.getByText(/"reference"/)).toBeTruthy();
  });
});
