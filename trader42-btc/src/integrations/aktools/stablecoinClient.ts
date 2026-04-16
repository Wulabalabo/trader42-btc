export class AKToolsStablecoinClient {
  private readonly headers: Record<string, string>;

  constructor(
    private baseUrl: string,
    token: string,
  ) {
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async getStablecoinNetFlow(): Promise<{ netFlow: number; date: string }> {
    const res = await fetch(`${this.baseUrl}/aktools/api/public/stablecoin_flow`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`AKTools stablecoin flow error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return {
      netFlow: Number(data.net_flow ?? 0),
      date: String(data.date ?? new Date().toISOString()),
    };
  }
}
