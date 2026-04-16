import { decideTradeAdvice } from './tradeAdvice.policy.js';
import { serializeTradeAdvice } from './tradeAdvice.types.js';
import type { TradeAdvice } from './tradeAdvice.types.js';
import { createShadowTrade } from '../shadow-book/shadowBook.service.js';
import type { ShadowTrade } from '../shadow-book/shadowBook.types.js';
import type { TradeAdviceRepository } from './tradeAdvice.repository.js';
import type { ShadowBookRepository } from '../shadow-book/shadowBook.repository.js';

export interface PipelineInput {
  regime: {
    market_regime: string;
    risk_environment: string;
  };
  driverPool: {
    candidate_btc_drivers: Array<{
      driver: string;
      thesis: string;
      driver_type: string;
      relevance: number;
      hardness: number;
      historical_hit_rate: number;
      status: string;
      watch_signals: string[];
    }>;
  };
  trigger: {
    triggered: boolean;
  };
  narrative: {
    narrative_stage: string;
    actionability_ceiling: string;
    theme_probability: number;
    crowding_probability: number;
  };
  confirmation: {
    confirmation_mode: string;
    tradeability: string;
    direction_bias?: 'long' | 'short' | 'observe';
    positioning_heat: number;
    continuation_probability: number;
    entry_quality: number;
  };
  xEvents?: Array<{
    btc_bias: 'bullish' | 'bearish' | 'mixed' | 'unclear';
  }>;
  referencePrice: number;
}

export interface TradeAdviceBundle {
  advice: TradeAdvice;
  shadowTrade: ShadowTrade | null;
}

function generateInvalidators(mode: string, direction: string): string[] {
  const inv: string[] = [];
  if (mode === 'breakout') {
    inv.push(
      direction === 'short'
        ? 'price fails to stay below the breakdown level within 1h'
        : 'price fails to hold above breakout level within 1h',
    );
  }
  if (mode === 'followthrough') {
    inv.push(
      direction === 'short'
        ? 'downside follow-through fades within 4h'
        : 'volume dries up within 4h',
    );
  }
  if (direction === 'long') inv.push('ETF flow turns net negative for the day');
  if (direction === 'short') inv.push('ETF flow turns decisively positive for the day');
  inv.push('positioning heat rises above 0.8');
  return inv;
}

function inferDirection(input: PipelineInput): 'long' | 'short' | 'observe' {
  if (input.confirmation.direction_bias && input.confirmation.direction_bias !== 'observe') {
    return input.confirmation.direction_bias;
  }

  const bearishVotes = input.xEvents?.filter((event) => event.btc_bias === 'bearish').length ?? 0;
  const bullishVotes = input.xEvents?.filter((event) => event.btc_bias === 'bullish').length ?? 0;

  if (bearishVotes > bullishVotes) {
    return 'short';
  }
  if (bullishVotes > bearishVotes) {
    return 'long';
  }
  return 'observe';
}

export function buildTradeAdviceResponse(
  input: PipelineInput,
  repositories: {
    tradeAdviceRepository?: TradeAdviceRepository;
    shadowBookRepository?: ShadowBookRepository;
  } = {},
): TradeAdviceBundle {
  const topDriver = input.driverPool.candidate_btc_drivers[0];
  const themeProbability = Math.max(input.narrative.theme_probability, topDriver?.relevance ?? 0);
  const confirmationTradeability = input.trigger.triggered
    ? input.confirmation.tradeability
    : 'ignore';
  const confirmationMode = input.trigger.triggered
    ? input.confirmation.confirmation_mode
    : 'none';

  const policy = decideTradeAdvice({
    regime: input.regime.risk_environment,
    narrativeCeiling: input.narrative.actionability_ceiling,
    confirmationTradeability,
    confirmationMode,
    positioningHeat: input.confirmation.positioning_heat,
    themeProbability,
    continuationProbability: input.confirmation.continuation_probability,
    directionBias: inferDirection(input),
  });

  const invalidators = generateInvalidators(confirmationMode, policy.direction);

  const advice = serializeTradeAdvice({
    market_regime: input.regime.market_regime,
    driver: topDriver?.driver ?? '',
    tradeability: policy.trade_level,
    risk_budget: policy.risk_budget_pct,
    active_driver: topDriver?.driver ?? '',
    direction: policy.direction,
    trade_level: policy.trade_level,
    risk_budget_pct: policy.risk_budget_pct,
    confirmation_mode: confirmationMode,
    narrative_stage: input.narrative.narrative_stage,
    narrative_ceiling: input.narrative.actionability_ceiling,
    confirmation_tradeability: confirmationTradeability,
    positioning_heat: input.confirmation.positioning_heat,
    theme_probability: themeProbability,
    continuation_probability: input.confirmation.continuation_probability,
    crowding_probability: input.narrative.crowding_probability,
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

  repositories.tradeAdviceRepository?.save(advice);

  const shadowTrade = createShadowTrade({
    tradeAdviceId: advice.id,
    direction: advice.direction,
    entryPrice: input.referencePrice,
    stopPrice:
      advice.direction === 'short'
        ? Number((input.referencePrice * 1.02).toFixed(2))
        : Number((input.referencePrice * 0.98).toFixed(2)),
    targetPrice:
      advice.direction === 'short'
        ? Number((input.referencePrice * 0.96).toFixed(2))
        : Number((input.referencePrice * 1.04).toFixed(2)),
    timeHorizon: advice.trade_level === 'standard' ? 'eod' : advice.trade_level === 'light' ? '2h' : '30m',
    expectedPath: advice.direction === 'short' ? 'BTC should move lower after confirmation.' : advice.direction === 'long' ? 'BTC should continue higher after confirmation.' : 'BTC should stay observational without committing capital.',
  });

  repositories.shadowBookRepository?.save(shadowTrade);

  return { advice, shadowTrade };
}
