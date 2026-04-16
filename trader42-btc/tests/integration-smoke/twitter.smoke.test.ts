import { describe, expect, it } from 'vitest';
import { TwitterApiIoClient } from '../../src/integrations/twitter/twitterApiIoClient.js';

describe('Twitter smoke tests', { tags: ['smoke'] }, () => {
  const apiKey = process.env.TWITTER_API_KEY ?? '';
  const client = new TwitterApiIoClient(apiKey);

  it('searches BTC-related tweets', async () => {
    const result = await client.searchTweets('BTC OR Bitcoin', { count: 5 });
    expect(Array.isArray(result)).toBe(true);
  });

  it('fetches tweets from a known account', async () => {
    const result = await client.getUserLastTweets('BitcoinMagazine', 5);
    expect(Array.isArray(result)).toBe(true);
  });
});
