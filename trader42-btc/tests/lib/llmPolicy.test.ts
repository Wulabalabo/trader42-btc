import { describe, expect, it } from 'vitest';
import { getStepLlmPolicy } from '../../src/lib/llmPolicy.js';

describe('getStepLlmPolicy', () => {
  it('routes Step 2 and Step 3 to OpenAI first', () => {
    expect(getStepLlmPolicy('step2').model).toBe('openai');
    expect(getStepLlmPolicy('step3').model).toBe('openai');
  });

  it('routes Step 0, Step 1, Step 5, weekly audit to DeepSeek first', () => {
    expect(getStepLlmPolicy('step0').model).toBe('deepseek');
    expect(getStepLlmPolicy('step1').model).toBe('deepseek');
    expect(getStepLlmPolicy('step5').model).toBe('deepseek');
    expect(getStepLlmPolicy('weekly-audit').model).toBe('deepseek');
  });
});
