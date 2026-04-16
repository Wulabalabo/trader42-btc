import { describe, expect, it } from 'vitest';
import { AKToolsETFFlowClient } from '../../src/integrations/aktools/etfFlowClient.js';
import { AKToolsStablecoinClient } from '../../src/integrations/aktools/stablecoinClient.js';

describe('AKTools smoke tests', { tags: ['smoke'] }, () => {
  const baseUrl = process.env.AKTOOLS_BASE_URL ?? 'http://localhost:8002';
  const etf = new AKToolsETFFlowClient(baseUrl);
  const stablecoin = new AKToolsStablecoinClient(baseUrl);

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
