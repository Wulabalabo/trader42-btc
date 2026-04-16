import type { ConfirmationFeatures, ConfirmationMode, Tradeability } from './confirmation.types.js';

export interface ConfirmationClassifierInput extends ConfirmationFeatures {
  narrativeCeiling: 'ignore' | 'watch' | 'light' | 'standard';
}

export interface ConfirmationClassifierOutput {
  confirmation_mode: ConfirmationMode;
  tradeability: Tradeability;
}

export function classifyConfirmationMode(
  input: ConfirmationClassifierInput,
): ConfirmationClassifierOutput {
  if (input.positioning_heat > 0.7 && input.perp_confirmation > input.spot_confirmation) {
    return { confirmation_mode: 'squeeze', tradeability: 'watch' };
  }
  if (input.spot_confirmation > 0.6 && input.ETF_confirmation > 0.5) {
    return {
      confirmation_mode: 'breakout',
      tradeability: input.narrativeCeiling === 'standard' ? 'actionable' : 'watch',
    };
  }
  if (input.spot_confirmation > 0.45 && input.perp_confirmation > 0.45) {
    return {
      confirmation_mode: 'followthrough',
      tradeability:
        input.narrativeCeiling === 'standard'
          ? 'actionable'
          : input.narrativeCeiling === 'ignore'
            ? 'ignore'
            : 'watch',
    };
  }
  if (input.perp_confirmation > 0.5 && input.ETF_confirmation < 0.2) {
    return { confirmation_mode: 'divergence', tradeability: 'watch' };
  }
  return { confirmation_mode: 'none', tradeability: 'ignore' };
}
