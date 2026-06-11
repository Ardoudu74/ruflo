/**
 * Payments — Stripe Connect + Apple Pay.
 *
 * Setup:
 *   - Wrap app in <StripeProvider publishableKey={EXPO_PUBLIC_STRIPE_PK} merchantIdentifier="merchant.com.nightout" />
 *   - Apple Pay capability + merchant ID required in Xcode
 *   - Stripe Connect: each venue is a connected account, NightOut takes 8% application fee
 *
 * Backend: a Firebase Cloud Function must create the PaymentIntent.
 * NEVER do this client-side (would expose Stripe secret key).
 */

import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import type { Ticket, TicketType, CheckoutSession } from '../types/ticket';
import { scheduleTicketConfirmation } from './notifications';

const PLATFORM_FEE_BPS = 800; // 8%
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'https://api.nightout.app';

export async function createPaymentIntent(
  venueId: string,
  ticketType: TicketType,
  quantity: number,
): Promise<CheckoutSession> {
  const uid = useAuthStore.getState().uid;
  if (!uid) throw new Error('Not authenticated');
  // Production: POST /createPaymentIntent with Bearer token
  await new Promise(r => setTimeout(r, 400));
  return {
    venueId,
    ticketTypeId: ticketType.id,
    quantity,
    clientSecret: 'pi_stub_secret_' + Date.now(),
    paymentIntentId: 'pi_stub_' + Date.now(),
  };
}

export async function payWithApplePay(
  session: CheckoutSession,
  ticketType: TicketType,
): Promise<{ ok: boolean; error?: string }> {
  // Production: confirmPlatformPayPayment from @stripe/stripe-react-native
  await new Promise(r => setTimeout(r, 1200));
  return { ok: true };
}

export async function payWithCard(
  session: CheckoutSession,
): Promise<{ ok: boolean; error?: string }> {
  // Production: confirmPayment from @stripe/stripe-react-native
  await new Promise(r => setTimeout(r, 1000));
  return { ok: true };
}

export function finalizeTicket(
  venue: { id: string; name: string; city: string },
  ticketType: TicketType,
  paymentIntentId: string,
): Ticket {
  const uid     = useAuthStore.getState().uid!;
  const profile = useAuthStore.getState().profile;
  const ticket: Ticket = {
    id:                    'tk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    ticketTypeId:          ticketType.id,
    venueId:               venue.id,
    venueName:             venue.name,
    city:                  venue.city,
    tier:                  ticketType.tier,
    tierLabel:             ticketType.label,
    priceCents:            ticketType.price,
    currency:              ticketType.currency,
    eventDate:             new Date().toISOString(),
    purchaserUid:          uid,
    purchaserName:         profile?.displayName ?? 'Guest',
    status:                'paid',
    stripePaymentIntentId: paymentIntentId,
    qrPayload:             buildQrPayload(uid, venue.id, ticketType.id, paymentIntentId),
    purchasedAt:           Date.now(),
  };
  useTicketStore.getState().add(ticket);
  scheduleTicketConfirmation(venue.name, ticket.eventDate).catch(() => {});
  return ticket;
}

function buildQrPayload(uid: string, venueId: string, ticketTypeId: string, pi: string): string {
  // Production: backend signs a JWT with HS256
  const obj = { uid, venueId, ticketTypeId, pi, t: Date.now() };
  return btoa(JSON.stringify(obj));
}

export async function addToAppleWallet(ticket: Ticket): Promise<{ ok: boolean }> {
  // Production: backend generates signed .pkpass, client opens via Linking
  console.log('[Wallet stub] would add ticket', ticket.id);
  return { ok: true };
}

export function platformFeeCents(priceCents: number): number {
  return Math.round(priceCents * PLATFORM_FEE_BPS / 10000);
}
