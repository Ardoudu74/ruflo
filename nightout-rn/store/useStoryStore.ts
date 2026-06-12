import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';
import { Story } from '../types/story';

interface StoryStore {
  stories: Story[];
  add: (s: Story) => void;
  report: (id: string) => void;
  remove: (id: string) => void;
  purgeExpired: () => void;
  forVenue: (venueId: string) => Story[];
  forCity: (city: string) => Story[];
}

export const useStoryStore = create<StoryStore>()(
  persist(
  (set, get) => ({
  stories: [],
  add: (s) => set(st => ({ stories: [s, ...st.stories] })),
  report: (id) => set(st => ({
    stories: st.stories.map(s =>
      s.id === id
        ? { ...s, reportCount: s.reportCount + 1, status: s.reportCount + 1 >= 3 ? 'removed' : 'reported' }
        : s
    ),
  })),
  remove: (id) => set(st => ({ stories: st.stories.filter(s => s.id !== id) })),
  purgeExpired: () => {
    const now = Date.now();
    set(st => ({ stories: st.stories.filter(s => s.expiresAt > now && s.status !== 'removed') }));
  },
  forVenue: (venueId) => {
    const now = Date.now();
    return get().stories.filter(s => s.venueId === venueId && s.expiresAt > now && s.status === 'active');
  },
  forCity: (city) => {
    const now = Date.now();
    return get().stories.filter(s => s.city === city && s.expiresAt > now && s.status === 'active');
  },
  }),
  {
    name:    'nightout-stories',
    storage: createJSONStorage(() => asyncStorage),
    onRehydrateStorage: () => (state) => {
      state?.purgeExpired();
    },
  }
));
