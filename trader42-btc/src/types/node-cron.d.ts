declare module 'node-cron' {
  export interface ScheduledTask {
    start(): void;
    stop(): void;
  }

  export interface ScheduleOptions {
    scheduled?: boolean;
    timezone?: string;
    name?: string;
  }

  export function schedule(
    expression: string,
    func: () => void,
    options?: ScheduleOptions,
  ): ScheduledTask;

  const cron: {
    schedule: typeof schedule;
  };

  export default cron;
}
