import Fastify, { type FastifyInstance } from 'fastify';
import { createPipelineStatus, type ModuleStatus } from '../lib/status.js';
import { StepSnapshotRepository } from '../lib/repositories/stepSnapshotRepository.js';
import { registerDriverPoolRoutes } from '../modules/driver-pool/driver.route.js';
import { registerRegimeRoutes } from '../modules/market-regime/regime.route.js';
import { registerNarrativeRoutes } from '../modules/narrative/narrative.route.js';
import { registerConfirmationRoutes } from '../modules/confirmation/confirmation.route.js';
import { registerShadowBookRoutes } from '../modules/shadow-book/shadowBook.route.js';
import { registerWeeklyAuditRoutes } from '../modules/shadow-book/weeklyAudit.route.js';
import { registerTriggerRoutes } from '../modules/trigger-gate/trigger.route.js';
import { registerXEventRoutes } from '../modules/x-events/xEvent.route.js';
import { registerTradeAdviceRoutes } from '../modules/trade-advice/tradeAdvice.route.js';

type BuildServerOptions = {
  stepSnapshotRepository?: StepSnapshotRepository;
  now?: () => Date;
};

const DEFAULT_MODULES = ['marketRegime', 'driverPool', 'triggerGate', 'xEvents', 'narrativeScoring', 'confirmation', 'tradeAdvice', 'shadowBook', 'weeklyAudit'] as const;

function buildDefaultModules(): Record<string, ModuleStatus> {
  return Object.fromEntries(DEFAULT_MODULES.map((name) => [name, { state: 'idle', lastUpdatedAt: null }])) as Record<string, ModuleStatus>;
}

function extractReason(payloadJson: string | null): string | null {
  if (!payloadJson) {
    return null;
  }

  try {
    const payload = JSON.parse(payloadJson) as { reason?: string };
    return payload.reason ?? null;
  } catch {
    return null;
  }
}

export async function buildServer(options: BuildServerOptions = {}): Promise<FastifyInstance> {
  const server = Fastify({ logger: true });

  server.get('/health', async () => ({ status: 'ok' }));

  server.get('/api/v1/status', async () => {
    const modules = buildDefaultModules();

    for (const snapshot of options.stepSnapshotRepository?.listLatest() ?? []) {
      modules[snapshot.stepKey] = {
        state: snapshot.moduleState,
        lastUpdatedAt: snapshot.lastUpdatedAt,
        reason: extractReason(snapshot.payloadJson),
      };
    }

    const pipeline = createPipelineStatus(modules, { now: options.now?.() });

    return {
      service: 'trader42-btc',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      modules: Object.keys(pipeline.modules),
      pipeline,
    };
  });

  await registerRegimeRoutes(server);
  await registerDriverPoolRoutes(server);
  await registerTriggerRoutes(server);
  await registerXEventRoutes(server);
  await registerNarrativeRoutes(server);
  await registerConfirmationRoutes(server);
  await registerTradeAdviceRoutes(server);
  await registerShadowBookRoutes(server);
  await registerWeeklyAuditRoutes(server, options.stepSnapshotRepository);

  return server;
}
