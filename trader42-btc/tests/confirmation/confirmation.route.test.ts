import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';

describe('/api/v1/confirmation', () => {
  const serverPromise = buildServer();

  beforeAll(async () => {
    await serverPromise;
  });

  afterAll(async () => {
    const server = await serverPromise;
    await server.close();
  });

  it('returns the Step 4 contract shape', async () => {
    const server = await serverPromise;
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/confirmation',
      payload: {
        priceChange5m: 0.012,
        priceChange1h: 0.025,
        volumeChange: 1.5,
        etfNetFlowUsd: 200_000_000,
        oiChangePct: 3,
        fundingRate: 0.005,
        basisPct: 0.3,
        liquidationIntensity: 0.1,
        spotVsPerp: 0.8,
        narrativeCeiling: 'standard',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        asset: 'BTC',
        confirmation_mode: expect.any(String),
        spot_confirmation: expect.any(Number),
        perp_confirmation: expect.any(Number),
        ETF_confirmation: expect.any(Number),
        tradeability: expect.any(String),
      }),
    );
  });
});
