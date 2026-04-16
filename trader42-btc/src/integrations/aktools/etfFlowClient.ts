export class AKToolsETFFlowClient {
  private readonly headers: Record<string, string>;

  constructor(
    private baseUrl: string,
    token: string,
  ) {
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async getBtcEtfNetFlow(): Promise<{ netFlowUsd: number; date: string }> {
    const res = await fetch(`${this.baseUrl}/aktools/api/public/btc_etf_flow`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`AKTools ETF flow error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return {
      netFlowUsd: Number(data.net_flow_usd ?? 0),
      date: String(data.date ?? new Date().toISOString()),
    };
  }
}
