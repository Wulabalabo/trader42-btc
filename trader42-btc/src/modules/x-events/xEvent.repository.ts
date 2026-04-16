import type { XEventOutput } from './xEvent.types.js';

export class XEventRepository {
  private readonly events: XEventOutput[] = [];

  save(event: XEventOutput): void {
    this.events.push(event);
  }

  listLatest(limit = 20): XEventOutput[] {
    return this.events.slice(-limit).reverse();
  }
}
