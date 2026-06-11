import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { CITIES, CITY_MAP } from '../../data/cities';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Spacing';
import { CityHero } from '../../components/CityHero';
import { VenueCard } from '../../components/VenueCard';
import { trendingVenues } from '../../data/venues';
import { fetchWeather, WeatherData, weatherEmoji } from '../../services/weather';
import { useMatchScores } from '../../hooks/useMatchScores';

const { width: W } = Dimensions.get('window');

function useIsLateNight() {
  const h = new Date().getHours();
  return h >= 23 || h < 5;
}

export default function HomeTab() {
  const router = useRouter();
  const { selectedCityId, venues, setCity } = useAppStore();
  const city    = CITY_MAP[selectedCityId];
  const accent  = Colors.cityAccents[selectedCityId] ?? Colors.gold;
  const isNight = useIsLateNight();
  const [showCityModal, setShowCityModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const trending  = trendingVenues(selectedCityId);
  const allVenues = useMatchScores();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const c = CITY_MAP[selectedCityId];
    if (c) fetchWeather(c.latitude, c.longitude).then(setWeather);
  }, [selectedCityId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const c = CITY_MAP[selectedCityId];
    if (c) fetchWeather(c.latitude, c.longitude).then(setWeather);
    setTimeout(() => setRefreshing(false), 1200);
  }, [selectedCityId]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.ink, '#12001a', '#000000']} style={StyleSheet.absoluteFill} />
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        <TouchableOpacity onPress={() => setShowCityModal(true)} style={styles.header}>
          <View style={styles.eyebrowRow}>
            <Text style={[styles.eyebrow, { color: isNight ? Colors.pink : Colors.textSecondary }]}>
              {isNight ? '● RIGHT NOW IN' : 'TONIGHT IN'}
            </Text>
            {weather && (
              <Text style={styles.weatherLabel}>
                {weatherEmoji(weather.icon)} {weather.tempC}°C{weather.isBeachWeather ? ' 🏖️' : ''}
              </Text>
            )}
          </View>
          <View style={styles.cityRow}>
            <Text style={styles.cityName}>{city.name.toUpperCase()}</Text>
            <Text style={[styles.chevron, { color: accent }]}>▾</Text>
          </View>
        </TouchableOpacity>

        <CityHero cityName={city.name} cityId={selectedCityId} accentColor={accent} flag={city.flag} venueCount={allVenues.length} />

        {trending.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TONIGHT'S PICKS</Text>
              <Text style={styles.aiLabel}>AI CURATED</Text>
            </View>
            {trending.map((v, i) => (
              <VenueCard key={v.id} venue={v} index={i} isTrending={i === 0} onPress={() => router.push(`/venue/${v.id}`)} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALL VENUES</Text>
          {allVenues.map((v, i) => (
            <VenueCard key={v.id} venue={v} index={i + trending.length} onPress={() => router.push(`/venue/${v.id}`)} />
          ))}
        </View>
      </ScrollView>

      <Modal visible={showCityModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCityModal(false)}>
        <View style={modal.root}>
          <LinearGradient colors={['#12001a', '#000']} style={StyleSheet.absoluteFill} />
          <Text style={modal.title}>CHOOSE CITY</Text>
          <FlatList
            data={CITIES} keyExtractor={c => c.id} numColumns={2}
            columnWrapperStyle={{ gap: 10 }}
            contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
            renderItem={({ item: c }) => {
              const active = c.id === selectedCityId;
              return (
                <TouchableOpacity
                  style={[modal.cityBtn, active && { borderColor: Colors.gold }]}
                  onPress={() => { setCity(c.id); setShowCityModal(false); }}
                >
                  <Text style={modal.flag}>{c.flag}</Text>
                  <Text style={[modal.cityBtnName, active && { color: Colors.gold }]}>{c.name}</Text>
                  <Text style={modal.country}>{c.country}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flex: 1 },
  content:      { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 120, gap: Spacing.xl },
  header:       {},
  eyebrowRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eyebrow:      { ...Type.label },
  weatherLabel: { ...Type.tag, color: Colors.gold },
  cityRow:      { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  cityName:     { ...Type.heroCity, color: Colors.textPrimary, fontSize: 52 },
  chevron:      { ...Type.sectionHead, fontSize: 22 },
  section:      { gap: Spacing.md },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Type.label, color: Colors.gold, fontSize: 15 },
  aiLabel:      { ...Type.tag, color: Colors.textMuted },
});

const modal = StyleSheet.create({
  root:       { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: 40 },
  title:      { ...Type.sectionHead, color: Colors.textPrimary, marginBottom: Spacing.xl },
  cityBtn:    { flex: 1, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: Colors.cardBase },
  flag:       { fontSize: 24, marginBottom: 4 },
  cityBtnName:{ ...Type.venueName, color: Colors.textPrimary, fontSize: 16 },
  country:    { ...Type.tag, color: Colors.textSecondary, marginTop: 2 },
});
