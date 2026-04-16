import type { ShadowTrade } from './shadowBook.types.js';

export function buildWeeklyAuditPrompt(trades: ShadowTrade[]): string {
  return `Review the BTC shadow-book and output:\n1. top false positives\n2. top successful signals\n3. threshold adjustments\nTrades reviewed: ${trades.length}`;
}
