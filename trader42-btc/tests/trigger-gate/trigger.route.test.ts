import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';

describe('/api/v1/trigger-gate', () => {
  const serverPromise = buildServer();

  beforeAll(async () => {
    await serverPromise;
  });

  afterAll(async () => {
    const server = await serverPromise;
    await server.close();
  });

  it('returns the latest trigger snapshot from GET after a POST evaluation', async () => {
    const server = await serverPromise;
    const payload = {
      return1m: 0.012,
      priceZScore: 2.5,
      volumeZScore: 2,
      oiChangePct: 3,
      fundingRate: 0.01,
      fundingMean: 0.005,
      basisPct: 0.5,
      basisMean: 0.2,
      liquidationUsd1h: 30_000_000,
      liquidationMean: 8_000_000,
      xResonance: 0.3,
    };

    const postResponse = await server.inject({
      method: 'POST',
      url: '/api/v1/trigger-gate',
      payload,
    });
    expect(postResponse.statusCode).toBe(200);

    const getResponse = await server.inject({
      method: 'GET',
      url: '/api/v1/trigger-gate',
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toMatchObject({
      asset: 'BTC',
      triggered: expect.any(Boolean),
      case_label: expect.any(String),
    });
  });
});
