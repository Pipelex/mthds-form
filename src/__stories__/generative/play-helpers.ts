import { userEvent, within } from 'storybook/test';

/**
 * Find an input by its label - or, failing that, by the DOM id the layer's
 * own controls mint from the bound field's name - opening whatever hides it:
 * an app-shaped page may keep an input on a later Step, under another Tab or
 * inside a closed Collapsible, and none of those is a defect. Every gesture
 * is made in the FIRST pane (the ThemePair decorator renders two), which is
 * the pane the play functions type into and read the receipt of.
 *
 * The id fallback is what lets a producer label the budget "For the whole
 * trip": a label is the producer's choice, the field's name is the brief's.
 * The ids it knows are the ones the two catalogs mint - `<prefix>-<control>-<name>`
 * for a catalog control bound by name, `<parent>.<name>` for a member of a
 * structure the kernel's own controls render behind `MthdsField`.
 */
export async function revealInput(
  canvasElement: HTMLElement,
  label: RegExp,
  fieldName?: string,
): Promise<HTMLElement> {
  const canvas = within(canvasElement);
  const byName = fieldName
    ? [
        `[id$="-number-${fieldName}"]`,
        `[id$="-select-${fieldName}"]`,
        `[id$="-input-${fieldName}"]`,
        `[id$="-textarea-${fieldName}"]`,
        `input[id$=".${fieldName}"]`,
        `textarea[id$=".${fieldName}"]`,
        `input#${fieldName}`,
        `textarea#${fieldName}`,
      ].join(', ')
    : null;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const found = canvas.queryAllByLabelText(label);
    if (found.length > 0) return found[0]!;
    const named = byName ? canvasElement.querySelector<HTMLElement>(byName) : null;
    if (named) return named;
    const next = canvas.queryAllByTestId('steps-next')[0];
    if (next) {
      await userEvent.click(next);
      continue;
    }
    const tab = canvas.queryAllByRole('tab', { selected: false })[0];
    if (tab) {
      await userEvent.click(tab);
      continue;
    }
    const closed = canvas.queryAllByRole('button', { expanded: false })[0];
    if (closed) {
      await userEvent.click(closed);
      continue;
    }
    break;
  }
  throw new Error(`No input labelled ${label} on the page, on any step, tab or section.`);
}

/**
 * Find a button by its accessible name, opening whatever hides it the way
 * `revealInput` does: the one button that runs an app-shaped page sits in
 * the last Step, and a play that asserts its paint has to get there first.
 */
export async function revealButton(canvasElement: HTMLElement, name: RegExp): Promise<HTMLElement> {
  const canvas = within(canvasElement);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const found = canvas.queryAllByRole('button', { name });
    if (found.length > 0) return found[0]!;
    const next = canvas.queryAllByTestId('steps-next')[0];
    if (next) {
      await userEvent.click(next);
      continue;
    }
    const tab = canvas.queryAllByRole('tab', { selected: false })[0];
    if (tab) {
      await userEvent.click(tab);
      continue;
    }
    break;
  }
  throw new Error(`No button named ${name} on the page, on any step or tab.`);
}
