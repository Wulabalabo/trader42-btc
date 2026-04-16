import { RollingWindow } from '../../lib/rollingWindow.js';
import { evaluateTriggerGate } from './trigger.service.js';
import type { TriggerOutput } from './trigger.types.js';
import type { TriggerRepository } from './trigger.repository.js';

export interface TradeSample {
  price: number;
  volume: number;
  timestamp: string;
}

export class TriggerRuntime {
  private readonly priceWindow = new RollingWindow(60);
  private readonly volumeWindow = new RollingWindow(60);
  private latest: TriggerOutput | null = null;

  constructor(private readonly repository?: TriggerRepository) {}

  pushTrade(sample: TradeSample): TriggerOutput {
    const priceZScore = this.priceWindow.zScore(sample.price);
    const volumeZScore = this.volumeWindow.zScore(sample.volume);

    this.priceWindow.push(sample.price);
    this.volumeWindow.push(sample.volume);

    this.latest = evaluateTriggerGate({
      return1m: 0,
      priceZScore,
      volumeZScore,
      oiChangePct: 0,
      fundingRate: 0,
      fundingMean: 0,
      basisPct: 0,
      basisMean: 0,
      liquidationUsd1h: 0,
      liquidationMean: 1,
      xResonance: 0,
    });
    this.repository?.save(this.latest);
    return this.latest;
  }

  getLatest(): TriggerOutput | null {
    return this.repository?.getLatest() ?? this.latest;
  }
}
