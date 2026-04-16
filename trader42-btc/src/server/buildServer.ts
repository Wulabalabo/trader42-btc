import Fastify, { type FastifyInstance } from 'fastify';
import { createPipelineStatus, type ModuleStatus } from '../lib/status.js';
import { StepSnapshotRepository } from '../lib/repositories/stepSnapshotRepository.js';
import { registerRegimeRoutes } from '../modules/market-regime/regime.route.js';
import { registerTriggerRoutes } from '../modules/trigger-gate/trigger.route.js';
import { registerXEventRoutes } from '../modules/x-events/xEvent.route.js';
import { registerTradeAdviceRoutes } from '../modules/trade-advice/tradeAdvice.route.js';

type BuildServerOptions = {
  stepSnapshotRepository?: StepSnapshotRepository;
};

const DEFAULT_MODULES = ['marketRegime', 'driverPool', 'triggerGate', 'xEvents', 'narrativeScoring', 'confirmation', 'tradeAdvice', 'shadowBook', 'weeklyAudit'] as const;

function buildDefaultModules(): Record<string, ModuleStatus> {
  return Object.fromEntries(DEFAULT_MODULES.map((name) => [name, { state: 'idle', lastUpdatedAt: null }])) as Record<string, ModuleStatus>;
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
      };
    }

    const pipeline = createPipelineStatus(modules);

    return {
      service: 'trader42-btc',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      modules: Object.keys(pipeline.modules),
      pipeline,
    };
  });

  await registerRegimeRoutes(server);
  await registerTriggerRoutes(server);
  await registerXEventRoutes(server);
  await registerTradeAdviceRoutes(server);

  return server;
}
