export type TriggerType = 'price_volume' | 'positioning' | 'ETF_flow' | 'x_resonance' | 'mixed';
export type CaseLabel = 'A' | 'B' | 'C' | 'D';
export type Priority = 'low' | 'medium' | 'high';

export interface TriggerInput {
  return1m: number;
  priceZScore: number;
  volumeZScore: number;
  oiChangePct: number;
  fundingRate: number;
  fundingMean: number;
  basisPct: number;
  basisMean: number;
  liquidationUsd1h: number;
  liquidationMean: number;
  xResonance: number;
}

export interface TriggerFeatures {
  price_zscore: number;
  volume_zscore: number;
  oi_shift: number;
  funding_shift: number;
  basis_shift: number;
  liquidation_intensity: number;
  x_resonance: number;
}

export interface TriggerOutput {
  asset: 'BTC';
  triggered: boolean;
  trigger_type: string;
  price_zscore: number;
  volume_zscore: number;
  oi_shift: number;
  funding_shift: number;
  basis_shift: number;
  liquidation_intensity: number;
  x_resonance: number;
  case_label: CaseLabel;
  priority: Priority;
  notes: string;
}
