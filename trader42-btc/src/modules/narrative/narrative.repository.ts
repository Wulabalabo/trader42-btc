import type { NarrativeOutput } from './narrative.types.js';

export class NarrativeRepository {
  private latest: NarrativeOutput | null = null;

  save(output: NarrativeOutput): void {
    this.latest = output;
  }

  getLatest(): NarrativeOutput | null {
    return this.latest;
  }
}
