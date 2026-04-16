import { describe, expect, it } from 'vitest';
import { serializeTradeAdvice } from '../../src/modules/trade-advice/tradeAdvice.types.js';

describe('serializeTradeAdvice', () => {
  it('returns the full Step 5 contract with all required fields', () => {
    const result = serializeTradeAdvice();
    expect(result.asset).toBe('BTC');
    expect(result).toHaveProperty('market_regime');
    expect(result).toHaveProperty('direction');
    expect(result).toHaveProperty('trade_level');
    expect(result).toHaveProperty('risk_budget_pct');
    expect(result).toHaveProperty('confirmation_mode');
    expect(result).toHaveProperty('invalidators');
    expect(result).toHaveProperty('reasoning');
    expect(result).toHaveProperty('review_required');
    expect(['ignore', 'watch', 'light', 'standard', 'avoid']).toContain(result.trade_level);
  });

  it('always marks review_required true for standard trades', () => {
    const result = serializeTradeAdvice({ trade_level: 'standard' });
    expect(result.review_required).toBe(true);
  });
});
