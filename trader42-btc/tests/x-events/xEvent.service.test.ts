import { describe, expect, it, beforeEach } from 'vitest';
import { processRawTweet, resetDedup } from '../../src/modules/x-events/xEvent.service.js';

describe('processRawTweet', () => {
  beforeEach(() => {
    resetDedup();
  });

  it('processes a valid SEC tweet into XEventOutput', async () => {
    const result = await processRawTweet({
      id: 'tw-001',
      text: 'SEC files official amendment to BTC spot ETF rule change',
      userName: 'SECGov',
      sourceTier: 'official',
      createdAt: '2024-01-10T14:00:00Z',
      isRetweet: false,
      isQuote: false,
    });
    expect(result).not.toBeNull();
    expect(result!.event_type).toBe('regulation');
    expect(result!.asset).toBe('BTC');
    expect(result!.first_order_event).toBe(true);
  });

  it('returns null for duplicate tweets', async () => {
    const tweet = {
      id: 'tw-002',
      text: 'FOMC cuts rate by 50bp in surprise move',
      userName: 'NickTimiraos',
      sourceTier: 'journalist',
      createdAt: '2024-01-10T14:00:00Z',
      isRetweet: false,
      isQuote: false,
    };
    const first = await processRawTweet(tweet);
    expect(first).not.toBeNull();

    const second = await processRawTweet(tweet);
    expect(second).toBeNull();
  });

  it('returns null for too-short cleaned text', async () => {
    const result = await processRawTweet({
      id: 'tw-003',
      text: '🚨🔥 https://t.co/abc',
      userName: 'someone',
      sourceTier: 'kol',
      createdAt: '2024-01-10T14:00:00Z',
      isRetweet: false,
      isQuote: false,
    });
    expect(result).toBeNull();
  });

  it('marks retweets as non-first-order', async () => {
    const result = await processRawTweet({
      id: 'tw-004',
      text: 'RT @DeItaone: Breaking news on crypto regulation from SEC',
      userName: 'SomeUser',
      sourceTier: 'journalist',
      createdAt: '2024-01-10T14:00:00Z',
      isRetweet: false,
      isQuote: false,
    });
    expect(result).not.toBeNull();
    expect(result!.first_order_event).toBe(false);
  });

  it('detects stale screenshots', async () => {
    const result = await processRawTweet({
      id: 'tw-005',
      text: 'Look at this screenshot from Jan 2024 showing BTC price action',
      userName: 'SomeAnalyst',
      sourceTier: 'analyst',
      createdAt: '2024-06-15T10:00:00Z',
      isRetweet: false,
      isQuote: false,
    });
    expect(result).not.toBeNull();
    expect(result!.novelty).toBe('stale-screenshot');
  });
});
