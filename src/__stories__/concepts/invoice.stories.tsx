import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/structured';

/**
 * One concept, many fields - the folder that answers what a REAL method's input
 * looks like, as opposed to one control at a time.
 *
 * `Invoice` is sized so the whole form fits one screenshot while still carrying
 * every axis a domain object has: mixed scalars, a required enum, an optional
 * beside a required, a nested concept, and a list of concepts.
 */

const meta = {
  title: 'Concepts/Invoice',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'structured' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The flat case first: three properties, one of them an enum, one optional. */
export const Address: Story = { args: { pipeCode: 'flat_object' } };

/** The whole object. Nested concept and a list of concepts both in view. */
export const OneInvoice: Story = { args: { pipeCode: 'one_invoice' } };

/**
 * A `Concept[]` of the same structure. N repeats is a materially different
 * layout problem from one instance, and it is where spacing and the add/remove
 * chrome break first.
 */
export const ManyInvoices: Story = { args: { pipeCode: 'many_invoices' } };

/** Filled, so the collapsed/expanded balance of a populated form is visible. */
export const Filled: Story = {
  args: {
    pipeCode: 'flat_object',
    initialValues: {
      address: { street: '12 rue de Rivoli', city: 'Paris', country: 'France' },
    },
  },
};

/** A validation message on a nested property, not on the object itself. */
export const WithError: Story = {
  args: { pipeCode: 'flat_object', errors: { address: 'Street is required.' } },
};
