import type { MarketRegime, RegimeFeatures } from './regime.types.js';

const LABELS: Record<string, MarketRegime> = {
  macroPressure: 'macro-led',
  flowPressure: 'flow-led',
  positioningPressure: 'positioning-led',
  eventPressure: 'event-led',
};

const LABEL_SHORT: Record<string, string> = {
  macroPressure: 'macro',
  flowPressure: 'flow',
  positioningPressure: 'positioning',
  eventPressure: 'event',
};

const LOW_THRESHOLD = 0.3;
const MIXED_DELTA = 0.15;

export function classifyMarketRegime(input: RegimeFeatures) {
  const pairs = Object.entries(input).sort((a, b) => (b[1] as number) - (a[1] as number));
  const [topKey, topVal] = pairs[0] as [string, number];
  const [, secondVal] = pairs[1] as [string, number];

  const allLow = pairs.every(([, v]) => (v as number) < LOW_THRESHOLD);
  const tooClose = topVal - secondVal < MIXED_DELTA;

  const regime: MarketRegime = allLow || tooClose ? 'mixed' : LABELS[topKey] ?? 'mixed';
  const confidence = allLow ? topVal : tooClose ? topVal * 0.6 : Math.min(topVal, 1);

  return {
    market_regime: regime,
    primary_drivers: [LABEL_SHORT[topKey]],
    secondary_drivers: pairs.slice(1, 3).map(([k]) => LABEL_SHORT[k]),
    confidence,
  };
}
