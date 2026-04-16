import { describe, expect, it } from 'vitest';
import { buildRegimeResponse } from '../../src/modules/market-regime/regime.service.js';
import { evaluateTriggerGate } from '../../src/modules/trigger-gate/trigger.service.js';
import { processRawTweet, resetDedup } from '../../src/modules/x-events/xEvent.service.js';
import { buildTradeAdviceResponse } from '../../src/modules/trade-advice/tradeAdvice.service.js';

import etfScenario from '../fixtures/scenarios/2024-01-btc-etf-approval.json';
import fomcScenario from '../fixtures/scenarios/2025-03-fomc-dovish.json';

describe('E2E pipeline: fixture → Step 0 → 1.5 → 2 → 5', () => {
  it('ETF approval scenario → flow-led regime → standard trade advice', async () => {
    // Step 0: Market regime
    const regime = await buildRegimeResponse(etfScenario.marketSnapshot);
    expect(regime.asset).toBe('BTC');
    expect(regime.market_regime).toBe('flow-led');
    expect(regime.risk_environment).toBe('risk-on');

    // Step 1.5: Trigger gate
    const trigger = evaluateTriggerGate({
      return1m: 3.5,
      priceZScore: 2.8,
      volumeZScore: 3.0,
      oiChangePct: etfScenario.marketSnapshot.oiChangePct,
      fundingRate: etfScenario.marketSnapshot.fundingRate,
      fundingMean: 0.005,
      basisPct: 0.8,
      basisMean: 0.3,
      liquidationUsd1h: 50_000_000,
      liquidationMean: 20_000_000,
      xResonance: 0.8,
    });
    expect(trigger.triggered).toBe(true);

    // Step 2: X event capture
    resetDedup();
    const event = processRawTweet({
      id: 'e2e-001',
      text: 'BREAKING: SEC officially approves first BTC spot ETF. IBIT trading begins tomorrow.',
      userName: 'DeItaone',
      sourceTier: 'journalist',
      createdAt: '2024-01-10T16:00:00Z',
      isRetweet: false,
      isQuote: false,
    });
    expect(event).not.toBeNull();
    expect(event!.event_type).toBe('regulation');
    expect(event!.first_order_event).toBe(true);

    // Step 5: Trade advice
    const advice = buildTradeAdviceResponse({
      regime: regime.risk_environment,
      topDriver: { name: regime.primary_drivers[0], direction: 'long', score: 0.7 },
      triggerFired: trigger.triggered,
      narrativeStage: 'spreading',
      narrativeCeiling: 'standard',
      confirmationMode: 'breakout',
      confirmationTradeability: 'actionable',
      positioningHeat: 0.25,
      continuationProbability: 0.6,
      entryQuality: 0.7,
    });
    expect(advice.asset).toBe('BTC');
    expect(advice.trade_level).toBe('standard');
    expect(advice.direction).toBe('long');
    expect(advice.risk_budget_pct).toBeGreaterThan(0);
    expect(advice.review_required).toBe(true);
  });

  it('FOMC dovish scenario → macro-led regime → standard trade advice', async () => {
    // Step 0: Market regime
    const regime = await buildRegimeResponse(fomcScenario.marketSnapshot);
    expect(regime.asset).toBe('BTC');
    expect(regime.market_regime).toBe('macro-led');
    expect(regime.risk_environment).toBe('risk-on');

    // Step 1.5: Trigger gate
    const trigger = evaluateTriggerGate({
      return1m: 2.0,
      priceZScore: 2.2,
      volumeZScore: 1.5,
      oiChangePct: fomcScenario.marketSnapshot.oiChangePct,
      fundingRate: fomcScenario.marketSnapshot.fundingRate,
      fundingMean: 0.005,
      basisPct: 0.4,
      basisMean: 0.3,
      liquidationUsd1h: 10_000_000,
      liquidationMean: 20_000_000,
      xResonance: 0.6,
    });
    expect(trigger.triggered).toBe(true);

    // Step 2: X event capture
    resetDedup();
    const event = processRawTweet({
      id: 'e2e-fomc-001',
      text: 'FOMC DECISION: Fed cuts rate by 50bp, signals more cuts ahead. Dovish statement.',
      userName: 'NickTimiraos',
      sourceTier: 'journalist',
      createdAt: '2025-03-19T18:00:00Z',
      isRetweet: false,
      isQuote: false,
    });
    expect(event).not.toBeNull();
    expect(event!.event_type).toBe('macro');
    expect(event!.btc_bias).toBe('bullish');

    // Step 5: Trade advice
    const advice = buildTradeAdviceResponse({
      regime: regime.risk_environment,
      topDriver: { name: regime.primary_drivers[0], direction: 'long', score: 0.75 },
      triggerFired: trigger.triggered,
      narrativeStage: 'spreading',
      narrativeCeiling: 'standard',
      confirmationMode: 'followthrough',
      confirmationTradeability: 'actionable',
      positioningHeat: 0.15,
      continuationProbability: 0.65,
      entryQuality: 0.7,
    });
    expect(advice.asset).toBe('BTC');
    expect(advice.trade_level).toBe('standard');
    expect(advice.direction).toBe('long');
    expect(advice.risk_budget_pct).toBeGreaterThan(0);
  });
});
