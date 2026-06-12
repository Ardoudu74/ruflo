import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Type } from '../constants/Typography';
import { Radius, Spacing } from '../constants/Spacing';
import { Chip } from './ui/Chip';
import { OpenNowBadge, MatchBadge } from './ui/Badge';
import type { Venue } from '../types';

interface Props {
  venue: Venue;
  index: number;
  isTrending?: boolean;
  onPress: () => void;
}

function LocalBar({ ratio }: { ratio: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const rest = useRef(Animated.subtract(new Animated.Value(1), anim)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: ratio, duration: 1200, delay: 200, useNativeDriver: false }).start();
  }, []);
  return (
    <View style={bar.track}>
      <Animated.View style={[bar.fill, { flex: anim }]} />
      <Animated.View style={[bar.tourist, { flex: rest }]} />
    </View>
  );
}

const bar = StyleSheet.create({
  track:   { flexDirection: 'row', height: 2, borderRadius: 1, overflow: 'hidden' },
  fill:    { backgroundColor: Colors.gold + 'CC' },
  tourist: { backgroundColor: 'rgba(255,255,255,0.15)' },
});

export function VenueCard({ venue, index, isTrending = false, onPress }: Props) {
  const fadeY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(fadeY,   { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  const matchPct = venue.matchScore ? Math.round(venue.matchScore * 100) : null;
  const tags = [
    ...venue.genres.slice(0, 2),
    venue.priceRange,
    venue.dressCode.split(' ')[0],
  ].slice(0, 3);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: fadeY }, { scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <LinearGradient
          colors={isTrending
            ? [Colors.heroPurple, '#4E1B2D']
            : [Colors.cardBase, Colors.ink]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.card, isTrending && styles.cardTrending]}
        >
          {/* Top row */}
          <View style={styles.topRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoInitial}>
                {venue.name[0]}
              </Text>
            </View>
            <View style={styles.nameCol}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
                {isTrending && <Text style={styles.fire}>🔥</Text>}
              </View>
              <Text style={styles.neighborhood}>{venue.neighborhood.toUpperCase()}</Text>
            </View>
            {matchPct !== null && <MatchBadge pct={matchPct} />}
          </View>

          {/* Tags + status */}
          <View style={styles.middle}>
            <View style={styles.tags}>
              {tags.map(t => <Chip key={t} label={t.toUpperCase()} />)}
            </View>
            {venue.isOpen && <OpenNowBadge />}
          </View>

          {/* Bottom */}
          <View style={styles.bottom}>
            <LocalBar ratio={venue.localRatio} />
            <View style={styles.ratings}>
              {venue.googleRating > 0 && (
                <Text style={styles.rating}>⭐ {venue.googleRating.toFixed(1)}</Text>
              )}
              {venue.entryFee && (
                <Text style={styles.entry}>{venue.entryFee}</Text>
              )}
              {venue.capacity > 0 && (
                <Text style={styles.capacity}>cap {venue.capacity.toLocaleString()}</Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold + '22',
    marginBottom: Spacing.md,
  },
  cardTrending: {
    borderColor: Colors.gold + '55',
    shadowColor: Colors.gold,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.gold + '22',
    borderWidth: 1,
    borderColor: Colors.gold + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    ...Type.sectionHead,
    color: Colors.gold,
  },
  nameCol:       { flex: 1 },
  nameRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:          { ...Type.venueName, color: Colors.textPrimary, flex: 1 },
  fire:          { fontSize: 13 },
  neighborhood:  { ...Type.tag, color: Colors.textSecondary, marginTop: 3 },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  tags:    { flexDirection: 'row', gap: 5, flexWrap: 'wrap', flex: 1 },
  bottom:  { marginTop: Spacing.md, gap: Spacing.sm },
  ratings: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  rating:  { ...Type.caption, color: Colors.textSecondary },
  entry:   { ...Type.label,   color: Colors.gold },
  capacity:{ ...Type.caption, color: Colors.textMuted },
});
