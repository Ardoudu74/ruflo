import { Venue } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? '';
const BASE = 'https://maps.googleapis.com/maps/api';

export interface PlacesDetails {
  googleRating: number;
  totalRatings: number;
  openNow: boolean;
  hours: string[];
  photoUrls: string[];
  website?: string;
  phone?: string;
}

async function searchPlaceId(venue: Venue): Promise<string | null> {
  const query = encodeURIComponent(`${venue.name} ${venue.city} nightclub`);
  const url = `${BASE}/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&locationbias=point:${venue.latitude},${venue.longitude}&key=${API_KEY}`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    return j.candidates?.[0]?.place_id ?? null;
  } catch {
    return null;
  }
}

export async function fetchPlaceDetails(venue: Venue): Promise<PlacesDetails | null> {
  if (!API_KEY) return null;
  const placeId = await searchPlaceId(venue);
  if (!placeId) return null;

  const fields = 'rating,user_ratings_total,opening_hours,photos,website,formatted_phone_number';
  const url = `${BASE}/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    const d = j.result;
    if (!d) return null;
    const photoUrls = (d.photos ?? []).slice(0, 5).map((p: { photo_reference: string }) =>
      `${BASE}/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${API_KEY}`
    );
    return {
      googleRating: d.rating ?? venue.googleRating,
      totalRatings: d.user_ratings_total ?? 0,
      openNow: d.opening_hours?.open_now ?? false,
      hours: d.opening_hours?.weekday_text ?? [],
      photoUrls,
      website: d.website,
      phone: d.formatted_phone_number,
    };
  } catch {
    return null;
  }
}
