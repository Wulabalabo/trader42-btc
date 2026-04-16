import type { MarketSnapshotInput, RegimeFeatures } from './regime.types.js';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const sigmoid = (x: number, scale: number) => 1 / (1 + Math.exp(-x / scale));

export function buildRegimeFeatures(input: MarketSnapshotInput): RegimeFeatures {
  return {
    // DXY up + NQ down = strong macro pressure
    macroPressure: clamp(
      sigmoid(Math.abs(input.dxyChange) * 2 + Math.abs(Math.min(input.nqChangePct, 0)) * 0.5, 1),
    ),
    // ETF flow normalized: $200M = ~1.0
    flowPressure: clamp(Math.abs(input.etfNetFlowUsd) / 200_000_000),
    // OI shift + funding extreme + liquidations
    positioningPressure: clamp(
      sigmoid(
        Math.abs(input.oiChangePct) * 0.15 +
          Math.abs(input.fundingRate) * 50 +
          input.liquidationIntensity,
        2,
      ),
    ),
    // Event pressure starts at 0, gets boosted by Step 2 X events separately
    eventPressure: 0,
  };
}
