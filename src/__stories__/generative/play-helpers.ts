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
 */
export async function revealInput(
  canvasElement: HTMLElement,
  label: RegExp,
  fieldName?: string,
): Promise<HTMLElement> {
  const canvas = within(canvasElement);
  const byName = fieldName
    ? `[id$="-number-${fieldName}"], [id$="-select-${fieldName}"], input#${fieldName}, textarea#${fieldName}`
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
