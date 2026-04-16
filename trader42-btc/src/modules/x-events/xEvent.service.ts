import type { XEventOutput } from './xEvent.types.js';
import { cleanRawTweet } from './xEvent.cleaner.js';
import { classifyXEvent } from './xEvent.classifier.js';
import { isDuplicate } from './xEvent.dedup.js';
import type { XEventRepository } from './xEvent.repository.js';

interface RawTweetInput {
  id: string;
  text: string;
  userName: string;
  sourceTier: string;
  createdAt: string;
  isRetweet: boolean;
  isQuote: boolean;
  quotedText?: string;
}

const seenIds = new Set<string>();
const seenTexts: string[] = [];
const MAX_SEEN_TEXTS = 500;

export async function processRawTweet(
  input: RawTweetInput,
  options: {
    gateway?: {
      completeForStep: (
        step: 'step2',
        request: {
          messages: Array<{ role: string; content: string }>;
          maxTokens?: number;
          temperature?: number;
        },
      ) => Promise<{ content: string }>;
    };
    repository?: XEventRepository;
  } = {},
): Promise<XEventOutput | null> {
  if (isDuplicate(input.id, input.text, seenIds, seenTexts)) {
    return null;
  }

  const cleaned = cleanRawTweet({
    text: input.text,
    isRetweet: input.isRetweet,
    isQuote: input.isQuote,
    quotedText: input.quotedText,
  });

  if (!cleaned.cleanedText || cleaned.cleanedText.length < 10) {
    return null;
  }

  const classification = await classifyXEvent(
    {
      cleanedText: cleaned.cleanedText,
      sourceTier: input.sourceTier,
      isFirstOrderCandidate: cleaned.firstOrderCandidate,
    },
    { gateway: options.gateway },
  );

  // Track for dedup
  seenIds.add(input.id);
  seenTexts.push(input.text);
  if (seenTexts.length > MAX_SEEN_TEXTS) {
    seenTexts.splice(0, seenTexts.length - MAX_SEEN_TEXTS);
  }

  const novelty = cleaned.possibleStaleScreenshot ? 'stale-screenshot' as const : classification.novelty;

  const output = {
    timestamp: input.createdAt || new Date().toISOString(),
    asset: 'BTC',
    event_type: classification.event_type,
    source_tier: input.sourceTier as XEventOutput['source_tier'],
    source_credibility_score: classification.source_credibility_score,
    headline: cleaned.cleanedText.slice(0, 280),
    novelty,
    first_order_event: classification.first_order_event,
    btc_bias: classification.btc_bias,
    urgency: classification.urgency,
    confidence: classification.confidence,
  } satisfies XEventOutput;

  options.repository?.save(output);
  return output;
}

export function resetDedup() {
  seenIds.clear();
  seenTexts.length = 0;
}
