import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Type } from '../constants/Typography';
import { StarField } from './StarField';

const { width: W } = Dimensions.get('window');
const H = 280;

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildSkyline(seed: number): string {
  const rand = lcg(seed);
  let d = `M0,${H} `;
  let x = 0;
  while (x < W) {
    const w = 8 + rand() * 28;
    const h = 30 + rand() * 100;
    d += `L${x},${H - h} L${x + w},${H - h} L${x + w},${H} `;
    x += w + 1 + rand() * 4;
  }
  d += `L${W},${H} Z`;
  return d;
}

interface Props {
  cityName: string;
  cityId: string;
  accentColor: string;
  flag?: string;
  venueCount?: number;
}

export function CityHero({ cityName, cityId, accentColor, flag, venueCount }: Props) {
  const moonY   = useRef(new Animated.Value(0)).current;
  const skyline = useRef(buildSkyline(cityName.charCodeAt(0) * 7 + 13)).current;
  const rand = lcg(cityName.charCodeAt(0) * 31);
  const windows = Array.from({ length: 40 }, () => ({
    x: rand() * W, y: H - 20 - rand() * 90,
    w: 2 + rand() * 5, h: 3 + rand() * 8,
    opacity: 0.25 + rand() * 0.55,
  }));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonY, { toValue: -8, duration: 4000, useNativeDriver: true }),
        Animated.timing(moonY, { toValue: 0,  duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[accentColor + '40', '#1a0a2e', '#0d0010']}
        start={{ x: 0.3, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <StarField width={W} height={H} seed={cityName.charCodeAt(0) * 3} />
      <Animated.View style={[styles.moon, { transform: [{ translateY: moonY }] }]} />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={W} height={H} style={{ position: 'absolute', bottom: 0 }}>
          <Path d={skyline} fill="#0d0010" />
          {windows.map((w, i) => (
            <Rect key={i} x={w.x} y={w.y} width={w.w} height={w.h}
              fill={Colors.gold} opacity={w.opacity} rx={1} />
          ))}
        </Svg>
      </View>
      <LinearGradient colors={['transparent', '#0d0010']} style={styles.bottomFade} pointerEvents="none" />
      <View style={styles.label}>
        <View style={styles.labelRow}>
          {flag && <Text style={styles.flag}>{flag}</Text>}
          <Text style={[styles.cityName, { color: Colors.white }]}>{cityName.toUpperCase()}</Text>
        </View>
        <Text style={[styles.subtitle, { color: accentColor }]}>
          TONIGHT{venueCount ? ` · ${venueCount} VENUES` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: H, overflow: 'hidden', borderRadius: 16, backgroundColor: '#0d0010' },
  moon: { position: 'absolute', top: 32, right: 48, width: 52, height: 52, borderRadius: 26, backgroundColor: '#fffde7', shadowColor: '#fffde7', shadowRadius: 20, shadowOpacity: 0.8, shadowOffset: { width: 0, height: 0 } },
  bottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  label: { position: 'absolute', bottom: 20, left: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flag: { fontSize: 28 },
  cityName: { ...Type.heroCity, lineHeight: 64 },
  subtitle: { ...Type.label, marginTop: 2 },
});
