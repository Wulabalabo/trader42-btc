import { describe, expect, it } from 'vitest';
import { buildRegimeResponse } from '../../src/modules/market-regime/regime.service.js';

describe('buildRegimeResponse', () => {
  it('returns complete Step 0 JSON shape with all required fields', async () => {
    const result = await buildRegimeResponse({
      dxyChange: 0.3,
      nqChangePct: -0.5,
      etfNetFlowUsd: 80_000_000,
      oiChangePct: 1.5,
      fundingRate: 0.005,
      liquidationIntensity: 0.2,
      volumeChangePct: 25,
    });
    expect(result.asset).toBe('BTC');
    expect(result).toHaveProperty('market_regime');
    expect(result).toHaveProperty('primary_drivers');
    expect(result).toHaveProperty('secondary_drivers');
    expect(result).toHaveProperty('risk_environment');
    expect(result).toHaveProperty('btc_state');
    expect(result).toHaveProperty('regime_shift_probability');
    expect(result).toHaveProperty('confidence');
    expect([
      'macro-led',
      'flow-led',
      'positioning-led',
      'event-led',
      'narrative-led',
      'mixed',
    ]).toContain(result.market_regime);
  });

  it('detects risk-on when NQ up, DXY down, ETF inflow', async () => {
    const result = await buildRegimeResponse({
      dxyChange: -0.5,
      nqChangePct: 1.5,
      etfNetFlowUsd: 200_000_000,
      oiChangePct: 3,
      fundingRate: 0.005,
      liquidationIntensity: 0.1,
      volumeChangePct: 50,
    });
    expect(result.risk_environment).toBe('risk-on');
  });

  it('detects fragile state during high liquidation intensity', async () => {
    const result = await buildRegimeResponse({
      dxyChange: 0.5,
      nqChangePct: -1,
      etfNetFlowUsd: -100_000_000,
      oiChangePct: -10,
      fundingRate: -0.02,
      liquidationIntensity: 0.8,
      volumeChangePct: 200,
    });
    expect(result.btc_state).toBe('fragile');
  });

  it('matches ETF approval scenario expectations', async () => {
    const etfApproval = await import('../fixtures/scenarios/2024-01-btc-etf-approval.json');
    const result = await buildRegimeResponse(etfApproval.default.marketSnapshot);
    expect(result.market_regime).toBe('flow-led');
    expect(result.primary_drivers).toContain('flow');
  });
});
