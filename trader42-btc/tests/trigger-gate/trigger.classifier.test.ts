import { describe, expect, it } from 'vitest';
import { classifyTriggerCase } from '../../src/modules/trigger-gate/trigger.classifier.js';

describe('classifyTriggerCase', () => {
  it('Case A: price moves AND x resonance (full pipeline)', () => {
    const result = classifyTriggerCase({
      price_zscore: 2.8,
      volume_zscore: 2.5,
      liquidation_intensity: 0.3,
      x_resonance: 0.6,
      oi_shift: 0.5,
      funding_shift: 0.3,
      basis_shift: 0.2,
    });
    expect(result.case_label).toBe('A');
    expect(result.priority).toBe('high');
    expect(result.triggered).toBe(true);
  });

  it('Case B: price moves without x resonance (probe mode)', () => {
    const result = classifyTriggerCase({
      price_zscore: 2.5,
      volume_zscore: 2.2,
      liquidation_intensity: 0.2,
      x_resonance: 0.1,
      oi_shift: 0.4,
      funding_shift: 0.2,
      basis_shift: 0.1,
    });
    expect(result.case_label).toBe('B');
    expect(result.priority).toBe('medium');
    expect(result.triggered).toBe(true);
  });

  it('Case C: x resonance but no price move (watchlist only)', () => {
    const result = classifyTriggerCase({
      price_zscore: 0.5,
      volume_zscore: 0.8,
      liquidation_intensity: 0.1,
      x_resonance: 0.7,
      oi_shift: 0.1,
      funding_shift: 0.1,
      basis_shift: 0.05,
    });
    expect(result.case_label).toBe('C');
    expect(result.priority).toBe('low');
    expect(result.triggered).toBe(false);
  });

  it('Case D: price move dominated by liquidation cascade', () => {
    const result = classifyTriggerCase({
      price_zscore: 3.0,
      volume_zscore: 3.5,
      liquidation_intensity: 0.85,
      x_resonance: 0.1,
      oi_shift: 0.8,
      funding_shift: 0.7,
      basis_shift: 0.6,
    });
    expect(result.case_label).toBe('D');
    expect(result.priority).toBe('medium');
    expect(result.triggered).toBe(true);
  });

  it('returns no-trigger when all signals are calm', () => {
    const result = classifyTriggerCase({
      price_zscore: 0.3,
      volume_zscore: 0.5,
      liquidation_intensity: 0.05,
      x_resonance: 0.05,
      oi_shift: 0.1,
      funding_shift: 0.05,
      basis_shift: 0.02,
    });
    expect(result.triggered).toBe(false);
    expect(result.priority).toBe('low');
  });
});
