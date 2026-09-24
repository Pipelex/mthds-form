import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import { PAYLOADS } from '../_generated/results.payloads';

/**
 * The two file-bearing kinds.
 *
 * Every story here isolates ONE comparison and its doc comment names what
 * varies. A canvas with three near-identical dropzones on it and no statement of
 * the difference is not a comparison, it is a coincidence.
 */

const meta = {
  title: 'Inputs/Files',
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
 * **A slot a host narrowed**, against `Image` above: the same `native.Image`
 * slot, passed through `narrowFileFormats` with PNG and JPEG, the list a
 * method app's server takes. The hint reads `PNG, JPG`, the OS picker offers no
 * WEBP, and a dropped WEBP is refused naming that list, because all three read
 * the field's one `formats` list.
 */
export const NarrowedImage: Story = {
  args: { pipeCode: 'one_image', narrowTo: ['image/png', 'image/jpeg'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('PNG, JPG')).toHaveLength(2);
    for (const input of canvasElement.querySelectorAll('input[type="file"]')) {
      await expect(input.getAttribute('accept')).not.toContain('webp');
    }
  },
};

/** The one list a host's upload path takes, for the story below. */
const HOST_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

/**
 * **One list, every slot.** A document slot and an image slot, each narrowed
 * with the SAME list of PDF, PNG and JPEG. The list is intersected with each
 * slot's own formats, so the document slot still takes all three and the image
 * slot takes PNG and JPEG - a host never writes a list per slot, and narrowing
 * never widens one. Two single-slot carriers rather than one form, because no
 * carrier pairs a singular document with a singular image.
 */
export const OneListEverySlot: Story = {
  args: { pipeCode: 'one_document', narrowTo: HOST_MIME_TYPES },
  render: (args) => (
    <div style={{ display: 'grid', gap: 18 }}>
      <CaseForm {...args} pipeCode="one_document" />
      <CaseForm {...args} pipeCode="one_image" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('PDF, JPG, PNG')).toHaveLength(2);
    await expect(canvas.getAllByText('PNG, JPG')).toHaveLength(2);
  },
};

/**
 * The reference a stored upload carries: a real one, out of the corpus's own
 * payloads, rather than an invented address. A host writes it back after its
 * upload lands, beside the filename the person picked.
 */
const STORED_IMAGE_URL = (PAYLOADS['results.image_result'] as { url: string }).url;
const storedImage = {
  picture: { url: STORED_IMAGE_URL, filename: 'rhubarb-sign.png' },
};

/**
 * **An attached stored file, in `studio`.** A builder's view: the card prints
 * the `pipelex-storage://` reference under the filename, because a builder may
 * need the address itself.
 */
export const StoredFileStudio: Story = {
  args: { pipeCode: 'one_image', initialValues: storedImage, presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(STORED_IMAGE_URL)).toHaveLength(2);
  },
};

/**
 * **The same stored file, in `app`.** The person who just chose the file has
 * no use for its storage address, so the card names the format the filename's
 * extension gives, among the slot's own formats, and prints no reference. A
 * pasted `https` link would still be shown back as it is.
 */
export const StoredFileApp: Story = {
  args: { pipeCode: 'one_image', initialValues: storedImage, presentation: 'app' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('rhubarb-sign.png')).toHaveLength(2);
    await expect(canvas.getAllByText('PNG')).toHaveLength(2);
    await expect(canvasElement.textContent).not.toContain('pipelex-storage');
  },
};

/**
 * **The link a person may paste instead**, opened. The input asks for a web
 * link and nothing else, and it carries a name of its own: the field's label
 * is bound to the file input, so this one used to be announced by its
 * placeholder alone - which named a storage scheme. The accessibility check
 * that runs after this story is what holds the name in a real browser.
 */
export const PasteALink: Story = {
  args: { pipeCode: 'one_document' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const toggle of canvas.getAllByRole('button', { name: 'paste a URL instead' })) {
      await userEvent.click(toggle);
    }
    const inputs = canvas.getAllByRole('textbox', { name: 'Link to the file for attachment' });
    await expect(inputs).toHaveLength(2);
    for (const input of inputs) await expect(input.getAttribute('placeholder')).toBe('https://…');
  },
};

/**
 * **What a slot actually accepts, and what happens when it does not.**
 *
 * The accepted formats are not a wire fact: the descriptor says the kind is
 * `document` or `image` and stops there, because which bytes a runtime can
 * decode is a property of the runtime. `core/file-formats.ts` holds the table,
 * `buildRunFields` stamps it on the field as `formats`, and the label under the
 * dropzone, the picker's filter and the check all read that one list.
 *
 * A **document** takes PDF, JPG and PNG — the extract model reads an image as a
 * single page. An **image** takes PNG, JPG and WEBP. Note the asymmetry: WEBP is
 * fine as an image and refused as a document, which is not an oversight but what
 * the extract gateway answers.
 *
 * Both lists were measured by running each format end to end, after two earlier
 * versions of this table were wrong in opposite directions — first a hard-coded
 * `PDF, DOCX, TXT`, then `PDF, DOCX, PPTX` taken off an enum the runtime never
 * reads. DOCX and PPTX fail on every path. And until recently the label was only
 * a label: the dropzone carried no filter at all, so any file was accepted in
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
