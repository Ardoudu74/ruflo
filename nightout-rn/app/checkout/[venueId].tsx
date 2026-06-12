import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { VENUES } from '../../data/venues';
import { ticketsForVenue, formatPrice } from '../../data/tickets';
import { createPaymentIntent, payWithApplePay, payWithCard, finalizeTicket, platformFeeCents } from '../../services/payments';
import { useAuthStore } from '../../store/useAuthStore';
import { requireAgeVerification } from '../../services/ageGate';
import type { TicketType } from '../../types/ticket';

export default function Checkout() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const router  = useRouter();
  const venue   = VENUES.find(v => v.id === venueId);
  const types   = ticketsForVenue(venueId ?? '');
  // All hooks must be declared before any early returns
  const [selected, setSelected] = useState<TicketType | null>(null);
  const [qty, setQty]           = useState(1);
  const [loading, setLoading]   = useState(false);

  if (!venue || types.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text style={{ ...Type.sectionHead, color: Colors.textPrimary }}>Venue not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ ...Type.label, color: Colors.gold }}>← GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeTicket = selected ?? types[1] ?? types[0];

  const totalCents = activeTicket.price * qty;
  const feeCents   = platformFeeCents(totalCents);

  const guardAge = (): boolean => {
    if (requireAgeVerification()) {
      Alert.alert(
        '18+ required',
        'Verify your age in onboarding before purchasing tickets.',
        [{ text: 'OK', onPress: () => router.push('/onboarding') }]
      );
      return false;
    }
    return true;
  };

  const handleApplePay = async () => {
    if (!guardAge()) return;
    setLoading(true);
    try {
      const session = await createPaymentIntent(venueId!, activeTicket, qty);
      const result  = await payWithApplePay(session, activeTicket);
      if (!result.ok) throw new Error(result.error);
      const ticket = finalizeTicket(
        { id: venue.id, name: venue.name, city: venue.city },
        activeTicket,
        session.paymentIntentId!,
      );
      router.replace(`/tickets/${ticket.id}`);
    } catch (err: any) {
      Alert.alert('Payment failed', err.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCard = async () => {
    if (!guardAge()) return;
    setLoading(true);
    try {
      const session = await createPaymentIntent(venueId!, activeTicket, qty);
      const result  = await payWithCard(session);
      if (!result.ok) throw new Error(result.error);
      const ticket = finalizeTicket(
        { id: venue.id, name: venue.name, city: venue.city },
        activeTicket,
        session.paymentIntentId!,
      );
      router.replace(`/tickets/${ticket.id}`);
    } catch (err: any) {
      Alert.alert('Payment failed', err.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={['#1a0a2e', Colors.ink]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← CANCEL</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>CHECKOUT</Text>
        <Text style={styles.venue}>{venue.name}</Text>
        <Text style={styles.city}>{venue.neighborhood.toUpperCase()} · {venue.city.toUpperCase()}</Text>

        {/* Ticket tier picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT TICKET</Text>
          {types.map(t => {
            const on = activeTicket.id === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tierBox, on && styles.tierBoxOn]}
                onPress={() => setSelected(t)}
              >
                <View style={styles.tierRow}>
                  <Text style={[styles.tierLabel, on && { color: Colors.gold }]}>{t.label}</Text>
                  <Text style={[styles.tierPrice, on && { color: Colors.gold }]}>
                    {formatPrice(t.price, t.currency)}
                  </Text>
                </View>
                <Text style={styles.tierDesc}>{t.description}</Text>
                <Text style={styles.tierStock}>{t.available} left</Text>
                {t.perks && on && (
                  <View style={styles.perks}>
                    {t.perks.map(p => <Text key={p} style={styles.perk}>· {p}</Text>)}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUANTITY</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(10, q + 1))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>SUBTOTAL</Text>
            <Text style={styles.summaryVal}>{formatPrice(totalCents, activeTicket.currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>SERVICE FEE</Text>
            <Text style={styles.summaryVal}>{formatPrice(feeCents, activeTicket.currency)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalKey}>TOTAL</Text>
            <Text style={styles.totalVal}>{formatPrice(totalCents + feeCents, activeTicket.currency)}</Text>
          </View>
        </View>

        {/* Pay buttons */}
        <TouchableOpacity style={styles.applePayBtn} onPress={handleApplePay} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.applePayBtnText}> PAY</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardBtn} onPress={handleCard} disabled={loading}>
          <Text style={styles.cardBtnText}>PAY WITH CARD</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Tickets are non-refundable within 24h of event.{'\n'}
          18+ ID required at door. Powered by Stripe.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:        { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.xl },
  back:           { alignSelf: 'flex-start' },
  backText:       { ...Type.label, color: Colors.gold },
  eyebrow:        { ...Type.label, color: Colors.textMuted },
  venue:          { ...Type.heroTitle, color: Colors.textPrimary, fontSize: 32, marginTop: -8 },
  city:           { ...Type.label, color: Colors.textSecondary },
  section:        { gap: Spacing.md },
  sectionTitle:   { ...Type.label, color: Colors.gold },

  tierBox:        { padding: Spacing.lg, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: Colors.cardBase, gap: 4 },
  tierBoxOn:      { borderColor: Colors.gold + '66', backgroundColor: Colors.gold + '15' },
  tierRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierLabel:      { ...Type.labelLg, color: Colors.textPrimary },
  tierPrice:      { ...Type.labelLg, color: Colors.textPrimary },
  tierDesc:       { ...Type.body, color: Colors.textSecondary },
  tierStock:      { ...Type.tag, color: Colors.textMuted },
  perks:          { marginTop: 6, gap: 2 },
  perk:           { ...Type.caption, color: Colors.gold },

  qtyRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  qtyBtn:         { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.cardBase, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:     { ...Type.sectionHead, color: Colors.gold, fontSize: 22 },
  qty:            { ...Type.sectionHead, color: Colors.textPrimary, minWidth: 32, textAlign: 'center' },

  summary:        { gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.03)' },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  summaryKey:     { ...Type.label, color: Colors.textSecondary },
  summaryVal:     { ...Type.body, color: Colors.textPrimary },
  totalRow:       { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: Spacing.sm, marginTop: Spacing.sm },
  totalKey:       { ...Type.labelLg, color: Colors.textPrimary },
  totalVal:       { ...Type.labelLg, color: Colors.gold },

  applePayBtn:    { backgroundColor: '#000', borderWidth: 1, borderColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  applePayBtnText:{ ...Type.button, color: '#fff', fontSize: 17 },
  cardBtn:        { backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  cardBtnText:    { ...Type.button, color: Colors.ink },
  legal:          { ...Type.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
