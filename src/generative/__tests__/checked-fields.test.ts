import type { ValidationConfig } from '@json-render/core';
import type { ValidationContextValue } from '@json-render/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckedFields } from '../checked-fields';

/**
 * The page's record of its mounted checked fields, which tells json-render
 * each path's combined checks and runs them itself at a press.
 */

const required: ValidationConfig = { checks: [{ type: 'required', message: 'Name a city' }] };

function validation(valid: boolean): ValidationContextValue {
  return {
    customFunctions: {},
    fieldStates: {},
    validate: vi.fn(() => ({ valid, errors: valid ? [] : ['Name a city'], checks: [] })),
    touch: vi.fn(),
    clear: vi.fn(),
    // What json-render was told as of its provider's last render, which a
    // press can beat by one task.
    validateAll: vi.fn(() => true),
    registerField: vi.fn(),
  };
}

describe("the page's record of its checked fields", () => {
  it('keeps one field when another handed the same config object leaves', () => {
    const fields = new CheckedFields();
    const leaveA = fields.enter('/inputs/city', required);
    fields.enter('/inputs/city', required);
    leaveA();
    expect(fields.configFor('/inputs/city')?.checks).toHaveLength(1);
  });

  it('runs its own checks, as it holds them now, whatever json-render last recorded', () => {
    const fields = new CheckedFields();
    fields.enter('/inputs/city', required);
    const lagging = validation(false);
    fields.attach(lagging);
    expect(lagging.validateAll()).toBe(true);
    expect(fields.check(lagging)).toBe(false);
    expect(lagging.validate).toHaveBeenCalledWith('/inputs/city', fields.configFor('/inputs/city'));
  });

  it('tells json-render a path carries no checks once its last field leaves', () => {
    const fields = new CheckedFields();
    const told = validation(true);
    fields.attach(told);
    const leave = fields.enter('/inputs/city', required);
    leave();
    expect(told.registerField).toHaveBeenLastCalledWith('/inputs/city', { checks: [] });
  });
});

/**
 * json-render's `validateAll` reads what it was told as of its provider's last
 * render. Read beside the record's own checks, a field hidden the task before
 * a press still refused the run by the checks it no longer carried.
 */
describe("the run's verdict on each path", () => {
  /** A validation whose `validateAll` judges `judged` by what json-render was last told. */
  function lagging(judged: Record<string, boolean>): ValidationContextValue {
    let states: ValidationContextValue['fieldStates'] = {};
    const told = validation(true);
    return {
      ...told,
      get fieldStates() {
        return states;
      },
      validateAll: vi.fn(() => {
        for (const [path, valid] of Object.entries(judged)) {
          states = {
            ...states,
            [path]: {
              touched: true,
              validated: true,
              result: { valid, errors: valid ? [] : ['stale'], checks: [] },
            },
          };
        }
        return Object.values(judged).every(Boolean);
      }),
    };
  }

  it('is not refused by a field that has left, though json-render still holds its checks', () => {
    const fields = new CheckedFields();
    const stale = lagging({ '/inputs/city': false });
    fields.attach(stale);
    const leave = fields.enter('/inputs/city', required);
    leave();
    expect(fields.check(stale)).toBe(true);
    // Its stale verdict is cleared, so a field mounted there later shows none.
    expect(stale.clear).toHaveBeenCalledWith('/inputs/city');
  });

  it("is refused by a host's control that registered its checks with json-render directly", () => {
    const fields = new CheckedFields();
    const direct = lagging({ '/inputs/notes': false });
    fields.attach(direct);
    expect(fields.check(direct)).toBe(false);
  });

  it("is refused by a host's direct control mounted where a checked field used to be", () => {
    // The record empties the path when its last field leaves; once json-render
    // has drawn with that, the path is json-render's again, so a host's control
    // registered there directly is judged by its own checks.
    const fields = new CheckedFields();
    fields.attach(lagging({}));
    const leave = fields.enter('/inputs/notes', required);
    leave();
    const drawn = lagging({ '/inputs/notes': false });
    fields.attach(drawn);
    expect(fields.check(drawn)).toBe(false);
    expect(drawn.clear).not.toHaveBeenCalled();
  });
});
