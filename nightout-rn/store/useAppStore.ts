import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './storage';
import type { CityId, Venue } from '../types';
import { CITIES } from '../data/cities';
import { venuesByCity } from '../data/venues';

interface AppStore {
  selectedCityId: CityId;
  venues: Venue[];
  savedVenueIds: string[];
  fontsLoaded: boolean;

  setCity:        (id: CityId) => void;
  toggleSaved:    (id: string) => void;
  setFontsLoaded: (v: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      selectedCityId: 'ibiza',
      venues: venuesByCity('ibiza'),
      savedVenueIds: [],
      fontsLoaded: false,

      setCity: (id) => set({ selectedCityId: id, venues: venuesByCity(id) }),

      toggleSaved: (id) => {
        const { savedVenueIds } = get();
        const next = savedVenueIds.includes(id)
          ? savedVenueIds.filter(x => x !== id)
          : [...savedVenueIds, id];
        set({ savedVenueIds: next });
      },

      setFontsLoaded: (v) => set({ fontsLoaded: v }),
    }),
    {
      name:    'nightout-app',
      storage: createJSONStorage(() => secureStorage),
      partialize: (s) => ({ selectedCityId: s.selectedCityId, savedVenueIds: s.savedVenueIds }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.venues = venuesByCity(state.selectedCityId);
        }
      },
    }
  )
);

export const selectedCity = () => {
  const id = useAppStore.getState().selectedCityId;
  return CITIES.find(c => c.id === id)!;
};
