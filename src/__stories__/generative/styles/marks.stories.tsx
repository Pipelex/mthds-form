import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect } from 'storybook/test';
import type { InputForm, PipeIOContracts } from '../../../core';
import { getPipeInputForm, getPipeIOContract } from '../../../core';
import { MethodForm, useMethodForm } from '../../../react';
import { APP_STYLE_IDS, type AppStyleId } from '../../../brand';
import * as files from '../../_generated/files';
import * as scalars from '../../_generated/scalars';
import * as structured from '../../_generated/structured';
import { backgroundOf, paintedContrast } from '../../painted-color';
import { GENERATIVE_STORY_PARAMETERS } from '../layout-page';
import { AppScope } from './scope';
import { TEAM_KEYS, type TeamKey } from './teams';

/**
 * The marks the kernel's controls draw round themselves - a keyboard focus,
 * a field's error outline, a structure's card in error - on a host's page
 * under every app style, where a panel is filled with something other than
 * the page.
 *
 * Each style is one block: the host's panel with the kernel's form framed in
 * it, and, for the errors, the same kind of form drawn straight on the
 * host's page, where a structure is its own card. `none` is the host's page
 * with no style class, the reference `quiet` matches.
 *
 * - **Focus.** Every focus a control draws with a gap between itself and its
 *   mark (an enum's pill, a switch, a file's drop target, a list's drop
 *   area) is an outline whose offset is a real gap, never a ring whose
 *   offset is painted in the page colour: inside `bold`'s muted panel or
 *   `soft`'s lifted dark one, a painted offset showed as a band of the page
 *   between the control and its ring.
 * - **Errors.** A field's error outline and a structure's card in error are
 *   drawn in the solid error colour, which the brand contract holds at 3:1 on
 *   the page and on a card; at half and seven tenths of it they read under
 *   3:1 even in the stock palette.
 *
 * See docs/theming.md, "Link, selected and focus", and docs/storybook.md,
 * "App styles".
 */

interface CaseModule {
  CONTRACTS: PipeIOContracts;
  INPUT_FORM: InputForm;
}

interface CaseFormProps {
  module: CaseModule;
  domain: string;
  pipeCode: string;
  framed?: boolean;
  /** Presses the host's Run once on mount, so every gating input still empty is marked. */
  attempted?: boolean;
}

function CaseForm({ module, domain, pipeCode, framed = false, attempted = false }: CaseFormProps) {
  const contract = getPipeIOContract(module.CONTRACTS, domain, pipeCode);
  const descriptor = getPipeInputForm(module.INPUT_FORM, domain, pipeCode);
  if (!contract || !descriptor) throw new Error(`No fixture entry for ${domain}.${pipeCode}.`);
  const form = useMethodForm({
    descriptor,
    contract,
    // The object URL is never revoked: a story's page is short-lived.
    uploadFile: async (file) => URL.createObjectURL(file),
  });
  const { attempt } = form;
  React.useEffect(() => {
    if (attempted) attempt();
  }, [attempted, attempt]);
  return <MethodForm form={form} presentation="app" framed={framed} />;
}

type Subject = 'focus' | 'errors';

function StyleBlock({
  subject,
  style,
  team,
}: {
  subject: Subject;
  style: AppStyleId | 'none';
  team: TeamKey | null;
}) {
  return (
    <AppScope style={style} team={team}>
      <div className="af" style={{ minHeight: 0, padding: 16, gap: 12 }} data-style-block={style}>
        <p className="af-eyebrow" style={{ margin: 0 }}>
          {style === 'none' ? 'no style' : style}
        </p>
        <div className="af-panel" style={{ display: 'grid', gap: 20, padding: 20 }}>
          {subject === 'focus' ? (
            <>
              <CaseForm module={scalars} domain="scalars" pipeCode="enum_kind" framed />
              <CaseForm module={scalars} domain="scalars" pipeCode="number_kinds" framed />
              <CaseForm module={files} domain="files" pipeCode="required_vs_optional" framed />
              <CaseForm module={files} domain="files" pipeCode="three_images" framed />
            </>
          ) : (
            <>
              <CaseForm module={scalars} domain="scalars" pipeCode="text_kinds" framed attempted />
              <CaseForm module={files} domain="files" pipeCode="one_document" framed attempted />
            </>
          )}
        </div>
        {subject === 'errors' && (
          <CaseForm module={structured} domain="structured" pipeCode="shop_with_bank" attempted />
        )}
      </div>
    </AppScope>
  );
}

interface MarksArgs {
  subject: Subject;
  team: TeamKey | 'none';
}

function MarksInEveryStyle({ subject, team }: MarksArgs) {
  return (
    <div style={{ display: 'grid' }}>
      {(['none', ...APP_STYLE_IDS] as const).map((style) => (
        <StyleBlock
          key={style}
          subject={subject}
          style={style}
          team={team === 'none' ? null : team}
        />
      ))}
    </div>
  );
}

/** Each style's block on the page, in each theme pane the toolbar shows. */
function blocks(canvasElement: HTMLElement): HTMLElement[] {
  return [...canvasElement.querySelectorAll<HTMLElement>('[data-style-block]')];
}

function where(element: Element): string {
  const block = element.closest<HTMLElement>('[data-style-block]');
  const theme = element.closest('.dark') ? 'dark' : 'light';
  return `${block?.dataset.styleBlock ?? '?'} (${theme})`;
}

/**
 * Whether `control`'s keyboard focus is an outline whose offset is a gap the
 * surface shows through, rather than a box-shadow ring whose offset is
 * painted: no shadow while it has focus, a solid outline at least 2px wide in
 * the focus colour, standing off the control, and reading at 3:1 on the
 * panel it sits on (WCAG 1.4.11).
 */
async function expectOutlinedFocus(control: HTMLElement, marked: HTMLElement = control) {
  control.focus({ preventScroll: true });
  try {
    await expect(control.matches(':focus-visible'), `${where(control)}: focus-visible`).toBe(true);
    await Promise.all(marked.getAnimations().map((animation) => animation.finished));
    const drawn = getComputedStyle(marked);
    const name = `${where(control)}: ${control.getAttribute('aria-label') ?? control.textContent?.trim() ?? control.tagName}`;
    await expect(drawn.boxShadow, `${name}: no painted ring`).toBe('none');
    await expect(drawn.outlineStyle, `${name}: outline style`).toBe('solid');
    await expect(parseFloat(drawn.outlineWidth), `${name}: outline width`).toBeGreaterThanOrEqual(
      2,
    );
    await expect(parseFloat(drawn.outlineOffset), `${name}: outline offset`).toBeGreaterThan(0);
    const panel = marked.closest<HTMLElement>('.af-panel')!;
    await expect(
      paintedContrast(drawn.outlineColor, backgroundOf(panel)),
      `${name}: outline on the panel`,
    ).toBeGreaterThanOrEqual(3);
  } finally {
    control.blur();
  }
}

/** One of each control that draws its focus off its own edge, in every block. */
async function expectEveryFocusOutlined(canvasElement: HTMLElement) {
  const all = blocks(canvasElement);
  await expect(all.length, 'style blocks').toBeGreaterThan(0);
  for (const block of all) {
    const pill = block.querySelector<HTMLElement>('[role="radiogroup"] [role="radio"]');
    const toggle = block.querySelector<HTMLElement>('[role="switch"]');
    const fileInputs = [...block.querySelectorAll<HTMLInputElement>('input[type="file"]')];
    await expect(pill, `${where(block)}: an enum pill`).not.toBeNull();
    await expect(toggle, `${where(block)}: a switch`).not.toBeNull();
    await expect(fileInputs.length, `${where(block)}: the drop targets`).toBeGreaterThan(1);
    await expectOutlinedFocus(pill!);
    await expectOutlinedFocus(toggle!);
    // A file's input is clip-hidden, so its drop target draws the focus.
    for (const input of fileInputs) await expectOutlinedFocus(input, input.parentElement!);
  }
}

/**
 * Every error mark reads at 3:1 on what it is drawn over: a field's outline,
 * standing off the field, on the panel round it, and a structure's card
 * outline on the page the card stands on.
 */
async function expectEveryErrorMarkReads(canvasElement: HTMLElement) {
  const all = blocks(canvasElement);
  await expect(all.length, 'style blocks').toBeGreaterThan(0);
  for (const block of all) {
    const outlines = [...block.querySelectorAll<HTMLElement>('[data-error-outline]')];
    // The headline, the body and the document, in the panel.
    await expect(outlines.length, `${where(block)}: field outlines`).toBe(3);
    for (const outline of outlines) {
      const drawn = getComputedStyle(outline);
      await expect(drawn.boxShadow, `${where(outline)}: no painted ring`).toBe('none');
      await expect(drawn.outlineStyle, `${where(outline)}: outline style`).toBe('solid');
      await expect(
        paintedContrast(drawn.outlineColor, backgroundOf(outline.closest('.af-panel')!)),
        `${where(outline)}: a field's error outline on the panel`,
      ).toBeGreaterThanOrEqual(3);
    }
    // A card in error sets its message under itself, beside it in its group.
    const cards = [...block.querySelectorAll<HTMLElement>('[data-structure-group="box"]')].filter(
      (card) => card.parentElement?.querySelector(':scope > [role="alert"]'),
    );
    await expect(cards.length, `${where(block)}: a card in error`).toBeGreaterThan(0);
    for (const card of cards) {
      const ground = backgroundOf(card.parentElement!);
      await expect(
        paintedContrast(getComputedStyle(card).borderTopColor, ground),
        `${where(card)}: a card's error outline on the page`,
      ).toBeGreaterThanOrEqual(3);
    }
  }
}

const meta = {
  title: 'Generative/Marks in a style',
  component: MarksInEveryStyle,
  args: { subject: 'focus', team: 'none' },
  argTypes: {
    subject: { control: 'inline-radio', options: ['focus', 'errors'] },
    team: { control: 'inline-radio', options: ['none', ...TEAM_KEYS] },
  },
  parameters: GENERATIVE_STORY_PARAMETERS,
} satisfies Meta<typeof MarksInEveryStyle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * An enum's pills, a switch, a file's drop target and a list's drop area in
 * the host's panel under every style: each draws its focus as an outline
 * standing off it, so the gap shows the panel rather than the page.
 */
export const FocusEveryStyle: Story = {
  name: 'Focus · every style · no team',
  args: { subject: 'focus', team: 'none' },
  play: async ({ canvasElement }) => expectEveryFocusOutlined(canvasElement),
};

/** The same with a team's accent as the focus colour. */
export const FocusEveryStyleTeam: Story = {
  name: 'Focus · every style · typer colours',
  args: { subject: 'focus', team: 'typer' },
  play: async ({ canvasElement }) => expectEveryFocusOutlined(canvasElement),
};

/**
 * After a Run with nothing filled: two text fields and a document outlined in
 * error in the host's panel, and a structure's card in error on the page.
 */
export const ErrorsEveryStyle: Story = {
  name: 'Errors · every style · no team',
  args: { subject: 'errors', team: 'none' },
  play: async ({ canvasElement }) => expectEveryErrorMarkReads(canvasElement),
};
