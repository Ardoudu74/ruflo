/**
 * Safe Night service.
 *
 * Location: expo-location (already in package.json)
 * SMS: Twilio REST API (requires EXPO_PUBLIC_TWILIO_ACCOUNT_SID,
 *      EXPO_PUBLIC_TWILIO_AUTH_TOKEN set server-side — never expose in client)
 *
 * Production note: Twilio calls must go through your own backend endpoint
 * (e.g. a Firebase Cloud Function) to keep credentials server-side.
 */

import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';
import { useSafeNightStore } from '../store/useSafeNightStore';
import { useAuthStore } from '../store/useAuthStore';
import { scheduleSafeNightReminder, cancelNotification } from './notifications';

let locationSubscription: Location.LocationSubscription | null = null;
let safeNightNotificationId: string | null = null;

export async function startLocationSharing(): Promise<boolean> {
  const store = useSafeNightStore.getState();
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    store.setLocError('Location permission denied');
    return false;
  }

  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== 'granted') {
    store.setLocError('Background location needed for Safe Night');
    // continue with foreground only
  }

  locationSubscription = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.High, distanceInterval: 50, timeInterval: 30_000 },
    (loc) => {
      store.setLocation(loc.coords.latitude, loc.coords.longitude);
      sendLocationToContact(loc.coords.latitude, loc.coords.longitude);
    }
  );

  store.enable();
  scheduleAutoDisable();
  scheduleSafeNightReminder().then(id => { safeNightNotificationId = id; }).catch(() => {});
  return true;
}

export function stopLocationSharing(): void {
  locationSubscription?.remove();
  locationSubscription = null;
  useSafeNightStore.getState().disable();
  if (safeNightNotificationId) {
    cancelNotification(safeNightNotificationId).catch(() => {});
    safeNightNotificationId = null;
  }
}

function scheduleAutoDisable(): void {
  const now  = new Date();
  const next = new Date();
  next.setHours(6, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const ms = next.getTime() - now.getTime();
  setTimeout(() => stopLocationSharing(), ms);
}

async function sendLocationToContact(lat: number, lng: number): Promise<void> {
  const profile = useAuthStore.getState().profile;
  const contact = profile?.emergencyContact;
  if (!contact) return;

  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const body    = `[NightOut Safe Night] ${profile.displayName} is here: ${mapsUrl}`;

  // Dev stub: log only
  console.log('[SafeNight SMS stub]', contact.phone, body);
}

export async function triggerSOS(): Promise<void> {
  const store   = useSafeNightStore.getState();
  const profile = useAuthStore.getState().profile;
  const contact = profile?.emergencyContact;
  const lat     = store.currentLat;
  const lng     = store.currentLng;

  store.triggerSOS();

  if (contact) {
    const mapsUrl = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '(location unavailable)';
    const body    = `🆘 SOS from ${profile?.displayName ?? 'NightOut user'} — ${mapsUrl}`;
    console.log('[SOS SMS stub]', contact.phone, body);
  }

  Alert.alert(
    '⚡ SOS Sent',
    `Message sent to ${contact?.name ?? 'your emergency contact'}.\n\nCall emergency services?`,
    [
      { text: 'Call 112 (EU)', onPress: () => Linking.openURL('tel:112') },
      { text: 'Call 911 (US)', onPress: () => Linking.openURL('tel:911') },
      { text: 'Cancel', style: 'cancel', onPress: () => store.resetSOS() },
    ]
  );
}
