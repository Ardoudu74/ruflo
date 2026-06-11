import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

interface Props {
  width: number;
  height: number;
  count?: number;
  seed?: number;
}

export function StarField({ width, height, count = 60, seed = 42 }: Props) {
  const stars = useMemo(() => {
    const rand = lcg(seed);
    return Array.from({ length: count }, () => ({
      cx: rand() * width,
      cy: rand() * height * 0.65,
      r:  0.5 + rand() * 1.5,
      opacity: 0.2 + rand() * 0.65,
    }));
  }, [width, height, count, seed]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {stars.map((s, i) => (
          <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.opacity} />
        ))}
      </Svg>
    </View>
  );
}
