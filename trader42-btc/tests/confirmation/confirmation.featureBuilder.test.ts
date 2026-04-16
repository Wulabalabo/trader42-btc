import { describe, expect, it } from 'vitest';
import { buildConfirmationFeatures } from '../../src/modules/confirmation/confirmation.featureBuilder.js';

describe('buildConfirmationFeatures', () => {
  it('detects strong spot support when price up + ETF inflow + healthy OI', () => {
    const result = buildConfirmationFeatures({
      priceChange5m: 0.012,
      priceChange1h: 0.025,
      volumeChange: 1.5,
      etfNetFlowUsd: 200_000_000,
      oiChangePct: 3,
      fundingRate: 0.005,
      basisPct: 0.3,
      liquidationIntensity: 0.1,
      spotVsPerp: 0.8,
    });

    expect(result.spot_confirmation).toBeGreaterThan(0.5);
    expect(result.ETF_confirmation).toBeGreaterThan(0.5);
    expect(result.positioning_heat).toBeLessThan(0.5);
  });
});
