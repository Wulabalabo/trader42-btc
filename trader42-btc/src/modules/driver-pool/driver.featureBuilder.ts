import type { DriverFeatureInput, DriverScore } from './driver.types.js';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function getRegimeBonus(marketRegime: string, driverType: string): number {
  const map: Record<string, string> = {
    macro: 'macro-led',
    flow: 'flow-led',
    positioning: 'positioning-led',
    event: 'event-led',
    narrative: 'narrative-led',
  };

  return marketRegime === map[driverType] ? 0.2 : 0;
}

export function buildDriverFeatures(input: DriverFeatureInput): Record<string, DriverScore> {
  const hasMacroEvent = input.upcomingMacroEvents.some((event) => event.hoursUntil <= 24);
  const hasFomc = input.upcomingMacroEvents.some(
    (event) => event.type.toUpperCase() === 'FOMC' && event.hoursUntil <= 24,
  );

  return {
    'fed-rates': {
      relevance: clamp(0.25 + getRegimeBonus(input.marketRegime, 'macro') + (hasFomc ? 0.4 : hasMacroEvent ? 0.2 : 0)),
      hardness: hasFomc ? 0.9 : hasMacroEvent ? 0.7 : 0.3,
    },
    'etf-flow': {
      relevance: clamp(0.3 + getRegimeBonus(input.marketRegime, 'flow') + Math.abs(input.etfNetFlowUsd) / 300_000_000),
      hardness: clamp(Math.abs(input.etfNetFlowUsd) / 250_000_000),
    },
    'positioning-squeeze': {
      relevance: clamp(
        0.2 +
          getRegimeBonus(input.marketRegime, 'positioning') +
          input.oiChangePct / 10 +
          Math.abs(input.fundingRate) * 10,
      ),
      hardness: clamp(
        input.liquidationIntensity + Math.abs(input.fundingRate) * 10 + input.oiChangePct / 12,
      ),
    },
    'regulation-event': {
      relevance: clamp(0.2 + getRegimeBonus(input.marketRegime, 'event')),
      hardness: 0.15,
    },
    'institution-reserve': {
      relevance: 0.2,
      hardness: 0.15,
    },
    'safe-haven-geopolitics': {
      relevance: clamp(0.15 + getRegimeBonus(input.marketRegime, 'narrative')),
      hardness: 0.1,
    },
    'onchain-supply': {
      relevance: clamp(0.2 + getRegimeBonus(input.marketRegime, 'flow') * 0.5),
      hardness: 0.3,
    },
    'narrative-unconfirmed': {
      relevance: clamp(0.15 + getRegimeBonus(input.marketRegime, 'narrative') * 0.5),
      hardness: 0.05,
    },
  };
}
