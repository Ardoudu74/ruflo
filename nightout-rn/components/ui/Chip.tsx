import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { Radius, Spacing } from '../../constants/Spacing';

interface ChipProps {
  label: string;
  color?: string;
  filled?: boolean;
}

export function Chip({ label, color = Colors.textSecondary, filled = false }: ChipProps) {
  return (
    <View style={[styles.chip, filled && { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.label, { color: filled ? color : Colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    ...Type.tag,
  },
});
