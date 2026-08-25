/**
 * Per-test teardown for the control suite.
 *
 * `@testing-library/react` only auto-cleans when vitest's globals are on, and
 * they are deliberately off here - the suites import what they use. Without
 * this, one test's tree stays mounted in the next one's `document` and every
 * `getBy*` becomes ambiguous.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
