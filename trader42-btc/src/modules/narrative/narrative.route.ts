import type { FastifyInstance } from 'fastify';
import { NarrativeRepository } from './narrative.repository.js';
import { buildNarrativeResponse } from './narrative.service.js';
import type { NarrativeInput } from './narrative.types.js';

const defaultNarrativeRepository = new NarrativeRepository();

export async function registerNarrativeRoutes(server: FastifyInstance) {
  server.post<{ Body: NarrativeInput }>('/api/v1/narrative', async (request) => {
    return buildNarrativeResponse(request.body, defaultNarrativeRepository);
  });
}
