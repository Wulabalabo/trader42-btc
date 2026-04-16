import type { NarrativeEventInput, ThemeCluster } from './narrative.types.js';

const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'new', 'hits']);

function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}

function keywordOverlap(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / Math.max(a.size, b.size, 1);
}

export function clusterByKeywordOverlap(
  events: Array<Pick<NarrativeEventInput, 'id' | 'headline' | 'event_type'>>,
  overlapThreshold = 0.2,
): ThemeCluster[] {
  if (events.length === 0) {
    return [];
  }

  const groups = new Map<string, typeof events>();
  for (const event of events) {
    const list = groups.get(event.event_type) ?? [];
    list.push(event);
    groups.set(event.event_type, list);
  }

  const clusters: ThemeCluster[] = [];
  for (const [eventType, group] of groups.entries()) {
    const assigned = new Set<string>();
    for (const event of group) {
      if (assigned.has(event.id)) {
        continue;
      }

      const cluster = [event];
      assigned.add(event.id);
      const seedKeywords = extractKeywords(event.headline);

      for (const candidate of group) {
        if (assigned.has(candidate.id)) {
          continue;
        }
        if (keywordOverlap(seedKeywords, extractKeywords(candidate.headline)) >= overlapThreshold) {
          cluster.push(candidate);
          assigned.add(candidate.id);
        }
      }

      clusters.push({
        theme: `${eventType.toUpperCase()}: ${cluster[0].headline.slice(0, 60)}`,
        eventIds: cluster.map((item) => item.id),
        eventType,
        size: cluster.length,
      });
    }
  }

  return clusters;
}
