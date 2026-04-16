import type { FastifyInstance } from 'fastify';
import { buildDriverPoolResponse } from './driver.service.js';
import type { DriverPoolInput } from './driver.types.js';
import type { DriverPoolRepository } from './driver.repository.js';

export async function registerDriverPoolRoutes(
  server: FastifyInstance,
  repository?: DriverPoolRepository,
) {
  server.post<{ Body: DriverPoolInput }>('/api/v1/driver-pool', async (request) => {
    return buildDriverPoolResponse(request.body, repository);
  });
}
