import type { FastifyInstance } from 'fastify';
import { evaluateTriggerGate } from './trigger.service.js';
import type { TriggerInput } from './trigger.types.js';
import { TriggerRepository } from './trigger.repository.js';
import { TriggerRuntime } from './trigger.runtime.js';

const defaultTriggerRepository = new TriggerRepository();
export const defaultTriggerRuntime = new TriggerRuntime(defaultTriggerRepository);

export async function registerTriggerRoutes(server: FastifyInstance) {
  server.post<{ Body: TriggerInput }>('/api/v1/trigger-gate', async (request) => {
    const result = evaluateTriggerGate(request.body);
    defaultTriggerRepository.save(result);
    return result;
  });

  server.get('/api/v1/trigger-gate', async () => {
    return defaultTriggerRuntime.getLatest() ?? defaultTriggerRepository.getLatest() ?? { message: 'No trigger snapshot yet' };
  });
}
