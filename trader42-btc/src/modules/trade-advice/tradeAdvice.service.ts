import { decideTradeAdvice } from './tradeAdvice.policy.js';
import { serializeTradeAdvice } from './tradeAdvice.types.js';
import type { TradeAdvice } from './tradeAdvice.types.js';

export interface PipelineInput {
  regime: string;
  topDriver: { name: string; direction: string; score: number };
  triggerFired: boolean;
  narrativeStage: string;
  narrativeCeiling: string;
  confirmationMode: string;
  confirmationTradeability: string;
  positioningHeat: number;
  continuationProbability: number;
  entryQuality: number;
}

function generateInvalidators(mode: string, direction: string): string[] {
  const inv: string[] = [];
  if (mode === 'breakout') inv.push('price fails to hold above breakout level within 1h');
  if (mode === 'followthrough') inv.push('volume dries up within 4h');
  if (direction === 'long') inv.push('ETF flow turns net negative for the day');
  inv.push('positioning heat rises above 0.8');
  return inv;
}

export function buildTradeAdviceResponse(input: PipelineInput): TradeAdvice {
  const policy = decideTradeAdvice({
    regime: input.regime,
    narrativeCeiling: input.narrativeCeiling,
    confirmationTradeability: input.confirmationTradeability,
    confirmationMode: input.confirmationMode,
    positioningHeat: input.positioningHeat,
    themeProbability: input.topDriver.score,
    continuationProbability: input.continuationProbability,
  });

  const invalidators = generateInvalidators(input.confirmationMode, policy.direction);

  return serializeTradeAdvice({
    market_regime: input.regime,
    active_driver: input.topDriver.name,
    direction: policy.direction,
    trade_level: policy.trade_level,
    risk_budget_pct: policy.risk_budget_pct,
    confirmation_mode: input.confirmationMode,
    narrative_stage: input.narrativeStage,
    narrative_ceiling: input.narrativeCeiling,
    confirmation_tradeability: input.confirmationTradeability,
    positioning_heat: input.positioningHeat,
    theme_probability: input.topDriver.score,
    continuation_probability: input.continuationProbability,
    crowding_probability: 0,
    invalidators,
    reasoning: policy.reasoning,
    execution_note:
      policy.trade_level === 'light'
        ? 'Reduced size, monitor for confirmation follow-through'
        : policy.trade_level === 'standard'
          ? 'Full size allowed, set stops per confirmation mode'
          : '',
    review_required: policy.trade_level === 'standard' || policy.trade_level === 'light',
  });
}
