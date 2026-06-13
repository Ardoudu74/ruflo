import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Type } from '../../constants/Typography';
import { useTicketStore } from '../../store/useTicketStore';
import { useAuthStore } from '../../store/useAuthStore';

const TABS = [
  { name: 'index',   label: 'HOME',    icon: '◉' },
  { name: 'discover',label: 'EXPLORE', icon: '⊕' },
  { name: 'stories', label: 'STORIES', icon: '▶' },
  { name: 'safe',    label: 'SAFE',    icon: '⊛' },
  { name: 'profile', label: 'ME',      icon: '◎' },
] as const;

function TabIcon({ label, icon, focused, badge }: { label: string; icon: string; focused: boolean; badge?: number }) {
  return (
    <View style={[tab.wrap, focused && tab.active]}>
      <View>
        <Text style={[tab.icon, { color: focused ? Colors.gold : Colors.textMuted }]}>{icon}</Text>
        {badge ? (
          <View style={tab.badge}>
            <Text style={tab.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[tab.label, { color: focused ? Colors.gold : Colors.textMuted }]}>{label}</Text>
      {focused && <View style={tab.bar} />}
    </View>
  );
}

export default function TabsLayout() {
  const uid = useAuthStore(s => s.uid);
  const tickets = useTicketStore(s => uid ? s.forUser(uid) : []);
  const paidTicketCount = tickets.filter(t => t.status === 'paid').length;

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
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                label={t.label}
                icon={t.icon}
                focused={focused}
                badge={t.name === 'profile' && paidTicketCount > 0 ? paidTicketCount : undefined}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const tab = StyleSheet.create({
  wrap:      { alignItems: 'center', paddingTop: 6, paddingBottom: 2, minWidth: 48 },
  active:    {},
  icon:      { fontSize: 18, lineHeight: 22 },
  label:     { ...Type.tag, marginTop: 2, letterSpacing: 1.5 },
  bar:       { position: 'absolute', bottom: -8, width: 20, height: 2, backgroundColor: Colors.gold, borderRadius: 1 },
  badge:     { position: 'absolute', top: -4, right: -8, backgroundColor: Colors.pink, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff', lineHeight: 12 },
});

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 8,
  },
  bg: {
    flex: 1,
    backgroundColor: Colors.ink,
    borderTopWidth: 1,
    borderTopColor: Colors.gold + '18',
  },
});
