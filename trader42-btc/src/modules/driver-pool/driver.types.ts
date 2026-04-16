export type DriverType = 'macro' | 'flow' | 'positioning' | 'event' | 'narrative';
export type DriverStatus = 'new' | 'continuing' | 'recycled' | 'noisy';

export interface DriverCatalogEntry {
  key: string;
  driverType: DriverType;
  dataSources: string[];
  description: string;
  watchSignals: string[];
  historicalHitRate: number;
}

export interface DriverFeatureInput {
  marketRegime: string;
  etfNetFlowUsd: number;
  oiChangePct: number;
  fundingRate: number;
  liquidationIntensity: number;
  upcomingMacroEvents: Array<{ type: string; hoursUntil: number }>;
}

export interface DriverScore {
  relevance: number;
  hardness: number;
}

export interface CandidateDriver {
  driver: string;
  thesis: string;
  driver_type: DriverType;
  relevance: number;
  hardness: number;
  historical_hit_rate: number;
  status: DriverStatus;
  watch_signals: string[];
}

export interface DriverPoolInput extends DriverFeatureInput {
  previousDriverKeys?: string[];
  topN?: number;
}

export interface DriverPoolOutput {
  candidate_btc_drivers: CandidateDriver[];
}
