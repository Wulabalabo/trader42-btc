import { describe, expect, it } from 'vitest';
import { buildWeeklyAuditPrompt } from '../../src/modules/shadow-book/weeklyAudit.prompt.js';
import { runWeeklyAudit } from '../../src/modules/shadow-book/weeklyAudit.service.js';

describe('weekly shadow-book audit', () => {
  it('asks for false positives, best signals, and threshold adjustments', () => {
    const prompt = buildWeeklyAuditPrompt([]);
    expect(prompt).toContain('false positives');
    expect(prompt).toContain('threshold adjustments');
  });

  it('summarizes false positives and best signals from shadow trades', () => {
    const report = runWeeklyAudit([
      {
        shadow_trade_id: 's1',
        trade_advice_id: 'a1',
        asset: 'BTC',
        direction: 'long',
        entry_time: '2026-04-10T00:00:00.000Z',
        entry_price: 95000,
        stop_price: 93000,
        target_price: 99000,
        time_horizon: 'eod',
        expected_path: 'higher',
        actual_path: 'stopped',
        outcome: 'lose',
        failure_tag: 'false-positive',
      },
      {
        shadow_trade_id: 's2',
        trade_advice_id: 'a2',
        asset: 'BTC',
        direction: 'long',
        entry_time: '2026-04-11T00:00:00.000Z',
        entry_price: 96000,
        stop_price: 94000,
        target_price: 100000,
        time_horizon: 'eod',
        expected_path: 'higher',
        actual_path: 'target hit',
        outcome: 'win',
        failure_tag: 'good-call',
      },
    ]);

    expect(report.falsePositivesTop5[0].shadow_trade_id).toBe('s1');
    expect(report.bestSignalsTop5[0].shadow_trade_id).toBe('s2');
    expect(report.summary).toContain('threshold');
  });
});
