import { describe, expect, it } from 'vitest';
import { scoreCandidateDrivers } from '../../src/modules/driver-pool/driver.scorer.js';

describe('scoreCandidateDrivers', () => {
  it('returns top N drivers sorted by relevance', () => {
    const result = scoreCandidateDrivers({
      features: {
        'etf-flow': { relevance: 0.9, hardness: 0.8 },
        'fed-rates': { relevance: 0.5, hardness: 0.7 },
        'positioning-squeeze': { relevance: 0.3, hardness: 0.2 },
      },
      previousDriverKeys: ['etf-flow'],
      topN: 3,
    });

    expect(result[0].driver).toBe('etf-flow');
    expect(result[0].status).toBe('continuing');
    expect(result[1].driver).toBe('fed-rates');
    expect(result[1].status).toBe('new');
  });

  it('labels low-hardness narrative drivers as noisy', () => {
    const result = scoreCandidateDrivers({
      features: {
        'narrative-unconfirmed': { relevance: 0.8, hardness: 0.05 },
      },
      previousDriverKeys: [],
      topN: 1,
    });

    expect(result[0].status).toBe('noisy');
  });
});
