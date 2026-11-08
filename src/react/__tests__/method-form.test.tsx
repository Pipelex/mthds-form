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
const INVOICE_WITH_SOURCE = artifacts(
  STRUCTURED,
  STRUCTURED_FORM,
  'structured',
  'invoice_with_source',
);

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
    await user.type(screen.getByLabelText('name'), 'Boutique Exemple');
    expect(state().ready).toBe(true);
    expect(state().inputs).toEqual({
      shop: { concept: 'structured.Shop', content: { name: 'Boutique Exemple' } },
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

describe('a form its host has framed', () => {
  const groupings = (container: HTMLElement) =>
    [...container.querySelectorAll('[data-structure-group]')].map((group) =>
      group.getAttribute('data-structure-group'),
    );

  it('boxes each structure among its inputs when the host draws no panel around it', () => {
    const { container } = render(<Harness {...SHOP} />);
    expect(groupings(container)).toEqual(['box']);
    expect(container.querySelector('[data-form-section]')).toBeNull();
  });

  /**
   * The elements the stack's rules land on, each rule's own selector run
   * against the rendered form: jsdom computes no style, so the selectors are
   * what can be read here, and the stories measure the drawn hairline.
   */
  const ruled = (stack: Element) => {
    const rules = stack.className
      .split(/\s+/)
      .map((name) => /^\[(&.+)\]:(border-[tb]|pt-6|pb-6)$/.exec(name))
      .filter((match) => match !== null);
    expect(rules.length).toBeGreaterThan(0);
    return rules.flatMap(([, selector, rule]) =>
      [...stack.querySelectorAll(selector!.replaceAll('&', ':scope'))].map((element) => ({
        element,
        rule: rule!,
      })),
    );
  };

  it("draws each one as a section, ruled off from what follows, inside the host's panel", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness {...SHOP} formProps={{ framed: true }} />);
    await user.click(screen.getByRole('button', { name: '1 optional input' }));
    // The shop and the refund account, each a section; the bank account
    // inside the shop folds behind its own disclosure.
    expect(groupings(container)).toEqual(['section', 'section']);
    const [shop, refund] = container.querySelectorAll('[data-form-section]');
    const stack = shop!.parentElement!;
    // One rule under each section, since something follows each, and none
    // over the second, which the first's rule already sets off.
    expect(ruled(stack).map(({ element, rule }) => [element, rule])).toEqual([
      [shop, 'border-b'],
      [refund, 'border-b'],
      [shop, 'pb-6'],
      [refund, 'pb-6'],
    ]);
  });

  it("sets its rules on the section alone, never on a neighbour's own box", () => {
    // A structure followed by a file field: whatever the neighbour's root is
    // (a boolean's is a filled, padded row), a border or padding set on it
    // would reshape it, so the rule between the two is the section's.
    const { container } = render(<Harness {...INVOICE_WITH_SOURCE} formProps={{ framed: true }} />);
    const sections = [...container.querySelectorAll('[data-form-section]')];
    expect(sections).toHaveLength(1);
    const hits = ruled(sections[0]!.parentElement!);
    expect(hits.map(({ rule }) => rule)).toEqual(['border-b', 'pb-6']);
    for (const { element } of hits) expect(element).toBe(sections[0]);
  });

  it('marks each section the run gate refuses at its heading and along its edge', async () => {
    // Without the frame the structure's card turned red. A section has no
    // card, so it says so where it starts and down its side instead, rather
    // than in a caption under its last field.
    const user = userEvent.setup();
    const { container } = render(<Harness {...SHOP} formProps={{ framed: true }} />);
    await user.click(screen.getByRole('button', { name: '1 optional input' }));
    expect(container.querySelector('[data-error-edge]')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Run' }));

    const shop = screen.getByRole('group', { name: 'shop' });
    const refund = screen.getByRole('group', { name: 'refund_account' });
    for (const [section, message, field] of [
      [shop, 'Required', 'name'],
      [refund, 'Incomplete: fill in its required fields', 'iban'],
    ] as const) {
      expect(section.querySelectorAll('[data-error-edge]')).toHaveLength(1);
      // The section's own message comes first; the empty field it holds
      // carries its own mark under it.
      const [caption] = within(section).getAllByRole('alert');
      expect(caption).toHaveTextContent(message);
      const input = within(section).getByLabelText(field);
      expect(
        caption!.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    // Filling the shop's name clears its cue and leaves the refund account's.
    await user.type(within(shop).getByLabelText('name'), 'Boutique Exemple');
    expect(shop.querySelector('[data-error-edge]')).toBeNull();
    expect(within(shop).queryByRole('alert')).toBeNull();
    expect(refund.querySelectorAll('[data-error-edge]')).toHaveLength(1);
  });
});

describe('initial values', () => {
  it('lays a host value over the method’s seed until the first edit', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        {...FLAT}
        initialValues={(seed) => ({ ...seed, address: { city: 'Exempleville' } })}
      />,
    );
    expect(state().values).toEqual({ address: { city: 'Exempleville' } });
    await user.type(screen.getByLabelText('street'), '1 rue');
    expect(state().values.address).toMatchObject({ city: 'Exempleville', street: '1 rue' });
  });

  it('restores given values, and a reset goes back to them', async () => {
    const user = userEvent.setup();
    const restored = { shop: { name: 'Boutique Démo' } };
    render(<Harness {...SHOP} initialValues={restored} />);
    expect(screen.getByLabelText('name')).toHaveValue('Boutique Démo');
    await user.clear(screen.getByLabelText('name'));
    expect(state().ready).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByLabelText('name')).toHaveValue('Boutique Démo');
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
    expect(state().values.refund_account).toEqual({
      holder: 'Boutique Exemple SAS',
      bank: 'Banque Exemple',
    });
    // Opened with defaults, it holds something, so its required IBAN now gates.
    await user.type(screen.getByLabelText('name'), 'Boutique Exemple');
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
    // The shop, and the empty name inside it.
    expect(screen.getAllByText('Required')).toHaveLength(2);
    await user.type(screen.getByLabelText('name'), 'Boutique Exemple');
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  /**
   * A structure the gate refuses used to be marked as a whole and nothing in
   * it: with several required fields, or a started optional structure, the
   * person had to read every field to find the empty ones.
   */
  it('marks each field a refused structure holds that the gate refuses, as it marks an input', async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} />);
    // The refund account opens on its seeded holder and bank, so it is
    // started, and its IBAN is empty.
    await user.click(screen.getByRole('button', { name: '1 optional input' }));
    await user.click(screen.getByRole('button', { name: 'Run' }));
    const shop = screen.getByRole('group', { name: 'shop' });
    const refund = screen.getByRole('group', { name: 'refund_account' });
    expect(within(shop).getByLabelText('name')).toHaveAttribute('aria-invalid', 'true');
    expect(within(refund).getByLabelText('iban')).toHaveAttribute('aria-invalid', 'true');
    expect(within(refund).getByLabelText('holder')).toHaveAttribute('aria-invalid', 'false');
    // The IBAN's mark under it, then the account's own under its last field.
    expect(
      within(refund)
        .getAllByRole('alert')
        .map((mark) => mark.textContent),
    ).toEqual(['Required', 'Incomplete: fill in its required fields']);
    await user.type(within(refund).getByLabelText('iban'), 'FR7630006000011234567890189');
    expect(within(refund).queryAllByRole('alert')).toHaveLength(0);
  });

  it('marks a started structure inside a refused one, and the empty field inside that', async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} />);
    // The shop's own bank account opens on its seed, started and incomplete.
    await user.click(screen.getByRole('button', { name: '1 optional field' }));
    await user.type(screen.getByLabelText('name'), 'Boutique Exemple');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    const bank = screen.getByRole('group', { name: 'bank_account' });
    expect(
      within(bank)
        .getAllByRole('alert')
        .map((mark) => mark.textContent),
    ).toEqual(['Required', 'Incomplete: fill in its required fields']);
    expect(within(bank).getByLabelText('iban')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('name')).toHaveAttribute('aria-invalid', 'false');
  });

  it("adds no mark to a structure's fields for a host's message, and keeps the gate's beside it", async () => {
    const user = userEvent.setup();
    render(<Harness {...SHOP} formProps={{ errors: { shop: 'The server refused this shop.' } }} />);
    expect(screen.getByText('The server refused this shop.')).toBeInTheDocument();
    expect(screen.getByLabelText('name')).toHaveAttribute('aria-invalid', 'false');
    await user.click(screen.getByRole('button', { name: 'Run' }));
    expect(screen.getByText('The server refused this shop.')).toBeInTheDocument();
    expect(screen.getByLabelText('name')).toHaveAttribute('aria-invalid', 'true');
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
    expect(screen.getAllByText('Obligatoire')).toHaveLength(2);
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
