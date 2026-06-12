import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './storage';
import type { AuthState, UserProfile } from '../types/auth';

interface AuthStore extends AuthState {
  setAuth:      (uid: string, provider: 'apple' | 'email' | 'guest') => void;
  setProfile:   (profile: UserProfile) => void;
  patchProfile: (partial: Partial<UserProfile>) => void;
  signOut:      () => void;
  setError:     (err: string | null) => void;
  setLoading:   (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      uid:     null,
      profile: null,
      provider:null,
      loading: false,
      error:   null,

      setAuth: (uid, provider) => set({ uid, provider, error: null }),

      setProfile: (profile) => set({ profile }),

      patchProfile: (partial) => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, ...partial } });
      },

      signOut: () => set({ uid: null, profile: null, provider: null }),

      setError:   (error)   => set({ error }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name:    'nightout-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (s) => ({ uid: s.uid, profile: s.profile, provider: s.provider }),
    }
  )
);

export const selectIsAuthenticated = (s: AuthStore) => !!s.uid && s.uid !== 'guest';
export const selectHasProfile      = (s: AuthStore) => !!s.profile?.genres?.length;
export const selectAgeVerified     = (s: AuthStore) => !!s.profile?.ageVerified;
