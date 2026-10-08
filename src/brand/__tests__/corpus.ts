import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BRANDS_DIR, type BrandDir, brandDirs } from '../../__stories__/generative/brand-build';
import type { BrandSource } from '../assemble';

/** The repository root, for the tests that read committed data. */
export const REPO = path.resolve(__dirname, '../../..');

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function sourceAt({ brand, producerId, dir }: BrandDir): BrandSource {
  return {
    brand,
    producerId,
    manifest: readJson(path.join(dir, 'brand.json')),
    tokens: readJson(path.join(dir, 'tokens.json')),
    provenance: readJson(path.join(dir, 'provenance.json')),
  };
}

/** One committed brand's three files, as `assembleBrand` takes them. */
export function corpusSource(brand: string, producerId: string): BrandSource {
  return sourceAt({ brand, producerId, dir: path.join(REPO, BRANDS_DIR, brand, producerId) });
}

/**
 * Every committed brand, sorted by brand then producer: the directories
 * `make brands` builds, listed by its own `brandDirs`, so what is tested here
 * is what is built there.
 */
export function corpusSources(repo: string = REPO): BrandSource[] {
  return brandDirs(repo).map(sourceAt);
}
