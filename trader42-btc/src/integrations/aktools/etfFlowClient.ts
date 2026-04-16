export class AKToolsETFFlowClient {
  constructor(private baseUrl: string) {}

  async getBtcEtfNetFlow(): Promise<{ netFlowUsd: number; date: string }> {
    const res = await fetch(`${this.baseUrl}/api/public/btc_etf_flow`);
    if (!res.ok) throw new Error(`AKTools ETF flow error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return {
      netFlowUsd: Number(data.net_flow_usd ?? 0),
      date: String(data.date ?? new Date().toISOString()),
    };
  }
}
