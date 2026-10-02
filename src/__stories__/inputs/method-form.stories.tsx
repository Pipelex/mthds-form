import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { InputForm, PipeIOContracts } from '../../core';
import { getPipeInputForm, getPipeIOContract } from '../../core';
import { MethodForm, useMethodForm, type FieldPresentation } from '../../react';
import { CONTRACTS, INPUT_FORM } from '../_generated/structured';
import { CONTRACTS as FILE_CONTRACTS, INPUT_FORM as FILE_INPUT_FORM } from '../_generated/files';

/**
 * The whole input form of one method, `useMethodForm` + `MethodForm`, as a host
 * mounts it: the fields, the top-level "+ N optional inputs" disclosure, and
 * the required marks after an attempt. Under the form, the story prints what
 * the form hands its consumer - whether the run may start, and the run inputs
 * - because that is the half of the component a host builds on, and the
 * reason to use it rather than `FieldRenderer`.
 *
 * The run button is the story's, not the component's: the host owns it.
 */

interface MethodFormStoryProps {
  contracts: PipeIOContracts;
  inputForm: InputForm;
  domain: string;
  pipeCode: string;
  /** Uploads by writing the file back as a `blob:` URL, as the case harness does. */
  upload?: boolean;
  foldOptional?: boolean;
  locale?: string;
  presentation?: FieldPresentation;
}

function MethodFormStory({
  contracts,
  inputForm,
  domain,
  pipeCode,
  upload = true,
  foldOptional,
  locale,
  presentation = 'app',
}: MethodFormStoryProps) {
  const contract = getPipeIOContract(contracts, domain, pipeCode);
  const descriptor = getPipeInputForm(inputForm, domain, pipeCode);
  if (!contract || !descriptor) {
    throw new Error(`No fixture entry for ${domain}.${pipeCode}.`);
  }
  const form = useMethodForm({
    descriptor,
    contract,
    // The object URL is never revoked: a story's page is short-lived.
    uploadFile: upload ? async (file) => URL.createObjectURL(file) : undefined,
  });
  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
      <MethodForm
        form={form}
        foldOptional={foldOptional}
        locale={locale}
        presentation={presentation}
      />
      <button
        type="button"
        onClick={() => form.attempt()}
        className="w-fit rounded-md border border-border px-3 py-1.5 text-[13px] text-foreground"
      >
        Run
      </button>
      <pre className="text-[11px] text-foreground" data-testid="method-form-state">
        {JSON.stringify({ ready: form.ready, inputs: form.inputs }, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: 'Inputs/Method Form',
  component: MethodFormStory,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'structured' },
} satisfies Meta<typeof MethodFormStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A required structure and an optional one at the top level. The optional
 * refund account is closed, so it folds behind "+ 1 optional input"; opening
 * it seeds its authored defaults and puts its IBAN in the run's way.
 */
export const OptionalStructureAtTheTop: Story = { args: { pipeCode: 'shop_with_bank' } };

/**
 * The same form after Run was pressed with nothing filled: the required shop
 * is marked, the optional input is not.
 */
export const AfterAnAttempt: Story = {
  args: { pipeCode: 'shop_with_bank' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two of each: two theme panes.
    for (const run of canvas.getAllByRole('button', { name: 'Run' })) await userEvent.click(run);
    await expect(canvas.getAllByText('Required')).toHaveLength(2);
  },
};

/** The same, in French, through the component's own `locale`. */
export const InFrench: Story = {
  args: { pipeCode: 'shop_with_bank', locale: 'fr' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: '1 entrée facultative' })).toHaveLength(2);
  },
};

/**
 * A required and an optional file, with folding off, so the optional one
 * shows from the start. A dropped file fills its field and the run inputs.
 */
export const FilesWithFoldingOff: Story = {
  args: {
    contracts: FILE_CONTRACTS,
    inputForm: FILE_INPUT_FORM,
    domain: 'files',
    pipeCode: 'required_vs_optional',
    foldOptional: false,
  },
};
