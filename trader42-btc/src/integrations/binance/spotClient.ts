export class BinanceSpotClient {
  constructor(private baseUrl: string) {}

  async getTicker(symbol: string): Promise<{ symbol: string; price: string }> {
    const res = await fetch(
      `${this.baseUrl}/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) throw new Error(`Binance spot error: ${res.status}`);
    return res.json() as Promise<{ symbol: string; price: string }>;
  }

  async get24hStats(symbol: string): Promise<{ volume: string; priceChangePercent: string }> {
    const res = await fetch(
      `${this.baseUrl}/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) throw new Error(`Binance spot error: ${res.status}`);
    return res.json() as Promise<{ volume: string; priceChangePercent: string }>;
  }
}
