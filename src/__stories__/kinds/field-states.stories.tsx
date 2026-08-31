import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/states';

/**
 * The state axis, deliberately factored OUT of the per-kind catalog.
 *
 * Crossing every kind with every state would produce a folder nobody can scan,
 * which is the one thing the catalog exists not to be. So the states live here
 * once, on a representative concept, and each kind's own file carries only the
 * states where that kind behaves DIFFERENTLY from this.
 */

const meta = {
  title: 'Field Kinds/Field States',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'states' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Authored defaults. A field carrying one always arrives `required: false` -
 * validation applies the default on absence, so the caller is never obliged to
 * supply it - and the control shows the value rather than an empty box.
 */
export const WithDefaults: Story = { args: { pipeCode: 'defaults' } };

/**
 * The three presence markers on identical slots. `plain` and `force` place the
 * same obligation on the caller and differ only in what the author asserted;
 * `optional` is the only one that folds away.
 */
export const PresenceMarkers: Story = { args: { pipeCode: 'presence' } };

/** Untouched: every optional field folded, which is the first thing a user sees. */
export const Pristine: Story = { args: { pipeCode: 'defaults' } };

/** Filled, including the fields that carry a default. */
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
