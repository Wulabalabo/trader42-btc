import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('.env.example parity', () => {
  it('documents DATA_PROXY_URL and DATA_PROXY_TOKEN', () => {
    const file = readFileSync(resolve(import.meta.dirname, '../../.env.example'), 'utf8');

    expect(file).toMatch(/DATA_PROXY_URL=/);
    expect(file).toMatch(/DATA_PROXY_TOKEN=/);
    expect(file).not.toMatch(/OPENBB_BASE_URL=/);
    expect(file).not.toMatch(/AKTOOLS_BASE_URL=/);
  });
});
