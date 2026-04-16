import { describe, expect, it } from 'vitest';
import { buildNarrativeResponse } from '../../src/modules/narrative/narrative.service.js';

describe('buildNarrativeResponse', () => {
  it('caps actionability when positioning confirmation is missing', () => {
    const result = buildNarrativeResponse({
      events: [
        { id: '1', headline: 'ETF inflow accelerates across desks', event_type: 'ETF', source_tier: 'journalist', first_order_event: true },
        { id: '2', headline: 'BlackRock ETF flow keeps rising', event_type: 'ETF', source_tier: 'journalist', first_order_event: true },
        { id: '3', headline: 'Analysts amplify ETF demand story', event_type: 'ETF', source_tier: 'analyst', first_order_event: true },
        { id: '4', headline: 'Retail starts echoing ETF momentum trade', event_type: 'ETF', source_tier: 'kol', first_order_event: false },
      ],
      firstEventMinutesAgo: 30,
      latestEventMinutesAgo: 5,
      totalUniqueAccounts: 9,
      positioningConfirmation: 0.6,
      marketLinkageConfirmation: 0,
    });

    expect(result.actionability_ceiling).toBe('watch');
  });

  it('raises theme probability for dense first-order narrative clusters', () => {
    const result = buildNarrativeResponse({
      events: [
        { id: '1', headline: 'ETF inflow accelerates across desks', event_type: 'ETF', source_tier: 'journalist', first_order_event: true },
        { id: '2', headline: 'BlackRock ETF flow keeps rising across desks', event_type: 'ETF', source_tier: 'journalist', first_order_event: true },
        { id: '3', headline: 'ETF approval narrative keeps driving BTC spot demand', event_type: 'ETF', source_tier: 'journalist', first_order_event: true },
        { id: '4', headline: 'Analysts amplify ETF demand story for BTC desks', event_type: 'ETF', source_tier: 'analyst', first_order_event: true },
        { id: '5', headline: 'Retail starts echoing ETF momentum trade for BTC', event_type: 'ETF', source_tier: 'kol', first_order_event: false },
      ],
      firstEventMinutesAgo: 30,
      latestEventMinutesAgo: 5,
      totalUniqueAccounts: 8,
      positioningConfirmation: 0.7,
      marketLinkageConfirmation: 0.7,
    });

    expect(result.theme_probability).toBeGreaterThan(0.6);
  });
});
