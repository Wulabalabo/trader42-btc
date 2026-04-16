import { describe, expect, it } from 'vitest';
import { buildXEventPrompt } from '../../src/modules/x-events/xEvent.prompt.js';

describe('buildXEventPrompt', () => {
  it('asks for strict JSON with first-order and btc bias fields', () => {
    const prompt = buildXEventPrompt('SEC approves ETF');

    expect(prompt).toContain('first_order_event');
    expect(prompt).toContain('btc_bias');
    expect(prompt).toContain('strict JSON');
  });
});
