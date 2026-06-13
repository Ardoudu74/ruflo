import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { useTicketStore } from '../../store/useTicketStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatPrice } from '../../data/tickets';

export default function TicketsList() {
  const router = useRouter();
  const uid = useAuthStore(s => s.uid);
  const tickets = useTicketStore(s => uid ? s.forUser(uid) : []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={[Colors.ink, '#000']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>YOUR TICKETS</Text>
        {tickets.length === 0
          ? <Text style={styles.empty}>No tickets yet. Buy your first one from a venue page.</Text>
          : tickets.map(t => (
            <TouchableOpacity key={t.id} style={styles.item} onPress={() => router.push(`/tickets/${t.id}`)}>
              <View style={styles.itemRow}>
                <Text style={styles.itemTier}>{t.tierLabel}</Text>
                <Text style={[styles.itemStatus, t.status === 'used' && { color: Colors.textMuted }, t.status === 'paid' && { color: Colors.green }]}>
                  {t.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.itemVenue}>{t.venueName}</Text>
              <View style={styles.itemRow}>
                <Text style={styles.itemDate}>{new Date(t.eventDate).toLocaleDateString()}</Text>
                <Text style={styles.itemPrice}>{formatPrice(t.priceCents, t.currency)}</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:    { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.lg },
  back:       { alignSelf: 'flex-start' },
  backText:   { ...Type.label, color: Colors.gold },
  title:      { ...Type.sectionHead, color: Colors.textPrimary },
  empty:      { ...Type.body, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xxxl },
  item:       { padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.cardBase, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 6 },
  itemRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTier:   { ...Type.label, color: Colors.gold },
  itemStatus: { ...Type.tag, color: Colors.textPrimary },
  itemVenue:  { ...Type.venueName, color: Colors.textPrimary },
  itemDate:   { ...Type.tag, color: Colors.textSecondary },
  itemPrice:  { ...Type.label, color: Colors.textPrimary },
});
