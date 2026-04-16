import { describe, expect, it } from 'vitest';
import { classifyMarketRegime } from '../../src/modules/market-regime/regime.classifier.js';

describe('classifyMarketRegime', () => {
  it('returns flow-led when flow dominates clearly', () => {
    const result = classifyMarketRegime({
      macroPressure: 0.2,
      flowPressure: 0.85,
      positioningPressure: 0.3,
      eventPressure: 0,
    });
    expect(result.market_regime).toBe('flow-led');
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it('returns mixed when top two pressures are close (delta < 0.15)', () => {
    const result = classifyMarketRegime({
      macroPressure: 0.55,
      flowPressure: 0.50,
      positioningPressure: 0.2,
      eventPressure: 0.1,
    });
    expect(result.market_regime).toBe('mixed');
  });

  it('returns mixed when all pressures are low (< 0.3)', () => {
    const result = classifyMarketRegime({
      macroPressure: 0.1,
      flowPressure: 0.15,
      positioningPressure: 0.05,
      eventPressure: 0,
    });
    expect(result.market_regime).toBe('mixed');
    expect(result.confidence).toBeLessThan(0.4);
  });

  it('lists primary and secondary drivers in order', () => {
    const result = classifyMarketRegime({
      macroPressure: 0.8,
      flowPressure: 0.5,
      positioningPressure: 0.3,
      eventPressure: 0.1,
    });
    expect(result.primary_drivers[0]).toBe('macro');
    expect(result.secondary_drivers[0]).toBe('flow');
  });

  it('returns positioning-led when positioning dominates', () => {
    const result = classifyMarketRegime({
      macroPressure: 0.1,
      flowPressure: 0.2,
      positioningPressure: 0.9,
      eventPressure: 0.1,
    });
    expect(result.market_regime).toBe('positioning-led');
  });
});
