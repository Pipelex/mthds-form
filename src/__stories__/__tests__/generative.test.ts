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
import * as trips from '../_generated/trips';
import { SPECS as BRAND_TRIP_SPECS } from '../_generated/trips.brand.specs';
import { SPECS as TRIP_SPECS } from '../_generated/trips.specs';
import { renderInputBrief, renderResultBrief } from '../generative/brief';
import {
  BRAND_COMPONENTS,
  brandCatalog,
  brandCatalogPrompt,
} from '../generative/brand/brand-catalog';
import { BRAND_RULES, PRODUCT_PAGE_RULES, RUN_CTA_RULE } from '../generative/brand/brand-rules';
import { CUSTOM_COMPONENTS, PICKED_SHADCN, catalog, catalogPrompt } from '../generative/catalog';
import { AUTHORED } from '../generative/authored';
import { APP_DIRECTION, SEED_PROCEDURE } from '../generative/direction';
import { HEROES, pipeRefOf } from '../generative/heroes';
import {
  absoluteHatchPath,
  inputFieldAtPath,
  repeatBasePathOf,
  resultFieldAtPath,
} from '../generative/paths';
import { currentBrandPromptHash, currentPromptHash } from '../generative/prompt-hash';
import { projectInputSpec, projectResultSpec } from '../generative/project-spec';
import { CUSTOM_RULES, RUN_BUTTON_RULE } from '../generative/rules';
import { fixtureId, fixtureLabel, type Producer } from '../generative/spec-fixture';
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

const CASES: Record<string, CaseModule> = {
  files,
  lists,
  results,
  scalars,
  states,
  structured,
  trips,
};

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

  it('carries the design direction and the seed procedure, so the hash covers both', () => {
    expect(prompt).toContain('DESIGN DIRECTION:');
    for (const paragraph of APP_DIRECTION) expect(prompt).toContain(paragraph);
    expect(prompt).toContain('CREATIVE SEED:');
    for (const paragraph of SEED_PROCEDURE) expect(prompt).toContain(paragraph);
    expect(prompt).toContain('never as a form');
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

describe('the brand catalog prompt', () => {
  const prompt = brandCatalogPrompt();

  it("lists every brand component with its description, after the layer's own", () => {
    const components = brandCatalog.data.components as Record<string, { description: string }>;
    for (const name of [...PICKED_SHADCN, ...CUSTOM_COMPONENTS])
      expect(prompt).toContain(`- ${name}:`);
    for (const name of BRAND_COMPONENTS) {
      expect(prompt).toContain(`- ${name}:`);
      expect(prompt).toContain(components[name]!.description);
    }
  });

  it('restates the Button rule for the Cta in its place, then appends the grammar of the page', () => {
    expect(prompt).not.toContain(RUN_BUTTON_RULE);
    expect(BRAND_RULES.indexOf(RUN_CTA_RULE)).toBe(CUSTOM_RULES.indexOf(RUN_BUTTON_RULE));
    let cursor = -1;
    for (const rule of BRAND_RULES) {
      const at = prompt.indexOf(rule);
      expect(at, rule).toBeGreaterThan(cursor);
      cursor = at;
    }
    for (const rule of PRODUCT_PAGE_RULES) expect(BRAND_RULES).toContain(rule);
  });

  it('carries the same direction and seed procedure, under a hash of its own', () => {
    for (const paragraph of APP_DIRECTION) expect(prompt).toContain(paragraph);
    for (const paragraph of SEED_PROCEDURE) expect(prompt).toContain(paragraph);
    expect(currentBrandPromptHash()).toMatch(/^[0-9a-f]{12}$/);
    expect(currentBrandPromptHash()).not.toBe(currentPromptHash());
  });

  it("leaves the layer's own prompt untouched", () => {
    expect(catalogPrompt()).not.toContain('AppBar');
    expect(catalogPrompt()).toContain(RUN_BUTTON_RULE);
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
    expect(spec.elements['inputs-invoice-total']!.type).toBe('NumberInput');
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
        a: { type: 'Carousel', props: {}, children: [] },
        b: { type: 'Heading', props: { text: 'x', size: 'xl' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('unknown component type "Carousel"');
    expect(text).toContain('Heading has no prop "size"');
    expect(text).toContain('Stack.direction');
  });

  it('wants one child per tab or step, two per split, and no Button as a panel', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Split', props: { ratio: '1:2' }, children: ['tabs', 'steps', 'x'] },
        tabs: {
          type: 'Tabs',
          props: {
            tabs: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
          children: ['a'],
        },
        steps: { type: 'Steps', props: { steps: ['One', 'Two'] }, children: ['a', 'run'] },
        a: { type: 'Stack', props: {}, children: [] },
        x: { type: 'Stack', props: {}, children: [] },
        run: { type: 'Button', props: { label: 'Run' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('Tabs declares 2 panels but has 1 child');
    expect(text).toContain('Steps has a Button as a direct child');
    expect(text).toContain('Split takes exactly two children');
  });

  it('refuses a heading that skips a level, in render order', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['title', 'section', 'sub'] },
        title: { type: 'Heading', props: { text: 'Trip', level: 'h1' }, children: [] },
        section: { type: 'Heading', props: { text: 'Where', level: 'h3' }, children: [] },
        sub: { type: 'Heading', props: { text: 'Fine', level: 'h4' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('[section] Heading jumps to h3 after h1');
    expect(text).not.toContain('[sub]');
  });

  it('refuses an icon the catalog does not name', () => {
    const verdict = validateAgainstCatalog({
      root: 'i',
      elements: { i: { type: 'Icon', props: { name: 'Unicorn' }, children: [] } },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('Icon.name');
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
  const fixtures = [...RESULT_SPECS, ...INPUT_SPECS, ...TRIP_SPECS, ...AUTHORED];
  const PRODUCERS: Producer[] = ['pipelex-method', 'claude-code-subagent', 'claude-code-session'];

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

  it('has, for every hero, a spec by the designer method and one written by hand', () => {
    for (const hero of HEROES) {
      const ref = pipeRefOf(hero);
      const producers = fixtures
        .filter((fixture) => fixture.pipeRef === ref)
        .map((f) => f.producer);
      expect(producers, `${ref}: pipelex-method`).toContain('pipelex-method');
      expect(producers, `${ref}: claude-code-session`).toContain('claude-code-session');
    }
  });

  it('gives every fixture of a hero its own id, and titles it by what made it', () => {
    for (const hero of HEROES) {
      const ref = pipeRefOf(hero);
      const ids = fixtures.filter((fixture) => fixture.pipeRef === ref).map(fixtureId);
      expect(new Set(ids).size, ref).toBe(ids.length);
    }
    for (const fixture of fixtures) {
      const label = fixtureLabel(fixture);
      expect(label).toContain(fixture.model);
      expect(label.toLowerCase()).not.toMatch(/\b(authored|generated)\b/);
    }
  });

  for (const fixture of fixtures) {
    describe(`${fixture.pipeRef} (${fixtureId(fixture)})`, () => {
      it('validates against the catalog', () => {
        const verdict = validateAgainstCatalog(fixture.spec);
        expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
      });

      it('was produced against the current catalog prompt', () => {
        // A stale hash means the prompt moved under the fixture: regenerate a
        // captured spec, re-read a hand-written one against the new prompt and
        // re-stamp it.
        expect(fixture.promptHash).toBe(currentPromptHash());
      });

      it('compiles from its own JSONL to its spec', () => {
        expect(specFromJsonl(fixture.jsonl)).toEqual(fixture.spec);
      });

      it('names its brief and its provenance', () => {
        expect(fixture.brief).toMatch(/^wip\/generative-ui\/briefs\/.+\.md$/);
        expect(fixture.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(PRODUCERS).toContain(fixture.producer);
        expect(fixture.model).toBeTruthy();
        if (fixture.seed !== undefined) expect(fixture.seed.length).toBeGreaterThan(8);
        if (fixture.critic) {
          expect(fixture.critic.model).toBeTruthy();
          expect(fixture.critic.rounds).toBeGreaterThanOrEqual(1);
        }
      });

      it('never quotes its seed on the page', () => {
        if (!fixture.seed) return;
        expect(fixture.jsonl).not.toContain(fixture.seed);
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

      it('has, on an input page, exactly one Button, firing validateForm then run', () => {
        if (!descriptorFor(fixture.pipeRef).inputs) return;
        const buttons = Object.values(fixture.spec.elements).filter(
          (element) => element.type === 'Button',
        );
        expect(buttons).toHaveLength(1);
        const press = buttons[0]!.on?.press;
        const actions = (Array.isArray(press) ? press : [press]).map((binding) => binding?.action);
        expect(actions).toEqual(['validateForm', 'run']);
      });

      it("lists, on an input page, exactly the brief's choices wherever it offers a choice", () => {
        const scope = descriptorFor(fixture.pipeRef);
        if (!scope.inputs) return;
        for (const [key, element] of Object.entries(fixture.spec.elements)) {
          if (!['Segmented', 'Radio', 'Select'].includes(element.type)) continue;
          const props = element.props as { options?: unknown; value?: { $bindState?: string } };
          const path = props.value?.$bindState;
          if (!path) continue;
          const field = inputFieldAtPath(scope.inputs, path);
          expect(field?.kind, `${key} binds ${path}`).toBe('enum');
          if (field?.kind === 'enum') expect(props.options, key).toEqual(field.options);
        }
      });
    });
  }
});

describe('the brand-catalog spec fixtures', () => {
  const fixtures = [...BRAND_TRIP_SPECS];

  /** The one element that runs: exactly one Cta, no Button, firing validateForm then run. */
  function runner(spec: Spec) {
    const buttons = Object.values(spec.elements).filter((element) => element.type === 'Button');
    const ctas = Object.entries(spec.elements).filter(([, element]) => element.type === 'Cta');
    return { buttons, ctas };
  }

  it('has at least the run that answered the question', () => {
    expect(fixtures.map(fixtureId)).toContain('pipelex-method--claude-4.8-opus--brand');
  });

  for (const fixture of fixtures) {
    describe(`${fixture.pipeRef} (${fixtureId(fixture)})`, () => {
      const inputs = (() => {
        const hero = HEROES.find((candidate) => pipeRefOf(candidate) === fixture.pipeRef)!;
        const mod = CASES[hero.caseName]!;
        const contract = getPipeIOContract(mod.CONTRACTS, hero.domain, hero.pipeCode)!;
        const descriptor = getPipeInputForm(mod.INPUT_FORM, hero.domain, hero.pipeCode)!;
        return buildRunFields(descriptor, contract.inputs);
      })();

      it('records the brand catalog, and is titled by it', () => {
        expect(fixture.catalog).toBe('brand');
        expect(fixtureId(fixture)).toMatch(/--brand$/);
        expect(fixtureLabel(fixture)).toContain('brand catalog');
        expect(fixture.brief).toMatch(/\.brand\.md$/);
      });

      it("validates against the brand catalog, and not against the layer's own", () => {
        const verdict = validateAgainstCatalog(fixture.spec, brandCatalog);
        expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
        expect(validateAgainstCatalog(fixture.spec).ok).toBe(false);
      });

      it('was produced against the current brand prompt', () => {
        expect(fixture.promptHash).toBe(currentBrandPromptHash());
      });

      it('compiles from its own JSONL to its spec', () => {
        expect(specFromJsonl(fixture.jsonl)).toEqual(fixture.spec);
      });

      it('carries the grammar of a product page: bar first, hero once, footer last, one Cta and no Button', () => {
        const root = fixture.spec.elements[fixture.spec.root]!;
        const types = (root.children ?? []).map((key) => fixture.spec.elements[key]!.type);
        expect(types[0]).toBe('AppBar');
        expect(types[types.length - 1]).toBe('Footer');
        const count = (type: string) =>
          Object.values(fixture.spec.elements).filter((element) => element.type === type).length;
        for (const once of ['AppBar', 'Hero', 'Workspace', 'Rail', 'Footer']) {
          expect(count(once), once).toBe(1);
        }
        const { buttons, ctas } = runner(fixture.spec);
        expect(buttons).toHaveLength(0);
        expect(ctas).toHaveLength(1);
        const [[ctaKey, cta]] = ctas as [[string, (typeof ctas)[0][1]]];
        const press = cta.on?.press;
        const actions = (Array.isArray(press) ? press : [press]).map((binding) => binding?.action);
        expect(actions).toEqual(['validateForm', 'run']);
        const rail = Object.values(fixture.spec.elements).find(
          (element) => element.type === 'Rail',
        )!;
        expect(rail.children?.[rail.children.length - 1]).toBe(ctaKey);
        expect(
          Object.values(fixture.spec.elements).filter(
            (element) => element.type === 'Heading' && element.props.level === 'h1',
          ),
        ).toHaveLength(0);
      });

      it('delegates and binds only to paths the descriptor has', () => {
        for (const [key, element] of Object.entries(fixture.spec.elements)) {
          if (element.type === 'MthdsField') {
            const written = (element.props as { path?: unknown }).path;
            const path =
              typeof written === 'string'
                ? absoluteHatchPath(fixture.spec, key, written)
                : undefined;
            expect(typeof path === 'string' && inputFieldAtPath(inputs, path), key).toBeTruthy();
          }
          if (element.type === 'SummaryRow') {
            for (const prop of ['value', 'detail'] as const) {
              const bound = (element.props as Record<string, { $state?: unknown }>)[prop]?.$state;
              if (bound === undefined) continue;
              expect(
                typeof bound === 'string' && inputFieldAtPath(inputs, bound),
                `${key}.${prop}`,
              ).toBeTruthy();
            }
          }
        }
      });

      it('writes the budget as a number', () => {
        const budget = Object.values(fixture.spec.elements).find(
          (element) =>
            (element.props as { value?: { $bindState?: string } }).value?.$bindState ===
            '/inputs/request/budget',
        );
        expect(budget?.type).toBe('NumberInput');
      });
    });
  }
});
