import { describe, expect, it } from 'vitest';
import type { InputForm, OutputForm, PipeIOContracts } from '../../core';
import {
  buildResultField,
  buildRunFields,
  getPipeIOContract,
  getPipeInputForm,
  getPipeOutputForm,
} from '../../core';
import * as files from '../_generated/files';
import * as lists from '../_generated/lists';
import * as results from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';
import * as scalars from '../_generated/scalars';
import * as states from '../_generated/states';
import * as structured from '../_generated/structured';
import { renderInputBrief, renderResultBrief } from '../generative/brief';
import { CUSTOM_COMPONENTS, PICKED_SHADCN, catalog, catalogPrompt } from '../generative/catalog';
import { HEROES, pipeRefOf } from '../generative/heroes';
import { currentPromptHash } from '../generative/prompt-hash';
import { projectInputSpec, projectResultSpec } from '../generative/project-spec';
import { CUSTOM_RULES } from '../generative/rules';
import { payloadToState, seedInputs } from '../generative/state';
import { specFromJsonl, specToJsonl } from '../generative/stream';
import { formatProblems, validateAgainstCatalog } from '../generative/validate';

/**
 * The generative layer, from the node side: the catalog prompt says what it
 * must, the projection of EVERY corpus pipe is a spec the catalog can render,
 * and the loader and the stream bridge are what they claim.
 *
 * A jsdom suite beside the layer (`generative/__tests__/`) renders through the
 * registry; this one never touches React.
 */

interface CaseModule {
  PIPE_REFS: readonly string[];
  CONTRACTS: PipeIOContracts;
  INPUT_FORM: InputForm;
  OUTPUT_FORM: OutputForm;
}

const CASES: Record<string, CaseModule> = { files, lists, results, scalars, states, structured };

function splitRef(pipeRef: string): [string, string] {
  const dot = pipeRef.indexOf('.');
  return [pipeRef.slice(0, dot), pipeRef.slice(dot + 1)];
}

describe('the catalog prompt', () => {
  const prompt = catalogPrompt();

  it('lists every custom component with its description', () => {
    const components = catalog.data.components as Record<string, { description: string }>;
    for (const name of CUSTOM_COMPONENTS) {
      expect(prompt).toContain(`- ${name}:`);
      expect(prompt).toContain(components[name]!.description);
    }
  });

  it('lists every picked shadcn component', () => {
    for (const name of PICKED_SHADCN) expect(prompt).toContain(`- ${name}:`);
  });

  it('carries our rules, in order, after the schema rules', () => {
    let cursor = -1;
    for (const rule of CUSTOM_RULES) {
      const at = prompt.indexOf(rule);
      expect(at, rule).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it('never asks for sample data', () => {
    expect(prompt.toLowerCase()).not.toContain('sample data');
    expect(prompt).not.toContain('INITIAL STATE');
  });

  it('strips className from every picked definition', () => {
    const components = catalog.data.components as Record<string, { props: { shape: object } }>;
    for (const name of PICKED_SHADCN) {
      expect(Object.keys(components[name]!.props.shape), name).not.toContain('className');
    }
  });

  it('hashes to a stable twelve-hex stamp', () => {
    expect(currentPromptHash()).toMatch(/^[0-9a-f]{12}$/);
    expect(currentPromptHash()).toBe(currentPromptHash());
  });
});

describe('the projection', () => {
  for (const [caseName, mod] of Object.entries(CASES)) {
    for (const pipeRef of mod.PIPE_REFS) {
      const [domain, code] = splitRef(pipeRef);
      const contract = getPipeIOContract(mod.CONTRACTS, domain, code)!;

      it(`projects the inputs of ${pipeRef} to a valid spec`, () => {
        const descriptor = getPipeInputForm(mod.INPUT_FORM, domain, code)!;
        const fields = buildRunFields(descriptor, contract.inputs);
        const spec = projectInputSpec(fields, { title: pipeRef });
        const verdict = validateAgainstCatalog(spec);
        expect(verdict.ok, `${caseName}: ${formatProblems(verdict.problems)}`).toBe(true);
        expect(spec.elements[spec.root]!.type).toBe('Stack');
        expect(spec.elements.run!.on).toEqual({
          press: [{ action: 'validateForm' }, { action: 'run' }],
        });
      });

      it(`projects the result of ${pipeRef} to a valid spec`, () => {
        const descriptor = getPipeOutputForm(mod.OUTPUT_FORM, domain, code)!;
        const field = buildResultField(descriptor, contract.output.json_schema);
        const spec = projectResultSpec(field, { title: pipeRef });
        const verdict = validateAgainstCatalog(spec);
        expect(verdict.ok, `${caseName}: ${formatProblems(verdict.problems)}`).toBe(true);
      });
    }
  }

  it('binds every input at its /inputs path and delegates the file, the date and the list', () => {
    const [domain, code] = ['structured', 'invoice_with_source'];
    const contract = getPipeIOContract(structured.CONTRACTS, domain, code)!;
    const fields = buildRunFields(
      getPipeInputForm(structured.INPUT_FORM, domain, code)!,
      contract.inputs,
    );
    const spec = projectInputSpec(fields, { title: 'Invoice' });
    expect(spec.elements['inputs-invoice-reference']!.props.value).toEqual({
      $bindState: '/inputs/invoice/reference',
    });
    expect(spec.elements['inputs-invoice-issued_on']!.type).toBe('MthdsField');
    expect(spec.elements['inputs-invoice-lines']!.type).toBe('MthdsField');
    expect(spec.elements['inputs-source']!).toEqual({
      type: 'MthdsField',
      props: { path: '/inputs/source' },
      children: [],
    });
  });

  it('shows a list of structures as a bound DataTable and a date through the escape hatch', () => {
    const [domain, code] = ['results', 'nested_result'];
    const contract = getPipeIOContract(results.CONTRACTS, domain, code)!;
    const field = buildResultField(
      getPipeOutputForm(results.OUTPUT_FORM, domain, code)!,
      contract.output.json_schema,
    );
    const spec = projectResultSpec(field, { title: 'Invoice' });
    expect(spec.elements['result-lines']!.type).toBe('DataTable');
    expect(spec.elements['result-lines']!.props.rows).toEqual({ $state: '/result/lines' });
    expect(spec.elements['result-issued_on']!.type).toBe('MthdsResult');
    expect(spec.elements['result-total']!.type).toBe('Metric');
  });
});

describe('the validator', () => {
  it('rejects an unknown component, an unknown prop and a bad literal', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: { direction: 'sideways' }, children: ['a', 'b'] },
        a: { type: 'Tabs', props: {}, children: [] },
        b: { type: 'Heading', props: { text: 'x', size: 'xl' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('unknown component type "Tabs"');
    expect(text).toContain('Heading has no prop "size"');
    expect(text).toContain('Stack.direction');
  });

  it('accepts a bound prop where a literal would be the wrong type', () => {
    const verdict = validateAgainstCatalog({
      root: 'h',
      elements: {
        h: { type: 'Heading', props: { text: { $state: '/result/name' } }, children: [] },
      },
    });
    expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
  });
});

describe('the stream bridge', () => {
  it('round-trips a spec through JSONL, root first and parents before children', () => {
    const contract = getPipeIOContract(results.CONTRACTS, 'results', 'nested_result')!;
    const field = buildResultField(
      getPipeOutputForm(results.OUTPUT_FORM, 'results', 'nested_result')!,
      contract.output.json_schema,
    );
    const spec = projectResultSpec(field, { title: 'Invoice' });
    const jsonl = specToJsonl(spec);
    const lines = jsonl.trim().split('\n');
    expect(JSON.parse(lines[0]!)).toEqual({ op: 'add', path: '/root', value: 'page' });
    expect(JSON.parse(lines[1]!).path).toBe('/elements/page');
    expect(specFromJsonl(jsonl)).toEqual(spec);
  });
});

describe('the result loader', () => {
  const contract = getPipeIOContract(results.CONTRACTS, 'results', 'nested_result')!;
  const field = buildResultField(
    getPipeOutputForm(results.OUTPUT_FORM, 'results', 'nested_result')!,
    contract.output.json_schema,
  );
  const state = payloadToState(field, PAYLOADS['results.nested_result']) as Record<string, unknown>;

  it('turns the typed date envelope into the ISO string', () => {
    expect(state.issued_on).toBe('2026-03-14');
  });

  it('keeps the list an array of loaded items and the scalars as they came', () => {
    expect(Array.isArray(state.lines)).toBe(true);
    expect((state.lines as unknown[]).length).toBeGreaterThan(0);
    expect(state.reference).toBe(
      (PAYLOADS['results.nested_result'] as { reference: string }).reference,
    );
  });

  it('unwraps the plural envelope', () => {
    const plural = getPipeIOContract(results.CONTRACTS, 'results', 'plural_result')!;
    const pluralField = buildResultField(
      getPipeOutputForm(results.OUTPUT_FORM, 'results', 'plural_result')!,
      plural.output.json_schema,
    );
    expect(Array.isArray(payloadToState(pluralField, PAYLOADS['results.plural_result']))).toBe(
      true,
    );
  });

  it('seeds only authored defaults', () => {
    const contractWithDefault = getPipeIOContract(
      structured.CONTRACTS,
      'structured',
      'flat_object',
    )!;
    const fields = buildRunFields(
      getPipeInputForm(structured.INPUT_FORM, 'structured', 'flat_object')!,
      contractWithDefault.inputs,
    );
    expect(seedInputs(fields)).toEqual({});
    expect(
      seedInputs([
        { kind: 'text', name: 'a', required: false, defaultValue: 'x' },
        { kind: 'text', name: 'b', required: true },
      ]),
    ).toEqual({ a: 'x' });
  });
});

describe('the briefs', () => {
  it('name every hero pipe in the corpus', () => {
    for (const hero of HEROES) {
      const mod = CASES[hero.caseName]!;
      expect(mod.PIPE_REFS, pipeRefOf(hero)).toContain(pipeRefOf(hero));
    }
  });

  it('mark the file, the date and the list as delegated on the input hero', () => {
    const contract = getPipeIOContract(structured.CONTRACTS, 'structured', 'invoice_with_source')!;
    const fields = buildRunFields(
      getPipeInputForm(structured.INPUT_FORM, 'structured', 'invoice_with_source')!,
      contract.inputs,
    );
    const brief = renderInputBrief({ pipeRef: 'structured.invoice_with_source' }, fields);
    expect(brief).toContain('`/inputs/source` — document (a file)');
    expect(brief).toContain('`/inputs/invoice/issued_on` — date');
    expect(brief).toMatch(/`\/inputs\/invoice\/lines` — list[^\n]*\[delegate: MthdsField\]/);
    expect(brief).toContain('`/inputs/invoice/reference` — text, required');
    expect(brief).not.toContain('json_schema');
  });

  it('carry one loaded run beside the result paths', () => {
    const contract = getPipeIOContract(results.CONTRACTS, 'results', 'nested_result')!;
    const field = buildResultField(
      getPipeOutputForm(results.OUTPUT_FORM, 'results', 'nested_result')!,
      contract.output.json_schema,
    );
    const brief = renderResultBrief(
      { pipeRef: 'results.nested_result' },
      field,
      payloadToState(field, PAYLOADS['results.nested_result']),
    );
    expect(brief).toContain('`/result/lines` — list of structure results.LineItem');
    expect(brief).toContain('`unit_price` — number');
    expect(brief).toContain('"issued_on": "2026-03-14"');
    expect(brief).not.toContain('__class__');
  });
});
