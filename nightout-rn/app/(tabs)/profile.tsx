import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { VENUES } from '../../data/venues';
import { signOut } from '../../services/auth';

export default function ProfileTab() {
  const router = useRouter();
  const { profile, uid } = useAuthStore();
  const { savedVenueIds } = useAppStore();
  const savedVenues = VENUES.filter(v => savedVenueIds.includes(v.id));

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  if (!uid) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl }}>
        <LinearGradient colors={[Colors.ink, '#000']} style={StyleSheet.absoluteFill} />
        <Text style={{ ...Type.sectionHead, color: Colors.textPrimary }}>NOT SIGNED IN</Text>
        <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth')}>
          <Text style={styles.signInBtnText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={[Colors.ink, '#000']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🌙</Text>
        </View>
        <Text style={styles.name}>{profile?.displayName?.toUpperCase() ?? 'NIGHT WALKER'}</Text>
        {profile?.email && <Text style={styles.email}>{profile.email}</Text>}

        {/* Taste summary */}
        {profile?.genres?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MUSIC TASTE</Text>
              <TouchableOpacity onPress={() => router.push('/onboarding')}>
                <Text style={styles.editLink}>EDIT</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagRow}>
              {profile.genres.map(g => (
                <View key={g} style={styles.tag}>
                  <Text style={styles.tagText}>{g.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile?.budget && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>BUDGET</Text>
            <Text style={styles.rowVal}>{profile.budget.toUpperCase()}</Text>
          </View>
        )}
        {profile?.crowdPref && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>CROWD PREF</Text>
            <Text style={styles.rowVal}>{profile.crowdPref.toUpperCase()}</Text>
          </View>
        )}
        {profile?.ageVerified && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>AGE VERIFIED</Text>
            <Text style={[styles.rowVal, { color: Colors.green }]}>✓ 18+</Text>
          </View>
        )}

        {/* Saved venues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAVED VENUES ({savedVenues.length})</Text>
          {savedVenues.length === 0
            ? <Text style={styles.empty}>None saved yet</Text>
            : savedVenues.map(v => (
              <TouchableOpacity
                key={v.id}
                style={styles.savedItem}
                onPress={() => router.push(`/venue/${v.id}`)}
              >
                <Text style={styles.savedName}>{v.name}</Text>
                <Text style={styles.savedCity}>{v.city.toUpperCase()}</Text>
              </TouchableOpacity>
            ))
          }
        </View>

        {/* Tickets entry point */}
        <TouchableOpacity style={styles.savedItem} onPress={() => router.push('/tickets')}>
          <Text style={[styles.savedName, { color: Colors.gold }]}>YOUR TICKETS →</Text>
          <Text style={styles.savedCity}>VIEW ALL</Text>
        </TouchableOpacity>

        {/* B2B Dashboard */}
        <TouchableOpacity style={styles.savedItem} onPress={() => router.push('/b2b')}>
          <Text style={[styles.savedName, { color: '#7C3AED' }]}>VENUE DASHBOARD →</Text>
          <Text style={styles.savedCity}>B2B</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutBtnText}>SIGN OUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:      { paddingHorizontal: Spacing.xl, paddingTop: 80, paddingBottom: 120, gap: Spacing.xl, alignItems: 'center' },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.heroPurple, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.gold + '55' },
  avatarText:   { fontSize: 36 },
  name:         { ...Type.sectionHead, color: Colors.textPrimary },
  email:        { ...Type.body, color: Colors.textMuted },
  signInBtn:    { backgroundColor: Colors.gold, borderRadius: Radius.xl, paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg },
  signInBtnText:{ ...Type.button, color: Colors.ink },
  section:      { width: '100%', gap: Spacing.md },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Type.label, color: Colors.gold },
  editLink:     { ...Type.tag, color: Colors.textMuted },
  tagRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:          { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  tagText:      { ...Type.tag, color: Colors.textSecondary },
  row:          { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  rowLabel:     { ...Type.tag, color: Colors.textMuted },
  rowVal:       { ...Type.label, color: Colors.textPrimary },
  savedItem:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  savedName:    { ...Type.bodyMedium, color: Colors.textPrimary },
  savedCity:    { ...Type.tag, color: Colors.textSecondary },
  empty:        { ...Type.body, color: Colors.textMuted },
  signOutBtn:   { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.xl, paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg },
  signOutBtnText:{ ...Type.label, color: Colors.textMuted },
});
