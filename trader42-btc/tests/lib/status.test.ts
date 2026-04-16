import { describe, expect, it } from 'vitest';
import { createPipelineStatus } from '../../src/lib/status.js';

describe('createPipelineStatus', () => {
  it('reports degraded modules and freshness', () => {
    const result = createPipelineStatus({
      marketRegime: { state: 'healthy', lastUpdatedAt: '2026-04-16T00:00:00.000Z' },
      xEvents: { state: 'degraded', lastUpdatedAt: null },
    });

    expect(result.overall).toBe('degraded');
    expect(result.modules.xEvents.state).toBe('degraded');
    expect(result.modules.marketRegime.lastUpdatedAt).toBe('2026-04-16T00:00:00.000Z');
  });
});
