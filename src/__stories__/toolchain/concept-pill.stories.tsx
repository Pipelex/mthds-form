import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type { ConceptCategory } from '../../core';
import { ConceptPill } from '../../react';

/**
 * The toolchain smoke story, and the first real one.
 *
 * `ConceptPill` is the only exported control that needs no descriptor at all -
 * it takes a category and a concept ref and nothing else - which makes it the
 * one thing that can be rendered before the fixture pipeline exists without
 * inventing a `RunField` by hand. Rendering it proves every layer this
 * Storybook is built on at once: the Tailwind pass over `tailwind-entry.css`
 * (the pill is `font-mono text-muted-foreground`, so unstyled is obvious), the
 * token values from `theme.css`, the `.dark` swap, and the two-pane decorator.
 *
 * It also happens to be permanent coverage rather than scaffolding: the pill's
 * icon table is a `Record<ConceptCategory, ...>`, so this is the canvas that
 * answers whether all nine categories read as one set.
 */

const CATEGORIES: ConceptCategory[] = [
  'text',
  'date',
  'document',
  'image',
  'number',
  'boolean',
  'choice',
  'structured',
  'list',
];

const EXAMPLE_REF: Record<ConceptCategory, string> = {
  text: 'native.Text',
  date: 'native.Date',
  document: 'native.Document',
  image: 'native.Image',
  number: 'native.Number',
  boolean: 'native.YesNo',
  choice: 'demo.Priority',
  structured: 'demo.Invoice',
  list: 'demo.LineItem[]',
};

const meta = {
  title: 'Toolchain/Concept Pill',
  component: ConceptPill,
} satisfies Meta<typeof ConceptPill>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every category, with the concept ref a method would actually carry. */
export const AllCategories: Story = {
  args: { category: 'text' },
  render: () => (
    <div style={{ display: 'grid', gap: 10 }}>
      {CATEGORIES.map((category) => (
        <ConceptPill key={category} category={category} conceptRef={EXAMPLE_REF[category]} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The decorator renders the story twice, so every label appears in both
    // panes - `getAllByText`, and two of each is the assertion.
    const canvas = within(canvasElement);
    for (const category of CATEGORIES) {
      await expect(canvas.getAllByText(EXAMPLE_REF[category])).toHaveLength(2);
    }
  },
};

/** The bare fallback: no concept ref, so the category names itself. */
export const WithoutConceptRef: Story = {
  args: { category: 'structured' },
};
