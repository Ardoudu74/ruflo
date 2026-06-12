const TOKEN = process.env.EXPO_PUBLIC_EVENTBRITE_TOKEN ?? '';
const BASE = 'https://www.eventbriteapi.com/v3';

export interface EventbriteEvent {
  id: string;
  name: string;
  url: string;
  start: string;
  end: string;
  isFree: boolean;
  ticketUrl: string;
  description: string;
}

export async function fetchTonightsEvents(lat: number, lng: number, radiusKm = 2): Promise<EventbriteEvent[]> {
  if (!TOKEN) return [];
  const now = new Date();
  const tonight = new Date(now);
  tonight.setHours(20, 0, 0, 0);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);

  const startUtc = tonight.toISOString().replace('.000', '');
  const endUtc = tomorrow.toISOString().replace('.000', '');

  const params = new URLSearchParams({
    'location.latitude': String(lat),
    'location.longitude': String(lng),
    'location.within': `${radiusKm}km`,
    'start_date.range_start': startUtc,
    'start_date.range_end': endUtc,
    categories: '103',
    expand: 'ticket_availability',
  });

  try {
    const r = await fetch(`${BASE}/events/search/?${params}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const j = await r.json();
    return (j.events ?? []).map((e: Record<string, any>) => ({
      id: e.id,
      name: e.name?.text ?? '',
      url: e.url,
      start: e.start?.local ?? '',
      end: e.end?.local ?? '',
      isFree: e.is_free ?? false,
      ticketUrl: e.url,
      description: e.description?.text?.slice(0, 200) ?? '',
    }));
  } catch {
    return [];
  }
}
