import { describe, expect, it } from 'vitest';
import { registerJob } from '../../src/lib/scheduler.js';

describe('registerJob', () => {
  it('returns a controllable cron task', () => {
    const task = registerJob('* * * * *', () => {});

    expect(typeof task.start).toBe('function');
    expect(typeof task.stop).toBe('function');

    task.stop();
  });
});
