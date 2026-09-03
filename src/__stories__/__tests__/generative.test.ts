import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
import type { InputForm, OutputForm, PipeIOContracts, RunField } from '../../core';
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
import { SPECS as RESULT_SPECS } from '../_generated/results.specs';
import * as scalars from '../_generated/scalars';
import * as states from '../_generated/states';
import * as structured from '../_generated/structured';
import { SPECS as INPUT_SPECS } from '../_generated/structured.specs';
import { renderInputBrief, renderResultBrief } from '../generative/brief';
import { CUSTOM_COMPONENTS, PICKED_SHADCN, catalog, catalogPrompt } from '../generative/catalog';
import { AUTHORED } from '../generative/authored';
import { HEROES, pipeRefOf } from '../generative/heroes';
import {
  absoluteHatchPath,
  inputFieldAtPath,
  repeatBasePathOf,
  resultFieldAtPath,
} from '../generative/paths';
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

describe('a hatch path inside a repeat', () => {
  const spec: Spec = {
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['division'] },
      division: {
        type: 'Card',
        props: {},
        repeat: { statePath: '/result/divisions', key: 'name' },
        children: ['teams', 'team'],
      },
      teams: { type: 'MthdsResult', props: { path: 'teams' }, children: [] },
      team: {
        type: 'Collapsible',
        props: { title: 'x' },
        repeat: { statePath: { $item: 'teams' }, key: 'name' },
        children: ['members', 'founded'],
      },
      members: { type: 'MthdsResult', props: { path: 'members' }, children: [] },
      founded: { type: 'MthdsResult', props: { path: '/result/founded_on' }, children: [] },
    },
  };

  it('resolves against the chain of repeats above it, first item at each level', () => {
    expect(repeatBasePathOf(spec, 'page')).toBeUndefined();
    expect(repeatBasePathOf(spec, 'teams')).toBe('/result/divisions/0');
    expect(repeatBasePathOf(spec, 'members')).toBe('/result/divisions/0/teams/0');
    expect(absoluteHatchPath(spec, 'teams', 'teams')).toBe('/result/divisions/0/teams');
    expect(absoluteHatchPath(spec, 'members', 'members')).toBe(
      '/result/divisions/0/teams/0/members',
    );
  });

  it('leaves an absolute path alone, and a relative one outside a repeat unresolved', () => {
    expect(absoluteHatchPath(spec, 'founded', '/result/founded_on')).toBe('/result/founded_on');
    expect(absoluteHatchPath(spec, 'page', 'name')).toBeUndefined();
  });

  it('names the descriptor node through the list indexes', () => {
    const hero = HEROES.find((candidate) => pipeRefOf(candidate) === 'results.deep_result')!;
    const contract = getPipeIOContract(results.CONTRACTS, hero.domain, hero.pipeCode)!;
    const descriptor = getPipeOutputForm(results.OUTPUT_FORM, hero.domain, hero.pipeCode)!;
    const field = buildResultField(descriptor, contract.output.json_schema);
    expect(resultFieldAtPath(field, '/result/divisions/0/teams')?.kind).toBe('list');
    expect(resultFieldAtPath(field, '/result/divisions/0/teams/0/members')?.kind).toBe('list');
  });

  it('is what the validator demands of a hatch: a literal string, never an expression', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {},
          repeat: { statePath: '/result/divisions', key: 'name' },
          children: ['teams'],
        },
        teams: { type: 'MthdsResult', props: { path: { $item: 'teams' } }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toMatch(/MthdsResult\.path must be a literal string/);
  });
});

describe('the spec fixtures', () => {
  const SPECS = { ...RESULT_SPECS, ...INPUT_SPECS };
  const fixtures = [...Object.values(SPECS), ...Object.values(AUTHORED)];

  /** Every `{ $bindState: path }` anywhere in an element's props. */
  function boundPaths(spec: Spec): string[] {
    const found: string[] = [];
    const walk = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (typeof value === 'object' && value !== null) {
        const record = value as Record<string, unknown>;
        if (typeof record.$bindState === 'string') found.push(record.$bindState);
        Object.values(record).forEach(walk);
      }
    };
    for (const element of Object.values(spec.elements)) walk(element.props);
    return found;
  }

  /** The descriptor a fixture's paths resolve against, off the hero's case module. */
  function descriptorFor(pipeRef: string): { inputs?: RunField[]; result?: RunField } {
    const hero = HEROES.find((candidate) => pipeRefOf(candidate) === pipeRef);
    if (!hero) throw new Error(`${pipeRef} is not a hero`);
    const mod = CASES[hero.caseName]!;
    const contract = getPipeIOContract(mod.CONTRACTS, hero.domain, hero.pipeCode)!;
    if (hero.side === 'input') {
      const descriptor = getPipeInputForm(mod.INPUT_FORM, hero.domain, hero.pipeCode)!;
      return { inputs: buildRunFields(descriptor, contract.inputs) };
    }
    const descriptor = getPipeOutputForm(mod.OUTPUT_FORM, hero.domain, hero.pipeCode)!;
    return { result: buildResultField(descriptor, contract.output.json_schema) };
  }

  it('has a captured and an authored spec for every hero', () => {
    for (const hero of HEROES) {
      expect(SPECS[pipeRefOf(hero)], `captured ${pipeRefOf(hero)}`).toBeDefined();
      expect(AUTHORED[pipeRefOf(hero)], `authored ${pipeRefOf(hero)}`).toBeDefined();
    }
  });

  for (const fixture of fixtures) {
    describe(`${fixture.pipeRef} (${fixture.source})`, () => {
      it('validates against the catalog', () => {
        const verdict = validateAgainstCatalog(fixture.spec);
        expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
      });

      it('was produced against the current catalog prompt', () => {
        // A stale hash means the catalog moved under the fixture: regenerate a
        // captured spec, re-read an authored one against the new prompt and
        // re-stamp it.
        expect(fixture.promptHash).toBe(currentPromptHash());
      });

      it('compiles from its own JSONL to its spec', () => {
        expect(specFromJsonl(fixture.jsonl)).toEqual(fixture.spec);
      });

      it('names its brief and its provenance', () => {
        expect(fixture.brief).toMatch(/^wip\/generative-ui\/briefs\/.+\.md$/);
        expect(fixture.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(fixture.source === 'generated' ? fixture.model : fixture.author).toBeTruthy();
      });

      it('delegates only to paths the descriptor has', () => {
        const scope = descriptorFor(fixture.pipeRef);
        for (const [key, element] of Object.entries(fixture.spec.elements)) {
          const written = (element.props as { path?: unknown }).path;
          const path =
            typeof written === 'string' ? absoluteHatchPath(fixture.spec, key, written) : undefined;
          if (element.type === 'MthdsField') {
            expect(
              typeof path === 'string' && inputFieldAtPath(scope.inputs ?? [], path),
              key,
            ).toBeTruthy();
          }
          if (element.type === 'MthdsResult') {
            expect(
              typeof path === 'string' && scope.result && resultFieldAtPath(scope.result, path),
              key,
            ).toBeTruthy();
          }
        }
      });

      it('carries no /state on a result page', () => {
        if (descriptorFor(fixture.pipeRef).result) expect(fixture.spec.state).toBeUndefined();
      });

      it('binds only to paths the descriptor has, and only on an input page', () => {
        const scope = descriptorFor(fixture.pipeRef);
        const bound = boundPaths(fixture.spec);
        if (!scope.inputs) {
          expect(bound).toEqual([]);
          return;
        }
        for (const path of bound) expect(inputFieldAtPath(scope.inputs, path), path).toBeTruthy();
      });

      it('ends an input page with one Run button firing validateForm then run', () => {
        if (!descriptorFor(fixture.pipeRef).inputs) return;
        const buttons = Object.values(fixture.spec.elements).filter(
          (element) => element.type === 'Button',
        );
        expect(buttons).toHaveLength(1);
        const press = buttons[0]!.on?.press;
        const actions = (Array.isArray(press) ? press : [press]).map((binding) => binding?.action);
        expect(actions).toEqual(['validateForm', 'run']);
      });
    });
  }
});
