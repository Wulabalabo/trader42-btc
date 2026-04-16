import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../src/server/buildServer.js';
import { defaultShadowBookRepository } from '../../src/modules/shadow-book/shadowBook.route.js';

describe('/api/v1/shadow-book/weekly-audit', () => {
  it('persists a manual audit run and serves it back from GET', async () => {
    defaultShadowBookRepository.save({
      shadow_trade_id: 'shadow-1',
      trade_advice_id: 'advice-1',
      asset: 'BTC',
      direction: 'long',
      entry_time: '2026-04-10T00:00:00.000Z',
      entry_price: 95000,
      stop_price: 93000,
      target_price: 99000,
      time_horizon: 'eod',
      expected_path: 'higher',
      actual_path: 'target hit',
      outcome: 'win',
      failure_tag: 'good-call',
    });

    const persistedSnapshots: Array<{ stepKey: string; payloadJson: string | null; moduleState: 'healthy' | 'degraded' | 'idle'; lastUpdatedAt: string | null }> = [];
    const server = await buildServer({
      stepSnapshotRepository: {
        save(snapshot) {
          persistedSnapshots.push(snapshot);
        },
        listLatest() {
          return persistedSnapshots;
        },
      } as never,
    });

    try {
      const postResponse = await server.inject({ method: 'POST', url: '/api/v1/shadow-book/weekly-audit' });
      expect(postResponse.statusCode).toBe(200);
      expect(persistedSnapshots.some((item) => item.stepKey === 'weeklyAudit')).toBe(true);

      const getResponse = await server.inject({ method: 'GET', url: '/api/v1/shadow-book/weekly-audit' });
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.json().report.summary).toContain('threshold');
    } finally {
      await server.close();
    }
  });
});
