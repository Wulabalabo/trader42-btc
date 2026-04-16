import Fastify, { type FastifyInstance } from 'fastify';

export function buildServer(): FastifyInstance {
  const server = Fastify({ logger: true });

  server.get('/health', async () => ({ status: 'ok' }));

  server.get('/api/v1/status', async () => ({
    service: 'trader42-btc',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  return server;
}
