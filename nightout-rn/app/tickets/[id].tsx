import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { useTicketStore } from '../../store/useTicketStore';
import { formatPrice } from '../../data/tickets';
import { addToAppleWallet } from '../../services/payments';

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ticket = useTicketStore(s => s.tickets.find(t => t.id === id));
  if (!ticket) return null;

  const date = new Date(ticket.eventDate);
  const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={['#1a0a2e', Colors.ink]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <View style={styles.successWrap}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.successLabel}>PAYMENT CONFIRMED</Text>
        </View>

        <View style={styles.ticket}>
          <LinearGradient colors={[Colors.heroPurple, '#4E1B2D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ticketGradient}>
            <Text style={styles.ticketTier}>{ticket.tierLabel}</Text>
            <Text style={styles.ticketVenue}>{ticket.venueName}</Text>
            <Text style={styles.ticketCity}>{ticket.city.toUpperCase()}</Text>
            <View style={styles.divider} />
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.metaKey}>DATE</Text>
                <Text style={styles.metaVal}>{dateLabel.toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.metaKey}>PRICE</Text>
                <Text style={styles.metaVal}>{formatPrice(ticket.priceCents, ticket.currency)}</Text>
              </View>
              <View>
                <Text style={styles.metaKey}>HOLDER</Text>
                <Text style={styles.metaVal}>{ticket.purchaserName.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.qrWrap}>
              <QRCode value={ticket.qrPayload} size={180} backgroundColor="#fff" color="#000" />
            </View>
            <Text style={styles.ticketId}>#{ticket.id.toUpperCase()}</Text>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.walletBtn} onPress={async () => { await addToAppleWallet(ticket); }}>
          <Text style={styles.walletBtnText}> ADD TO WALLET</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={() => Share.share({ message: `My NightOut ticket for ${ticket.venueName} on ${dateLabel} — #${ticket.id}` })}>
          <Text style={styles.shareBtnText}>SHARE TICKET</Text>
        </TouchableOpacity>
        <Text style={styles.legal}>Show this QR at the door.{'\n'}18+ ID required. Non-refundable.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:        { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.xl, alignItems: 'center' },
  back:           { alignSelf: 'flex-start' },
  backText:       { ...Type.label, color: Colors.gold },
  successWrap:    { alignItems: 'center', gap: Spacing.sm },
  checkmark:      { fontSize: 56, color: Colors.green },
  successLabel:   { ...Type.label, color: Colors.green },
  ticket:         { width: '100%', borderRadius: Radius.xxl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.gold + '44', shadowColor: Colors.gold, shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  ticketGradient: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  ticketTier:     { ...Type.label, color: Colors.gold, letterSpacing: 4 },
  ticketVenue:    { ...Type.heroTitle, color: Colors.textPrimary, fontSize: 30, textAlign: 'center' },
  ticketCity:     { ...Type.label, color: Colors.textSecondary, letterSpacing: 3 },
  divider:        { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: Spacing.sm },
  metaRow:        { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  metaKey:        { ...Type.tag, color: Colors.textMuted },
  metaVal:        { ...Type.label, color: Colors.textPrimary, marginTop: 2 },
  qrWrap:         { padding: Spacing.lg, backgroundColor: '#fff', borderRadius: Radius.lg, marginTop: Spacing.md },
  ticketId:       { ...Type.caption, color: Colors.textMuted, letterSpacing: 2, marginTop: 6 },
  walletBtn:      { width: '100%', backgroundColor: '#000', borderWidth: 1, borderColor: '#fff', borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  walletBtnText:  { ...Type.button, color: '#fff' },
  shareBtn:       { width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  shareBtnText:   { ...Type.button, color: Colors.textPrimary },
  legal:          { ...Type.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
