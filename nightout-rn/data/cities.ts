import type { City } from '../types';

export const CITIES: City[] = [
  { id: 'ibiza',       name: 'Ibiza',        country: 'Spain',   flag: '🇪🇸', timezone: 'Europe/Madrid',    latitude: 38.9067,  longitude: 1.4206   },
  { id: 'valencia',    name: 'Valencia',     country: 'Spain',   flag: '🇪🇸', timezone: 'Europe/Madrid',    latitude: 39.4699,  longitude: -0.3763  },
  { id: 'barcelona',   name: 'Barcelona',    country: 'Spain',   flag: '🇪🇸', timezone: 'Europe/Madrid',    latitude: 41.3851,  longitude: 2.1734   },
  { id: 'paris',       name: 'Paris',        country: 'France',  flag: '🇫🇷', timezone: 'Europe/Paris',     latitude: 48.8566,  longitude: 2.3522   },
  { id: 'berlin',      name: 'Berlin',       country: 'Germany', flag: '🇩🇪', timezone: 'Europe/Berlin',    latitude: 52.5200,  longitude: 13.4050  },
  { id: 'london',      name: 'London',       country: 'UK',      flag: '🇬🇧', timezone: 'Europe/London',    latitude: 51.5074,  longitude: -0.1278  },
  { id: 'miami',       name: 'Miami',        country: 'USA',     flag: '🇺🇸', timezone: 'America/New_York', latitude: 25.7617,  longitude: -80.1918 },
  { id: 'newyork',     name: 'New York',     country: 'USA',     flag: '🇺🇸', timezone: 'America/New_York', latitude: 40.7128,  longitude: -74.0060 },
  { id: 'dubai',       name: 'Dubai',        country: 'UAE',     flag: '🇦🇪', timezone: 'Asia/Dubai',       latitude: 25.2048,  longitude: 55.2708  },
  { id: 'mykonos',     name: 'Mykonos',      country: 'Greece',  flag: '🇬🇷', timezone: 'Europe/Athens',    latitude: 37.4467,  longitude: 25.3289  },
  { id: 'madrid',      name: 'Madrid',       country: 'Spain',   flag: '🇪🇸', timezone: 'Europe/Madrid',    latitude: 40.4168,  longitude: -3.7038  },
  { id: 'amsterdam',   name: 'Amsterdam',    country: 'Netherlands', flag: '🇳🇱', timezone: 'Europe/Amsterdam', latitude: 52.3676, longitude: 4.9041 },
  { id: 'lisbon',      name: 'Lisbon',       country: 'Portugal', flag: '🇵🇹', timezone: 'Europe/Lisbon',   latitude: 38.7223,  longitude: -9.1393  },
  { id: 'prague',      name: 'Prague',       country: 'Czech Republic', flag: '🇨🇿', timezone: 'Europe/Prague', latitude: 50.0755, longitude: 14.4378 },
  { id: 'lyon',        name: 'Lyon',         country: 'France',  flag: '🇫🇷', timezone: 'Europe/Paris',     latitude: 45.7640,  longitude: 4.8357   },
  { id: 'marseille',   name: 'Marseille',    country: 'France',  flag: '🇫🇷', timezone: 'Europe/Paris',     latitude: 43.2965,  longitude: 5.3698   },
  { id: 'sainttropez', name: 'Saint-Tropez', country: 'France',  flag: '🇫🇷', timezone: 'Europe/Paris',     latitude: 43.2727,  longitude: 6.6407   },
  { id: 'la',          name: 'Los Angeles',  country: 'USA',     flag: '🇺🇸', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 },
  { id: 'istanbul',    name: 'Istanbul',     country: 'Turkey',  flag: '🇹🇷', timezone: 'Europe/Istanbul',  latitude: 41.0082,  longitude: 28.9784  },
  { id: 'montreal',    name: 'Montréal',     country: 'Canada',  flag: '🇨🇦', timezone: 'America/Toronto',  latitude: 45.5017,  longitude: -73.5673 },
  { id: 'bangkok',     name: 'Bangkok',      country: 'Thailand', flag: '🇹🇭', timezone: 'Asia/Bangkok',    latitude: 13.7563,  longitude: 100.5018 },
  { id: 'sydney',      name: 'Sydney',       country: 'Australia', flag: '🇦🇺', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
  { id: 'cancun',      name: 'Cancún',       country: 'Mexico',  flag: '🇲🇽', timezone: 'America/Cancun',  latitude: 21.1619,  longitude: -86.8515 },
  { id: 'tulum',       name: 'Tulum',        country: 'Mexico',  flag: '🇲🇽', timezone: 'America/Cancun',  latitude: 20.2100,  longitude: -87.4654 },
];

export const CITY_MAP = Object.fromEntries(CITIES.map(c => [c.id, c])) as Record<string, City>;
