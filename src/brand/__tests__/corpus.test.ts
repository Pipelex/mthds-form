import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { brandDirs, keyOf } from '../../__stories__/generative/brand-build';
import { corpusSources, REPO } from './corpus';

describe('the corpus the brand tests read', () => {
  it('is the list make brands builds', () => {
    expect(corpusSources().map(keyOf)).toEqual(brandDirs(REPO).map(keyOf));
  });

  it('skips a directory whose name starts with a dot, at either level', () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'brands-'));
    try {
      const brand = 'pipelex/pipelex-method--claude-4.8-opus';
      cpSync(path.join(REPO, 'data/brands', brand), path.join(repo, 'data/brands', brand), {
        recursive: true,
      });
      // An editor's or a tool's cache, holding none of a brand's three files.
      mkdirSync(path.join(repo, 'data/brands/.cache/stale'), { recursive: true });
      mkdirSync(path.join(repo, 'data/brands/pipelex/.tmp'));
      writeFileSync(path.join(repo, 'data/brands/pipelex/site-facts.json'), '{}');
      expect(corpusSources(repo).map(keyOf)).toEqual([brand]);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
