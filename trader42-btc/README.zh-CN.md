# Trader42-BTC

仅面向 BTC 的事件、叙事、确认和交易建议系统。

## 目录

- [架构概览](#架构概览)
- [技术栈](#技术栈)
- [前置条件](#前置条件)
- [安装](#安装)
- [配置](#配置)
- [运行应用](#运行应用)
- [API 参考](#api-参考)
- [核心模块](#核心模块)
- [集成客户端](#集成客户端)
- [数据库结构](#数据库结构)
- [测试](#测试)
- [项目结构](#项目结构)
- [流水线流程](#流水线流程)
- [许可证](#许可证)

---

## 架构概览

这是一个单体 TypeScript 后端，负责数据接入、评分、LLM 编排、API 服务以及影子账本持久化。系统先用确定性规则和类型化 schema 保持可审计性，再在其上叠加 LLM 解释层，以便在 X 数据或模型输出噪声较大时，仍能输出可追踪、可解释的结果。

```
Binance WS/REST ──┐
OpenBB REST ──────┤
AKTools REST ─────┤──► Step 0: Market Regime
twitterapi.io ────┤       ↓
                  │   Step 1.5: Trigger Gate
                  │       ↓
                  └──► Step 2: X Event Capture
                          ↓
                      Step 5: Trade Advice
                          ↓
                      Shadow Book (SQLite)
```

---

## 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥ 22 | 运行时 |
| TypeScript | 5.x | 类型安全、ESM 模块 |
| Fastify | 5.x | HTTP 服务器 |
| better-sqlite3 | 11.x | 内嵌数据库（WAL 模式） |
| ws | 8.x | Binance WebSocket 客户端 |
| Zod | 3.x | 环境变量与输入校验 |
| node-cron | 3.x | 定时任务 |
| Vitest | 3.x | 单元测试与集成测试 |
| pnpm | latest | 包管理器 |

---

## 前置条件

- **Node.js 22+** - 需要原生 `fetch()` 和顶层 `await`
- **pnpm** - `npm install -g pnpm`
- **Python 3** + C++ 构建工具 - `better-sqlite3` 原生编译所需
  - Windows：`npm install -g windows-build-tools`，或安装 Visual Studio Build Tools
  - macOS：`xcode-select --install`
  - Linux：`sudo apt install python3 build-essential`

完整功能还依赖以下外部服务：
- **OpenBB**（自托管）- 宏观数据
- **AKTools**（自托管）- ETF / 稳定币流数据
- 账户：**twitterapi.io**、**OpenAI**、**DeepSeek**

---

## 安装

```bash
git clone <repository-url>
cd trader42-btc/trader42-btc
pnpm install
```

---

## 配置

在项目根目录创建 `.env` 文件。所有变量都会在启动时通过 Zod 校验。

```env
# ─── 服务器 ───────────────────────────────────────
PORT=3000                                         # 默认：3000
DB_PATH=./db/trader42.db                          # 默认：./db/trader42.db

# ─── Binance（免费，无需 API Key） ───────────────
BINANCE_BASE_URL=https://api.binance.com          # 默认值
BINANCE_FUTURES_BASE_URL=https://fapi.binance.com # 默认值
BINANCE_WS_URL=wss://stream.binance.com:9443/ws   # 默认值

# ─── 自托管服务（必需） ───────────────────────────
OPENBB_BASE_URL=http://localhost:8001             # 你的 OpenBB 实例
AKTOOLS_BASE_URL=http://localhost:8002            # 你的 AKTools 实例

# ─── API Key（必需） ──────────────────────────────
TWITTER_API_KEY=your_twitterapi_io_key            # 来自 twitterapi.io
OPENAI_API_KEY=sk-...                             # OpenAI API Key
DEEPSEEK_API_KEY=sk-...                           # DeepSeek API Key
```

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `PORT` | 否 | `3000` | HTTP 服务器监听端口 |
| `DB_PATH` | 否 | `./db/trader42.db` | SQLite 数据文件路径 |
| `BINANCE_BASE_URL` | 否 | `https://api.binance.com` | Binance 现货 REST API |
| `BINANCE_FUTURES_BASE_URL` | 否 | `https://fapi.binance.com` | Binance USDT-M 合约 REST API |
| `BINANCE_WS_URL` | 否 | `wss://stream.binance.com:9443/ws` | Binance WebSocket 流 |
| `OPENBB_BASE_URL` | **是** | — | 自托管 OpenBB API |
| `AKTOOLS_BASE_URL` | **是** | — | 自托管 AKTools API |
| `TWITTER_API_KEY` | **是** | — | twitterapi.io API Key |
| `OPENAI_API_KEY` | **是** | — | OpenAI API Key（gpt-4o-mini） |
| `DEEPSEEK_API_KEY` | **是** | — | DeepSeek API Key（deepseek-chat） |

---

## 运行应用

```bash
# 开发模式（通过 tsx 热重载）
pnpm dev

# 生产构建
pnpm build
pnpm start

# 运行全部测试
pnpm test

# 监视模式测试
pnpm test:watch
```

服务默认启动在 `http://localhost:3000`（或你配置的 `PORT`）。

---

## API 参考

基础地址：`http://localhost:3000`

### 健康检查与状态

#### `GET /health`

健康检查接口。

```json
// 响应
{ "status": "ok" }
```

#### `GET /api/v1/status`

返回服务状态与已加载模块。

```json
// 响应
{
  "service": "trader42-btc",
  "uptime": 123.456,
  "timestamp": "2026-04-16T12:00:00.000Z",
  "modules": ["market-regime", "trigger-gate", "x-events", "trade-advice"]
}
```

---

### 步骤 0：市场状态

#### `POST /api/v1/market-regime`

根据宏观、资金流和持仓数据快照，对当前市场状态进行分类。

**请求：**

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

| 字段 | 类型 | 说明 |
|------|------|------|
| `dxyChange` | number | DXY 指数涨跌幅（%） |
| `nqChangePct` | number | 纳指涨跌幅（%） |
| `etfNetFlowUsd` | number | BTC ETF 净流入（USD） |
| `oiChangePct` | number | 持仓量变化百分比 |
| `fundingRate` | number | 永续合约资金费率 |
| `liquidationIntensity` | number | 强平强度分数（0-1） |
| `volumeChangePct` | number | 成交量变化百分比 |

**响应：**

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

| 字段 | 类型 | 可选值 |
|------|------|--------|
| `market_regime` | string | `macro-led` · `flow-led` · `positioning-led` · `event-led` · `narrative-led` · `mixed` |
| `risk_environment` | string | `risk-on` · `risk-off` · `mixed` |
| `btc_state` | string | `trend` · `range` · `squeeze-prone` · `fragile` · `mixed` |
| `confidence` | number | 0.0 – 1.0 |

---

### 步骤 1.5：触发门槛

#### `POST /api/v1/trigger-gate`

判断当前市场条件是否值得触发交易信号。

**请求：**

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

| 字段 | 类型 | 说明 |
|------|------|------|
| `return1m` | number | 1 分钟收益率（%） |
| `priceZScore` | number | 相对滚动窗口的价格 Z 分数 |
| `volumeZScore` | number | 相对滚动窗口的成交量 Z 分数 |
| `oiChangePct` | number | 持仓量变化百分比 |
| `fundingRate` | number | 当前资金费率 |
| `fundingMean` | number | 历史滚动平均资金费率 |
| `basisPct` | number | 现货-期货基差百分比 |
| `basisMean` | number | 历史滚动平均基差 |
| `liquidationUsd1h` | number | 1 小时强平金额（USD） |
| `liquidationMean` | number | 平均强平金额 |
| `xResonance` | number | X/Twitter 事件共振分数（0-1） |

**响应：**

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

| Case | 标签 | 条件 | 说明 |
|------|------|------|------|
| A | Price + X | priceZ ≥ 2.0 且 xResonance ≥ 0.5 | 价格波动得到 X 舆情确认 |
| B | Price only | priceZ ≥ 2.0，X 偏弱 | 仅价格突破 |
| C | X only | xResonance ≥ 0.5，价格偏弱 | 仅叙事驱动，缺少价格确认 |
| D | Liquidation | liquidation dominance ≥ 0.7 | 强平瀑布事件 |

---

### 步骤 2：X 事件捕获

#### `POST /api/v1/x-events`

处理原始推文并提取结构化的 BTC 事件。支持批量输入。

**请求：**

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

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一推文 ID（用于去重） |
| `text` | string | 是 | 原始推文文本 |
| `userName` | string | 是 | 作者用户名 |
| `sourceTier` | string | 是 | `official` · `journalist` · `analyst` · `kol` |
| `createdAt` | string | 是 | ISO 8601 时间戳 |
| `isRetweet` | boolean | 否 | 默认：`false` |
| `isQuote` | boolean | 否 | 默认：`false` |
| `quotedText` | string | 否 | 被引用推文文本 |

**响应：**

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

**事件分类（基于规则）：**

| 事件类型 | 检测关键词 |
|----------|------------|
| `regulation` | SEC, CFTC, regulation, ban, legal, filing, rule change, compliance |
| `ETF` | ETF, IBIT, FBTC, inflow, outflow, fund flow, AUM |
| `macro` | Fed, FOMC, CPI, rate cut, rate hike, inflation, NFP, PCE, GDP, treasury yield |
| `treasury` | reserve, corporate buy, MicroStrategy, Saylor, bought BTC |
| `positioning` | liquidat*, squeeze, OI, open interest, funding |
| `onchain` | whale, exchange inflow/outflow, on-chain, transfer |
| `security` | hack, exploit, breach, stolen, vulnerability |
| `geopolitics` | war, sanction, conflict, tariff |

**来源可信度分数：**

| 层级 | 分数 | 示例账户 |
|------|------|----------|
| `official` | 0.95 | @saborofficial（MicroStrategy） |
| `journalist` | 0.75 | @NickTimiraos, @DeItaone |
| `analyst` | 0.60 | @EricBalchunas, @whale_alert, @VeloData |
| `kol` | 0.35 | @BitcoinMagazine, @APompliano |

**去重规则：** 推文通过精确 ID 匹配和标准化文本相似度（Jaccard，阈值 ≥ 0.85）进行去重。

**推文清洗流水线：**
1. 去除 `t.co` 链接
2. 移除 emoji 前缀（🚨🔥⚡️ 等）
3. 检测转推（`RT @` 前缀或 `isRetweet` 标记）→ 标记为 retelling
4. 检测引用推文重复（文本与 `quotedText` 相同）
5. 检测旧截图（日期模式 + "screenshot"/"看"/"from"）
6. 清洗后文本少于 10 个字符则丢弃

---

### 步骤 5：交易建议

#### `POST /api/v1/trade-advice`

基于聚合后的流水线输出生成交易建议。

**请求：**

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

| 字段 | 类型 | 说明 |
|------|------|------|
| `regime` | string | 来自步骤 0 的风险环境（`risk-on` / `risk-off` / `mixed`） |
| `topDriver` | object | 主导市场驱动 `{ name, direction, score }` |
| `triggerFired` | boolean | 步骤 1.5 是否触发 |
| `narrativeStage` | string | 叙事生命周期阶段（`seed` / `spreading` / `consensus`） |
| `narrativeCeiling` | string | 叙事所支持的最高交易级别（`ignore` / `watch` / `light` / `standard`） |
| `confirmationMode` | string | 确认方式（`none` / `breakout` / `followthrough` / `squeeze`） |
| `confirmationTradeability` | string | 确认门槛结果（`ignore` / `watch` / `actionable`） |
| `positioningHeat` | number | 持仓/拥挤度热度（0-1） |
| `continuationProbability` | number | 价格延续概率（0-1） |
| `entryQuality` | number | 入场时机质量分数（0-1） |

**响应：**

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
  "execution_note": "允许满仓，止损按确认模式设置",
  "review_required": true
}
```

**策略引擎（确定性分层上限模型）：**

```
Step 1: 持仓热度 > 0.8？ ──是──► AVOID（风险 = 0%）
        │ 否
Step 2: 根据确认结果确定原始级别：
        │  confirmationTradeability=ignore 或 mode=none  → IGNORE
        │  confirmationTradeability=actionable 且 theme > 0.6 → STANDARD
        │  confirmationTradeability=actionable 或 watch  → LIGHT
        │  否则 → WATCH
        ↓
Step 3: 应用叙事上限（级别不得高于 ceiling）
        ↓
Step 4: 方向：observe（ignore/watch）或 long（light/standard）
        ↓
Step 5: 风险预算分配：
        │  基础值：ignore=0%、watch=0%、light=25%、standard=50%
        │  若 regime=risk-off 且 direction=long，则 ×0.5
        │  若 regime=mixed，则 ×0.75
        │  若 positioning heat > 0.5，则 ×(1 - heat)
```

| 交易级别 | 方向 | 风险预算 | 动作 |
|----------|------|----------|------|
| `ignore` | observe | 0% | 无动作，条件不足 |
| `watch` | observe | 0% | 观察，不交易 |
| `light` | long | ≤ 25% | 缩小仓位，观察延续性 |
| `standard` | long | ≤ 50% | 全仓位，需人工复核 |
| `avoid` | observe | 0% | 强制退出，极端拥挤 |

---

## 核心模块

### 市场状态（步骤 0）

通过计算四类压力分数并选出主导驱动，来分类 BTC 市场环境。

**特征构建器** - 基于 sigmoid 的原始输入归一化：
- 宏观压力：f(dxyChange, nqChangePct)
- 资金流压力：f(etfNetFlowUsd)
- 持仓压力：f(oiChangePct, fundingRate, liquidationIntensity)
- 事件压力：f(volumeChangePct)

**分类器** - 从最高压力特征中选择市场状态：
- 阈值：LOW = 0.3，MIXED_DELTA = 0.15
- 低于 LOW → `mixed`
- 两个压力分数差值在 MIXED_DELTA 内 → `mixed`
- 否则 → 由最高压力项决定状态

### 触发门槛（步骤 1.5）

实时评估当前条件是否值得入场交易。

**特征构建器** - 将原始输入归一化为特征分数：
- 价格 Z 分数直接透传
- 成交量 Z 分数直接透传
- OI shift = (oiChangePct - 3) / 3（缩放后）
- Funding shift = (fundingRate - fundingMean) / fundingMean
- Basis shift = (basisPct - basisMean) / basisMean
- Liquidation intensity = liquidationUsd1h / liquidationMean
- X resonance 直接透传

**分类器** - 根据阈值判断触发案例（A/B/C/D）。

**滚动窗口** - 用于流式 Z 分数计算的工具类：
```typescript
const window = new RollingWindow(60); // 60 个样本窗口
window.push(value);
const z = window.zScore(currentValue);
```

### X 事件捕获（步骤 2）

将来自 10 个精选 X 账号的原始推文处理为结构化 BTC 事件信号。

**流水线：** 原始推文 → 清洗 → 去重 → 规则分类 → XEventOutput

**监控账号（共 10 个）：**

| 名单 | 关注方向 | 账号 |
|------|----------|------|
| A | 宏观 / 政策 / ETF | @NickTimiraos, @DeItaone, @EricBalchunas, @JSeyff |
| B | BTC 市场专业账号 | @glaborborn, @whale_alert, @VeloData |
| C | 高影响力账号 | @saborofficial, @BitcoinMagazine, @APompliano |

### 交易建议（步骤 5）

确定性策略引擎，消费步骤 0、1.5 和 2 的输出，生成可执行的 BTC 交易建议。

关键特性：
- **分层上限模型**：叙事上限 → 确认门槛 → 持仓热度
- 按确认模式自动生成 **invalidators**
- `standard` 和 `light` 交易都会标记 **review_required**
- 完整 reasoning 链记录在 `reasoning[]`

---

## 集成客户端

### Binance（免费，无需 API Key）

```typescript
import { BinanceSpotClient } from './integrations/binance/spotClient.js';
import { BinanceFuturesClient } from './integrations/binance/futuresClient.js';
import { BinanceWsClient } from './integrations/binance/wsClient.js';

// 现货
const spot = new BinanceSpotClient(env.BINANCE_BASE_URL);
await spot.getTicker('BTCUSDT');     // → { symbol, price }
await spot.get24hStats('BTCUSDT');   // → { volume, priceChangePercent }

// 合约
const futures = new BinanceFuturesClient(env.BINANCE_FUTURES_BASE_URL);
await futures.getFundingRate('BTCUSDT');   // → { fundingRate, fundingTime }
await futures.getOpenInterest('BTCUSDT');  // → { openInterest, symbol }
await futures.getPremiumIndex('BTCUSDT');  // → { markPrice, indexPrice, lastFundingRate }

// WebSocket（实时流）
const ws = new BinanceWsClient(env.BINANCE_WS_URL);
ws.connect(['btcusdt@trade', 'btcusdt@kline_1m']);
ws.on('message', (data) => { /* 处理流数据 */ });
ws.disconnect();
```

### OpenBB（自托管）

```typescript
import { OpenBBMacroClient } from './integrations/openbb/macroClient.js';
import { OpenBBCalendarClient } from './integrations/openbb/calendarClient.js';

const macro = new OpenBBMacroClient(env.OPENBB_BASE_URL);
await macro.getDXY();                    // → { value, timestamp }
await macro.getTreasuryYields();         // → { us2y, us10y }
await macro.getEquityIndex('NQ=F');      // → { value }

const calendar = new OpenBBCalendarClient(env.OPENBB_BASE_URL);
await calendar.getUpcomingEvents();      // → CalendarEvent[]
```

### AKTools（自托管）

```typescript
import { AKToolsETFFlowClient } from './integrations/aktools/etfFlowClient.js';
import { AKToolsStablecoinClient } from './integrations/aktools/stablecoinClient.js';

const etf = new AKToolsETFFlowClient(env.AKTOOLS_BASE_URL);
await etf.getBtcEtfNetFlow();            // → { netFlowUsd, date }

const stable = new AKToolsStablecoinClient(env.AKTOOLS_BASE_URL);
await stable.getStablecoinNetFlow();     // → { netFlow, date }
```

### 通过 twitterapi.io 访问 X（约 $15-30/月）

```typescript
import { TwitterApiIoClient } from './integrations/twitter/twitterApiIoClient.js';

const twitter = new TwitterApiIoClient(env.TWITTER_API_KEY);
await twitter.searchRecent('BTC ETF');               // → { tweets, has_next_page, next_cursor }
await twitter.getUserTweets('NickTimiraos');          // → { tweets, has_next_page, next_cursor }
```

### LLM 网关

在 OpenAI 和 DeepSeek 之间统一路由，并提供 fallback 支持。

```typescript
import { LLMGateway } from './lib/llm.js';

const llm = new LLMGateway({
  openaiApiKey: env.OPENAI_API_KEY,
  deepseekApiKey: env.DEEPSEEK_API_KEY,
});

const result = await llm.complete({
  model: 'openai',          // 'openai' → gpt-4o-mini | 'deepseek' → deepseek-chat
  messages: [{ role: 'user', content: 'Classify this event...' }],
  maxTokens: 512,           // 默认：512
  temperature: 0.3,         // 默认：0.3
  fallback: 'deepseek',     // 可选：错误时切换到备用提供方
});
// → { content, usedModel, inputTokens, outputTokens }
```

**月度成本预估：** OpenAI 约 $5-10，DeepSeek 约 $3-8。

---

## 数据库结构

SQLite 使用 WAL 模式并启用外键，Schema 会在启动时从 `db/schema.sql` 自动加载。

### 表

#### `market_snapshots`

来自各数据源的原始市场数据。

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | INTEGER PK | 自增主键 |
| `timestamp` | TEXT | 采集时间 |
| `btc_spot_price` | REAL | BTC 现货价格 |
| `btc_perp_price` | REAL | BTC 永续价格 |
| `btc_volume_24h` | REAL | 24 小时成交量 |
| `btc_oi` | REAL | 持仓量 |
| `btc_funding_rate` | REAL | 资金费率 |
| `btc_basis` | REAL | 现货-永续基差 |
| `dxy` | REAL | DXY 指数值 |
| `us2y` / `us10y` | REAL | 国债收益率 |
| `nq` / `spx` / `gold` | REAL | 股票/商品指数 |
| `etf_net_flow_usd` | REAL | BTC ETF 净流入 |
| `stablecoin_net_flow` | REAL | 稳定币净流量 |
| `raw_json` | TEXT | 完整原始数据 blob |

#### `regime_snapshots`

已分类的市场状态，与源快照关联。

| 列 | 类型 | 说明 |
|----|------|------|
| `market_regime` | TEXT | `macro-led` / `flow-led` / `positioning-led` / `event-led` / `mixed` |
| `primary_drivers` | TEXT | 主导因子的 JSON 数组 |
| `risk_environment` | TEXT | `risk-on` / `risk-off` / `mixed` |
| `btc_state` | TEXT | `trend` / `range` / `squeeze-prone` / `fragile` |
| `confidence` | REAL | 分类置信度 |
| `snapshot_id` | INTEGER FK | 关联 `market_snapshots` |

#### `x_events`

处理后的 X/Twitter 事件。

| 列 | 类型 | 说明 |
|----|------|------|
| `event_type` | TEXT | `macro` / `ETF` / `regulation` / `security` / ... |
| `source_tier` | TEXT | `official` / `journalist` / `analyst` / `kol` |
| `headline` | TEXT | 清洗后的事件标题 |
| `novelty` | TEXT | `new` / `update` / `recycled` / `stale-screenshot` |
| `first_order_event` | INTEGER | 1 = 一手事件，0 = 转述 |
| `btc_bias` | TEXT | `bullish` / `bearish` / `mixed` / `unclear` |

#### `trigger_snapshots`

触发门槛的评估记录。

| 列 | 类型 | 说明 |
|----|------|------|
| `triggered` | INTEGER | 0/1 |
| `trigger_type` | TEXT | 触发分类 |
| `case_label` | TEXT | A/B/C/D |
| `priority` | TEXT | low/medium/high |
| 特征列 | REAL | price_zscore、volume_zscore、oi_shift 等 |

#### `trade_advice`

与市场状态 + 触发条件关联的交易建议。

#### `shadow_book`

用于系统准确性审计的模拟交易记录。

---

## 测试

```bash
# 运行全部单元 + 集成测试（不包含真实 API smoke tests）
pnpm test

# 开发时使用监视模式
pnpm test:watch

# 运行指定模块测试
npx vitest run tests/market-regime/
npx vitest run tests/trigger-gate/
npx vitest run tests/x-events/
npx vitest run tests/trade-advice/
npx vitest run tests/e2e/

# 运行 smoke tests（需要真实 API 凭据和已启动的服务）
pnpm test:smoke
```

**测试数量（Phase 1）：**

| 模块 | 测试数 |
|------|--------|
| Market Regime | 12 |
| Trigger Gate | 12 |
| X Events | 23 |
| Trade Advice | 11 |
| E2E Pipeline | 2 |
| Helpers / Config | 2 |
| **总计** | **62** |

**E2E 场景：**
- `2024-01-btc-etf-approval.json` - ETF 批准、巨量净流入、flow-led 市场状态 → standard 建议
- `2025-03-fomc-dovish.json` - FOMC 偏鸽转向、macro-led 市场状态 → standard 建议

---

## 项目结构

```
trader42-btc/
├── src/
│   ├── app.ts                              # 入口文件（顶层 await）
│   ├── config/
│   │   └── env.ts                          # 经过 Zod 校验的环境变量配置
│   ├── server/
│   │   └── buildServer.ts                  # Fastify 初始化 + 路由注册
│   ├── lib/
│   │   ├── db.ts                           # SQLite（WAL 模式）单例
│   │   ├── llm.ts                          # LLM 网关（OpenAI + DeepSeek）
│   │   └── rollingWindow.ts                # Z-score 滚动窗口
│   ├── integrations/
│   │   ├── binance/
│   │   │   ├── spotClient.ts               # 现货 REST（ticker、24h stats）
│   │   │   ├── futuresClient.ts            # 合约 REST（资金费率、OI、premium）
│   │   │   ├── wsClient.ts                 # WebSocket（多流、自动重连）
│   │   │   └── types.ts                    # Binance 通用类型
│   │   ├── openbb/
│   │   │   ├── macroClient.ts              # DXY、国债、权益指数
│   │   │   └── calendarClient.ts           # 宏观日历事件
│   │   ├── aktools/
│   │   │   ├── etfFlowClient.ts            # BTC ETF 净流入
│   │   │   └── stablecoinClient.ts         # 稳定币净流量
│   │   └── twitter/
│   │       ├── twitterApiIoClient.ts       # 搜索 + 用户推文
│   │       └── sourceLists.ts              # 10 个精选账号（A/B/C 名单）
│   └── modules/
│       ├── market-regime/                  # 步骤 0
│       │   ├── regime.types.ts
│       │   ├── regime.featureBuilder.ts    # Sigmoid 压力分数
│       │   ├── regime.classifier.ts        # 主导压力分类器
│       │   ├── regime.service.ts           # 编排器
│       │   └── regime.route.ts             # POST + GET /api/v1/market-regime
│       ├── trigger-gate/                   # 步骤 1.5
│       │   ├── trigger.types.ts
│       │   ├── trigger.featureBuilder.ts   # 原始输入 → 归一化特征
│       │   ├── trigger.classifier.ts       # A/B/C/D 分类器
│       │   ├── trigger.service.ts          # 编排器
│       │   └── trigger.route.ts            # POST + GET /api/v1/trigger-gate
│       ├── x-events/                       # 步骤 2
│       │   ├── xEvent.types.ts
│       │   ├── xEvent.cleaner.ts           # URL/emoji 去除，转述检测
│       │   ├── xEvent.classifier.ts        # 基于关键词的事件分类
│       │   ├── xEvent.dedup.ts             # ID + Jaccard 文本去重
│       │   ├── xEvent.service.ts           # 清洗 → 去重 → 分类流水线
│       │   └── xEvent.route.ts             # POST /api/v1/x-events
│       └── trade-advice/                   # 步骤 5
│           ├── tradeAdvice.types.ts        # TradeAdvice 合约
│           ├── tradeAdvice.policy.ts       # 分层上限策略引擎
│           ├── tradeAdvice.service.ts      # 完整流水线编排
│           └── tradeAdvice.route.ts        # POST /api/v1/trade-advice
├── db/
│   ├── schema.sql                          # 6 表 SQLite schema
│   └── migrations/                         # 未来迁移
├── tests/
│   ├── fixtures/scenarios/                 # 历史回放 JSON
│   ├── market-regime/                      # 12 个测试
│   ├── trigger-gate/                       # 12 个测试
│   ├── x-events/                           # 23 个测试
│   ├── trade-advice/                       # 11 个测试
│   ├── e2e/pipeline.test.ts                # 2 个完整流水线测试
│   ├── integration-smoke/                  # 真实 API smoke tests
│   └── helpers/                            # 测试环境校验
├── docs/
│   └── plans/                              # 步骤实现计划
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 流水线流程

生成交易建议的完整数据流：

```
1. INGEST
   ├── Binance REST → 现货价格、24h stats、资金费率、OI、premium
   ├── Binance WS   → 实时成交、K 线
   ├── OpenBB        → DXY、国债收益率、NQ/SPX
   ├── AKTools       → BTC ETF 流、稳定币流
   └── twitterapi.io → 来自 10 个精选账号的推文

2. STEP 0: MARKET REGIME
   输入：MarketSnapshotInput（7 个字段）
   输出：RegimeOutput { market_regime, risk_environment, btc_state }

3. STEP 1.5: TRIGGER GATE
   输入：TriggerInput（11 个字段，实时）
   输出：TriggerOutput { triggered, case_label, priority }

4. STEP 2: X EVENT CAPTURE
   输入：原始推文（批量）
   输出：XEventOutput[] { event_type, btc_bias, first_order, urgency }

5. STEP 5: TRADE ADVICE
   输入：PipelineInput（聚合了步骤 0 + 1.5 + 2）
   输出：TradeAdvice { trade_level, direction, risk_budget_pct, invalidators }

6. PERSIST
   └── SQLite：market_snapshots → regime_snapshots → trigger_snapshots
               x_events → trade_advice → shadow_book
```

---

## 许可证

MIT
