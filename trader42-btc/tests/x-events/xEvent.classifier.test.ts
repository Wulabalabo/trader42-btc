import { describe, expect, it } from 'vitest';
import { classifyXEventRule } from '../../src/modules/x-events/xEvent.classifier.js';

describe('classifyXEventRule', () => {
  it('classifies SEC filing tweet as regulation + first-order', () => {
    const result = classifyXEventRule({
      cleanedText: 'SEC files official amendment to BTC spot ETF rule change',
      sourceTier: 'official',
      isFirstOrderCandidate: true,
    });
    expect(result.event_type).toBe('regulation');
    expect(result.first_order_event).toBe(true);
    expect(result.source_credibility_score).toBeGreaterThan(0.8);
  });

  it('classifies ETF flow report as ETF event with bullish bias', () => {
    const result = classifyXEventRule({
      cleanedText: 'IBIT saw $450M inflow today, largest since January',
      sourceTier: 'journalist',
      isFirstOrderCandidate: true,
    });
    expect(result.event_type).toBe('ETF');
    expect(result.btc_bias).toBe('bullish');
  });

  it('classifies KOL commentary as second-order with lower credibility', () => {
    const result = classifyXEventRule({
      cleanedText: 'I think BTC is going to 200k because institutions keep buying',
      sourceTier: 'kol',
      isFirstOrderCandidate: false,
    });
    expect(result.first_order_event).toBe(false);
    expect(result.source_credibility_score).toBeLessThan(0.5);
  });

  it('classifies FOMC tweet as macro event', () => {
    const result = classifyXEventRule({
      cleanedText: 'FOMC decides to cut rate by 50bp, largest cut since 2008',
      sourceTier: 'journalist',
      isFirstOrderCandidate: true,
    });
    expect(result.event_type).toBe('macro');
  });

  it('classifies hack as security with high urgency', () => {
    const result = classifyXEventRule({
      cleanedText: 'Major exchange hack: $200M in BTC stolen from hot wallets',
      sourceTier: 'journalist',
      isFirstOrderCandidate: true,
    });
    expect(result.event_type).toBe('security');
    expect(result.urgency).toBe(3);
    expect(result.btc_bias).toBe('bearish');
  });

  it('returns unknown for unclassifiable text', () => {
    const result = classifyXEventRule({
      cleanedText: 'Just had a great lunch today',
      sourceTier: 'kol',
      isFirstOrderCandidate: false,
    });
    expect(result.event_type).toBe('unknown');
  });
});
