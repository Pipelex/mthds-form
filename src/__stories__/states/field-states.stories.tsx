import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/states';

/**
 * The state axis, deliberately factored OUT of the per-kind catalog.
 *
 * Crossing every kind with every state would produce a folder nobody can scan,
 * which is the one thing the catalog exists not to be. So the states live here
 * once, on a representative concept, and each kind's own file carries only the
 * states where that kind behaves DIFFERENTLY from this.
 *
 * Its own top-level section rather than an entry under Field Kinds: it is not a
 * kind, and filing it there made it read as a twelfth one.
 */

const meta = {
  title: 'States/Field States',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'states' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * How a form opens: everything optional folded away, only what the caller must
 * supply on screen. `Preferences` declares five properties and four are
 * optional, so one input is all that shows.
 */
export const AsItOpens: Story = { args: { pipeCode: 'defaults' } };

/**
 * The same form with the disclosure opened, which is the ONLY way to see an
 * authored default.
 *
 * Worth stopping on rather than skipping past. A field carrying a default is
 * always `required: false` — validation applies the default on absence, so the
 * caller is never obliged to supply it — and the fold hides every empty optional
 * entry. So a default is invisible until the user asks for it, even though it is
 * a statement about what happens if they do nothing. Whether that is right is a
 * design question; this story does not work around it, it just stops leaving it
 * folded.
 */
export const AuthoredDefaults: Story = {
  args: { pipeCode: 'defaults' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two panes, so two disclosures - the decorator renders the story twice.
    const toggles = canvas.getAllByRole('button', { name: /optional field/i });
    await expect(toggles).toHaveLength(2);
    for (const toggle of toggles) await userEvent.click(toggle);
    await expect(canvas.getAllByText('Output format')).toHaveLength(2);
  },
};

/**
 * The three presence markers on identical slots. `plain` and `force` place the
 * same obligation on the caller and differ only in what the author asserted, so
 * only the `?` slot carries the OPTIONAL badge.
 */
export const PresenceMarkers: Story = { args: { pipeCode: 'presence' } };

/** Filled, including the properties that carry a default. */
export const Filled: Story = {
  args: {
    pipeCode: 'defaults',
    initialValues: {
      preferences: {
        recipient: 'finance@example.invalid',
        format: 'html',
        copies: 3,
        include_raw: true,
        footnote: 'Figures are provisional until the audit closes.',
      },
    },
  },
};

/** Carrying a validation message. */
export const Invalid: Story = {
  args: { pipeCode: 'defaults', errors: { preferences: 'A recipient is required.' } },
};

/** Disabled, as a host holds the whole form during a run. */
export const Disabled: Story = { args: { pipeCode: 'defaults', disabled: true } };
