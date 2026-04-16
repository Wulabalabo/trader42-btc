import { describe, expect, it } from 'vitest';
import { isDuplicate } from '../../src/modules/x-events/xEvent.dedup.js';

describe('isDuplicate', () => {
  it('detects exact tweet ID duplicates', () => {
    const seen = new Set(['tweet-001', 'tweet-002']);
    expect(isDuplicate('tweet-001', 'any text', seen)).toBe(true);
  });

  it('detects near-duplicate text via normalized comparison', () => {
    const seen = new Set<string>();
    const seenTexts = ['SEC approves new BTC ETF filing today'];
    expect(isDuplicate('tweet-new', 'SEC approves new BTC ETF filing today!', seen, seenTexts)).toBe(true);
  });

  it('allows genuinely new content through', () => {
    const seen = new Set<string>();
    const seenTexts = ['SEC approves filing'];
    expect(isDuplicate('tweet-99', 'Fed cuts rate by 50bp', seen, seenTexts)).toBe(false);
  });

  it('handles empty seen state', () => {
    const seen = new Set<string>();
    expect(isDuplicate('tweet-1', 'brand new tweet', seen)).toBe(false);
  });

  it('differentiates substantially different content', () => {
    const seen = new Set<string>();
    const seenTexts = ['BTC drops 5% amid macro uncertainty'];
    expect(isDuplicate('tweet-5', 'IBIT sees record inflow of $500M', seen, seenTexts)).toBe(false);
  });
});
