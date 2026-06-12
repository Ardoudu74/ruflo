/**
 * Payments — Stripe Connect + Apple Pay.
 *
 * Install:
 *   npx expo install @stripe/stripe-react-native
 *
 * Setup:
 *   - Wrap the app in <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PK!} merchantIdentifier="merchant.com.nightout" />
 *   - Apple Pay capability + merchant ID required in Xcode
 *   - Stripe Connect: each venue is a connected account, NightOut takes 8% application fee
 *
 * Backend: a Firebase Cloud Function must create the PaymentIntent. NEVER do
 * this client-side (would expose Stripe secret key).
 *
 * Flow:
 *   1. Client → backend: POST /createPaymentIntent { venueId, ticketTypeId, qty }
 *   2. Backend → Stripe: creates intent with application_fee_amount + transfer_data.destination
 *   3. Backend → client: { clientSecret, paymentIntentId }
 *   4. Client confirms with Apple Pay sheet
 *   5. Stripe webhook → backend: marks ticket as paid, generates QR token,
 *      sends receipt email, writes to Firestore
 */

import { useTicketStore } from '../store/useTicketStore';
import { useAuthStore } from '../store/useAuthStore';
import type { Ticket, TicketType, CheckoutSession } from '../types/ticket';
import { scheduleTicketConfirmation } from './notifications';

const PLATFORM_FEE_BPS = 800; // 8%

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'https://api.nightout.app';

// ── Create PaymentIntent (backend call) ───────────────────────────────────

export async function createPaymentIntent(
  venueId: string,
  ticketType: TicketType,
  quantity: number,
): Promise<CheckoutSession> {
  const uid = useAuthStore.getState().uid;
  if (!uid) throw new Error('Not authenticated');

  /**
   * Production:
   * const res = await fetch(`${BACKEND_URL}/createPaymentIntent`, {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
   *   body: JSON.stringify({ venueId, ticketTypeId: ticketType.id, quantity }),
   * });
   * const { clientSecret, paymentIntentId } = await res.json();
   * return { venueId, ticketTypeId: ticketType.id, quantity, clientSecret, paymentIntentId };
   */

  // Dev stub
  await new Promise(r => setTimeout(r, 400));
  return {
    venueId,
    ticketTypeId: ticketType.id,
    quantity,
    clientSecret: 'pi_stub_secret_' + Date.now(),
    paymentIntentId: 'pi_stub_' + Date.now(),
  };
}

// ── Apple Pay confirmation ────────────────────────────────────────────────

export async function payWithApplePay(
  session: CheckoutSession,
  ticketType: TicketType,
): Promise<{ ok: boolean; error?: string }> {
  /**
   * Production:
   * import { useApplePay, PlatformPay, confirmPlatformPayPayment } from '@stripe/stripe-react-native';
   *
   * const { error } = await confirmPlatformPayPayment(session.clientSecret!, {
   *   applePay: {
   *     cartItems: [{ label: ticketType.label, amount: (ticketType.price / 100).toFixed(2), paymentType: PlatformPay.PaymentType.Immediate }],
   *     merchantCountryCode: 'FR',
   *     currencyCode: ticketType.currency,
   *   },
   * });
   * if (error) return { ok: false, error: error.message };
   */

  // Dev stub
  await new Promise(r => setTimeout(r, 1200));
  return { ok: true };
}

// ── Confirm card (manual entry fallback) ──────────────────────────────────

export async function payWithCard(
  session: CheckoutSession,
): Promise<{ ok: boolean; error?: string }> {
  /**
   * Production:
   * import { confirmPayment } from '@stripe/stripe-react-native';
   * const { error } = await confirmPayment(session.clientSecret!, { paymentMethodType: 'Card' });
   * if (error) return { ok: false, error: error.message };
   */
  await new Promise(r => setTimeout(r, 1000));
  return { ok: true };
}

// ── Finalize: write ticket locally + backend creates real record ──────────

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
    eventDate:             nextWeekendNight(),
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

// ── Next Saturday night (default event date for weekend clubs) ───────────

function nextWeekendNight(): string {
  const d = new Date();
  // Find the next Saturday (day 6); if already Saturday, use today
  const daysUntilSat = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + daysUntilSat);
  d.setHours(23, 0, 0, 0);
  return d.toISOString();
}

// ── QR payload (signed by backend in prod) ────────────────────────────────

function buildQrPayload(uid: string, venueId: string, ticketTypeId: string, pi: string): string {
  /**
   * Production: backend signs a JWT with HS256 using a venue-shared secret,
   * scanner verifies signature + checks Firestore for status === 'paid' and unused.
   */
  const obj = { uid, venueId, ticketTypeId, pi, t: Date.now() };
  return btoa(JSON.stringify(obj));
}

// ── Apple Wallet pass (PKPass) — stub ────────────────────────────────────

export async function addToAppleWallet(ticket: Ticket): Promise<{ ok: boolean }> {
  /**
   * Production:
   *   1. Backend generates a signed .pkpass file (requires Apple Pass Type ID,
   *      Pass Type Certificate, WWDR cert).
   *   2. Backend returns URL: https://api.nightout.app/pass/{ticketId}.pkpass
   *   3. Client: import { addPassFromUrlAsync } from 'expo-pass-kit' or use Linking
   *      Linking.openURL(passUrl);
   *      iOS automatically opens Wallet add-pass sheet.
   */
  console.log('[Wallet stub] would add ticket', ticket.id);
  return { ok: true };
}

// ── Compute platform fee ──────────────────────────────────────────────────

export function platformFeeCents(priceCents: number): number {
  return Math.round(priceCents * PLATFORM_FEE_BPS / 10000);
}
