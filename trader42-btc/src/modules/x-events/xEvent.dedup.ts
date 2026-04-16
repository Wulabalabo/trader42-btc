const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function similarity(a: string, b: string): number {
  const setA = new Set(a.split(' '));
  const setB = new Set(b.split(' '));
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  return intersection / Math.max(setA.size, setB.size);
}

const SIMILARITY_THRESHOLD = 0.85;

export function isDuplicate(
  tweetId: string,
  text: string,
  seenIds: Set<string>,
  seenTexts: string[] = [],
): boolean {
  if (seenIds.has(tweetId)) return true;

  const normalizedText = normalize(text);
  for (const seen of seenTexts) {
    if (similarity(normalizedText, normalize(seen)) >= SIMILARITY_THRESHOLD) {
      return true;
    }
  }

  return false;
}
