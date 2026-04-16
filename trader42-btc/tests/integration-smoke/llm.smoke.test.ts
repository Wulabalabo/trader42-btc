import { describe, expect, it } from 'vitest';
import { LLMGateway } from '../../src/lib/llm.js';
import { getStepLlmPolicy } from '../../src/lib/llmPolicy.js';

describe('LLM Gateway smoke tests', { tags: ['smoke'] }, () => {
  const gateway = new LLMGateway({
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? '',
  });

  it('calls deepseek-chat and gets a response', async () => {
    const policy = getStepLlmPolicy('step0');
    const result = await gateway.complete({
      model: policy.model,
      messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
      maxTokens: 10,
      fallback: policy.fallback,
    });
    expect(result.content.toLowerCase()).toContain('ok');
    expect(result.usedModel).toBe('deepseek');
  });

  it('calls gpt-5.4-mini and gets a response', async () => {
    const policy = getStepLlmPolicy('step2');
    const result = await gateway.complete({
      model: policy.model,
      messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
      maxTokens: 10,
      fallback: policy.fallback,
    });
    expect(result.content.toLowerCase()).toContain('ok');
    expect(result.usedModel).toBe('openai');
  });

  it('falls back to deepseek when openai fails', async () => {
    const policy = getStepLlmPolicy('step2');
    const badGateway = new LLMGateway({
      openaiApiKey: 'sk-invalid',
      deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? '',
    });
    const result = await badGateway.complete({
      model: policy.model,
      messages: [{ role: 'user', content: 'Say "ok".' }],
      maxTokens: 10,
      fallback: policy.fallback,
    });
    expect(result.content).toBeTruthy();
    expect(result.usedModel).toBe('deepseek');
  });
});
