import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/states';

/**
 * The one story that renders what the package promises a host that defines no
 * design tokens - and the only place in the repo where that promise is a
 * rendered fact rather than an assertion about text.
 *
 * `scripts/assert-bundle.mjs` holds the token contract by READING the sheet: it
 * proves a fallback is spelled, and that the value matches `theme.css`'s light
 * palette. What it cannot answer is whether the declaration survives to
 * computed style, because that is a browser question - and the failure this
 * whole arrangement exists to prevent is precisely a declaration the browser
 * DISCARDED. Every other story loads `src/styles/theme.css` through
 * `.storybook/preview.tsx`, so the tokens are always defined and the no-token
 * path never renders anywhere.
 *
 * `initial` is the mechanism, and it is exact rather than approximate. On a
 * custom property `initial` IS the guaranteed-invalid value, so `var(--x, fb)`
 * takes the fallback for the same reason it does on a host that never declared
 * the property - the two are indistinguishable to the cascade. Setting the
 * tokens to `transparent` or to nothing would test something else.
 *
 * It renders through the two-pane decorator like everything else, which is what
 * makes the second half of the contract visible: a fallback is frozen into each
 * utility and cannot vary by scope, so the DARK pane renders light. That is not
 * a bug in the story. `theme.css` is how a host gets the dark defaults, and
 * seeing the two panes match is the argument for loading it.
 */

/**
 * Every token `src/styles/theme.css` declares. Kept as a literal list rather
 * than read from the sheet: a story cannot parse CSS, and the guard already
 * fails the build if this set and the sheet's ever disagree - so the honest
 * division of labour is that the build owns the list and this owns the
 * rendering.
 */
const TOKENS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
  '--radius',
] as const;

const NO_TOKENS = Object.fromEntries(
  TOKENS.map((token) => [token, 'initial']),
) as React.CSSProperties;

/** The values a browser lands on when it discards a declaration. */
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

function TokenlessHost({ children }: { children: React.ReactNode }) {
  return (
    <div style={NO_TOKENS} data-testid="tokenless">
      {children}
    </div>
  );
}

const meta = {
  title: 'Toolchain/Token Fallbacks',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'states' },
  decorators: [
    (Story) => (
      <TokenlessHost>
        <Story />
      </TokenlessHost>
    ),
  ],
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A real form, over a real fixture, with every token unset. The error message
 * is here for one token in particular: `--destructive` is read by nothing else
 * a form renders in its resting state, and it is the one colour whose
 * declaration a host notices losing.
 */
export const AHostThatDefinesNothing: Story = {
  args: { pipeCode: 'defaults', errors: { preferences: 'A recipient is required.' } },
  play: async ({ canvasElement }) => {
    const scope = canvasElement.querySelector('[data-testid="tokenless"]');
    expect(scope).not.toBeNull();

    // A surface whose `background-color` declaration was discarded computes to
    // `transparent`, and a `color` that was discarded falls back to the
    // inherited value - so a token-less rendering is not merely ugly, it is a
    // panel with no surface and a label whose colour nobody chose.
    const surfaces = canvasElement.querySelectorAll('input, textarea, [class*="bg-"]');
    expect(surfaces.length).toBeGreaterThan(0);
    for (const surface of surfaces) {
      const painted = getComputedStyle(surface).backgroundColor;
      expect(painted, `${surface.tagName} lost its background-color`).not.toBe(TRANSPARENT);
    }

    // Geometry too. `--radius` is a length rather than a colour, and
    // `calc(var(--radius) - 2px)` fails exactly as silently as a colour does.
    for (const rounded of canvasElement.querySelectorAll('[class*="rounded-"]')) {
      expect(getComputedStyle(rounded).borderRadius, 'a rounded element squared off').not.toBe(
        '0px',
      );
    }
  },
};
