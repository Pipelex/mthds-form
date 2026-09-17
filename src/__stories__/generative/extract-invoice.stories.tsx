import type { Meta, StoryObj } from '@storybook/react-vite';
import { findFixture } from '../../generative';
import { CONTRACTS, INPUT_FORM } from '../_generated/extract_invoice';
import { SPECS } from '../_generated/extract_invoice.specs';
import { MTHDS, PIPELEX, STOCK } from './brands';
import {
  GENERATIVE_STORY_PARAMETERS,
  heroFields,
  layoutStory,
  makeLayoutPage,
} from './layout-page';

/**
 * Invoice extraction: one document in, a list of invoices out.
 *
 * The whole of what a person does here is drop a file - the single input is
 * delegated, so the layout hands it straight back to the kernel's own control
 * and spends its effort on everything around it. A method somebody actually
 * wrote, taken in verbatim, with nobody having tuned a brief for it.
 */

const fields = heroFields(CONTRACTS, INPUT_FORM, 'invoice_extraction', 'process_invoice');
const Page = makeLayoutPage(fields, SPECS);
const PINNED = 'pipelex-method--claude-4.8-opus';
const layout = findFixture(SPECS, 'invoice_extraction.process_invoice', PINNED);

const meta = {
  title: 'Generative/Invoice extraction',
  component: Page,
  parameters: GENERATIVE_STORY_PARAMETERS,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opus48: Story = layoutStory(layout, STOCK);
export const MthdsTokens: Story = layoutStory(layout, MTHDS);
export const PipelexTokens: Story = layoutStory(layout, PIPELEX);
