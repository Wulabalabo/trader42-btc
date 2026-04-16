import { describe, expect, it } from 'vitest';
import { buildRegimeFeatures } from '../../src/modules/market-regime/regime.featureBuilder.js';
import etfApproval from '../fixtures/scenarios/2024-01-btc-etf-approval.json';

describe('buildRegimeFeatures', () => {
  it('detects strong flow pressure during ETF approval scenario', () => {
    const result = buildRegimeFeatures(etfApproval.marketSnapshot);
    expect(result.flowPressure).toBeGreaterThan(0.7);
    expect(result.macroPressure).toBeLessThan(result.flowPressure);
  });

  it('detects macro pressure when DXY surges and equities drop', () => {
    const result = buildRegimeFeatures({
      dxyChange: 1.2,
      nqChangePct: -2.1,
      etfNetFlowUsd: 0,
      oiChangePct: 0.5,
      fundingRate: 0.001,
      liquidationIntensity: 0.1,
      volumeChangePct: 15,
    });
    expect(result.macroPressure).toBeGreaterThan(0.5);
  });

  it('returns all four pressure dimensions', () => {
    const result = buildRegimeFeatures({
      dxyChange: 0,
      nqChangePct: 0,
      etfNetFlowUsd: 0,
      oiChangePct: 0,
      fundingRate: 0,
      liquidationIntensity: 0,
      volumeChangePct: 0,
    });
    expect(result).toHaveProperty('macroPressure');
    expect(result).toHaveProperty('flowPressure');
    expect(result).toHaveProperty('positioningPressure');
    expect(result).toHaveProperty('eventPressure');
  });
});
