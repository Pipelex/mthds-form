import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/composites';
import { PAYLOADS } from '../_generated/composites.payloads';
// The kernel's own wording, read as an oracle, from the core entry that
// exports it.
import { humanizeFieldName } from '../../core';
import { ResultView } from '../result-view';

/**
 * A `native.Composite` — the result of a `PipeParallel` that adds each
 * branch's output under its own name — in the two presentations.
 *
 * The pipe is `launch_report` in `src/__stories__/_structures/composites.slots.json`,
 * and the payload is what a real run returned: a Markdown summary, a list of
 * structures (which the hosted worker hands back as a bare array) and a
 * generated picture. A composite declares no members, so its descriptor is
 * `kind: "unknown"`, and each member is read as the content it is: the summary
 * typeset, the structures as a table, the picture drawn.
 *
 * A run's picture is a `pipelex-storage://` reference no browser can fetch.
 * The resolver below maps that one reference to a picture Storybook serves,
 * as a host's resolver maps it to its own route; the last story has none, and
 * shows what a host without one shows.
 */

const PAYLOAD = PAYLOADS['composites.launch_report'] as {
  executive_summary: { text: string };
  main_risks: { risk: string; likelihood: string }[];
  cover_picture: { url: string };
};

const SERVED = '/figure_1.jpg';

/** The host's resolver, for the run's one stored picture. */
function resolveUrl(url: string): string | undefined {
  return url === PAYLOAD.cover_picture.url ? SERVED : undefined;
}

const meta = {
  title: 'Outputs/Composites',
  component: ResultView,
  args: {
    contracts: CONTRACTS,
    outputForm: OUTPUT_FORM,
    domain: 'composites',
    pipeCode: 'launch_report',
    value: PAYLOAD,
    maxWidth: 720,
    resolveUrl,
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

const MEMBERS = Object.keys(PAYLOAD);

/**
 * `app`: each member under its name in words, the risks as a table with
 * worded headers, and the picture drawn rather than named.
 */
export const LaunchReportInApp: Story = {
  name: 'Launch report in app',
  args: { presentation: 'app' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const member of MEMBERS) {
      await expect(canvas.getAllByText(humanizeFieldName(member))).toHaveLength(BOTH_THEMES);
      await expect(canvas.queryByText(member)).toBeNull();
    }
    const tables = canvas.getAllByRole('group', { name: humanizeFieldName('main_risks') });
    await expect(tables).toHaveLength(BOTH_THEMES);
    const [first] = PAYLOAD.main_risks;
    await expect(within(tables[0]!).getByText(first!.risk)).toBeTruthy();
    await expect(within(tables[0]!).getByRole('columnheader', { name: 'Likelihood' })).toBeTruthy();
    const pictures = canvasElement.querySelectorAll(`img[src="${SERVED}"]`);
    await expect(pictures).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(/\{/)).toBeNull();
  },
};

/** `studio`: the same members and columns under the names the method wrote. */
export const LaunchReportInStudio: Story = {
  name: 'Launch report in studio',
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const member of MEMBERS) {
      await expect(canvas.getAllByText(member)).toHaveLength(BOTH_THEMES);
    }
    const tables = canvas.getAllByRole('group', { name: 'main_risks' });
    await expect(within(tables[0]!).getByRole('columnheader', { name: 'likelihood' })).toBeTruthy();
  },
};

/**
 * A host with no resolver: the picture's stored reference cannot be painted,
 * so it is named, as an image result's is.
 */
export const WithoutAResolver: Story = {
  name: 'Without a resolver',
  args: { presentation: 'app', resolveUrl: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('img')).toBeNull();
    const name = PAYLOAD.cover_picture.url.split('/').pop()!;
    await expect(canvas.getAllByText(name)).toHaveLength(BOTH_THEMES);
  },
};
