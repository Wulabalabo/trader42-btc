import { buildServer } from './server/buildServer.js';
import { buildEnv } from './config/env.js';
import { initDb } from './lib/db.js';
import { StepSnapshotRepository } from './lib/repositories/stepSnapshotRepository.js';
import { registerJob, startRegisteredJobs } from './lib/scheduler.js';
import { defaultShadowBookRepository } from './modules/shadow-book/shadowBook.route.js';
import { runWeeklyAudit } from './modules/shadow-book/weeklyAudit.service.js';
import { setLatestWeeklyAudit } from './modules/shadow-book/weeklyAudit.route.js';

const env = buildEnv(process.env);
const db = initDb(env.DB_PATH);
const stepSnapshotRepository = new StepSnapshotRepository(db);

function saveModuleSnapshot(
  stepKey: string,
  moduleState: 'healthy' | 'degraded',
  payloadJson: string | null = null,
): void {
  stepSnapshotRepository.save({
    stepKey,
    moduleState,
    lastUpdatedAt: new Date().toISOString(),
    payloadJson,
  });
}

registerJob(
  '*/30 * * * *',
  () =>
    saveModuleSnapshot(
      'marketRegime',
      'degraded',
      JSON.stringify({ reason: 'scheduled placeholder: live market regime refresh not wired yet' }),
    ),
  'refreshMarketRegime',
);
registerJob(
  '*/1 * * * *',
  () =>
    saveModuleSnapshot(
      'xEvents',
      'degraded',
      JSON.stringify({ reason: 'scheduled placeholder: live Twitter polling not wired yet' }),
    ),
  'pollTwitterSources',
);
registerJob(
  '0 0 * * 0',
  () => {
    const report = runWeeklyAudit(defaultShadowBookRepository.listLatest());
    setLatestWeeklyAudit(report);
    stepSnapshotRepository.save({
      stepKey: 'weeklyAudit',
      moduleState: 'healthy',
      lastUpdatedAt: report.generatedAt,
      payloadJson: JSON.stringify(report),
    });
  },
  'runWeeklyAudit',
);

startRegisteredJobs();

const server = await buildServer({ stepSnapshotRepository });

server.listen({ port: env.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`trader42-btc listening on ${address}`);
});
