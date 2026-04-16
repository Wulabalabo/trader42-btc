import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';

describe('/api/v1/driver-pool', () => {
  const serverPromise = buildServer();

  beforeAll(async () => {
    await serverPromise;
  });

  afterAll(async () => {
    const server = await serverPromise;
    await server.close();
  });

  it('returns candidate_btc_drivers in product contract shape', async () => {
    const server = await serverPromise;
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/driver-pool',
      payload: {
        marketRegime: 'flow-led',
        etfNetFlowUsd: 220_000_000,
        oiChangePct: 1.2,
        fundingRate: 0.004,
        liquidationIntensity: 0.1,
        upcomingMacroEvents: [],
        previousDriverKeys: ['etf-flow'],
        topN: 3,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      candidate_btc_drivers: expect.any(Array),
    });
    expect(response.json().candidate_btc_drivers[0]).toEqual(
      expect.objectContaining({
        driver: expect.any(String),
        thesis: expect.any(String),
        driver_type: expect.any(String),
        relevance: expect.any(Number),
        hardness: expect.any(Number),
        historical_hit_rate: expect.any(Number),
        status: expect.any(String),
        watch_signals: expect.any(Array),
      }),
    );
  });
});
