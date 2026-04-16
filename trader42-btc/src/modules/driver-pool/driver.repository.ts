import type { DriverPoolOutput } from './driver.types.js';

export class DriverPoolRepository {
  private latest: DriverPoolOutput | null = null;

  save(output: DriverPoolOutput): void {
    this.latest = output;
  }

  getLatest(): DriverPoolOutput | null {
    return this.latest;
  }
}
