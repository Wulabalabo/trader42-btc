import { describe, expect, it } from 'vitest';
import { buildEnv } from '../../src/config/env.js';

describe('env', () => {
  it('requires core connection strings', () => {
    expect(() => buildEnv({})).toThrow(/DATA_PROXY_URL/);
  });

  it('accepts valid env with defaults', () => {
    const env = buildEnv({
      DATA_PROXY_URL: 'http://localhost:8088',
      DATA_PROXY_TOKEN: 'test-token',
      TWITTER_API_KEY: 'test-key',
      OPENAI_API_KEY: 'sk-test',
      DEEPSEEK_API_KEY: 'sk-test',
    });
    expect(env.PORT).toBe(3000);
    expect(env.DB_PATH).toBe('./db/trader42.db');
  });
});
