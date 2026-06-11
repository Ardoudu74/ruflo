import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { useAuthStore } from '../../store/useAuthStore';
import { useSafeNightStore } from '../../store/useSafeNightStore';
import { startLocationSharing, stopLocationSharing, triggerSOS } from '../../services/safeNight';
import type { EmergencyContact } from '../../types/auth';

export default function SafeNightTab() {
  const { profile, patchProfile } = useAuthStore();
  const { enabled, sharingActive, currentLat, currentLng, lastUpdate, locationError } = useSafeNightStore();
  const [editingContact, setEditingContact] = useState(!profile?.emergencyContact);
  const [contactName, setContactName]    = useState(profile?.emergencyContact?.name ?? '');
  const [contactPhone, setContactPhone]  = useState(profile?.emergencyContact?.phone ?? '');
  const [contactRel, setContactRel]      = useState(profile?.emergencyContact?.relationship ?? '');
  const [loading, setLoading] = useState(false);

  const saveContact = () => {
    if (!contactPhone.startsWith('+')) { Alert.alert('Phone format', 'Enter number in international format: +33612345678'); return; }
    patchProfile({ emergencyContact: { name: contactName, phone: contactPhone, relationship: contactRel } });
    setEditingContact(false);
  };

  const toggleSharing = async () => {
    if (!profile?.emergencyContact) { Alert.alert('Add emergency contact', 'Set up a contact before enabling Safe Night.'); return; }
    setLoading(true);
    if (sharingActive) stopLocationSharing();
    else await startLocationSharing();
    setLoading(false);
  };

  const handleSOS = () => Alert.alert('⚡ TRIGGER SOS?', 'This will send your location to your emergency contact.',
    [{ text: 'CANCEL', style: 'cancel' }, { text: 'SEND SOS', style: 'destructive', onPress: triggerSOS }]);

  const lastSeen = lastUpdate ? new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.ink, '#000']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>SAFE NIGHT</Text>
        <Text style={styles.sub}>Auto-disables at 06:00 AM</Text>
        <View style={[styles.card, sharingActive && styles.cardActive]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>LOCATION SHARING</Text>
              <Text style={styles.cardStatus}>{sharingActive ? `● ACTIVE${lastSeen ? ` · last update ${lastSeen}` : ''}` : '○ OFF'}</Text>
            </View>
            <TouchableOpacity style={[styles.toggleBtn, sharingActive && styles.toggleBtnOn]} onPress={toggleSharing} disabled={loading}>
              {loading ? <ActivityIndicator color={sharingActive ? Colors.ink : Colors.green} size="small" />
                : <Text style={[styles.toggleBtnText, sharingActive && styles.toggleBtnTextOn]}>{sharingActive ? 'STOP' : 'START'}</Text>}
            </TouchableOpacity>
          </View>
          {currentLat && currentLng && <Text style={styles.coords}>📍 {currentLat.toFixed(4)}, {currentLng.toFixed(4)}</Text>}
          {locationError && <Text style={styles.locError}>{locationError}</Text>}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EMERGENCY CONTACT</Text>
            {!editingContact && <TouchableOpacity onPress={() => setEditingContact(true)}><Text style={styles.editLink}>EDIT</Text></TouchableOpacity>}
          </View>
          {editingContact ? (
            <View style={styles.contactForm}>
              <TextInput style={styles.input} placeholder="Name" placeholderTextColor={Colors.textMuted} value={contactName} onChangeText={setContactName} />
              <TextInput style={styles.input} placeholder="+33612345678" placeholderTextColor={Colors.textMuted} value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Relationship (friend, partner…)" placeholderTextColor={Colors.textMuted} value={contactRel} onChangeText={setContactRel} />
              <TouchableOpacity style={[styles.saveBtn, (!contactName || !contactPhone) && { opacity: 0.4 }]} onPress={saveContact} disabled={!contactName || !contactPhone}>
                <Text style={styles.saveBtnText}>SAVE CONTACT</Text>
              </TouchableOpacity>
            </View>
          ) : profile?.emergencyContact ? (
            <View style={styles.contactDisplay}>
              <Text style={styles.contactName}>{profile.emergencyContact.name}</Text>
              <Text style={styles.contactPhone}>{profile.emergencyContact.phone}</Text>
              <Text style={styles.contactRel}>{profile.emergencyContact.relationship}</Text>
            </View>
          ) : <Text style={styles.noContact}>No emergency contact set</Text>}
        </View>
        <View style={styles.howto}>
          <Text style={styles.howtoTitle}>HOW IT WORKS</Text>
          {[['📍','Your GPS updates every 30s and is shared with your contact via SMS'],['🔒','Location is only shared while Safe Night is active'],['⚡','SOS sends an emergency SMS + prompts a call to 112 / 911'],['⏰','Automatically stops at 6 AM']].map(([icon, text]) => (
            <View key={text} style={styles.howtoRow}>
              <Text style={styles.howtoIcon}>{icon}</Text>
              <Text style={styles.howtoText}>{text}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <Text style={styles.sosBtnText}>⚡  SOS</Text>
        </TouchableOpacity>
        <Text style={styles.sosNote}>Emergency contacts + local services (112 EU / 911 US)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.xl },
  title: { ...Type.sectionHead, color: Colors.textPrimary },
  sub: { ...Type.label, color: Colors.textMuted, marginTop: -Spacing.md },
  card: { backgroundColor: Colors.cardBase, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: Spacing.sm },
  cardActive: { borderColor: Colors.green + '55', backgroundColor: Colors.green + '10' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { ...Type.label, color: Colors.textSecondary },
  cardStatus: { ...Type.body, color: Colors.textPrimary, marginTop: 2 },
  toggleBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.green },
  toggleBtnOn: { backgroundColor: Colors.green },
  toggleBtnText: { ...Type.label, color: Colors.green },
  toggleBtnTextOn: { color: Colors.ink },
  coords: { ...Type.caption, color: Colors.textSecondary },
  locError: { ...Type.caption, color: '#FF3B30' },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Type.label, color: Colors.gold },
  editLink: { ...Type.tag, color: Colors.textMuted },
  contactForm: { gap: Spacing.md },
  input: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, height: 50, ...Type.body, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  saveBtnText: { ...Type.button, color: Colors.ink },
  contactDisplay: { gap: 4 },
  contactName: { ...Type.venueName, color: Colors.textPrimary },
  contactPhone: { ...Type.body, color: Colors.textSecondary },
  contactRel: { ...Type.tag, color: Colors.textMuted },
  noContact: { ...Type.body, color: Colors.textMuted },
  howto: { gap: Spacing.md },
  howtoTitle: { ...Type.label, color: Colors.textMuted },
  howtoRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  howtoIcon: { fontSize: 16, width: 24 },
  howtoText: { ...Type.body, color: Colors.textSecondary, flex: 1, lineHeight: 20 },
  sosBtn: { backgroundColor: '#FF3B30', borderRadius: Radius.xl, padding: Spacing.xl + 4, alignItems: 'center', shadowColor: '#FF3B30', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  sosBtnText: { ...Type.button, color: Colors.white, fontSize: 24, letterSpacing: 4 },
  sosNote: { ...Type.caption, color: Colors.textMuted, textAlign: 'center' },
});
