import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { VENUES } from '../../data/venues';
import { VenueCard } from '../../components/VenueCard';
import { useAuthStore } from '../../store/useAuthStore';
import type { Genre } from '../../types';

const GENRES: Genre[] = [
  'Techno','House','Deep House','Tech House','Afro House',
  'Hip-Hop','Latin','Electronic','Commercial','Disco','R&B',
];

const PRICE_RANGES = ['€','€€','€€€','€€€€'] as const;

export default function DiscoverTab() {
  const router = useRouter();
  const profile = useAuthStore(s => s.profile);

  const [query, setQuery]         = useState('');
  const [activeGenre, setGenre]   = useState<Genre | null>(null);
  const [activePrice, setPrice]   = useState<string | null>(null);
  const [openOnly, setOpenOnly]   = useState(false);
  const [showMatches, setMatches] = useState(false);

  const results = useMemo(() => {
    return VENUES.filter(v => {
      const q = query.toLowerCase();
      const matchQ = !q || v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.neighborhood.toLowerCase().includes(q);
      const matchG = !activeGenre || v.genres.includes(activeGenre);
      const matchP = !activePrice || v.priceRange === activePrice;
      const matchOpen = !openOnly || v.isOpen;
      const matchMe = !showMatches || !(profile?.genres?.length) || v.genres.some(g => profile!.genres!.includes(g as Genre));
      return matchQ && matchG && matchP && matchOpen && matchMe;
    }).slice(0, 40);
  }, [query, activeGenre, activePrice, openOnly, showMatches, profile?.genres]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink }}>
      <LinearGradient colors={[Colors.ink, '#000']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>DISCOVER</Text>
        <Text style={styles.count}>{results.length} VENUES</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⊕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search venue, city or vibe…"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Toggle row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toggleScroll}>
          <TouchableOpacity
            style={[styles.toggleChip, openOnly && styles.toggleActive]}
            onPress={() => setOpenOnly(v => !v)}
          >
            <Text style={[styles.toggleText, openOnly && { color: Colors.ink }]}>● OPEN NOW</Text>
          </TouchableOpacity>
          {(profile?.genres?.length ?? 0) > 0 && (
            <TouchableOpacity
              style={[styles.toggleChip, showMatches && styles.toggleActive]}
              onPress={() => setMatches(v => !v)}
            >
              <Text style={[styles.toggleText, showMatches && { color: Colors.ink }]}>♥ MY TASTE</Text>
            </TouchableOpacity>
          )}
          {PRICE_RANGES.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.toggleChip, activePrice === p && styles.priceActive]}
              onPress={() => setPrice(activePrice === p ? null : p)}
            >
              <Text style={[styles.toggleText, activePrice === p && { color: Colors.gold }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Genre filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
          {GENRES.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genreChip, activeGenre === g && styles.genreActive]}
              onPress={() => setGenre(activeGenre === g ? null : g)}
            >
              <Text style={[styles.genreLabel, activeGenre === g && { color: Colors.ink }]}>
                {g.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        {results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No venues match your filters.</Text>
            <TouchableOpacity onPress={() => { setGenre(null); setPrice(null); setQuery(''); setOpenOnly(false); setMatches(false); }}>
              <Text style={styles.resetText}>RESET FILTERS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          results.map((v, i) => (
            <VenueCard key={v.id} venue={v} index={i} onPress={() => router.push(`/venue/${v.id}`)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:      { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.lg },
  title:        { ...Type.sectionHead, color: Colors.textPrimary },
  count:        { ...Type.tag, color: Colors.textMuted, marginTop: -Spacing.sm },
  searchBox:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchIcon:   { ...Type.label, color: Colors.textMuted, marginRight: 8 },
  searchInput:  { flex: 1, ...Type.body, color: Colors.textPrimary, height: 48 },
  clearBtn:     { ...Type.label, color: Colors.textMuted, paddingLeft: 8 },
  toggleScroll: { marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl },
  toggleChip:   { paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginRight: 8 },
  toggleActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  priceActive:  { borderColor: Colors.gold },
  toggleText:   { ...Type.tag, color: Colors.textSecondary },
  genreScroll:  { marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl },
  genreChip:    { paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginRight: 8 },
  genreActive:  { backgroundColor: Colors.gold + 'DD', borderColor: Colors.gold },
  genreLabel:   { ...Type.tag, color: Colors.textSecondary },
  empty:        { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxxl },
  emptyText:    { ...Type.body, color: Colors.textMuted },
  resetText:    { ...Type.label, color: Colors.gold },
});
