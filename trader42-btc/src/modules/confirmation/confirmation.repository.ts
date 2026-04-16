import type { ConfirmationOutput } from './confirmation.types.js';

export class ConfirmationRepository {
  private latest: ConfirmationOutput | null = null;

  save(output: ConfirmationOutput): void {
    this.latest = output;
  }

  getLatest(): ConfirmationOutput | null {
    return this.latest;
  }
}
