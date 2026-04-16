import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTradeAdviceResponse } from '../../src/modules/trade-advice/tradeAdvice.service.js';

describe('product contract coverage', () => {
  it('contains replay fixtures for all required historical scenarios', () => {
    const files = [
      '2024-01-btc-etf-approval.json',
      '2025-03-fomc-dovish.json',
      '2024-08-carry-trade-unwind.json',
      '2025-06-exchange-hack.json',
      '2026-02-narrative-only-fakeout.json',
    ];

    for (const file of files) {
      expect(() =>
        readFileSync(resolve(import.meta.dirname, `../fixtures/scenarios/${file}`), 'utf8'),
      ).not.toThrow();
    }
  });

  it('keeps replay fixtures on the expected schema skeleton', () => {
    const files = [
      '2024-01-btc-etf-approval.json',
      '2025-03-fomc-dovish.json',
      '2024-08-carry-trade-unwind.json',
      '2025-06-exchange-hack.json',
      '2026-02-narrative-only-fakeout.json',
    ];

    for (const file of files) {
      const fixture = JSON.parse(
        readFileSync(resolve(import.meta.dirname, `../fixtures/scenarios/${file}`), 'utf8'),
      ) as Record<string, unknown>;

      expect(fixture).toHaveProperty('name');
      expect(fixture).toHaveProperty('marketSnapshot');
      expect(fixture).toHaveProperty('replay');
      expect(fixture).toHaveProperty('expectedRegime');
      expect(fixture).toHaveProperty('expectedTopDriver');
      expect(fixture).toHaveProperty('expectedTradeAdvice');
      expect((fixture.replay as Record<string, unknown>)).toHaveProperty('triggerInput');
      expect((fixture.replay as Record<string, unknown>)).toHaveProperty('xEvents');
      expect((fixture.replay as Record<string, unknown>)).toHaveProperty('narrativeInput');
      expect((fixture.replay as Record<string, unknown>)).toHaveProperty('confirmationInput');
      expect((fixture.replay as Record<string, unknown>)).toHaveProperty('referencePrice');
    }
  });

  it('exposes Step 5 product fields on trade advice output', () => {
    const advice = buildTradeAdviceResponse({
      regime: { market_regime: 'flow-led', risk_environment: 'risk-on' },
      driverPool: {
        candidate_btc_drivers: [
          {
            driver: 'etf-flow',
            thesis: 'ETF demand supports BTC.',
            driver_type: 'flow',
            relevance: 0.8,
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
        continuation_probability: 0.7,
        entry_quality: 0.75,
      },
      xEvents: [{ btc_bias: 'bullish' }],
      referencePrice: 95000,
    }).advice;

    expect(advice).toHaveProperty('timestamp');
    expect(advice).toHaveProperty('asset');
    expect(advice).toHaveProperty('market_regime');
    expect(advice).toHaveProperty('driver');
    expect(advice).toHaveProperty('direction');
    expect(advice).toHaveProperty('theme_probability');
    expect(advice).toHaveProperty('continuation_probability');
    expect(advice).toHaveProperty('crowding_probability');
    expect(advice).toHaveProperty('tradeability');
    expect(advice).toHaveProperty('risk_budget');
    expect(advice).toHaveProperty('confirmation_mode');
    expect(advice).toHaveProperty('invalidators');
    expect(advice).toHaveProperty('reasoning');
    expect(advice).toHaveProperty('execution_note');
    expect(advice).toHaveProperty('review_required');
  });
});
