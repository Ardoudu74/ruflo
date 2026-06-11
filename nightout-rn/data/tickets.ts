import type { TicketType, TicketTier } from '../types/ticket';

const PRESETS: Record<TicketTier, Omit<TicketType, 'id' | 'available'>> = {
  early:     { tier:'early',     label:'EARLY BIRD',  description:'Pre-sale, limited stock',           price: 2500, currency:'EUR' },
  general:   { tier:'general',   label:'GENERAL',     description:'Standard entry, all night',         price: 4000, currency:'EUR' },
  vip:       { tier:'vip',       label:'VIP TABLE',   description:'Reserved seating, bottle service', price:25000, currency:'EUR', perks:['Skip queue','Reserved table','Bottle service'] },
  guestlist: { tier:'guestlist', label:'GUEST LIST',  description:'Free before 00:30, queue priority', price:    0, currency:'EUR' },
};

const STOCK: Record<TicketTier, number> = {
  early: 30, general: 200, vip: 8, guestlist: 50,
};

export function ticketsForVenue(venueId: string): TicketType[] {
  return (['early','general','vip','guestlist'] as TicketTier[]).map(tier => ({
    ...PRESETS[tier],
    id:        `${venueId}-${tier}`,
    available: STOCK[tier],
  }));
}

export function formatPrice(cents: number, currency: 'EUR' | 'USD' | 'GBP' = 'EUR'): string {
  if (cents === 0) return 'FREE';
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}
