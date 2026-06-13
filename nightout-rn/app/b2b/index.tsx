import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { useAuthStore } from '../../store/useAuthStore';
import { useVenueOwnerStore } from '../../store/useVenueOwnerStore';
import { useTicketStore } from '../../store/useTicketStore';
import { SUBSCRIPTION_TIERS, VenueEvent } from '../../types/venue-owner';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={stat.card}>
      <LinearGradient colors={[Colors.cardBase, '#0d0010']} style={StyleSheet.absoluteFill} borderRadius={Radius.lg} />
      <Text style={stat.label}>{label}</Text>
      <Text style={stat.value}>{value}</Text>
      {sub && <Text style={stat.sub}>{sub}</Text>}
    </View>
  );
}

function EventForm({ venueId, onSave, onClose }: { venueId: string; onSave: (e: VenueEvent) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [djs, setDjs] = useState('');
  const [price, setPrice] = useState('40');
  const [capacity, setCapacity] = useState('200');

  const handleSave = () => {
    if (!title || !date) { Alert.alert('Fill in title and date'); return; }
    const priceCents = Math.round(parseFloat(price) * 100);
    const cap = parseInt(capacity, 10);
    const event: VenueEvent = {
      id: `ev_${Date.now()}`,
      venueId,
      title,
      date,
      djLineup: djs.split(',').map(d => d.trim()).filter(Boolean),
      ticketTiers: [
        { label: 'Early Bird', priceCents: Math.round(priceCents * 0.6), available: Math.round(cap * 0.2), sold: 0 },
        { label: 'General', priceCents, available: Math.round(cap * 0.7), sold: 0 },
        { label: 'VIP', priceCents: priceCents * 6, available: Math.round(cap * 0.1), sold: 0 },
      ],
      published: false,
      createdAt: Date.now(),
    };
    onSave(event);
    onClose();
  };

  return (
    <View style={form.root}>
      <Text style={form.title}>CREATE EVENT</Text>
      {[
        { label: 'EVENT TITLE', value: title, onChange: setTitle, placeholder: 'Saturday Night — Techno' },
        { label: 'DATE (YYYY-MM-DD)', value: date, onChange: setDate, placeholder: '2025-06-28' },
        { label: 'DJ LINEUP (comma-separated)', value: djs, onChange: setDjs, placeholder: 'DJ Snake, Charlotte de Witte' },
        { label: 'GENERAL TICKET PRICE (€)', value: price, onChange: setPrice, placeholder: '40', keyboardType: 'numeric' },
        { label: 'CAPACITY', value: capacity, onChange: setCapacity, placeholder: '200', keyboardType: 'numeric' },
      ].map(f => (
        <View key={f.label} style={form.field}>
          <Text style={form.fieldLabel}>{f.label}</Text>
          <TextInput style={form.input} value={f.value} onChangeText={f.onChange} placeholder={f.placeholder} placeholderTextColor={Colors.textMuted} keyboardType={(f as any).keyboardType ?? 'default'} />
        </View>
      ))}
      <TouchableOpacity style={form.saveBtn} onPress={handleSave}>
        <Text style={form.saveBtnText}>SAVE EVENT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={form.cancelBtn} onPress={onClose}>
        <Text style={form.cancelText}>CANCEL</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function B2BDashboard() {
  const router = useRouter();
  const { uid } = useAuthStore();
  const { profile: ownerProfile, events, addEvent, publishEvent, deleteEvent } = useVenueOwnerStore();
  const allTickets = useTicketStore(s => s.tickets);
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTier, setActiveTier] = useState<'starter' | 'pro' | 'enterprise'>('pro');

  const venueTickets = ownerProfile ? allTickets.filter(t => t.venueId === ownerProfile.venueId) : [];
  const revenueCents = venueTickets.reduce((sum, t) => sum + t.priceCents, 0);
  const platformFee = Math.round(revenueCents * 0.08);
  const payoutCents = revenueCents - platformFee;

  if (!uid || uid === 'guest') {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl }}>
        <LinearGradient colors={[Colors.ink, '#000']} style={StyleSheet.absoluteFill} />
        <Text style={{ ...Type.sectionHead, color: Colors.textPrimary }}>VENUE OWNERS</Text>
        <Text style={{ ...Type.body, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xxxl }}>
          Sign in to access your venue dashboard, analytics, and event management.
        </Text>
        <TouchableOpacity style={styles.goldBtn} onPress={() => router.push('/auth')}>
          <Text style={styles.goldBtnText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={['#12001a', '#000']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>VENUE DASHBOARD</Text>
        {ownerProfile && (
          <View style={styles.venueRow}>
            <Text style={styles.venueName}>{ownerProfile.venueName.toUpperCase()}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{ownerProfile.tier.toUpperCase()}</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>TONIGHT’S ANALYTICS</Text>
        <View style={styles.statsGrid}>
          <StatCard label="TICKETS SOLD" value={String(venueTickets.length)} />
          <StatCard label="GROSS REVENUE" value={`€${(revenueCents / 100).toFixed(0)}`} />
          <StatCard label="PLATFORM FEE (8%)" value={`€${(platformFee / 100).toFixed(0)}`} />
          <StatCard label="YOUR PAYOUT" value={`€${(payoutCents / 100).toFixed(0)}`} sub="Next business day" />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>YOUR EVENTS</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowEventForm(true)}>
            <Text style={styles.addBtnText}>+ ADD</Text>
          </TouchableOpacity>
        </View>

        {events.length === 0
          ? <Text style={styles.empty}>No events yet. Create your first event above.</Text>
          : events.map(ev => (
            <View key={ev.id} style={styles.eventCard}>
              <LinearGradient colors={[Colors.cardBase, '#0d0010']} style={StyleSheet.absoluteFill} borderRadius={Radius.lg} />
              <View style={styles.eventTop}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <View style={[styles.pubBadge, ev.published && styles.pubBadgeActive]}>
                  <Text style={[styles.pubText, ev.published && { color: Colors.green }]}>{ev.published ? 'LIVE' : 'DRAFT'}</Text>
                </View>
              </View>
              <Text style={styles.eventDate}>{ev.date}</Text>
              {ev.djLineup.length > 0 && <Text style={styles.eventDjs}>{ev.djLineup.join(' · ')}</Text>}
              <View style={styles.tierRow}>
                {ev.ticketTiers.map(t => (
                  <View key={t.label} style={styles.tierStat}>
                    <Text style={styles.tierStatLabel}>{t.label}</Text>
                    <Text style={styles.tierStatVal}>{t.sold}/{t.available}</Text>
                    <Text style={styles.tierStatPrice}>€{(t.priceCents / 100).toFixed(0)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.eventActions}>
                {!ev.published && (
                  <TouchableOpacity style={styles.publishBtn} onPress={() => publishEvent(ev.id)}>
                    <Text style={styles.publishBtnText}>PUBLISH</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.deleteBtn} onPress={() =>
                  Alert.alert('Delete event?', ev.title, [
                    { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(ev.id) },
                    { text: 'Cancel', style: 'cancel' },
                  ])
                }>
                  <Text style={styles.deleteBtnText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

        <Text style={styles.sectionTitle}>SUBSCRIPTION PLANS</Text>
        {(Object.entries(SUBSCRIPTION_TIERS) as [typeof activeTier, typeof SUBSCRIPTION_TIERS[typeof activeTier]][]).map(([key, tier]) => (
          <TouchableOpacity key={key} style={[styles.tierCard, activeTier === key && styles.tierCardActive]} onPress={() => setActiveTier(key)}>
            <LinearGradient colors={activeTier === key ? [Colors.heroPurple, '#1a0020'] : [Colors.cardBase, '#0d0010']} style={StyleSheet.absoluteFill} borderRadius={Radius.lg} />
            <View style={styles.tierCardTop}>
              <Text style={[styles.tierCardLabel, activeTier === key && { color: Colors.gold }]}>{tier.label}</Text>
              <Text style={styles.tierCardPrice}>{tier.price}</Text>
            </View>
            {tier.features.map(f => <Text key={f} style={styles.tierFeature}>✓ {f}</Text>)}
            {activeTier === key && (
              <TouchableOpacity style={styles.subscribeBtn}>
                <Text style={styles.subscribeBtnText}>SUBSCRIBE NOW</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showEventForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEventForm(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.ink }}>
          <LinearGradient colors={['#12001a', '#000']} style={StyleSheet.absoluteFill} />
          <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingTop: 50 }}>
            <EventForm venueId={ownerProfile?.venueId ?? ''} onSave={addEvent} onClose={() => setShowEventForm(false)} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content:       { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.xl },
  back:          { alignSelf: 'flex-start' },
  backText:      { ...Type.label, color: Colors.gold },
  pageTitle:     { ...Type.sectionHead, color: Colors.textPrimary },
  venueRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  venueName:     { ...Type.heroTitle, color: Colors.textPrimary, fontSize: 24, flex: 1 },
  tierBadge:     { backgroundColor: Colors.gold + '22', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gold + '55' },
  tierText:      { ...Type.tag, color: Colors.gold },
  sectionTitle:  { ...Type.label, color: Colors.gold, fontSize: 13 },
  sectionRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  addBtn:        { backgroundColor: Colors.gold + '22', borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gold + '55' },
  addBtnText:    { ...Type.tag, color: Colors.gold },
  empty:         { ...Type.body, color: Colors.textMuted, textAlign: 'center' },
  eventCard:     { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: Spacing.lg, gap: Spacing.sm },
  eventTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTitle:    { ...Type.bodyMedium, color: Colors.textPrimary, flex: 1 },
  pubBadge:      { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  pubBadgeActive:{ borderColor: Colors.green + '55', backgroundColor: Colors.green + '11' },
  pubText:       { ...Type.caption, color: Colors.textMuted },
  eventDate:     { ...Type.tag, color: Colors.textSecondary },
  eventDjs:      { ...Type.body, color: Colors.textMuted, fontSize: 12 },
  tierRow:       { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  tierStat:      { gap: 2 },
  tierStatLabel: { ...Type.caption, color: Colors.textMuted },
  tierStatVal:   { ...Type.label, color: Colors.textPrimary },
  tierStatPrice: { ...Type.tag, color: Colors.gold },
  eventActions:  { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  publishBtn:    { flex: 1, backgroundColor: Colors.gold, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  publishBtnText:{ ...Type.tag, color: Colors.ink },
  deleteBtn:     { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', paddingHorizontal: Spacing.xl },
  deleteBtnText: { ...Type.tag, color: Colors.textMuted },
  tierCard:      { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: Spacing.xl, gap: Spacing.sm },
  tierCardActive:{ borderColor: Colors.gold + '55' },
  tierCardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  tierCardLabel: { ...Type.sectionHead, color: Colors.textPrimary, fontSize: 18 },
  tierCardPrice: { ...Type.label, color: Colors.gold },
  tierFeature:   { ...Type.body, color: Colors.textSecondary, fontSize: 13 },
  subscribeBtn:  { marginTop: Spacing.md, backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  subscribeBtnText: { ...Type.button, color: Colors.ink },
  goldBtn:       { backgroundColor: Colors.gold, borderRadius: Radius.xl, paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg },
  goldBtnText:   { ...Type.button, color: Colors.ink },
});

const stat = StyleSheet.create({
  card:  { width: '47%', borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: Spacing.lg, gap: 4 },
  label: { ...Type.caption, color: Colors.textMuted },
  value: { ...Type.sectionHead, color: Colors.textPrimary, fontSize: 22 },
  sub:   { ...Type.caption, color: Colors.textMuted },
});

const form = StyleSheet.create({
  root:        { gap: Spacing.lg },
  title:       { ...Type.sectionHead, color: Colors.textPrimary },
  field:       { gap: Spacing.sm },
  fieldLabel:  { ...Type.tag, color: Colors.textMuted },
  input:       { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.lg, padding: Spacing.lg, color: Colors.textPrimary, ...Type.body },
  saveBtn:     { backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center' },
  saveBtnText: { ...Type.button, color: Colors.ink },
  cancelBtn:   { alignItems: 'center', padding: Spacing.lg },
  cancelText:  { ...Type.label, color: Colors.textMuted },
});
