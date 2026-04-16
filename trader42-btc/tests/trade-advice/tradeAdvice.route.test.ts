import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';

describe('/api/v1/trade-advice', () => {
  const serverPromise = buildServer();

  beforeAll(async () => {
    await serverPromise;
  });

  afterAll(async () => {
    const server = await serverPromise;
    await server.close();
  });

  it('returns product-shaped trade advice and persists a linked shadow trade', async () => {
    const server = await serverPromise;
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/trade-advice',
      payload: {
        regime: { market_regime: 'flow-led', risk_environment: 'risk-on' },
        driverPool: {
          candidate_btc_drivers: [
            {
              driver: 'etf-flow',
              thesis: 'ETF demand is driving BTC spot bids.',
              driver_type: 'flow',
              relevance: 0.9,
              hardness: 0.8,
              historical_hit_rate: 0.7,
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
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        asset: 'BTC',
        driver: 'etf-flow',
        tradeability: 'standard',
        risk_budget: expect.any(Number),
      }),
    );

    const shadowBookResponse = await server.inject({ method: 'GET', url: '/api/v1/shadow-book' });
    expect(shadowBookResponse.statusCode).toBe(200);
    expect(shadowBookResponse.json().trades[0]).toEqual(
      expect.objectContaining({
        asset: 'BTC',
        trade_advice_id: expect.any(String),
        shadow_trade_id: expect.any(String),
      }),
    );
  });
});
