export type ModuleState = 'healthy' | 'degraded' | 'idle';

export type ModuleStatus = {
  state: ModuleState;
  lastUpdatedAt: string | null;
  freshnessSec?: number | null;
  staleAfterSec?: number | null;
  reason?: string | null;
};

export type PipelineStatus = {
  overall: ModuleState;
  modules: Record<string, ModuleStatus>;
};

export const DEFAULT_STALE_AFTER_SEC: Record<string, number> = {
  marketRegime: 1800,
  driverPool: 1800,
  triggerGate: 300,
  xEvents: 300,
  narrativeScoring: 900,
  confirmation: 900,
  tradeAdvice: 900,
  shadowBook: 86400,
  weeklyAudit: 604800,
};

export function createPipelineStatus(
  modules: Record<string, ModuleStatus>,
  options: { now?: Date; staleAfterSecByModule?: Record<string, number> } = {},
): PipelineStatus {
  const now = options.now ?? new Date();
  const staleAfterSecByModule = options.staleAfterSecByModule ?? DEFAULT_STALE_AFTER_SEC;
  const computedModules = Object.fromEntries(
    Object.entries(modules).map(([name, status]) => {
      const staleAfterSec = staleAfterSecByModule[name] ?? null;
      const freshnessSec =
        status.lastUpdatedAt != null
          ? Math.max(0, Math.round((now.getTime() - new Date(status.lastUpdatedAt).getTime()) / 1000))
          : null;

      let state = status.state;
      let reason = status.reason ?? null;
      if (
        state === 'healthy' &&
        freshnessSec != null &&
        staleAfterSec != null &&
        freshnessSec > staleAfterSec
      ) {
        state = 'degraded';
        reason = `stale snapshot: ${freshnessSec}s old`;
      }

      return [
        name,
        {
          ...status,
          state,
          freshnessSec,
          staleAfterSec,
          reason,
        },
      ];
    }),
  ) as Record<string, ModuleStatus>;

  const states = Object.values(computedModules).map((item) => item.state);

  let overall: ModuleState = 'idle';
  if (states.includes('degraded')) {
    overall = 'degraded';
  } else if (states.includes('healthy')) {
    overall = 'healthy';
  }

  return { overall, modules: computedModules };
}
