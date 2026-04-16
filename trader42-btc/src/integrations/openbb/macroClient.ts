export class OpenBBMacroClient {
  constructor(private baseUrl: string) {}

  async getDXY(): Promise<{ value: number; timestamp: string }> {
    const res = await fetch(`${this.baseUrl}/api/v1/economy/index?symbol=DX-Y.NYB`);
    if (!res.ok) throw new Error(`OpenBB DXY error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return {
      value: Number(data.close ?? data.value ?? 0),
      timestamp: String(data.date ?? new Date().toISOString()),
    };
  }

  async getTreasuryYields(): Promise<{ us2y: number; us10y: number }> {
    const res = await fetch(`${this.baseUrl}/api/v1/economy/treasury`);
    if (!res.ok) throw new Error(`OpenBB treasury error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return { us2y: Number(data.us2y ?? 0), us10y: Number(data.us10y ?? 0) };
  }

  async getEquityIndex(symbol: string): Promise<{ value: number }> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/economy/index?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) throw new Error(`OpenBB index error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return { value: Number(data.close ?? data.value ?? 0) };
  }
}
