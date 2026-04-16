import type { TradeAdvice } from './tradeAdvice.types.js';

export class TradeAdviceRepository {
  private readonly items: TradeAdvice[] = [];

  save(advice: TradeAdvice): void {
    this.items.push(advice);
  }

  listLatest(limit = 20): TradeAdvice[] {
    return this.items.slice(-limit).reverse();
  }
}
