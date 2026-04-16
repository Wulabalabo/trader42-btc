import { describe, expect, it } from 'vitest';
import { SOURCE_LISTS, getSourceTier } from '../../src/integrations/twitter/sourceLists.js';

describe('SOURCE_LISTS', () => {
  it('has List A, B, and C with minimum coverage', () => {
    expect(SOURCE_LISTS.A.length).toBeGreaterThanOrEqual(5);
    expect(SOURCE_LISTS.B.length).toBeGreaterThanOrEqual(5);
    expect(SOURCE_LISTS.C.length).toBeGreaterThanOrEqual(3);
  });

  it('returns the correct tier for known sources', () => {
    expect(getSourceTier(SOURCE_LISTS.A[0].username)).toBe(SOURCE_LISTS.A[0].tier);
  });
});
