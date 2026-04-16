import { DRIVER_CATALOG, DRIVER_CATALOG_BY_KEY } from './driverCatalog.js';
import type { CandidateDriver, DriverScore, DriverStatus } from './driver.types.js';

export function scoreCandidateDrivers(input: {
  features: Record<string, DriverScore>;
  previousDriverKeys: string[];
  topN: number;
}): CandidateDriver[] {
  const catalogOrder = new Map(DRIVER_CATALOG.map((driver, index) => [driver.key, index]));

  return Object.entries(input.features)
    .filter(([key]) => key in DRIVER_CATALOG_BY_KEY)
    .sort((a, b) => {
      const scoreDiff = b[1].relevance - a[1].relevance;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return (catalogOrder.get(a[0]) ?? 999) - (catalogOrder.get(b[0]) ?? 999);
    })
    .slice(0, input.topN)
    .map(([key, score]) => {
      const catalog = DRIVER_CATALOG_BY_KEY[key];
      let status: DriverStatus = 'new';
      if (score.hardness < 0.15) {
        status = 'noisy';
      } else if (input.previousDriverKeys.includes(key)) {
        status = 'continuing';
      }

      return {
        driver: key,
        thesis: catalog.description,
        driver_type: catalog.driverType,
        relevance: Number(score.relevance.toFixed(3)),
        hardness: Number(score.hardness.toFixed(3)),
        historical_hit_rate: catalog.historicalHitRate,
        status,
        watch_signals: catalog.watchSignals,
      };
    });
}
