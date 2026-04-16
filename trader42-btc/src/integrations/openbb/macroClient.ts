export class OpenBBMacroClient {
  private readonly headers: Record<string, string>;

  constructor(
    private baseUrl: string,
    token: string,
  ) {
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async getDXY(): Promise<{ value: number; timestamp: string }> {
    const res = await fetch(`${this.baseUrl}/openbb/api/v1/economy/index?symbol=DX-Y.NYB`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`OpenBB DXY error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return {
      value: Number(data.close ?? data.value ?? 0),
      timestamp: String(data.date ?? new Date().toISOString()),
    };
  }

  async getTreasuryYields(): Promise<{ us2y: number; us10y: number }> {
    const res = await fetch(`${this.baseUrl}/openbb/api/v1/economy/treasury`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`OpenBB treasury error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return { us2y: Number(data.us2y ?? 0), us10y: Number(data.us10y ?? 0) };
  }

  async getEquityIndex(symbol: string): Promise<{ value: number }> {
    const res = await fetch(
      `${this.baseUrl}/openbb/api/v1/economy/index?symbol=${encodeURIComponent(symbol)}`,
      { headers: this.headers },
    );
    if (!res.ok) throw new Error(`OpenBB index error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return { value: Number(data.close ?? data.value ?? 0) };
  }
}
