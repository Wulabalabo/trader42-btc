export function buildXEventPrompt(headline: string): string {
  return `Classify this BTC-related X event as strict JSON. Fields: event_type, source_credibility_score, first_order_event, btc_bias, novelty, urgency, confidence. Headline: ${headline}`;
}
