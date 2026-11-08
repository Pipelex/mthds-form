import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
import { placedInputs } from '../placed-inputs';

/**
 * A layout orders and words its controls itself, so a line naming inputs for
 * the person reads the page's order and word for each, by the path the
 * element places.
 */
describe('the inputs a layout places', () => {
  const element = (type: string, props: Record<string, unknown>, children: string[] = []) => ({
    type,
    props,
    children,
  });

  it('reads each path a control binds or a hatch delegates, in the page’s order, with its word', () => {
    const spec = {
      root: 'page',
      elements: {
        page: element('Stack', {}, ['first', 'later']),
        later: element('Input', {
          label: 'Trip name',
          value: { $bindState: '/inputs/request/title' },
        }),
        first: element('Card', {}, ['when', 'bare', 'row', 'result']),
        when: element('MthdsField', { path: '/inputs/request/dates', label: ' Arrive ' }),
        bare: element('MthdsField', { path: '/inputs/request/city', label: null }),
        row: element('Input', { label: 'Guest', value: { $bindItem: 'name' } }),
        result: element('Fact', { label: 'Total', value: { $state: '/result/total' } }),
        orphan: element('Input', { label: 'Lost', value: { $bindState: '/inputs/lost' } }),
      },
    } as unknown as Spec;
    expect(Object.fromEntries(placedInputs(spec))).toEqual({
      '/inputs/request/dates': { order: 0, label: 'Arrive' },
      '/inputs/request/city': { order: 1 },
      '/inputs/request/title': { order: 2, label: 'Trip name' },
    });
  });

  it('keeps the first place a path is given, takes a later word for it, and ends on a cycle', () => {
    const spec = {
      root: 'page',
      elements: {
        page: element('Stack', {}, ['first', 'second', 'page']),
        first: element('MthdsField', { path: '/inputs/city', label: null }),
        second: element('Select', { label: 'Town', value: { $bindState: '/inputs/city' } }),
      },
    } as unknown as Spec;
    expect(placedInputs(spec).get('/inputs/city')).toEqual({ order: 0, label: 'Town' });
  });

  it('places a list a repeat lays out where the repeat stands', () => {
    const spec = {
      root: 'page',
      elements: {
        page: element('Stack', {}, ['stops', 'city']),
        stops: { ...element('Stack', {}, ['stop']), repeat: { statePath: '/inputs/stops' } },
        stop: element('Input', { label: 'Stop', value: { $bindItem: 'name' } }),
        city: element('Input', { label: 'City', value: { $bindState: '/inputs/city' } }),
      },
    } as unknown as Spec;
    expect(Object.fromEntries(placedInputs(spec))).toEqual({
      '/inputs/stops': { order: 0 },
      '/inputs/city': { order: 1, label: 'City' },
    });
  });

  it('reads nothing from a layout it cannot walk', () => {
    expect(placedInputs(null).size).toBe(0);
    expect(placedInputs({ root: 'x', elements: null } as unknown as Spec).size).toBe(0);
    const broken = { root: 'page', elements: { page: null } } as unknown as Spec;
    expect(placedInputs(broken).size).toBe(0);
  });
});
