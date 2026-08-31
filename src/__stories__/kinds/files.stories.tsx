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
 * One slot holding a stored file. The value is the wire shape a
 * `pipelex-storage://` reference deflates to, not a browser `File`.
 *
 * A STATE story renders a single-slot carrier on purpose. Showing a state
 * inside the three-slot form puts idle dropzones beside the one the story is
 * about, and a reader cannot tell which part of the canvas is the subject - the
 * empty state is already covered by `Document` above.
 */
export const Filled: Story = {
  args: {
    pipeCode: 'one_document',
    initialValues: {
      attachment: {
        url: 'https://example.invalid/quarterly-report.pdf',
        filename: 'quarterly-report.pdf',
      },
    },
  },
};

/** Mid-upload: the control is busy and a host holds Run until it settles. */
export const Uploading: Story = {
  args: { pipeCode: 'one_document', uploadingIds: ['one_document-attachment'] },
};

/** The same busy state on an image slot, where the preview area is what waits. */
export const UploadingImage: Story = {
  args: { pipeCode: 'one_image', uploadingIds: ['one_image-picture'] },
};
