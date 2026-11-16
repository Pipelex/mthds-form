/**
 * The natives whose value may live in storage, read by the concept the
 * descriptor states.
 *
 * `native.Text`, `native.Markdown`, `native.Html` and `native.JSON` hold their
 * value in one of two forms, never both and never neither:
 *
 *   { text: "…" }                                            inline
 *   { url: "pipelex-storage://…", size: 48213,
 *     mime_type: "text/plain", preview: "Page 1. The …" }    stored
 *
 * The inline form holds the value under the property the concept names (`text`,
 * `inner_html`, `json_obj`); the stored form leaves that property out and
 * carries a reference to the value instead, with three facts that describe it
 * without reading it: its `size` in bytes as stored, its `mime_type`, and a
 * `preview`, which is always the true start of the value. A runtime stores a
 * value past a size threshold by itself, so any of these values, input or
 * result, may arrive in either form. A concept refining one of them behaves the
 * same, and an HTML page keeps its `css_class` inline in both forms.
 *
 * ## Why by concept
 *
 * Adding the reference's members to the schema took away the single property
 * the kernel used to unwrap a text by (`TextContent {text}` was the one
 * property its schema declared). Counting properties cannot tell a text from a
 * structure any more, and asking the value which form it holds before knowing
 * what it is would be the shape sniffing `docs/derivation-swap.md` records
 * deleting. So the concept says which property holds the value, through
 * `concept_ref` and `refines` as every native predicate in `./native-content`
 * reads them, and only then is the documented stored form read off a value of
 * that concept. It is the standard's own rule: a client tells a stored text
 * from a file by the concept the contract names at that path, never by its URL
 * or its MIME type.
 *
 * Pure data and pure functions, no React and no I/O: loading is the host's
 * (`LoadText`), and this module only says what to load and what the loaded
 * text becomes.
 */

import type { RunField } from './descriptor';
import { hasOwnProp, ownProp } from './own-property';

/** The concept refs whose value may be stored, each with the property its inline form holds the value in. */
export const STORED_VALUE_KEYS: ReadonlyMap<string, string> = new Map([
  ['native.Text', 'text'],
  ['native.Markdown', 'text'],
  ['native.Html', 'inner_html'],
  ['native.JSON', 'json_obj'],
]);

/** The members of the stored form: where the value is, and what describes it. Never a part of the value. */
export const STORED_REFERENCE_MEMBERS = ['url', 'size', 'mime_type', 'preview'] as const;

/**
 * Loads the text a stored value's `url` names, for a host that can read its
 * storage: resolve to the text as stored (a JSON value's serialized form),
 * reject when it cannot be read. The view shows the reference's `preview`
 * until it resolves, and describes the reference when it rejects.
 *
 * Asynchronous, unlike `ResolveUrl`, because a stored text is read rather than
 * painted: there is no element a URL could be handed to, so the host fetches
 * the bytes itself, through whatever authorises its storage (a signed link, its
 * own assets route). The view asks only for the values it shows, once each.
 */
export type LoadText = (url: string) => Promise<string>;

/** What the stored-value predicates read off a node: its stated kind and its concept. */
interface StoredValueNode {
  kind?: string;
  conceptRef?: string;
  refines?: readonly string[];
}

/**
 * The property a node's value sits in when held inline, when its concept is one
 * whose value may be stored (or refines one): `text`, `inner_html` or
 * `json_obj`. `undefined` for every other concept.
 *
 * A list answers no and its `item` answers for itself, as the native predicates
 * do: plurality is not on the concept, so a `native.Text[]` node's concept
 * reads `native.Text` although its value is a list.
 */
export function storedValueKeyOf(node: StoredValueNode): string | undefined {
  if (node.kind === 'list') return undefined;
  const own = node.conceptRef === undefined ? undefined : STORED_VALUE_KEYS.get(node.conceptRef);
  if (own !== undefined) return own;
  for (const ref of node.refines ?? []) {
    const refined = STORED_VALUE_KEYS.get(ref);
    if (refined !== undefined) return refined;
  }
  return undefined;
}

/** Whether a node's value may arrive stored rather than inline. */
export function isStoredValueNode(node: StoredValueNode): boolean {
  return storedValueKeyOf(node) !== undefined;
}

/** A stored value's reference, read. */
export interface StoredReferenceView {
  /** Where the value is: a storage URI, an HTTP(S) URL, or a `data:` URL. */
  url: string;
  /** The value's length in bytes as stored, when stated. */
  size?: number;
  /** `text/plain`, `text/markdown`, `text/html` or `application/json`, when stated. */
  mimeType?: string;
  /** The value's true start, when stated. */
  preview?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Read a value of this node as a stored reference, when it is one.
 *
 * The node's concept must be one whose value may be stored, and the value must
 * hold no value under the concept's property and a non-empty `url`. A value
 * holding both is read as inline, which is the form a reader can show without
 * loading anything.
 */
export function readStoredReference(
  node: StoredValueNode,
  value: unknown,
): StoredReferenceView | undefined {
  const key = storedValueKeyOf(node);
  if (key === undefined || !isRecord(value)) return undefined;
  const held = ownProp(value, key);
  if (held !== undefined && held !== null) return undefined;
  const url = ownProp(value, 'url');
  if (typeof url !== 'string' || url.trim() === '') return undefined;
  const size = ownProp(value, 'size');
  const mimeType = ownProp(value, 'mime_type');
  const preview = ownProp(value, 'preview');
  return {
    url,
    ...(typeof size === 'number' && Number.isFinite(size) && size >= 0 ? { size } : {}),
    ...(typeof mimeType === 'string' && mimeType !== '' ? { mimeType } : {}),
    ...(typeof preview === 'string' && preview !== '' ? { preview } : {}),
  };
}

/**
 * The inline form of a stored value, once its text is loaded: the reference's
 * members replaced by the value under the concept's property, every other
 * member kept (an HTML page's `css_class`).
 *
 * A JSON value's text is parsed, and must be an object, as `native.JSON`'s
 * `json_obj` is; a text that is not one answers `undefined`, which a caller
 * reads as a failed load, exactly as the runtime refuses it.
 */
export function inlineStoredValue(
  node: StoredValueNode,
  value: unknown,
  text: string,
): Record<string, unknown> | undefined {
  const key = storedValueKeyOf(node);
  if (key === undefined || !isRecord(value)) return undefined;
  let loaded: unknown = text;
  if (key === 'json_obj') {
    try {
      loaded = JSON.parse(text) as unknown;
    } catch {
      return undefined;
    }
    if (!isRecord(loaded)) return undefined;
  }
  const out: Record<string, unknown> = {};
  for (const [member, held] of Object.entries(value)) {
    if ((STORED_REFERENCE_MEMBERS as readonly string[]).includes(member)) continue;
    out[member] = held;
  }
  out[key] = loaded;
  return out;
}

/**
 * The value with every stored value in it loaded, walked by the descriptor: the
 * value itself when the field is a stored value's node, and the members of a
 * structure and the items of a list beneath it. A value that does not load
 * keeps its reference and is counted in `unloaded`.
 *
 * What a download saves, so the file holds the texts a reader saw rather than
 * links to them. Each distinct URL is asked of `load` once.
 */
export async function loadStoredValues(
  field: RunField,
  value: unknown,
  load: LoadText,
): Promise<{ value: unknown; unloaded: number }> {
  const asked = new Map<string, Promise<string | undefined>>();
  let unloaded = 0;
  const read = (url: string): Promise<string | undefined> => {
    let pending = asked.get(url);
    if (pending === undefined) {
      pending = Promise.resolve()
        .then(() => load(url))
        .then(
          (text) => (typeof text === 'string' ? text : undefined),
          () => undefined,
        );
      asked.set(url, pending);
    }
    return pending;
  };

  const walk = async (node: RunField, held: unknown): Promise<unknown> => {
    const reference = readStoredReference(node, held);
    if (reference) {
      const text = await read(reference.url);
      const inline = text === undefined ? undefined : inlineStoredValue(node, held, text);
      if (inline === undefined) unloaded += 1;
      return inline ?? held;
    }
    if (node.kind === 'list' && Array.isArray(held)) {
      return Promise.all(held.map((item) => walk(node.item, item)));
    }
    if (node.kind === 'list' && node.contentKey !== undefined && isRecord(held)) {
      // A plural result arrives in its `{items}` envelope, which the renderer
      // opens by the same property.
      const items = ownProp(held, node.contentKey);
      if (!Array.isArray(items)) return held;
      return { ...held, [node.contentKey]: await walk(node, items) };
    }
    if (node.kind === 'object' && isRecord(held)) {
      const out: Record<string, unknown> = { ...held };
      for (const member of node.fields) {
        if (hasOwnProp(held, member.name)) out[member.name] = await walk(member, held[member.name]);
      }
      return out;
    }
    return held;
  };

  const loaded = await walk(field, value);
  return { value: loaded, unloaded };
}
