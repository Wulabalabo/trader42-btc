import type { FastifyInstance } from 'fastify';
import { buildRegimeResponse } from './regime.service.js';
import type { MarketSnapshotInput } from './regime.types.js';

export async function registerRegimeRoutes(server: FastifyInstance) {
  // On-demand regime classification from provided snapshot data
  server.post<{ Body: MarketSnapshotInput }>('/api/v1/market-regime', async (request) => {
    const snapshot = request.body;
    return buildRegimeResponse(snapshot);
  });

  // GET endpoint for latest regime (would use DB in full impl)
  server.get('/api/v1/market-regime', async () => {
    // Placeholder: in full impl, fetch latest from DB
    return { message: 'Use POST with market snapshot data, or wait for scheduled refresh' };
  });
}
