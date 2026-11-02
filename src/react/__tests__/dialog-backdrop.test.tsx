/**
 * The vendored dialogs' backdrop: a press on it is the dialog's own, and goes
 * no further.
 *
 * React events follow the component tree, so a click on a backdrop drawn
 * inside a host's clickable card reached that card's handler, opening a run or
 * selecting a row the reader never touched. And the backdrop is still what
 * dismisses a dialog, which Radix hears as a `pointerdown` on the document: a
 * fix that kept the click by stopping that event too would have left every
 * dialog open.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

/** The backdrop drawn before a panel: its sibling, outside the panel. */
const backdropOf = (panel: HTMLElement) => panel.previousElementSibling as HTMLElement;

describe("a dialog's backdrop", () => {
  it('dismisses the dialog, and keeps the click from the components around it', async () => {
    const user = userEvent.setup();
    const card = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <div onClick={card} onMouseDown={card}>
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Your team’s files</DialogTitle>
            <DialogDescription>Pick one</DialogDescription>
          </DialogContent>
        </Dialog>
      </div>,
    );
    const backdrop = backdropOf(screen.getByRole('dialog'));
    expect(backdrop.contains(screen.getByRole('dialog'))).toBe(false);
    await user.click(backdrop);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(card).not.toHaveBeenCalled();
  });

  it("keeps an alert's backdrop click to itself too, and the question open", async () => {
    const user = userEvent.setup();
    const card = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <div onClick={card} onMouseDown={card}>
        <AlertDialog open onOpenChange={onOpenChange}>
          <AlertDialogContent>
            <AlertDialogTitle>Replace the example?</AlertDialogTitle>
            <AlertDialogDescription>It cannot be undone.</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      </div>,
    );
    await user.click(backdropOf(screen.getByRole('alertdialog')));
    expect(card).not.toHaveBeenCalled();
    // A question is answered, never dismissed by a click beside it.
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
