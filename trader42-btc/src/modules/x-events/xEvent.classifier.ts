import type { EventType, BtcBias } from './xEvent.types.js';

const EVENT_KEYWORDS: Record<string, string[]> = {
  regulation: ['SEC', 'CFTC', 'regulation', 'ban', 'legal', 'filing', 'rule change', 'compliance'],
  ETF: ['ETF', 'IBIT', 'FBTC', 'inflow', 'outflow', 'fund flow', 'AUM'],
  macro: ['Fed', 'FOMC', 'CPI', 'rate cut', 'rate hike', 'inflation', 'NFP', 'PCE', 'GDP', 'treasury yield'],
  treasury: ['reserve', 'corporate buy', 'MicroStrategy', 'Saylor', 'bought BTC', 'company buy'],
  positioning: ['liquidat', 'squeeze', 'short squeeze', 'long squeeze', 'OI', 'open interest', 'funding'],
  onchain: ['whale', 'exchange inflow', 'exchange outflow', 'on-chain', 'onchain', 'transfer'],
  security: ['hack', 'exploit', 'breach', 'stolen', 'vulnerability'],
  geopolitics: ['war', 'sanction', 'geopolit', 'conflict', 'tariff'],
};

const TIER_CREDIBILITY: Record<string, number> = {
  official: 0.95,
  journalist: 0.75,
  analyst: 0.6,
  kol: 0.35,
};

const BULLISH_KEYWORDS = ['inflow', 'buy', 'bought', 'bullish', 'approve', 'rate cut', 'dovish', 'reserve'];
const BEARISH_KEYWORDS = ['outflow', 'sell', 'sold', 'bearish', 'reject', 'rate hike', 'hawkish', 'ban', 'hack'];

export function classifyXEventRule(input: {
  cleanedText: string;
  sourceTier: string;
  isFirstOrderCandidate: boolean;
}) {
  const text = input.cleanedText.toLowerCase();

  let event_type: EventType = 'unknown';
  for (const [type, keywords] of Object.entries(EVENT_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      event_type = type as EventType;
      break;
    }
  }

  const hasBullish = BULLISH_KEYWORDS.some((kw) => text.includes(kw));
  const hasBearish = BEARISH_KEYWORDS.some((kw) => text.includes(kw));
  const btc_bias: BtcBias =
    hasBullish && !hasBearish ? 'bullish' : hasBearish && !hasBullish ? 'bearish' : 'unclear';

  return {
    event_type,
    source_credibility_score: TIER_CREDIBILITY[input.sourceTier] ?? 0.3,
    first_order_event:
      input.isFirstOrderCandidate && ['official', 'journalist'].includes(input.sourceTier),
    btc_bias,
    novelty: 'new' as const,
    urgency: event_type === 'security' ? 3 : event_type === 'regulation' ? 2 : 1,
    confidence: TIER_CREDIBILITY[input.sourceTier] ?? 0.3,
  };
}
