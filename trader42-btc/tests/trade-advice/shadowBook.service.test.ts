import { describe, expect, it } from 'vitest';
import { createShadowTrade } from '../../src/modules/shadow-book/shadowBook.service.js';

describe('createShadowTrade', () => {
  it('creates a linked BTC shadow trade for every actionable advice', () => {
    const trade = createShadowTrade({
      tradeAdviceId: 'adv-001',
      direction: 'long',
      entryPrice: 95000,
      stopPrice: 93000,
      targetPrice: 99000,
      timeHorizon: 'eod',
      expectedPath: 'BTC should continue higher after confirmation.',
    });

    expect(trade.trade_advice_id).toBe('adv-001');
    expect(trade.asset).toBe('BTC');
    expect(trade.shadow_trade_id).toBeTruthy();
    expect(trade.expected_path).toContain('higher');
  });
});
