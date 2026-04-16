import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildConfirmationResponse } from '../../src/modules/confirmation/confirmation.service.js';
import { buildDriverPoolResponse } from '../../src/modules/driver-pool/driver.service.js';
import { buildRegimeResponse } from '../../src/modules/market-regime/regime.service.js';
import { buildNarrativeResponse } from '../../src/modules/narrative/narrative.service.js';
import { evaluateTriggerGate } from '../../src/modules/trigger-gate/trigger.service.js';
import { processRawTweet, resetDedup } from '../../src/modules/x-events/xEvent.service.js';
import { buildTradeAdviceResponse } from '../../src/modules/trade-advice/tradeAdvice.service.js';

export type ReplayFixture = {
  name: string;
  marketSnapshot: {
    dxyChange: number;
    nqChangePct: number;
    etfNetFlowUsd: number;
    oiChangePct: number;
    fundingRate: number;
    liquidationIntensity: number;
    volumeChangePct: number;
  };
  replay: {
    driverPool: {
      previousDriverKeys?: string[];
      macroEvents?: Array<{ type: string; hoursUntil: number }>;
      topN?: number;
    };
    triggerInput: {
      return1m: number;
      priceZScore: number;
      volumeZScore: number;
      fundingMean: number;
      basisPct: number;
      basisMean: number;
      liquidationUsd1h: number;
      liquidationMean: number;
      xResonance: number;
    };
    xEvents: Array<{
      id: string;
      text: string;
      userName: string;
      sourceTier: 'official' | 'journalist' | 'analyst' | 'kol';
      createdAt: string;
      isRetweet: boolean;
      isQuote: boolean;
    }>;
    narrativeInput: {
      firstEventMinutesAgo: number;
      latestEventMinutesAgo: number;
      totalUniqueAccounts: number;
      positioningConfirmation: number;
      marketLinkageConfirmation?: number;
    };
    confirmationInput: {
      priceChange5m: number;
      priceChange1h: number;
      volumeChange: number;
      basisPct: number;
      spotVsPerp: number;
    };
    referencePrice: number;
  };
  expectedRegime: string;
  expectedTopDriver: string;
  expectedTradeAdvice: 'ignore' | 'watch' | 'light' | 'standard' | 'avoid';
  expectedDirection?: 'long' | 'short' | 'observe';
};

export function loadReplayFixture(file: string): ReplayFixture {
  return JSON.parse(
    readFileSync(resolve(import.meta.dirname, `../fixtures/scenarios/${file}`), 'utf8'),
  ) as ReplayFixture;
}

export async function runReplayFixture(file: string) {
  const fixture = loadReplayFixture(file);
  const regime = await buildRegimeResponse(fixture.marketSnapshot);
  const driverPool = buildDriverPoolResponse({
    marketRegime: regime.market_regime,
    etfNetFlowUsd: fixture.marketSnapshot.etfNetFlowUsd,
    oiChangePct: fixture.marketSnapshot.oiChangePct,
    fundingRate: fixture.marketSnapshot.fundingRate,
    liquidationIntensity: fixture.marketSnapshot.liquidationIntensity,
    upcomingMacroEvents: fixture.replay.driverPool.macroEvents ?? [],
    previousDriverKeys: fixture.replay.driverPool.previousDriverKeys ?? [],
    topN: fixture.replay.driverPool.topN ?? 3,
  });
  const trigger = evaluateTriggerGate({
    oiChangePct: fixture.marketSnapshot.oiChangePct,
    fundingRate: fixture.marketSnapshot.fundingRate,
    ...fixture.replay.triggerInput,
  });

  resetDedup();
  const events = [];
  for (const event of fixture.replay.xEvents) {
    events.push(
      await processRawTweet({
        ...event,
      }),
    );
  }
  const validEvents = events.filter((event) => event !== null);
  const narrative = buildNarrativeResponse({
    events: validEvents,
    ...fixture.replay.narrativeInput,
  });
  const confirmation = buildConfirmationResponse({
    ...fixture.replay.confirmationInput,
    etfNetFlowUsd: fixture.marketSnapshot.etfNetFlowUsd,
    oiChangePct: fixture.marketSnapshot.oiChangePct,
    fundingRate: fixture.marketSnapshot.fundingRate,
    liquidationIntensity: fixture.marketSnapshot.liquidationIntensity,
    narrativeCeiling: narrative.actionability_ceiling,
  });
  const advice = buildTradeAdviceResponse({
    regime: {
      market_regime: regime.market_regime,
      risk_environment: regime.risk_environment,
    },
    driverPool,
    trigger: { triggered: trigger.triggered },
    narrative,
    confirmation,
    xEvents: validEvents.map((event) => ({ btc_bias: event.btc_bias })),
    referencePrice: fixture.replay.referencePrice,
  });

  return { fixture, regime, driverPool, trigger, validEvents, narrative, confirmation, advice };
}
