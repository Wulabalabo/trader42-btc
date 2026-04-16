export interface SourceAccount {
  username: string;
  tier: 'official' | 'journalist' | 'analyst' | 'kol';
  pollIntervalSec: number;
}

export const SOURCE_LISTS = {
  A: [
    { username: 'NickTimiraos', tier: 'journalist', pollIntervalSec: 60 },
    { username: 'DeItaone', tier: 'journalist', pollIntervalSec: 30 },
    { username: 'EricBalchunas', tier: 'journalist', pollIntervalSec: 60 },
    { username: 'JSeyff', tier: 'journalist', pollIntervalSec: 60 },
    { username: 'BitMEXResearch', tier: 'analyst', pollIntervalSec: 120 },
  ] as SourceAccount[],
  B: [
    { username: 'whale_alert', tier: 'analyst', pollIntervalSec: 60 },
    { username: 'lookonchain', tier: 'analyst', pollIntervalSec: 60 },
    { username: 'EmberCN', tier: 'analyst', pollIntervalSec: 60 },
    { username: 'ki_young_ju', tier: 'analyst', pollIntervalSec: 120 },
    { username: 'VeloData', tier: 'analyst', pollIntervalSec: 120 },
  ] as SourceAccount[],
  C: [
    { username: 'DocumentingBTC', tier: 'kol', pollIntervalSec: 300 },
    { username: 'BitcoinMagazine', tier: 'kol', pollIntervalSec: 300 },
    { username: 'APompliano', tier: 'kol', pollIntervalSec: 300 },
  ] as SourceAccount[],
} as const;

export const LIST_A = SOURCE_LISTS.A;
export const LIST_B = SOURCE_LISTS.B;
export const LIST_C = SOURCE_LISTS.C;
export const ALL_SOURCES: SourceAccount[] = [...SOURCE_LISTS.A, ...SOURCE_LISTS.B, ...SOURCE_LISTS.C];

export function getSourceTier(username: string): SourceAccount['tier'] {
  const account = ALL_SOURCES.find((item) => item.username.toLowerCase() === username.toLowerCase());
  return account?.tier ?? 'kol';
}

export function getAllAccounts(): SourceAccount[] {
  return ALL_SOURCES;
}
