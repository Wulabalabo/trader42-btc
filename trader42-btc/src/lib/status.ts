export type ModuleState = 'healthy' | 'degraded' | 'idle';

export type ModuleStatus = {
  state: ModuleState;
  lastUpdatedAt: string | null;
};

export type PipelineStatus = {
  overall: ModuleState;
  modules: Record<string, ModuleStatus>;
};

export function createPipelineStatus(modules: Record<string, ModuleStatus>): PipelineStatus {
  const states = Object.values(modules).map((item) => item.state);

  let overall: ModuleState = 'idle';
  if (states.includes('degraded')) {
    overall = 'degraded';
  } else if (states.includes('healthy')) {
    overall = 'healthy';
  }

  return { overall, modules };
}
