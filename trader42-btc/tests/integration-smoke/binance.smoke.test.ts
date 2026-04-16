import { describe, expect, it } from 'vitest';
import { BinanceSpotClient } from '../../src/integrations/binance/spotClient.js';
import { BinanceFuturesClient } from '../../src/integrations/binance/futuresClient.js';

describe('Binance smoke tests', { tags: ['smoke'] }, () => {
  const spot = new BinanceSpotClient('https://api.binance.com');
  const futures = new BinanceFuturesClient('https://fapi.binance.com');

  it('fetches BTC spot ticker', async () => {
    const ticker = await spot.getTicker('BTCUSDT');
    expect(ticker).toHaveProperty('price');
    expect(Number(ticker.price)).toBeGreaterThan(0);
  });

  it('fetches BTC 24h stats', async () => {
    const stats = await spot.get24hStats('BTCUSDT');
    expect(stats).toHaveProperty('volume');
    expect(Number(stats.volume)).toBeGreaterThan(0);
  });

  it('fetches BTC funding rate', async () => {
    const funding = await futures.getFundingRate('BTCUSDT');
    expect(funding).toHaveProperty('fundingRate');
  });

  it('fetches BTC open interest', async () => {
    const oi = await futures.getOpenInterest('BTCUSDT');
    expect(Number(oi.openInterest)).toBeGreaterThan(0);
  });

  it('fetches BTC premium index', async () => {
    const idx = await futures.getPremiumIndex('BTCUSDT');
    expect(Number(idx.markPrice)).toBeGreaterThan(0);
  });
});
