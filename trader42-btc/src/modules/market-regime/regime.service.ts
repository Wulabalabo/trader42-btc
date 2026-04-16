import { buildRegimeFeatures } from './regime.featureBuilder.js';
import { classifyMarketRegime } from './regime.classifier.js';
import type { MarketSnapshotInput, RegimeOutput, RiskEnvironment, BtcState } from './regime.types.js';

function deriveRiskEnvironment(input: MarketSnapshotInput): RiskEnvironment {
  const positive = (input.nqChangePct > 0 ? 1 : 0) + (input.dxyChange < 0 ? 1 : 0) + (input.etfNetFlowUsd > 0 ? 1 : 0);
  if (positive >= 2) return 'risk-on';
  if (positive === 0) return 'risk-off';
  return 'mixed';
}

function deriveBtcState(input: MarketSnapshotInput): BtcState {
  const absOi = Math.abs(input.oiChangePct);
  const absFunding = Math.abs(input.fundingRate);
  if (input.liquidationIntensity > 0.5) return 'fragile';
  if (absOi > 5 && absFunding > 0.01) return 'squeeze-prone';
  if (input.volumeChangePct > 50) return 'trend';
  return 'range';
}

export async function buildRegimeResponse(snapshot: MarketSnapshotInput): Promise<RegimeOutput> {
  const features = buildRegimeFeatures(snapshot);
  const classification = classifyMarketRegime(features);

  return {
    asset: 'BTC',
    market_regime: classification.market_regime,
    primary_drivers: classification.primary_drivers,
    secondary_drivers: classification.secondary_drivers,
    risk_environment: deriveRiskEnvironment(snapshot),
    btc_state: deriveBtcState(snapshot),
    regime_shift_probability: 0,
    confidence: classification.confidence,
    notes: '',
  };
}
