import type { Direction } from '../trade-advice/tradeAdvice.types.js';

export type TradeOutcome = 'win' | 'flat' | 'lose' | 'invalidated';
export type FailureTag = 'false-positive' | 'late-entry' | 'squeeze-only' | 'crowded' | 'wrong-driver' | 'good-call';

export interface ShadowTrade {
  shadow_trade_id: string;
  trade_advice_id: string;
  asset: 'BTC';
  direction: Direction;
  entry_time: string;
  entry_price: number;
  stop_price: number;
  target_price: number;
  time_horizon: '30m' | '2h' | 'eod';
  expected_path: string;
  actual_path: string;
  outcome: TradeOutcome;
  failure_tag: FailureTag;
}

export interface CreateShadowTradeInput {
  tradeAdviceId: string;
  direction: Direction;
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  timeHorizon: ShadowTrade['time_horizon'];
  expectedPath: string;
}
