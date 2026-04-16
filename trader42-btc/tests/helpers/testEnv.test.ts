import { describe, expect, it } from 'vitest';
import { buildEnv } from '../../src/config/env.js';

describe('env', () => {
  it('requires core connection strings', () => {
    expect(() => buildEnv({})).toThrow(/OPENBB_BASE_URL/);
  });

  it('accepts valid env with defaults', () => {
    const env = buildEnv({
      OPENBB_BASE_URL: 'http://localhost:8001',
      AKTOOLS_BASE_URL: 'http://localhost:8002',
      TWITTER_API_KEY: 'test-key',
      OPENAI_API_KEY: 'sk-test',
      DEEPSEEK_API_KEY: 'sk-test',
    });
    expect(env.PORT).toBe(3000);
    expect(env.DB_PATH).toBe('./db/trader42.db');
  });
});
