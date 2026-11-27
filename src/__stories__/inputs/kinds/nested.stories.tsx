import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppForm } from '../../app-form';

/**
 * Nested structures: a structure inside a structure sits under its own name
 * on a thin rule, a list of structures as numbered items, at any depth, and
 * every field keeps its kind's control: steppers, switches, selects, dates.
 */
const meta = {
  title: 'Inputs/Kinds/Nested structures',
  component: AppForm,
  args: { pipeCode: 'nested_inputs' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    initialValues: {
      property: {
        address: { street: '14 rue des Capucins', postcode: '69001', city: 'Lyon' },
        surface: 86,
        price: 489000,
        energy_rating: 'C',
        lift: false,
        rooms: [
          { room: 'Living room', surface: 32, features: 'Two windows facing south, oak parquet' },
          { room: 'Kitchen', surface: 11, features: 'Open to the living room, gas hob' },
          { room: 'Bedroom', surface: 14 },
        ],
      },
      claim_record: {
        claim_number: 'CLM-2026-0418',
        policy: { holder: 'Lena Varga', policy_number: 'HX-55210', cover: 'comprehensive' },
        incident: {
          date: '2026-02-11',
          place: 'Lyon, rue Garibaldi at cours Lafayette',
          parties: [
            {
              name: 'Lena Varga',
              role: 'policyholder',
              insurer: 'Halden Mutual',
              plate: 'GK-482-TR',
            },
            { name: 'Bruno Oyelaran', role: 'third_party', insurer: 'Calder Assurance' },
          ],
        },
        damaged_items: [
          { part: 'Front left door', damage: 'Dented, paint scraped', quoted: 840 },
          { part: 'Left mirror', damage: 'Housing cracked', quoted: 190 },
        ],
        police_report_filed: true,
      },
    },
  },
};
