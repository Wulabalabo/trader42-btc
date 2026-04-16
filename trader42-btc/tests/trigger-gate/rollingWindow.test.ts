import { describe, expect, it } from 'vitest';
import { RollingWindow } from '../../src/lib/rollingWindow.js';

describe('RollingWindow', () => {
  it('computes mean and std over a fixed window', () => {
    const w = new RollingWindow(5);
    [10, 12, 11, 13, 14].forEach((v) => w.push(v));
    expect(w.mean()).toBeCloseTo(12, 0);
    expect(w.std()).toBeGreaterThan(1);
  });

  it('evicts old values when window is full', () => {
    const w = new RollingWindow(3);
    [1, 2, 3, 100].forEach((v) => w.push(v));
    expect(w.mean()).toBeCloseTo(35, 0); // (2+3+100)/3
  });

  it('returns 0 std when window has < 2 values', () => {
    const w = new RollingWindow(10);
    w.push(5);
    expect(w.std()).toBe(0);
  });

  it('computes z-score correctly', () => {
    const w = new RollingWindow(100);
    for (let i = 0; i < 100; i++) w.push(50 + Math.random() * 2 - 1);
    expect(Math.abs(w.zScore(50))).toBeLessThan(1);
    expect(Math.abs(w.zScore(60))).toBeGreaterThan(3);
  });
});
