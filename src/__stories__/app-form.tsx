import * as React from 'react';
import type { InputForm, PipeIOContracts, RunField } from '../core';
import { getPipeInputForm, getPipeIOContract } from '../core';
import { MethodForm, useMethodForm, type FilePickerSource } from '../react';
import { CONTRACTS, INPUT_FORM } from './_generated/inputs';

/**
 * The harness of the `Inputs/Kinds` stories: one method's inputs as an app
 * draws them, through `useMethodForm` and `MethodForm` with `layout="grid"`,
 * each input in its card, as the Pipelex Studio canvas draws its Input boards.
 * A story names the carrier pipe of `_structures/inputs.mthds` and, when it
 * shows one input of several, which ones (`only`); it seeds values in the
 * form's own shape (`initialValues`), and states the host's seams it varies:
 * the upload limit, the team's files, a disabled form, an attempt to run.
 *
 * Uploads write the file back as an object URL, as the other harnesses do, so
 * a dropped file fills its input.
 */

export interface AppFormProps {
  /** The carrier pipe's code in the `inputs` case, e.g. `text_inputs`. */
  pipeCode: string;
  /** The inputs to show, by name, in this order. Absent, every input of the pipe. */
  only?: readonly string[];
  /** Values in the controls' own shape, keyed by input name. */
  initialValues?: Record<string, unknown>;
  /** Holds every control read-only, as a host does while a run is in flight. */
  disabled?: boolean;
  /** Presses Run once as the form opens, so the gate marks what it refuses. */
  attempted?: boolean;
  /** A message per input name, as a host's server gate sends them. */
  errors?: Readonly<Record<string, string>>;
  /** The inputs a host's synthetic inputs filled. */
  generated?: readonly string[];
  /** The upload limit in bytes. */
  maxFileBytes?: number;
  /** Where Upgrade plan goes. */
  upgradeHref?: string;
  /** The team's files, for "Pick from your team's files". */
  fileSource?: FilePickerSource;
  /** Whether the harness uploads (`true` by default). */
  upload?: boolean;
  /** The ids whose upload never finishes, to show an input mid-upload. */
  holdUploads?: boolean;
  /** Draws the inputs one under the other rather than on the grid. */
  layout?: 'stack' | 'grid';
  contracts?: PipeIOContracts;
  inputForm?: InputForm;
}

export function AppForm({
  pipeCode,
  only,
  initialValues,
  disabled,
  attempted,
  errors,
  generated,
  maxFileBytes,
  upgradeHref,
  fileSource,
  upload = true,
  holdUploads,
  layout = 'grid',
  contracts = CONTRACTS,
  inputForm = INPUT_FORM,
}: AppFormProps) {
  const contract = getPipeIOContract(contracts, 'inputs', pipeCode);
  const descriptor = getPipeInputForm(inputForm, 'inputs', pipeCode);
  if (!contract || !descriptor) {
    throw new Error(
      `No fixture entry for inputs.${pipeCode}. Did the case change without \`make fixtures\`?`,
    );
  }
  const prepareFields = React.useMemo(
    () =>
      only
        ? (fields: RunField[]) =>
            only
              .map((name) => fields.find((field) => field.name === name))
              .filter((field): field is RunField => field !== undefined)
        : undefined,
    // The names are a story's constant.
    [only?.join(',')],
  );
  const form = useMethodForm({
    descriptor,
    contract,
    prepareFields,
    initialValues: initialValues ? (seed) => ({ ...seed, ...initialValues }) : undefined,
    fileSource,
    uploadFile: upload
      ? holdUploads
        ? () => new Promise(() => undefined)
        : async (file) => ({ url: URL.createObjectURL(file), filename: file.name })
      : undefined,
  });
  const { attempt } = form;
  React.useEffect(() => {
    if (attempted) attempt();
  }, [attempted, attempt]);
  const generatedSet = React.useMemo(
    () => (generated ? new Set(generated) : undefined),
    [generated?.join(',')],
  );
  return (
    <MethodForm
      form={form}
      presentation="app"
      layout={layout}
      disabled={disabled}
      errors={errors}
      generated={generatedSet}
      maxFileBytes={maxFileBytes}
      upgradeHref={upgradeHref}
      allowUrl={false}
    />
  );
}

/** A file of `megabytes` MiB, made of zeros, named `name`: what a story drops over the limit. */
export function fileOfSize(name: string, megabytes: number, type = 'application/pdf'): File {
  return new File([new Uint8Array(Math.round(megabytes * 1024 * 1024))], name, { type });
}

/** Drops files on an input, the way a picker hands them over. */
export async function pickFiles(input: HTMLInputElement, files: readonly File[]): Promise<void> {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  Object.defineProperty(input, 'files', { value: transfer.files, configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 50));
}

/** 50 MiB, the upload limit the stories state. */
export const FIFTY_MB = 50 * 1024 * 1024;

/**
 * A picture for a story's image input: a flat drawing of a building, a room
 * or a car in a few colours, painted on a canvas and handed over as a PNG
 * `data:` URL, so the grid of pictures paints without a network. Each seed
 * draws a different one. Not an SVG: the form paints no `data:image/svg+xml`,
 * whose markup could carry script.
 */
export function scenePicture(seed: number): string {
  const skies = ['#c9d9ea', '#e6e1d8', '#dcd8e4', '#cdd4dc', '#e9e4db'];
  const bodies = ['#e2d6bd', '#56715f', '#2c4366', '#8d7a6a', '#b9c4cf'];
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 180;
  const ink = canvas.getContext('2d');
  if (!ink) return '';
  ink.scale(2, 2);
  ink.fillStyle = skies[seed % skies.length]!;
  ink.fillRect(0, 0, 120, 90);
  ink.fillStyle = bodies[(seed * 3) % bodies.length]!;
  ink.fillRect(18 + (seed % 4) * 4, 22 + (seed % 3) * 6, 84, 68);
  ink.fillStyle = '#4f6378';
  ink.fillRect(30 + (seed % 5) * 3, 36, 14, 12);
  ink.fillRect(62 - (seed % 4) * 2, 36, 14, 12);
  return canvas.toDataURL('image/png');
}

/** An image input's value, a picture named like a camera names it. */
export function picture(name: string, seed: number): { url: string; filename: string } {
  return { url: scenePicture(seed), filename: `${name}.png` };
}

/** A document input's value, as a host's storage writes it back. */
export function documentValue(filename: string): { url: string; filename: string } {
  return { url: `https://files.example.invalid/${filename}`, filename };
}
