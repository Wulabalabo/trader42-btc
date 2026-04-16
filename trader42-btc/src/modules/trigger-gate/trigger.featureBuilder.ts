import type { TriggerInput, TriggerFeatures } from './trigger.types.js';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export function buildTriggerFeatures(input: TriggerInput): TriggerFeatures {
  return {
    price_zscore: input.priceZScore,
    volume_zscore: input.volumeZScore,
    oi_shift: input.oiChangePct / 10,
    funding_shift: Math.abs(input.fundingRate - input.fundingMean) / 0.01,
    basis_shift: Math.abs(input.basisPct - input.basisMean) / 0.5,
    liquidation_intensity: clamp(input.liquidationUsd1h / ((input.liquidationMean * 3) || 1)),
    x_resonance: input.xResonance,
  };
}
