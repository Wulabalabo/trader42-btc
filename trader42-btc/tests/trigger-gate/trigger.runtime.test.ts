import { describe, expect, it } from 'vitest';
import { TriggerRuntime } from '../../src/modules/trigger-gate/trigger.runtime.js';

describe('TriggerRuntime', () => {
  it('accumulates windows and emits latest trigger snapshot', () => {
    const runtime = new TriggerRuntime();

    runtime.pushTrade({ price: 100000, volume: 10, timestamp: '2026-04-16T00:00:00.000Z' });

    expect(runtime.getLatest()).not.toBeNull();
    expect(runtime.getLatest()).toMatchObject({ asset: 'BTC' });
  });
});
