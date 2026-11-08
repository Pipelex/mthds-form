import type { Meta, StoryObj } from '@storybook/react-vite';
import { createStateStore, type Spec } from '@json-render/core';
import * as React from 'react';
import { expect } from 'storybook/test';
import type { BrandManifest } from '../../brand';
import { GenerativePage } from '../../generative';
import { Markdown } from '../../react';
import { Dialog, DialogTitle } from '../../react/ui/dialog';

/**
 * The heading face and tracking a host keeps when it sets no style token,
 * rendered: the one place the `revert-layer` fallback is a fact rather than
 * an assertion about text.
 *
 * A heading the controls draw reads `var(--font-heading, revert-layer)` and
 * `var(--heading-tracking, revert-layer)`, so a host that sets no style token
 * keeps its own heading rule from an earlier layer, as a Tailwind host's base
 * layer is. `make assert-bundle` holds the fallback's spelling; only a browser
 * answers whether a CSS-wide keyword reached through `var()` rolls the
 * property back rather than making the declaration invalid at computed-value
 * time, which would leave the heading `unset`: the body's face, with every
 * check green. The host here declares a distinctive face and tracking for its
 * headings in `@layer base`; each heading the kernel and the generative layer
 * draw (a result's Markdown heading, a dialog's title, a produced page's card
 * title) must wear them, and must wear a style's instead once the tokens are
 * set. See docs/theming.md § "Style tokens".
 */

/** The host's own heading rule, in the layer a Tailwind host's base styles sit in. */
const HOST_HEADINGS = `@layer base {
  .heading-host h2,
  .heading-host h3 {
    font-family: 'Courier New', Courier, monospace;
    letter-spacing: 0.25em;
  }
}`;

/** A style's tokens, set on the host's page. */
const STYLE_TOKENS = {
  '--font-heading': 'Georgia, serif',
  '--heading-tracking': '-0.04em',
} as React.CSSProperties;

const BRAND: BrandManifest = {
  name: 'Acme',
  website: 'https://example.com',
  logo: { onLight: 'https://example.com/dark.svg', onDark: 'https://example.com/light.svg' },
  webfont: null,
};

const CARD: Spec = {
  root: 'card',
  elements: { card: { type: 'Card', props: { title: 'A card on a produced page' }, children: [] } },
};

function Headings({ styled }: { styled: boolean }) {
  // One store for the page's life, as a host holds one.
  const [store] = React.useState(() => createStateStore({}));
  return (
    <div className="heading-host space-y-4 p-4" style={styled ? STYLE_TOKENS : undefined}>
      <style>{HOST_HEADINGS}</style>
      <Markdown text="## A heading in a result" />
      <Dialog>
        <DialogTitle>A dialog&apos;s title</DialogTitle>
      </Dialog>
      <GenerativePage spec={CARD} store={store} scope={{}} brand={BRAND} />
    </div>
  );
}

const meta = {
  title: 'Toolchain/Heading Fallbacks',
  component: Headings,
  args: { styled: false },
} satisfies Meta<typeof Headings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each heading's letter spacing over its font size: the `em` it was set in. */
function trackingEm(heading: Element): number {
  const drawn = getComputedStyle(heading);
  return parseFloat(drawn.letterSpacing) / parseFloat(drawn.fontSize);
}

/** The face `family` computes to, set on an element beside `heading` so it is serialised alike. */
function familyBeside(heading: Element, family: string): string {
  const probe = document.createElement('span');
  probe.style.fontFamily = family;
  heading.parentElement!.appendChild(probe);
  try {
    return getComputedStyle(probe).fontFamily;
  } finally {
    probe.remove();
  }
}

const HEADINGS = ['A heading in a result', "A dialog's title", 'A card on a produced page'];

async function expectHeadingsWear(
  canvasElement: HTMLElement,
  family: string,
  tracking: number,
): Promise<void> {
  const hosts = [...canvasElement.querySelectorAll('.heading-host')];
  // Two theme panes.
  await expect(hosts).toHaveLength(2);
  for (const host of hosts) {
    for (const text of HEADINGS) {
      const heading = [...host.querySelectorAll('h2, h3')].find(
        (candidate) => candidate.textContent === text,
      );
      await expect(heading, text).toBeDefined();
      await expect(getComputedStyle(heading!).fontFamily, `${text}: face`).toBe(
        familyBeside(heading!, family),
      );
      await expect(trackingEm(heading!), `${text}: tracking`).toBeCloseTo(tracking, 3);
    }
  }
}

/** No style token: every heading keeps the host's layered rule, face and tracking. */
export const AHostHeadingRule: Story = {
  name: "A host's layered heading rule",
  play: async ({ canvasElement }) =>
    expectHeadingsWear(canvasElement, "'Courier New', Courier, monospace", 0.25),
};

/** A style's tokens set: they win over the host's layered rule. */
export const AStyleTokens: Story = {
  name: "A style's heading tokens",
  args: { styled: true },
  play: async ({ canvasElement }) => expectHeadingsWear(canvasElement, 'Georgia, serif', -0.04),
};
