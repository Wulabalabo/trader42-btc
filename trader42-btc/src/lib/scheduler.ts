import cron, { type ScheduledTask } from 'node-cron';

export type RegisteredJob = {
  name: string;
  expr: string;
  task: ScheduledTask;
};

const jobs: RegisteredJob[] = [];

export function registerJob(
  expr: string,
  fn: () => Promise<void> | void,
  name = `job-${jobs.length + 1}`,
): ScheduledTask {
  const task = cron.schedule(expr, () => void fn(), { scheduled: false });
  jobs.push({ name, expr, task });
  return task;
}

export function listRegisteredJobs(): RegisteredJob[] {
  return [...jobs];
}

export function startRegisteredJobs(): void {
  for (const job of jobs) {
    job.task.start();
  }
}

export function stopRegisteredJobs(): void {
  for (const job of jobs) {
    job.task.stop();
  }
}
