import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useLoadFonts } from '../hooks/useFonts';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/Colors';
import { requestNotificationPermissions } from '../services/notifications';

function AuthGate({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const segments  = useSegments();
  const uid       = useAuthStore(s => s.uid);

  useEffect(() => {
    const inAuth       = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    if (!uid && !inAuth && !inOnboarding) {
      router.replace('/auth');
    }
  }, [uid, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  useLoadFonts();
  const fontsLoaded = useAppStore(s => s.fontsLoaded);

  useEffect(() => {
    requestNotificationPermissions().catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.ink }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.ink },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="auth/index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="venue/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="checkout/[venueId]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="tickets/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="tickets/index" />
          <Stack.Screen name="b2b/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </AuthGate>
    </GestureHandlerRootView>
  );
}
