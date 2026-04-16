export class BinanceFuturesClient {
  constructor(private baseUrl: string) {}

  async getFundingRate(symbol: string) {
    const res = await fetch(
      `${this.baseUrl}/fapi/v1/fundingRate?symbol=${encodeURIComponent(symbol)}&limit=1`,
    );
    if (!res.ok) throw new Error(`Binance futures error: ${res.status}`);
    const data = (await res.json()) as Array<{ fundingRate: string; fundingTime: number }>;
    return data[0];
  }

  async getOpenInterest(symbol: string) {
    const res = await fetch(
      `${this.baseUrl}/fapi/v1/openInterest?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) throw new Error(`Binance futures error: ${res.status}`);
    return res.json() as Promise<{ openInterest: string; symbol: string }>;
  }

  async getPremiumIndex(symbol: string) {
    const res = await fetch(
      `${this.baseUrl}/fapi/v1/premiumIndex?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) throw new Error(`Binance futures error: ${res.status}`);
    return res.json() as Promise<{
      symbol: string;
      markPrice: string;
      indexPrice: string;
      lastFundingRate: string;
    }>;
  }
}
