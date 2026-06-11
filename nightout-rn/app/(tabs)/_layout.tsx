import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';

const TABS = [
  { name: 'index',   label: 'HOME',    icon: '◉' },
  { name: 'discover',label: 'EXPLORE', icon: '⊕' },
  { name: 'stories', label: 'STORIES', icon: '▶' },
  { name: 'safe',    label: 'SAFE',    icon: '⊛' },
  { name: 'profile', label: 'ME',      icon: '◎' },
] as const;

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {
  return (
    <View style={[tab.wrap, focused && tab.active]}>
      <Text style={[tab.icon, { color: focused ? Colors.gold : Colors.textMuted }]}>{icon}</Text>
      <Text style={[tab.label, { color: focused ? Colors.gold : Colors.textMuted }]}>{label}</Text>
      {focused && <View style={tab.bar} />}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: false,
        tabBarBackground: () => <View style={styles.bg} />,
      }}
    >
      {TABS.map(t => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ tabBarIcon: ({ focused }) => <TabIcon label={t.label} icon={t.icon} focused={focused} /> }}
        />
      ))}
    </Tabs>
  );
}

const tab = StyleSheet.create({
  wrap:  { alignItems: 'center', paddingTop: 6, paddingBottom: 2, minWidth: 48 },
  active:{},
  icon:  { fontSize: 18, lineHeight: 22 },
  label: { ...Type.tag, marginTop: 2, letterSpacing: 1.5 },
  bar:   { position: 'absolute', bottom: -8, width: 20, height: 2, backgroundColor: Colors.gold, borderRadius: 1 },
});

const styles = StyleSheet.create({
  bar: { backgroundColor: 'transparent', borderTopWidth: 0, height: 72, paddingBottom: 8 },
  bg:  { flex: 1, backgroundColor: Colors.ink, borderTopWidth: 1, borderTopColor: Colors.gold + '18' },
});
