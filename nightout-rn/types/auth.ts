export type Genre =
  | 'Techno' | 'House' | 'Deep House' | 'Tech House' | 'Afro House'
  | 'Electronic' | 'Hip-Hop' | 'R&B' | 'Latin' | 'Reggaeton'
  | 'Commercial' | 'Open Format' | 'Multi-Floor' | 'Drum & Bass'
  | 'Disco' | 'Live Acts' | 'Industrial' | 'Garage' | 'Indie'
  | 'Alternative' | 'Funk' | 'Reggae' | 'Rock' | 'Show' | 'Sunset' | 'Minimal' | 'Ambient';

export type BudgetTier = 'free' | 'low' | 'mid' | 'high' | 'vip';
export type CrowdPref  = 'local' | 'mixed' | 'international';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  genres: Genre[];
  budget: BudgetTier;
  crowdPref: CrowdPref;
  emergencyContact?: EmergencyContact;
  savedVenueIds: string[];
  ticketHistory: string[];
  createdAt: number;
  ageVerified: boolean;
  dob?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export type AuthProvider = 'apple' | 'email' | 'guest';

export interface AuthState {
  uid: string | null;
  profile: UserProfile | null;
  provider: AuthProvider | null;
  loading: boolean;
  error: string | null;
}
