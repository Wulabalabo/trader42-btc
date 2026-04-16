import type { NarrativeClassifierInput, NarrativeClassifierOutput } from './narrative.types.js';

export function classifyNarrative(input: NarrativeClassifierInput): NarrativeClassifierOutput {
  if (!input.first_order_presence) {
    return { narrative_stage: 'spreading', actionability_ceiling: 'watch' };
  }
  if (input.crowding_probability > 0.7) {
    return { narrative_stage: 'crowded', actionability_ceiling: 'watch' };
  }
  if (input.spread_strength > 0.75 && input.hard_catalyst) {
    return { narrative_stage: 'consensus', actionability_ceiling: 'standard' };
  }
  if (input.spread_strength > 0.4) {
    return { narrative_stage: 'spreading', actionability_ceiling: 'light' };
  }
  return { narrative_stage: 'seed', actionability_ceiling: 'ignore' };
}
