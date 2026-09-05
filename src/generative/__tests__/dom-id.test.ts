import { describe, expect, it } from 'vitest';
import { domIdFor, pathFromDomId } from '../registry';

/**
 * The upload seam on a generative page runs on DOM ids: the hatch mints one
 * from the store path it was given, the kernel reports a dropped file by that
 * id, and the host writes the file back at the path the id came from. So the
 * two functions have to be exact inverses, and the interesting case is a name
 * carrying the character the id uses as its separator - which used to make
 * `/inputs/a-b` come back as `/inputs/a/b`, a plausible path, silently wrong.
 */
describe('a store path through a DOM id and back', () => {
  it.each([
    '/inputs/city',
    '/inputs/request/city',
    '/result/lines/0/amount',
    '/inputs/a-b',
    '/inputs/a-b/c-d',
    '/inputs/under_score',
    '/inputs/_d',
    '/inputs/_u',
    '/inputs/a~0b',
    '/inputs/a~1b',
  ])('round-trips %s', (path) => {
    expect(pathFromDomId('gen', domIdFor('gen', path))).toBe(path);
  });

  it('keeps the ids it already minted for ordinary names', () => {
    expect(domIdFor('gen', '/inputs/request/city')).toBe('gen-inputs-request-city');
  });

  it('tells two paths apart that used to mint the same id', () => {
    expect(domIdFor('gen', '/inputs/a-b')).not.toBe(domIdFor('gen', '/inputs/a/b'));
  });

  it('carries the kernel’s own nested suffix through untouched', () => {
    expect(pathFromDomId('gen', 'gen-inputs-a_db.city')).toBe('/inputs/a-b/city');
  });

  it('answers nothing for an id minted under another prefix', () => {
    expect(pathFromDomId('gen', 'other-inputs-city')).toBeUndefined();
  });
});
