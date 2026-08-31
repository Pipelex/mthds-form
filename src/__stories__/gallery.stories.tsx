import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import type { RunField } from './core-types';
import { deriveCaseFields } from './case-form';
import { FieldRenderer } from '../react';
import { CONTRACTS as FILE_CONTRACTS, INPUT_FORM as FILE_INPUT_FORM } from './_generated/files';
import {
  CONTRACTS as SCALAR_CONTRACTS,
  INPUT_FORM as SCALAR_INPUT_FORM,
} from './_generated/scalars';
import {
  CONTRACTS as STRUCT_CONTRACTS,
  INPUT_FORM as STRUCT_INPUT_FORM,
} from './_generated/structured';

/**
 * Every kind on one canvas.
 *
 * The per-kind stories answer "is this control right"; this one answers a
 * question none of them can - "do these read as ONE system?". Inconsistent
 * label weight, uneven vertical rhythm and a control that sits differently from
 * its neighbours are all invisible one story at a time and obvious here.
 *
 * The fields are pulled from the SAME generated fixtures the catalog uses, so
 * this canvas can never show a shape the catalog does not.
 */

function pick(
  contracts: Parameters<typeof deriveCaseFields>[0],
  inputForm: Parameters<typeof deriveCaseFields>[1],
  domain: string,
  pipeCode: string,
  names: string[],
): RunField[] {
  const byName = new Map(
    deriveCaseFields(contracts, inputForm, domain, pipeCode).map((field) => [field.name, field]),
  );
  return names.map((name) => {
    const field = byName.get(name);
    if (!field) throw new Error(`gallery: ${domain}.${pipeCode} has no field '${name}'`);
    return field;
  });
}

const GALLERY: RunField[] = [
  ...pick(SCALAR_CONTRACTS, SCALAR_INPUT_FORM, 'scalars', 'text_kinds', ['headline']),
  ...pick(SCALAR_CONTRACTS, SCALAR_INPUT_FORM, 'scalars', 'number_kinds', [
    'amount',
    'agreed',
    'due',
  ]),
  ...pick(SCALAR_CONTRACTS, SCALAR_INPUT_FORM, 'scalars', 'enum_kind', ['priority']),
  ...pick(SCALAR_CONTRACTS, SCALAR_INPUT_FORM, 'scalars', 'multiplicity_axis', ['many']),
  ...pick(FILE_CONTRACTS, FILE_INPUT_FORM, 'files', 'one_document', ['attachment']),
  ...pick(FILE_CONTRACTS, FILE_INPUT_FORM, 'files', 'one_image', ['picture']),
  ...pick(STRUCT_CONTRACTS, STRUCT_INPUT_FORM, 'structured', 'flat_object', ['address']),
];

function Gallery() {
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
      {GALLERY.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          id={`gallery-${field.name}`}
          value={values[field.name]}
          onChange={(next) => setValues((previous) => ({ ...previous, [field.name]: next }))}
        />
      ))}
    </div>
  );
}

const meta = {
  title: 'Gallery/Every Kind',
  component: Gallery,
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The whole control set, light and dark, in one screenshot. */
export const EveryKind: Story = {};
