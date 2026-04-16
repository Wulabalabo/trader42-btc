import { describe, expect, it } from 'vitest';
import { evaluateTriggerGate } from '../../src/modules/trigger-gate/trigger.service.js';

describe('evaluateTriggerGate', () => {
  it('returns complete Step 1.5 payload from snapshot data', () => {
    const result = evaluateTriggerGate({
      return1m: 0.012,
      priceZScore: 2.5,
      volumeZScore: 2.0,
      oiChangePct: 3.0,
      fundingRate: 0.01,
      fundingMean: 0.005,
      basisPct: 0.5,
      basisMean: 0.2,
      liquidationUsd1h: 30_000_000,
      liquidationMean: 8_000_000,
      xResonance: 0.3,
    });
    expect(result).toHaveProperty('triggered');
    expect(result).toHaveProperty('case_label');
    expect(result).toHaveProperty('price_zscore');
    expect(result).toHaveProperty('volume_zscore');
    expect(result).toHaveProperty('priority');
    expect(result.asset).toBe('BTC');
  });
});
