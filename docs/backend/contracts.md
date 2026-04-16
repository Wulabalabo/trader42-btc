# Backend Contracts

## Environment

- `DATA_PROXY_URL`: base URL for the authenticated proxy in front of OpenBB and AKTools
- `DATA_PROXY_TOKEN`: Bearer token sent on every proxied OpenBB and AKTools request
- `TWITTER_API_KEY`: twitterapi.io API key
- `OPENAI_API_KEY`: OpenAI API key
- `DEEPSEEK_API_KEY`: DeepSeek API key

## Data Access Rules

- Do not reintroduce direct `OPENBB_BASE_URL` or `AKTOOLS_BASE_URL` configuration.
- Keep Binance as a direct dependency because it is public market data.
- Keep LLM routing decisions inside `trader42-btc/src/lib/llm.ts` and step-aware policy helpers.
