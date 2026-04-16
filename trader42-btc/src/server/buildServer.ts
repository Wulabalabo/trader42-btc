import Fastify, { type FastifyInstance } from 'fastify';
import { registerRegimeRoutes } from '../modules/market-regime/regime.route.js';
import { registerTriggerRoutes } from '../modules/trigger-gate/trigger.route.js';
import { registerXEventRoutes } from '../modules/x-events/xEvent.route.js';
import { registerTradeAdviceRoutes } from '../modules/trade-advice/tradeAdvice.route.js';

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({ logger: true });

  server.get('/health', async () => ({ status: 'ok' }));

  server.get('/api/v1/status', async () => ({
    service: 'trader42-btc',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    modules: ['market-regime', 'trigger-gate', 'x-events', 'trade-advice'],
  }));

  await registerRegimeRoutes(server);
  await registerTriggerRoutes(server);
  await registerXEventRoutes(server);
  await registerTradeAdviceRoutes(server);

  return server;
}
