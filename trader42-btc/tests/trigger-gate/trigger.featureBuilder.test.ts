import { describe, expect, it } from 'vitest';
import { buildTriggerFeatures } from '../../src/modules/trigger-gate/trigger.featureBuilder.js';

describe('buildTriggerFeatures', () => {
  it('flags high price z-score on abnormal 1m return', () => {
    const result = buildTriggerFeatures({
      return1m: 0.018,
      priceZScore: 3.2,
      volumeZScore: 4.1,
      oiChangePct: 5.0,
      fundingRate: 0.015,
      fundingMean: 0.005,
      basisPct: 0.8,
      basisMean: 0.3,
      liquidationUsd1h: 50_000_000,
      liquidationMean: 10_000_000,
      xResonance: 0,
    });
    expect(result.price_zscore).toBeGreaterThan(2);
    expect(result.volume_zscore).toBeGreaterThan(3);
    expect(result.liquidation_intensity).toBeGreaterThan(0.5);
  });

  it('keeps scores near zero when market is calm', () => {
    const result = buildTriggerFeatures({
      return1m: 0.001,
      priceZScore: 0.3,
      volumeZScore: 0.5,
      oiChangePct: 0.2,
      fundingRate: 0.003,
      fundingMean: 0.003,
      basisPct: 0.25,
      basisMean: 0.25,
      liquidationUsd1h: 2_000_000,
      liquidationMean: 5_000_000,
      xResonance: 0,
    });
    expect(result.price_zscore).toBeLessThan(1);
    expect(result.volume_zscore).toBeLessThan(1);
    expect(result.liquidation_intensity).toBeLessThan(0.3);
  });
});
