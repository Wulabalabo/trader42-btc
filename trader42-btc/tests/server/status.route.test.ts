import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';

describe('/api/v1/status', () => {
  const serverPromise = buildServer({
    stepSnapshotRepository: {
      listLatest() {
        return [
          {
            stepKey: 'marketRegime',
            moduleState: 'healthy',
            lastUpdatedAt: '2026-04-17T00:59:30.000Z',
            payloadJson: null,
          },
          {
            stepKey: 'xEvents',
            moduleState: 'healthy',
            lastUpdatedAt: '2026-04-16T23:00:00.000Z',
            payloadJson: null,
          },
        ];
      },
    } as never,
    now: () => new Date('2026-04-17T01:00:00.000Z'),
  });

  beforeAll(async () => {
    await serverPromise;
  });

  afterAll(async () => {
    const server = await serverPromise;
    await server.close();
  });

  it('marks stale modules degraded and includes freshness metadata', async () => {
    const server = await serverPromise;
    const response = await server.inject({ method: 'GET', url: '/api/v1/status' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.pipeline.modules.marketRegime.state).toBe('healthy');
    expect(body.pipeline.modules.marketRegime.freshnessSec).toBe(30);
    expect(body.pipeline.modules.xEvents.state).toBe('degraded');
    expect(body.pipeline.modules.xEvents.reason).toContain('stale');
    expect(body.pipeline.overall).toBe('degraded');
  });
});
