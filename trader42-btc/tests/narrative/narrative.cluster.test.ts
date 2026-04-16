import { describe, expect, it } from 'vitest';
import { clusterByKeywordOverlap } from '../../src/modules/narrative/narrative.cluster.js';

describe('clusterByKeywordOverlap', () => {
  it('groups ETF-related headlines into one cluster', () => {
    const events = [
      { id: '1', headline: 'IBIT sees record $500M inflow', event_type: 'ETF' },
      { id: '2', headline: 'BlackRock ETF inflow hits new high', event_type: 'ETF' },
      { id: '3', headline: 'Fed holds rates steady, no surprises', event_type: 'macro' },
    ];

    const clusters = clusterByKeywordOverlap(events);
    expect(clusters.length).toBe(2);
    const etfCluster = clusters.find((cluster) => cluster.theme.includes('ETF'));
    expect(etfCluster!.eventIds).toContain('1');
    expect(etfCluster!.eventIds).toContain('2');
    expect(etfCluster!.eventIds).not.toContain('3');
  });
});
