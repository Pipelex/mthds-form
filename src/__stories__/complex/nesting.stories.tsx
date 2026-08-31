import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/structured';
import { CONTRACTS as FILE_CONTRACTS, INPUT_FORM as FILE_INPUT_FORM } from '../_generated/files';

/**
 * The stress folder: correctness under composition, and the layouts most likely
 * to be ugly.
 *
 * Everything here is a real projection, not a synthetic worst case - which
 * matters, because the point is that these shapes are reachable by an ordinary
 * method, not that the renderer survives abuse.
 */

const meta = {
  title: 'Complex/Nesting',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'structured' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A list whose items are objects. The item index labels each entry, and the
 * object's own fields nest one level inside it.
 */
export const ListOfObjects: Story = { args: { pipeCode: 'list_of_objects' } };

/**
 * Four levels: a list of invoices, each an object, each carrying its own list of
 * line items, each of those an object again. This is where indentation, border
 * treatment and label hierarchy degrade if they are going to.
 */
export const DeepNesting: Story = { args: { pipeCode: 'many_invoices' } };

/** Deep nesting with the whole tree disabled, as a host holds it during a run. */
export const DeepNestingDisabled: Story = {
  args: { pipeCode: 'many_invoices', disabled: true },
};

/**
 * Files inside a list. The upload plumbing threads through `FieldEnv` and has to
 * survive the recursion - a control several levels down still has to reach the
 * host's uploader. See docs/upload-seam.md.
 */
export const FilesInAList: Story = {
  args: {
    contracts: FILE_CONTRACTS,
    inputForm: FILE_INPUT_FORM,
    domain: 'files',
    pipeCode: 'many_files',
  },
};

/**
 * Prefilled two levels down, which is the case a purely empty story never shows:
 * whether a populated nested list still reads as belonging to its parent.
 */
export const FilledDeep: Story = {
  args: {
    pipeCode: 'one_invoice',
    initialValues: {
      invoice: {
        reference: 'INV-2026-0042',
        status: 'sent',
        total: 1840.5,
        billed_to: { street: '12 rue de Rivoli', city: 'Paris', country: 'France' },
        lines: [
          { label: 'Design retainer', quantity: 1, unit_price: 1200, taxable: true },
          { label: 'Additional revisions', quantity: 4, unit_price: 160.125, taxable: true },
        ],
      },
    },
  },
};
