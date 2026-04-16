import type { FastifyInstance } from 'fastify';
import { ShadowBookRepository } from './shadowBook.repository.js';

export const defaultShadowBookRepository = new ShadowBookRepository();

export async function registerShadowBookRoutes(server: FastifyInstance) {
  server.get('/api/v1/shadow-book', async () => ({
    trades: defaultShadowBookRepository.listLatest(),
  }));
}
