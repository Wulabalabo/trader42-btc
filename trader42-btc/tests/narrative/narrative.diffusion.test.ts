import { describe, expect, it } from 'vitest';
import { scoreNarrativeDiffusion } from '../../src/modules/narrative/narrative.diffusion.js';

describe('scoreNarrativeDiffusion', () => {
  it('scores professional-first spread higher than retail-only', () => {
    const result = scoreNarrativeDiffusion({
      tier1Events: 3,
      tier2Events: 5,
      tier3Events: 1,
      firstEventMinutesAgo: 30,
      latestEventMinutesAgo: 5,
      totalUniqueAccounts: 8,
    });

    expect(result.layer1_velocity).toBeGreaterThan(result.layer3_retail_diffusion);
    expect(result.spread_strength).toBeGreaterThan(0.3);
  });
});
