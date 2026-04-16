import { describe, expect, it } from 'vitest';
import { classifyConfirmationMode } from '../../src/modules/confirmation/confirmation.classifier.js';

describe('classifyConfirmationMode', () => {
  it('returns breakout when spot + ETF align and heat is low', () => {
    const result = classifyConfirmationMode({
      spot_confirmation: 0.8,
      perp_confirmation: 0.5,
      ETF_confirmation: 0.7,
      positioning_heat: 0.2,
      narrativeCeiling: 'standard',
    });

    expect(result.confirmation_mode).toBe('breakout');
    expect(result.tradeability).toBe('actionable');
  });

  it('returns squeeze when heat is high and perp leads', () => {
    const result = classifyConfirmationMode({
      spot_confirmation: 0.3,
      perp_confirmation: 0.8,
      ETF_confirmation: 0.1,
      positioning_heat: 0.85,
      narrativeCeiling: 'light',
    });

    expect(result.confirmation_mode).toBe('squeeze');
    expect(result.tradeability).toBe('watch');
  });

  it('returns actionable followthrough when narrative ceiling is standard', () => {
    const result = classifyConfirmationMode({
      spot_confirmation: 0.55,
      perp_confirmation: 0.52,
      ETF_confirmation: 0.4,
      positioning_heat: 0.25,
      narrativeCeiling: 'standard',
    });

    expect(result.confirmation_mode).toBe('followthrough');
    expect(result.tradeability).toBe('actionable');
  });
});
