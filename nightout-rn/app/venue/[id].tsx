import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { VENUES } from '../../data/venues';
import { useAppStore } from '../../store/useAppStore';
import { Chip } from '../../components/ui/Chip';
import { OpenNowBadge } from '../../components/ui/Badge';
import { useLiveVenueData } from '../../hooks/useLiveVenueData';
import { weatherEmoji } from '../../services/weather';

export default function VenueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { toggleSaved, savedVenueIds } = useAppStore();
  const venue = VENUES.find(v => v.id === id);

  // Hook must be called unconditionally — before any early returns
  const { places, events, weather, loading } = useLiveVenueData(venue);

  if (!venue) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ ...Type.sectionHead, color: Colors.textPrimary }}>Venue not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ ...Type.label, color: Colors.gold }}>← GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSaved = savedVenueIds.includes(venue.id);

  const handleShare = () => {
    Share.share({
      title: venue.name,
      message: `Check out ${venue.name} in ${venue.city} on NightOut! ${venue.neighborhood} · ${venue.genres.slice(0,2).join(' · ')}`,
    });
  };

  const rating = places?.googleRating ?? venue.googleRating;
  const openNow = places?.openNow ?? venue.isOpen;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={['#1a0a2e', Colors.ink]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.shareText}>SHARE ↗</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoBox}>
          <Text style={styles.logoInitial}>{venue.name[0]}</Text>
        </View>

        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.neighborhood}>{venue.neighborhood.toUpperCase()} · {venue.city.toUpperCase()}</Text>

        <View style={styles.badgeRow}>
          {openNow && <OpenNowBadge />}
          {weather && (
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherText}>
                {weatherEmoji(weather.icon)} {weather.tempC}°C
                {weather.isBeachWeather ? ' · BEACH WEATHER' : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tags}>
          {venue.genres.map(g => <Chip key={g} label={g.toUpperCase()} />)}
          <Chip label={venue.priceRange} color={Colors.gold} filled />
        </View>

        <View style={styles.grid}>
          {[
            ['RATING',    loading ? '...' : (rating > 0 ? `⭐ ${rating.toFixed(1)}` : 'N/A')],
            ['CAPACITY',  `${venue.capacity.toLocaleString()} ppl`],
            ['AUDIENCE',  venue.audience.toUpperCase()],
            ['DRESS CODE',venue.dressCode],
            ['HOURS',     venue.openingHours],
            ['ENTRY',     venue.entryFee ?? venue.priceRange],
          ].map(([k, v]) => (
            <View key={k} style={styles.gridItem}>
              <Text style={styles.gridKey}>{k}</Text>
              <Text style={styles.gridVal}>{v}</Text>
            </View>
          ))}
          {places?.phone && (
            <View style={styles.gridItem}>
              <Text style={styles.gridKey}>PHONE</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${places.phone}`)}>
                <Text style={[styles.gridVal, { color: Colors.gold }]}>{places.phone}</Text>
              </TouchableOpacity>
            </View>
          )}
          {places?.website && (
            <View style={styles.gridItem}>
              <Text style={styles.gridKey}>WEBSITE</Text>
              <TouchableOpacity onPress={() => Linking.openURL(places.website!)}>
                <Text style={[styles.gridVal, { color: Colors.gold }]}>VISIT →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CROWD MIX</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { flex: venue.localRatio }]} />
            <View style={[styles.barTourist, { flex: 1 - venue.localRatio }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>🏠 LOCAL {Math.round(venue.localRatio * 100)}%</Text>
            <Text style={styles.barLabel}>✈ TOURIST {Math.round((1 - venue.localRatio) * 100)}%</Text>
          </View>
        </View>

        {events.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TONIGHT ON EVENTBRITE</Text>
            {events.slice(0, 3).map(ev => (
              <TouchableOpacity key={ev.id} style={styles.eventItem} onPress={() => Linking.openURL(ev.ticketUrl)}>
                <Text style={styles.eventName} numberOfLines={1}>{ev.name}</Text>
                <Text style={styles.eventMeta}>{ev.isFree ? 'FREE' : 'TICKETED'} · {new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {places?.hours && places.hours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>OPENING HOURS</Text>
            {places.hours.map(line => (
              <Text key={line} style={styles.hourLine}>{line}</Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push(`/checkout/${venue.id}`)}>
          <Text style={styles.ctaBtnText}>GET TICKETS →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isSaved && styles.saveBtnActive]}
          onPress={() => toggleSaved(venue.id)}
        >
          <Text style={[styles.saveBtnText, isSaved && { color: Colors.gold }]}>
            {isSaved ? '♥ SAVED' : '♡ SAVE VENUE'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:      { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.xl, alignItems: 'center' },
  topNav:       { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  backText:     { ...Type.label, color: Colors.gold },
  shareText:    { ...Type.label, color: Colors.textSecondary },
  logoBox:      { width: 80, height: 80, borderRadius: Radius.xl, backgroundColor: Colors.heroPurple, borderWidth: 1, borderColor: Colors.gold + '44', alignItems: 'center', justifyContent: 'center' },
  logoInitial:  { ...Type.sectionHead, color: Colors.gold, fontSize: 36 },
  name:         { ...Type.heroTitle, color: Colors.textPrimary, textAlign: 'center', fontSize: 36 },
  neighborhood: { ...Type.label, color: Colors.textSecondary, textAlign: 'center' },
  badgeRow:     { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  weatherBadge: { backgroundColor: 'rgba(255,184,0,0.12)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gold + '44' },
  weatherText:  { ...Type.tag, color: Colors.gold },
  tags:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  grid:         { width: '100%', gap: Spacing.md },
  gridItem:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  gridKey:      { ...Type.tag, color: Colors.textMuted },
  gridVal:      { ...Type.bodyMedium, color: Colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  section:      { width: '100%', gap: Spacing.sm },
  sectionLabel: { ...Type.label, color: Colors.textMuted },
  barTrack:     { flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill:      { backgroundColor: Colors.gold },
  barTourist:   { backgroundColor: 'rgba(255,255,255,0.15)' },
  barLabels:    { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel:     { ...Type.tag, color: Colors.textSecondary },
  eventItem:    { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 2 },
  eventName:    { ...Type.bodyMedium, color: Colors.textPrimary },
  eventMeta:    { ...Type.tag, color: Colors.textSecondary },
  hourLine:     { ...Type.body, color: Colors.textSecondary, fontSize: 12 },
  ctaBtn:       { width: '100%', backgroundColor: Colors.gold, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center' },
  ctaBtnText:   { ...Type.button, color: Colors.ink },
  saveBtn:      { width: '100%', borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  saveBtnActive:{ borderColor: Colors.gold + '55', backgroundColor: Colors.gold + '12' },
  saveBtnText:  { ...Type.button, color: Colors.textSecondary },
});
