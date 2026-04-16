import { clusterByKeywordOverlap } from './narrative.cluster.js';
import { classifyNarrative } from './narrative.classifier.js';
import { scoreNarrativeDiffusion } from './narrative.diffusion.js';
import type { NarrativeInput, NarrativeOutput } from './narrative.types.js';
import type { NarrativeRepository } from './narrative.repository.js';

const TIER_WEIGHTS = {
  official: 1,
  journalist: 0.85,
  analyst: 0.65,
  kol: 0.35,
} as const;

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function capActionability(
  value: NarrativeOutput['actionability_ceiling'],
  cap: NarrativeOutput['actionability_ceiling'],
): NarrativeOutput['actionability_ceiling'] {
  const order: NarrativeOutput['actionability_ceiling'][] = ['ignore', 'watch', 'light', 'standard'];
  return order.indexOf(value) > order.indexOf(cap) ? cap : value;
}

export function buildNarrativeResponse(
  input: NarrativeInput,
  repository?: NarrativeRepository,
): NarrativeOutput {
  const marketLinkageConfirmation =
    input.marketLinkageConfirmation ?? input.positioningConfirmation;
  const clusters = clusterByKeywordOverlap(input.events);
  const primaryCluster = [...clusters].sort((a, b) => b.size - a.size)[0];
  const tier1Events = input.events.filter((event) => ['official', 'journalist'].includes(event.source_tier)).length;
  const tier2Events = input.events.filter((event) => event.source_tier === 'analyst').length;
  const tier3Events = input.events.filter((event) => event.source_tier === 'kol').length;
  const diffusion = scoreNarrativeDiffusion({
    tier1Events,
    tier2Events,
    tier3Events,
    firstEventMinutesAgo: input.firstEventMinutesAgo,
    latestEventMinutesAgo: input.latestEventMinutesAgo,
    totalUniqueAccounts: input.totalUniqueAccounts,
  });
  const firstOrderPresence = input.events.some((event) => event.first_order_event);
  const sourceQualityScore =
    input.events.reduce((sum, event) => sum + TIER_WEIGHTS[event.source_tier], 0) /
    Math.max(input.events.length, 1);
  const crowdingProbability = clamp(
    diffusion.layer3_retail_diffusion * 0.5 + Math.max(diffusion.spread_strength - 0.6, 0),
  );
  const classification = classifyNarrative({
    spread_strength: diffusion.spread_strength,
    first_order_presence: firstOrderPresence,
    hard_catalyst: firstOrderPresence,
    crowding_probability: crowdingProbability,
    cluster_size: primaryCluster?.size ?? 0,
  });
  const actionabilityCeiling =
    marketLinkageConfirmation <= 0.2
      ? capActionability(classification.actionability_ceiling, 'watch')
      : marketLinkageConfirmation <= 0.4
        ? capActionability(classification.actionability_ceiling, 'light')
        : classification.actionability_ceiling;

  const output: NarrativeOutput = {
    asset: 'BTC',
    theme: primaryCluster?.theme ?? 'No active BTC theme',
    theme_probability: Number(
      clamp(
        ((primaryCluster?.size ?? 0) / Math.max(input.events.length, 1)) * 0.6 +
          diffusion.spread_strength * 0.3 +
          (firstOrderPresence ? 0.1 : 0),
      ).toFixed(3),
    ),
    narrative_stage: classification.narrative_stage,
    spread_strength: diffusion.spread_strength,
    source_quality_score: Number(sourceQualityScore.toFixed(3)),
    crowding_probability: Number(crowdingProbability.toFixed(3)),
    first_order_presence: firstOrderPresence,
    hard_catalyst: firstOrderPresence,
    layer1_velocity: diffusion.layer1_velocity,
    layer2_velocity: diffusion.layer2_velocity,
    layer3_retail_diffusion: diffusion.layer3_retail_diffusion,
    positioning_confirmation: marketLinkageConfirmation,
    actionability_ceiling: actionabilityCeiling,
    notes: primaryCluster ? `Primary cluster contains ${primaryCluster.size} event(s)` : 'No cluster found',
  };

  repository?.save(output);
  return output;
}
