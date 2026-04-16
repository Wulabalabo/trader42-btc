import { describe, expect, it } from 'vitest';
import { runReplayFixture } from './replayHarness.js';

describe('full pipeline replay coverage', () => {
  it('carry-trade unwind produces a macro risk-off short setup', async () => {
    const { fixture, regime, driverPool, advice } = await runReplayFixture('2024-08-carry-trade-unwind.json');
    expect(fixture.name).toContain('Carry');
    expect(regime.market_regime).toBe(fixture.expectedRegime);
    expect(driverPool.candidate_btc_drivers[0].driver).toBe(fixture.expectedTopDriver);
    expect(advice.advice.tradeability).toBe(fixture.expectedTradeAdvice);
    expect(advice.advice.direction).toBe(fixture.expectedDirection);
  });

  it('exchange hack degrades into an avoid-level short setup', async () => {
    const { fixture, regime, driverPool, advice } = await runReplayFixture('2025-06-exchange-hack.json');
    expect(fixture.name).toContain('Hack');
    expect(regime.market_regime).toBe(fixture.expectedRegime);
    expect(driverPool.candidate_btc_drivers[0].driver).toBe(fixture.expectedTopDriver);
    expect(advice.advice.tradeability).toBe(fixture.expectedTradeAdvice);
    expect(advice.advice.direction).toBe(fixture.expectedDirection);
  });

  it('narrative-only fakeout never exceeds watch/light before confirmation', async () => {
    const { fixture, regime, driverPool, confirmation, advice } = await runReplayFixture('2026-02-narrative-only-fakeout.json');
    expect(regime.market_regime).toBe(fixture.expectedRegime);
    expect(driverPool.candidate_btc_drivers[0].driver).toBe(fixture.expectedTopDriver);
    expect(advice.advice.tradeability).toBe(fixture.expectedTradeAdvice);
    expect(advice.advice.direction).toBe(fixture.expectedDirection);
    expect(confirmation.confirmation_mode).not.toBe('breakout');
  });
});
