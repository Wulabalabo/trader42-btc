export function buildNarrativePrompt(headlines: string[]): string {
  return `Group these BTC headlines into narrative themes and label each theme stage as seed, spreading, consensus, crowded, or fading:\n${headlines.join('\n')}`;
}
