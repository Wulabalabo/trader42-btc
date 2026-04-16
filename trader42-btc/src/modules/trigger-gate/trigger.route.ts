import type { FastifyInstance } from 'fastify';
import { evaluateTriggerGate } from './trigger.service.js';
import type { TriggerInput } from './trigger.types.js';

export async function registerTriggerRoutes(server: FastifyInstance) {
  server.post<{ Body: TriggerInput }>('/api/v1/trigger-gate', async (request) => {
    return evaluateTriggerGate(request.body);
  });

  server.get('/api/v1/trigger-gate', async () => {
    return { message: 'Use POST with trigger input data, or wait for real-time WS evaluation' };
  });
}
