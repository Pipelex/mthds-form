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
