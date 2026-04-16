import { describe, expect, it } from 'vitest';
import { DRIVER_CATALOG } from '../../src/modules/driver-pool/driverCatalog.js';

describe('DRIVER_CATALOG', () => {
  it('contains all 8 MVP drivers from the product spec', () => {
    const keys = DRIVER_CATALOG.map((item) => item.key);

    expect(keys).toContain('fed-rates');
    expect(keys).toContain('etf-flow');
    expect(keys).toContain('positioning-squeeze');
    expect(keys).toContain('regulation-event');
    expect(keys).toContain('institution-reserve');
    expect(keys).toContain('safe-haven-geopolitics');
    expect(keys).toContain('onchain-supply');
    expect(keys).toContain('narrative-unconfirmed');
    expect(DRIVER_CATALOG).toHaveLength(8);
  });

  it('each driver has type, data sources, and description', () => {
    for (const driver of DRIVER_CATALOG) {
      expect(driver).toHaveProperty('key');
      expect(driver).toHaveProperty('driverType');
      expect(driver).toHaveProperty('dataSources');
      expect(driver).toHaveProperty('description');
      expect(Array.isArray(driver.dataSources)).toBe(true);
    }
  });
});
