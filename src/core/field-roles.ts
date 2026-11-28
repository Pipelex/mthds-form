/**
 * Where an input stands on its form, by the part it plays in the job.
 *
 * MTHDS `9.2.0` lets a method say what each input is to the job through the
 * `role` hint: the `subject` it works on (every run), the `context` of this
 * case and the `guidance` on how to do it (most runs, sometimes), and the
 * `reference` it applies and the `setting` it reads (set once, rarely
 * changed). A form puts the subject first, the context and guidance after it,
 * and folds the references and settings behind a disclosure of their own.
 *
 * Only a method that says so is laid out this way: when no input of a pipe
 * states a role, every input keeps its authored place and nothing folds, so a
 * method written before roles renders exactly as it did. Once one input states
 * a role, an input that states none takes the default the standard suggests -
 * a file is the subject, an optional prose text guidance, an optional choice or
 * number a setting, anything else context - so the page reads as one layout
 * rather than a sorted part and an unsorted rest.
 *
 * A reference or a setting the run waits for and nothing fills yet never folds:
 * hiding the one input a person still has to give would leave the Run button
 * dark with its reason out of sight. The decision reads the field alone, never
 * the values, so an input does not move between the groups as it is typed into.
 *
 * Pure module: no React.
 */

import type { RoleWord } from 'mthds/protocol';

import type { RunField } from './descriptor';
import { roleOf } from './hints';
import { mustBeFilled } from './readiness';

/** Which group of the form an input belongs to. */
export type FormGroup = 'subject' | 'main' | 'folded';

/** The role an input plays, stated or, in a form where some input states one, defaulted. */
export function effectiveRole(field: RunField, formHasRoles: boolean): RoleWord | undefined {
  const stated = roleOf(field);
  if (stated !== undefined || !formHasRoles) return stated;
  if (field.kind === 'document' || field.kind === 'image') return 'subject';
  if (field.kind === 'list' && (field.item.kind === 'document' || field.item.kind === 'image'))
    return 'subject';
  if (!field.required && field.kind === 'prose') return 'guidance';
  if (!field.required && (field.kind === 'enum' || field.kind === 'number')) return 'setting';
  return 'context';
}

/** Whether any input of the form states a role, which is what turns the role layout on. */
export function formHasRoles(fields: readonly RunField[]): boolean {
  return fields.some((field) => roleOf(field) !== undefined);
}

/**
 * The group an input is drawn in: the subject first, the main group next, and
 * the references and settings folded - unless the run waits for one that has
 * no default, which stays in the main group.
 */
export function formGroupOf(field: RunField, formHasRolesFlag: boolean): FormGroup {
  const role = effectiveRole(field, formHasRolesFlag);
  if (role === 'subject') return 'subject';
  if (role === 'reference' || role === 'setting') {
    return mustBeFilled(field) && field.defaultValue === undefined ? 'main' : 'folded';
  }
  return 'main';
}

/**
 * The inputs in the order the role layout draws them: subjects, then the main
 * group, then the folded group, each keeping its authored order. Returns the
 * fields unchanged when no input states a role.
 */
export function orderByRole(fields: readonly RunField[]): RunField[] {
  const roles = formHasRoles(fields);
  if (!roles) return [...fields];
  const rank: Record<FormGroup, number> = { subject: 0, main: 1, folded: 2 };
  return fields
    .map((field, index) => ({ field, index, rank: rank[formGroupOf(field, roles)] }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ field }) => field);
}
