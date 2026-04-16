export type TradeLevel = 'ignore' | 'watch' | 'light' | 'standard' | 'avoid';
export type Direction = 'long' | 'short' | 'observe';

export interface TradeAdvice {
  id: string;
  timestamp: string;
  asset: 'BTC';
  market_regime: string;
  driver: string;
  tradeability: TradeLevel;
  risk_budget: number;
  active_driver: string;
  direction: Direction;
  trade_level: TradeLevel;
  risk_budget_pct: number;
  confirmation_mode: string;
  narrative_stage: string;
  narrative_ceiling: string;
  confirmation_tradeability: string;
  positioning_heat: number;
  theme_probability: number;
  continuation_probability: number;
  crowding_probability: number;
  invalidators: string[];
  reasoning: string[];
  execution_note: string;
  review_required: boolean;
}

export const serializeTradeAdvice = (overrides?: Partial<TradeAdvice>): TradeAdvice => {
  const base: TradeAdvice = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    asset: 'BTC',
    market_regime: 'mixed',
    driver: '',
    tradeability: 'ignore',
    risk_budget: 0,
    active_driver: '',
    direction: 'observe',
    trade_level: 'ignore',
    risk_budget_pct: 0,
    confirmation_mode: 'none',
    narrative_stage: 'seed',
    narrative_ceiling: 'watch',
    confirmation_tradeability: 'ignore',
    positioning_heat: 0,
    theme_probability: 0,
    continuation_probability: 0,
    crowding_probability: 0,
    invalidators: [],
    reasoning: [],
    execution_note: '',
    review_required: true,
    ...overrides,
  };
  if (!overrides?.driver && base.active_driver) {
    base.driver = base.active_driver;
  }
  if (!overrides?.tradeability) {
    base.tradeability = base.trade_level;
  }
  if (!overrides?.risk_budget) {
    base.risk_budget = base.risk_budget_pct;
  }
  // Standard trades always require review
  if (base.trade_level === 'standard') {
    base.review_required = true;
  }
  return base;
};
