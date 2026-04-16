import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';

describe('/api/v1/x-events', () => {
  const serverPromise = buildServer();

  beforeAll(async () => {
    await serverPromise;
  });

  afterAll(async () => {
    const server = await serverPromise;
    await server.close();
  });

  it('processes tweets into normalized event payloads', async () => {
    const server = await serverPromise;
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/x-events',
      payload: [
        {
          id: 'route-001',
          text: 'SEC approves BTC ETF listing update',
          userName: 'DeItaone',
          sourceTier: 'journalist',
          createdAt: '2024-01-10T14:00:00Z',
        },
      ],
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      processed: 1,
      events: [
        expect.objectContaining({
          asset: 'BTC',
          event_type: expect.any(String),
          headline: expect.any(String),
        }),
      ],
    });
  });
});
