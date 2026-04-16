import { describe, expect, it } from 'vitest';
import { decideTradeAdvice } from '../../src/modules/trade-advice/tradeAdvice.policy.js';

describe('decideTradeAdvice', () => {
  it('standard: narrative=standard + confirmation=actionable + low heat', () => {
    const result = decideTradeAdvice({
      regime: 'risk-on',
      narrativeCeiling: 'standard',
      confirmationTradeability: 'actionable',
      confirmationMode: 'breakout',
      positioningHeat: 0.2,
      themeProbability: 0.7,
      continuationProbability: 0.6,
    });
    expect(result.trade_level).toBe('standard');
    expect(result.risk_budget_pct).toBeGreaterThan(0);
    expect(result.direction).not.toBe('observe');
  });

  it('caps at watch when narrative ceiling is watch regardless of confirmation', () => {
    const result = decideTradeAdvice({
      regime: 'risk-on',
      narrativeCeiling: 'watch',
      confirmationTradeability: 'actionable',
      confirmationMode: 'breakout',
      positioningHeat: 0.2,
      themeProbability: 0.7,
      continuationProbability: 0.6,
    });
    expect(result.trade_level).toBe('watch');
    expect(result.risk_budget_pct).toBe(0);
  });

  it('light: narrative=light + confirmation=actionable + moderate heat', () => {
    const result = decideTradeAdvice({
      regime: 'risk-on',
      narrativeCeiling: 'light',
      confirmationTradeability: 'actionable',
      confirmationMode: 'followthrough',
      positioningHeat: 0.4,
      themeProbability: 0.55,
      continuationProbability: 0.5,
    });
    expect(result.trade_level).toBe('light');
    expect(result.risk_budget_pct).toBeLessThanOrEqual(0.5);
  });

  it('avoid: extreme positioning heat forces avoid', () => {
    const result = decideTradeAdvice({
      regime: 'risk-on',
      narrativeCeiling: 'standard',
      confirmationTradeability: 'actionable',
      confirmationMode: 'squeeze',
      positioningHeat: 0.9,
      themeProbability: 0.7,
      continuationProbability: 0.5,
    });
    expect(result.trade_level).toBe('avoid');
    expect(result.risk_budget_pct).toBe(0);
  });

  it('ignore: no confirmation', () => {
    const result = decideTradeAdvice({
      regime: 'mixed',
      narrativeCeiling: 'watch',
      confirmationTradeability: 'ignore',
      confirmationMode: 'none',
      positioningHeat: 0.1,
      themeProbability: 0.3,
      continuationProbability: 0.2,
    });
    expect(result.trade_level).toBe('ignore');
  });

  it('downgrades on regime misalignment', () => {
    const standard = decideTradeAdvice({
      regime: 'risk-on',
      narrativeCeiling: 'standard',
      confirmationTradeability: 'actionable',
      confirmationMode: 'breakout',
      positioningHeat: 0.2,
      themeProbability: 0.7,
      continuationProbability: 0.6,
    });
    const misaligned = decideTradeAdvice({
      regime: 'risk-off',
      narrativeCeiling: 'standard',
      confirmationTradeability: 'actionable',
      confirmationMode: 'breakout',
      positioningHeat: 0.2,
      themeProbability: 0.7,
      continuationProbability: 0.6,
    });
    expect(misaligned.risk_budget_pct).toBeLessThan(standard.risk_budget_pct);
  });
});
