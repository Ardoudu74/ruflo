import { create } from 'zustand';
import { VenueOwnerProfile, VenueEvent } from '../types/venue-owner';

interface VenueOwnerStore {
  profile: VenueOwnerProfile | null;
  events: VenueEvent[];
  setProfile: (p: VenueOwnerProfile) => void;
  addEvent: (e: VenueEvent) => void;
  updateEvent: (id: string, patch: Partial<VenueEvent>) => void;
  deleteEvent: (id: string) => void;
  publishEvent: (id: string) => void;
}

export const useVenueOwnerStore = create<VenueOwnerStore>((set) => ({
  profile: null,
  events: [],
  setProfile: (p) => set({ profile: p }),
  addEvent: (e) => set(s => ({ events: [e, ...s.events] })),
  updateEvent: (id, patch) => set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...patch } : e) })),
  deleteEvent: (id) => set(s => ({ events: s.events.filter(e => e.id !== id) })),
  publishEvent: (id) => set(s => ({ events: s.events.map(e => e.id === id ? { ...e, published: true } : e) })),
}));
