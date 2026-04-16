# Trader42-BTC

BTC-only event, narrative, confirmation, and trade-advice system.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Core Modules](#core-modules)
- [Integration Clients](#integration-clients)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Pipeline Flow](#pipeline-flow)
- [License](#license)

---

## Architecture Overview

Single TypeScript backend handling ingestion, scoring, LLM orchestration, APIs, and shadow-book persistence. Binance stays direct, while OpenBB and AKTools are accessed only through the authenticated data proxy so the integration contract is explicit and auditable.

```
Binance WS/REST ─────────────┐
Data Proxy (OpenBB/AKTools) ─┤──► Step 0: Market Regime
twitterapi.io ───────────────┤──► Step 1: Driver Pool
                             │       ↓
                             │   Step 1.5: Trigger Gate
                             │       ↓
                             └──► Step 2: X Event Capture
                                     ↓
                                 Step 3: Narrative
                                     ↓
                                 Step 4: Confirmation
                                     ↓
                                 Step 5: Trade Advice
                                     ↓
                              Shadow Book + Weekly Audit
```

---

## Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | ≥ 22 | Runtime |
| TypeScript | 5.x | Type safety, ESM modules |
| Fastify | 5.x | HTTP server |
| better-sqlite3 | 11.x | Embedded database (WAL mode) |
| ws | 8.x | Binance WebSocket client |
| Zod | 3.x | Environment & input validation |
| node-cron | 3.x | Scheduled jobs |
| Vitest | 3.x | Unit & integration testing |
| pnpm | latest | Package manager |

---

## Prerequisites

- **Node.js 22+** — required for native `fetch()` and top-level `await`
- **pnpm** — `npm install -g pnpm`
- **Python 3** + C++ build tools — required for `better-sqlite3` native compilation
  - Windows: `npm install -g windows-build-tools` or install Visual Studio Build Tools
  - macOS: `xcode-select --install`
  - Linux: `sudo apt install python3 build-essential`

External services (must be running for full functionality):
- **Data Proxy** (Docker) — auth-proxy fronting OpenBB + AKTools via `docker compose up`
- Accounts for: **twitterapi.io**, **OpenAI**, **DeepSeek**

---

## Installation

```bash
git clone <repository-url>
cd trader42-btc/trader42-btc
pnpm install
```

---

## Configuration

Create a `.env` file in the project root. All variables are validated at startup via Zod.

```env
# ─── Server ───────────────────────────────────────
PORT=3000                                         # default: 3000
DB_PATH=./db/trader42.db                          # default: ./db/trader42.db

# ─── Binance (free, no key needed) ───────────────
BINANCE_BASE_URL=https://api.binance.com          # default
BINANCE_FUTURES_BASE_URL=https://fapi.binance.com # default
BINANCE_WS_URL=wss://stream.binance.com:9443/ws   # default

# ─── Data Proxy (Docker auth-proxy for OpenBB + AKTools) ───
DATA_PROXY_URL=http://localhost:8088              # auth-proxy address
DATA_PROXY_TOKEN=your_proxy_api_token             # shared Bearer token

# ─── API Keys (required) ─────────────────────────
TWITTER_API_KEY=your_twitterapi_io_key            # from twitterapi.io
OPENAI_API_KEY=sk-...                             # OpenAI API key
DEEPSEEK_API_KEY=sk-...                           # DeepSeek API key
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP server listen port |
| `DB_PATH` | No | `./db/trader42.db` | SQLite database file path |
| `BINANCE_BASE_URL` | No | `https://api.binance.com` | Binance Spot REST API |
| `BINANCE_FUTURES_BASE_URL` | No | `https://fapi.binance.com` | Binance USDT-M Futures API |
| `BINANCE_WS_URL` | No | `wss://stream.binance.com:9443/ws` | Binance WebSocket stream |
| `DATA_PROXY_URL` | **Yes** | — | Docker auth-proxy URL (fronts OpenBB + AKTools) |
| `DATA_PROXY_TOKEN` | **Yes** | — | Bearer token for auth-proxy |
| `TWITTER_API_KEY` | **Yes** | — | twitterapi.io API key |
| `OPENAI_API_KEY` | **Yes** | — | OpenAI API key (gpt-5.4-mini) |
| `DEEPSEEK_API_KEY` | **Yes** | — | DeepSeek API key (deepseek-chat) |

---

## Running the Application

```bash
# Development (with hot reload via tsx)
pnpm dev

# Production build
pnpm build
pnpm start

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

The server starts at `http://localhost:3000` (or your configured `PORT`).

For proxy-backed data sources, requests go through:
- `http://<proxy-host>:8088/openbb/...`
- `http://<proxy-host>:8088/aktools/...`

All proxy requests must include `Authorization: Bearer <DATA_PROXY_TOKEN>`.

---

## API Reference

Base URL: `http://localhost:3000`

### Health & Status

#### `GET /health`

Health check endpoint.

```json
// Response
{ "status": "ok" }
```

#### `GET /api/v1/status`

Service status with per-module freshness and degraded-state reporting.

```json
// Response
{
  "service": "trader42-btc",
  "uptime": 123.456,
  "timestamp": "2026-04-16T12:00:00.000Z",
  "modules": [
    "marketRegime",
    "driverPool",
    "triggerGate",
    "xEvents",
    "narrativeScoring",
    "confirmation",
    "tradeAdvice",
    "shadowBook",
    "weeklyAudit"
  ],
  "pipeline": {
    "overall": "degraded",
    "modules": {
      "marketRegime": {
        "state": "healthy",
        "lastUpdatedAt": "2026-04-16T11:59:30.000Z",
        "freshnessSec": 30,
        "staleAfterSec": 1800,
        "reason": null
      },
      "xEvents": {
        "state": "degraded",
        "lastUpdatedAt": "2026-04-16T10:00:00.000Z",
        "freshnessSec": 7200,
        "staleAfterSec": 300,
        "reason": "stale snapshot: 7200s old"
      }
    }
  }
}
```

---

### Step 0: Market Regime

#### `POST /api/v1/market-regime`

Classify the current market regime from a snapshot of macro, flow, and positioning data.

**Request:**

```json
{
  "dxyChange": -0.15,
  "nqChangePct": 0.8,
  "etfNetFlowUsd": 450000000,
  "oiChangePct": 8.5,
  "fundingRate": 0.012,
  "liquidationIntensity": 0.3,
  "volumeChangePct": 180
}
```

| Field | Type | Description |
|-------|------|-------------|
| `dxyChange` | number | DXY index % change |
| `nqChangePct` | number | NASDAQ % change |
| `etfNetFlowUsd` | number | BTC ETF net flow in USD |
| `oiChangePct` | number | Open interest % change |
| `fundingRate` | number | Perpetual funding rate |
| `liquidationIntensity` | number | Liquidation intensity score (0-1) |
| `volumeChangePct` | number | Volume % change |

**Response:**

```json
{
  "asset": "BTC",
  "market_regime": "flow-led",
  "primary_drivers": ["flow"],
  "secondary_drivers": ["positioning"],
  "risk_environment": "risk-on",
  "btc_state": "trend",
  "regime_shift_probability": 0,
  "confidence": 0.78,
  "notes": ""
}
```

| Field | Type | Values |
|-------|------|--------|
| `market_regime` | string | `macro-led` · `flow-led` · `positioning-led` · `event-led` · `narrative-led` · `mixed` |
| `risk_environment` | string | `risk-on` · `risk-off` · `mixed` |
| `btc_state` | string | `trend` · `range` · `squeeze-prone` · `fragile` · `mixed` |
| `confidence` | number | 0.0 – 1.0 |

---

### Step 1.5: Trigger Gate

#### `POST /api/v1/trigger-gate`

Evaluate whether market conditions warrant a trading trigger.

**Request:**

```json
{
  "return1m": 3.5,
  "priceZScore": 2.8,
  "volumeZScore": 3.0,
  "oiChangePct": 8.5,
  "fundingRate": 0.012,
  "fundingMean": 0.005,
  "basisPct": 0.8,
  "basisMean": 0.3,
  "liquidationUsd1h": 50000000,
  "liquidationMean": 20000000,
  "xResonance": 0.8
}
```

| Field | Type | Description |
|-------|------|-------------|
| `return1m` | number | 1-minute return % |
| `priceZScore` | number | Price Z-score vs rolling window |
| `volumeZScore` | number | Volume Z-score vs rolling window |
| `oiChangePct` | number | Open interest % change |
| `fundingRate` | number | Current funding rate |
| `fundingMean` | number | Mean funding rate (trailing) |
| `basisPct` | number | Spot-futures basis % |
| `basisMean` | number | Mean basis (trailing) |
| `liquidationUsd1h` | number | Liquidation volume in USD (1h) |
| `liquidationMean` | number | Mean liquidation volume |
| `xResonance` | number | X/Twitter event resonance score (0-1) |

**Response:**

```json
{
  "asset": "BTC",
  "triggered": true,
  "trigger_type": "price_volume",
  "price_zscore": 2.8,
  "volume_zscore": 3.0,
  "oi_shift": 1.7,
  "funding_shift": 1.4,
  "basis_shift": 1.67,
  "liquidation_intensity": 2.5,
  "x_resonance": 0.8,
  "case_label": "A",
  "priority": "high",
  "notes": "Case A: price + X convergence"
}
```

| Case | Label | Condition | Description |
|------|-------|-----------|-------------|
| A | Price + X | priceZ ≥ 2.0 AND xResonance ≥ 0.5 | Price move confirmed by X chatter |
| B | Price only | priceZ ≥ 2.0, low X | Price-only breakout |
| C | X only | xResonance ≥ 0.5, low price | Narrative-only, no price confirmation |
| D | Liquidation | liquidation dominance ≥ 0.7 | Liquidation cascade event |

---

### Step 2: X Event Capture

#### `POST /api/v1/x-events`

Process raw tweets and extract structured BTC events. Supports batch input.

**Request:**

```json
[
  {
    "id": "tweet-12345",
    "text": "BREAKING: SEC officially approves first BTC spot ETF",
    "userName": "DeItaone",
    "sourceTier": "journalist",
    "createdAt": "2024-01-10T16:00:00Z",
    "isRetweet": false,
    "isQuote": false,
    "quotedText": null
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique tweet ID (for dedup) |
| `text` | string | Yes | Raw tweet text |
| `userName` | string | Yes | Author username |
| `sourceTier` | string | Yes | `official` · `journalist` · `analyst` · `kol` |
| `createdAt` | string | Yes | ISO 8601 timestamp |
| `isRetweet` | boolean | No | Default: `false` |
| `isQuote` | boolean | No | Default: `false` |
| `quotedText` | string | No | Text of quoted tweet |

**Response:**

```json
{
  "processed": 1,
  "events": [
    {
      "timestamp": "2024-01-10T16:00:00Z",
      "asset": "BTC",
      "event_type": "regulation",
      "source_tier": "journalist",
      "source_credibility_score": 0.75,
      "headline": "BREAKING: SEC officially approves first BTC spot ETF",
      "novelty": "new",
      "first_order_event": true,
      "btc_bias": "bullish",
      "urgency": 2,
      "confidence": 0.75
    }
  ]
}
```

**Event Classification (rule-based):**

| Event Type | Detection Keywords |
|------------|-------------------|
| `regulation` | SEC, CFTC, regulation, ban, legal, filing, rule change, compliance |
| `ETF` | ETF, IBIT, FBTC, inflow, outflow, fund flow, AUM |
| `macro` | Fed, FOMC, CPI, rate cut, rate hike, inflation, NFP, PCE, GDP, treasury yield |
| `treasury` | reserve, corporate buy, MicroStrategy, Saylor, bought BTC |
| `positioning` | liquidat*, squeeze, OI, open interest, funding |
| `onchain` | whale, exchange inflow/outflow, on-chain, transfer |
| `security` | hack, exploit, breach, stolen, vulnerability |
| `geopolitics` | war, sanction, conflict, tariff |

**Source Credibility Scores:**

| Tier | Score | Example Accounts |
|------|-------|-----------------|
| `official` | 0.95 | @saborofficial (MicroStrategy) |
| `journalist` | 0.75 | @NickTimiraos, @DeItaone |
| `analyst` | 0.60 | @EricBalchunas, @whale_alert, @VeloData |
| `kol` | 0.35 | @BitcoinMagazine, @APompliano |

**Deduplication:** Tweets are deduplicated by exact ID match and normalized text similarity (Jaccard, threshold ≥ 0.85).

**Tweet Cleaning Pipeline:**
1. Strip `t.co` URLs
2. Remove emoji prefixes (🚨🔥⚡️ etc.)
3. Detect retweets (`RT @` prefix or `isRetweet` flag) → mark as retelling
4. Detect quote-tweet duplicates (text matches `quotedText`)
5. Detect stale screenshots (date patterns + "screenshot"/"看"/"from")
6. Discard if cleaned text < 10 chars

---

### Step 5: Trade Advice

#### `POST /api/v1/trade-advice`

Generate a trade recommendation from aggregated pipeline outputs.

**Request:**

```json
{
  "regime": "risk-on",
  "topDriver": { "name": "etf-flow", "direction": "long", "score": 0.7 },
  "triggerFired": true,
  "narrativeStage": "spreading",
  "narrativeCeiling": "standard",
  "confirmationMode": "breakout",
  "confirmationTradeability": "actionable",
  "positioningHeat": 0.25,
  "continuationProbability": 0.6,
  "entryQuality": 0.7
}
```

| Field | Type | Description |
|-------|------|-------------|
| `regime` | string | Risk environment from Step 0 (`risk-on` / `risk-off` / `mixed`) |
| `topDriver` | object | Dominant market driver `{ name, direction, score }` |
| `triggerFired` | boolean | Whether Step 1.5 triggered |
| `narrativeStage` | string | Narrative lifecycle stage (`seed` / `spreading` / `consensus`) |
| `narrativeCeiling` | string | Maximum trade level narrative supports (`ignore` / `watch` / `light` / `standard`) |
| `confirmationMode` | string | Confirmation type (`none` / `breakout` / `followthrough` / `squeeze`) |
| `confirmationTradeability` | string | Confirmation gate result (`ignore` / `watch` / `actionable`) |
| `positioningHeat` | number | Crowding / positioning heat (0-1) |
| `continuationProbability` | number | Probability of price continuation (0-1) |
| `entryQuality` | number | Entry timing quality score (0-1) |

**Response:**

```json
{
  "id": "a3f1b2c4-...",
  "timestamp": "2026-04-16T12:00:00.000Z",
  "asset": "BTC",
  "market_regime": "risk-on",
  "active_driver": "etf-flow",
  "direction": "long",
  "trade_level": "standard",
  "risk_budget_pct": 0.5,
  "confirmation_mode": "breakout",
  "narrative_stage": "spreading",
  "narrative_ceiling": "standard",
  "confirmation_tradeability": "actionable",
  "positioning_heat": 0.25,
  "theme_probability": 0.7,
  "continuation_probability": 0.6,
  "crowding_probability": 0,
  "invalidators": [
    "price fails to hold above breakout level within 1h",
    "ETF flow turns net negative for the day",
    "positioning heat rises above 0.8"
  ],
  "reasoning": [
    "raw=standard, ceiling=standard, capped=standard, regime=risk-on"
  ],
  "execution_note": "Full size allowed, set stops per confirmation mode",
  "review_required": true
}
```

**Policy Engine (deterministic layered-cap model):**

```
Step 1: Positioning heat > 0.8?  ──yes──► AVOID (risk = 0%)
        │ no
Step 2: Determine raw level from confirmation:
        │  confirmationTradeability=ignore OR mode=none  → IGNORE
        │  confirmationTradeability=actionable AND theme > 0.6 → STANDARD
        │  confirmationTradeability=actionable OR watch  → LIGHT
        │  otherwise → WATCH
        ↓
Step 3: Apply narrative ceiling cap (level cannot exceed ceiling)
        ↓
Step 4: Direction: observe (ignore/watch) or long (light/standard)
        ↓
Step 5: Risk budget allocation:
        │  Base: ignore=0%, watch=0%, light=25%, standard=50%
        │  × 0.5 if regime=risk-off AND direction=long
        │  × 0.75 if regime=mixed
        │  × (1 - heat) if positioning heat > 0.5
```

| Trade Level | Direction | Risk Budget | Action |
|-------------|-----------|-------------|--------|
| `ignore` | observe | 0% | No action, conditions insufficient |
| `watch` | observe | 0% | Monitor, not yet tradeable |
| `light` | long | ≤ 25% | Reduced size, monitor follow-through |
| `standard` | long | ≤ 50% | Full size, human review required |
| `avoid` | observe | 0% | Forced exit, extreme crowding |

---

## Core Modules

### Market Regime (Step 0)

Classifies the BTC market environment by computing four pressure scores and selecting the dominant driver.

**Feature Builder** — sigmoid-based normalization from raw macro/flow/positioning inputs:
- **Macro pressure**: f(dxyChange, nqChangePct)
- **Flow pressure**: f(etfNetFlowUsd)
- **Positioning pressure**: f(oiChangePct, fundingRate, liquidationIntensity)
- **Event pressure**: f(volumeChangePct)

**Classifier** — selects regime from highest-pressure feature:
- Thresholds: LOW = 0.3, MIXED_DELTA = 0.15
- Below LOW → `mixed` regime
- Two pressures within MIXED_DELTA → `mixed` regime
- Otherwise → dominant pressure determines regime

### Trigger Gate (Step 1.5)

Real-time evaluation of whether current conditions justify entering a trade.

**Feature Builder** — normalizes raw inputs to feature scores:
- Price Z-score pass-through
- Volume Z-score pass-through
- OI shift = (oiChangePct - 3) / 3 (scaled)
- Funding shift = (fundingRate - fundingMean) / fundingMean
- Basis shift = (basisPct - basisMean) / basisMean
- Liquidation intensity = liquidationUsd1h / liquidationMean
- X resonance pass-through

**Classifier** — assigns trigger case (A/B/C/D) based on feature thresholds.

**Rolling Window** — utility class for streaming Z-score computation:
```typescript
const window = new RollingWindow(60); // 60-sample window
window.push(value);
const z = window.zScore(currentValue);
```

### X Event Capture (Step 2)

Processes raw tweets from 10 curated X accounts into structured BTC event signals.

**Pipeline:** Raw Tweet → Cleaner → Dedup → Rule Classifier → XEventOutput

**Monitored Accounts (10 total):**

| List | Focus | Accounts |
|------|-------|----------|
| A | Macro / Policy / ETF | @NickTimiraos, @DeItaone, @EricBalchunas, @JSeyff |
| B | BTC Market Pros | @glaborborn, @whale_alert, @VeloData |
| C | High-Impact | @saborofficial, @BitcoinMagazine, @APompliano |

### Trade Advice (Step 5)

Deterministic policy engine that consumes outputs from Steps 0, 1.5, and 2 to produce actionable BTC trade recommendations.

Key features:
- **Layered cap model**: narrative ceiling → confirmation gate → positioning heat
- **Auto-generated invalidators** per confirmation mode
- **Review required** flag for `standard` and `light` trades
- Full reasoning chain logged in `reasoning[]`

---

## Integration Clients

### Binance (Free, no API key)

```typescript
import { BinanceSpotClient } from './integrations/binance/spotClient.js';
import { BinanceFuturesClient } from './integrations/binance/futuresClient.js';
import { BinanceWsClient } from './integrations/binance/wsClient.js';

// Spot
const spot = new BinanceSpotClient(env.BINANCE_BASE_URL);
await spot.getTicker('BTCUSDT');     // → { symbol, price }
await spot.get24hStats('BTCUSDT');   // → { volume, priceChangePercent }

// Futures
const futures = new BinanceFuturesClient(env.BINANCE_FUTURES_BASE_URL);
await futures.getFundingRate('BTCUSDT');   // → { fundingRate, fundingTime }
await futures.getOpenInterest('BTCUSDT');  // → { openInterest, symbol }
await futures.getPremiumIndex('BTCUSDT');  // → { markPrice, indexPrice, lastFundingRate }

// WebSocket (real-time streams)
const ws = new BinanceWsClient(env.BINANCE_WS_URL);
ws.connect(['btcusdt@trade', 'btcusdt@kline_1m']);
ws.on('message', (data) => { /* handle stream data */ });
ws.disconnect();
```

### OpenBB (via Data Proxy)

All OpenBB requests go through the Docker auth-proxy at `DATA_PROXY_URL/openbb/...` with Bearer token.

```typescript
import { OpenBBMacroClient } from './integrations/openbb/macroClient.js';
import { OpenBBCalendarClient } from './integrations/openbb/calendarClient.js';

const macro = new OpenBBMacroClient(env.DATA_PROXY_URL, env.DATA_PROXY_TOKEN);
await macro.getDXY();                    // → { value, timestamp }
await macro.getTreasuryYields();         // → { us2y, us10y }
await macro.getEquityIndex('NQ=F');      // → { value }

const calendar = new OpenBBCalendarClient(env.DATA_PROXY_URL, env.DATA_PROXY_TOKEN);
await calendar.getUpcomingEvents();      // → CalendarEvent[]
```

### AKTools (via Data Proxy)

All AKTools requests go through the Docker auth-proxy at `DATA_PROXY_URL/aktools/...` with Bearer token.

```typescript
import { AKToolsETFFlowClient } from './integrations/aktools/etfFlowClient.js';
import { AKToolsStablecoinClient } from './integrations/aktools/stablecoinClient.js';

const etf = new AKToolsETFFlowClient(env.DATA_PROXY_URL, env.DATA_PROXY_TOKEN);
await etf.getBtcEtfNetFlow();            // → { netFlowUsd, date }

const stable = new AKToolsStablecoinClient(env.DATA_PROXY_URL, env.DATA_PROXY_TOKEN);
await stable.getStablecoinNetFlow();     // → { netFlow, date }
```

### Twitter via twitterapi.io (~$15-30/mo)

```typescript
import { TwitterApiIoClient } from './integrations/twitter/twitterApiIoClient.js';

const twitter = new TwitterApiIoClient(env.TWITTER_API_KEY);
await twitter.searchRecent('BTC ETF');               // → { tweets, has_next_page, next_cursor }
await twitter.getUserTweets('NickTimiraos');          // → { tweets, has_next_page, next_cursor }
```

### LLM Gateway

Unified gateway routing between OpenAI and DeepSeek with fallback support.

```typescript
import { LLMGateway } from './lib/llm.js';

const llm = new LLMGateway({
  openaiApiKey: env.OPENAI_API_KEY,
  deepseekApiKey: env.DEEPSEEK_API_KEY,
});

const result = await llm.complete({
  model: 'openai',          // 'openai' → gpt-4o-mini | 'deepseek' → deepseek-chat
  messages: [{ role: 'user', content: 'Classify this event...' }],
  maxTokens: 512,           // default: 512
  temperature: 0.3,         // default: 0.3
  fallback: 'deepseek',     // optional: fallback provider on error
});
// → { content, usedModel, inputTokens, outputTokens }
```

**Monthly cost estimate:** OpenAI ~$5-10, DeepSeek ~$3-8.

---

## Database Schema

SQLite with WAL mode and foreign keys enabled. Schema auto-loaded from `db/schema.sql` on startup.

### Tables

#### `market_snapshots`

Raw market data captured from all sources.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `timestamp` | TEXT | Capture time |
| `btc_spot_price` | REAL | BTC spot price |
| `btc_perp_price` | REAL | BTC perpetual price |
| `btc_volume_24h` | REAL | 24h volume |
| `btc_oi` | REAL | Open interest |
| `btc_funding_rate` | REAL | Funding rate |
| `btc_basis` | REAL | Spot-perp basis |
| `dxy` | REAL | DXY index value |
| `us2y` / `us10y` | REAL | Treasury yields |
| `nq` / `spx` / `gold` | REAL | Equity/commodity indices |
| `etf_net_flow_usd` | REAL | BTC ETF net flow |
| `stablecoin_net_flow` | REAL | Stablecoin net flow |
| `raw_json` | TEXT | Full raw data blob |

#### `regime_snapshots`

Classified market regimes, linked to source snapshot.

| Column | Type | Description |
|--------|------|-------------|
| `market_regime` | TEXT | `macro-led` / `flow-led` / `positioning-led` / `event-led` / `mixed` |
| `primary_drivers` | TEXT | JSON array of primary drivers |
| `risk_environment` | TEXT | `risk-on` / `risk-off` / `mixed` |
| `btc_state` | TEXT | `trend` / `range` / `squeeze-prone` / `fragile` |
| `confidence` | REAL | Classification confidence |
| `snapshot_id` | INTEGER FK | Links to `market_snapshots` |

#### `x_events`

Processed X/Twitter events.

| Column | Type | Description |
|--------|------|-------------|
| `event_type` | TEXT | `macro` / `ETF` / `regulation` / `security` / ... |
| `source_tier` | TEXT | `official` / `journalist` / `analyst` / `kol` |
| `headline` | TEXT | Cleaned event headline |
| `novelty` | TEXT | `new` / `update` / `recycled` / `stale-screenshot` |
| `first_order_event` | INTEGER | 1 = first-order, 0 = retelling |
| `btc_bias` | TEXT | `bullish` / `bearish` / `mixed` / `unclear` |

#### `trigger_snapshots`

Trigger gate evaluation records.

| Column | Type | Description |
|--------|------|-------------|
| `triggered` | INTEGER | 0/1 |
| `trigger_type` | TEXT | Trigger classification |
| `case_label` | TEXT | A/B/C/D |
| `priority` | TEXT | low/medium/high |
| Feature columns | REAL | price_zscore, volume_zscore, oi_shift, etc. |

#### `trade_advice`

Trade recommendations linked to regime + trigger.

#### `shadow_book`

Paper trade tracking for system accuracy auditing.

---

## Testing

```bash
# Run all unit + integration tests (excludes real API smoke tests)
pnpm test

# Run tests in watch mode during development
pnpm test:watch

# Run specific module tests
npx vitest run tests/market-regime/
npx vitest run tests/trigger-gate/
npx vitest run tests/x-events/
npx vitest run tests/trade-advice/
npx vitest run tests/e2e/

# Run smoke tests (requires real API credentials + running services)
pnpm test:smoke

# Run replay + product contract coverage explicitly
npx vitest run tests/e2e/pipeline.test.ts tests/e2e/fullPipelineReplay.test.ts tests/contracts/productContracts.test.ts
```

**Coverage highlights:**

- Unit + route coverage for Step 0 → 5, shadow-book, weekly audit, and status freshness
- Replay coverage for full Step 0 → 1 → 1.5 → 2 → 3 → 4 → 5 fixture runs
- Product contract checks for replay fixtures and Step 5 fields

**E2E scenarios:**
- `2024-01-btc-etf-approval.json` — ETF approval, massive inflow, flow-led regime → standard advice
- `2025-03-fomc-dovish.json` — FOMC dovish pivot, macro-led regime → standard advice
- `2024-08-carry-trade-unwind.json` — cross-asset deleveraging, macro risk-off → light short advice
- `2025-06-exchange-hack.json` — hack-driven liquidation chain, positioning-led regime → avoid / observe posture
- `2026-02-narrative-only-fakeout.json` — hot narrative without confirmation → capped at ignore/watch/light

---

## Project Structure

```
trader42-btc/
├── src/
│   ├── app.ts                              # Entry point (top-level await)
│   ├── config/
│   │   └── env.ts                          # Zod-validated env config
│   ├── server/
│   │   └── buildServer.ts                  # Fastify setup + route registration
│   ├── lib/
│   │   ├── db.ts                           # SQLite (WAL mode) singleton
│   │   ├── llm.ts                          # LLM gateway (OpenAI + DeepSeek)
│   │   └── rollingWindow.ts                # Z-score rolling window
│   ├── integrations/
│   │   ├── binance/
│   │   │   ├── spotClient.ts               # Spot REST (ticker, 24h stats)
│   │   │   ├── futuresClient.ts            # Futures REST (funding, OI, premium)
│   │   │   ├── wsClient.ts                 # WebSocket (multi-stream, auto-reconnect)
│   │   │   └── types.ts                    # Shared Binance types
│   │   ├── openbb/
│   │   │   ├── macroClient.ts              # DXY, treasuries, equity indices
│   │   │   └── calendarClient.ts           # Macro calendar events
│   │   ├── aktools/
│   │   │   ├── etfFlowClient.ts            # BTC ETF net flow
│   │   │   └── stablecoinClient.ts         # Stablecoin net flow
│   │   └── twitter/
│   │       ├── twitterApiIoClient.ts       # Search + user tweets
│   │       └── sourceLists.ts              # 10 curated accounts (Lists A/B/C)
│   └── modules/
│       ├── market-regime/                  # Step 0
│       │   ├── regime.types.ts
│       │   ├── regime.featureBuilder.ts    # Sigmoid pressure scores
│       │   ├── regime.classifier.ts        # Dominant-pressure classifier
│       │   ├── regime.service.ts           # Orchestrator
│       │   └── regime.route.ts             # POST + GET /api/v1/market-regime
│       ├── trigger-gate/                   # Step 1.5
│       │   ├── trigger.types.ts
│       │   ├── trigger.featureBuilder.ts   # Raw → normalized features
│       │   ├── trigger.classifier.ts       # Case A/B/C/D classifier
│       │   ├── trigger.service.ts          # Orchestrator
│       │   └── trigger.route.ts            # POST + GET /api/v1/trigger-gate
│       ├── x-events/                       # Step 2
│       │   ├── xEvent.types.ts
│       │   ├── xEvent.cleaner.ts           # URL/emoji strip, retelling detect
│       │   ├── xEvent.classifier.ts        # Keyword-based event classification
│       │   ├── xEvent.dedup.ts             # ID + Jaccard text dedup
│       │   ├── xEvent.service.ts           # Clean → dedup → classify pipeline
│       │   └── xEvent.route.ts             # POST /api/v1/x-events
│       ├── driver-pool/                    # Step 1
│       ├── narrative/                      # Step 3
│       ├── confirmation/                   # Step 4
│       └── trade-advice/                   # Step 5
│           ├── tradeAdvice.types.ts        # TradeAdvice contract
│           ├── tradeAdvice.policy.ts       # Layered-cap policy engine
│           ├── tradeAdvice.service.ts      # Full pipeline orchestration
│           └── tradeAdvice.route.ts        # POST /api/v1/trade-advice
│       └── shadow-book/                    # Shadow trades + weekly audit
│           ├── shadowBook.types.ts
│           ├── shadowBook.service.ts
│           ├── shadowBook.route.ts
│           ├── weeklyAudit.service.ts
│           └── weeklyAudit.route.ts
├── db/
│   ├── schema.sql                          # 6-table SQLite schema
│   └── migrations/                         # Future migrations
├── tests/
│   ├── fixtures/scenarios/                 # Historical replay JSONs
│   ├── market-regime/                      # 12 tests
│   ├── trigger-gate/                       # 12 tests
│   ├── x-events/                           # 23 tests
│   ├── trade-advice/                       # 11 tests
│   ├── e2e/pipeline.test.ts                # 2 full pipeline tests
│   ├── integration-smoke/                  # Real API smoke tests
│   └── helpers/                            # Test env validation
├── docs/
│   └── plans/                              # Step implementation plans
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Pipeline Flow

Complete data flow for generating a trade recommendation:

```
1. INGEST
   ├── Binance REST → spot price, 24h stats, funding, OI, premium
   ├── Binance WS   → real-time trades, klines
   ├── OpenBB        → DXY, treasury yields, NQ/SPX
   ├── AKTools       → BTC ETF flow, stablecoin flow
   └── twitterapi.io → tweets from 10 curated accounts

2. STEP 0: MARKET REGIME
    Input:  MarketSnapshotInput (7 fields)
    Output: RegimeOutput { market_regime, risk_environment, btc_state }

3. STEP 1: DRIVER POOL
   Input:  Regime + flow / macro / positioning context
   Output: candidate_btc_drivers[]

4. STEP 1.5: TRIGGER GATE
    Input:  TriggerInput (11 fields, real-time)
    Output: TriggerOutput { triggered, case_label, priority }

5. STEP 2: X EVENT CAPTURE
    Input:  Raw tweets (batch)
    Output: XEventOutput[] { event_type, btc_bias, first_order, urgency }

6. STEP 3: NARRATIVE SCORING
   Input:  X events + diffusion + market linkage
   Output: NarrativeOutput { theme, narrative_stage, actionability_ceiling }

7. STEP 4: CONFIRMATION
   Input:  Price / flow / positioning confirmation inputs
   Output: ConfirmationOutput { confirmation_mode, tradeability, direction_bias }

8. STEP 5: TRADE ADVICE
   Input:  Aggregated Steps 0 → 4 + X-event bias
   Output: TradeAdvice { tradeability, direction, risk_budget, invalidators }

9. PERSIST + REVIEW
   └── SQLite: market_snapshots → regime_snapshots → trigger_snapshots
               x_events → trade_advice → shadow_book → weekly audit
```

---

## License

MIT
