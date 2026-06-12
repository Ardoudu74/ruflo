import { useEffect, useState } from 'react';
import { Venue } from '../types';
import { fetchPlaceDetails, PlacesDetails } from '../services/googlePlaces';
import { fetchTonightsEvents, EventbriteEvent } from '../services/eventbrite';
import { fetchWeather, WeatherData } from '../services/weather';

export interface LiveVenueData {
  places: PlacesDetails | null;
  events: EventbriteEvent[];
  weather: WeatherData | null;
  loading: boolean;
}

export function useLiveVenueData(venue: Venue | null | undefined): LiveVenueData {
  const [places, setPlaces] = useState<PlacesDetails | null>(null);
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!venue) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchPlaceDetails(venue),
      fetchTonightsEvents(venue.latitude, venue.longitude),
      fetchWeather(venue.latitude, venue.longitude),
    ]).then(([p, e, w]) => {
      if (cancelled) return;
      setPlaces(p);
      setEvents(e);
      setWeather(w);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [venue?.id]);

  return { places, events, weather, loading };
}
