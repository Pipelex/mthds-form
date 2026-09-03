import type { Spec } from '@json-render/core';
import { element } from '../authoring';
import { brandElement } from './brand-authoring';

/**
 * The trip planner as a product page, written by hand by a Claude Code
 * subagent on claude-fable-5-1 on 2026-09-03 against the brand catalog, with
 * the whole repo in context. What produced it is what the story is called;
 * nothing here is "generated" and nothing is a fixture of the study.
 *
 * The idea, in one sentence: a planner's workspace - three flat stages of the
 * work down the left, and at the right the trip as it takes shape, with the
 * one button that runs the method under it. The five inputs the kernel owns
 * (the two dates, the must-see list, the travellers, the photo) are its own
 * controls at their paths; everything else is copy a person would say.
 */

export const PROTOTYPE_LABEL = 'Claude Code subagent · claude-fable-5-1, by hand';

export const PIPELEX_TRIP_SPEC: Spec = {
  root: 'page',
  elements: {
    page: element(
      'Stack',
      { direction: 'vertical', gap: 'none' },
      { children: ['bar', 'workspace', 'footer'] },
    ),
    bar: brandElement('AppBar', {
      app: 'Trip planner',
      links: ['Methods', 'Runs', 'Docs'],
      tag: 'trips.plan_trip',
    }),
    hero: brandElement('Hero', {
      headline: 'Plan a trip worth taking.',
      lede: 'Say where, who is coming and how you like to travel. The method drafts the days.',
    }),
    workspace: brandElement('Workspace', { rail: 'right' }, { children: ['work', 'rail'] }),
    work: element(
      'Stack',
      { direction: 'vertical', gap: 'none' },
      { children: ['hero', 'where', 'who', 'how'] },
    ),
    // ── 01 Where and when ────────────────────────────────────────────────
    where: brandElement(
      'Section',
      { number: '01', title: 'Where and when' },
      { children: ['where-body'] },
    ),
    'where-body': element(
      'Stack',
      { direction: 'vertical', gap: 'lg' },
      { children: ['place', 'country', 'dates', 'must-see'] },
    ),
    'trip-name': element('Input', {
      label: 'Trip name',
      name: 'title',
      type: 'text',
      placeholder: 'Spring in Lisbon',
      value: { $bindState: '/inputs/request/title' },
      checks: [{ type: 'required', message: 'Give the trip a name.' }],
    }),
    place: element('Grid', { columns: 2, gap: 'lg' }, { children: ['trip-name', 'city'] }),
    city: element('Input', {
      label: 'City',
      name: 'city',
      type: 'text',
      placeholder: 'Lisbon',
      value: { $bindState: '/inputs/request/stay/city' },
      checks: [{ type: 'required', message: 'Which city?' }],
    }),
    country: element('Segmented', {
      label: 'Country',
      name: 'country',
      options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
      value: { $bindState: '/inputs/request/stay/country' },
    }),
    dates: element('Grid', { columns: 2, gap: 'lg' }, { children: ['arriving-on', 'leaving-on'] }),
    'arriving-on': element('MthdsField', { path: '/inputs/request/stay/arriving_on' }),
    'leaving-on': element('MthdsField', { path: '/inputs/request/stay/leaving_on' }),
    'must-see': element('MthdsField', { path: '/inputs/request/stay/must_see' }),
    // ── 02 Who is going ──────────────────────────────────────────────────
    who: brandElement(
      'Section',
      { number: '02', title: 'Who is going' },
      { children: ['who-body'] },
    ),
    'who-body': element(
      'Stack',
      { direction: 'vertical', gap: 'lg' },
      { children: ['travellers', 'children', 'access'] },
    ),
    travellers: element('MthdsField', { path: '/inputs/request/travellers' }),
    children: element('Switch', {
      label: 'Children are coming',
      name: 'with_children',
      checked: { $bindState: '/inputs/request/with_children' },
    }),
    access: element(
      'Collapsible',
      { title: 'Accessibility needs' },
      { children: ['accessibility'] },
    ),
    accessibility: element('Input', {
      label: 'What the plan must respect',
      name: 'accessibility',
      type: 'text',
      placeholder: 'Step-free routes, a lift at the hotel…',
      value: { $bindState: '/inputs/request/accessibility' },
    }),
    // ── 03 How you travel ────────────────────────────────────────────────
    how: brandElement(
      'Section',
      { number: '03', title: 'How you travel' },
      { children: ['how-body'] },
    ),
    'how-body': element(
      'Stack',
      { direction: 'vertical', gap: 'lg' },
      { children: ['money', 'pace', 'style', 'notes', 'inspiration'] },
    ),
    money: element('Grid', { columns: 2, gap: 'lg' }, { children: ['budget', 'currency'] }),
    budget: element('NumberInput', {
      label: 'Budget',
      name: 'budget',
      placeholder: '2500',
      value: { $bindState: '/inputs/request/budget' },
    }),
    currency: element('Segmented', {
      label: 'Currency',
      name: 'currency',
      options: ['EUR', 'USD', 'GBP', 'JPY'],
      value: { $bindState: '/inputs/request/currency' },
    }),
    pace: element('Segmented', {
      label: 'Pace',
      name: 'pace',
      options: ['slow', 'balanced', 'packed'],
      value: { $bindState: '/inputs/request/pace' },
    }),
    style: element('Segmented', {
      label: 'Mostly about',
      name: 'style',
      options: ['culture', 'food', 'nature', 'nightlife', 'family'],
      value: { $bindState: '/inputs/request/style' },
    }),
    notes: element('Textarea', {
      label: 'Anything else',
      name: 'notes',
      rows: 3,
      placeholder: 'A birthday on the second day, a friend to visit, a museum to skip…',
      value: { $bindState: '/inputs/request/notes' },
    }),
    inspiration: element('MthdsField', { path: '/inputs/inspiration' }),
    // ── The rail: the trip as it takes shape, and the run ────────────────
    rail: brandElement(
      'Rail',
      { title: 'Your trip' },
      {
        children: [
          'sum-trip',
          'sum-where',
          'sum-dates',
          'sum-budget',
          'sum-pace',
          'sum-style',
          'plan',
        ],
      },
    ),
    'sum-trip': brandElement('SummaryRow', {
      label: 'Trip',
      value: { $state: '/inputs/request/title' },
    }),
    'sum-where': brandElement('SummaryRow', {
      label: 'Where',
      value: { $state: '/inputs/request/stay/city' },
      detail: { $state: '/inputs/request/stay/country' },
      separator: ', ',
    }),
    'sum-dates': brandElement('SummaryRow', {
      label: 'Dates',
      value: { $state: '/inputs/request/stay/arriving_on' },
      detail: { $state: '/inputs/request/stay/leaving_on' },
      separator: ' → ',
    }),
    'sum-budget': brandElement('SummaryRow', {
      label: 'Budget',
      value: { $state: '/inputs/request/budget' },
      detail: { $state: '/inputs/request/currency' },
    }),
    'sum-pace': brandElement('SummaryRow', {
      label: 'Pace',
      value: { $state: '/inputs/request/pace' },
    }),
    'sum-style': brandElement('SummaryRow', {
      label: 'Mostly about',
      value: { $state: '/inputs/request/style' },
    }),
    plan: brandElement(
      'Cta',
      { label: 'Plan my trip', hint: 'Nothing runs until the request is complete.' },
      { on: { press: [{ action: 'validateForm' }, { action: 'run' }] } },
    ),
    footer: brandElement('Footer', {
      text: 'An executable AI method, run on Pipelex.',
      tag: 'MTHDS',
    }),
  },
};
