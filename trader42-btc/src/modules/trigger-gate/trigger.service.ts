import { buildTriggerFeatures } from './trigger.featureBuilder.js';
import { classifyTriggerCase } from './trigger.classifier.js';
import type { TriggerInput, TriggerOutput } from './trigger.types.js';

export function evaluateTriggerGate(input: TriggerInput): TriggerOutput {
  const features = buildTriggerFeatures(input);
  const classification = classifyTriggerCase(features);

  return {
    asset: 'BTC',
    triggered: classification.triggered,
    trigger_type: classification.trigger_type,
    price_zscore: features.price_zscore,
    volume_zscore: features.volume_zscore,
    oi_shift: features.oi_shift,
    funding_shift: features.funding_shift,
    basis_shift: features.basis_shift,
    liquidation_intensity: features.liquidation_intensity,
    x_resonance: features.x_resonance,
    case_label: classification.case_label,
    priority: classification.priority,
    notes: '',
  };
}
