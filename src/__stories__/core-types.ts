/**
 * The kernel types a story needs, re-exported from the package's public entry.
 *
 * A story is a CONSUMER: it must reach the kernel the way a consumer does, so
 * this points at the `../core` barrel rather than at a deep module. One file
 * holds the indirection so a story never has to think about which side of that
 * line it is on.
 */
export type { InputForm, PipeIOContracts, RunField, RunFieldKind } from '../core';
