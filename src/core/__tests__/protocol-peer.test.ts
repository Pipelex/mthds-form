/**
 * The types-only peer, asserted rather than assumed.
 *
 * Two claims live here, and neither is visible in any other suite.
 *
 * **The contract types this package exports ARE the standard's.** They used to
 * be a hand mirror, and a mirror drifts silently: the wire grows a slot, the
 * copy does not, and the mismatch surfaces as a rendering bug three layers
 * later. Asserting type IDENTITY (not assignability - a structural subset would
 * satisfy that and is exactly the drift being ruled out) is what makes the
 * re-export a fact instead of an intention.
 *
 * **The descriptor types resolve from inside the kernel.** Since the
 * derivation swap, `buildRunFields` maps `PipeInputFormDescriptor` directly
 * (docs/derivation-swap.md), so this resolution is load-bearing in `src/`
 * itself. The suite keeps asserting it anyway: if the peer, the `exports` map,
 * or the module resolution ever stops working, it fails HERE, by name, rather
 * than as a type error in the middle of `derive.ts`.
 *
 * Types only, throughout - `import type`, which lint requires and
 * `scripts/assert-bundle.mjs` verifies on the built graph. A test file ships in
 * nothing, but a value import here would still be the wrong example to leave
 * lying around.
 */
import { describe, expect, it } from 'vitest';
import type {
  InputPresence,
  IOMultiplicity,
  PipeInputContract,
  PipeIOContract,
  PipeIOContracts,
  PipeOutputContract,
} from '..';
import type {
  InputFormField,
  InputFormTopLevelField,
  IOMultiplicity as StandardIOMultiplicity,
  PipeInputContract as StandardPipeInputContract,
  PipeInputFormDescriptor,
  PipeIOContract as StandardPipeIOContract,
  PipeIOContracts as StandardPipeIOContracts,
  PipeOutputContract as StandardPipeOutputContract,
  PresenceMarker,
} from 'mthds/protocol';
import { PLAIN_SINGLE, SINGLE_OUTPUT } from './contract-fixtures';

/**
 * Mutual assignability of a function's parameter, which is invariant in this
 * position - so this is type EQUALITY, not "one fits in the other".
 */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

/**
 * Every contract name this package exports, proved to be the standard's own
 * declaration. Each slot's type resolves to `true` only when the two are
 * identical, so a drift stops the build at this annotation. The runtime array
 * is incidental - the assertion is the type it is annotated with.
 */
const CONTRACT_TYPE_IDENTITIES: [
  Expect<Equal<IOMultiplicity, StandardIOMultiplicity>>,
  Expect<Equal<InputPresence, PresenceMarker>>,
  Expect<Equal<PipeInputContract, StandardPipeInputContract>>,
  Expect<Equal<PipeOutputContract, StandardPipeOutputContract>>,
  Expect<Equal<PipeIOContract, StandardPipeIOContract>>,
  Expect<Equal<PipeIOContracts, StandardPipeIOContracts>>,
] = [true, true, true, true, true, true];

describe('the contract types are the standard, re-exported', () => {
  it("types a contract built from this package's own fixtures", () => {
    // A runtime assertion over a value the ANNOTATION had to accept: if the
    // re-export resolved to something else, this file would not compile.
    const contract: PipeIOContract = {
      inputs: {
        brief: { ...PLAIN_SINGLE, concept_ref: 'demo.Brief', json_schema: { type: 'object' } },
      },
      output: { concept_ref: 'demo.Summary', ...SINGLE_OUTPUT },
    };
    expect(contract.inputs.brief?.presence).toBe('plain');
    expect(contract.output.item_count).toBeNull();
  });

  it('holds every re-exported name to type identity with `mthds/protocol`', () => {
    expect(CONTRACT_TYPE_IDENTITIES).not.toContain(false);
  });
});

describe('the input-form descriptor is within reach of the kernel', () => {
  it('annotates a descriptor with the wire type the derivation swap will take', () => {
    // Deliberately the shape the swap's `buildRunFields` will receive: a
    // descriptor whose `fields` are TOP-LEVEL fields, which is the entry type
    // that requires `presence` and `gating`. The shared node type does not
    // require them, because it is also the nested named-field shape - a
    // distinction worth pinning here, since taking the looser one at the swap
    // would lose the two facts the kernel currently re-derives.
    const gatingField: InputFormTopLevelField = {
      name: 'brief',
      kind: 'prose',
      required: true,
      presence: 'plain',
      gating: true,
    };
    const descriptor: PipeInputFormDescriptor = { fields: [gatingField] };

    // A top-level field IS a field; the reverse does not hold, and that is the
    // point of the two names.
    const asNode: InputFormField = gatingField;

    expect(descriptor.fields).toHaveLength(1);
    expect(asNode.name).toBe('brief');
    expect(gatingField.gating).toBe(true);
  });

  it('keeps `fields` ordered - the fact the contract map deliberately lacks', () => {
    // Authored input order is the whole reason the descriptor is a sibling
    // artifact rather than a decoration on each contract entry, and an array is
    // how it says so. A change that made `fields` a map would break the swap
    // silently, so the array-ness is asserted rather than assumed.
    const descriptor: PipeInputFormDescriptor = {
      fields: [
        { name: 'first', kind: 'text', required: true, presence: 'plain', gating: true },
        {
          name: 'second',
          kind: 'number',
          integer: false,
          required: false,
          presence: 'optional',
          gating: false,
        },
      ],
    };
    expect(descriptor.fields.map((field) => field.name)).toEqual(['first', 'second']);
  });
});
