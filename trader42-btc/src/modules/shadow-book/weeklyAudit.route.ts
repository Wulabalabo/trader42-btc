import type { FastifyInstance } from 'fastify';
import type { StepSnapshotRepository } from '../../lib/repositories/stepSnapshotRepository.js';
import { defaultShadowBookRepository } from './shadowBook.route.js';
import { runWeeklyAudit, type WeeklyAuditReport } from './weeklyAudit.service.js';

let latestWeeklyAudit: WeeklyAuditReport | null = null;

export function setLatestWeeklyAudit(report: WeeklyAuditReport): void {
  latestWeeklyAudit = report;
}

function persistWeeklyAudit(
  report: WeeklyAuditReport,
  stepSnapshotRepository?: StepSnapshotRepository,
): void {
  latestWeeklyAudit = report;
  stepSnapshotRepository?.save({
    stepKey: 'weeklyAudit',
    moduleState: 'healthy',
    lastUpdatedAt: report.generatedAt,
    payloadJson: JSON.stringify(report),
  });
}

function hydrateWeeklyAudit(stepSnapshotRepository?: StepSnapshotRepository): WeeklyAuditReport | null {
  if (latestWeeklyAudit) {
    return latestWeeklyAudit;
  }

  const snapshot = stepSnapshotRepository?.listLatest().find((item) => item.stepKey === 'weeklyAudit');
  if (!snapshot?.payloadJson) {
    return null;
  }

  latestWeeklyAudit = JSON.parse(snapshot.payloadJson) as WeeklyAuditReport;
  return latestWeeklyAudit;
}

export async function registerWeeklyAuditRoutes(
  server: FastifyInstance,
  stepSnapshotRepository?: StepSnapshotRepository,
) {
  server.get('/api/v1/shadow-book/weekly-audit', async () => ({ report: hydrateWeeklyAudit(stepSnapshotRepository) }));

  server.post('/api/v1/shadow-book/weekly-audit', async () => {
    const report = runWeeklyAudit(defaultShadowBookRepository.listLatest());
    persistWeeklyAudit(report, stepSnapshotRepository);
    return report;
  });
}
