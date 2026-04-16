export type MarketRegime = 'macro-led' | 'flow-led' | 'positioning-led' | 'event-led' | 'narrative-led' | 'mixed';
export type RiskEnvironment = 'risk-on' | 'risk-off' | 'mixed';
export type BtcState = 'trend' | 'range' | 'squeeze-prone' | 'fragile' | 'mixed';

export interface MarketSnapshotInput {
  dxyChange: number;
  nqChangePct: number;
  etfNetFlowUsd: number;
  oiChangePct: number;
  fundingRate: number;
  liquidationIntensity: number;
  volumeChangePct: number;
}

export interface RegimeFeatures {
  macroPressure: number;
  flowPressure: number;
  positioningPressure: number;
  eventPressure: number;
}

export interface RegimeOutput {
  asset: 'BTC';
  market_regime: MarketRegime;
  primary_drivers: string[];
  secondary_drivers: string[];
  risk_environment: RiskEnvironment;
  btc_state: BtcState;
  regime_shift_probability: number;
  confidence: number;
  notes: string;
}
