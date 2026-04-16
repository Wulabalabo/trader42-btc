# Backend Truth Layer

## Scope

- Steps 0-5 of the BTC-only pipeline
- Shadow-book persistence
- Weekly audit automation

## Integration Contract

- Binance is called directly from public REST and WebSocket endpoints.
- OpenBB and AKTools are called only through `DATA_PROXY_URL` with `DATA_PROXY_TOKEN`.
- twitterapi.io is used directly with `TWITTER_API_KEY`.

## LLM Contract

- OpenAI is the primary provider for Step 2 and Step 3 structured, higher-frequency tasks.
- DeepSeek is the primary provider for Step 0, Step 1, Step 5, and weekly audit generation.
- All provider access is centralized through `trader42-btc/src/lib/llm.ts`.
