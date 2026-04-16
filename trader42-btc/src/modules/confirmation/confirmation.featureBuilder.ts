import type { ConfirmationFeatures, ConfirmationInput } from './confirmation.types.js';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const sigmoid = (value: number, scale: number) => 1 / (1 + Math.exp(-value / scale));

export function buildConfirmationFeatures(input: Omit<ConfirmationInput, 'narrativeCeiling'>): ConfirmationFeatures {
  const spotSignal = Math.abs(input.priceChange1h) * (input.spotVsPerp > 0 ? 1.5 : 0.5);
  const perpSignal = Math.abs(input.priceChange1h) * (input.spotVsPerp < 0 ? 1.5 : 0.5);

  return {
    spot_confirmation: clamp(sigmoid(spotSignal * 20 + input.volumeChange * 0.3, 1)),
    perp_confirmation: clamp(sigmoid(perpSignal * 20 + input.oiChangePct * 0.1, 1)),
    ETF_confirmation: clamp(input.etfNetFlowUsd / 250_000_000),
    positioning_heat: clamp(
      sigmoid(Math.abs(input.fundingRate) * 12 + input.oiChangePct / 8 + input.liquidationIntensity * 1.5 - 1.2, 1.5),
    ),
  };
}
