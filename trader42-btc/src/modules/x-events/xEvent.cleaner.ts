interface CleanerInput {
  text: string;
  isRetweet: boolean;
  isQuote: boolean;
  quotedText?: string;
}

const URL_REGEX = /https?:\/\/t\.co\/\S+/g;
const EMOJI_PREFIX_REGEX = /^[\u{1F600}-\u{1FFFF}\u{2600}-\u{26FF}\s🚨⚡️🔥]+/u;
const STALE_DATE_REGEX = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+20\d{2}\b/i;

export function cleanRawTweet(input: CleanerInput) {
  const cleanedText = input.text.replace(URL_REGEX, '').replace(EMOJI_PREFIX_REGEX, '').trim();
  const isRetelling = input.isRetweet || input.text.startsWith('RT @');
  const isDuplicate =
    input.isQuote && !!input.quotedText && input.text.trim() === input.quotedText.trim();
  const possibleStaleScreenshot =
    STALE_DATE_REGEX.test(input.text) && /screenshot|看|from/i.test(input.text);

  return {
    cleanedText,
    firstOrderCandidate: !isRetelling && !isDuplicate,
    isRetelling,
    isDuplicate,
    possibleStaleScreenshot,
  };
}
