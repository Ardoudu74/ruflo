import { useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import type { Venue } from '../types';

function computeMatch(venue: Venue, genres: string[], budget: string, crowdPref: string): number {
  let score = 0;

  if (genres.length > 0) {
    const overlap = venue.genres.filter(g => genres.includes(g)).length;
    score += Math.min(0.5, overlap * 0.25);
  }

  const budgetMap: Record<string, string[]> = {
    free: ['free', '€'],
    low:  ['€', '€€'],
    mid:  ['€€', '€€€'],
    high: ['€€€', '€€€€'],
    vip:  ['€€€', '€€€€'],
  };
  if (budget && budgetMap[budget]?.includes(venue.priceRange)) {
    score += 0.25;
  }

  const crowdMap: Record<string, string[]> = {
    local:         ['local'],
    mixed:         ['mixed', 'local', 'international'],
    international: ['international', 'mixed'],
  };
  if (crowdPref && crowdMap[crowdPref]?.includes(venue.audience)) {
    score += 0.25;
  }

  return Math.min(1, score);
}

export function useMatchScores(): Venue[] {
  const { venues } = useAppStore();
  const profile = useAuthStore(s => s.profile);

  return useMemo(() => {
    if (!profile?.genres?.length) return venues;
    return venues.map(v => ({
      ...v,
      matchScore: computeMatch(v, profile.genres, profile.budget, profile.crowdPref),
    })).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }, [venues, profile?.genres, profile?.budget, profile?.crowdPref]);
}
