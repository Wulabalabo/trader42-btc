import { describe, expect, it } from 'vitest';
import { buildTradeAdviceResponse } from '../../src/modules/trade-advice/tradeAdvice.service.js';

describe('buildTradeAdviceResponse', () => {
  it('assembles the full Step 5 payload from Step 0-4 outputs', () => {
    const result = buildTradeAdviceResponse({
      regime: 'risk-on',
      topDriver: { name: 'etf-flow', direction: 'long', score: 0.7 },
      triggerFired: true,
      narrativeStage: 'spreading',
      narrativeCeiling: 'standard',
      confirmationMode: 'breakout',
      confirmationTradeability: 'actionable',
      positioningHeat: 0.25,
      continuationProbability: 0.6,
      entryQuality: 0.7,
    });
    expect(result.asset).toBe('BTC');
    expect(result.trade_level).toBe('standard');
    expect(result.direction).toBe('long');
    expect(result.risk_budget_pct).toBeGreaterThan(0);
    expect(result.review_required).toBe(true);
    expect(result.invalidators).toBeDefined();
    expect(result.invalidators.length).toBeGreaterThan(0);
  });

  it('returns observe/ignore when trigger not fired', () => {
    const result = buildTradeAdviceResponse({
      regime: 'risk-on',
      topDriver: { name: 'etf-flow', direction: 'long', score: 0.5 },
      triggerFired: false,
      narrativeStage: 'seed',
      narrativeCeiling: 'watch',
      confirmationMode: 'none',
      confirmationTradeability: 'ignore',
      positioningHeat: 0.1,
      continuationProbability: 0.2,
      entryQuality: 0.2,
    });
    expect(result.trade_level).toBe('ignore');
    expect(result.direction).toBe('observe');
  });

  it('caps at light when narrative ceiling is light', () => {
    const result = buildTradeAdviceResponse({
      regime: 'risk-on',
      topDriver: { name: 'macro-dovish', direction: 'long', score: 0.8 },
      triggerFired: true,
      narrativeStage: 'spreading',
      narrativeCeiling: 'light',
      confirmationMode: 'followthrough',
      confirmationTradeability: 'actionable',
      positioningHeat: 0.3,
      continuationProbability: 0.6,
      entryQuality: 0.6,
    });
    expect(result.trade_level).toBe('light');
    expect(result.direction).toBe('long');
  });
});
