import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { BrandSource } from '../assemble';

/** The repository root, for the tests that read committed data. */
export const REPO = path.resolve(__dirname, '../../..');

const BRANDS_DIR = path.join(REPO, 'data/brands');

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** One committed brand's three files, as `assembleBrand` takes them. */
export function corpusSource(brand: string, producerId: string): BrandSource {
  const dir = path.join(BRANDS_DIR, brand, producerId);
  return {
    brand,
    producerId,
    manifest: readJson(path.join(dir, 'brand.json')),
    tokens: readJson(path.join(dir, 'tokens.json')),
    provenance: readJson(path.join(dir, 'provenance.json')),
  };
}

/** Every committed brand, sorted by brand then producer. */
export function corpusSources(): BrandSource[] {
  const sources: BrandSource[] = [];
  for (const brand of readdirSync(BRANDS_DIR, { withFileTypes: true })) {
    if (!brand.isDirectory()) continue;
    for (const producer of readdirSync(path.join(BRANDS_DIR, brand.name), {
      withFileTypes: true,
    })) {
      if (producer.isDirectory()) sources.push(corpusSource(brand.name, producer.name));
    }
  }
  // By code unit, the same order on every machine, whatever its locale.
  const key = (source: BrandSource) => `${source.brand}/${source.producerId}`;
  return sources.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
}
