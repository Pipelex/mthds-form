import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';
import { ResultView } from '../result-view';

/**
 * A pipe's RESULT, rendered from its output descriptor.
 *
 * **Everything on this page came out of a real run.** The descriptors are
 * `output_form` and the payload schemas are `json_schema` on the output
 * contract — both standard artifacts, read off the engine's own builders by
 * `make fixtures` — and the payloads beside them are the `main_stuff.json` the
 * real `pipelex run bundle` CLI wrote when each pipe was actually executed
 * (`make fixtures-runs`). Nothing here is hand-written, and the payloads could
 * not be: what a run returns is knowable only by running it.
 *
 * What these stories demonstrate is that **an output is a concept ref exactly
 * like an input**: the same descriptor vocabulary, mapped by the same
 * `buildResultField`/`buildRunFields` mapper, into the same `RunField`. Only the
 * presentation differs — a result is read, not edited.
 *
 * ## What the corpus covers, and why it is this wide
 *
 * A renderer that has only ever met one shape is a renderer nobody has tested.
 * These pipes were chosen to span the result surface rather than to repeat it:
 * every native scalar (a wrapping content model and a multi-property one), a
 * flat structure, one and four levels of nesting, a list long enough to scroll,
 * and both file-bearing kinds — the second of which needs a `PipeExtract`,
 * because the language forbids a `PipeLLM` resolving to a concept containing
 * images.
 *
 * ## Why the assertions read the fixture instead of naming values
 *
 * A live model does not answer the same way twice — the sentiment case came back
 * `neutral` on one sweep and `positive` on the next, both defensible. A play
 * function that hard-codes `'neutral'` asserts the model's mood rather than the
 * renderer, and fails on the next sweep for a reason nobody should have to
 * investigate. So each assertion reads the value out of the payload it is
 * rendering and checks it reached the DOM, which is what the renderer is
 * actually responsible for.
 */

const meta = {
  title: 'Outputs/Results',
  component: ResultView,
  args: { contracts: CONTRACTS, outputForm: OUTPUT_FORM, domain: 'results' },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

function payload(pipeCode: string): Record<string, unknown> {
  return PAYLOADS[`results.${pipeCode}`] as Record<string, unknown>;
}

/** A live payload is arbitrary text; a substring of it is not a valid pattern. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** One story's args, with its own payload wired in. */
function story(pipeCode: string, maxWidth?: number) {
  return { pipeCode, value: payload(pipeCode), ...(maxWidth ? { maxWidth } : {}) };
}

// ─── Native scalars ──────────────────────────────────────────────────────────

/**
 * A `Text` output. Its content model wraps the value under `text`, so the
 * renderer unwraps by that property NAME — read off the payload schema, never
 * worked out by counting the value's properties.
 */
export const NativeText: Story = {
  args: story('plain_text_result'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opening = (payload('plain_text_result').text as string).slice(0, 24);
    await expect(canvas.getAllByText(new RegExp(escapeRegExp(opening)))).toHaveLength(BOTH_THEMES);
  },
};

/** A `Number` output — the same single-property unwrap, over `number`. */
export const NativeNumber: Story = {
  args: story('number_result'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = payload('number_result').number;
    await expect(canvas.getAllByText(String(value))).toHaveLength(BOTH_THEMES);
  },
};

/**
 * A `YesNo` output. The payload is a boolean under `yes_no`, and `false` is a
 * VALUE — the arm that used to render as an absence.
 */
export const NativeYesNo: Story = {
  args: story('yes_no_result'),
};

/**
 * A `Date` output. `native.Date`'s content model is `{date, time}` — two
 * properties, so nothing unwraps, and the `date` arm reads the model itself.
 * That is the opposite of a `date` FIELD inside a structure, which arrives in
 * the serializer's typed envelope; both are read by the same `readDateContent`,
 * keyed by the kind the descriptor states.
 */
export const NativeDate: Story = {
  args: story('date_result'),
};

/**
 * An `Html` output — a multi-property content model (`{inner_html, css_class}`),
 * so it renders as an object rather than unwrapping.
 *
 * The markup is shown as **text**, deliberately. Injecting a model's HTML into
 * the host's DOM is an XSS sink, and a kernel that did it would be making that
 * decision on every host's behalf. A host that wants it rendered holds the
 * string and decides — with its own sanitizer — which is exactly the seam the
 * descriptor's `kind` makes possible.
 */
export const NativeHtml: Story = {
  args: story('html_result', 720),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/\[object Object\]/)).toBeNull();
  },
};

// ─── Structures ──────────────────────────────────────────────────────────────

/** A flat structure: an enum, a number and an optional prose field, from one run. */
export const FlatStructure: Story = {
  args: story('flat_result'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = payload('flat_result');
    await expect(canvas.getAllByText(String(value.label))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(String(value.confidence))).toHaveLength(BOTH_THEMES);
  },
};

/**
 * One level of nesting: a structure carrying a date, a boolean and a list of
 * concepts.
 *
 * The date is the story: it arrives in the serializer's typed envelope,
 * `{date, __class__, __module__}`, not as a bare ISO string. Nothing in the
 * descriptor says so — only a real payload does.
 */
export const NestedStructure: Story = {
  args: story('nested_result'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = payload('nested_result');
    const issuedOn = (value.issued_on as { date: string }).date;
    await expect(canvas.getAllByText(String(value.reference))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(issuedOn)).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(/__class__/)).toBeNull();
  },
};

/**
 * **Four levels of nesting**, each adding a different kind beside its list:
 * a company holding divisions holding teams holding people, with enums, dates,
 * booleans, numbers and lists of plain text at four different depths.
 *
 * This is the one that answers "does the recursion actually hold up" — a list
 * inside an object inside a list inside an object inside a list, rendered by one
 * component calling itself.
 */
export const DeeplyNested: Story = {
  args: story('deep_result', 720),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const company = payload('deep_result');
    const divisions = company.divisions as { teams: { members: { name: string }[] }[] }[];
    // Reach the deepest leaf the payload holds and assert it rendered: if the
    // recursion stopped early, this is the assertion that notices.
    const deepest = divisions[0]!.teams[0]!.members[0]!.name;
    await expect(canvas.getAllByText(deepest)).toHaveLength(BOTH_THEMES);
  },
};

/** Every scalar kind at once, with two optionals a run may leave empty. */
export const EveryKind: Story = {
  args: story('every_kind_result', 640),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = payload('every_kind_result');
    await expect(canvas.getAllByText(String(value.title))).toHaveLength(BOTH_THEMES);
  },
};

// ─── Plurality ───────────────────────────────────────────────────────────────

/**
 * A `Concept[]` output. Two things at once: the descriptor is a `list` node
 * (plurality is carried by the descriptor, exactly as for a plural input), and
 * the payload is `ListContent {items}` rather than a bare array — which the
 * renderer unwraps by the same `contentKey` path a scalar uses, because the
 * payload schema is `ListContent[…]` and names the property.
 */
export const PluralResult: Story = {
  args: story('plural_result'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = payload('plural_result').items as { label: string }[];
    await expect(items.length).toBeGreaterThan(1);
    for (const item of items) {
      await expect(canvas.getAllByText(item.label)).toHaveLength(BOTH_THEMES);
    }
  },
};

/**
 * **A long list** — fifteen structured entries, each an object of its own.
 *
 * Length is its own test. A list of two says nothing about the index labels, the
 * row chrome or the vertical rhythm at the scale a real result reaches, and it is
 * the case where a renderer that re-derives per row rather than per list starts
 * to be felt.
 */
export const LongList: Story = {
  args: story('long_list_result', 640),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = payload('long_list_result').items as { label: string }[];
    await expect(items.length).toBeGreaterThanOrEqual(10);
    // The last entry: if the list rendered short, this is what says so.
    await expect(canvas.getAllByText(items[items.length - 1]!.label)).toHaveLength(BOTH_THEMES);
  },
};

// ─── File-bearing ────────────────────────────────────────────────────────────

/**
 * A generated image — the arm that used to render `[object Object]`.
 *
 * `native.Image`'s content model is read through `readImageContent`, and the
 * `url` a run produces is a `pipelex-storage://` reference a browser cannot
 * paint. Resolving one is the host's seam (`docs/upload-seam.md`), so with no
 * resolver the reference is shown as what it is rather than as a broken image —
 * which is exactly what a host without a resolver sees.
 */
export const GeneratedImage: Story = {
  args: story('image_result'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const url = payload('image_result').url as string;
    await expect(canvas.getAllByText(new RegExp(escapeRegExp(url.slice(0, 30))))).toHaveLength(
      BOTH_THEMES,
    );
    await expect(canvas.queryByText(/\[object Object\]/)).toBeNull();
  },
};

/**
 * **`native.Page[]` — the richest shape the standard defines**, and the reason
 * `native.Page` needs no renderer arm of its own.
 *
 * Its descriptor is an `object` over `{text_and_images, page_view}`, so it works
 * by recursion into the `image` arm and a nested list. A real extraction of a
 * real PDF, so the text is the document's own and the page views are the images
 * the extractor rendered.
 */
export const ExtractedPages: Story = {
  args: story('page_result', 720),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pages = payload('page_result').items as unknown[];
    await expect(pages.length).toBeGreaterThan(0);
    await expect(canvas.queryByText(/\[object Object\]/)).toBeNull();
  },
};

// ─── Absence ─────────────────────────────────────────────────────────────────

/**
 * An output the run resolved as an absence. `optional: true` on the contract
 * means a SUCCESSFUL run may leave it empty — not that the run failed — so this
 * is a normal state to render, not an error.
 */
export const AbsentResult: Story = {
  args: { pipeCode: 'flat_result', value: undefined },
};

/**
 * A structured result whose every field is absent. The distinction matters: the
 * output is present, its fields are not, and each says so on its own line rather
 * than the whole card collapsing into one absence.
 */
export const AbsentFields: Story = {
  args: { pipeCode: 'every_kind_result', value: {}, maxWidth: 640 },
};
