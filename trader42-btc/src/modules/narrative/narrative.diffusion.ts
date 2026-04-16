import type { NarrativeDiffusionInput, NarrativeDiffusionOutput } from './narrative.types.js';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function scoreNarrativeDiffusion(input: NarrativeDiffusionInput): NarrativeDiffusionOutput {
  const timeWindowMinutes = Math.max(input.firstEventMinutesAgo - input.latestEventMinutesAgo, 1);
  const totalEvents = input.tier1Events + input.tier2Events + input.tier3Events;
  const layer1_velocity = clamp(input.tier1Events / 3);
  const layer2_velocity = clamp(input.tier2Events / 5);
  const layer3_retail_diffusion = clamp(input.tier3Events / 8);
  const accountDiversity = clamp(input.totalUniqueAccounts / 10);
  const eventRate = clamp((totalEvents / timeWindowMinutes) * 5);
  const spread_strength = clamp(
    layer1_velocity * 0.4 + layer2_velocity * 0.3 + accountDiversity * 0.2 + eventRate * 0.1,
  );

  return {
    layer1_velocity,
    layer2_velocity,
    layer3_retail_diffusion,
    spread_strength,
    total_events: totalEvents,
    unique_accounts: input.totalUniqueAccounts,
  };
}
