import type { TriggerFeatures, CaseLabel, Priority } from './trigger.types.js';

const PRICE_THRESHOLD = 2.0;
const X_THRESHOLD = 0.5;
const LIQUIDATION_DOMINANT = 0.7;

interface ClassificationResult {
  case_label: CaseLabel;
  priority: Priority;
  triggered: boolean;
  trigger_type: string;
}

export function classifyTriggerCase(f: TriggerFeatures): ClassificationResult {
  const priceActive = f.price_zscore > PRICE_THRESHOLD;
  const xActive = f.x_resonance > X_THRESHOLD;
  const liqDominant = f.liquidation_intensity > LIQUIDATION_DOMINANT;

  if (priceActive && xActive && !liqDominant) {
    return { case_label: 'A', priority: 'high', triggered: true, trigger_type: 'price_x_resonance' };
  }
  if (priceActive && liqDominant) {
    return { case_label: 'D', priority: 'medium', triggered: true, trigger_type: 'liquidation_cascade' };
  }
  if (priceActive && !xActive) {
    return { case_label: 'B', priority: 'medium', triggered: true, trigger_type: 'price_only' };
  }
  if (!priceActive && xActive) {
    return { case_label: 'C', priority: 'low', triggered: false, trigger_type: 'x_only' };
  }
  return { case_label: 'C', priority: 'low', triggered: false, trigger_type: 'none' };
}
