import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';

describe('/api/v1/narrative', () => {
  const serverPromise = buildServer();

  beforeAll(async () => {
    await serverPromise;
  });

  afterAll(async () => {
    const server = await serverPromise;
    await server.close();
  });

  it('returns the Step 3 contract shape', async () => {
    const server = await serverPromise;
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/narrative',
      payload: {
        events: [
          {
            id: 'evt-1',
            headline: 'IBIT sees record inflow as ETF demand surges',
            event_type: 'ETF',
            source_tier: 'journalist',
            first_order_event: true,
          },
          {
            id: 'evt-2',
            headline: 'BlackRock ETF inflow hits new high this week',
            event_type: 'ETF',
            source_tier: 'analyst',
            first_order_event: true,
          },
        ],
        firstEventMinutesAgo: 30,
        latestEventMinutesAgo: 5,
        totalUniqueAccounts: 6,
        positioningConfirmation: 0.5,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        asset: 'BTC',
        theme: expect.any(String),
        theme_probability: expect.any(Number),
        narrative_stage: expect.any(String),
        spread_strength: expect.any(Number),
        first_order_presence: expect.any(Boolean),
        actionability_ceiling: expect.any(String),
      }),
    );
  });
});
