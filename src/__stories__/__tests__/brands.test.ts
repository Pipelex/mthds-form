import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';
import { fixtureLabel } from '../../generative';
import {
  brandDirs,
  buildCorpus,
  generatedModuleText,
  indexCssText,
  keyOf,
  OUT_DIR,
  stylesheetFile,
  stylesheetText,
} from '../generative/brand-build';

/**
 * The brands guard - the corpus guard's arrangement, for `data/brands/`.
 *
 * A story brand is data a producer wrote and a build compiled, both committed.
 * What can go wrong is what always can with that arrangement: data edited
 * without a rebuild, a stylesheet left behind by data that was removed, a
 * compiler changed under stylesheets it wrote before. So this rebuilds every
 * brand through the same code `make brands` runs and asserts the committed
 * files are exactly what came out.
 */

const REPO = path.resolve(__dirname, '../../..');
const OUT = path.join(REPO, OUT_DIR);

async function formatted(file: string, text: string): Promise<string> {
  const config = (await resolveConfig(file)) ?? {};
  return format(text, { ...config, filepath: file });
}

describe('the story brands', () => {
  const build = buildCorpus(REPO);

  it('builds every brand of the corpus', () => {
    expect(build.ok ? [] : build.failures).toEqual([]);
    expect(brandDirs(REPO).length).toBeGreaterThan(0);
  });

  it('pairs every brand directory with a stylesheet, and nothing else', () => {
    if (!build.ok) return;
    const files = readdirSync(OUT).sort();
    expect(files).toEqual(
      [...build.brands.map(stylesheetFile), 'generated.ts', 'index.css'].sort(),
    );
    expect(build.brands.map(keyOf)).toEqual(brandDirs(REPO).map(keyOf));
  });

  it('commits exactly what make brands writes', async () => {
    if (!build.ok) return;
    const expected: [string, string][] = [
      ...build.brands.map((brand): [string, string] => [
        stylesheetFile(brand),
        stylesheetText(brand),
      ]),
      ['index.css', indexCssText(build.brands)],
      ['generated.ts', generatedModuleText(build.brands)],
    ];
    for (const [file, text] of expected) {
      const target = path.join(OUT, file);
      expect(readFileSync(target, 'utf8'), `${OUT_DIR}/${file}: run make brands`).toBe(
        await formatted(target, text),
      );
    }
  });
});

describe('a corpus holding a dot-directory', () => {
  it('builds without it, at either level', () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'brands-'));
    try {
      const brand = 'pipelex/pipelex-method--claude-4.8-opus';
      cpSync(path.join(REPO, 'data/brands', brand), path.join(repo, 'data/brands', brand), {
        recursive: true,
      });
      // An editor's or a tool's cache, holding none of a brand's three files.
      mkdirSync(path.join(repo, 'data/brands/.cache/stale'), { recursive: true });
      mkdirSync(path.join(repo, 'data/brands/pipelex/.tmp'));
      const build = buildCorpus(repo);
      expect(build.ok ? build.brands.map(keyOf) : build.failures).toEqual([brand]);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

describe('a seeded brand beside its unseeded twin', () => {
  it('carries its seed into the module, so the two stories are labelled apart', () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'brands-'));
    try {
      const from = path.join(REPO, 'data/brands/pipelex/pipelex-method--claude-4.8-opus');
      const seeded = path.join(repo, 'data/brands/pipelex/pipelex-method--claude-4.8-opus--seeded');
      cpSync(from, path.join(repo, 'data/brands/pipelex/pipelex-method--claude-4.8-opus'), {
        recursive: true,
      });
      cpSync(from, seeded, { recursive: true });
      const provenance = JSON.parse(readFileSync(path.join(seeded, 'provenance.json'), 'utf8'));
      writeFileSync(
        path.join(seeded, 'provenance.json'),
        JSON.stringify({ ...provenance, seed: 'warm' }),
      );
      const build = buildCorpus(repo);
      if (!build.ok) throw new Error(JSON.stringify(build.failures));
      // The entries as a story reads them: the module's array literal, which is JSON.
      const text = generatedModuleText(build.brands);
      const entries = JSON.parse(text.slice(text.indexOf('= [') + 2, text.lastIndexOf(';')));
      const labels = entries.map((entry: Parameters<typeof fixtureLabel>[0]) =>
        fixtureLabel(entry),
      );
      expect(labels).toEqual([
        'Pipelex method · claude-4.8-opus',
        'Pipelex method · claude-4.8-opus · with a seed',
      ]);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

describe('a corpus whose brands fold onto one scope', () => {
  it('is refused, rather than one brand silently standing in for the other', () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'brands-'));
    try {
      const from = path.join(REPO, 'data/brands/pipelex/pipelex-method--claude-4.8-opus');
      const twin = path.join(repo, 'data/brands/pipelex/pipelex-method--claude-4-8-opus');
      cpSync(from, path.join(repo, 'data/brands/pipelex/pipelex-method--claude-4.8-opus'), {
        recursive: true,
      });
      cpSync(from, twin, { recursive: true });
      const provenance = JSON.parse(readFileSync(path.join(twin, 'provenance.json'), 'utf8'));
      writeFileSync(
        path.join(twin, 'provenance.json'),
        JSON.stringify({ ...provenance, model: 'claude-4-8-opus' }),
      );
      const build = buildCorpus(repo);
      expect(build.ok ? [] : build.failures).toEqual([
        {
          key: 'pipelex/pipelex-method--claude-4.8-opus',
          problems: [
            "scope .brand-pipelex-pipelex-method--claude-4-8-opus is already pipelex/pipelex-method--claude-4-8-opus's",
          ],
        },
      ]);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
