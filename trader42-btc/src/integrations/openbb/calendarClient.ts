export interface CalendarEvent {
  date: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
}

export class OpenBBCalendarClient {
  private readonly headers: Record<string, string>;

  constructor(
    private baseUrl: string,
    token: string,
  ) {
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    const res = await fetch(`${this.baseUrl}/openbb/api/v1/economy/calendar`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`OpenBB calendar error: ${res.status}`);
    return res.json() as Promise<CalendarEvent[]>;
  }
}
