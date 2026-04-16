import { describe, expect, it } from 'vitest';
import { parseJsonCompletion } from '../../src/lib/llmJson.js';

describe('parseJsonCompletion', () => {
  it('parses structured JSON content', () => {
    const result = parseJsonCompletion<{ ok: boolean; score: number }>(' {"ok": true, "score": 0.8} ');

    expect(result).toEqual({ ok: true, score: 0.8 });
  });
});
