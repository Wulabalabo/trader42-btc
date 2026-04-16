import type { FastifyInstance } from 'fastify';
import { ConfirmationRepository } from './confirmation.repository.js';
import { buildConfirmationResponse } from './confirmation.service.js';
import type { ConfirmationInput } from './confirmation.types.js';

const defaultConfirmationRepository = new ConfirmationRepository();

export async function registerConfirmationRoutes(server: FastifyInstance) {
  server.post<{ Body: ConfirmationInput }>('/api/v1/confirmation', async (request) => {
    return buildConfirmationResponse(request.body, defaultConfirmationRepository);
  });
}
