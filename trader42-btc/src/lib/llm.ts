interface LLMConfig {
  openaiApiKey: string;
  deepseekApiKey: string;
}

interface CompletionRequest {
  model: 'openai' | 'deepseek';
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  fallback?: 'openai' | 'deepseek';
}

interface CompletionResponse {
  content: string;
  usedModel: 'openai' | 'deepseek';
  inputTokens: number;
  outputTokens: number;
}

const ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
};

const MODELS: Record<string, string> = {
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
};

export class LLMGateway {
  constructor(private config: LLMConfig) {}

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

  private async callProvider(
    provider: 'openai' | 'deepseek',
    req: CompletionRequest,
  ): Promise<CompletionResponse> {
    const apiKey =
      provider === 'openai' ? this.config.openaiApiKey : this.config.deepseekApiKey;
    const res = await fetch(ENDPOINTS[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELS[provider],
        messages: req.messages,
        max_tokens: req.maxTokens ?? 512,
        temperature: req.temperature ?? 0.3,
      }),
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
