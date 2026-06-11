import { create } from 'zustand';

export interface SafeNightState {
  enabled:           boolean;
  sharingActive:     boolean;
  currentLat:        number | null;
  currentLng:        number | null;
  lastUpdate:        number | null;
  sosTriggered:      boolean;
  locationError:     string | null;
}

interface SafeNightStore extends SafeNightState {
  enable:       () => void;
  disable:      () => void;
  setLocation:  (lat: number, lng: number) => void;
  triggerSOS:   () => void;
  resetSOS:     () => void;
  setLocError:  (e: string | null) => void;
}

export const useSafeNightStore = create<SafeNightStore>((set) => ({
  enabled:        false,
  sharingActive:  false,
  currentLat:     null,
  currentLng:     null,
  lastUpdate:     null,
  sosTriggered:   false,
  locationError:  null,

  enable:  () => set({ enabled: true, sharingActive: true }),
  disable: () => set({ enabled: false, sharingActive: false }),

  setLocation: (lat, lng) =>
    set({ currentLat: lat, currentLng: lng, lastUpdate: Date.now(), locationError: null }),

  triggerSOS:  () => set({ sosTriggered: true }),
  resetSOS:    () => set({ sosTriggered: false }),
  setLocError: (locationError) => set({ locationError }),
}));
