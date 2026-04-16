export interface CalendarEvent {
  date: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
}

export class OpenBBCalendarClient {
  constructor(private baseUrl: string) {}

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/economy/calendar`);
    if (!res.ok) throw new Error(`OpenBB calendar error: ${res.status}`);
    return res.json() as Promise<CalendarEvent[]>;
  }
}
