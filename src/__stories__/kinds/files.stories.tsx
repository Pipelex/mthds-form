import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';

/**
 * The two file-bearing kinds. `document` and `image` share one control file and
 * one wire shape, and differ in the preview a filled slot renders - so they are
 * worth seeing beside each other rather than only apart.
 */

const meta = {
  title: 'Field Kinds/Files',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'files' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Native, refined, and optional document slots. */
export const Document: Story = { args: { pipeCode: 'document_kind' } };

/** The same three shapes for images. */
export const Image: Story = { args: { pipeCode: 'image_kind' } };

/** Variable-length lists of files, where the dropzone repeats per item. */
export const ManyFiles: Story = { args: { pipeCode: 'many_files' } };

/**
 * A stored file, as a host hands one back after upload. The value is the wire
 * shape a `pipelex-storage://` reference deflates to, not a browser `File`.
 */
export const Filled: Story = {
  args: {
    pipeCode: 'document_kind',
    initialValues: {
      attachment: {
        url: 'https://example.invalid/quarterly-report.pdf',
        filename: 'quarterly-report.pdf',
      },
      contract: { url: 'https://example.invalid/msa-signed.pdf', filename: 'msa-signed.pdf' },
    },
  },
};

/** Mid-upload: the control is busy and a host holds Run until it settles. */
export const Uploading: Story = {
  args: { pipeCode: 'document_kind', uploadingIds: ['document_kind-attachment'] },
};
