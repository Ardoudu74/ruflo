export type TicketTier = 'general' | 'early' | 'vip' | 'guestlist';

export interface TicketType {
  id: string;
  tier: TicketTier;
  label: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'GBP';
  available: number;
  perks?: string[];
}

export interface Ticket {
  id: string;
  ticketTypeId: string;
  venueId: string;
  venueName: string;
  city: string;
  tier: TicketTier;
  tierLabel: string;
  priceCents: number;
  currency: 'EUR' | 'USD' | 'GBP';
  eventDate: string;
  purchaserUid: string;
  purchaserName: string;
  status: 'pending' | 'paid' | 'used' | 'refunded' | 'cancelled';
  stripePaymentIntentId?: string;
  qrPayload: string;
  purchasedAt: number;
  usedAt?: number;
}

export interface CheckoutSession {
  venueId: string;
  ticketTypeId: string;
  quantity: number;
  clientSecret?: string;
  paymentIntentId?: string;
}
