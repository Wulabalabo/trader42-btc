import { describe, expect, it } from 'vitest';
import { AKToolsETFFlowClient } from '../../src/integrations/aktools/etfFlowClient.js';
import { AKToolsStablecoinClient } from '../../src/integrations/aktools/stablecoinClient.js';

describe('AKTools smoke tests', { tags: ['smoke'] }, () => {
  const proxyUrl = process.env.DATA_PROXY_URL ?? 'http://localhost:8088';
  const proxyToken = process.env.DATA_PROXY_TOKEN ?? 'test-token';
  const etf = new AKToolsETFFlowClient(proxyUrl, proxyToken);
  const stablecoin = new AKToolsStablecoinClient(proxyUrl, proxyToken);

  it('fetches BTC ETF net flow', async () => {
    const flow = await etf.getBtcEtfNetFlow();
    expect(flow).toHaveProperty('netFlowUsd');
    expect(typeof flow.netFlowUsd).toBe('number');
  });

  it('fetches stablecoin net flow', async () => {
    const flow = await stablecoin.getStablecoinNetFlow();
    expect(flow).toHaveProperty('netFlow');
    expect(typeof flow.netFlow).toBe('number');
  });
});
