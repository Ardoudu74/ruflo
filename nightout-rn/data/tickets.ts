import type { TicketType, TicketTier } from '../types/ticket';
import type { PriceRange } from '../types';
import { VENUES } from './venues';

const BASE: Record<TicketTier, { label: string; description: string; baseCents: number; perks?: string[] }> = {
  early:     { label:'EARLY BIRD',  description:'Pre-sale, limited stock',           baseCents: 1500 },
  general:   { label:'GENERAL',     description:'Standard entry, all night',         baseCents: 3000 },
  vip:       { label:'VIP TABLE',   description:'Reserved seating, bottle service', baseCents:18000, perks:['Skip queue','Reserved table','Bottle service'] },
  guestlist: { label:'GUEST LIST',  description:'Free before 00:30, queue priority', baseCents:    0 },
};

const MULTIPLIER: Record<PriceRange, number> = {
  free: 0, '€': 0.6, '€€': 1, '€€€': 1.7, '€€€€': 3.2,
};

const STOCK: Record<TicketTier, number> = {
  early: 30, general: 200, vip: 8, guestlist: 50,
};

function roundToNearestFive(cents: number): number {
  return Math.round(cents / 500) * 500;
}

export function ticketsForVenue(venueId: string): TicketType[] {
  const venue = VENUES.find(v => v.id === venueId);
  const mult  = MULTIPLIER[venue?.priceRange ?? '€€'] ?? 1;

  return (['early','general','vip','guestlist'] as TicketTier[]).map(tier => {
    const base = BASE[tier];
    const price = base.baseCents === 0 ? 0 : roundToNearestFive(base.baseCents * mult);
    return {
      id:          `${venueId}-${tier}`,
      tier,
      label:       base.label,
      description: base.description,
      price,
      currency:    'EUR' as const,
      available:   STOCK[tier],
      ...(base.perks ? { perks: base.perks } : {}),
    };
  });
}

export function formatPrice(cents: number, currency: 'EUR' | 'USD' | 'GBP' = 'EUR'): string {
  if (cents === 0) return 'FREE';
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';
  const amount = cents / 100;
  return `${symbol}${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}
