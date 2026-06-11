export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface VenueOwnerProfile {
  uid: string;
  venueId: string;
  venueName: string;
  email: string;
  tier: SubscriptionTier;
  stripeSubscriptionId?: string;
  monthlyRevenue: number;
  ticketsSoldThisMonth: number;
  totalTicketsSold: number;
}

export interface VenueEvent {
  id: string;
  venueId: string;
  title: string;
  date: string;
  djLineup: string[];
  ticketTiers: {
    label: string;
    priceCents: number;
    available: number;
    sold: number;
  }[];
  published: boolean;
  createdAt: number;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { label: string; price: string; features: string[] }> = {
  starter: {
    label: 'STARTER',
    price: '€99/mo',
    features: ['1 venue listing', 'Ticket sales', 'Basic analytics', '8% platform fee'],
  },
  pro: {
    label: 'PRO',
    price: '€299/mo',
    features: ['3 venue listings', 'Priority placement', 'Advanced analytics', 'Stories dashboard', '6% platform fee'],
  },
  enterprise: {
    label: 'ENTERPRISE',
    price: '€499/mo',
    features: ['Unlimited venues', 'Top of city listings', 'Real-time analytics', 'White-label tickets', 'API access', '4% platform fee'],
  },
};
