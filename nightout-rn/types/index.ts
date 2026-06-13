export type Genre =
  | 'Techno' | 'House' | 'Deep House' | 'Tech House' | 'Afro House'
  | 'Electronic' | 'Hip-Hop' | 'R&B' | 'Latin' | 'Reggaeton'
  | 'Commercial' | 'Open Format' | 'Multi-Floor' | 'Drum & Bass'
  | 'Jungle' | 'Disco' | 'Minimal' | 'Ambient' | 'Live Acts'
  | 'Industrial' | 'Garage' | 'Indie' | 'Fetish' | 'Alternative'
  | 'Funk' | 'Reggae' | 'Rock' | 'Show' | 'Sunset';

export type Audience = 'local' | 'tourist' | 'mixed' | 'international';
export type PriceRange = 'free' | '€' | '€€' | '€€€' | '€€€€';

export interface Venue {
  id: string;
  name: string;
  city: CityId;
  neighborhood: string;
  genres: Genre[];
  priceRange: PriceRange;
  entryFee?: string;
  googleRating: number;
  capacity: number;
  openingHours: string;
  dressCode: string;
  audience: Audience;
  localRatio: number;
  latitude: number;
  longitude: number;
  website?: string;
  instagramHandle?: string;
  isOpen: boolean;
  isTrending?: boolean;
  matchScore?: number;
  logoAsset?: string;
}

export type CityId =
  | 'ibiza' | 'valencia' | 'barcelona' | 'paris' | 'berlin'
  | 'london' | 'miami' | 'newyork' | 'dubai' | 'mykonos'
  | 'madrid' | 'amsterdam' | 'lisbon' | 'prague' | 'lyon'
  | 'marseille' | 'sainttropez' | 'la' | 'istanbul' | 'montreal'
  | 'bangkok' | 'sydney' | 'cancun' | 'tulum';

export interface City {
  id: CityId;
  name: string;
  country: string;
  flag: string;
  timezone: string;
  latitude: number;
  longitude: number;
}
