export type ConfirmationMode = 'breakout' | 'followthrough' | 'divergence' | 'squeeze' | 'none';
export type Tradeability = 'ignore' | 'watch' | 'actionable';

export interface ConfirmationFeatures {
  spot_confirmation: number;
  perp_confirmation: number;
  ETF_confirmation: number;
  positioning_heat: number;
}

export interface ConfirmationInput {
  priceChange5m: number;
  priceChange1h: number;
  volumeChange: number;
  etfNetFlowUsd: number;
  oiChangePct: number;
  fundingRate: number;
  basisPct: number;
  liquidationIntensity: number;
  spotVsPerp: number;
  narrativeCeiling: 'ignore' | 'watch' | 'light' | 'standard';
}

export interface ConfirmationOutput {
  asset: 'BTC';
  confirmation_mode: ConfirmationMode;
  direction_bias: 'long' | 'short' | 'observe';
  spot_confirmation: number;
  perp_confirmation: number;
  ETF_confirmation: number;
  positioning_heat: number;
  crowding_adjustment: number;
  continuation_probability: number;
  entry_quality: number;
  payoff_asymmetry: number;
  tradeability: Tradeability;
  notes: string;
}

export function serializeConfirmation(
  overrides: Partial<ConfirmationOutput> = {},
): ConfirmationOutput {
  return {
    asset: 'BTC',
    confirmation_mode: 'none',
    direction_bias: 'observe',
    spot_confirmation: 0,
    perp_confirmation: 0,
    ETF_confirmation: 0,
    positioning_heat: 0,
    crowding_adjustment: 0,
    continuation_probability: 0,
    entry_quality: 0,
    payoff_asymmetry: 0,
    tradeability: 'ignore',
    notes: '',
    ...overrides,
  };
}
