import type { FastifyInstance } from 'fastify';
import { processRawTweet } from './xEvent.service.js';
import type { XEventOutput } from './xEvent.types.js';
import { XEventRepository } from './xEvent.repository.js';

const defaultXEventRepository = new XEventRepository();

export async function registerXEventRoutes(server: FastifyInstance) {
  // POST: Submit raw tweet(s) for processing
  server.post<{
    Body: {
      id: string;
      text: string;
      userName: string;
      sourceTier: string;
      createdAt: string;
      isRetweet?: boolean;
      isQuote?: boolean;
      quotedText?: string;
    }[];
  }>('/api/v1/x-events', async (request) => {
    const tweets = Array.isArray(request.body) ? request.body : [request.body];
    const results: XEventOutput[] = [];

    for (const tweet of tweets) {
      const event = await processRawTweet(
        {
          ...tweet,
          isRetweet: tweet.isRetweet ?? false,
          isQuote: tweet.isQuote ?? false,
        },
        { repository: defaultXEventRepository },
      );
      if (event) results.push(event);
    }

    return { processed: tweets.length, events: results };
  });
}
