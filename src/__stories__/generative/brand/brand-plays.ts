import type { Spec } from '@json-render/core';
import { expect, userEvent, within } from 'storybook/test';
import type { RunField } from '../../../core';
import { computeReadiness } from '../../../core';
import { BRANDS } from '../../_generated/brands/brands';
import { revealButton, revealInput } from '../play-helpers';
import { skippable } from '../source-stories';
import { fixtureId, type SpecFixture } from '../spec-fixture';
import { resolveColor } from './tokens-schema';

/**
 * What a brand story proves, whichever method and whichever layout it paints.
 *
 * One core under every brand play. The core is the claim every brand page
 * makes: the tokens reach the paint (the one button that runs the method is
 * the brand's accent in each pane, the page is set in the brand's typeface)
 * and the kernel still owns the inputs (what is typed lands in the /inputs
 * tree, and the readiness on the receipt is the kernel's own over that tree).
 * A layout written against the brand catalog adds the manifest - one logo per
 * pane - and the page's grammar, the one h1.
 *
 * What gets typed is decided by the method, not by the play: the first text
 * input the descriptor declares outside a list, found by walking the fields
 * as the brief lists them. A method that declares none - one document in, a
 * list of records the kernel renders whole - types nothing and the receipt is
 * read as it stands, which is a fact about the method the play records
 * rather than a case it has to invent around.
 */

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

/** `rgb(r, g, b)`, as a browser reports a computed opaque colour. */
function computedRgb(components: readonly number[]) {
  return `rgb(${components.map((channel) => Math.round(channel * 255)).join(', ')})`;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The label of the one element that runs the method - a Cta or a Button bound to `run`. */
export function runLabel(spec: Spec): RegExp {
  const runner = Object.values(spec.elements).find((element) => {
    if (element.type !== 'Cta' && element.type !== 'Button') return false;
    const press = element.on?.press;
    const actions = (Array.isArray(press) ? press : [press]).map((binding) => binding?.action);
    return actions.includes('run');
  });
  const label = (runner?.props as { label?: unknown } | undefined)?.label;
  if (typeof label !== 'string') throw new Error('The spec has no Cta or Button that runs.');
  return new RegExp(`^${escapeRegExp(label)}$`, 'i');
}

/** One input the play types into, and what the receipt must then say. */
export interface TextTarget {
  /** The field's name, the brief's - what the id fallback finds it by. */
  name: string;
  /** The label to look for first - the producer's choice. */
  label: RegExp;
  /** What gets typed. */
  text: string;
  /** What the /inputs receipt must then contain. */
  receipt: RegExp;
}

/**
 * The first text input the descriptor declares outside a list, walked in the
 * brief's order and into structures; `null` when the method declares none.
 * A member of a list is never a target: the kernel renders the list whole
 * and its rows are minted at play time, which is the list story's business.
 */
export function firstTextTarget(fields: readonly RunField[]): TextTarget | null {
  for (const field of fields) {
    if (field.kind === 'text' || field.kind === 'prose') {
      const text = 'Typed by the play';
      return {
        name: field.name,
        label: new RegExp(escapeRegExp(field.title ?? field.name).replace(/_/g, '[ _-]?'), 'i'),
        text,
        receipt: new RegExp(`"${escapeRegExp(field.name)}": "${escapeRegExp(text)}"`),
      };
    }
    if (field.kind === 'object') {
      const nested = firstTextTarget(field.fields);
      if (nested) return nested;
    }
  }
  return null;
}

export interface Core {
  canvasElement: HTMLElement;
  /** The spec the story painted. */
  spec: Spec;
  fields: RunField[];
  /** Whether the layout was written against the brand catalog. */
  chrome: boolean;
  /** What to type, or nothing - the receipt is read either way. */
  typing: TextTarget | null;
}

export async function paintsFromTheTokens({ canvasElement, spec, fields, chrome, typing }: Core) {
  const canvas = within(canvasElement);
  const [lightPage, darkPage] = canvas.getAllByTestId('brand-page');
  const brand = BRANDS.find(
    (candidate) =>
      candidate.brand === lightPage!.dataset.brand &&
      candidate.producerId === lightPage!.dataset.producer,
  )!;

  if (chrome) {
    // The manifest reaches the page: one logo per pane, each pane showing the
    // mark for its own canvas and hiding the other; and the Hero carries the
    // page's only h1.
    await expect(canvas.getAllByRole('img', { name: brand.manifest.name })).toHaveLength(
      BOTH_THEMES,
    );
    await expect(within(lightPage!).getAllByRole('heading', { level: 1 })).toHaveLength(1);
  }

  // The kernel still owns the inputs: what is typed lands in the /inputs tree
  // and the readiness on the receipt is the kernel's own over that tree. On a
  // method that declares no text input, the tree is read as seeded.
  if (typing) {
    const input = await revealInput(lightPage!, typing.label, typing.name);
    await userEvent.type(input, typing.text);
  }
  const [receipt] = within(lightPage!).getAllByTestId('inputs-receipt');
  if (typing) await expect(receipt).toHaveTextContent(typing.receipt);
  const tree = JSON.parse(receipt!.textContent ?? '{}') as Record<string, unknown>;
  const readiness = computeReadiness(fields, tree);
  await expect(within(lightPage!).getAllByTestId('readiness')[0]).toHaveTextContent(
    `readiness ${readiness.ready}/${readiness.total}`,
  );
  // The tokens reach the paint: the one button that runs is the brand's
  // accent in the light pane, and the page is set in the brand's typeface.
  // Found AFTER the typing: on a wizard the button sits in the last step, and
  // the helpers only ever walk forward.
  const run = await revealButton(lightPage!, runLabel(spec));
  const primary = resolveColor(brand.tokens, 'primary', 'light')!;
  await expect(getComputedStyle(run).backgroundColor).toBe(computedRgb(primary.components));
  await expect(getComputedStyle(lightPage!).fontFamily).toContain(
    brand.tokens.font.sans.$value[0]!,
  );
  // And in the dark pane the same button is the brand's DARK accent, which a
  // stated accent may name on its own - a near-black accent on a white canvas
  // is a near-white one on a dark canvas.
  const darkRun = await revealButton(darkPage!, runLabel(spec));
  const darkPrimary = resolveColor(brand.tokens, 'primary', 'dark')!;
  await expect(getComputedStyle(darkRun).backgroundColor).toBe(computedRgb(darkPrimary.components));
  return { canvas, lightPage: lightPage! };
}

export type Play = (context: {
  canvasElement: HTMLElement;
  args?: Record<string, unknown>;
}) => Promise<void>;

export interface BrandPlays {
  reference: Play;
  join: Play;
  brandCatalog: Play;
}

/**
 * The plays of a method's story file: the core over the method's own fields,
 * typing into whatever text input the descriptor declares first. A method has
 * no hand-written reference layout, so `reference` is the brand-catalog play
 * - `brandStories.of` is never called on one, and the shape is the trip
 * planner's so one story helper serves both.
 */
export function methodPlays(fields: RunField[], layouts: readonly SpecFixture[]): BrandPlays {
  const typing = firstTextTarget(fields);
  const specOf = (args?: Record<string, unknown>) =>
    layouts.find((candidate) => fixtureId(candidate) === String(args?.layout ?? ''))!.spec;
  const brandCatalog: Play = skippable(async ({ canvasElement, args }) => {
    await paintsFromTheTokens({ canvasElement, spec: specOf(args), fields, chrome: true, typing });
  });
  return {
    reference: brandCatalog,
    join: skippable(async ({ canvasElement, args }) => {
      await paintsFromTheTokens({
        canvasElement,
        spec: specOf(args),
        fields,
        chrome: false,
        typing,
      });
    }),
    brandCatalog,
  };
}
