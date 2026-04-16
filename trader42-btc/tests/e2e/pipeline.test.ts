import { describe, expect, it } from 'vitest';
import { runReplayFixture } from './replayHarness.js';

import etfScenario from '../fixtures/scenarios/2024-01-btc-etf-approval.json';
import fomcScenario from '../fixtures/scenarios/2025-03-fomc-dovish.json';

describe('E2E pipeline: fixture → Step 0 → 1 → 1.5 → 2 → 3 → 4 → 5', () => {
  it('ETF approval scenario → flow-led regime → standard trade advice', async () => {
    const { fixture, regime, driverPool, trigger, validEvents, narrative, confirmation, advice } =
      await runReplayFixture('2024-01-btc-etf-approval.json');
    expect(regime.asset).toBe('BTC');
    expect(regime.market_regime).toBe(fixture.expectedRegime);
    expect(regime.risk_environment).toBe('risk-on');
    expect(trigger.triggered).toBe(true);
    expect(validEvents.length).toBeGreaterThanOrEqual(5);
    expect(narrative.actionability_ceiling).toBe('standard');
    expect(confirmation.tradeability).toBe('actionable');
    expect(advice.advice.asset).toBe('BTC');
    expect(driverPool.candidate_btc_drivers[0].driver).toBe(etfScenario.expectedTopDriver);
    expect(advice.advice.tradeability).toBe(etfScenario.expectedTradeAdvice);
    expect(advice.advice.direction).toBe(etfScenario.expectedDirection);
    expect(advice.advice.risk_budget).toBeGreaterThan(0);
    expect(advice.advice.review_required).toBe(true);
    expect(advice.shadowTrade?.asset).toBe('BTC');
  });

  it('FOMC dovish scenario → macro-led regime → standard trade advice', async () => {
    const { fixture, regime, driverPool, trigger, validEvents, narrative, confirmation, advice } =
      await runReplayFixture('2025-03-fomc-dovish.json');
    expect(regime.asset).toBe('BTC');
    expect(regime.market_regime).toBe(fixture.expectedRegime);
    expect(regime.risk_environment).toBe('risk-on');
    expect(trigger.triggered).toBe(true);
    expect(validEvents.length).toBeGreaterThanOrEqual(5);
    expect(narrative.actionability_ceiling).toBe('standard');
    expect(confirmation.tradeability).toBe('actionable');
    expect(advice.advice.asset).toBe('BTC');
    expect(driverPool.candidate_btc_drivers[0].driver).toBe(fomcScenario.expectedTopDriver);
    expect(advice.advice.tradeability).toBe(fomcScenario.expectedTradeAdvice);
    expect(advice.advice.direction).toBe(fomcScenario.expectedDirection);
    expect(advice.advice.risk_budget).toBeGreaterThan(0);
  });
});
