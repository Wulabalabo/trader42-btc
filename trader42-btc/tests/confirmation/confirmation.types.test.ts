import { describe, expect, it } from 'vitest';
import { serializeConfirmation } from '../../src/modules/confirmation/confirmation.types.js';

describe('serializeConfirmation', () => {
  it('returns the complete Step 4 contract', () => {
    const result = serializeConfirmation();

    expect(result.asset).toBe('BTC');
    expect(result).toHaveProperty('confirmation_mode');
    expect(result).toHaveProperty('spot_confirmation');
    expect(result).toHaveProperty('perp_confirmation');
    expect(result).toHaveProperty('ETF_confirmation');
    expect(result).toHaveProperty('positioning_heat');
    expect(result).toHaveProperty('crowding_adjustment');
    expect(result).toHaveProperty('continuation_probability');
    expect(result).toHaveProperty('entry_quality');
    expect(result).toHaveProperty('payoff_asymmetry');
    expect(result).toHaveProperty('tradeability');
  });
});
