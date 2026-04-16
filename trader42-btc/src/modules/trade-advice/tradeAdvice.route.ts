import type { FastifyInstance } from 'fastify';
import { TradeAdviceRepository } from './tradeAdvice.repository.js';
import { buildTradeAdviceResponse } from './tradeAdvice.service.js';
import type { PipelineInput } from './tradeAdvice.service.js';
import { defaultShadowBookRepository } from '../shadow-book/shadowBook.route.js';

const defaultTradeAdviceRepository = new TradeAdviceRepository();

export async function registerTradeAdviceRoutes(server: FastifyInstance) {
  server.post<{ Body: PipelineInput }>('/api/v1/trade-advice', async (request) => {
    const result = buildTradeAdviceResponse(request.body, {
      tradeAdviceRepository: defaultTradeAdviceRepository,
      shadowBookRepository: defaultShadowBookRepository,
    });

    return result.advice;
  });
}
