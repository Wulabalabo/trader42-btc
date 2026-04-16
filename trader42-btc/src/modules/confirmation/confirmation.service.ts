import { classifyConfirmationMode } from './confirmation.classifier.js';
import { buildConfirmationFeatures } from './confirmation.featureBuilder.js';
import { serializeConfirmation } from './confirmation.types.js';
import type { ConfirmationInput, ConfirmationOutput } from './confirmation.types.js';
import type { ConfirmationRepository } from './confirmation.repository.js';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function buildConfirmationResponse(
  input: ConfirmationInput,
  repository?: ConfirmationRepository,
): ConfirmationOutput {
  const features = buildConfirmationFeatures(input);
  const classification = classifyConfirmationMode({
    ...features,
    narrativeCeiling: input.narrativeCeiling,
  });

  const output = serializeConfirmation({
    confirmation_mode: classification.confirmation_mode,
    direction_bias:
      input.priceChange1h > 0
        ? 'long'
        : input.priceChange1h < 0
          ? 'short'
          : input.etfNetFlowUsd < 0
            ? 'short'
            : input.etfNetFlowUsd > 0
              ? 'long'
              : 'observe',
    spot_confirmation: Number(features.spot_confirmation.toFixed(3)),
    perp_confirmation: Number(features.perp_confirmation.toFixed(3)),
    ETF_confirmation: Number(features.ETF_confirmation.toFixed(3)),
    positioning_heat: Number(features.positioning_heat.toFixed(3)),
    crowding_adjustment: Number((1 - features.positioning_heat).toFixed(3)),
    continuation_probability: Number(
      clamp(features.spot_confirmation * 0.45 + features.perp_confirmation * 0.35 + features.ETF_confirmation * 0.2).toFixed(3),
    ),
    entry_quality: Number(clamp((features.spot_confirmation + features.ETF_confirmation) / 2).toFixed(3)),
    payoff_asymmetry: Number(clamp(1 - features.positioning_heat * 0.7).toFixed(3)),
    tradeability: classification.tradeability,
    notes: `mode=${classification.confirmation_mode}`,
  });

  repository?.save(output);
  return output;
}
