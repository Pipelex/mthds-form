import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppForm, FIFTY_MB, documentValue, fileOfSize, pickFiles } from '../../app-form';
import { fileSourceOf } from '../../host-sources';

/**
 * Document: a big dashed drop zone that fills its card, its upload icon, the
 * accepted formats and Pick from your team's files inside it; a click
 * anywhere in it browses. One file given shows its badge, name and size with
 * Replace and Remove. Several show as lines, each with a remove cross, "+ N
 * more · M files in all" past four, and Add more files. A file over the upload
 * limit is refused before it is sent, the zone's edge turns red and the line
 * under it says by how much, with Upgrade plan.
 */
const meta = {
  title: 'Inputs/Kinds/Document',
  component: AppForm,
  args: { pipeCode: 'document_inputs', maxFileBytes: FIFTY_MB, upgradeHref: '#plans' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneEmpty: Story = { args: { only: ['nda'] } };

/** With the team's files: Pick from your team's files sits inside the zone. */
export const OneEmptyWithTeamFiles: Story = {
  args: { only: ['nda'], fileSource: fileSourceOf('team', 'everyone') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [entry] = canvas.getAllByRole('button', { name: /team's files/ });
    await expect(entry!.closest('[data-drop-zone]')).not.toBeNull();
  },
};

export const OneGiven: Story = {
  args: { only: ['nda'], initialValues: { nda: documentValue('nda-acme.pdf') } },
};

/** Remove empties the input, and the drop zone comes back. */
export const RemoveTheFile: Story = {
  args: { only: ['nda'], initialValues: { nda: documentValue('nda-acme.pdf') } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [remove] = canvas.getAllByRole('button', { name: 'Remove' });
    await userEvent.click(remove!);
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-drop-zone]')).toHaveLength(1));
  },
};

/** A file dropped in fills the input with its line. */
export const DropAFile: Story = {
  args: { only: ['nda'] },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-drop-zone] input[type=file]',
    )!;
    await pickFiles(input, [fileOfSize('nda-acme.pdf', 0.4)]);
    await waitFor(() =>
      expect(within(canvasElement).getAllByText('nda-acme.pdf').length).toBeGreaterThan(0),
    );
  },
};

/** A file over the plan's limit: refused before upload, the size and the limit in one line. */
export const OverTheLimit: Story = {
  args: { only: ['nda'] },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-drop-zone] input[type=file]',
    )!;
    await pickFiles(input, [fileOfSize('Supplier contracts 2026.pdf', 73.4)]);
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('alert')).toHaveTextContent(
        "Supplier contracts 2026.pdf is 73.4 MB, over your plan's 50 MB limit.",
      ),
    );
    await expect(canvas.getAllByRole('link', { name: 'Upgrade plan' })[0]).toHaveAttribute(
      'href',
      '#plans',
    );
    await expect(canvasElement.querySelector('[data-drop-zone][data-over-limit]')).not.toBeNull();
    // The cross dismisses the line.
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(canvas.queryByRole('alert')).toBeNull();
  },
};

/** Mid-upload: the zone holds a spinner and takes nothing else. */
export const Uploading: Story = {
  args: { only: ['nda'], holdUploads: true },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-drop-zone] input[type=file]',
    )!;
    await pickFiles(input, [fileOfSize('nda-acme.pdf', 0.4)]);
    await waitFor(() =>
      expect(within(canvasElement).getAllByText('Uploading…').length).toBeGreaterThan(0),
    );
  },
};

export const SeveralEmpty: Story = { args: { only: ['data_room'] } };

/** Five files: four lines, then "+ 1 more · 5 files in all", then Add more files. */
export const SeveralGiven: Story = {
  args: {
    only: ['data_room'],
    initialValues: {
      data_room: [
        documentValue('annual-report-2025.pdf'),
        documentValue('statutes-2024.pdf'),
        documentValue('cap-table.xlsx'),
        documentValue('litigation-memo.docx'),
        documentValue('board-minutes.pdf'),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('+ 1 more · 5 files in all')).toHaveLength(2);
    await expect(canvas.getAllByRole('button', { name: 'Add more files' })).toHaveLength(2);
    // Removing a file leaves four, and the count line goes.
    const [remove] = canvas.getAllByRole('button', { name: 'Remove annual-report-2025.pdf' });
    await userEvent.click(remove!);
    await waitFor(() => expect(canvas.getAllByText('+ 1 more · 5 files in all')).toHaveLength(1));
  },
};

/** Several files picked at once, some over the limit: the rest attach, the refused ones share one line. */
export const SeveralOverTheLimit: Story = {
  args: { only: ['data_room'] },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-list-file-drop] input[type=file]',
    )!;
    await pickFiles(input, [
      fileOfSize('Supplier contracts 2026.pdf', 73.4),
      fileOfSize('statutes-2024.pdf', 1.1),
      fileOfSize('Board pack Q3.pdf', 88.2),
      fileOfSize('Audit export 2025.pdf', 61),
    ]);
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('alert')).toHaveTextContent(
        "3 files are over your plan's 50 MB limit, the largest 88.2 MB.",
      ),
    );
    await waitFor(() => expect(canvas.getAllByText('statutes-2024.pdf').length).toBeGreaterThan(0));
  },
};
