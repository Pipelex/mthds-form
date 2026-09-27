import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SaveFile } from '../../core/save-plan';
import { saveInBrowser } from '../save-in-browser';

let fetchSpy: ReturnType<typeof vi.fn>;
let openSpy: ReturnType<typeof vi.fn>;
let saved: { name: string; type: string }[];
let blobs: Blob[];

beforeEach(() => {
  fetchSpy = vi.fn();
  openSpy = vi.fn();
  saved = [];
  blobs = [];
  vi.stubGlobal('fetch', fetchSpy);
  vi.stubGlobal('open', openSpy);
  // The save path goes through an anchor click; record the names rather than
  // letting jsdom navigate.
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob);
    return 'blob:stub';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    saved.push({ name: this.download, type: blobs.at(-1)?.type ?? '' });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const json: SaveFile = {
  name: 'report.json',
  mimeType: 'application/json',
  kind: 'data',
  path: 'report',
  text: '{}',
};
const chart: SaveFile = {
  name: 'chart.png',
  mimeType: 'image/png',
  kind: 'image',
  path: 'report.chart',
  url: 'https://cdn.example/chart.png',
};

describe('saveInBrowser, the default delivery', () => {
  it('writes inline content straight to a file, as UTF-8 text', async () => {
    const result = await saveInBrowser([json]);
    expect(result).toEqual({ failed: [] });
    expect(saved).toEqual([{ name: 'report.json', type: 'application/json;charset=utf-8' }]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches a URL and saves its bytes under the planned name', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    });
    const result = await saveInBrowser([chart, json]);
    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example/chart.png');
    expect(saved.map((file) => file.name)).toEqual(['chart.png', 'report.json']);
    expect(result.failed).toEqual([]);
  });

  it('reports a file it cannot fetch, and opens no window for it', async () => {
    // The old recovery opened the URL in a tab after the fetch failed, which is
    // outside the click, so a popup blocker suppressed it silently. The file is
    // reported now, and the rest of the plan still goes out.
    fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));
    const result = await saveInBrowser([chart, json]);
    expect(openSpy).not.toHaveBeenCalled();
    expect(result.failed).toEqual([{ file: chart, reason: 'Failed to fetch' }]);
    expect(saved.map((file) => file.name)).toEqual(['report.json']);
  });

  it('reports a file whose server answers with an error', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 403, blob: async () => new Blob([]) });
    const result = await saveInBrowser([chart]);
    expect(result.failed).toEqual([{ file: chart, reason: 'HTTP 403' }]);
    expect(saved).toEqual([]);
  });
});
