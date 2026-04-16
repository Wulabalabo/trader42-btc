import type { TriggerOutput } from './trigger.types.js';

export class TriggerRepository {
  private latest: TriggerOutput | null = null;

  save(snapshot: TriggerOutput): void {
    this.latest = snapshot;
  }

  getLatest(): TriggerOutput | null {
    return this.latest;
  }
}
