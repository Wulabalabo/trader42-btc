export interface SpotTicker {
  symbol: string;
  price: string;
}

export interface Stats24h {
  volume: string;
  priceChangePercent: string;
}

export interface FundingRate {
  fundingRate: string;
  fundingTime: number;
}

export interface OpenInterest {
  openInterest: string;
  symbol: string;
}

export interface PremiumIndex {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  lastFundingRate: string;
}
