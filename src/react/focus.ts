/**
 * Where focus goes when the control that held it is about to leave the page
 * or be shut: the elements a sheet hands focus to in its place.
 */

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/** Whether `element` takes focus from the keyboard as the page stands. */
function takesFocus(element: HTMLElement): boolean {
  if (element.tabIndex < 0 || element.matches(':disabled')) return false;
  return element.closest('[hidden], [inert]') === null;
}

/**
 * The first element after `from` in the document that takes focus from the
 * keyboard, leaving out anything inside `skip`: where focus goes when `from`
 * is about to leave the page.
 */
export function followingFocusable(
  from: HTMLElement | null,
  skip: HTMLElement | null,
): HTMLElement | null {
  if (!from) return null;
  for (const element of from.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (!(from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    if (skip?.contains(element)) continue;
    if (takesFocus(element)) return element;
  }
  return null;
}

/** The first element inside `within` that takes focus from the keyboard. */
export function firstFocusable(within: Element | null | undefined): HTMLElement | null {
  if (!within) return null;
  for (const element of within.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (takesFocus(element)) return element;
  }
  return null;
}
