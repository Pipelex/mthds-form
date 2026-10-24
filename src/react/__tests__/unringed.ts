/**
 * The check behind every focus-ring suite: which elements a keyboard can land
 * on draw no keyboard focus of their own in the contract's `--ring`.
 *
 * jsdom computes no Tailwind, so it reads the focus utilities each element
 * carries, and it asks for a focus that is DRAWN, not only coloured: a
 * `focus-visible:outline-ring` with no width and no style paints nothing, and
 * the browser's own ring shows instead.
 */

/** What a keyboard can land on. */
const NATIVELY_FOCUSABLE = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');
const FOCUSABLE = `${NATIVELY_FOCUSABLE}, [tabindex]`;

/**
 * Whether `classes` draw a focus in `--ring` under `variant`: an outline with
 * a style, a width and the colour (what `focusOutlineClass` spells), a ring
 * with a width and the colour, or a border in the colour on an element that
 * has a border to colour.
 */
function drawsUnder(classes: readonly string[], variant: string): boolean {
  const under = (pattern: RegExp) =>
    classes.some(
      (name) => name.startsWith(`${variant}:`) && pattern.test(name.slice(variant.length + 1)),
    );
  const outline =
    under(/^outline-ring(?:\/\d+)?$/) &&
    under(/^outline-(?:solid|dashed|dotted|double)$/) &&
    under(/^outline-(?:\d+|\[[^\]]+\])$/);
  const ring = under(/^ring-ring(?:\/\d+)?$/) && under(/^ring(?:-\d+|-\[[^\]]+\])?$/);
  const border =
    under(/^border-ring(?:\/\d+)?$/) &&
    (classes.some((name) => /^border(?:-\d+)?$/.test(name)) || under(/^border(?:-\d+)?$/));
  return outline || ring || border;
}

function classesOf(element: Element): string[] {
  return (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
}

/**
 * Whether an element draws its own keyboard focus in `--ring`. A frame draws it
 * on the `data-focus-visible` that `FocusFrame` sets, because no focus selector
 * matches a frame whose document holds focus; nothing else may lean on that.
 */
function drawsFocus(element: Element): boolean {
  const classes = classesOf(element);
  if (drawsUnder(classes, 'focus') || drawsUnder(classes, 'focus-visible')) return true;
  return element.matches('iframe') && drawsUnder(classes, 'data-focus-visible');
}

/**
 * The file field's input is clip-hidden, so the drop target around it draws
 * its focus with `focus-within`. That input, and nothing else, may leave its
 * focus to an ancestor.
 */
function drawnByDropTarget(element: Element): boolean {
  if (!element.matches('input[type="file"]')) return false;
  if (!/clip/.test(element.getAttribute('style') ?? '')) return false;
  const target = element.parentElement;
  return target !== null && drawsUnder(classesOf(target), 'focus-within');
}

/**
 * Every element under `root` a keyboard can focus whose focus is not drawn in
 * `--ring`, named for the failure message. A disabled control is judged too,
 * since it is enabled at some point. An element only a script focuses
 * (`tabindex="-1"` on something not focusable by nature, such as a dialog's
 * panel or a menu's item, whose focus is the highlight its primitive paints)
 * is not a stop, and nor are Radix's focus guards, what an open dialog hides,
 * or a Radix roving group's own box, which turns its outline off and hands its
 * focus to its active item at once.
 */
export function unringed(root: ParentNode): string[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
    .filter((element) => {
      if (element.hasAttribute('data-radix-focus-guard')) return false;
      if (element.closest('[aria-hidden="true"]')) return false;
      if (
        element.matches('[role="radiogroup"], [role="toolbar"]') &&
        element.style.outline === 'none'
      ) {
        return false;
      }
      if (element.getAttribute('tabindex') === '-1' && !element.matches(NATIVELY_FOCUSABLE)) {
        return false;
      }
      return !drawsFocus(element) && !drawnByDropTarget(element);
    })
    .map((element) => {
      const name =
        element.getAttribute('aria-label') ??
        element.getAttribute('title') ??
        element.textContent?.trim() ??
        '';
      return `<${element.tagName.toLowerCase()}> "${name}"`;
    });
}
