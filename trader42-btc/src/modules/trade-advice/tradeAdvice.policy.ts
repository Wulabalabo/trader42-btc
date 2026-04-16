import type { TradeLevel, Direction } from './tradeAdvice.types.js';

export interface PolicyInput {
  regime: string;
  narrativeCeiling: string;
  confirmationTradeability: string;
  confirmationMode: string;
  positioningHeat: number;
  themeProbability: number;
  continuationProbability: number;
}

export interface PolicyOutput {
  trade_level: TradeLevel;
  risk_budget_pct: number;
  direction: Direction;
  reasoning: string[];
}

const LEVEL_ORDER: TradeLevel[] = ['ignore', 'watch', 'light', 'standard'];
const RISK_BUDGET: Record<string, number> = { ignore: 0, watch: 0, light: 0.25, standard: 0.5 };

function capLevel(level: string, ceiling: string): TradeLevel {
  const li = LEVEL_ORDER.indexOf(level as TradeLevel);
  const ci = LEVEL_ORDER.indexOf(ceiling as TradeLevel);
  if (ci >= 0 && li > ci) return LEVEL_ORDER[ci];
  return level as TradeLevel;
}

export function decideTradeAdvice(input: PolicyInput): PolicyOutput {
  const reasoning: string[] = [];

  // Extreme positioning heat → forced avoid
  if (input.positioningHeat > 0.8) {
    reasoning.push('positioning_heat > 0.8 → avoid');
    return { trade_level: 'avoid', risk_budget_pct: 0, direction: 'observe', reasoning };
  }

  // Determine raw level from confirmation
  let rawLevel: TradeLevel;
  if (input.confirmationTradeability === 'ignore' || input.confirmationMode === 'none') {
    rawLevel = 'ignore';
  } else if (input.confirmationTradeability === 'actionable' && input.themeProbability > 0.6) {
    rawLevel = 'standard';
  } else if (input.confirmationTradeability === 'actionable' || input.confirmationTradeability === 'watch') {
    rawLevel = 'light';
  } else {
    rawLevel = 'watch';
  }

  // Apply narrative ceiling cap
  const capped = capLevel(rawLevel, input.narrativeCeiling);

  // Direction: observe for ignore/watch
  const direction: Direction = capped === 'ignore' || capped === 'watch' ? 'observe' : 'long';

  // Risk budget with regime adjustment
  let riskBudget = RISK_BUDGET[capped] ?? 0;
  if (input.regime === 'risk-off' && direction === 'long') riskBudget *= 0.5;
  if (input.regime === 'mixed') riskBudget *= 0.75;

  // Heat penalty
  if (input.positioningHeat > 0.5) riskBudget *= 1 - input.positioningHeat;

  riskBudget = Math.round(riskBudget * 100) / 100;

  reasoning.push(
    `raw=${rawLevel}, ceiling=${input.narrativeCeiling}, capped=${capped}, regime=${input.regime}`,
  );

  return { trade_level: capped, risk_budget_pct: riskBudget, direction, reasoning };
}
