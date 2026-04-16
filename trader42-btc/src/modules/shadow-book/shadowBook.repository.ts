import type { ShadowTrade } from './shadowBook.types.js';

export class ShadowBookRepository {
  private readonly items: ShadowTrade[] = [];

  save(trade: ShadowTrade): void {
    this.items.push(trade);
  }

  listLatest(limit = 20): ShadowTrade[] {
    return this.items.slice(-limit).reverse();
  }
}
