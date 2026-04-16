import type { CreateShadowTradeInput, ShadowTrade } from './shadowBook.types.js';

export function createShadowTrade(input: CreateShadowTradeInput): ShadowTrade {
  return {
    shadow_trade_id: crypto.randomUUID(),
    trade_advice_id: input.tradeAdviceId,
    asset: 'BTC',
    direction: input.direction,
    entry_time: new Date().toISOString(),
    entry_price: input.entryPrice,
    stop_price: input.stopPrice,
    target_price: input.targetPrice,
    time_horizon: input.timeHorizon,
    expected_path: input.expectedPath,
    actual_path: '',
    outcome: 'flat',
    failure_tag: 'good-call',
  };
}
