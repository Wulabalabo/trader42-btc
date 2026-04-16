import { describe, expect, it } from 'vitest';
import { OpenBBMacroClient } from '../../src/integrations/openbb/macroClient.js';

describe('OpenBB smoke tests', { tags: ['smoke'] }, () => {
  const proxyUrl = process.env.DATA_PROXY_URL ?? 'http://localhost:8088';
  const proxyToken = process.env.DATA_PROXY_TOKEN ?? 'test-token';
  const client = new OpenBBMacroClient(proxyUrl, proxyToken);

  it('fetches DXY latest value', async () => {
    const dxy = await client.getDXY();
    expect(dxy).toHaveProperty('value');
    expect(typeof dxy.value).toBe('number');
  });

  it('fetches US treasury yields', async () => {
    const yields = await client.getTreasuryYields();
    expect(yields).toHaveProperty('us2y');
    expect(yields).toHaveProperty('us10y');
  });

  it('fetches equity index (NQ)', async () => {
    const nq = await client.getEquityIndex('NQ=F');
    expect(nq).toHaveProperty('value');
    expect(typeof nq.value).toBe('number');
  });
});
