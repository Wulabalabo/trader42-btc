import { parseJsonCompletion } from './llmJson.js';
import { getStepLlmPolicy, type StepLlmKey } from './llmPolicy.js';

export interface LLMConfig {
  openaiApiKey: string;
  deepseekApiKey: string;
}

export type LLMProvider = 'openai' | 'deepseek';

export interface CompletionRequest {
  model: LLMProvider;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  fallback?: LLMProvider;
}

export interface CompletionResponse {
  content: string;
  usedModel: LLMProvider;
  inputTokens: number;
  outputTokens: number;
}

const ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
};

const MODELS: Record<string, string> = {
  openai: 'gpt-5.4-mini',
  deepseek: 'deepseek-chat',
};

export class LLMGateway {
  constructor(private readonly config: LLMConfig) {}

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    try {
      return await this.callProvider(req.model, req);
    } catch (err) {
      if (req.fallback && req.fallback !== req.model) {
        const result = await this.callProvider(req.fallback, req);
        return { ...result, usedModel: req.fallback };
      }
      throw err;
    }
  }

  async completeForStep(step: StepLlmKey, req: Omit<CompletionRequest, 'model' | 'fallback'>): Promise<CompletionResponse> {
    const policy = getStepLlmPolicy(step);

    return this.complete({
      ...req,
      model: policy.model,
      fallback: policy.fallback,
    });
  }

  async completeJson<T>(req: CompletionRequest): Promise<T> {
    const response = await this.complete(req);
    return parseJsonCompletion<T>(response.content);
  }

  private async callProvider(
    provider: LLMProvider,
    req: CompletionRequest,
  ): Promise<CompletionResponse> {
    const apiKey =
      provider === 'openai' ? this.config.openaiApiKey : this.config.deepseekApiKey;
    const body = {
      model: MODELS[provider],
      messages: req.messages,
      temperature: req.temperature ?? 0.3,
      ...(provider === 'openai'
        ? { max_completion_tokens: req.maxTokens ?? 512 }
        : { max_tokens: req.maxTokens ?? 512 }),
    };

    const res = await fetch(ENDPOINTS[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`LLM ${provider} error: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };
    return {
      content: data.choices[0].message.content,
      usedModel: provider,
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    };
  }
}
