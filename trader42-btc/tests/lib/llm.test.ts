import { afterEach, describe, expect, it, vi } from 'vitest';
import { LLMGateway } from '../../src/lib/llm.js';

describe('LLMGateway', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses max_completion_tokens for OpenAI gpt-5.4-mini requests', async () => {
    let requestBody: Record<string, unknown> | undefined;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: 'ok' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const gateway = new LLMGateway({
      openaiApiKey: 'sk-test',
      deepseekApiKey: 'sk-test',
    });

    await gateway.complete({
      model: 'openai',
      messages: [{ role: 'user', content: 'Say ok' }],
      maxTokens: 12,
    });

    expect(requestBody).toMatchObject({
      model: 'gpt-5.4-mini',
      max_completion_tokens: 12,
    });
    expect(requestBody).not.toHaveProperty('max_tokens');
  });
});
