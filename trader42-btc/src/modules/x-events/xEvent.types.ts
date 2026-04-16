export type EventType = 'macro' | 'ETF' | 'regulation' | 'treasury' | 'geopolitics' | 'exchange' | 'onchain' | 'positioning' | 'security' | 'unknown';
export type SourceTier = 'official' | 'journalist' | 'analyst' | 'kol';
export type BtcBias = 'bullish' | 'bearish' | 'mixed' | 'unclear';
export type Novelty = 'new' | 'update' | 'recycled' | 'stale-screenshot';

export interface XEventOutput {
  timestamp: string;
  asset: 'BTC';
  event_type: EventType;
  source_tier: SourceTier;
  source_credibility_score: number;
  headline: string;
  novelty: Novelty;
  first_order_event: boolean;
  btc_bias: BtcBias;
  urgency: number;
  confidence: number;
}
