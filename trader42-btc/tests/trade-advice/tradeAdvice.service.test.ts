import { describe, expect, it } from 'vitest';
import { buildTradeAdviceResponse } from '../../src/modules/trade-advice/tradeAdvice.service.js';

describe('buildTradeAdviceResponse', () => {
  it('assembles the full Step 5 payload from upstream step outputs', () => {
    const result = buildTradeAdviceResponse({
      regime: { market_regime: 'flow-led', risk_environment: 'risk-on' },
      driverPool: {
        candidate_btc_drivers: [
          {
            driver: 'etf-flow',
            thesis: 'ETF inflow is supporting spot demand.',
            driver_type: 'flow',
            relevance: 0.7,
            hardness: 0.8,
            historical_hit_rate: 0.74,
            status: 'continuing',
            watch_signals: ['ETF net flow'],
          },
        ],
      },
      trigger: { triggered: true },
      narrative: {
        narrative_stage: 'spreading',
        actionability_ceiling: 'standard',
        theme_probability: 0.7,
        crowding_probability: 0.1,
      },
      confirmation: {
        confirmation_mode: 'breakout',
        tradeability: 'actionable',
        direction_bias: 'long',
        positioning_heat: 0.25,
        continuation_probability: 0.6,
        entry_quality: 0.7,
      },
      xEvents: [{ btc_bias: 'bullish' }],
      referencePrice: 95000,
    });
    expect(result.advice.asset).toBe('BTC');
    expect(result.advice.tradeability).toBe('standard');
    expect(result.advice.direction).toBe('long');
    expect(result.advice.risk_budget).toBeGreaterThan(0);
    expect(result.advice.review_required).toBe(true);
    expect(result.advice.invalidators.length).toBeGreaterThan(0);
    expect(result.shadowTrade?.asset).toBe('BTC');
  });

  it('returns observe/ignore when trigger not fired', () => {
    const result = buildTradeAdviceResponse({
      regime: { market_regime: 'flow-led', risk_environment: 'risk-on' },
      driverPool: {
        candidate_btc_drivers: [
          {
            driver: 'etf-flow',
            thesis: 'ETF inflow is supporting spot demand.',
            driver_type: 'flow',
            relevance: 0.5,
            hardness: 0.6,
            historical_hit_rate: 0.74,
            status: 'new',
            watch_signals: ['ETF net flow'],
          },
        ],
      },
      trigger: { triggered: false },
      narrative: {
        narrative_stage: 'seed',
        actionability_ceiling: 'watch',
        theme_probability: 0.3,
        crowding_probability: 0.1,
      },
      confirmation: {
        confirmation_mode: 'none',
        tradeability: 'ignore',
        direction_bias: 'observe',
        positioning_heat: 0.1,
        continuation_probability: 0.2,
        entry_quality: 0.2,
      },
      referencePrice: 95000,
    });
    expect(result.advice.tradeability).toBe('ignore');
    expect(result.advice.direction).toBe('observe');
    expect(result.shadowTrade?.asset).toBe('BTC');
    expect(result.shadowTrade?.time_horizon).toBe('30m');
  });

  it('caps at light when narrative ceiling is light', () => {
    const result = buildTradeAdviceResponse({
      regime: { market_regime: 'macro-led', risk_environment: 'risk-on' },
      driverPool: {
        candidate_btc_drivers: [
          {
            driver: 'fed-rates',
            thesis: 'Macro easing is lifting BTC risk appetite.',
            driver_type: 'macro',
            relevance: 0.8,
            hardness: 0.7,
            historical_hit_rate: 0.62,
            status: 'continuing',
            watch_signals: ['FOMC timing'],
          },
        ],
      },
      trigger: { triggered: true },
      narrative: {
        narrative_stage: 'spreading',
        actionability_ceiling: 'light',
        theme_probability: 0.8,
        crowding_probability: 0.2,
      },
      confirmation: {
        confirmation_mode: 'followthrough',
        tradeability: 'actionable',
        direction_bias: 'long',
        positioning_heat: 0.3,
        continuation_probability: 0.6,
        entry_quality: 0.6,
      },
      xEvents: [{ btc_bias: 'bullish' }],
      referencePrice: 95000,
    });
    expect(result.advice.tradeability).toBe('light');
    expect(result.advice.direction).toBe('long');
    expect(result.shadowTrade?.asset).toBe('BTC');
    expect(result.shadowTrade?.time_horizon).toBe('2h');
  });

  it('supports short trade advice when bearish evidence dominates', () => {
    const result = buildTradeAdviceResponse({
      regime: { market_regime: 'event-led', risk_environment: 'risk-off' },
      driverPool: {
        candidate_btc_drivers: [
          {
            driver: 'regulation-event',
            thesis: 'Negative regulatory pressure is driving BTC lower.',
            driver_type: 'event',
            relevance: 0.82,
            hardness: 0.75,
            historical_hit_rate: 0.55,
            status: 'new',
            watch_signals: ['official filings'],
          },
        ],
      },
      trigger: { triggered: true },
      narrative: {
        narrative_stage: 'consensus',
        actionability_ceiling: 'standard',
        theme_probability: 0.82,
        crowding_probability: 0.18,
      },
      confirmation: {
        confirmation_mode: 'breakout',
        tradeability: 'actionable',
        direction_bias: 'short',
        positioning_heat: 0.2,
        continuation_probability: 0.62,
        entry_quality: 0.72,
      },
      xEvents: [{ btc_bias: 'bearish' }, { btc_bias: 'bearish' }],
      referencePrice: 95000,
    });

    expect(result.advice.tradeability).toBe('standard');
    expect(result.advice.direction).toBe('short');
    expect(result.shadowTrade?.expected_path).toContain('lower');
    expect(result.shadowTrade!.stop_price).toBeGreaterThan(result.shadowTrade!.entry_price);
    expect(result.advice.invalidators.some((item) => item.includes('decisively positive'))).toBe(true);
  });

  it('does not let x-event vote override a confirmed long bias', () => {
    const result = buildTradeAdviceResponse({
      regime: { market_regime: 'flow-led', risk_environment: 'risk-on' },
      driverPool: {
        candidate_btc_drivers: [
          {
            driver: 'etf-flow',
            thesis: 'ETF inflow is supporting BTC spot demand.',
            driver_type: 'flow',
            relevance: 0.85,
            hardness: 0.8,
            historical_hit_rate: 0.74,
            status: 'continuing',
            watch_signals: ['ETF net flow'],
          },
        ],
      },
      trigger: { triggered: true },
      narrative: {
        narrative_stage: 'consensus',
        actionability_ceiling: 'standard',
        theme_probability: 0.8,
        crowding_probability: 0.2,
      },
      confirmation: {
        confirmation_mode: 'breakout',
        tradeability: 'actionable',
        direction_bias: 'long',
        positioning_heat: 0.2,
        continuation_probability: 0.65,
        entry_quality: 0.75,
      },
      xEvents: [{ btc_bias: 'bearish' }, { btc_bias: 'bearish' }],
      referencePrice: 95000,
    });

    expect(result.advice.direction).toBe('long');
  });
});
