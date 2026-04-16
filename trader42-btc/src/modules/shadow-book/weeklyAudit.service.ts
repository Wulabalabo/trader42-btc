import { buildWeeklyAuditPrompt } from './weeklyAudit.prompt.js';
import type { ShadowTrade } from './shadowBook.types.js';

export interface WeeklyAuditReport {
  generatedAt: string;
  prompt: string;
  falsePositivesTop5: ShadowTrade[];
  bestSignalsTop5: ShadowTrade[];
  thresholdAdjustments: string[];
  summary: string;
}

export function runWeeklyAudit(
  trades: ShadowTrade[],
  now = new Date(),
): WeeklyAuditReport {
  const falsePositivesTop5 = trades
    .filter((trade) => trade.failure_tag === 'false-positive' || trade.outcome === 'lose')
    .slice(0, 5);
  const bestSignalsTop5 = trades
    .filter((trade) => trade.failure_tag === 'good-call' || trade.outcome === 'win')
    .slice(0, 5);
  const thresholdAdjustments = [
    falsePositivesTop5.length > bestSignalsTop5.length
      ? 'Tighten narrative and confirmation thresholds for crowded BTC setups.'
      : 'Keep current BTC thresholds and review edge cases manually.',
  ];

  return {
    generatedAt: now.toISOString(),
    prompt: buildWeeklyAuditPrompt(trades),
    falsePositivesTop5,
    bestSignalsTop5,
    thresholdAdjustments,
    summary: `Weekly audit reviewed ${trades.length} trades and proposes threshold adjustments.`,
  };
}
