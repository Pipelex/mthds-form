import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';

/**
 * The two file-bearing kinds.
 *
 * Every story here isolates ONE comparison and its doc comment names what
 * varies. A canvas with three near-identical dropzones on it and no statement of
 * the difference is not a comparison, it is a coincidence.
 */

const meta = {
  title: 'Field Kinds/Files',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'files' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single `native.Document` slot, empty. The baseline for everything below. */
export const Document: Story = { args: { pipeCode: 'one_document' } };

/** A single `native.Image` slot, empty. Same control, a different accept hint. */
export const Image: Story = { args: { pipeCode: 'one_image' } };

/**
 * **Native vs refined: `native.Image` against a concept that refines it.**
 *
 * The honest answer is that the CONTROL is identical, and that is the design
 * rather than a gap: a concept refining `native.Image` is still an image, so
 * anything else would mean the refinement had changed what the slot accepts.
 *
 * What actually differs is three things, and only two of them are on screen:
 *
 *  - the concept pill reads `files.Headshot` instead of `native.Image`;
 *  - the description is the concept's own ("A portrait photograph"), not the
 *    native one ("An image");
 *  - the descriptor carries `refines: ["native.Image"]` — the refinement chain,
 *    immediate parent first — and **nothing renders it**. A reader can see that
 *    this slot wants a `files.Headshot`, but not that a `files.Headshot` IS an
 *    image, except by recognising the icon.
 *
 * That last point is the one worth arguing about, and this story exists to put
 * it in front of someone rather than leave it in a type definition.
 */
export const NativeVsRefinedImage: Story = {
  args: { pipeCode: 'native_vs_refined_image' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The pill is the whole visible difference. Two of each: two theme panes.
    await expect(canvas.getAllByText('native.Image')).toHaveLength(2);
    await expect(canvas.getAllByText('files.Headshot')).toHaveLength(2);
  },
};

/** The same comparison on the document side, where the accept hint also matches. */
export const NativeVsRefinedDocument: Story = {
  args: { pipeCode: 'native_vs_refined_document' },
};

/**
 * **Required vs optional**, on two otherwise identical `native.Document` slots.
 * The `?` slot carries the OPTIONAL badge; at the top level it is also the one a
 * host may leave empty without blocking Run.
 */
export const RequiredVsOptional: Story = { args: { pipeCode: 'required_vs_optional' } };

/** Variable-length lists of files, where the dropzone repeats per item. */
export const ManyFiles: Story = { args: { pipeCode: 'many_files' } };

/**
 * One slot holding a stored file. The value is the wire shape a
 * `pipelex-storage://` reference deflates to, not a browser `File`.
 *
 * A STATE story renders a single-slot carrier on purpose: showing a state inside
 * a multi-slot form puts idle dropzones beside the one the story is about, and a
 * reader cannot tell which part of the canvas is the subject.
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

/**
 * **What a slot actually accepts, and what happens when it does not.**
 *
 * The accepted formats are not a wire fact: the descriptor says the kind is
 * `document` or `image` and stops there, because which bytes a runtime can
 * decode is a property of the runtime. So the kernel mirrors the runtime's own
 * enums in `core/file-formats.ts` — `DocumentFormat` is PDF, DOCX, PPTX;
 * `ImageFormat` is PNG, JPEG, WEBP — and both the label under the dropzone and
 * the filter it enforces are read from that one table.
 *
 * They used to disagree with everything: the label was a hard-coded
 * `PDF, DOCX, TXT` (TXT is not a supported format; PPTX, which is, was missing)
 * and the dropzone carried no filter at all, so any file was accepted in
 * silence and failed much later, mid-run.
 *
 * Drop a `.zip` on this to see the refusal. It is not reproducible as a static
 * story - a rejection is a response to an action - so this one is here to be
 * used by hand; the automated coverage is `src/react/__tests__/file-field.test.tsx`.
 */
export const TryAWrongFileType: Story = { args: { pipeCode: 'one_document' } };

/** The same busy state on an image slot, where the preview area is what waits. */
export const UploadingImage: Story = {
  args: { pipeCode: 'one_image', uploadingIds: ['one_image-picture'] },
};
