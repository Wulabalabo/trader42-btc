export interface SourceAccount {
  userName: string;
  tier: 'official' | 'journalist' | 'analyst' | 'kol';
  list: 'A' | 'B' | 'C';
  description: string;
}

/** List A: Macro / Policy / ETF primary sources */
export const LIST_A: SourceAccount[] = [
  { userName: 'NickTimiraos', tier: 'journalist', list: 'A', description: 'WSJ Fed reporter' },
  { userName: 'DeItaone', tier: 'journalist', list: 'A', description: 'Walter Bloomberg - breaking news' },
  { userName: 'EricBalchunas', tier: 'analyst', list: 'A', description: 'Bloomberg ETF analyst' },
  { userName: 'JSeyff', tier: 'analyst', list: 'A', description: 'Bloomberg ETF analyst' },
];

/** List B: BTC market professionals */
export const LIST_B: SourceAccount[] = [
  { userName: 'glaborborn', tier: 'analyst', list: 'B', description: 'Glassnode co-founder' },
  { userName: 'whale_alert', tier: 'analyst', list: 'B', description: 'Large tx tracker' },
  { userName: 'VeloData', tier: 'analyst', list: 'B', description: 'Derivatives data' },
];

/** List C: BTC high-impact accounts */
export const LIST_C: SourceAccount[] = [
  { userName: 'saborofficial', tier: 'official', list: 'C', description: 'MicroStrategy' },
  { userName: 'BitcoinMagazine', tier: 'kol', list: 'C', description: 'Bitcoin Magazine' },
  { userName: 'APompliano', tier: 'kol', list: 'C', description: 'Anthony Pompliano' },
];

export const ALL_SOURCES: SourceAccount[] = [...LIST_A, ...LIST_B, ...LIST_C];
