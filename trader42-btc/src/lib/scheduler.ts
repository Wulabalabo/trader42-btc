import cron, { type ScheduledTask } from 'node-cron';

export function registerJob(expr: string, fn: () => Promise<void> | void): ScheduledTask {
  return cron.schedule(expr, () => void fn(), { scheduled: false });
}
