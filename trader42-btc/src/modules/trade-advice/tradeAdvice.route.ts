import type { FastifyInstance } from 'fastify';
import { buildTradeAdviceResponse } from './tradeAdvice.service.js';
import type { PipelineInput } from './tradeAdvice.service.js';

export async function registerTradeAdviceRoutes(server: FastifyInstance) {
  server.post<{ Body: PipelineInput }>('/api/v1/trade-advice', async (request) => {
    return buildTradeAdviceResponse(request.body);
  });
}
