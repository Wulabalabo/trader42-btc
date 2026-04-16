import { describe, expect, it } from 'vitest';
import { buildDriverFeatures } from '../../src/modules/driver-pool/driver.featureBuilder.js';

describe('buildDriverFeatures', () => {
  it('raises etf-flow relevance when flow-led regime and large inflow align', () => {
    const result = buildDriverFeatures({
      marketRegime: 'flow-led',
      etfNetFlowUsd: 250_000_000,
      oiChangePct: 1.5,
      fundingRate: 0.005,
      liquidationIntensity: 0.2,
      upcomingMacroEvents: [],
    });

    expect(result['etf-flow'].relevance).toBeGreaterThan(0.7);
    expect(result['etf-flow'].hardness).toBeGreaterThan(0.7);
  });

  it('raises fed-rates relevance when FOMC is upcoming', () => {
    const result = buildDriverFeatures({
      marketRegime: 'mixed',
      etfNetFlowUsd: 0,
      oiChangePct: 0,
      fundingRate: 0.001,
      liquidationIntensity: 0,
      upcomingMacroEvents: [{ type: 'FOMC', hoursUntil: 12 }],
    });

    expect(result['fed-rates'].relevance).toBeGreaterThan(0.5);
  });

  it('raises positioning-squeeze when funding extreme and OI high', () => {
    const result = buildDriverFeatures({
      marketRegime: 'positioning-led',
      etfNetFlowUsd: 0,
      oiChangePct: 8,
      fundingRate: 0.035,
      liquidationIntensity: 0.6,
      upcomingMacroEvents: [],
    });

    expect(result['positioning-squeeze'].relevance).toBeGreaterThan(0.7);
    expect(result['positioning-squeeze'].hardness).toBeGreaterThan(0.7);
  });
});
