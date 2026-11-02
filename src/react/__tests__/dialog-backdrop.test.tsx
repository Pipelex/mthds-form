/**
 * The vendored dialogs' backdrop: a press on it is the dialog's own, and goes
 * no further.
 *
 * React events follow the component tree, so a click on a backdrop drawn
 * inside a host's clickable card reached that card's handler, opening a run or
 * selecting a row the reader never touched. A guard on the backdrop alone is
 * not enough: a text selection dragged out of the panel and released over the
 * backdrop fires its `click` on the nearest element holding both, which is
 * neither. And the backdrop is still what dismisses a dialog, which Radix
 * hears as a `pointerdown` on the document: a fix that kept the click by
 * stopping that event too would have left every dialog open.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

/**
 * The nearest element holding both: where a browser fires the `click` of a
 * press that began on one and was released on the other.
 */
function commonAncestor(a: HTMLElement, b: HTMLElement): HTMLElement {
  let node = a.parentElement;
  while (node && !node.contains(b)) node = node.parentElement;
  if (!node) throw new Error('the two elements share no ancestor');
  return node;
}

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

  it.each([
    [
      'a dialog',
      'dialog',
      (inside: () => void) => (
        <Dialog open>
          <DialogContent>
            <DialogTitle>Your team’s files</DialogTitle>
            <DialogDescription>Pick one</DialogDescription>
            <button type="button" onClick={inside}>
              Use
            </button>
          </DialogContent>
        </Dialog>
      ),
    ],
    [
      'an alert',
      'alertdialog',
      (inside: () => void) => (
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle>Replace the example?</AlertDialogTitle>
            <AlertDialogDescription>It cannot be undone.</AlertDialogDescription>
            <button type="button" onClick={inside}>
              Use
            </button>
          </AlertDialogContent>
        </AlertDialog>
      ),
    ],
  ] as const)(
    'keeps a drag from %s’s panel onto its backdrop to itself, and its own clicks working',
    async (_, role, dialog) => {
      const user = userEvent.setup();
      const card = vi.fn();
      const inside = vi.fn();
      render(
        <div onClick={card} onMouseDown={card}>
          <section>{dialog(inside)}</section>
        </div>,
      );
      const panel = screen.getByRole(role);
      // A selection begun on the panel's text and released over the
      // backdrop: the press lands in the panel, the click on what holds both.
      const holder = commonAncestor(panel, backdropOf(panel));
      fireEvent.mouseDown(screen.getByText('Use'));
      fireEvent.mouseUp(backdropOf(panel));
      fireEvent.click(holder);
      expect(card).not.toHaveBeenCalled();
      // A handler inside the dialog still hears its own click.
      await user.click(screen.getByRole('button', { name: 'Use' }));
      expect(inside).toHaveBeenCalledOnce();
      expect(card).not.toHaveBeenCalled();
    },
  );
});
