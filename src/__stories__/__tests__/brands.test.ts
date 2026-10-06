import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';
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
