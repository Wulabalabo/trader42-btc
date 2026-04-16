import { describe, expect, it } from 'vitest';
import { classifyNarrative } from '../../src/modules/narrative/narrative.classifier.js';

describe('classifyNarrative', () => {
  it('caps non-first-order themes at watch', () => {
    const result = classifyNarrative({
      spread_strength: 0.9,
      first_order_presence: false,
      hard_catalyst: false,
      crowding_probability: 0.1,
      cluster_size: 8,
    });

    expect(result.actionability_ceiling).toBe('watch');
  });

  it('returns consensus and standard when spread is strong with first-order support', () => {
    const result = classifyNarrative({
      spread_strength: 0.8,
      first_order_presence: true,
      hard_catalyst: true,
      crowding_probability: 0.2,
      cluster_size: 9,
    });

    expect(result.narrative_stage).toBe('consensus');
    expect(result.actionability_ceiling).toBe('standard');
  });
});
