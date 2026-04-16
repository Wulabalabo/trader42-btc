import { describe, expect, it } from 'vitest';
import { cleanRawTweet } from '../../src/modules/x-events/xEvent.cleaner.js';

describe('cleanRawTweet', () => {
  it('strips t.co URLs from text', () => {
    const result = cleanRawTweet({
      text: 'Breaking: SEC approves BTC ETF https://t.co/abc123',
      isRetweet: false,
      isQuote: false,
    });
    expect(result.cleanedText).toBe('Breaking: SEC approves BTC ETF');
  });

  it('strips emoji prefixes', () => {
    const result = cleanRawTweet({
      text: '🚨🔥 Fed cuts rate by 50bp',
      isRetweet: false,
      isQuote: false,
    });
    expect(result.cleanedText).toBe('Fed cuts rate by 50bp');
  });

  it('marks retweets as retelling', () => {
    const result = cleanRawTweet({
      text: 'RT @DeItaone: Breaking: CPI comes in lower than expected',
      isRetweet: false,
      isQuote: false,
    });
    expect(result.isRetelling).toBe(true);
    expect(result.firstOrderCandidate).toBe(false);
  });

  it('marks isRetweet flag as retelling', () => {
    const result = cleanRawTweet({
      text: 'Some content',
      isRetweet: true,
      isQuote: false,
    });
    expect(result.isRetelling).toBe(true);
    expect(result.firstOrderCandidate).toBe(false);
  });

  it('detects duplicate quote tweets', () => {
    const result = cleanRawTweet({
      text: 'Same as quoted',
      isRetweet: false,
      isQuote: true,
      quotedText: 'Same as quoted',
    });
    expect(result.isDuplicate).toBe(true);
    expect(result.firstOrderCandidate).toBe(false);
  });

  it('detects possible stale screenshots', () => {
    const result = cleanRawTweet({
      text: 'Look at this screenshot from Jan 2024 showing BTC data',
      isRetweet: false,
      isQuote: false,
    });
    expect(result.possibleStaleScreenshot).toBe(true);
  });

  it('returns firstOrderCandidate true for original tweets', () => {
    const result = cleanRawTweet({
      text: 'FOMC decision: rates unchanged at 5.25-5.50%',
      isRetweet: false,
      isQuote: false,
    });
    expect(result.firstOrderCandidate).toBe(true);
    expect(result.isRetelling).toBe(false);
    expect(result.isDuplicate).toBe(false);
  });
});
