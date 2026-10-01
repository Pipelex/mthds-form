/**
 * The whole input form of one method, over generated fixtures: what it
 * renders, what it reports to its consumer (the values, the run inputs, the
 * gate), the top-level optional disclosure, the required marks after an
 * attempt, and the upload seam it closes over a host's `uploadFile`.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract, type PipeIOContracts } from '../../core/contracts';
import type { RunField } from '../../core/descriptor';
import { getPipeInputForm } from '../../core/derive';
import { narrowFileFormats } from '../../core/narrow-file-formats';
import type { InputForm } from 'mthds/protocol';
import {
  MethodForm,
  useMethodForm,
  type MethodFormProps,
  type UseMethodFormOptions,
} from '../method-form';
import {
  CONTRACTS as STRUCTURED,
  INPUT_FORM as STRUCTURED_FORM,
} from '../../__stories__/_generated/structured';
import { CONTRACTS as FILES, INPUT_FORM as FILES_FORM } from '../../__stories__/_generated/files';

function artifacts(contracts: PipeIOContracts, inputForm: InputForm, domain: string, code: string) {
  const contract = getPipeIOContract(contracts, domain, code);
  const descriptor = getPipeInputForm(inputForm, domain, code);
  if (!contract || !descriptor) throw new Error(`No fixture for ${domain}.${code}`);
  return { contract, descriptor };
}

const SHOP = artifacts(STRUCTURED, STRUCTURED_FORM, 'structured', 'shop_with_bank');
const FLAT = artifacts(STRUCTURED, STRUCTURED_FORM, 'structured', 'flat_object');
const ATTACHMENTS = artifacts(FILES, FILES_FORM, 'files', 'required_vs_optional');

type HarnessProps = Partial<UseMethodFormOptions> &
  Pick<UseMethodFormOptions, 'descriptor' | 'contract'> & {
    formProps?: Omit<MethodFormProps, 'form'>;
  };

/** A consumer: the form, its own run and reset buttons, and the state it reads back. */
function Harness({ formProps, ...options }: HarnessProps) {
  const form = useMethodForm(options);
  return (
    <>
      <MethodForm form={form} {...formProps} />
      <button type="button" onClick={() => form.attempt()}>
        Run
      </button>
      <button type="button" onClick={() => form.reset()}>
        Start over
      </button>
      <output data-testid="state">
        {JSON.stringify({
          names: form.fields.map((field) => field.name),
          values: form.values,
          inputs: form.inputs,
          ready: form.ready,
          uploading: form.uploading,
          missing: form.readiness.missing,
          attempted: form.attempted,
        })}
      </output>
    </>
  );
}

const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');
const fileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

describe('what the form renders and reports', () => {
  it('renders every input of the method and seeds its authored defaults only', () => {
    render(<Harness {...SHOP} />);
    expect(state().names).toEqual(['shop', 'refund_account']);
    // Nothing the shop declares has a default, and the optional bank account
    // and refund account stay closed, so neither optional is sent.
    expect(state().values).toEqual({});
    expect(Object.keys(state().inputs)).toEqual(['shop']);
    expect(state().ready).toBe(false);
    expect(state().missing).toEqual(['shop']);
  });

  it('reports wire-shaped run inputs and the gate as the person fills the form', async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} />);
    await user.type(screen.getByLabelText('name'), 'Atlas Lille');
    expect(state().ready).toBe(true);
    expect(state().inputs).toEqual({
      shop: { concept: 'structured.Shop', content: { name: 'Atlas Lille' } },
    });
  });

  it('orders the inputs as the host asks and keeps the rest after them', () => {
    render(<Harness {...SHOP} order={['refund_account', 'nothing_by_that_name']} />);
    expect(state().names).toEqual(['refund_account', 'shop']);
  });

  it('applies the host’s field transform before everything else reads the fields', () => {
    const withoutBank = (fields: RunField[]): RunField[] =>
      fields.map((field) =>
        field.kind === 'object' && field.name === 'shop'
          ? { ...field, fields: field.fields.filter((child) => child.name !== 'bank_account') }
          : field,
      );
    render(<Harness {...SHOP} prepareFields={withoutBank} />);
    expect(screen.queryByText('1 optional field')).not.toBeInTheDocument();
  });
});

describe('initial values', () => {
  it('lays a host value over the method’s seed until the first edit', async () => {
    const user = userEvent.setup();
    render(
      <Harness {...FLAT} initialValues={(seed) => ({ ...seed, address: { city: 'Lille' } })} />,
    );
    expect(state().values).toEqual({ address: { city: 'Lille' } });
    await user.type(screen.getByLabelText('street'), '1 rue');
    expect(state().values.address).toMatchObject({ city: 'Lille', street: '1 rue' });
  });

  it('restores given values, and a reset goes back to them', async () => {
    const user = userEvent.setup();
    const restored = { shop: { name: 'Atlas Rouen' } };
    render(<Harness {...SHOP} initialValues={restored} />);
    expect(screen.getByLabelText('name')).toHaveValue('Atlas Rouen');
    await user.clear(screen.getByLabelText('name'));
    expect(state().ready).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByLabelText('name')).toHaveValue('Atlas Rouen');
    expect(state().ready).toBe(true);
  });
});

describe('the top-level optional disclosure', () => {
  it('folds a closed optional structure, opens it with its seed, and closes it again', async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} />);
    const disclosure = screen.getByRole('button', { name: '1 optional input' });
    expect(screen.queryByText('refund_account')).not.toBeInTheDocument();

    await user.click(disclosure);
    expect(screen.getByText('refund_account')).toBeInTheDocument();
    expect(state().values.refund_account).toEqual({ holder: 'Atlas SAS', bank: 'BNP Paribas' });
    // Opened with defaults, it holds something, so its required IBAN now gates.
    await user.type(screen.getByLabelText('name'), 'Atlas Lille');
    expect(state().ready).toBe(false);
    expect(state().missing).toEqual(['refund_account']);

    await user.click(screen.getByRole('button', { name: 'Hide optional inputs' }));
    expect(state().values.refund_account).toBeUndefined();
    expect(state().ready).toBe(true);
    expect(Object.keys(state().inputs)).toEqual(['shop']);
  });

  it('shows every optional leaf input when folding is off', () => {
    render(
      <Harness
        {...ATTACHMENTS}
        uploadFile={async () => 'stored'}
        formProps={{ foldOptional: false }}
      />,
    );
    expect(screen.getByText('cover_letter')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /optional input/ })).not.toBeInTheDocument();
  });

  it('still folds a closed optional structure when folding is off, since the disclosure opens it', () => {
    render(<Harness {...SHOP} formProps={{ foldOptional: false }} />);
    expect(screen.getByRole('button', { name: '1 optional input' })).toBeInTheDocument();
  });
});

describe('the required marks', () => {
  it('marks nothing before an attempt, and every empty gating input after one', async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} />);
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(state().attempted).toBe(true);
    expect(screen.getByText('Required')).toBeInTheDocument();
    await user.type(screen.getByLabelText('name'), 'Atlas Lille');
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('marks a started optional input that is not complete', async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} />);
    await user.click(screen.getByRole('button', { name: '1 optional input' }));
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(screen.getByText('Incomplete: fill in its required fields')).toBeInTheDocument();
  });

  it('speaks the locale it is given', async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} formProps={{ locale: 'fr' }} />);
    expect(screen.getByRole('button', { name: '1 entrée facultative' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(screen.getByText('Obligatoire')).toBeInTheDocument();
  });

  it('shows a host’s message over its own marks', () => {
    render(<Harness {...SHOP} formProps={{ errors: { shop: 'The server refused this shop.' } }} />);
    expect(screen.getByText('The server refused this shop.')).toBeInTheDocument();
  });
});

describe('uploads', () => {
  const pdf = () => new File(['%PDF-1.4'], 'quote.pdf', { type: 'application/pdf' });

  it('offers a link only when the host does not upload', () => {
    const { container } = render(<Harness {...ATTACHMENTS} />);
    expect(fileInput(container)).toBeNull();
  });

  it('stores a dropped file at its path, under its own name, and gates while in flight', async () => {
    const user = userEvent.setup();
    let resolve: (url: string) => void = () => {};
    const uploadFile = vi.fn(() => new Promise<string>((done) => (resolve = done)));
    const { container } = render(<Harness {...ATTACHMENTS} uploadFile={uploadFile} />);

    await user.upload(fileInput(container), pdf());
    expect(uploadFile).toHaveBeenCalledWith(expect.any(File), {
      id: 'attachment',
      path: ['attachment'],
    });
    expect(state().uploading).toBe(true);
    expect(state().ready).toBe(false);

    await act(async () => resolve('data:application/pdf;base64,JVBERi0xLjQ='));
    expect(state().uploading).toBe(false);
    expect(state().values.attachment).toEqual({
      url: 'data:application/pdf;base64,JVBERi0xLjQ=',
      filename: 'quote.pdf',
    });
    expect(state().ready).toBe(true);
    expect(state().inputs.attachment.concept).toBe('native.Document');
  });

  it('says on the field when the host’s upload fails', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness {...ATTACHMENTS} uploadFile={() => Promise.reject(new Error('disk full'))} />,
    );
    await user.upload(fileInput(container), pdf());
    expect(
      await screen.findByText('This file could not be uploaded. Try again.'),
    ).toBeInTheDocument();
    expect(state().uploading).toBe(false);
    expect(state().values.attachment).toBeUndefined();
  });

  it('drops an upload that settles after a reset', async () => {
    const user = userEvent.setup();
    let resolve: (url: string) => void = () => {};
    const uploadFile = () => new Promise<string>((done) => (resolve = done));
    const { container } = render(<Harness {...ATTACHMENTS} uploadFile={uploadFile} />);
    await user.upload(fileInput(container), pdf());
    await user.click(screen.getByRole('button', { name: 'Start over' }));
    expect(state().uploading).toBe(false);
    await act(async () => resolve('stored://late'));
    expect(state().values.attachment).toBeUndefined();
  });

  it('keeps a host’s narrowed slot narrowed', () => {
    const pdfOnly = (fields: RunField[]) => narrowFileFormats(fields, ['application/pdf']);
    const { container } = render(
      <Harness {...ATTACHMENTS} uploadFile={async () => 'stored'} prepareFields={pdfOnly} />,
    );
    expect(fileInput(container)).toHaveAttribute(
      'accept',
      expect.stringContaining('application/pdf'),
    );
    expect(within(container).queryAllByText(/PNG/)).toHaveLength(0);
  });
});
