/**
 * Whether a layout is shaped like a spec at all, and what the checks answer
 * when they fail on one that is.
 *
 * The checks answer with problems, never an exception, because a host calls
 * them to decide whether a page renders and a throw leaves it with no verdict.
 * They used to keep that promise with a catch around each walk that called any
 * throw "the layout is not a well-formed spec" - a bug in the checks included,
 * which a producer then handed to the method's repair pass, paying for passes
 * no layout could satisfy. So the shape the walks assume is checked first,
 * here, and stated as what it is; a throw on a spec that has it is the checks'
 * own failure, answered by a line of its own, and flagged as such by
 * `layoutCheck` - never by the line's words, which a layout can write into an
 * element key - so a producer stops rather than repairs.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * What makes `spec` no spec the checks can walk, in words, or nothing when it
 * has the shape they assume: an `elements` map of structures, each naming
 * its component `type` as a text, with structured `props`, a list of
 * `children`, slots of lists and a `repeat` naming its `statePath`. Whether
 * the root exists, whether a child is an element, whether a type is known,
 * whether `on` and `watch` are the maps the runtime reads: those are problems
 * the checks themselves report, in their own words, not reasons they cannot
 * run.
 */
export function specMalformation(spec: unknown): string | undefined {
  if (!isRecord(spec))
    return `it is ${Array.isArray(spec) ? 'a list' : String(JSON.stringify(spec ?? null))}, not a structure`;
  if (!isRecord(spec.elements)) return 'it has no "elements" map';
  for (const [key, element] of Object.entries(spec.elements)) {
    const at = JSON.stringify(key);
    if (!isRecord(element)) return `the element ${at} is not a structure`;
    const { type, props, children, slots, repeat } = element;
    if (typeof type !== 'string') return `the element ${at} names no component "type"`;
    if (props != null && !isRecord(props))
      return `the element ${at} has "props" that are not a structure`;
    if (children != null && !Array.isArray(children))
      return `the element ${at} has "children" that are not a list`;
    if (slots != null && (!isRecord(slots) || !Object.values(slots).every(Array.isArray))) {
      return `the element ${at} has "slots" that are not lists`;
    }
    if (repeat !== undefined && !repeatsOver(repeat)) {
      return `the element ${at} has a "repeat" that names no "statePath"`;
    }
  }
  return undefined;
}

/**
 * Whether a `repeat` names the list it lays out as json-render reads one: a
 * path, or `{ "$item": … }`, a path relative to the item of the repeat
 * around it, which json-render joins as a text.
 */
function repeatsOver(repeat: unknown): boolean {
  if (!isRecord(repeat)) return false;
  const { statePath } = repeat;
  return (
    typeof statePath === 'string' || (isRecord(statePath) && typeof statePath.$item === 'string')
  );
}

/** The line a malformed spec is answered with. */
export function malformedLine(what: string): string {
  return `the layout is not a well-formed spec: ${what}`;
}

/** The line the checks answer with when they throw on a layout of the right shape. */
export function checksFailedLine(error: unknown): string {
  let said: string;
  try {
    said = String(error);
  } catch {
    said = 'an error that cannot be written out';
  }
  return `the checks failed on this layout (${said}): a defect in the checks, which no repair of the layout can fix`;
}
