export class AKToolsStablecoinClient {
  constructor(private baseUrl: string) {}

  async getStablecoinNetFlow(): Promise<{ netFlow: number; date: string }> {
    const res = await fetch(`${this.baseUrl}/api/public/stablecoin_flow`);
    if (!res.ok) throw new Error(`AKTools stablecoin flow error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    return {
      netFlow: Number(data.net_flow ?? 0),
      date: String(data.date ?? new Date().toISOString()),
    };
  }
}
