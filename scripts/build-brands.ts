/**
 * Build the story brands: `data/brands/<brand>/<producer>/` in, the scoped
 * stylesheets and the module a brand story loads out, under
 * `src/__stories__/generative/brands/`.
 *
 *   make brands
 *
 * Free and offline. Every brand is validated and compiled by the brand
 * entry's own `assembleBrand`, so the stylesheets the stories paint in are
 * the kernel's output for the committed data and nothing else. All or
 * nothing: one brand that does not validate writes nothing, and its problems
 * are printed in the words a producer's repair round is told. The outputs are
 * formatted as every committed file is, so `make check` reads the tree as a
 * whole; the corpus guard formats its expectation the same way.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import {
  buildCorpus,
  generatedModuleText,
  indexCssText,
  OUT_DIR,
  stylesheetFile,
  stylesheetText,
} from '../src/__stories__/generative/brand-build';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function formatted(file: string, text: string): Promise<string> {
  const config = (await resolveConfig(file)) ?? {};
  return format(text, { ...config, filepath: file });
}

async function main() {
  const build = buildCorpus(REPO);
  if (!build.ok) {
    for (const failure of build.failures) {
      process.stderr.write(`  ${failure.key}: ${failure.problems.length} problem(s)\n`);
      for (const problem of failure.problems) process.stderr.write(`    - ${problem}\n`);
    }
    process.stderr.write('build-brands: a brand did not validate; nothing was written.\n');
    process.exit(1);
  }
  const outDir = path.join(REPO, OUT_DIR);
  mkdirSync(outDir, { recursive: true });
  // The directory holds generated files only, so a brand removed from the
  // corpus takes its stylesheet with it.
  for (const file of readdirSync(outDir)) rmSync(path.join(outDir, file));
  const write = async (file: string, text: string) => {
    const target = path.join(outDir, file);
    writeFileSync(target, await formatted(target, text));
  };
  for (const brand of build.brands) {
    await write(stylesheetFile(brand), stylesheetText(brand));
    process.stdout.write(`  ${brand.brand}/${brand.producerId}: ok (scope .${brand.scope})\n`);
  }
  await write('index.css', indexCssText(build.brands));
  await write('generated.ts', generatedModuleText(build.brands));
  process.stdout.write(`build-brands: ${build.brands.length} brand(s) -> ${OUT_DIR}/\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`build-brands: ${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
