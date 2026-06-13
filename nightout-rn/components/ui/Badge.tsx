import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Radius, Spacing } from '../../constants/Spacing';

export function OpenNowBadge() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: pulse }]} />
      <Text style={styles.label}>OPEN NOW</Text>
    </View>
  );
}

export function MatchBadge({ pct }: { pct: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.matchBadge, { transform: [{ scale }] }]}>
      <Text style={styles.matchText}>{pct}%</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.sm, borderWidth: 1,
    borderColor: Colors.green + '55', backgroundColor: Colors.green + '18',
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.green },
  label: { ...Type.tag, color: Colors.green },
  matchBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.sm, borderWidth: 1,
    borderColor: Colors.gold + '80', backgroundColor: Colors.gold + '18',
  },
  matchText: { ...Type.label, color: Colors.gold },
});
